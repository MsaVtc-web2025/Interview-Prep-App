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
 * Once Supabase is set up (students.js), every one of those calls must carry a
 * student's access token, and /access, /me and /progress handle the codes and
 * the scores the app sends in.
 *
 * Deploy: see README.md in this folder.
 */

import { accessOn, requireStudent, studentRoute, withinDailyLimit } from "./students.js";
import { groqChatModels, groqSttModels, groqMark, groqTranscribe } from "./groq.js";

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
    text: { type: "string", description: "Exactly what was spoken, each word in its own script: Gujarati in Gujarati letters, Hindi in Devanagari, English in Latin. Never romanised, never translated." },
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
/* Gujarati needs showing, not just telling: asked in words alone, the model
   still writes Gujarati speech as "maru naam Ravi chhe", or quietly translates
   it into English. Hindi it gets right unprompted. An example in each script
   is what finally moves it. */
const SCRIPT_EXAMPLE = {
  gu: 'Example: say "મારું નામ રવિ છે, હું CNC machine પર કામ કરું છું" - NOT "maru naam Ravi chhe, hu CNC machine par kaam karu chhu".',
  hi: 'Example: say "मेरा नाम रवि है, मैं CNC machine पर काम करता हूँ" - NOT "mera naam Ravi hai, main CNC machine par kaam karta hoon".'
};

function scriptRule(lang) {
  if (lang === "en") return "Write the transcript in Latin letters.";
  return [
    "Write what the student said in the script it belongs to:",
    LANG_NAME[lang] + " words in " + SCRIPT_NAME[lang] + ", English words in Latin letters.",
    "Do NOT romanise " + LANG_NAME[lang] + " - never write it in Latin letters.",
    "Do NOT translate - write the words in the language they were spoken.",
    "Mixing the two inside one sentence is normal Indian speech; keep it as spoken.",
    SCRIPT_EXAMPLE[lang] || ""
  ].join(" ");
}

/* Did the model romanise anyway? Prompts lower the rate, they do not make it
   zero, so the reply is checked. A transcript with no letters of the student's
   script but with everyday words of their language spelt in Latin is
   romanised; a genuinely English answer has none of those words and is left
   alone, so it costs nothing extra. */
const NATIVE_SCRIPT = { gu: /[઀-૿]/, hi: /[ऀ-ॿ]/ };
const ROMAN_TELLS = {
  gu: /\b(che|chhe|chu|chhu|hu|maru|maro|mari|mane|tame|ame|ane|nathi|shu|kem|karu|kariye|karvu|hatu|hoy|pan|etle|mate|thi|nu|ni|no|na)\b/gi,
  hi: /\b(hai|hain|hoon|hun|mera|meri|mujhe|main|aur|nahi|nahin|kya|kaise|karta|karti|tha|thi|ke|ki|ka|ko|se|bhi)\b/gi
};

function looksRomanised(text, lang) {
  if (!text || !NATIVE_SCRIPT[lang] || NATIVE_SCRIPT[lang].test(text)) return false;
  const tells = text.match(ROMAN_TELLS[lang]) || [];
  return tells.length >= 2;
}

/* Gemini 3 thinks before it answers by default, and on this job - write down
   what was said, give six numbers - that is seconds of waiting for nothing.
   If a model refuses the setting (400), it is dropped for the life of this
   isolate and the same request goes again without it. */
let thinkingOk = true;

async function gemFetch(model, key, req, signal) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
              encodeURIComponent(model) + ":generateContent";
  const send = withThinking => {
    const cfg = Object.assign({}, req.generationConfig);
    if (withThinking) cfg.thinkingConfig = { thinkingLevel: "minimal" };
    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(Object.assign({}, req, { generationConfig: cfg }))
    };
    if (signal) opts.signal = signal;
    return fetch(url, opts);
  };

  const useThinking = thinkingOk;
  const res = await send(useThinking);
  if (res.status === 400 && useThinking) {
    thinkingOk = false;
    return send(false);
  }
  return res;
}

/* ---- Quota -------------------------------------------------------------
   429 from Gemini means a quota is used up - asking again straight away only
   spends more of it. So a 429 is never retried on the same model: the model
   rests (per-minute limit: for the delay Gemini gives; per-day limit: half an
   hour, then one request tries again), the next model gets one go, and when
   none is left the app is told "AI busy" at once (aiBusy below), with how
   long to wait. resting lives as long as this Worker instance. */

const resting = {};                        // model -> rest until (ms)
const DAY_REST_MS = 30 * 60 * 1000;

function rests(model) { return Date.now() < (resting[model] || 0); }

/* Which limit a 429 hit. Only the quota id and the delay are read from the
   body - never the body itself, which is not passed on or logged. */
