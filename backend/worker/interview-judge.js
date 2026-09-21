/* Interview Prep — AI evaluation proxy (Cloudflare Worker).
 *
 * The phone never sees the API key. It POSTs an answer here; this Worker adds
 * the key, calls Gemini, and returns a small fixed-shape JSON object.
 *
 * What arrives here: the question, the student's answer text, the model answer,
 * the key points, and a language code. No name, no email, no user id — judge.js
 * does not send them and this Worker has nothing to do with identity.
 *
 * It also answers on /transcribe, where the body is a recording of the student
 * speaking instead of text, and the reply is {text}. That path exists because
 * Android's SpeechRecognition cannot hold a microphone open across a whole
 * answer; dictation.js records the answer in one piece and sends it here. The
 * recording is transcribed and dropped - it is never stored, logged, or passed
 * anywhere else.
 *
 * Deploy: see README.md in this folder.
 */

const CRITERIA = ["communication", "sentences", "thought", "speechGrammar", "accuracy", "coherence"];

/* Gemini structured output. Asking for a schema is what makes the response
   safe to parse — without it the model wraps JSON in prose often enough to
   matter, and the client then silently falls back to offline scoring. */
const SCHEMA = {
  type: "object",
  properties: {
    /* Only filled in on /answer, where the input is audio. Marking a recording
       and transcribing it are the same read, so asking for both in one call
       costs one round trip instead of two - about ten seconds of a student
       sitting in front of a blank screen. */
    text: { type: "string" },
    classification: { type: "string", enum: ["answered", "partial", "off_topic", "dont_know", "word_list"] },
    scores: {
      type: "object",
      properties: CRITERIA.reduce((o, k) => (o[k] = { type: "number" }, o), {}),
      required: CRITERIA
    },
    overall: { type: "number" },
    missed: { type: "array", items: { type: "string" } },
    advice: { type: "string" }
  },
  required: ["classification", "scores", "overall", "advice"]
};

const LANG_NAME = { en: "English", gu: "Gujarati", hi: "Hindi" };
const SCRIPT_NAME = { en: "Latin", gu: "the Gujarati script", hi: "Devanagari" };

/* How to write down what was said.

   Transcribing Hindi into Latin letters ("mera naam Ravi hai") is what the model
   does unasked, and it is wrong for this app: the student reads that text back
   on screen, and romanised Hindi is harder for them to read than their own
   script. Indian speech is also freely mixed - an English technical word inside
   a Hindi sentence is normal speech, not a mistake - so each word is written in
   the script it belongs to rather than forcing the whole line one way. */
function scriptRule(lang) {
  if (lang === "en") return "Write the transcript in Latin letters.";
  return [
    "Write what the student said in the script it belongs to:",
    LANG_NAME[lang] + " words in " + SCRIPT_NAME[lang] + ", English words in Latin letters.",
    "Do NOT romanise " + LANG_NAME[lang] + " - never write it in Latin letters.",
    "Mixing the two inside one sentence is normal Indian speech; keep it as spoken."
  ].join(" ");
}

/* Whether this question is one the student has to answer in English.

   The app is English practice, but a student using it in Gujarati or Hindi is
   doing so because their English is weak. Marking every answer down for not
   being in English teaches them nothing except to stop using the app. So only
   the questions flagged as needing English are judged on it; on the rest they
   answer in whatever language they think in, and are marked on what they
   actually said. */
function languageRule(needsEnglish, lang) {
  if (needsEnglish) {
    return [
      "This question MUST be answered in English - it is one an interviewer would ask in English.",
      "If the student answered wholly or mostly in " + LANG_NAME[lang] + ",",
      "say so kindly in the advice and keep speechGrammar at 4 or less,",
      "but still judge accuracy on what they actually said - they understood the question."
    ].join(" ");
  }
  return [
    "The student may answer in English, in " + LANG_NAME[lang] + ", or in a mix, and ALL of those are fine.",
    "Do NOT mark them down for not speaking English and do NOT tell them to speak English.",
    "Judge speechGrammar on how clearly they expressed themselves in whatever language they used.",
    "Do not mention language choice in the advice at all."
  ].join(" ");
}

