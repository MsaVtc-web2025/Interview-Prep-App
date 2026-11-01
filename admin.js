/* Student admin - MSA-VTC (Muniseva Ashram Vocational Training Centre).

   Who can use the student app, and how they are doing:
   - add students one at a time or a whole batch, each with an access code
   - change a code (every phone on the old code is signed out), turn a student
     off or on, set when access ends, delete them with all their results
   - each student's chapter quiz attempts and scores, chapter by chapter, and
     their interview practice; the phones their code was used on
   - download any of it as CSV for Excel or Google Sheets

   Everything goes straight to Supabase with the public anon key and the
   signed-in admin's session. That key alone can read nothing: row-level
   security (backend/supabase/schema.sql) opens the tables only to accounts
   listed in public.admins. */
"use strict";

/* From Supabase: Project Settings -> API. The anon / publishable key is meant
   to be public; it is the database's row-level security that protects the data.
   Never put the service_role / secret key here. */
const SUPABASE_URL = "https://qbglwycguewtarvijlfj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZ2x3eWNndWV3dGFydmlqbGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0OTg0MjYsImV4cCI6MjEwOTA3NDQyNn0.KQj-UF7QBCZRoejWaajpfLxkWjJpsdqaNydjoBJsFVA";

/* The app's courses (bank-*.js) - the trade a student is enrolled in */
const TRADES = [
  ["cnc", "CNC Machining"], ["nursing", "Nursing"], ["electrician", "Electrician"],
  ["automotive", "Automobile"], ["evehicle", "E-Vehicle"], ["welding", "Welding"],
  ["computer", "Computer"], ["interview", "Interview (General)"]
];
const TRADE_NAME = Object.fromEntries(TRADES);

/* No 0/O, 1/I/L - a code is read out and typed on a phone */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