async function quotaFrom(res) {
  let limit = "unknown", id = "", retryS = 0;
  try {
    const j = await res.json();
    const details = (j && j.error && j.error.details) || [];
    details.forEach(d => {
      (d.violations || []).forEach(v => {
        id = id || String(v.quotaId || v.quotaMetric || "");
      });
      if (d.retryDelay) retryS = parseFloat(String(d.retryDelay)) || 0;
    });
    if (/per ?day/i.test(id)) limit = "per_day";
    else if (/per ?minute/i.test(id)) limit = "per_minute";
  } catch (e) {}
  return { limit: limit, id: id.slice(0, 80), retryS: Math.round(retryS) };
}

function rest(model, q) {
  const ms = q.limit === "per_day" ? DAY_REST_MS : Math.max(q.retryS || 60, 10) * 1000;
  resting[model] = Date.now() + ms;
}

/* Every model of the chain resting: the reply the app gets, with no call made */
/* Seconds until the first of these models can be asked again */
function busyFor(chain) {
  const soonest = Math.min(...chain.map(m => resting[m] || 0));
  return Math.max(30, Math.round((soonest - Date.now()) / 1000));
}

function aiBusy(chain, head) {
  const wait = busyFor(chain);
  const h = Object.assign({ "Retry-After": String(wait) }, head);
  return json({ error: "ai_busy", limit: lastLimit, retry_after: wait }, 429, h);
}
let lastLimit = "unknown";

/* The error a failed call returns: a 429 carries its quota, and is not retried */
async function failure(res) {
  if (res.status === 429) {
    const q = await quotaFrom(res);
    lastLimit = q.limit;
    return { ok: false, error: "upstream_429", retry: false, quota: q };
  }
  // Never pass the upstream body through - it can echo the key back.
  return { ok: false, error: "upstream_" + res.status, retry: res.status >= 500 };
}

/* ---- The marking stack -------------------------------------------------
   Groq's models first (groq.js), then Gemini's. Every model gets one go -
   Gemini a second one on a 503, which is its capacity rather than its quota -
   and a used-up quota rests that model (above) so later requests skip it.
   Returns {out} with the marks, or {out: null, lastErr, busy} where busy
   means every model is resting. */

function geminiModels(env) {
  if (!env.GEMINI_API_KEY) return [];
  /* Lite first: measured 2026-09-28, the bigger model answered 503 on nearly
     every call while lite replied in ~2s. The bigger model is the backup. */
  const lite = "gemini-3.1-flash-lite", backup = env.GEMINI_MODEL || "gemini-3.6-flash";
  return backup === lite ? [lite] : [lite, backup];
}

/* One log line per attempt: which provider and model, how long, what came
   back, and which quota. `wrangler tail` shows it. No answer text is logged. */
function logTry(info, r) {
  console.log(JSON.stringify(Object.assign(info, { result: r.ok ? "ok" : r.error },
    r.quota ? { limit: r.quota.limit, quota_id: r.quota.id, retry_s: r.quota.retryS } : {})));
}

async function markAnswer(env, body, budgetMs) {
  const groq = groqChatModels(env).map(m => ({ via: "groq", m: m }));
  const gem = geminiModels(env).map(m => ({ via: "gemini", m: m }));
  // Gemini reads and writes Gujarati better; English and Hindi go to Groq first
  const stack = body.lang === "gu" ? gem.concat(groq) : groq.concat(gem);
  const all = stack.map(x => x.m);
  const live = stack.filter(x => !rests(x.m));
  if (!live.length) return { out: null, busy: true, all: all, lastErr: "ai_busy" };

  const prompt = buildPrompt(body);
  const t0 = Date.now();
  const left = () => budgetMs - (Date.now() - t0);
  let lastErr = "upstream_unreachable";

  for (const x of live) {
    const tries = x.via === "gemini" ? 2 : 1;
    for (let attempt = 0; attempt < tries; attempt++) {
      const remain = left();
      if (remain < 1500) return { out: null, all: all, lastErr: lastErr };
      const started = Date.now();
      const r = x.via === "groq"
        ? await groqMark(x.m, env.GROQ_API_KEY, prompt, Math.min(8000, remain))
        : await callGemini(x.m, env.GEMINI_API_KEY, body, Math.min(5000, remain));
      logTry({ via: x.via, model: x.m, attempt: attempt + 1, ms: Date.now() - started }, r);
      if (r.ok) return { out: r.data, all: all };
      lastErr = r.error;
      if (r.quota) { rest(x.m, r.quota); break; }        // used up: on to the next model
      if (!r.retry) break;
      if (attempt + 1 < tries && left() > 3000) await new Promise(ok => setTimeout(ok, 500 + Math.floor(Math.random() * 300)));
    }
  }
  return { out: null, all: all, lastErr: lastErr, busy: all.every(rests) };
}

