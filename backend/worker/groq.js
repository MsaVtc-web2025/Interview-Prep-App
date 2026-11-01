/* Groq - the first stop for interview marking and voice answers.
 *
 * Gemini's free quota ran out on 2026-11-01 with a class of 20+ phones on
 * it. Groq's free tier is a separate allowance on fast open models, so the
 * Worker asks Groq first and only falls back to Gemini when every Groq model
 * is used up or failing (interview-judge.js puts them in one stack).
 *
 *   marking: an OpenAI-style chat call in JSON mode. The answer has to come
 *            back in exactly the shape Gemini's schema gives, so the prompt
 *            spells the shape out and every reply is checked (shapeMarks)
 *            before it is used - a reply that does not fit counts as a
 *            failure and the next model is asked.
 *   voice:   Whisper writes the recording down; the marking stack then marks
 *            the words.
 *
 * Off until the GROQ_API_KEY secret is set (console.groq.com, free, no card).
 * Model lists can be changed without code with GROQ_MODELS / GROQ_STT_MODELS
 * (comma-separated) - Groq retires models, check console.groq.com/docs/models.
 */

const BASE = "https://api.groq.com/openai/v1";

/* Production models, best first. gpt-oss reasons before it answers; it is
   asked to keep that short. */
const CHAT_MODELS = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
const STT_MODELS = ["whisper-large-v3-turbo", "whisper-large-v3"];

const list = (v, dflt) => v ? String(v).split(",").map(s => s.trim()).filter(Boolean) : dflt;
export const groqChatModels = env => env.GROQ_API_KEY ? list(env.GROQ_MODELS, CHAT_MODELS) : [];
export const groqSttModels = env => env.GROQ_API_KEY ? list(env.GROQ_STT_MODELS, STT_MODELS) : [];

const CRITERIA = ["communication", "sentences", "thought", "speechGrammar", "accuracy", "coherence"];
const CLASSES = ["answered", "partial", "off_topic", "dont_know", "word_list"];

const JSON_SHAPE = [
  "Reply with ONLY one JSON object - no other text - in exactly this shape:",
  '{"classification": "answered" | "partial" | "off_topic" | "dont_know" | "word_list",',
  ' "scores": {"communication": n, "sentences": n, "thought": n, "speechGrammar": n, "accuracy": n, "coherence": n},',
  ' "overall": n, "missed": ["short phrase", ...], "advice": "..."}',
  "where every n is a number from 1 to 10."
].join("\n");

/* A reply in the shape the app expects, or null. Numbers are clamped to
   1-10; anything missing or of the wrong kind rejects the whole reply. */
export function shapeMarks(d) {
  if (!d || typeof d !== "object" || !d.scores || typeof d.scores !== "object") return null;
  const n = v => { const x = Number(v); return isFinite(x) ? Math.min(10, Math.max(1, Math.round(x * 10) / 10)) : null; };
  const scores = {};
  for (const k of CRITERIA) {
    scores[k] = n(d.scores[k]);
    if (scores[k] == null) return null;
  }
  const overall = n(d.overall);
  if (overall == null || typeof d.advice !== "string" || !d.advice.trim()) return null;
  return {
    classification: CLASSES.indexOf(d.classification) >= 0 ? d.classification : "answered",
    scores: scores,
    overall: overall,
    missed: Array.isArray(d.missed) ? d.missed.filter(s => typeof s === "string" && s.trim()).slice(0, 6) : [],
    advice: d.advice.trim()
  };
}

/* Which limit a Groq 429 hit. The documented headers say it: requests left
   for the day, and retry-after; the body names the limit in words. Only
   these are read - the body itself is never passed on or logged. */
