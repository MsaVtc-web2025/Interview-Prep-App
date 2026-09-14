/* Progress backup — sending the phone's progress to the organisation's server.

   Three rules, never to be broken:

   1. The app is offline first. No server, no internet, not signed in, no consent
      given — the app must still work completely. The phone's storage is the real
      storage; the server holds a copy of it, not the other way round.

   2. Answer text never leaves the phone. Only scores, criteria and timings go.
      Only the fields in recordFor() below are sent — `answer` and `q` are left
      out deliberately.

   3. Nothing is sent until the student says yes. If PB_URL is empty the whole
      feature stays off and the app behaves exactly as it did before.

   Every answer carries a `cid` (client id), and (user, cid) is unique on the
   server. So nothing is duplicated even if the connection drops and the queue
   is sent again.
*/
"use strict";

/* The organisation's server address. Leave it empty and the backup feature
   does not appear at all. backend/README.md explains how to stand the server up.
   Example: "https://api.interviewprep.example"  (no trailing slash) */
const PB_URL = "";

const Sync = (function () {

  const MAX_PER_FLUSH = 25;    // send this many answers per round, then pause
  const MAX_TRIES = 5;         // give up on an answer after this many failures

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

  /* Has consent been given? Yes if consent_at is set on the server record. */
  function consented() {
    const u = me();
    return !!(u && u.consent_at);
  }

  function onChange(fn) { listeners.push(fn); }
  function fire() { listeners.forEach(fn => { try { fn(status()); } catch (e) {} }); }

  /* ---------------- The queue ---------------- */

  /* Answers not yet sent, oldest first */
  function pending() {
    const out = [];
    Object.keys(state.courses).forEach(id => {
      const h = (state.courses[id] && state.courses[id].history) || [];
      h.forEach(e => {
        if (e.synced) return;
        if (!e.cid) return;                       // old answers have no cid — skip them
        if ((e.syncTries || 0) >= MAX_TRIES) return;
        out.push(e);
      });
    });
    return out.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  }

  /* Older answers have no cid, so they are never sent — "from today onwards"
     was the decision. It is still useful to know how many there are. */
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

  /* ---------------- Sign-in ---------------- */

  function signIn() {
    const c = client();
    if (!c) return Promise.reject(new Error("sync-disabled"));
    // PocketBase opens a popup, goes to Google, and comes back with a token
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

  /* Record consent (or withdraw it). Nothing is sent while consent_at is empty. */
  function setConsent(yes) {
    const c = client();
    if (!signedIn()) return Promise.reject(new Error("not-signed-in"));
    return c.collection("users").update(me().id, {
      consent_at: yes ? new Date().toISOString() : null
    }).then(rec => {
      // Refresh the authStore record, otherwise consented() reads a stale value
      c.authStore.save(c.authStore.token, rec);
      lastErr = "";
      fire();
      if (yes) flush();
      return rec;
    }).catch(err => { lastErr = errText(err); fire(); throw err; });
  }

  /* ---------------- Sending ---------------- */

  /* The field-by-field shape sent to the server. The answer text is not here —
     and must not be; there is no column for it on the server either. */
  function recordFor(e, userId) {
    const sc = e.scores || {};
    const course = (typeof getCourse === "function" && getCourse(e.course)) || null;
    const num = v => (typeof v === "number" && isFinite(v)) ? Math.round(v * 10) / 10 : null;
    return {
      user: userId,
      cid: e.cid,
      course: e.course || "",
      category: e.cat || "",
      // This is text on the server — coerce it even if an old record holds a number
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

  /* "That cid already exists" from the server is not a failure — it is success. */
  function isDuplicate(err) {
    const d = err && err.response && err.response.data;
    if (d && d.cid && String(d.cid.code || "").indexOf("not_unique") >= 0) return true;
    // When the index catches it, it shows up in the message instead
    return err && err.status === 400 && /unique/i.test(JSON.stringify(d || {}));
  }

  function errText(err) {
    if (!err) return "";
    if (err.status === 0 || !navigator.onLine) return "offline";
    return (err.status ? err.status + " " : "") + (err.message || "error");
  }

  /* Drain the queue. Never throws — the app must not stall. */
  function flush() {
    if (flushing || !enabled() || !signedIn() || !consented()) return Promise.resolve(status());
    if (navigator.onLine === false) return Promise.resolve(status());

    const list = pending().slice(0, MAX_PER_FLUSH);
    if (!list.length) return Promise.resolve(status());

    flushing = true;
    const userId = me().id;
    let dirty = false;

    // One at a time — the counts are small and it keeps load off the server
    return list.reduce((chain, e) => chain.then(() => {
      return client().collection("progress").create(recordFor(e, userId))
        .then(() => { e.synced = true; dirty = true; })
        .catch(err => {
          if (isDuplicate(err)) { e.synced = true; dirty = true; return; }
          e.syncTries = (e.syncTries || 0) + 1;
          lastErr = errText(err);
          dirty = true;
          // On a connection error, do not waste time on the rest
          if (lastErr === "offline") throw err;
        });
    }), Promise.resolve())
      .catch(() => {})                    // offline — the rest goes next time
      .then(() => {
        if (dirty) { lastAt = Date.now(); save(); }
        flushing = false;
        fire();
        return status();
      });
  }

  /* Erase all of your own progress from the server. Phone storage is cleared separately. */
  function eraseRemote() {
    const c = client();
    if (!signedIn()) return Promise.reject(new Error("not-signed-in"));
    return c.collection("progress")
      .getFullList({ filter: 'user = "' + me().id + '"', fields: "id", batch: 200 })
      .then(rows => rows.reduce((chain, r) =>
        chain.then(() => c.collection("progress").delete(r.id)), Promise.resolve())
        .then(() => rows.length))
      .then(n => {
        // Clear the phone-side markers too, so saying yes again re-sends everything
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

  /* Retry automatically as soon as the connection comes back */
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => { lastErr = ""; flush(); });
    window.addEventListener("offline", fire);
  }

  return {
    enabled, signedIn, consented, me, status, onChange,
    signIn, signOut, setConsent, flush, eraseRemote,
    // exposed for tests
    recordFor, pending, isDuplicate, PB_URL
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { Sync };
