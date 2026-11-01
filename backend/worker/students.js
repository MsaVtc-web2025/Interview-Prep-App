/* Students and their access codes, for the Interview Prep Worker.
 *
 * MSA-VTC gives each student an access code. The app sends it once to /access;
 * this file checks it against the students table in Supabase and hands back a
 * signed token. Every later call - AI marking, dictation, sending scores - must
 * carry that token, and it stops working the moment the institute turns the
 * student off, deletes them, or changes their code.
 *
 *   /access    {code, device, first, last, mobile} -> {token, student}
 *   /me        (token)                -> {student}           is this phone still allowed?
 *   /progress  (token) {quiz, interview} -> {ok}             scores into Supabase
 *
 * All of it is off until SUPABASE_URL, SUPABASE_SERVICE_KEY and ACCESS_SECRET
 * are set; until then the Worker behaves exactly as before. The service key
 * bypasses row-level security, so it lives here as a secret and nowhere else.
 * No answer text arrives here and none is stored.
 */

const FIELDS = "id,name,trade,batch,active,expires_on,code_changed_at,daily_ai_limit";
const CACHE_MS = 60000;          // a code change reaches running phones within a minute
const MAX_ROWS = 100;            // per /progress call, of each kind
const TRIES_PER_10_MIN = 20;     // wrong codes per IP, per Worker instance

export function accessOn(env) {
  return !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY && env.ACCESS_SECRET);
}

/* "ab cd-ef 12" -> "ABCDEF12". Codes are shown in groups of four to be read
   out and typed, and stored without the dash. */
export function normCode(s) {
  return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function istToday() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

/* The student's own details from the code screen. Names in any script, up to
   40 letters each; an Indian mobile number of 10 digits, with or without +91
   or a leading 0. Returns the cleaned details, or the field that is wrong. */
export function cleanDetails(b) {
  const name = v => String(v || "").replace(/\s+/g, " ").trim().slice(0, 40);
  const first = name(b.first), last = name(b.last);
  let mobile = String(b.mobile || "").replace(/\D/g, "");
  if (mobile.length === 12 && mobile.indexOf("91") === 0) mobile = mobile.slice(2);
  else if (mobile.length === 11 && mobile[0] === "0") mobile = mobile.slice(1);
  if (!first) return { error: "need_first" };
  if (!last) return { error: "need_last" };
  if (!/^[6-9]\d{9}$/.test(mobile)) return { error: "bad_mobile" };
  return { first, last, mobile };
}

/* ---- Supabase (PostgREST) -------------------------------------------- */

function sb(env, path, init) {
  const key = env.SUPABASE_SERVICE_KEY;
  // A new-style secret key (sb_secret_...) goes in apikey only; a legacy
  // service_role key is a JWT and is sent in both, as Supabase's own client does
  const h = { apikey: key, "Content-Type": "application/json" };
  if (!/^sb_/.test(key)) h.Authorization = "Bearer " + key;
  init = init || {};
  return fetch(env.SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/" + path,
    Object.assign({}, init, { headers: Object.assign(h, init.headers || {}) }));
}

async function rows(res) {
  if (!res.ok) throw new Error("supabase_" + res.status);
  return res.json();
}

/* ---- Tokens ----------------------------------------------------------
   base64url(JSON {s: student id, v: when the code last changed, d: device,
   t: issued}) + "." + HMAC-SHA256 of that, keyed with ACCESS_SECRET. Not a
   secret itself - it only proves this Worker issued it. `v` is what makes a
   code change lock out every phone that used the old code. */

const enc = new TextEncoder();

function b64u(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64u(s) {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

async function hmac(secret, data) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64u(new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(data))));
}