async function quotaOf(res) {
  const h = res.headers;
  let msg = "";
  try { const j = await res.json(); msg = String((j && j.error && j.error.message) || ""); } catch (e) {}
  const retryS = Math.round(parseFloat(h.get("retry-after") || "0") || 0);
  let limit = "unknown";
  if (/per day|\(RPD\)|\(TPD\)|\(ASD\)/i.test(msg) || h.get("x-ratelimit-remaining-requests") === "0") limit = "per_day";
  else if (/per minute|per hour|\(RPM\)|\(TPM\)|\(ASH\)/i.test(msg)) limit = "per_minute";
  const id = (msg.match(/\((RPD|TPD|RPM|TPM|ASH|ASD)\)/) || [])[1] || "";
  return { limit: limit, id: id ? "groq-" + id : "groq", retryS: retryS };
}

async function failure(res) {
  if (res.status === 429) return { ok: false, error: "upstream_429", retry: false, quota: await quotaOf(res) };
  return { ok: false, error: "upstream_" + res.status, retry: res.status >= 500 };
}

function timer(capMs) {
  let ctrl = null, t = null;
  try { ctrl = new AbortController(); } catch (e) { ctrl = null; }
  if (ctrl) t = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, capMs);
  return { signal: ctrl ? ctrl.signal : undefined, done: () => { if (t) clearTimeout(t); } };
}

/* Mark one answer. prompt: the same marking prompt Gemini gets. */
export async function groqMark(model, key, prompt, capMs) {
  const tm = timer(capMs);
  const reasoning = /gpt-oss/.test(model);
  const req = {
    model: model,
    messages: [
      { role: "system", content: "You mark interview practice answers for an Indian vocational training centre. You reply with JSON only." },
      { role: "user", content: prompt + "\n\n" + JSON_SHAPE }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
    max_completion_tokens: reasoning ? 1500 : 700
  };
  if (reasoning) req.reasoning_effort = "low";
  try {
    const res = await fetch(BASE + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify(req),
      signal: tm.signal
    });
    if (!res.ok) return failure(res);
    const data = await res.json();
    const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!text) return { ok: false, error: "empty_response", retry: true };
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) { return { ok: false, error: "unparsable", retry: true }; }
    const marks = shapeMarks(parsed);
    return marks ? { ok: true, data: marks } : { ok: false, error: "bad_shape", retry: true };
  } catch (e) {
    return { ok: false, error: "upstream_unreachable", retry: true };
  } finally {
    tm.done();
  }
}

/* A hint in the student's script: Whisper follows the prompt's script, so
   Gujarati comes back in Gujarati letters with English words in English. */
const STT_HINT = {
  gu: "નમસ્તે. મારું નામ રવિ છે. હું CNC machine પર કામ કરું છું. Patient ની Safety માટે PPE પહેરવું જરૂરી છે.",
  hi: "नमस्ते। मेरा नाम रवि है। मैं CNC machine पर काम करता हूँ। Patient की Safety के लिए PPE पहनना ज़रूरी है।",
  en: "My name is Ravi. I work on a CNC machine. Safety and PPE are important."
};

/* Write a recording down. b: {audio (base64), mimeType, lang} */
export async function groqTranscribe(model, key, b, capMs) {
  const tm = timer(capMs);
  try {
    const bin = atob(b.audio);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const lang = STT_HINT[b.lang] ? b.lang : "en";
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: b.mimeType || "audio/wav" }), "answer.wav");
    form.append("model", model);
    form.append("language", lang);
    form.append("prompt", STT_HINT[lang]);
    form.append("response_format", "json");
    form.append("temperature", "0");
    const res = await fetch(BASE + "/audio/transcriptions", {
      method: "POST", headers: { Authorization: "Bearer " + key }, body: form, signal: tm.signal
    });
    if (!res.ok) return failure(res);
    const data = await res.json();
    let text = typeof (data && data.text) === "string" ? data.text.replace(/\s+/g, " ").trim() : "";
    // Whisper repeats the prompt back on a silent recording - that is not an answer
    if (text && STT_HINT[lang].indexOf(text) >= 0) text = "";
    return { ok: true, data: { text: text } };
  } catch (e) {
    return { ok: false, error: "upstream_unreachable", retry: true };
  } finally {
    tm.done();
  }
}
