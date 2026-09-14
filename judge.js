/* AI evaluation - optional, off by default.

   scoring.js counts keywords; it does not understand meaning. So an answer like
   "I like cricket and my favourite food is pizza with speed and feed tool" still
   scores well - the words really are there, the understanding is not. Telling
   those two apart needs a model that reads for meaning.

   Four rules, never to be broken:

   1. The app is offline first. JUDGE_URL empty, no internet, the student has not
      said yes, or the model does not answer - in every one of those cases the
      offline result from scoring.js is used and the app works completely. This
      file never throws; on failure it returns null.

   2. Answer text does not leave the phone until the student explicitly says yes.
      It is off by default, and turns on only when they read the setting and press
      the switch. This consent is entirely separate from the progress-backup
      consent - backup sends only scores, this sends the answer text. Yes to one
      is not yes to the other.

   3. No identity is sent. The question, the answer text and the language, and
      nothing else. No name, no email, no user id. The model does not need to know
      who is speaking. Only the fields in payload() below are sent.

   4. The API key never reaches the phone. The phone talks only to our Worker; the
      key lives in the Worker's env. See backend/worker/README.md.
*/
"use strict";

/* The Cloudflare Worker address. Leave it empty and the whole feature does not
   appear; the app stays the offline app it was before.
   Example: "https://interview-judge.<your-name>.workers.dev"  (no trailing slash) */
const JUDGE_URL = "https://interview-judge.msa-vtc.workers.dev";