function sameText(a, b) {                     // compare without leaking where they differ
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function makeToken(env, st, device) {
  const body = b64u(enc.encode(JSON.stringify({
    s: st.id, v: Date.parse(st.code_changed_at), d: device, t: Date.now()
  })));
  return body + "." + await hmac(env.ACCESS_SECRET, body);
}

async function readToken(env, tok) {
  const parts = String(tok || "").split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  if (!sameText(await hmac(env.ACCESS_SECRET, parts[0]), parts[1])) return null;
  try { return JSON.parse(new TextDecoder().decode(unb64u(parts[0]))); } catch (e) { return null; }
}

/* ---- Who is this? ---------------------------------------------------- */

const cache = new Map();                      // student id -> {at, st}

async function studentById(env, id) {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.st;
  const list = await rows(await sb(env, "students?id=eq." + encodeURIComponent(id) + "&select=" + FIELDS));
  const st = list[0] || null;
  cache.set(id, { at: Date.now(), st: st });
  return st;
}

/* Why this student may not use the app right now, or "" */
function refusal(st) {
  if (!st) return "bad_code";
  if (!st.active) return "inactive";
  if (st.expires_on && st.expires_on < istToday()) return "expired";
  return "";
}

function publicStudent(st) {
  return { id: st.id, name: st.name, trade: st.trade, batch: st.batch };
}

/* The student behind this request's token, or why not. A 401 tells the app
   to ask for a code again; a 503 means Supabase could not be reached, and
   the app keeps working offline instead. */
export async function requireStudent(request, env) {
  const tok = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const p = tok ? await readToken(env, tok) : null;
  if (!p || !p.s) return { ok: false, status: 401, error: "no_access" };
  let st;
  try { st = await studentById(env, p.s); }
  catch (e) { return { ok: false, status: 503, error: "access_unavailable" }; }
  if (!st) return { ok: false, status: 401, error: "removed" };
  const why = refusal(st);
  if (why) return { ok: false, status: 401, error: why };
  if (Date.parse(st.code_changed_at) !== p.v) return { ok: false, status: 401, error: "code_changed" };
  return { ok: true, student: st, device: String(p.d || "") };
}

/* Count one AI call; false once the student is over today's limit */
export async function withinDailyLimit(env, st) {
  try {
    const res = await sb(env, "rpc/bump_ai_usage", { method: "POST", body: JSON.stringify({ sid: st.id }) });
    const n = await rows(res);
    return Number(n) <= st.daily_ai_limit;
  } catch (e) {
    return true;            // never block marking because the counter failed
  }
}

/* Remember the phone and when the student was last seen. Not awaited by the
   caller's answer - ctx.waitUntil finishes it after the response. */
function touch(env, st, device, ua) {
  const now = new Date().toISOString();
  const jobs = [
    sb(env, "students?id=eq." + st.id, {
      method: "PATCH", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ last_seen_at: now })
    })
  ];
  if (device) {
    jobs.push(sb(env, "devices?on_conflict=student_id,device_id", {
      method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ student_id: st.id, device_id: device, last_seen_at: now, user_agent: String(ua || "").slice(0, 200) })
    }));
  }
  return Promise.all(jobs).catch(() => {});
}

/* ---- Wrong-code throttle --------------------------------------------- */

const tries = new Map();                      // ip -> {from, n}

function throttled(ip) {
  const now = Date.now();
  const t = tries.get(ip);
  if (!t || now - t.from > 600000) { tries.set(ip, { from: now, n: 0 }); return false; }
  return t.n >= TRIES_PER_10_MIN;
}
function missed(ip) { const t = tries.get(ip); if (t) t.n++; }

/* ---- Sanitising what the phone sends --------------------------------- */

const str = (v, n) => String(v == null ? "" : v).slice(0, n);
const int = (v, lo, hi) => { const x = Math.round(Number(v)); return isFinite(x) ? Math.min(hi, Math.max(lo, x)) : null; };
const score = v => { const x = Number(v); return isFinite(x) ? Math.round(Math.min(10, Math.max(0, x)) * 10) / 10 : null; };
const when = v => { const d = new Date(v); return isNaN(d) ? new Date().toISOString() : d.toISOString(); };

function quizRow(sid, q) {
  const total = int(q.total, 1, 1000);
  if (!q || !q.cid || !q.course || !q.chapter || !total) return null;
  return {
    student_id: sid, client_id: str(q.cid, 64), course: str(q.course, 40),
    chapter_id: str(q.chapter, 40), chapter_no: str(q.no, 10), chapter_title: str(q.title, 200),
    total: total, answered: int(q.answered, 0, total) || 0,
    right_n: int(q.right, 0, total) || 0, partial_n: int(q.partial, 0, total) || 0,
    wrong_n: int(q.wrong, 0, total) || 0, skipped_n: int(q.skipped, 0, total) || 0,
    pct: int(q.pct, 0, 100) || 0, lang: str(q.lang, 5), finished_at: when(q.at)
  };
}