function firstText(data) {
  return data &&
    data.candidates && data.candidates[0] &&
    data.candidates[0].content && data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
}

/* Rewrite a romanised transcript in the right script. Text in, text out, so it
   is quick - but it is still a round trip, which is why it only runs when
   looksRomanised() says it must. Any failure returns the text unchanged: a
   transcript in the wrong letters is still better than none. */
async function fixScript(model, key, text, lang, capMs) {
  if (capMs < 2500) return text;
  let ctrl = null, timer = null;
  try { ctrl = new AbortController(); } catch (e) { ctrl = null; }
  if (ctrl) timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, capMs);

  const prompt = [
    "Below is a transcript of an Indian student speaking " + LANG_NAME[lang] + " mixed with English,",
    "wrongly written in Latin letters. Rewrite it in " + SCRIPT_NAME[lang] + ".",
    "Keep English words (technical terms, names of machines and tools) in Latin letters.",
    "Do not translate, correct, add or remove anything - only change the script.",
    SCRIPT_EXAMPLE[lang] || "",
    "Return ONLY the rewritten transcript.",
    "",
    "TRANSCRIPT: " + text
  ].join("\n");

  try {
    const res = await gemFetch(model, key, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0 }
    }, ctrl && ctrl.signal);
    if (!res.ok) return text;
    const out = firstText(await res.json());
    return typeof out === "string" && NATIVE_SCRIPT[lang].test(out) ? out.trim() : text;
  } catch (e) {
    return text;
  } finally {
    if (timer) clearTimeout(timer);
  }
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
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
  let ctrl = null, timer = null;
  try { ctrl = new AbortController(); } catch (e) { ctrl = null; }
  if (ctrl) timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, capMs);

  try {
    const res = await gemFetch(model, key, {
      contents: [{ role: "user", parts: [{ text: buildPrompt(body) }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: SCHEMA
      }
    }, ctrl && ctrl.signal);

    if (!res.ok) return failure(res);

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
    const res = await gemFetch(model, key, {
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: body.mimeType || "audio/wav", data: body.audio } }
        ]
      }],
      generationConfig: { temperature: 0 }
    }, ctrl && ctrl.signal);
    if (!res.ok) return failure(res);

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
    const res = await gemFetch(model, key, {
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
    }, ctrl && ctrl.signal);
    if (!res.ok) return failure(res);

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
  async fetch(request, env, ctx) {
    const allowed = String(env.ALLOWED_ORIGINS || "")
      .split(",").map(s => s.trim()).filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const head = cors(origin, allowed);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: head });
    if (request.method !== "POST") return json({ error: "post_only" }, 405, head);

    // An origin that is configured but does not match is refused outright.
    if (allowed.length && allowed.indexOf(origin) < 0) return json({ error: "bad_origin" }, 403, head);

    const path = new URL(request.url).pathname.replace(/\/+$/, "");

    // Access codes and scores - students.js
    if (/\/(access|me|progress)$/.test(path)) return studentRoute(path, request, env, ctx, head, json);

    if (!env.GEMINI_API_KEY && !env.GROQ_API_KEY) return json({ error: "not_configured" }, 500, head);

    /* With Supabase set up, only a student with a valid access code gets AI
       marking or dictation - a shared link alone gets nothing from here. */
    let student = null;
    if (accessOn(env)) {
      const who = await requireStudent(request, env);
      if (!who.ok) return json({ error: who.error }, who.status, head);
      student = who.student;
    }

    /* Audio is orders of magnitude bigger than an answer, so the transcription
       path is routed and size-checked before the text one. 8MB of base64 is
       about four minutes of the 16kHz mono WAV dictation.js sends, comfortably
       past its own MAX_SECONDS ceiling. */
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
      if (student && !(await withinDailyLimit(env, student))) return json({ error: "daily_limit" }, 429, head);

      /* The budget is the ceiling and it is enforced, not summed: each step
         only starts if there is time left for it inside the 40s the client
         waits. */
      const AUDIO_BUDGET_MS = 34000;
      const AUDIO_ATTEMPT_MS = 16000;
      const started = Date.now();
      const left = () => AUDIO_BUDGET_MS - (Date.now() - started);
      const lg = body.lang;
      const stt = groqSttModels(env);
      const gem = geminiModels(env);
      const all = stt.concat(gem);
      if (!all.filter(m => !rests(m)).length) return aiBusy(all, head);

      // Romanised in spite of the prompt: fix the letters (Gemini lite, if it has quota)
      const fixLetters = async text => {
        if (!looksRomanised(text, lg) || !env.GEMINI_API_KEY || rests(gem[0]) || left() < 3000) return text;
        const fixed = await fixScript(gem[0], env.GEMINI_API_KEY, text, lg, Math.min(6000, left()));
        console.log(JSON.stringify({ path: "fixScript", lang: lg, fixed: NATIVE_SCRIPT[lg].test(fixed), ms: Date.now() - started }));
        return fixed;
      };

      /* Groq: Whisper writes the recording down, then the marking stack
         marks the words - the same marking a typed answer gets. */
      const viaGroq = async () => {
      for (const model of stt.filter(m => !rests(m))) {
        const cap = Math.min(AUDIO_ATTEMPT_MS, left());
        if (cap < 4000) break;
        const r = await groqTranscribe(model, env.GROQ_API_KEY, body, cap);
        logTry({ path: isAnswer ? "answer" : "transcribe", via: "groq", model: model, lang: lg || "en",
                 bytes: body.audio.length, ms: Date.now() - started }, r);
        if (r.quota) { rest(model, r.quota); continue; }
        if (!r.ok) { if (r.retry) continue; break; }

        const text = await fixLetters(r.data.text);
        if (!isAnswer || !text) return json({ text: text }, 200, head);
        const mk = await markAnswer(env, Object.assign({}, body, { answer: text }), Math.min(22500, left()));
        if (mk.out) return json(Object.assign({ text: text }, mk.out), 200, head);
        // Written down but not marked: the words still reach the student, and
        // the app learns the marking is busy (busy_for) instead of asking again
        const out = { text: text, unmarked: true };
        if (mk.busy) out.busy_for = busyFor(mk.all);
        return json(out, 200, head);
      }
      return null;
      };

      /* Gemini reads the recording itself (and marks it, on /answer). Its
         free tier sheds load with 503, so the next model is tried too. */
      let lastErr = "no_time";
      const viaGemini = async () => {
      const run = (m, cap) => isAnswer
        ? answerFromAudio(m, env.GEMINI_API_KEY, body, cap)
        : transcribe(m, env.GEMINI_API_KEY, body, cap);
      let r = null;
      for (const model of gem.filter(m => !rests(m))) {
        const cap = Math.min(AUDIO_ATTEMPT_MS, left());
        if (cap < 4000) break;                  // not enough time left to be useful
        r = await run(model, cap);
        // No transcript is logged - only size, model, elapsed time, and which quota
        logTry({ path: isAnswer ? "answer" : "transcribe", via: "gemini", model: model, lang: lg || "en",
                 bytes: body.audio.length, ms: Date.now() - started }, r);
        if (r.quota) { rest(model, r.quota); continue; }   // used up: the next model, once
        if (r.ok || !r.retry) break;
      }
      if (r && r.ok && r.data) r.data.text = await fixLetters(r.data.text);
      if (r && r.ok) return json(r.data, 200, head);
      if (r) lastErr = r.error;
      return null;
      };

      /* Gujarati speech: Gemini first - it hears Gujarati far better than
         Whisper (tried live 2026-11-01). English and Hindi: Groq first. Each
         is the other's backup. */
      for (const step of lg === "gu" ? [viaGemini, viaGroq] : [viaGroq, viaGemini]) {
        const res = await step();
        if (res) return res;
      }
      if (all.every(rests)) return aiBusy(all, head);
      return json({ error: lastErr }, 502, head);
    }

    if (!body || typeof body.question !== "string" || typeof body.answer !== "string") {
      return json({ error: "bad_body" }, 400, head);
    }
    if (!body.answer.trim()) return json({ error: "empty_answer" }, 400, head);
    if (student && !(await withinDailyLimit(env, student))) return json({ error: "daily_limit" }, 429, head);

    /* Optional per-day cap, per IP. Only runs if you bind a KV namespace called
       RATE. Without it there is no limit here and the models' own free-tier
       quotas are the only ceiling — see the README before sharing the URL widely. */
    const cap = parseInt(env.DAILY_LIMIT || "0", 10);
    let rateKey = null;
    if (env.RATE && cap > 0) {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      rateKey = "d:" + new Date().toISOString().slice(0, 10) + ":" + ip;
      const used = parseInt((await env.RATE.get(rateKey)) || "0", 10);
      if (used >= cap) return json({ error: "rate_limited" }, 429, head);
    }

    const mk = await markAnswer(env, body, 22500);   // stays under the client's 25s
    if (!mk.out) {
      if (mk.busy || mk.all.every(rests)) return aiBusy(mk.all, head);
      return json({ error: mk.lastErr }, 502, head);
    }

    if (rateKey && env.RATE) {
      const used = parseInt((await env.RATE.get(rateKey)) || "0", 10);
      // 36h expiry so the day's counter disappears on its own
      await env.RATE.put(rateKey, String(used + 1), { expirationTtl: 129600 });
    }

    return json(mk.out, 200, head);
  }
};
