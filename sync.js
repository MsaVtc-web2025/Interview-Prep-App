/* પ્રગતિનો બૅકઅપ — ફોનની પ્રગતિ સંસ્થાના સર્વર પર મોકલવી.

   ત્રણ નિયમ, જે કદી તોડવા નહીં:

   1. એપ પહેલાં ઓફલાઇન છે. સર્વર ન હોય, ઇન્ટરનેટ ન હોય, સાઇન-ઇન ન કર્યું
      હોય કે સંમતિ ન આપી હોય — એપ પૂરેપૂરી ચાલવી જ જોઈએ. ફોનનો સંગ્રહ જ
      સાચો સંગ્રહ છે; સર્વર તેની નકલ છે, ઉલટું નહીં.

   2. જવાબનું લખાણ કદી બહાર જતું નથી. ફક્ત ગુણ, માપદંડ અને સમય જાય છે.
      નીચે recordFor() માં જે ખાનાં છે તે જ જાય છે — `answer` અને `q`
      જાણી જોઈને છોડી દીધાં છે.

   3. વિદ્યાર્થી «હા» કહે ત્યાં સુધી કંઈ મોકલાતું નથી. PB_URL ખાલી હોય
      તો આખી સુવિધા બંધ રહે અને એપ પહેલાં જેવી જ વર્તે.

   દરેક જવાબ સાથે `cid` (client id) જાય છે અને સર્વર પર (user, cid) unique
   છે. તેથી ઇન્ટરનેટ તૂટે અને કતાર ફરી મોકલાય તો પણ કંઈ બમણું થતું નથી.
*/
"use strict";

/* ⚙ સંસ્થાના સર્વરનું સરનામું. ખાલી હોય તો બૅકઅપની સુવિધા દેખાતી જ નથી.
   backend/README.md માં સર્વર ઊભું કરવાની રીત છે.
   ઉદાહરણ: "https://api.interviewprep.example"  (છેલ્લે સ્લૅશ નહીં) */
const PB_URL = "";