function interviewRow(sid, e) {
  if (!e || !e.cid || !e.course) return null;
  const sc = e.scores || {};
  return {
    student_id: sid, client_id: str(e.cid, 64), course: str(e.course, 40),
    round_id: str(e.round, 64), category: str(e.cat, 60), question_id: str(e.qid, 40),
    mode: e.mode === "technical" ? "technical" : "interview",
    overall: score(e.overall), communication: score(sc.communication), sentences: score(sc.sentences),
    thought: score(sc.thought), speech_grammar: score(sc.speechGrammar), accuracy: score(sc.accuracy),
    coherence: score(sc.coherence), words: int(e.words, 0, 100000), secs: int(e.secs, 0, 100000),
    by_ai: !!e.byAi, answered_at: when(e.at)
  };
}

async function insert(env, table, list) {
  if (!list.length) return 0;
  const res = await sb(env, table + "?on_conflict=student_id,client_id", {
    method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(list)
  });
  if (!res.ok) throw new Error("supabase_" + res.status);
  return list.length;
}

/* ---- The three routes ------------------------------------------------ */

export async function studentRoute(path, request, env, ctx, head, json) {
  if (!accessOn(env)) return json({ error: "access_off" }, 404, head);

  let body = {};
  try {
    const raw = await request.text();
    if (raw.length > 200000) return json({ error: "too_large" }, 413, head);
    body = raw ? JSON.parse(raw) : {};
  } catch (e) {
    return json({ error: "bad_json" }, 400, head);
  }
  const ua = request.headers.get("User-Agent") || "";
  const later = p => { if (ctx && ctx.waitUntil) ctx.waitUntil(p); };

  if (path.endsWith("/access")) {
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (throttled(ip)) return json({ error: "too_many_tries" }, 429, head);
    const code = normCode(body.code);
    const device = str(body.device, 64);
    const me = cleanDetails(body);
    if (me.error) return json({ error: me.error }, 400, head);
    if (!/^[A-Z0-9]{6,16}$/.test(code) || device.length < 8) { missed(ip); return json({ error: "bad_code" }, 401, head); }

    let st;
    try { st = (await rows(await sb(env, "students?code=eq." + code + "&select=" + FIELDS)))[0] || null; }
    catch (e) { return json({ error: "access_unavailable" }, 503, head); }
    const why = refusal(st);
    if (why) { if (why === "bad_code") missed(ip); return json({ error: why }, 401, head); }

    // What the student typed is kept next to the name the institute entered
    try {
      const res = await sb(env, "students?id=eq." + st.id, {
        method: "PATCH", headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ first_name: me.first, last_name: me.last, mobile: me.mobile, details_at: new Date().toISOString() })
      });
      if (!res.ok) throw new Error("supabase_" + res.status);
    } catch (e) {
      return json({ error: "access_unavailable" }, 503, head);
    }

    cache.set(st.id, { at: Date.now(), st: st });
    later(touch(env, st, device, ua));
    const out = publicStudent(st);
    out.name = me.first + " " + me.last;
    return json({ token: await makeToken(env, st, device), student: out }, 200, head);
  }

  const who = await requireStudent(request, env);
  if (!who.ok) return json({ error: who.error }, who.status, head);

  if (path.endsWith("/me")) {
    later(touch(env, who.student, who.device, ua));
    return json({ student: publicStudent(who.student) }, 200, head);
  }

  // /progress
  const sid = who.student.id;
  const quiz = (Array.isArray(body.quiz) ? body.quiz : []).slice(0, MAX_ROWS).map(q => quizRow(sid, q)).filter(Boolean);
  const intv = (Array.isArray(body.interview) ? body.interview : []).slice(0, MAX_ROWS).map(e => interviewRow(sid, e)).filter(Boolean);
  try {
    await insert(env, "quiz_attempts", quiz);
    await insert(env, "interview_answers", intv);
  } catch (e) {
    return json({ error: "save_failed" }, 503, head);
  }
  later(touch(env, who.student, who.device, ua));
  return json({ ok: true, quiz: quiz.length, interview: intv.length }, 200, head);
}
