/* Access codes - only students MSA-VTC has enrolled can use the app.

   The institute gives each student a code (admin.html). It is typed once on a
   phone; the Worker checks it and hands back a token, which the phone keeps.
   Every AI mark, every dictation and every score sent carries that token, and
   the Worker refuses it once the institute turns the student off, deletes
   them or changes their code. The next time the phone is online it is then
   asked for a code again.

   Offline first still holds: a phone that has been let in works without
   internet. Only the first time on a phone needs internet.

   What leaves the phone (rows below): the scores, right/partial/wrong counts,
   chapter, question number, time taken and date. Never the answer text.

   With ACCESS_URL empty no code is asked and nothing is sent - the app is
   exactly as it was. backend/supabase/README.md says when to fill it in. */
"use strict";

/* The Worker. Leave empty until Supabase and the Worker's secrets are set up.
   Example: "https://interview-judge.msa-vtc.workers.dev"  (no trailing slash) */
const ACCESS_URL = "https://interview-judge.msa-vtc.workers.dev";

const Access = (function () {

  const KEY = "ip.access.v1";          // {token, student, checkedAt}, or {open, checkedAt}
  const DEVICE_KEY = "ip.device.v1";   // a random id for this phone
  const ME_KEY = "ip.me.v1";           // {first, last, mobile} last typed, to fill the boxes again
  const RECHECK_MS = 6 * 3600 * 1000;  // ask the Worker "still allowed?" at most this often
  const BATCH = 50;                    // results per /progress call

  let mem;                             // undefined = not read from storage yet
  let sending = false;
  let lockHandler = null;

  /* ---------------- Who is signed in ---------------- */

  function cur() {
    if (mem === undefined) {
      try { mem = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { mem = null; }
    }
    return mem;
  }

  function write(v) {
    mem = v;
    try {
      if (v) localStorage.setItem(KEY, JSON.stringify(v));
      else localStorage.removeItem(KEY);
    } catch (e) {}
  }

  function enabled() { return !!ACCESS_URL; }

  /* May this phone use the app? Always, when access codes are off - here
     (ACCESS_URL empty) or at the Worker (open: it said so, see probe). */
  function allowed() { return !enabled() || !!(cur() && (cur().token || cur().open)); }

  function student() { const c = cur(); return (c && c.student) || null; }
  function sid() { const s = student(); return (s && s.id) || ""; }

  function device() {
    let d = "";
    try { d = localStorage.getItem(DEVICE_KEY) || ""; } catch (e) {}
    if (!d) {
      const a = new Uint8Array(12);
      crypto.getRandomValues(a);
      d = "d-" + Array.from(a, b => b.toString(16).padStart(2, "0")).join("");
      try { localStorage.setItem(DEVICE_KEY, d); } catch (e) {}
    }
    return d;
  }

  /* Headers for any call to the Worker - judge.js and dictation.js use these */
  function headers() {
    const h = { "Content-Type": "application/json" };
    const c = cur();
    if (enabled() && c && c.token) h.Authorization = "Bearer " + c.token;
    return h;
  }

  /* Look at a Worker reply. A 401 means this phone is no longer allowed: the
     code was changed or turned off, or the student was removed. Anything else
     (offline, the server busy) changes nothing - the phone keeps working. */
  function seen(res) {
    if (enabled() && res && res.status === 401 && cur()) {
      // A phone let in while codes were off is simply asked for one - no warning
      const wasOpen = !!cur().open;
      res.clone().json().catch(() => ({})).then(j => lock(wasOpen ? "" : (j && j.error) || "no_access"));
    }
    return res;
  }

  function lock(why) {
    if (!cur()) return;
    write(null);
    if (lockHandler) { try { lockHandler(why); } catch (e) {} }
  }

  function onLocked(fn) { lockHandler = fn; }

  function post(path, body) {
    return fetch(ACCESS_URL + path, { method: "POST", headers: headers(), body: JSON.stringify(body || {}) });
  }

  /* The student's own details, checked the way the Worker checks them (any
     script for names; an Indian mobile, +91 or a leading 0 allowed). Returns
     the cleaned details, or {error} naming the box that is wrong. */
  function cleanDetails(d) {
    const name = v => String(v || "").replace(/\s+/g, " ").trim().slice(0, 40);
    const first = name(d.first), last = name(d.last);
    let mobile = String(d.mobile || "").replace(/\D/g, "");
    if (mobile.length === 12 && mobile.indexOf("91") === 0) mobile = mobile.slice(2);
    else if (mobile.length === 11 && mobile[0] === "0") mobile = mobile.slice(1);
    if (!first) return { error: "need_first" };
    if (!last) return { error: "need_last" };
    if (!/^[6-9]\d{9}$/.test(mobile)) return { error: "bad_mobile" };
    return { first, last, mobile };
  }

  /* What was typed last time on this phone - the boxes are filled with it
     when the code screen comes back (after a code change, say) */
  function lastDetails() {
    try { return JSON.parse(localStorage.getItem(ME_KEY) || "null") || {}; } catch (e) { return {}; }
  }

  /* Enter a code with the student's details. Resolves {ok:true, student, me}
     or {ok:false, error}. */
  function enter(code, details) {
    const me = cleanDetails(details || {});
    if (me.error) return Promise.resolve({ ok: false, error: me.error });
    const clean = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean) return Promise.resolve({ ok: false, error: "empty" });
    if (navigator.onLine === false) return Promise.resolve({ ok: false, error: "offline" });
    write(null);
    return post("/access", { code: clean, device: device(), first: me.first, last: me.last, mobile: me.mobile })
      .then(res => res.json().catch(() => ({})).then(j => {
        if (res.ok && j && j.token && j.student) {
          write({ token: j.token, student: j.student, checkedAt: Date.now() });
          try { localStorage.setItem(ME_KEY, JSON.stringify(me)); } catch (e) {}
          return { ok: true, student: j.student, me: me };
        }
        return { ok: false, error: (j && j.error) || (res.status >= 500 ? "server" : "bad_code") };
      }))
      .catch(() => ({ ok: false, error: "offline" }));
  }

  /* No code yet: does the Worker ask for codes at all? Until its Supabase
     secrets are set it answers 404 access_off, and the phone is let in as
     before - so switching ACCESS_URL on can never lock everyone out. Resolves
     true when the phone was let in this way. */
  function probe() {
    const c = cur();
    if (!enabled() || (c && c.token) || navigator.onLine === false) return Promise.resolve(false);
    return post("/me").then(res => {
      if (res.status !== 404) return false;
      write({ open: true, checkedAt: Date.now() });
      return true;
    }).catch(() => false);
  }

  /* Still allowed? Asked when the app opens, online, at most every RECHECK_MS.
     A phone let in while codes were off asks every time it opens, so it is
     asked for a code soon after the institute switches them on. */
  function recheck(force) {
    const c = cur();
    if (!enabled() || !c || navigator.onLine === false) return Promise.resolve();
    if (!force && !c.open && Date.now() - (c.checkedAt || 0) < RECHECK_MS) return Promise.resolve();
    return post("/me").then(seen).then(res => {
      if (!res.ok) return;
      return res.json().then(j => {
        const now = cur();
        if (now && j && j.student) write(Object.assign({}, now, { student: j.student, checkedAt: Date.now() }));
      });
    }).catch(() => {});
  }

  /* forget: also forget the name and mobile typed on this phone (switching student) */
  function signOut(forget) {
    write(null);
    if (forget) { try { localStorage.removeItem(ME_KEY); } catch (e) {} }
  }

  /* ---------------- Sending results ----------------
     Each result is stamped with the student who earned it (sid) when it is
     saved, and only ever sent for that student - so a phone handed from one
     student to another never files one student's marks under the other. */

  function interviewPending() {
    const me = sid(), out = [];
    Object.keys(state.courses || {}).forEach(id => {
      ((state.courses[id] && state.courses[id].history) || []).forEach(e => {
        if (e.cid && e.sid && e.sid === me && !e.sent) out.push(e);
      });
    });
    return out.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  }

  function quizPending() {
    const me = sid();
    return (state.quizLog || []).filter(x => x.sid && x.sid === me && !x.sent);
  }

  function unsent() { return enabled() && sid() ? interviewPending().length + quizPending().length : 0; }

  // Field by field what is sent. `answer` and `q` stay on the phone.
  function interviewRow(e) {
    const c = typeof getCourse === "function" ? getCourse(e.course) : null;
    return {
      cid: e.cid, course: e.course, round: e.rid || "", cat: e.cat || "", qid: e.qid || "",
      mode: c && c.mode === "technical" ? "technical" : "interview",
      overall: e.overall, scores: e.scores || {}, words: e.words, secs: e.secs,
      byAi: !!e.byAi, at: e.ts
    };
  }

  function quizRow(x) {
    return {
      cid: x.cid, course: x.course, chapter: x.chapter, no: x.no, title: x.title,
      total: x.total, answered: x.answered, right: x.right, partial: x.partial,
      wrong: x.wrong, skipped: x.skipped, pct: x.pct, lang: x.lang, at: x.ts
    };
  }

  /* Keep the quiz log short: everything unsent, and the last 50 sent */
  function prune() {
    const log = state.quizLog || [];
    if (log.length <= 200) return;
    const sent = log.filter(x => x.sent).slice(-50);
    state.quizLog = log.filter(x => !x.sent).concat(sent).sort((a, b) => a.ts - b.ts);
  }

  /* Send whatever has not reached the institute yet. Never rejects; resolves
     true when nothing is left to send. */
  function flush() {
    if (!enabled() || sending || !sid() || navigator.onLine === false) return Promise.resolve(!unsent());
    const iv = interviewPending().slice(0, BATCH);
    const qz = quizPending().slice(0, BATCH);
    if (!iv.length && !qz.length) return Promise.resolve(true);

    sending = true;
    return post("/progress", { quiz: qz.map(quizRow), interview: iv.map(interviewRow) })
      .then(seen)
      .then(res => {
        if (!res.ok) return false;
        iv.forEach(e => { e.sent = true; });
        qz.forEach(x => { x.sent = true; });
        prune();
        save();
        return true;
      })
      .catch(() => false)
      .then(ok => {
        sending = false;
        if (ok && unsent()) return flush();     // more than one batch waiting
        return !unsent();
      });
  }

  if (typeof window !== "undefined") window.addEventListener("online", () => { flush(); });

  return {
    enabled, allowed, student, sid, device, headers, seen, onLocked,
    enter, probe, recheck, signOut, flush, unsent, lastDetails, cleanDetails,
    // exposed for tests
    interviewRow, quizRow, ACCESS_URL
  };
})();

/* For judge.js and dictation.js: the token on every call to the Worker, and
   a refused one noticed */
function workerHeaders() { return Access.headers(); }
function workerSeen(res) { return Access.seen(res); }

if (typeof module !== "undefined" && module.exports) module.exports = { Access, workerHeaders, workerSeen };