const Sync = (function () {

  const MAX_PER_FLUSH = 25;    // એક વારમાં આટલા જવાબ મોકલો, પછી થોભો
  const MAX_TRIES = 5;         // આટલી વાર નિષ્ફળ જાય તો એ જવાબ છોડી દો

  let pb = null;
  let flushing = false;
  let lastErr = "";
  let lastAt = 0;
  let listeners = [];

  function enabled() { return !!PB_URL && typeof PocketBase !== "undefined"; }

  function client() {
    if (!enabled()) return null;
    if (!pb) pb = new PocketBase(PB_URL);
    return pb;
  }

  function signedIn() {
    const c = client();
    return !!(c && c.authStore && c.authStore.isValid && c.authStore.record);
  }

  function me() {
    const c = client();
    return signedIn() ? c.authStore.record : null;
  }

  /* સંમતિ આપી છે? સર્વર પરના record માં consent_at ભરેલું હોય તો હા. */
  function consented() {
    const u = me();
    return !!(u && u.consent_at);
  }

  function onChange(fn) { listeners.push(fn); }
  function fire() { listeners.forEach(fn => { try { fn(status()); } catch (e) {} }); }

  /* ---------------- કતાર ---------------- */

  /* હજી ન મોકલાયેલા જવાબ, જૂનાથી નવા ક્રમમાં */
  function pending() {
    const out = [];
    Object.keys(state.courses).forEach(id => {
      const h = (state.courses[id] && state.courses[id].history) || [];
      h.forEach(e => {
        if (e.synced) return;
        if (!e.cid) return;                       // જૂના જવાબ — cid નથી, છોડી દો
        if ((e.syncTries || 0) >= MAX_TRIES) return;
        out.push(e);
      });
    });
    return out.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  }

  /* જૂના જવાબોમાં cid નથી, તેથી એ કદી મોકલાતા નથી — «આજથી આગળ» એ જ
     નક્કી કર્યું હતું. કેટલા એવા છે તે જાણવું ઉપયોગી છે. */
  function legacyCount() {
    let n = 0;
    Object.keys(state.courses).forEach(id => {
      const h = (state.courses[id] && state.courses[id].history) || [];
      h.forEach(e => { if (!e.cid && !e.synced) n++; });
    });
    return n;
  }

  function status() {
    return {
      enabled: enabled(),
      signedIn: signedIn(),
      consented: consented(),
      name: (me() || {}).name || "",
      pending: enabled() ? pending().length : 0,
      legacy: legacyCount(),
      online: navigator.onLine !== false,
      lastAt: lastAt,
      error: lastErr
    };
  }

  /* ---------------- સાઇન-ઇન ---------------- */

  function signIn() {
    const c = client();
    if (!c) return Promise.reject(new Error("sync-disabled"));
    // PocketBase પૉપ-અપ ખોલે, Google પર જાય, પછી ટોકન લઈને પાછું આવે
    return c.collection("users").authWithOAuth2({ provider: "google" })
      .then(() => { lastErr = ""; fire(); return me(); })
      .catch(err => { lastErr = errText(err); fire(); throw err; });
  }

  function signOut() {
    const c = client();
    if (c) c.authStore.clear();
    lastErr = "";
    fire();
  }

  /* સંમતિ નોંધો (કે પાછી ખેંચો). consent_at ખાલી હોય તો કંઈ મોકલાતું નથી. */
  function setConsent(yes) {
    const c = client();
    if (!signedIn()) return Promise.reject(new Error("not-signed-in"));
    return c.collection("users").update(me().id, {
      consent_at: yes ? new Date().toISOString() : null
    }).then(rec => {
      // authStore નું record તાજું કરો, નહીં તો consented() જૂનું વાંચે
      c.authStore.save(c.authStore.token, rec);
      lastErr = "";
      fire();
      if (yes) flush();
      return rec;
    }).catch(err => { lastErr = errText(err); fire(); throw err; });
  }

  /* ---------------- મોકલવું ---------------- */

  /* સર્વર પર જતું ખાનું-દીઠ ચિત્ર. જવાબનું લખાણ અહીં નથી — અને હોવું પણ
     ન જોઈએ; સર્વર પર એ માટે ખાનું જ નથી. */
  function recordFor(e, userId) {
    const sc = e.scores || {};
    const course = (typeof getCourse === "function" && getCourse(e.course)) || null;
    const num = v => (typeof v === "number" && isFinite(v)) ? Math.round(v * 10) / 10 : null;
    return {
      user: userId,
      cid: e.cid,
      course: e.course || "",
      category: e.cat || "",
      // સર્વર પર આ text છે — જૂના record માં આંકડો હોય તો પણ લખાણ બનાવીએ
      question: e.qid == null ? "" : String(e.qid),
      mode: course && course.mode === "technical" ? "technical" : "interview",
      overall: num(e.overall),
      communication: num(sc.communication),
      sentences: num(sc.sentences),
      thought: num(sc.thought),
      speech_grammar: num(sc.speechGrammar),
      accuracy: num(sc.accuracy),
      coherence: num(sc.coherence),
      words: typeof e.words === "number" ? e.words : null,
      coverage: typeof e.coverage === "number" ? e.coverage : null,
      secs: typeof e.secs === "number" ? e.secs : null,
      missed: Array.isArray(e.missed) ? e.missed : [],
      answered_at: new Date(e.ts || Date.now()).toISOString()
    };
  }

  /* સર્વર «આ cid તો પહેલેથી છે» કહે તો એ ભૂલ નથી — સફળતા છે. */
  function isDuplicate(err) {
    const d = err && err.response && err.response.data;
    if (d && d.cid && String(d.cid.code || "").indexOf("not_unique") >= 0) return true;
    // index સ્તરે પકડાય તો સંદેશમાં આવે છે
    return err && err.status === 400 && /unique/i.test(JSON.stringify(d || {}));
  }

  function errText(err) {
    if (!err) return "";
    if (err.status === 0 || !navigator.onLine) return "offline";
    return (err.status ? err.status + " " : "") + (err.message || "error");
  }

  /* કતાર ખાલી કરો. કદી throw કરતું નથી — એપ અટકવી ન જોઈએ. */
  function flush() {
    if (flushing || !enabled() || !signedIn() || !consented()) return Promise.resolve(status());
    if (navigator.onLine === false) return Promise.resolve(status());

    const list = pending().slice(0, MAX_PER_FLUSH);
    if (!list.length) return Promise.resolve(status());

    flushing = true;
    const userId = me().id;
    let dirty = false;

    // એક પછી એક — સંખ્યા નાની છે અને સર્વર પર ભાર ન આવે
    return list.reduce((chain, e) => chain.then(() => {
      return client().collection("progress").create(recordFor(e, userId))
        .then(() => { e.synced = true; dirty = true; })
        .catch(err => {
          if (isDuplicate(err)) { e.synced = true; dirty = true; return; }
          e.syncTries = (e.syncTries || 0) + 1;
          lastErr = errText(err);
          dirty = true;
          // ઇન્ટરનેટની ભૂલ હોય તો બાકીના પર સમય ન બગાડો
          if (lastErr === "offline") throw err;
        });
    }), Promise.resolve())
      .catch(() => {})                    // ઓફલાઇન — બાકીનું આવતી વાર
      .then(() => {
        if (dirty) { lastAt = Date.now(); save(); }
        flushing = false;
        fire();
        return status();
      });
  }

  /* સર્વર પરથી પોતાની બધી પ્રગતિ ભૂંસો. ફોનનો સંગ્રહ અલગથી ભૂંસાય છે. */
  function eraseRemote() {
    const c = client();
    if (!signedIn()) return Promise.reject(new Error("not-signed-in"));
    return c.collection("progress")
      .getFullList({ filter: 'user = "' + me().id + '"', fields: "id", batch: 200 })
      .then(rows => rows.reduce((chain, r) =>
        chain.then(() => c.collection("progress").delete(r.id)), Promise.resolve())
        .then(() => rows.length))
      .then(n => {
        // ફોન પરની નિશાની પણ ઉતારો, જેથી ફરી «હા» કહે તો ફરી મોકલાય
        Object.keys(state.courses).forEach(id => {
          ((state.courses[id] || {}).history || []).forEach(e => {
            delete e.synced; delete e.syncTries;
          });
        });
        save();
        lastErr = "";
        fire();
        return n;
      })
      .catch(err => { lastErr = errText(err); fire(); throw err; });
  }

  /* ઇન્ટરનેટ પાછું આવે એટલે જાતે પ્રયત્ન કરો */
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => { lastErr = ""; flush(); });
    window.addEventListener("offline", fire);
  }

  return {
    enabled, signedIn, consented, me, status, onChange,
    signIn, signOut, setConsent, flush, eraseRemote,
    // તપાસ માટે બહાર રાખ્યાં
    recordFor, pending, isDuplicate, PB_URL
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { Sync };
