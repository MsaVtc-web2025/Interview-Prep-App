/* Interview Prep — AI evaluation proxy (Cloudflare Worker).
 *
 * The phone never sees the API key. It POSTs an answer here; this Worker adds
 * the key, calls Gemini, and returns a small fixed-shape JSON object.
 *
 * What arrives here: the question, the student's answer text, the model answer,
 * the key points, and a language code. No name, no email, no user id — judge.js
 * does not send them and this Worker has nothing to do with identity.
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

function buildPrompt(b) {
  const lang = LANG_NAME[b.lang] || "English";
  const technical = b.mode === "technical";

  return [
    "You are marking a spoken answer from a student at an Indian vocational training centre (ITI).",
    "The student is practising for a job interview. They spoke in English; the text below is a speech-to-text transcript,",
    "so ignore missing punctuation and capitalisation, and do not penalise obvious transcription noise.",
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

    let body;
    try {
      const raw = await request.text();
      if (raw.length > 12000) return json({ error: "too_large" }, 413, head);
      body = JSON.parse(raw);
    } catch (e) {
      return json({ error: "bad_json" }, 400, head);
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

    const model = env.GEMINI_MODEL || "gemini-flash-latest";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
                encodeURIComponent(model) + ":generateContent";

    let upstream;
    try {
      upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: buildPrompt(body) }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: SCHEMA
          }
        })
      });
    } catch (e) {
      return json({ error: "upstream_unreachable" }, 502, head);
    }

    if (!upstream.ok) {
      // Never pass the upstream body through — it can echo the key back.
      return json({ error: "upstream_" + upstream.status }, 502, head);
    }

    let out;
    try {
      const data = await upstream.json();
      const text = data &&
        data.candidates && data.candidates[0] &&
        data.candidates[0].content && data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
      if (!text) return json({ error: "empty_response" }, 502, head);
      out = JSON.parse(text);
    } catch (e) {
      return json({ error: "unparsable" }, 502, head);
    }

    if (rateKey && env.RATE) {
      const used = parseInt((await env.RATE.get(rateKey)) || "0", 10);
      // 36h expiry so the day's counter disappears on its own
      await env.RATE.put(rateKey, String(used + 1), { expirationTtl: 129600 });
    }

    return json(out, 200, head);
  }
};
