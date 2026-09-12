/* AI મૂલ્યાંકન — વૈકલ્પિક, ડિફોલ્ટ બંધ.

   scoring.js ચાવીરૂપ શબ્દો ગણે છે, અર્થ સમજતું નથી. તેથી «I like cricket
   and my favourite food is pizza with speed and feed tool» જેવો જવાબ પણ
   સારા ગુણ મેળવી જાય છે — શબ્દો ખરેખર હાજર છે, પણ સમજ નથી. એ ભેદ પારખવા
   માટે અર્થ વાંચતું મોડેલ જોઈએ.

   ચાર નિયમ, જે કદી તોડવા નહીં:

   1. એપ પહેલાં ઓફલાઇન છે. JUDGE_URL ખાલી હોય, ઇન્ટરનેટ ન હોય, વિદ્યાર્થીએ
      «હા» ન કહ્યું હોય, કે મોડેલ જવાબ ન આપે — દરેક સ્થિતિમાં scoring.js
      નું ઓફલાઇન પરિણામ વપરાય છે અને એપ પૂરેપૂરી ચાલે છે. આ ફાઇલ કદી
      અપવાદ (throw) ફેંકતી નથી; નિષ્ફળ જાય તો null આપે છે.

   2. વિદ્યાર્થી સ્પષ્ટ «હા» કહે ત્યાં સુધી જવાબનું લખાણ ફોન બહાર જતું નથી.
      ડિફોલ્ટ બંધ છે. સેટિંગમાં વાંચીને બટન દબાવે ત્યારે જ ચાલુ થાય છે.
      આ સંમતિ પ્રગતિના બૅકઅપની સંમતિથી સાવ અલગ છે — બૅકઅપમાં ફક્ત ગુણ
      જાય છે, અહીં જવાબનું લખાણ જાય છે. એકની «હા» બીજા માટે ચાલે નહીં.

   3. ઓળખ સાથે જતી નથી. પ્રશ્ન, જવાબનું લખાણ અને ભાષા — બસ એટલું જ.
      નામ નહીં, ઈમેલ નહીં, વપરાશકર્તાની ઓળખ નહીં. મોડેલને કોણ બોલે છે તે
      જાણવાની જરૂર નથી. નીચે payload() માં જે ખાનાં છે તે જ જાય છે.

   4. API કી કદી ફોનમાં આવતી નથી. ફોન ફક્ત આપણા Worker સાથે વાત કરે છે;
      કી Worker ના env માં રહે છે. backend/worker/README.md જુઓ.
*/
"use strict";

/* ⚙ Cloudflare Worker નું સરનામું. ખાલી હોય તો આખી સુવિધા દેખાતી જ નથી
   અને એપ પહેલાં જેવી ઓફલાઇન એપ રહે છે.
   ઉદાહરણ: "https://interview-judge.<તમારું-નામ>.workers.dev"  (છેલ્લે સ્લૅશ નહીં) */
const JUDGE_URL = "https://interview-judge.msa-vtc.workers.dev";