function buildPrompt(b) {
  const lang = LANG_NAME[b.lang] || "English";
  const technical = b.mode === "technical";

  return [
    "You are marking a spoken answer from a student at an Indian vocational training centre (ITI).",
    "The student is practising for a job interview. The text below is a speech-to-text transcript,",
    "so ignore missing punctuation and capitalisation, and do not penalise obvious transcription noise.",
    languageRule(b.needsEnglish !== false, b.lang || "en"),
    "",
    "QUESTION: " + b.question,
    "",
    "STUDENT ANSWER: " + b.answer,
    "",
    b.modelAnswer ? "A GOOD ANSWER WOULD BE: " + b.modelAnswer : "",
    b.keyPoints && b.keyPoints.length ? "POINTS WORTH COVERING: " + b.keyPoints.join("; ") : "",
    b.mustPoints && b.mustPoints.length ? "SAFETY POINTS THAT MUST BE MENTIONED: " + b.mustPoints.join("; ") : "",
    "",
    "Score each of these 1-10, where 5 is an average trainee and 8+ is genuinely interview-ready:",
    "- communication: is it clear and the right length for the question?",
    "- sentences: are these complete sentences rather than a list of words?",
    "- thought: " + (technical ? "is the reasoning in a sensible order?" : "is the answer structured?"),
    "- speechGrammar: grammar and word choice. You are reading a transcript, so say NOTHING about pronunciation.",
    "- accuracy: " + (technical ? "is the technical content correct?" : "does it actually answer the question asked?"),
    "- coherence: does it hang together, or does it wander and repeat?",
    "",
    "Judge meaning, not keywords. This matters most:",
    "- If the answer merely contains the right words but says nothing sensible about them,",
    "  or is about an unrelated topic, accuracy must be 3 or less and classification is off_topic.",
    "- If it is a bare list of words with no sentence, classification is word_list and sentences is 3 or less.",
    "- If the student says they do not know, classification is dont_know, accuracy is 1 and overall is 2 or less.",
    "  Saying so honestly is better than bluffing, but it is still not an answer.",
    "- Correct but brief is fine" + (technical ? ", especially for a technical question." : "."),
    "",
    "overall: a weighted judgement out of 10. " +
      (technical ? "Weight technical accuracy most heavily." : "Weight answering the question and clear language most heavily."),
    "missed: short phrases naming what the answer left out. Empty if nothing important is missing.",
    "advice: ONE piece of advice, 2-3 sentences, addressed to the student as 'you'.",
    "Write advice in " + lang + ", in simple words a 19-year-old trainee will understand.",
    "Say what to do next time, not just what was wrong. Be encouraging but honest.",
    b.lang === "en" ? "" : "Keep standard technical terms (feed rate, RPM, multimeter) in English inside the " + lang + " sentence, the way a trainer in the classroom would."
  ].filter(Boolean).join("\n");
}

function cors(origin, allowed) {
  const h = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  // With ALLOWED_ORIGINS unset, allow any origin — convenient while testing,
  // but set it before handing the link to students.
  if (!allowed.length) h["Access-Control-Allow-Origin"] = "*";
  else if (origin && allowed.indexOf(origin) >= 0) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json" }, headers || {})
  });
}

/* ---- One call to one model -------------------------------------------
   Returns {ok, data} or {ok:false, error, retry}. Never throws: an abort
   from our own cap and a dead socket both arrive here as the same thing,
   and both are worth another go. `retry` says whether trying again could
   plausibly change the answer — a 400 means our request is wrong, and
   repeating a wrong request just spends the budget.                     */