const Judge = (function () {

  const TIMEOUT_MS = 25000;              // no reply within this time -> use the offline score
  const MAX_ANSWER = 4000;               // do not send text longer than this
  const CACHE_KEY = "interview_judge_cache_v1";
  const CACHE_MAX = 150;                 // keep this many results, then drop the oldest

  const CRIT_KEYS = ["communication", "sentences", "thought", "speechGrammar", "accuracy", "coherence"];

  /* ---------------- Is it on? ---------------- */

  function enabled() { return !!JUDGE_URL; }

  /* Has the student said yes? No by default. */
  function consented() { return !!(state && state.settings && state.settings.ai); }

  /* With no internet there is no point asking the model - the student waits
     25 seconds and ends up with the offline score anyway. Go offline at once. */
  function online() { return typeof navigator === "undefined" || navigator.onLine !== false; }

  function active() { return enabled() && consented() && online(); }

  function setConsent(on) {
    state.settings.ai = !!on;
    if (!on) clearCache();               // saying no also drops the cached results
    save();
  }

  /* ---------------- Cached results ----------------
     The question bank is small and the free tier is tight, so the model is not
     asked twice for the same question-and-answer pair. Stays on this phone only. */

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch (e) { return {}; }
  }

  function writeCache(c) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch (e) {}
  }

  function clearCache() { try { localStorage.removeItem(CACHE_KEY); } catch (e) {} }

  /* Make text comparable - lower case, no punctuation, no extra spaces */
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  /* A short key - using the whole text as the key would fill up storage */
  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function cacheKey(question, answer, lang) {
    const qid = question && question.id != null ? String(question.id) : "";
    return qid + "." + lang + "." + hash(norm(answer));
  }

  function cacheGet(k) {
    const c = readCache();
    return c[k] ? c[k].r : null;
  }

  function cacheSet(k, r) {
    const c = readCache();
    c[k] = { at: Date.now(), r: r };
    const keys = Object.keys(c);
    if (keys.length > CACHE_MAX) {
      keys.sort((a, b) => (c[a].at || 0) - (c[b].at || 0))
          .slice(0, keys.length - CACHE_MAX)
          .forEach(k2 => { delete c[k2]; });
    }
    writeCache(c);
  }

  /* ---------------- What is sent to the model ----------------
     No identity goes with it - see rule 3. */

  function payload(answer, question, mode, lang) {
    const kw = Array.isArray(question.kw)
      ? question.kw.map(g => (Array.isArray(g) ? g[0] : String(g))).filter(Boolean)
      : [];
    const must = Array.isArray(question.must)
      ? question.must.map(m => (m && m.gu) || "").filter(Boolean)
      : [];
    return {
      question: String(question.q || ""),
      answer: String(answer || "").slice(0, MAX_ANSWER),
      modelAnswer: String(question.en || ""),
      keyPoints: kw,
      mustPoints: must,
      mode: mode === "technical" ? "technical" : "interview",
      lang: lang === "gu" || lang === "hi" ? lang : "en"
    };
  }

  /* ---------------- Making the model's reply trustworthy ----------------
     The model can return text in any shape, so every field is checked; anything
     malformed is dropped and the offline score is left in its place. */

  function num(v) {
    const n = typeof v === "number" ? v : parseFloat(v);
    if (!isFinite(n)) return null;
    return Math.max(1, Math.min(10, Math.round(n * 10) / 10));
  }

  function str(v, max) {
    if (typeof v !== "string") return "";
    const s = v.replace(/\s+/g, " ").trim();
    return s.length > (max || 400) ? s.slice(0, max || 400) : s;
  }

  function clean(raw) {
    if (!raw || typeof raw !== "object") return null;

    const scores = {};
    if (raw.scores && typeof raw.scores === "object") {
      CRIT_KEYS.forEach(k => {
        const n = num(raw.scores[k]);
        if (n !== null) scores[k] = n;
      });
    }
    // If all six criteria did not arrive, use none of them - a half merge is wrong
    const haveAll = CRIT_KEYS.every(k => scores[k] != null);

    const out = {
      scores: haveAll ? scores : null,
      overall: num(raw.overall),
      advice: str(raw.advice, 600),
      classification: str(raw.classification, 40),
      missed: Array.isArray(raw.missed) ? raw.missed.map(m => str(m, 120)).filter(Boolean).slice(0, 6) : []
    };

    if (!out.scores && out.overall === null && !out.advice) return null;
    return out;
  }

  /* ---------------- Merging with the offline result ----------------
     The offline result is always the base - every field in it is sound. Only what
     the model got right is layered on top. So even a half-formed model reply
     leaves nothing missing on screen. */

  function merge(offline, judged) {
    // Trust nothing: sanitise whatever arrives. evaluate() already hands over
    // sanitised data, but merge can be called from outside too - and a raw reply
    // there used to leave overall as undefined. Sanitising twice changes nothing.
    judged = clean(judged);
    if (!judged) return offline;

    const r = Object.assign({}, offline);
    r.scores = Object.assign({}, offline.scores);
    r.notes = Object.assign({}, offline.notes);

    if (judged.scores) {
      CRIT_KEYS.forEach(k => { r.scores[k] = judged.scores[k]; });
      // Find the weakest criterion again, using the new scores
      let weakest = CRIT_KEYS[0];
      CRIT_KEYS.forEach(k => { if (r.scores[k] < r.scores[weakest]) weakest = k; });
      r.weakest = weakest;
    }

    if (judged.overall !== null) r.overall = judged.overall;
    if (judged.advice) r.advice = judged.advice;

    /* The safety gate stays offline. If a mandatory point was missed, the score
       is capped at 6 whatever the model says - missing these costs you the job in
       industry, and that rule is not being handed to a model. */
    if (offline.missingMust && offline.missingMust.length && r.overall > 6) r.overall = 6;

    r.byAi = true;
    return r;
  }

  /* ---------------- The main job ----------------
     Always returns a Promise and never rejects. On failure, null. */

  function evaluate(answer, question, mode, lang) {
    if (!active() || !answer || !question) return Promise.resolve(null);

    const key = cacheKey(question, answer, lang);
    const hit = cacheGet(key);
    if (hit) return Promise.resolve(hit);

    let ctrl = null, timer = null;
    try { ctrl = new AbortController(); } catch (e) { ctrl = null; }

    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(answer, question, mode, lang))
    };
    if (ctrl) opts.signal = ctrl.signal;
    if (ctrl) timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, TIMEOUT_MS);

    return fetch(JUDGE_URL, opts)
      .then(res => (res && res.ok ? res.json() : null))
      .then(raw => {
        const r = clean(raw);
        if (r) cacheSet(key, r);
        return r;
      })
      .catch(() => null)
      .then(r => { if (timer) clearTimeout(timer); return r; });
  }

  return { enabled, consented, active, online, setConsent, evaluate, merge, clearCache };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { Judge };