const Judge = (function () {

  const TIMEOUT_MS = 25000;              // આટલી વારમાં જવાબ ન આવે તો ઓફલાઇન ગુણ વાપરો
  const MAX_ANSWER = 4000;               // આનાથી લાંબું લખાણ મોકલવું નથી
  const CACHE_KEY = "interview_judge_cache_v1";
  const CACHE_MAX = 150;                 // આટલાં પરિણામ સાચવો, પછી જૂનાં કાઢો

  const CRIT_KEYS = ["communication", "sentences", "thought", "speechGrammar", "accuracy", "coherence"];

  /* ---------------- ચાલુ છે કે નહીં ---------------- */

  function enabled() { return !!JUDGE_URL; }

  /* વિદ્યાર્થીએ «હા» કહ્યું છે? ડિફોલ્ટ ના. */
  function consented() { return !!(state && state.settings && state.settings.ai); }

  /* ઇન્ટરનેટ ન હોય તો મોડેલને પૂછવાનો અર્થ નથી — વિદ્યાર્થી ૨૫ સેકન્ડ
     રાહ જુએ અને છેવટે ઓફલાઇન ગુણ જ મળે. એના કરતાં તરત જ ઓફલાઇન. */
  function online() { return typeof navigator === "undefined" || navigator.onLine !== false; }

  function active() { return enabled() && consented() && online(); }

  function setConsent(on) {
    state.settings.ai = !!on;
    if (!on) clearCache();               // «ના» કહે તો સાચવેલાં પરિણામ પણ જાય
    save();
  }

  /* ---------------- સાચવેલાં પરિણામ ----------------
     પ્રશ્ન બેંક નાની છે અને મફત મર્યાદા ટૂંકી, તેથી એક જ પ્રશ્ન-જવાબ
     ફરી આવે તો મોડેલને બીજી વાર પૂછતા નથી. ફક્ત આ ફોનમાં રહે છે. */

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch (e) { return {}; }
  }

  function writeCache(c) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch (e) {}
  }

  function clearCache() { try { localStorage.removeItem(CACHE_KEY); } catch (e) {} }

  /* લખાણને સરખાવવા લાયક બનાવો — નાના અક્ષર, વધારાની જગ્યા અને વિરામ કાઢીને */
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  /* ટૂંકી ચાવી — આખું લખાણ ચાવી તરીકે રાખીએ તો સંગ્રહ ભરાઈ જાય */
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

  /* ---------------- મોડેલને શું મોકલવું ----------------
     ઓળખ સાથે જતી નથી — નિયમ ૩ જુઓ. */

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

  /* ---------------- મોડેલનો જવાબ ભરોસાપાત્ર બનાવો ----------------
     મોડેલ ગમે તે આકારનું લખાણ પાછું આપી શકે. તેથી દરેક ખાનું તપાસીએ
     છીએ; જે ખોટું હોય તે છોડી દઈએ અને ત્યાં ઓફલાઇન ગુણ જ રહેવા દઈએ. */

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
    // બધા છ માપદંડ ન આવ્યા હોય તો ગુણ વાપરવા નહીં — અડધું ભેળવવું ખોટું
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

  /* ---------------- ઓફલાઇન પરિણામ સાથે ભેળવો ----------------
     આધાર હંમેશાં ઓફલાઇન પરિણામ જ રહે છે — તેમાં બધાં ખાનાં પાકાં હોય છે.
     મોડેલે જે બરાબર આપ્યું હોય તે જ ઉપર ચડે. તેથી મોડેલ અડધું-પડધું
     આપે તોય સ્ક્રીન પર કશું ખૂટતું નથી. */

  function merge(offline, judged) {
    // ભરોસો ન રાખીએ: જે આવે તે પહેલાં ચાળી લઈએ. evaluate() પહેલેથી ચાળીને
    // આપે છે, પણ merge બહારથી પણ બોલાવી શકાય — અને ત્યાં કાચો જવાબ આવે
    // તો overall «undefined» થઈ જતું હતું. ચાળેલું ફરી ચાળવાથી બદલાતું નથી.
    judged = clean(judged);
    if (!judged) return offline;

    const r = Object.assign({}, offline);
    r.scores = Object.assign({}, offline.scores);
    r.notes = Object.assign({}, offline.notes);

    if (judged.scores) {
      CRIT_KEYS.forEach(k => { r.scores[k] = judged.scores[k]; });
      // સૌથી નબળો માપદંડ નવા ગુણ પ્રમાણે ફરી શોધો
      let weakest = CRIT_KEYS[0];
      CRIT_KEYS.forEach(k => { if (r.scores[k] < r.scores[weakest]) weakest = k; });
      r.weakest = weakest;
    }

    if (judged.overall !== null) r.overall = judged.overall;
    if (judged.advice) r.advice = judged.advice;

    /* સલામતીનો દરવાજો ઓફલાઇન જ રહે છે. ફરજિયાત મુદ્દો ચૂક્યા હોય તો
       મોડેલ ગમે તે કહે, કુલ ગુણ ૬ થી વધુ ન મળે — ઉદ્યોગમાં આ મુદ્દા
       ચૂકવાથી નોકરી મળતી નથી, અને એ નિયમ મોડેલને સોંપવો નથી. */
    if (offline.missingMust && offline.missingMust.length && r.overall > 6) r.overall = 6;

    r.byAi = true;
    return r;
  }

  /* ---------------- મુખ્ય કામ ----------------
     હંમેશાં Promise આપે છે અને કદી નકારતું નથી. નિષ્ફળ જાય તો null. */

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