async function callGemini(model, key, body, capMs) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
              encodeURIComponent(model) + ":generateContent";

  let ctrl = null, timer = null;
  try { ctrl = new AbortController(); } catch (e) { ctrl = null; }
  if (ctrl) timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, capMs);

  try {
    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(body) }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: SCHEMA
        }
      })
    };
    if (ctrl) opts.signal = ctrl.signal;

    const res = await fetch(url, opts);

    if (!res.ok) {
      // Never pass the upstream body through — it can echo the key back.
      return {
        ok: false,
        error: "upstream_" + res.status,
        retry: res.status === 429 || res.status >= 500
      };
    }

    const data = await res.json();
    const text = data &&
      data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;

    if (!text) return { ok: false, error: "empty_response", retry: true };

    try { return { ok: true, data: JSON.parse(text) }; }
    catch (e) { return { ok: false, error: "unparsable", retry: true }; }

  } catch (e) {
    return { ok: false, error: "upstream_unreachable", retry: true };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/* ---- Transcription -----------------------------------------------------
   One recording in, one transcript out. Kept apart from the judging path: it
   has its own size ceiling (audio is far bigger than text), its own time
   budget, and no structured-output schema, because all we want back is words.

   The prompt matters more than it looks. Asked to "transcribe", the model
   volunteers headings, speaker labels and notes about audio quality, and every
   one of those ends up scored as if the student had said it.               */

async function transcribe(model, key, body, capMs) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
              encodeURIComponent(model) + ":generateContent";

  let ctrl = null, timer = null;
  try { ctrl = new AbortController(); } catch (e) { ctrl = null; }
  if (ctrl) timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, capMs);

  const lang = body.lang || "en";
  const prompt = [
    "Transcribe this recording of a student at an Indian vocational training centre",
    "answering a job-interview question.",
    "They may speak English, " + (LANG_NAME[lang] || "English") + ", or a mix of both.",
    scriptRule(lang),
    "Return ONLY the words they spoke, as plain text.",
    "Do not add speaker labels, headings, timestamps, quotation marks, or any comment",
    "about the recording or its quality. If nothing intelligible was said, return an empty string.",
    "Indian-accented speech is expected; transcribe what was said rather than correcting it."
  ].join(" ");

  try {
    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: body.mimeType || "audio/wav", data: body.audio } }
          ]
        }],
        generationConfig: { temperature: 0 }
      })
    };
    if (ctrl) opts.signal = ctrl.signal;

    const res = await fetch(url, opts);
    if (!res.ok) {
      // Never pass the upstream body through — it can echo the key back.
      return { ok: false, error: "upstream_" + res.status,
               retry: res.status === 429 || res.status >= 500 };
    }

    const data = await res.json();
    const text = data &&
      data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;

    // Nothing intelligible is a real answer, not a failure worth retrying.
    return { ok: true, data: { text: typeof text === "string" ? text.trim() : "" } };

  } catch (e) {
    return { ok: false, error: "upstream_unreachable", retry: true };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/* ---- Transcribe and mark in one call -----------------------------------
   The old flow asked for the transcript, waited, then sent the text back to be
   marked: two round trips, and a student watching a blank screen for about
   twenty-five seconds. Reading the recording and judging it are the same read,
   so this asks for both at once. It also marks better - the model hears the
   answer rather than reading a transcript of it.

   If it fails, the caller still has /transcribe to fall back on, so a bad
   response costs latency rather than the whole answer.                      */

async function answerFromAudio(model, key, b, capMs) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
              encodeURIComponent(model) + ":generateContent";

  let ctrl = null, timer = null;
  try { ctrl = new AbortController(); } catch (e) { ctrl = null; }
  if (ctrl) timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, capMs);

  const lang = b.lang || "en";
  const prompt = [
    "You are marking a spoken answer from a student at an Indian vocational training centre (ITI),",
    "practising for a job interview. The recording is their answer.",
    "",
    "FIRST, transcribe it into `text`.",
    "They may speak English, " + (LANG_NAME[lang] || "English") + ", or a mix.",
    scriptRule(lang),
    "`text` must be only the words they spoke - no labels, no commentary.",
    "If nothing intelligible was said, `text` is an empty string and every score is 1.",
    "",
    "THEN mark what they said.",
    languageRule(b.needsEnglish !== false, lang),
    "",
    "QUESTION: " + String(b.question || ""),
    b.modelAnswer ? "A GOOD ANSWER WOULD BE: " + b.modelAnswer : "",
    b.keyPoints && b.keyPoints.length ? "POINTS WORTH COVERING: " + b.keyPoints.join("; ") : "",
    b.mustPoints && b.mustPoints.length ? "SAFETY POINTS THAT MUST BE MENTIONED: " + b.mustPoints.join("; ") : "",
    "",
    "Score each 1-10, where 5 is an average trainee and 8+ is genuinely interview-ready:",
    "- communication: is it clear and the right length for the question?",
    "- sentences: complete sentences rather than a list of words?",
    "- thought: " + (b.mode === "technical" ? "is the reasoning in a sensible order?" : "is the answer structured?"),
    "- speechGrammar: grammar and word choice. Say NOTHING about pronunciation or accent.",
    "- accuracy: " + (b.mode === "technical" ? "is the technical content correct?" : "does it answer the question asked?"),
    "- coherence: does it hang together, or wander and repeat?",
    "",
    "Judge meaning, not keywords:",
    "- Right words but nothing sensible said about them, or an unrelated topic: accuracy 3 or less, classification off_topic.",
    "- A bare list of words with no sentence: classification word_list, sentences 3 or less.",
    "- They say they do not know: classification dont_know, accuracy 1, overall 2 or less.",
    "- Correct but brief is fine" + (b.mode === "technical" ? ", especially on a technical question." : "."),
    "",
    "missed: short phrases naming what was left out. Empty if nothing important is missing.",
    "advice: ONE piece of advice, 2-3 sentences, addressed to the student as 'you'.",
    "Write advice in " + (LANG_NAME[lang] || "English") + ", in simple words a 19-year-old trainee will understand."
  ].filter(Boolean).join("\n");

  try {
    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: b.mimeType || "audio/wav", data: b.audio } }
          ]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: SCHEMA
        }
      })
    };
    if (ctrl) opts.signal = ctrl.signal;

    const res = await fetch(url, opts);
    if (!res.ok) {
      return { ok: false, error: "upstream_" + res.status,
               retry: res.status === 429 || res.status >= 500 };
    }

    const data = await res.json();
    const out = data &&
      data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;

    if (!out) return { ok: false, error: "empty_response", retry: true };
    try { return { ok: true, data: JSON.parse(out) }; }
    catch (e) { return { ok: false, error: "unparsable", retry: true }; }

  } catch (e) {
    return { ok: false, error: "upstream_unreachable", retry: true };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default {
  async fetch(request, env) {
    const allowed = String(env.ALLOWED_ORIGINS || "")
      .split(",").map(s => s.trim()).filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const head = cors(origin, allowed);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: head });
    if (request.method !== "POST") return json({ error: "post_only" }, 405, head);

    // An origin that is configured but does not match is refused outright.
    if (allowed.length && allowed.indexOf(origin) < 0) return json({ error: "bad_origin" }, 403, head);

    if (!env.GEMINI_API_KEY) return json({ error: "not_configured" }, 500, head);

    /* Audio is orders of magnitude bigger than an answer, so the transcription
       path is routed and size-checked before the text one. 8MB of base64 is
       about four minutes of the 16kHz mono WAV dictation.js sends, comfortably
       past its own MAX_SECONDS ceiling. */
    const path = new URL(request.url).pathname.replace(/\/+$/, "");
    const isAnswer = path.endsWith("/answer");          // audio in, transcript AND marks out
    const isAudio = isAnswer || path.endsWith("/transcribe");

    let body;
    try {
      const raw = await request.text();
      if (raw.length > (isAudio ? 8000000 : 12000)) return json({ error: "too_large" }, 413, head);
      body = JSON.parse(raw);
    } catch (e) {
      return json({ error: "bad_json" }, 400, head);
    }

    if (isAudio) {
      if (!body || typeof body.audio !== "string" || !body.audio) {
        return json({ error: "bad_body" }, 400, head);
      }

      /* Gemini's free tier sheds load with 503 often enough that measuring this
         endpoint hit it twice in five calls. On the text path a 503 costs a
         retry; here it would cost the student their whole answer, because the
         recording only exists on their phone until this returns. So the audio
         path retries too - a different model pool, since 503 is capacity and
         capacity is tracked per model.

         The budget is the ceiling and it is enforced, not summed: the second
         attempt only starts if there is time left for it inside the 40s the
         client waits. */
      const AUDIO_BUDGET_MS = 34000;
      const AUDIO_ATTEMPT_MS = 16000;
      const FALLBACK = "gemini-3.1-flash-lite";
      const first = env.GEMINI_MODEL || "gemini-3.5-flash";
      const chain = [first];
      if (first !== FALLBACK) chain.push(FALLBACK);

      const started = Date.now();
      const left = () => AUDIO_BUDGET_MS - (Date.now() - started);
      const run = (m, cap) => isAnswer
        ? answerFromAudio(m, env.GEMINI_API_KEY, body, cap)
        : transcribe(m, env.GEMINI_API_KEY, body, cap);

      let r = null;
      for (const model of chain) {
        const cap = Math.min(AUDIO_ATTEMPT_MS, left());
        if (cap < 4000) break;                  // not enough time left to be useful
        r = await run(model, cap);
        // No transcript is logged - only size, model and elapsed time.
        console.log(JSON.stringify({
          path: isAnswer ? "answer" : "transcribe", model: model, lang: body.lang || "en",
          bytes: body.audio.length, ms: Date.now() - started, result: r.ok ? "ok" : r.error
        }));
        if (r.ok || !r.retry) break;
      }

      return r && r.ok ? json(r.data, 200, head)
                       : json({ error: (r && r.error) || "no_time" }, 502, head);
    }

    if (!body || typeof body.question !== "string" || typeof body.answer !== "string") {
      return json({ error: "bad_body" }, 400, head);
    }
    if (!body.answer.trim()) return json({ error: "empty_answer" }, 400, head);

    /* Optional per-day cap, per IP. Only runs if you bind a KV namespace called
       RATE. Without it there is no limit here and Gemini's own free-tier quota
       is the only ceiling — see the README before sharing the URL widely. */
    const cap = parseInt(env.DAILY_LIMIT || "0", 10);
    let rateKey = null;
    if (env.RATE && cap > 0) {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      rateKey = "d:" + new Date().toISOString().slice(0, 10) + ":" + ip;
      const used = parseInt((await env.RATE.get(rateKey)) || "0", 10);
      if (used >= cap) return json({ error: "rate_limited" }, 429, head);
    }

    /* ---- The model chain ---------------------------------------------
       Gemini's free tier sheds load with 503 far more often than it fails
       for any other reason: measured against this Worker, 5 of 9 calls came
       back 503. That is shared serving capacity, not quota, so paying would
       not remove it — but 503 is retryable by definition, and capacity is
       tracked per model. So: ask the same model again, then ask a different
       pool. Roughly, 44% success per call becomes ~90% over four attempts.

       BUDGET_MS is the hard ceiling and it is enforced, not summed. Every
       attempt reads the clock and shrinks its own cap to whatever is left,
       so adding a model or mistuning a backoff cannot push the total past
       it. That matters: the client gives up at 25s, and any work finishing
       after that is discarded without anyone seeing it — the same silent
       failure the old 12s client timeout was causing.                    */

    const BUDGET_MS      = 22500;   // hard ceiling; stays under the client's 25s
    const ATTEMPT_MS     = 5000;    // cap per call — also catches a socket that hangs
    const TRIES_PER_MODEL = 2;
    const BACKOFF_MS     = 500;
    const BACKOFF_MAX    = 1000;    // capped: doubling forever outruns the budget
    const MIN_USEFUL_MS  = 1500;    // too little left to be worth starting

    const FALLBACK_MODEL = "gemini-3.1-flash-lite";
    const first = env.GEMINI_MODEL || "gemini-3.5-flash";
    const chain = [first];
    if (first !== FALLBACK_MODEL) chain.push(FALLBACK_MODEL);

    const t0 = Date.now();
    const left = () => BUDGET_MS - (Date.now() - t0);
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    let out = null, lastErr = "upstream_unreachable";

    outer:
    for (let ci = 0; ci < chain.length; ci++) {
      const model = chain[ci];
      let backoff = BACKOFF_MS;          // per model — never carried across pools

      for (let attempt = 0; attempt < TRIES_PER_MODEL; attempt++) {
        const remain = left();
        if (remain < MIN_USEFUL_MS) break outer;

        const started = Date.now();
        const r = await callGemini(model, env.GEMINI_API_KEY, body, Math.min(ATTEMPT_MS, remain));

        /* One line per attempt. `wrangler tail` is the only view into which
           pool is actually failing, and without the model name and elapsed
           time the fallback order is guesswork. No answer text is logged. */
        console.log(JSON.stringify({
          model: model, attempt: attempt + 1,
          ms: Date.now() - started, result: r.ok ? "ok" : r.error
        }));

        if (r.ok) { out = r.data; break outer; }
        lastErr = r.error;
        if (!r.retry) break;                       // our fault — next pool won't help either
        if (left() < MIN_USEFUL_MS + backoff) break outer;

        await sleep(backoff + Math.floor(Math.random() * 300));   // jitter
        backoff = Math.min(backoff * 2, BACKOFF_MAX);
      }
    }

    if (!out) return json({ error: lastErr }, 502, head);

    if (rateKey && env.RATE) {
      const used = parseInt((await env.RATE.get(rateKey)) || "0", 10);
      // 36h expiry so the day's counter disappears on its own
      await env.RATE.put(rateKey, String(used + 1), { expirationTtl: 129600 });
    }

    return json(out, 200, head);
  }
};