const Admin = (function () {

  const $ = id => document.getElementById(id);
  let sb = null;
  let students = [];
  let openId = null;
  let lastCodes = [];          // the codes in the "New codes" dialog

  /* ---------------- Small helpers ---------------- */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function newCode() {
    const a = new Uint32Array(8);
    crypto.getRandomValues(a);
    return Array.from(a, n => ALPHABET[n % ALPHABET.length]).join("");
  }

  const showCode = c => c ? String(c).replace(/^(.{4})(.+)$/, "$1-$2") : "—";

  function istToday() {
    return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
  }

  function status(st) {
    if (!st.active) return "off";
    if (st.expires_on && st.expires_on < istToday()) return "exp";
    return "on";
  }
  const STATUS_TEXT = { on: "Active", off: "Turned off", exp: "Expired" };

  /* The name the student typed on their phone, if they have signed in */
  const selfName = s => [s.first_name, s.last_name].filter(Boolean).join(" ");

  /* Typed a name that is not the one the institute entered? Usually a typo -
     sometimes a code passed to someone else. */
  const nameDiffers = s => {
    const n = v => String(v || "").toLowerCase().replace(/\s+/g, " ").trim();
    return !!selfName(s) && n(selfName(s)) !== n(s.name);
  };

  function when(t, withTime) {
    if (!t) return "—";
    const d = new Date(t);
    const o = { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" };
    if (withTime) { o.hour = "2-digit"; o.minute = "2-digit"; }
    return d.toLocaleString("en-IN", o);
  }

  function pct(v) {
    if (v == null) return '<span class="muted">—</span>';
    const n = Math.round(Number(v));
    return '<span class="pct ' + (n >= 70 ? "hi" : n >= 40 ? "mid" : "lo") + '">' + n + "%</span>";
  }

  function score(v) {
    if (v == null) return '<span class="muted">—</span>';
    const n = Number(v);
    return '<span class="pct ' + (n >= 7 ? "hi" : n >= 4 ? "mid" : "lo") + '">' + n.toFixed(1) + "</span>";
  }

  function phoneName(ua) {
    ua = String(ua || "");
    const a = ua.match(/Android [\d.]+/), i = /iPhone|iPad/.test(ua);
    const b = /Edg\//.test(ua) ? "Edge" : /SamsungBrowser/.test(ua) ? "Samsung Internet"
      : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
    return [a ? a[0] : i ? "iPhone" : /Windows/.test(ua) ? "Windows" : "", b].filter(Boolean).join(" · ") || "—";
  }

  let toastTimer = null;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
  }

  function fail(err) {
    console.error(err);
    toast("Could not save: " + ((err && (err.message || err.error_description)) || "error"));
  }

  /* A confirmation in place of confirm() - says exactly what will happen */
  function ask(title, body, yes, danger) {
    return new Promise(resolve => {
      $("askT").textContent = title;
      $("askB").textContent = body;
      $("askYes").textContent = yes;
      $("askYes").className = danger ? "danger" : "pri";
      $("askDlg").hidden = false;
      $("askNo").focus();
      const done = v => { $("askDlg").hidden = true; $("askYes").onclick = $("askNo").onclick = null; resolve(v); };
      $("askYes").onclick = () => done(true);
      $("askNo").onclick = () => done(false);
    });
  }

  function csv(rows) {
    const cell = v => {
      const s = String(v == null ? "" : v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    return "﻿" + rows.map(r => r.map(cell).join(",")).join("\r\n");   // BOM: Excel reads Gujarati
  }

  function download(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function tradeOptions(sel, withAll) {
    sel.innerHTML = (withAll ? '<option value="">All</option>' : "") +
      TRADES.map(t => '<option value="' + t[0] + '">' + esc(t[1]) + "</option>").join("");
  }

  /* Insert or update with a fresh code; a clash with an existing code (very
     unlikely) is retried with another */
  async function withNewCode(run) {
    for (let i = 0; i < 5; i++) {
      const code = newCode();
      const { data, error } = await run(code);
      if (!error) return { data, code };
      if (error.code !== "23505") throw error;
    }
    throw new Error("Could not make a unique code - try again");
  }

  /* ---------------- Screens ---------------- */

  function view(name) {
    ["vSetup", "vLogin", "vMain"].forEach(v => { $(v).hidden = v !== name; });
  }

  async function start(client) {
    sb = client;
    const { data } = await sb.auth.getSession();
    if (data && data.session) return enter(data.session);
    view("vLogin");
    $("email").focus();
  }

  async function signIn(ev) {
    ev.preventDefault();
    $("loginMsg").hidden = true;
    $("btnIn").disabled = true;
    const { data, error } = await sb.auth.signInWithPassword({ email: $("email").value.trim(), password: $("pass").value });
    $("btnIn").disabled = false;
    if (error) {
      $("loginMsg").textContent = "Wrong email or password.";
      $("loginMsg").hidden = false;
      return;
    }
    $("pass").value = "";
    enter(data.session);
  }

  async function enter(session) {
    const { data: ok, error } = await sb.rpc("is_admin");
    if (error || !ok) {
      await sb.auth.signOut();
      view("vLogin");
      $("loginMsg").textContent = "This account is not an MSA-VTC admin.";
      $("loginMsg").hidden = false;
      return;
    }
    $("who").textContent = (session && session.user && session.user.email) || "";
    $("who").hidden = $("btnOut").hidden = false;
    view("vMain");
    await load();
  }

  async function signOut() {
    await sb.auth.signOut();
    students = [];
    $("who").hidden = $("btnOut").hidden = true;
    closeStudent();
    view("vLogin");
  }

  /* ---------------- The student list ---------------- */

  async function load() {
    const { data, error } = await sb.from("student_overview").select("*").order("name");
    if (error) return fail(error);
    students = data || [];
    fillBatches();
    render();
  }

  function fillBatches() {
    const keep = $("fBatch").value;
    const batches = Array.from(new Set(students.map(s => s.batch).filter(Boolean))).sort();
    $("fBatch").innerHTML = '<option value="">All</option>' +
      batches.map(b => '<option value="' + esc(b) + '">' + esc(b) + "</option>").join("");
    if (batches.indexOf(keep) >= 0) $("fBatch").value = keep;
  }

  function filtered() {
    const q = $("q").value.trim().toLowerCase();
    const qc = q.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const tr = $("fTrade").value, ba = $("fBatch").value, stt = $("fStatus").value;
    return students.filter(s =>
      (!tr || s.trade === tr) && (!ba || s.batch === ba) && (!stt || status(s) === stt) &&
      (!q || s.name.toLowerCase().indexOf(q) >= 0 || selfName(s).toLowerCase().indexOf(q) >= 0 ||
        (s.phone || "").indexOf(q) >= 0 || (s.mobile || "").indexOf(q) >= 0 ||
        (qc.length >= 3 && s.code.indexOf(qc) >= 0)));
  }

  function render() {
    const list = filtered();
    $("rows").innerHTML = list.map(s => {
      const st = status(s);
      return '<tr class="click" data-id="' + s.id + '" tabindex="0">' +
        "<td><b>" + esc(s.name) + "</b>" +
          (nameDiffers(s) ? '<span class="says">Signed up as ' + esc(selfName(s)) + "</span>" : "") + "</td>" +
        "<td>" + esc(TRADE_NAME[s.trade] || s.trade || "—") + "</td>" +
        "<td>" + esc(s.batch || "—") + "</td>" +
        "<td>" + (s.mobile ? esc(s.mobile) : s.phone ? '<span class="muted">' + esc(s.phone) + "</span>" : "—") + "</td>" +
        '<td class="code">' + esc(showCode(s.code)) + "</td>" +
        '<td><span class="pill ' + st + '">' + STATUS_TEXT[st] + "</span></td>" +
        '<td class="num">' + s.devices + "</td>" +
        '<td class="num">' + s.quiz_attempts + "</td>" +
        '<td class="num">' + pct(s.quiz_avg) + "</td>" +
        '<td class="num">' + s.interview_answers + "</td>" +
        '<td class="num">' + score(s.interview_avg) + "</td>" +
        '<td class="num">' + s.ai_today + " / " + s.daily_ai_limit + "</td>" +
        "<td>" + when(s.last_seen_at, true) + "</td></tr>";
    }).join("");
    $("noRows").hidden = list.length > 0;
    $("btnRotate").disabled = !$("fBatch").value;
    $("btnRotate").title = $("fBatch").value ? "" : "Choose a batch first";

    const week = Date.now() - 7 * 86400000;
    const sum = k => students.reduce((n, s) => n + Number(s[k] || 0), 0);
    const tiles = [
      [students.filter(s => status(s) === "on").length + " / " + students.length, "Students active"],
      [students.filter(s => s.last_seen_at && Date.parse(s.last_seen_at) > week).length, "Used the app this week"],
      [sum("quiz_attempts"), "Chapter quizzes finished"],
      [sum("interview_answers"), "Interview answers"],
      [sum("ai_today"), "AI marks today"]
    ];
    $("tiles").innerHTML = tiles.map(t => '<div class="tile"><b>' + esc(t[0]) + "</b><span>" + esc(t[1]) + "</span></div>").join("");
  }

  function listCsv() {
    const rows = [["Name", "First name (typed by student)", "Last name (typed by student)", "Mobile (typed by student)",
      "Trade", "Batch", "Phone (entered here)", "Access code", "Status", "Access ends", "Phones used",
      "Chapter quizzes", "Quiz average %", "Interview answers", "Interview average /10", "Last seen", "Added"]];
    filtered().forEach(s => rows.push([
      s.name, s.first_name, s.last_name, s.mobile,
      TRADE_NAME[s.trade] || s.trade, s.batch, s.phone, showCode(s.code), STATUS_TEXT[status(s)],
      s.expires_on || "", s.devices, s.quiz_attempts, s.quiz_avg == null ? "" : s.quiz_avg,
      s.interview_answers, s.interview_avg == null ? "" : s.interview_avg,
      s.last_seen_at ? when(s.last_seen_at, true) : "", when(s.created_at)
    ]));
    download("msa-vtc-students-" + istToday() + ".csv", csv(rows));
  }

  /* ---------------- One student ---------------- */

  function cur() { return students.find(s => s.id === openId) || null; }

  async function openStudent(id) {
    openId = id;
    const s = cur();
    if (!s) return;
    $("dName").textContent = s.name;
    $("dSub").textContent = [TRADE_NAME[s.trade] || s.trade, s.batch, STATUS_TEXT[status(s)]].filter(Boolean).join(" · ");
    $("dCode").textContent = showCode(s.code);
    $("dSelf").innerHTML = s.details_at
      ? "<div><span>First name (typed on phone)</span>" + esc(s.first_name) + "</div>" +
        "<div><span>Last name (typed on phone)</span>" + esc(s.last_name) + "</div>" +
        "<div><span>Mobile</span>" + esc(s.mobile) + "</div>" +
        "<div><span>Signed in on a phone</span>" + when(s.details_at, true) + "</div>"
      : '<div class="muted">Not signed in on a phone yet - their name and mobile number appear here once they enter the code.</div>';
    $("eName").value = s.name;
    $("eTrade").value = s.trade || "cnc";
    $("eBatch").value = s.batch || "";
    $("ePhone").value = s.phone || "";
    $("eExp").value = s.expires_on || "";
    $("eLimit").value = s.daily_ai_limit;
    $("eNotes").value = s.notes || "";
    $("eActive").checked = !!s.active;
    ["dChap", "dInt", "dRecent", "dDev"].forEach(t => { $(t).innerHTML = '<tr><td colspan="8" class="muted">Loading…</td></tr>'; });
    $("detail").hidden = false;
    $("btnClose").focus();

    const [chap, intv, recent, dev] = await Promise.all([
      sb.from("chapter_progress").select("*").eq("student_id", id),
      sb.from("interview_progress").select("*").eq("student_id", id),
      sb.from("quiz_attempts").select("course,chapter_no,chapter_title,right_n,partial_n,wrong_n,skipped_n,pct,finished_at")
        .eq("student_id", id).order("finished_at", { ascending: false }).limit(25),
      sb.from("devices").select("*").eq("student_id", id).order("last_seen_at", { ascending: false })
    ]);
    if (openId !== id) return;                     // another student was opened meanwhile
    const none = n => '<tr><td colspan="' + n + '" class="muted">Nothing yet.</td></tr>';

    const chRows = (chap.data || []).sort((a, b) =>
      a.course.localeCompare(b.course) || (parseFloat(a.chapter_no) || 0) - (parseFloat(b.chapter_no) || 0));
    $("dChap").innerHTML = chRows.length ? chRows.map(r =>
      "<tr><td>" + esc(TRADE_NAME[r.course] || r.course) + "</td><td>" + esc(r.chapter_no) + "</td><td>" + esc(r.chapter_title) +
      '</td><td class="num">' + r.attempts + '</td><td class="num">' + pct(r.best_pct) + '</td><td class="num">' + pct(r.last_pct) +
      '</td><td class="num">' + pct(r.avg_pct) + "</td><td>" + when(r.last_at) + "</td></tr>").join("") : none(8);

    $("dInt").innerHTML = (intv.data || []).length ? intv.data.map(r =>
      "<tr><td>" + esc(TRADE_NAME[r.course] || r.course) + '</td><td class="num">' + r.rounds + '</td><td class="num">' + r.answers +
      '</td><td class="num">' + score(r.avg_score) + '</td><td class="num">' + score(r.best_score) +
      '</td><td class="num">' + r.ai_marked + "</td><td>" + when(r.last_at) + "</td></tr>").join("") : none(7);

    $("dRecent").innerHTML = (recent.data || []).length ? recent.data.map(r =>
      "<tr><td>" + when(r.finished_at, true) + "</td><td>" + esc(r.chapter_no) + "</td><td>" + esc(r.chapter_title) +
      '</td><td class="num">' + r.right_n + '</td><td class="num">' + r.partial_n + '</td><td class="num">' + r.wrong_n +
      '</td><td class="num">' + r.skipped_n + '</td><td class="num">' + pct(r.pct) + "</td></tr>").join("") : none(8);

    $("dDev").innerHTML = (dev.data || []).length ? dev.data.map(r =>
      '<tr><td class="code">…' + esc(String(r.device_id).slice(-6)) + "</td><td>" + when(r.first_seen_at, true) +
      "</td><td>" + when(r.last_seen_at, true) + "</td><td>" + esc(phoneName(r.user_agent)) + "</td></tr>").join("") : none(4);

    openStudent.data = { chap: chRows, intv: intv.data || [], recent: recent.data || [] };
  }

  function closeStudent() {
    openId = null;
    $("detail").hidden = true;
  }

  async function saveStudent(ev) {
    ev.preventDefault();
    const s = cur();
    if (!s) return;
    const lim = parseInt($("eLimit").value, 10);
    const patch = {
      name: $("eName").value.trim(), trade: $("eTrade").value, batch: $("eBatch").value.trim(),
      phone: $("ePhone").value.trim(), expires_on: $("eExp").value || null,
      daily_ai_limit: isFinite(lim) && lim >= 0 ? lim : s.daily_ai_limit,
      notes: $("eNotes").value.trim(), active: $("eActive").checked
    };
    if (!patch.name) return toast("A name is needed.");
    const { error } = await sb.from("students").update(patch).eq("id", s.id);
    if (error) return fail(error);
    toast("Saved.");
    await load();
    openStudent(s.id);
  }

  async function changeCode() {
    const s = cur();
    if (!s) return;
    const ok = await ask("Change " + s.name + "'s code?",
      "The old code stops working, and every phone signed in with it asks for the new one. Give the student the new code.",
      "Change code", true);
    if (!ok) return;
    try {
      const r = await withNewCode(code => sb.from("students")
        .update({ code: code, code_changed_at: new Date().toISOString() }).eq("id", s.id));
      await load();
      openStudent(s.id);
      showCodes([{ name: s.name, batch: s.batch, code: r.code }], "Give this new code to the student.");
    } catch (e) { fail(e); }
  }

  async function deleteStudent() {
    const s = cur();
    if (!s) return;
    const ok = await ask("Delete " + s.name + "?",
      "This removes the student, their access code and ALL their results. Phones using the code are signed out. This cannot be undone.",
      "Delete student", true);
    if (!ok) return;
    const { error } = await sb.from("students").delete().eq("id", s.id);
    if (error) return fail(error);
    closeStudent();
    toast(s.name + " was deleted.");
    load();
  }

  function studentCsv() {
    const s = cur(), d = openStudent.data;
    if (!s || !d) return;
    const rows = [["MSA-VTC · Muniseva Ashram Vocational Training Centre"], ["Student", s.name],
      ["Name typed by student", selfName(s)], ["Mobile", s.mobile || s.phone], ["Trade", TRADE_NAME[s.trade] || s.trade],
      ["Batch", s.batch], [], ["Chapter quiz"], ["Trade", "Chapter", "Title", "Attempts", "Best %", "Last %", "Average %", "Last done"]];
    d.chap.forEach(r => rows.push([TRADE_NAME[r.course] || r.course, r.chapter_no, r.chapter_title, r.attempts, r.best_pct, r.last_pct, r.avg_pct, when(r.last_at)]));
    rows.push([], ["Interview practice"], ["Section", "Mock interviews", "Answers", "Average /10", "Best /10", "AI-marked", "Last done"]);
    d.intv.forEach(r => rows.push([TRADE_NAME[r.course] || r.course, r.rounds, r.answers, r.avg_score, r.best_score, r.ai_marked, when(r.last_at)]));
    rows.push([], ["Latest chapter attempts"], ["When", "Chapter", "Title", "Right", "Partly", "Wrong", "Skipped", "Score %"]);
    d.recent.forEach(r => rows.push([when(r.finished_at, true), r.chapter_no, r.chapter_title, r.right_n, r.partial_n, r.wrong_n, r.skipped_n, r.pct]));
    download("msa-vtc-" + s.name.replace(/\s+/g, "-").toLowerCase() + "-" + istToday() + ".csv", csv(rows));
  }

  /* ---------------- Adding students ---------------- */

  function openAdd() {
    $("addForm").reset();
    $("addMsg").hidden = true;
    if ($("fTrade").value) $("aTrade").value = $("fTrade").value;
    if ($("fBatch").value) $("aBatch").value = $("fBatch").value;
    $("addDlg").hidden = false;
    $("aName").focus();
  }

  async function addStudent(ev) {
    ev.preventDefault();
    const row = {
      name: $("aName").value.trim(), trade: $("aTrade").value, batch: $("aBatch").value.trim(),
      phone: $("aPhone").value.trim(), expires_on: $("aExp").value || null
    };
    if (!row.name) return;
    try {
      const r = await withNewCode(code => sb.from("students").insert(Object.assign({ code: code }, row)));
      $("addDlg").hidden = true;
      await load();
      showCodes([{ name: row.name, batch: row.batch, code: r.code }], "Give this code to the student. They type it once on their phone.");
    } catch (e) {
      $("addMsg").textContent = "Could not add: " + (e.message || "error");
      $("addMsg").hidden = false;
    }
  }

  function openBatch() {
    $("batchForm").reset();
    $("batchMsg").hidden = true;
    if ($("fTrade").value) $("bTrade").value = $("fTrade").value;
    $("batchDlg").hidden = false;
    $("bBatch").focus();
  }

  async function addBatch(ev) {
    ev.preventDefault();
    const names = $("bNames").value.split(/\r?\n/).map(n => n.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (!names.length) return;
    const base = { trade: $("bTrade").value, batch: $("bBatch").value.trim(), expires_on: $("bExp").value || null };
    const made = [];
    try {
      for (const name of names) {
        const r = await withNewCode(code => sb.from("students").insert(Object.assign({ name: name, code: code }, base)));
        made.push({ name: name, batch: base.batch, code: r.code });
      }
    } catch (e) {
      $("batchMsg").textContent = "Stopped after " + made.length + " of " + names.length + ": " + (e.message || "error");
      $("batchMsg").hidden = false;
      if (!made.length) return;
    }
    $("batchDlg").hidden = true;
    await load();
    $("fBatch").value = base.batch;
    render();
    showCodes(made, made.length + " students added to " + base.batch + ". Print or download the codes to hand out.");
  }

  /* Change every code in the chosen batch - e.g. at the start of a new term */
  async function rotateBatch() {
    const batch = $("fBatch").value;
    const list = students.filter(s => s.batch === batch);
    if (!batch || !list.length) return;
    const ok = await ask("Change all " + list.length + " codes in " + batch + "?",
      "Every student in this batch gets a new code, and every phone using an old code is signed out until the new code is typed.",
      "Change all codes", true);
    if (!ok) return;
    const made = [];
    try {
      for (const s of list) {
        const r = await withNewCode(code => sb.from("students")
          .update({ code: code, code_changed_at: new Date().toISOString() }).eq("id", s.id));
        made.push({ name: s.name, batch: s.batch, code: r.code });
      }
    } catch (e) { fail(e); }
    await load();
    if (made.length) showCodes(made, "New codes for " + batch + ". The old ones no longer work.");
  }

  /* ---------------- Codes to hand out ---------------- */

  function showCodes(list, lead) {
    lastCodes = list;
    $("codesLead").textContent = lead;
    $("codesRows").innerHTML = list.map(c =>
      "<tr><td>" + esc(c.name) + "</td><td>" + esc(c.batch || "—") + '</td><td class="code" style="font-size:17px">' +
      esc(showCode(c.code)) + "</td></tr>").join("");
    $("codesDlg").hidden = false;
    $("codesDone").focus();
  }

  function codesCsv() {
    const rows = [["Name", "Batch", "Access code"]].concat(lastCodes.map(c => [c.name, c.batch, showCode(c.code)]));
    download("msa-vtc-codes-" + istToday() + ".csv", csv(rows));
  }

  /* A plain page with one code per row, to print and cut into slips */
  function codesPrint() {
    const w = window.open("", "_blank");
    if (!w) return toast("Allow pop-ups to print.");
    w.document.write("<!doctype html><meta charset='utf-8'><title>Access codes</title>" +
      "<style>body{font:15px system-ui,sans-serif;margin:24px}td{border:1px dashed #999;padding:14px 18px}" +
      "table{border-collapse:collapse;width:100%}.c{font:700 22px ui-monospace,Consolas,monospace;letter-spacing:1px}" +
      "small{color:#555}</style>" +
      "<p><b>MSA-VTC · Muniseva Ashram Vocational Training Centre</b><br><small>Interview Prep app - type this code once on your phone.</small></p><table>" +
      lastCodes.map(c => "<tr><td>" + esc(c.name) + "<br><small>" + esc(c.batch || "") + "</small></td><td class='c'>" +
        esc(showCode(c.code)) + "</td></tr>").join("") + "</table>");
    w.document.close();
    w.focus();
    w.print();
  }

  /* ---------------- Wiring ---------------- */

  function wire() {
    tradeOptions($("fTrade"), true);
    ["eTrade", "aTrade", "bTrade"].forEach(id => tradeOptions($(id), false));
    $("vLogin").addEventListener("submit", signIn);
    $("btnOut").addEventListener("click", signOut);
    ["q", "fTrade", "fBatch", "fStatus"].forEach(id => $(id).addEventListener("input", render));
    $("btnReload").addEventListener("click", load);
    $("btnCsv").addEventListener("click", listCsv);
    $("btnAdd").addEventListener("click", openAdd);
    $("btnBatch").addEventListener("click", openBatch);
    $("btnRotate").addEventListener("click", rotateBatch);
    $("rows").addEventListener("click", ev => {
      const tr = ev.target.closest("tr[data-id]");
      if (tr) openStudent(tr.dataset.id);
    });
    $("rows").addEventListener("keydown", ev => {
      const tr = ev.target.closest("tr[data-id]");
      if (tr && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); openStudent(tr.dataset.id); }
    });
    $("btnClose").addEventListener("click", closeStudent);
    $("detail").addEventListener("click", ev => { if (ev.target === $("detail")) closeStudent(); });
    $("dForm").addEventListener("submit", saveStudent);
    $("btnNewCode").addEventListener("click", changeCode);
    $("btnDelete").addEventListener("click", deleteStudent);
    $("btnStuCsv").addEventListener("click", studentCsv);
    $("btnCopy").addEventListener("click", () => {
      const s = cur();
      if (s && navigator.clipboard) navigator.clipboard.writeText(showCode(s.code)).then(() => toast("Code copied."), () => {});
    });
    $("addForm").addEventListener("submit", addStudent);
    $("addCancel").addEventListener("click", () => { $("addDlg").hidden = true; });
    $("batchForm").addEventListener("submit", addBatch);
    $("batchCancel").addEventListener("click", () => { $("batchDlg").hidden = true; });
    $("codesDone").addEventListener("click", () => { $("codesDlg").hidden = true; });
    $("codesCsv").addEventListener("click", codesCsv);
    $("codesPrint").addEventListener("click", codesPrint);
    document.addEventListener("keydown", ev => {
      if (ev.key !== "Escape") return;
      if (!$("askDlg").hidden) $("askNo").click();
      else if (!$("codesDlg").hidden) $("codesDlg").hidden = true;
      else if (!$("addDlg").hidden) $("addDlg").hidden = true;
      else if (!$("batchDlg").hidden) $("batchDlg").hidden = true;
      else if (!$("detail").hidden) closeStudent();
    });
  }

  wire();
  return { start, view };
})();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !window.supabase) Admin.view("vSetup");
else Admin.start(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
