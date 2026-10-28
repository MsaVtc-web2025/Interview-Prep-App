/* App logic - screens, course selection, the spoken exchange with the avatar,
   results and progress */
"use strict";

const STORE = "interview_practice_gu_v2";
const OLD_STORE = "interview_practice_gu_v1";
const APP_VERSION = "1.1";
const $ = id => document.getElementById(id);

const esc = s => String(s == null ? "" : s)
  .replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const colorFor = n => n >= 7.5 ? "var(--good)" : n >= 5 ? "var(--mid)" : "var(--low)";

/* A unique id per answer, so a backup never duplicates one.
   randomUUID exists only on https/localhost, hence the fallback. */
function newCid() {
  try {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  return "c" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

/* ---------------- Storage ---------------- */

/* ---------------- Google sign-in ----------------

   The Client ID is public information - it appears in the script of every web
   app. (The Client SECRET must never go here; it belongs on a server only.)

   For this to work, the app's address must be registered under Google Cloud
   Console -> APIs & Services -> Credentials -> (this OAuth client) ->
   "Authorized JavaScript origins". Scheme + host (+ port) only, never a path:
       https://msavtc-web2025.github.io      correct
       https://msavtc-web2025.github.io/Interview-Prep-App/   Google rejects this
       http://localhost:8123                 (for testing on a computer)
   An unregistered address gives "Error 400: origin_mismatch".

   This flow needs no "Authorized redirect URIs" - the browser itself receives
   the token and there is no server to return to.

   While the OAuth consent screen is in "Testing", only accounts listed under
   "Test users" can sign in. Press "Publish app" to open it to every student
   (openid/email/profile are non-sensitive, so no verification is required).

   Note: Google's script is blocked inside an artifact, so the button does not
   appear there - use the name field instead. It works on your own address.

   Only the name is read out of the token. No email or photo is stored, and no
   permission or security decision rests on this token. */
const GOOGLE_CLIENT_ID = "604155826405-15oddjk71jr042kbe4bk3j02kdgt547e.apps.googleusercontent.com";

/* hands defaults to off: a mic that opens by itself picks up the student
   sitting next to you in a classroom. ai defaults to on: the offline score only
   counts words, and most students never open the settings at all. */
/* rate 0.75 ("Slow"): the setting's own hint says to keep it on Slow for
   beginners, and every new student is one. Saved settings keep their choice. */
const DEFAULTS = { hands: false, ask: true, speakFb: true, rate: 0.75, silence: 3000, lang: "en", ai: true, dflt2: true, track: "", pmode: "chapter" };

/* quiz = Chapter Quiz results, apart from the interview history (see quiz.js) */
let state = { settings: Object.assign({}, DEFAULTS), courses: {}, quiz: {}, user: null };

function loadState() {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p === "object") {
        state.settings = Object.assign({}, DEFAULTS, p.settings || {});
        /* A previously saved setting overrides the default, so a new default
           would never reach an existing phone. Both features shipped today, so
           nobody has deliberately chosen either - correct them once. */
        if (!p.settings || p.settings.dflt2 !== true) {
          state.settings.hands = false;
          state.settings.ai = true;
          state.settings.dflt2 = true;
        }
        state.courses = p.courses && typeof p.courses === "object" ? p.courses : {};
        state.quiz = p.quiz && typeof p.quiz === "object" ? p.quiz : {};
        state.user = (p.user && typeof p.user === "object") ? p.user : null;
        return;
      }
    }
    // Carry over data from the old version (which had only the interview section)
    const old = localStorage.getItem(OLD_STORE);
    if (old) {
      const p = JSON.parse(old);
      if (p && Array.isArray(p.history)) {
        state.courses.interview = {
          history: p.history,
          asked: Array.isArray(p.asked) ? p.asked : []
        };
      }
    }
  } catch (e) {}
}

const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} };

function bucket(id) {
  if (!state.courses[id]) state.courses[id] = { history: [], asked: [], pos: 0 };
  const b = state.courses[id];
  if (!Array.isArray(b.history)) b.history = [];
  if (!Array.isArray(b.asked)) b.asked = [];
  if (typeof b.pos !== "number") b.pos = 0;
  return b;
}

/* ---------------- User name ---------------- */

function userName() {
  return (state.user && state.user.name) ? String(state.user.name).trim() : "";
}

/* First word of the name - for greeting them as "Hello Ravi" in the interview */
function firstName() {
  const n = userName();
  return n ? n.split(/\s+/)[0] : "";
}

function setUser(name, via, extra) {
  const clean = String(name || "").replace(/\s+/g, " ").trim().slice(0, 60);
  state.user = clean ? Object.assign({ name: clean, via: via || "typed" }, extra || {}) : null;
  save();
}

function allHistory() {
  let out = [];
  Object.keys(state.courses).forEach(k => { out = out.concat(bucket(k).history); });
  return out;
}

/* ---------------- Current session ---------------- */

let course = null;      // the current course
let current = null;      // the current question
let phase = "idle";      // idle · asking · listening · scoring · feedback
let lastResult = null;
let micWatch = null;     // catches a mic that is on but hearing nothing
let dictationSeed = "";  // text carried over when an answer is resumed

/* ---------------- Question clock ----------------

   Records how long each answer took, so the dashboard can show how much time
   was spent practising. Only real time counts - the clock pauses when the app
   goes to the background or the student switches tabs, otherwise an app left
   open overnight would add hours that never happened. */

let qClock = { start: 0, acc: 0 };

function qClockReset() { qClock = { start: Date.now(), acc: 0 }; }
function qClockPause() {
  if (qClock.start) { qClock.acc += Date.now() - qClock.start; qClock.start = 0; }
}
function qClockResume() { if (!qClock.start) qClock.start = Date.now(); }

/* Seconds spent on this question - at most ten minutes for a single answer */
function qClockSecs() {
  const acc = qClock.acc + (qClock.start ? Date.now() - qClock.start : 0);
  return Math.min(Math.round(acc / 1000), Stats.MAX_SECS);
}

/* ---------------- Home (stats) and practice tabs ---------------- */

/* Redraw both tabs - called when an answer is scored or the language changes */
function renderDash() {
  renderTiles();
  renderStats();
}

function renderStats() {
  const fn = firstName();
  $("statsHeading").textContent = fn ? t("home.hello", { name: fn }) : t("stats.title");
  Stats.render($("statsBody"), () => show("practice"));
}

/* The student's own course, picked on the welcome screen. Practice then shows
   only the general interview and that course. Empty means every course. */
function trackCourse() {
  const c = getCourse(state.settings.track);
  return c && c.mode === "technical" ? c : null;
}

function visibleCourses() {
  const tc = trackCourse();
  return tc ? COURSES.filter(c => c.mode === "interview" || c === tc) : COURSES;
}

/* The two modes at the top of the practice tab - the book's chapters, or the
   mock interview. Chapter Quiz comes first and is the default. */
function practiceMode() { return state.settings.pmode === "interview" ? "interview" : "chapter"; }

function paintPracticeMode() {
  const m = practiceMode();
  Array.prototype.forEach.call($("pmodeSeg").children, b => {
    const on = b.getAttribute("data-m") === m;
    b.classList.toggle("on", on);
    b.setAttribute("aria-selected", on ? "true" : "false");
  });
  $("pracLead").textContent = t(m === "chapter" ? "quiz.lead" : "prac.lead");
}

function renderTiles() {
  paintPracticeMode();
  if (practiceMode() === "chapter") { Quiz.renderTrades($("tiles")); return; }

  $("tiles").innerHTML = visibleCourses().map(c => {
    const i = COURSES.indexOf(c);    // keeps each course's colour fixed
    const b = bucket(c.id);
    const n = b.history.length;
    const avg = n ? (b.history.reduce((a, e) => a + e.overall, 0) / n) : 0;
    const meta = n
      ? '<div class="mt done">' + esc(t("tile.done", { n: n, a: avg.toFixed(1) })) + "</div>"
      : '<div class="mt">' + esc(t("tile.questions", { n: c.questions.length })) + "</div>";
    // Pastel colour behind the emoji - cycles with the course's position
    return '<button class="tile" data-id="' + esc(c.id) + '">' +
      '<div class="chip t' + (i % 8 + 1) + '">' + esc(c.icon) + "</div>" +
      '<div class="nm">' + esc(tCourse(c, "name")) + "</div>" +
      '<div class="tg">' + esc(tCourse(c, "tagline")) + "</div>" + meta + "</button>";
  }).join("");

  Array.prototype.forEach.call($("tiles").querySelectorAll(".tile"), el => {
    el.addEventListener("click", () => openCourse(el.getAttribute("data-id")));
  });
}

/* The weakest criterion. Pass mode to get the technical course's label. */
function weakestLabel(h, mode) {
  const avgs = CRITERIA.map(c => ({
    label: criterionLabel(c, mode),
    v: h.reduce((a, e) => a + ((e.scores && e.scores[c.key]) || 0), 0) / h.length
  }));
  avgs.sort((a, b) => a.v - b.v);
  return avgs[0].label;
}

/* ---------------- Language ---------------- */

/* The question's coaching text (gu = explanation, tip = hint) in the current
   language.

   Add this to a question and the other language is used:
     i18n: { en: { gu: "...", tip: "..." }, hi: { gu: "...", tip: "..." } }
   Leave it out and the original Gujarati shows - the app does not break. */
function qField(q, field) {
  const lang = getLang();
  if (lang !== "gu" && q.i18n && q.i18n[lang] && q.i18n[lang][field] != null) {
    return q.i18n[lang][field];
  }
  return q[field];
}

/* ---------------- Question language ----------------

   The core rule is unchanged: the student answers in English and the scoring
   runs on English. But a question you cannot understand is a question you
   cannot answer - so if a translation exists in the app's current language, it
   is the one shown and spoken.

   A translation goes on the question like this:
       i18n: { hi: { q: "..." } }
   Without one the English question stays - the app never renders blank. */

/* This question in the current language - English when there is no translation */
function qText(q) {
  if (q && q.quiz) return q.q;            // a book question - quiz.js already picked its language
  const lang = getLang();
  if (lang !== "en" && q && q.i18n && q.i18n[lang] && q.i18n[lang].q) return q.i18n[lang].q;
  return q ? q.q : "";
}

/* Does this question have a translation? (for display - the font changes with the script) */
function qHasTranslation(q) {
  const lang = getLang();
  return lang !== "en" && !!(q && q.i18n && q.i18n[lang] && q.i18n[lang].q);
}

/* "Your answer (in English)" is an instruction, not a label, and on a question
   that never asked for English it is the wrong instruction. */
function paintAnswerLabels() {
  const en = qNeedsEnglish(current);
  const lab = $("ansLabel"), box = $("ans");
  if (lab) lab.textContent = t(en ? "run.answerLabel" : "run.answerLabelFree");
  if (box) box.placeholder = t(en ? "run.typePlaceholder" : "run.typePlaceholderFree");
}

/* Put the question text on screen.
   The .lat class pins the Latin font - it has to come off for a Devanagari or
   Gujarati translation, otherwise the glyphs render broken. */
function paintQuestionText() {
  if (!current) return;
  const el = $("qtext");
  el.textContent = qText(current);
  // The book questions are Gujarati whatever the app's language
  // A book question carries its own language (Gujarati where untranslated)
  const ql = current.quiz ? current.qlang : (qHasTranslation(current) ? getLang() : "en");
  el.classList.toggle("lat", ql === "en");
  el.classList.toggle("guscript", ql === "gu");

  /* The greeting before the first question - now in the current language */
  const g = greetingLine();
  const ge = $("qgreet");
  ge.hidden = !g;
  ge.textContent = g;
  ge.classList.toggle("lat", getLang() === "en");
}

/* Which language to speak the question in.
   Only spoken in another language when a translation exists AND the phone has a
   voice for it. With no voice we speak English - better than silence, and the
   translation stays visible on screen either way. */
function spokenQuestionLang() {
  if (current && current.quiz) return current.qlang;    // see sayQuestion()
  const lang = getLang();
  if (qHasTranslation(current) && Speech.hasVoice(lang)) return lang;
  return "en";
}

/* Does this question have to be answered in English?

   In English mode everything does - that is what the student chose. In Gujarati
   or Hindi they chose that because their English is weak, so only the questions
   explicitly flagged (the self-introduction ones) ask for it; on the rest they
   answer in their own words and are marked on what they said. */
function qNeedsEnglish(q) {
  if (q && q.quiz) return false;           // a book quiz checks knowledge, not English
  return getLang() === "en" || !!(q && q.needsEnglish);
}

/* Is this question's explanation untranslated? (then we tell the student) */
function qIsGuOnly(q) {
  const lang = getLang();
  return lang !== "gu" && !(q.i18n && q.i18n[lang] && q.i18n[lang].gu != null);
}

/* The language picker appears twice - first thing on the intro screen, and in
   Profile. Both are painted together. aria-pressed tells a screen reader which
   one is chosen. */
const LANG_PICKERS = ["langSeg0", "langSeg2"];

function paintLang() {
  LANG_PICKERS.forEach(id => {
    Array.prototype.forEach.call($(id).children, b => {
      const on = b.getAttribute("data-l") === getLang();
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  });
  $("setLangVal").textContent = langDef(getLang()).label;
}

/* Redraw the whole screen when the language changes */
function relocalize() {
  setLang(state.settings.lang);
  applyI18n();
  paintLang();
  renderDash();
  if (course) {
    renderBrief();
    paintRunHead();
    paintAiTog();
    /* A language change redraws the question in that language too. A book
       question is fetched again in the new language - but not while its
       answer is being marked, which is waiting on this very question. */
    if (Quiz.on() && current && phase !== "scoring") current = Quiz.current();
    if (current) {
      $("qcat").textContent = catLabel(current);
      paintQuestionText();
      paintAnswerLabels();
    }
    renderProgress();
    if (lastResult) showResult(lastResult);
    Quiz.relocalize();
    if (!$("scRun").hidden) setPhase(phase === "idle" ? "ready" : phase);
  }
  if (!$("scProfile").hidden) paintSettings();
  if (!$("scWelcome").hidden) paintTrackSelect();
  if (!$("scChapters").hidden) Quiz.renderChapters();
  if (!$("scQuizReport").hidden) Quiz.renderReport();
  if (!$("scSummary").hidden) renderSummary();
}

/* The category line above the question. A book question's topic is already
   the book's own words - there is no translation table for it. */
function catLabel(q) { return q.quiz ? q.cat : tCat(q.cat); }

/* ---------------- Switching screens ---------------- */

const SC_ID = {
  splash: "scSplash", welcome: "scWelcome", stats: "scStats", practice: "scPractice",
  brief: "scBrief", run: "scRun", profile: "scProfile", help: "scHelp",
  chapters: "scChapters", qreport: "scQuizReport", summary: "scSummary"
};
/* The three tabs with the bottom bar - the bar hides on every other screen */
const TABS = ["stats", "practice", "profile"];

let curScreen = "splash";        // which screen is open - used by the back button

function show(which) {
  Object.keys(SC_ID).forEach(s => { $(SC_ID[s]).hidden = s !== which; });
  curScreen = which;
  armBack();                  // keep the phone's back button inside the app

  const isTab = TABS.indexOf(which) >= 0;
  $("tabbar").hidden = !isTab;
  document.body.classList.toggle("tabs", isTab);
  if (isTab) {
    Array.prototype.forEach.call($("tabbar").querySelectorAll(".tab"), b => {
      const on = b.getAttribute("data-tab") === which;
      b.classList.toggle("on", on);
      // Tells a screen reader which tab is open
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
  }
  // Leaving the practice screen pauses the question clock
  if (which === "run") paintAiTog();
  if (which !== "run") qClockPause();
  window.scrollTo(0, 0);
  reloadIfIdle();            // a pending new version is applied here
}

/* Go to a tab - refresh whatever that tab shows */
function goTab(tab) {
  Speech.stopAll();
  if (Dictation.active()) Dictation.abort();
  if (tab === "stats") renderStats();
  if (tab === "practice") renderTiles();
  if (tab === "profile") paintSettings();
  show(tab);
}

/* ---------------- The phone's back button ----------------

   This is a single-page app, so Android's back button used to close it outright
   - even mid-interview. It now behaves like the back button on the screen itself.

   How: we keep one extra entry of our own in history. Back consumes that entry
   and we get popstate - so the browser does not leave the app, and we move up
   one step ourselves. Moving up calls show(), which pushes the entry again, so
   the next back press is caught too.

   The three bottom tabs are root screens - there is nowhere above them. There we
   do not push the entry again and simply say "press again to exit", which gives
   the familiar Android double-press and stops accidental exits. */

/* Where back goes from each inner screen - exactly what that screen's own back
   button does, so the two behave identically. */
const BACK_TO = {
  splash:  null,                                                  // the very first screen
  welcome: () => { show(state.user ? "practice" : "splash"); },
  brief:   () => leaveCourse(),      // same as $("btnBriefBack")
  run:     () => leaveCourse(),      // same as $("btnBack")
  help:    () => show("profile"),    // same as $("btnHelpBack")
  chapters: () => goTab("practice"), // same as $("btnChapBack")
  qreport: () => Quiz.backToChapters(),  // same as $("btnRepBack")
  summary: () => leaveSummary()          // same as $("btnSumBack")
};

/* Push our entry if history does not already hold one. Never push a second -
   that would make one "back" take several presses. */
function armBack() {
  try {
    if (!(history.state && history.state.appBack)) history.pushState({ appBack: true }, "");
  } catch (e) {}
}

window.addEventListener("popstate", () => {
  const up = BACK_TO[curScreen];
  if (up) { up(); return; }          // up() -> show() -> armBack() pushes it again
  // A root screen - we do not push again, so the next back press exits the app
  toast(t("nav.exitHint"));
});

/* A message that appears briefly at the bottom */
let toastTimer = null;

function toast(msg) {
  const el = $("toast");
  if (!el) return;
  $("toastMsg").textContent = msg;
  el.hidden = false;
  // The slide only animates if the class is added a frame after hidden comes off
  requestAnimationFrame(() => el.classList.add("on"));
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("on");
    toastTimer = setTimeout(() => { el.hidden = true; }, 250);
  }, 2200);
}

/* ---------------- First-run screen (name) ---------------- */

/* The course dropdown - "All courses" first, then every trade course */
function paintTrackSelect() {
  const sel = $("utrack");
  const keep = sel.options.length ? sel.value : state.settings.track;
  sel.innerHTML = '<option value="">' + esc(t("welcome.trackAll")) + "</option>" +
    COURSES.filter(c => c.mode === "technical").map(c =>
      '<option value="' + esc(c.id) + '">' + esc(c.icon + " " + tCourse(c, "name")) + "</option>").join("");
  sel.value = getCourse(keep) ? keep : "";
}

function saveTrack() {
  state.settings.track = $("utrack").value;
  save();
  renderTiles();
}

function openWelcome() {
  $("uname").value = userName();
  $("utrack").innerHTML = "";        // reread the saved choice
  paintTrackSelect();
  show("welcome");
  /* Only our own button shows here. Google's script loads when it is tapped
     (initGoogle), so opening this screen never contacts Google. */
  $("gwrap").hidden = !GOOGLE_CLIENT_ID;
  $("gerr").hidden = true;
  if (!GOOGLE_CLIENT_ID) return;
  if (window.google && window.google.accounts && window.google.accounts.id) {
    renderGoogleButton();            // already asked for once - show Google's own button
  } else {
    $("btnGoogle").hidden = false;
    $("btnGoogle").disabled = false;
    $("gbtn").hidden = true;
  }
}

function finishWelcome(name, via) {
  saveTrack();
  setUser(name, via || "typed");
  relocalize();          // redraws "Hello, Ravi" and the rest
  show("practice");
}

/* Google sign-in - the button appears only when GOOGLE_CLIENT_ID is filled in.
   Only the name is read from the token; no permission rests on it, so there is
   no need to verify the token here. */
let googleLoading = false;

function initGoogle() {
  if (!GOOGLE_CLIENT_ID) return;
  $("gerr").hidden = true;

  // Script already loaded - just redraw the button
  if (window.google && window.google.accounts && window.google.accounts.id) {
    renderGoogleButton();
    return;
  }
  if (googleLoading) return;         // do not add the script twice
  googleLoading = true;

  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.async = true;
  s.defer = true;
  s.onload = () => { googleLoading = false; renderGoogleButton(); };
  /* If the script is blocked or there is no internet, fall back quietly to the
     name field - the app works completely without Google. */
  s.onerror = () => {
    googleLoading = false;
    $("btnGoogle").disabled = false;
    onGoogleError({ type: "script-load-failed" });
  };
  document.head.appendChild(s);
}

function renderGoogleButton() {
  try {
    /* Show the wrapper first: inside a display:none element the Google button
       measures itself wrongly and sometimes never appears at all. */
    $("gwrap").hidden = false;
    $("btnGoogle").hidden = true;
    $("gbtn").hidden = false;
    $("gbtn").innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onGoogleCredential,
      auto_select: false,          // never sign in automatically - the student presses it
      cancel_on_tap_outside: true,
      ux_mode: "popup",
      error_callback: onGoogleError
    });
    window.google.accounts.id.renderButton($("gbtn"), {
      theme: "outline", size: "large", shape: "pill",
      text: "signup_with", width: 280
    });
    // Our button only loaded Google's - say that this one is the one to tap
    $("gerr").className = "hint";
    $("gerr").textContent = t("welcome.googleTap");
    $("gerr").hidden = false;
  } catch (e) {
    onGoogleError(e);
  }
}

/* If Google falls over, do not leave the student stuck - they can type a name.
   Keep the real error in the console; telling a student "origin_mismatch" helps
   nobody.

   A popup the student closed themselves (popup_closed) is not an error - there
   is nothing to report. */
function onGoogleError(err) {
  const type = (err && (err.type || err.message)) || "unknown";
  if (type === "popup_closed") return;
  console.warn("Google sign-in unavailable:", type, err);
  $("gerr").className = "hint warn";
  $("gerr").hidden = false;
  $("gerr").textContent = t("err.google");
}

/* Take only the name from Google - no email or photo is stored */
function onGoogleCredential(res) {
  const p = res && res.credential ? decodeJwt(res.credential) : null;
  const name = p && (p.name || p.given_name);
  if (name) finishWelcome(name, "google");
  else onGoogleError({ type: "no-name-in-token" });
}

function decodeJwt(jwt) {
  try {
    let part = String(jwt).split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    while (part.length % 4) part += "=";       // base64url carries no padding
    const bin = atob(part);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (e) { return null; }
}

/* Course picked -> the briefing screen first, questions after */
function openCourse(id) {
  const c = getCourse(id);
  if (!c) return;
  Speech.prime();                 // a user tap - TTS has to be woken right here
  Quiz.drop();
  course = c;
  renderBrief();
  show("brief");
}

function renderBriefIfOpen() {
  if (course && !$("scBrief").hidden) renderBrief();
}

function renderBrief() {
  const n = course.questions.length;
  /* Part way through a round: offer to carry on where they left off, or to
     start again - leaving and coming back used to silently continue. */
  const r = openRound(course);
  const resumable = !!r && roundAnswered(r) + r.skipped.length > 0;
  $("btnResume").hidden = !resumable;
  if (resumable) $("btnResume").textContent = t("brief.resume", { a: roundAnswered(r), n: r.order.length });
  $("btnStart").textContent = t(resumable ? "brief.restart" : "btn.start");
  $("btnStart").className = "act" + (resumable ? " ghost" : "");
  $("briefIcon").textContent = course.icon;
  $("briefName").textContent = tCourse(course, "name");
  // Roughly a minute and a half per question - being asked, answering, reading feedback
  $("briefMeta").textContent = t("brief.meta", { n: n, m: Math.round(n * 1.5) });
  /* "Answer in English" is the wrong instruction in Gujarati or Hindi. There the
     student answers in whatever they think in on every question but the flagged
     self-presentation ones, and those say so themselves when they come up. */
  $("briefI2").textContent = t(getLang() === "en" ? "brief.i2" : "brief.i2Free");
  $("briefI3").textContent = t("brief.i3", { n: n });
}

/* "Start mock interview" - a new round from the first question */
function startInterview() {
  if (!course) { show("practice"); return; }
  Speech.prime();                 // the tap that must precede the first speak()
  bucket(course.id).round = newRound(course);
  save();
  openRun();
}

/* "Continue your interview" - the round already under way */
function resumeInterview() {
  if (!course) { show("practice"); return; }
  Speech.prime();
  if (!openRound(course)) bucket(course.id).round = newRound(course);
  openRun();
}

/* A chapter of the book, from the chapter list or "Try again" on the report
   card. It opens straight on the first question - the student picked the
   chapter themselves, so there is nothing to brief. */
function startChapterQuiz(cid, chId) {
  const c = getCourse(cid);
  if (!c || !Quiz.begin(cid, chId)) return;
  Speech.prime();                 // a user tap - TTS has to be woken right here
  course = c;
  openRun();
}

function openRun() {
  paintRunHead();
  paintInputMode();
  show("run");
  Avatar.mount($("av"));
  renderProgress();
  pickQuestion(false);
}

/* The run screen's title, and the parts that differ in a chapter quiz: the
   skip button really skips, and the interview's own progress panel is not
   about this quiz at all. */
function paintRunHead() {
  const quiz = Quiz.on();
  $("runName").textContent = tCourse(course, "name") + (quiz ? " · " + Quiz.title() : "");
  $("skipLbl").textContent = t(quiz ? "quiz.skip" : "btn.skip");
  $("runStats").hidden = quiz;
}

/* Leaving a chapter quiz part way still gives the report card for what was
   answered - nothing the student did is thrown away. */
function leaveCourse() {

  Speech.stopAll();
  if (Dictation.active()) Dictation.abort();
  Avatar.setState("idle");
  phase = "idle";
  if (Quiz.on()) {
    const done = Quiz.finish();
    course = null;
    if (done) Quiz.openReport(done.cid, done.chId);
    else Quiz.openChapters();
    return;
  }
  course = null;
  show("practice");
  renderDash();
}

/* ---------------- Question selection ---------------- */

/* Is this a sequential course? (general interview - follows the order list) */
function isSequential() { return !!(course && Array.isArray(course.order) && course.order.length); }

/* ---------------- A round ----------------

   A mock interview is one round through the course's questions - in the set
   order for the general interview, shuffled for a trade. It used to have no
   end: the counter ran 10/10 back to 1/10, a skipped question counted as
   progress, and coming back carried on silently.

   round = { order: [question index], pos, done: { index: {o, s} }, skipped: [index], finished }
   done holds every answer of the round (o = overall, s = the six scores), and
   is kept when the skipped questions are retried, so the summary covers them
   all. Lives in the course's bucket, so it survives leaving the app. */
function newRound(c, only) {
  const qs = c.questions;
  let order;
  if (only) order = only.slice();
  else if (Array.isArray(c.order) && c.order.length) {
    order = c.order.map(id => qs.findIndex(q => q.id === id)).filter(i => i >= 0);
  } else {
    order = qs.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {          // shuffle
      const j = Math.floor(Math.random() * (i + 1));
      const x = order[i]; order[i] = order[j]; order[j] = x;
    }
  }
  return { order: order, pos: 0, done: {}, skipped: [], finished: false };
}

/* The round in progress for this course, or null. One that refers to
   questions the bank no longer has is dropped. */
function openRound(c) {
  const r = bucket(c.id).round;
  if (!r || r.finished || !Array.isArray(r.order) || !r.order.length) return null;
  if (r.order.some(i => !c.questions[i])) return null;
  if (!r.done || typeof r.done !== "object") r.done = {};
  if (!Array.isArray(r.skipped)) r.skipped = [];
  if (typeof r.pos !== "number" || r.pos >= r.order.length) r.pos = 0;
  return r;
}

function round() {
  let r = openRound(course);
  if (!r) { r = bucket(course.id).round = newRound(course); }
  return r;
}

/* Answered in this round's order - what the counter shows */
function roundAnswered(r) { return r.order.filter(i => r.done[i]).length; }

function paintRoundProgress() {
  const r = round();
  $("runProg").textContent = roundAnswered(r) + "/" + r.order.length;
  $("runProg").setAttribute("aria-label", t("run.progA", { a: roundAnswered(r), n: r.order.length }));
}

/* Have we reached the last question? */
function atLastQuestion() {
  if (Quiz.on()) return Quiz.atLast();
  if (!course) return false;
  const r = round();
  return r.pos >= r.order.length - 1;
}

/* advance = true moves forward in the order; false stays where we are */
function pickQuestion(advance) {
  if (Quiz.on()) {
    // A chapter goes through the book in order, once
    current = Quiz.next(advance);
    $("runProg").textContent = Quiz.progress();
  } else {
    pickCourseQuestion(advance);
  }

  $("qcat").textContent = catLabel(current);
  paintQuestionText();
  $("heard").textContent = "";
  $("ans").value = "";
  $("result").hidden = true;
  $("result").innerHTML = "";
  // Speak or type stays as the student left it (setInputMode)
  $("heard").hidden = inputMode === "type";
  $("typeWrap").hidden = inputMode !== "type";
  lastResult = null;

  paintAnswerLabels();
  qClockReset();          // this question's timing starts here
  askQuestion();
}

function pickCourseQuestion(advance) {
  const r = round();
  if (advance && r.pos < r.order.length - 1) r.pos++;
  current = course.questions[r.order[r.pos]];
  paintRoundProgress();
  save();
}

/* Skip this question: it counts as skipped, not as progress, unless it was
   already answered. Skipping the last one ends the round. */
function skipQuestion() {
  const r = round();
  const idx = r.order[r.pos];
  if (!r.done[idx] && r.skipped.indexOf(idx) === -1) r.skipped.push(idx);
  save();
  if (atLastQuestion()) endRound();
  else pickQuestion(true);
}

/* An answer, into the round - a retried AI mark replaces the earlier one */
function roundRecord(q, r) {
  if (Quiz.on() || !course) return;
  const rd = round();
  const idx = course.questions.indexOf(q);
  if (idx < 0) return;
  rd.done[idx] = { o: r.overall, s: r.scores };
  rd.skipped = rd.skipped.filter(i => i !== idx);
  save();
  paintRoundProgress();
}

/* ---------------- End of the round ---------------- */

function endRound() {
  Speech.stopAll();
  if (Dictation.active()) Dictation.abort();
  Avatar.setState("idle");
  phase = "idle";
  const r = round();
  r.finished = true;
  save();
  renderSummary();
  show("summary");
}

/* The summary: how many were answered, the average, the weakest criterion,
   and the skipped ones to go back to. */
function renderSummary() {
  if (!course) return;
  const r = bucket(course.id).round;
  if (!r) return;
  const total = course.questions.length;
  const done = Object.keys(r.done).map(k => r.done[k]);
  const avg = done.length ? done.reduce((a, e) => a + e.o, 0) / done.length : 0;
  const C = 2 * Math.PI * 33, off = C * (1 - avg / 10);

  $("sumName").textContent = course.icon + " " + tCourse(course, "name");
  let h = '<div class="ring big"><svg viewBox="0 0 74 74"><circle class="bgc" cx="37" cy="37" r="33"/>' +
    '<circle class="fgc" cx="37" cy="37" r="33" stroke="' + colorFor(avg) + '" stroke-dasharray="' +
    C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg><b style="color:' + colorFor(avg) +
    '">' + (done.length ? avg.toFixed(1) : "—") + "</b></div>" +
    '<p class="sumline">' + esc(t("sum.answered", { a: done.length, n: total })) + "</p>";
  if (done.length) {
    h += '<p class="sumline">' + esc(t("sum.weakest", {
      w: weakestLabel(done.map(e => ({ scores: e.s })), course.mode) })) + "</p>";
  }
  if (r.skipped.length) h += '<p class="sumline">' + esc(t("sum.skipped", { n: r.skipped.length })) + "</p>";
  $("sumBody").innerHTML = h;

  $("btnSumRetry").hidden = !r.skipped.length;
  $("btnSumRetry").textContent = t("sum.retry", { n: r.skipped.length });
}

/* The greeting - only on the first question of a sequential course, and only
   when greet:true.
   Pass lang to get it in that language - speaking uses the voice's language,
   which can differ from the screen's. An English voice reading Devanagari comes
   out as nonsense, so what is spoken and what is written are kept separate. */
function greetingLine(lang) {
  if (!course || !course.greet || !isSequential()) return "";
  const r = openRound(course);
  if (!r || r.pos !== 0 || roundAnswered(r)) return "";
  const fn = firstName();
  const l = lang || getLang();
  return fn ? tIn(l, "q.greetName", { name: fn }) : tIn(l, "q.greet");
}

/* ---------------- The avatar asks the question ---------------- */

function askQuestion() {

  Speech.stopAll();
  if (Dictation.active()) Dictation.abort();

  if (!state.settings.ask || !Speech.supported()) {
    setPhase("ready");
    return;
  }
  setPhase("asking");

  /* Only the most recent ask may act on its result. Two asks can overlap - the
     student skips, or changes language mid-question - and the older one settles
     as "cancelled", which must not be mistaken for "this phone cannot speak". */
  const gen = ++askGen;
  sayQuestion(gen).then(spoken => { if (gen === askGen) afterAsking(spoken); });
}

let askGen = 0;

/* Speak the question, falling back to English if the chosen voice says nothing.

   A phone can list a Gujarati or Hindi voice that produces no audio at all -
   the voice is offered but its data was never downloaded - and the app has no
   way to tell the two apart until it tries. Asking in silence is the worst
   outcome, and the question exists in English natively, so that is what it
   falls back to. The translation stays on screen to read.

   `gen` is this ask's generation. Speech.speak() resolves false for "nothing was
   heard", and a cancel counts as nothing heard - so an ask that was interrupted
   by the next question looks exactly like a phone with no Gujarati voice. Acting
   on it would cancel the question now being asked and read it out in English,
   which is what skipping mid-sentence used to do. A stale generation therefore
   falls back to nothing: the ask that replaced it is already speaking. */
function sayQuestion(gen) {
  const lang = spokenQuestionLang();
  const rate = state.settings.rate;

  /* A Gujarati or Hindi book question read by an English voice comes out as
     noise, so with no voice for its language it is not read at all - it is
     on screen. */
  if (current.quiz && current.qlang !== "en" && !Speech.hasVoice(current.qlang)) return Promise.resolve(false);

  return Speech.speak(spokenQuestion(), { lang: lang, rate: rate }).then(spoken => {
    if (gen !== askGen) return spoken;        // a newer ask owns the speaker now
    if (spoken || lang === "en" || current.quiz || phase !== "asking") return spoken;
    const g = greetingLine("en");
    return Speech.speak((g ? g + " " : "") + current.q, { lang: "en", rate: rate });
  });
}

/* What to do once the avatar has finished asking - or failed to.

   `spoken` is false when nothing was heard: no voice installed, or a TTS engine
   that errors instantly. Opening the mic then is the wrong move, because from
   the student's side the app never asked anything and is suddenly recording
   them. Wait on "Ready" instead, with the question on screen to read, and let
   them press Answer when they are ready. */
function afterAsking(spoken) {
  if (phase !== "asking") return;                  // the student did something meanwhile

  if (!spoken) {
    setPhase("ready");
    $("hint").className = "hint warn";
    $("hint").textContent = t(current.quiz && current.qlang === "gu" && !Speech.hasVoice("gu")
      ? "quiz.noGuVoice" : "err.noVoice");
    return;
  }

  /* The question has been asked, so open the mic and leave it open. The student
     talks when they are ready and presses the button when they are done -
     nothing closes it in between. Hands-free mode no longer decides whether the
     mic opens, only whether a silence submits the answer by itself. A student
     who chose to type gets no mic at all. */
  if (inputMode === "speak" && canListen()) beginListen();
  else setPhase("ready");
}

/* Can this phone take a spoken answer at all? Either engine will do - dictation
   records the audio itself and needs no SpeechRecognition. */
function canListen() {
  return (Dictation.enabled() && navigator.onLine !== false) || Speech.micSupported();
}

/* What the avatar says - the greeting (if any) and then the question, both in
   the same language. What is on screen can differ: with a translation but no
   voice for it, the screen stays Hindi while the speech is English. */
function spokenQuestion() {
  const lang = spokenQuestionLang();
  const g = greetingLine(lang);
  const q = lang === "en" ? current.q : qText(current);
  return (g ? g + " " : "") + q;
}

/* ---------------- The student speaks ---------------- */

/* The language the answer is written down in. The interview is answered in
   English. A book-quiz answer comes in the language the question was asked
   in - Gujarati or Hindi with English words in it, which heard as English
   comes back as nonsense. Taken down as Gujarati or Hindi, the English words
   stay in English letters. */
function answerLang() {
  if (!current || !current.quiz) return "en";
  return current.qlang;
}

/* Stop listening, whichever engine is running. Dictation holds a real
   microphone, so leaving it open is not a cosmetic bug - every call site that
   used to stop SpeechRecognition has to release that too. */
function stopListening() {
  if (Dictation.active()) Dictation.abort();
  return Speech.stopListen(true);
}

/* Record the whole answer as one unbroken stream and transcribe it at the end.

   Android ends a SpeechRecognition session after every sentence and there is no
   setting that stops it, so the path below is the only way to give a student a
   microphone that is still open after their third sentence. It is off until
   DICTATION_URL is set in dictation.js, and the app falls back to the old
   engine whenever it is unavailable - including offline, where no server can
   transcribe anything. */
function beginDictation(seed) {
  Speech.cancelSpeech();
  setPhase("listening");
  micLive(false);

  dictationSeed = String(seed || "").trim();
  $("heard").textContent = dictationSeed;
  $("micMeter").hidden = false;
  paintLevel(0);

  Dictation.start({
    onLive: () => micLive(true),
    onLevel: v => paintLevel(v),
    onTick: secs => {
      // The ceiling is a real stop, so say so before it arrives rather than
      // cutting the student off mid-word with no warning.
      const left = Dictation.MAX_SECONDS - secs;
      if (left <= 20) $("hint").textContent = t("dict.endingIn", { n: Math.max(0, left) });
      if (left <= 0) $("btnAct").click();
    },
    onError: err => { $("micMeter").hidden = true; onMicError(err); }
  });
}

/* The meter is the only sign the mic is live now that there is no interim text
   to watch, so it has to move whenever the student speaks. */
function paintLevel(v) {
  const el = $("micLevel");
  if (el) el.style.transform = "scaleX(" + Math.max(0.04, v).toFixed(3) + ")";
}

/* seed = text already heard, when an answer is being picked back up after the
   mic was taken away from us. */
function beginListen(seed) {
  if (Dictation.enabled() && navigator.onLine !== false) return beginDictation(seed);
  if (!Speech.micSupported()) {
    setPhase("ready");
    micOff = true;
    showTypeFallback(t("err.mic.unsupported"));
    return;
  }
  Speech.cancelSpeech();
  setPhase("listening");
  micLive(false);

  const ok = Speech.listen({
    lang: answerLang() + "-IN",
    seed: seed || "",
    // 0 = never submit on a silence; the mic stays open until the student
    // presses the button. Hands-free mode is the opt-in that changes that.
    silenceMs: state.settings.hands ? state.settings.silence : 0,
    onStart: () => { micLive(true); armMicWatch(); },
    onInterim: txt => { $("heard").textContent = txt; if (txt.trim()) clearMicWatch(); },
    onSilence: txt => { $("heard").textContent = txt; submit(txt); },
    onError: err => onMicError(err)
  });
  if (!ok) setPhase("ready");
}

/* Android's screen timeout is short - often 30 seconds - and a student speaking
   a long answer is not touching the screen. When the screen goes off the page
   goes hidden, the visibilitychange handler stops the mic mid-sentence, and
   everything said from then on is gone with nothing on screen to explain why.

   Holding a screen wake lock while we are listening stops that happening at
   all. Not every browser has one and the request can be refused, so the resume
   path in that handler stays as the safety net. */
let wakeLock = null;

function keepScreenAwake(on) {
  try {
    if (!navigator.wakeLock) return;
    if (on) {
      if (wakeLock) return;
      navigator.wakeLock.request("screen")
        .then(w => { wakeLock = w; w.addEventListener("release", () => { wakeLock = null; }); })
        .catch(() => { wakeLock = null; });
    } else if (wakeLock) {
      const w = wakeLock;
      wakeLock = null;
      w.release().catch(() => {});
    }
  } catch (e) { wakeLock = null; }
}

/* The mic is not live the moment we ask for it. speech.js first waits for the
   speaker to let go of the audio (about 600ms), and Android then takes its own
   time to reach the recognition service - close to a second in total, during
   which nothing said is heard.

   Telling the student "speak in English" through that window costs them the
   opening words of every answer, which is exactly when they start talking. So
   the prompt and the red ring are held back until the mic really opens, and
   until then the screen says the mic is still getting ready. */
function micLive(on) {
  if (phase !== "listening") return;
  const live = qNeedsEnglish(current) ? "status.listening" : "status.listenFree";
  $("status").textContent = t(on ? live : "status.micOpening");
  Avatar.setState(on ? "listening" : "thinking");
}

/* On some desktop browsers the mic opens but not a single word is picked up
   (the wrong microphone is selected, or the browser has no such service). After
   a while we tell the student so they are not left waiting - listening carries
   on regardless. */
function armMicWatch() {
  clearMicWatch();
  micWatch = setTimeout(() => {
    micWatch = null;
    if (phase !== "listening" || $("heard").textContent.trim()) return;
    $("hint").className = "hint warn";
    $("hint").textContent = t("err.mic.silent");
    showTypeFallback(null);
  }, 9000);
}

function clearMicWatch() { if (micWatch) { clearTimeout(micWatch); micWatch = null; } }

function onMicError(err) {
  setPhase("ready");
  // Refused or missing: the status line says the mic is off from now on
  micOff = err === "not-allowed" || err === "service-not-allowed" || err === "unsupported";
  const h = $("hint");
  h.className = "hint warn";
  if (err === "not-allowed" || err === "service-not-allowed") h.textContent = t("err.mic.denied");
  else if (err === "network") h.textContent = t("err.mic.network");
  else if (err === "unsupported") h.textContent = t("err.mic.unsupported");
  else h.textContent = t("err.mic.other", { e: err });
  showTypeFallback(null);
}

/* The recorder heard a voice, but no words came back from transcribing it -
   no internet, the server busy, or speech it could not make out. "Speak or
   type your answer first" would tell a student who just spoke that they did
   not, so say what really happened and open the box to type it. */
function notCaught() {
  setPhase("ready");
  $("result").hidden = false;
  $("result").innerHTML = '<div class="err">' + esc(t("res.notCaught")) + "</div>";
  showTypeFallback(null);
  revealResult();
}

/* Speak or type - one place to answer at a time.

   Speaking shows what was heard; typing shows one editable box, filled with
   anything already heard, and the big Answer button steps aside for "Check my
   answer". Chosen by the student with the Speak | Type switch, or by the app
   when the mic cannot be used - and then the status line says the mic is off
   instead of "tap Answer". The choice stays from one question to the next. */
let inputMode = "speak";
let micOff = false;            // the mic was refused or is missing on this phone

function paintInputMode() {
  Array.prototype.forEach.call($("inModeSeg").children, b => {
    const on = b.getAttribute("data-m") === inputMode;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function setInputMode(m, keepHint) {
  inputMode = m === "type" ? "type" : "speak";
  const typing = inputMode === "type";
  paintInputMode();

  if (typing) {
    if (phase === "listening") stopListening();
    if (phase === "asking") Speech.cancelSpeech();
    const heard = $("heard").textContent.trim();
    if (heard && !$("ans").value.trim()) $("ans").value = heard;
  } else if ($("ans").value.trim()) {
    $("heard").textContent = $("ans").value.trim();
  }
  $("heard").hidden = typing;
  $("typeWrap").hidden = !typing;
  const hint = { cls: $("hint").className, txt: $("hint").textContent };
  if (phase === "listening" || phase === "asking") setPhase("ready");
  else setPhase(phase === "idle" ? "ready" : phase);
  if (keepHint) { $("hint").className = hint.cls; $("hint").textContent = hint.txt; }
  else clearHint();
}

/* Switch to typing because the mic cannot be used; msg says why */
function showTypeFallback(msg) {
  setInputMode("type", true);
  if (msg) { $("hint").className = "hint warn"; $("hint").textContent = msg; }
}

/* ---------------- Score the answer ---------------- */

/* judged = marks that already came back alongside the transcript, from the one
   call that does both. When it is there, the answer is scored already. */
function submit(text, judged) {
  const ans = String(text || "").trim();
  stopListening();

  /* Said right under the answer field, where the student is looking - it
     used to appear below the fold, so the tap seemed to do nothing. */
  if (!ans) {
    setPhase("ready");
    $("result").hidden = true;
    $("hint").className = "hint warn";
    $("hint").textContent = t("res.noAnswer");
    try { $("hint").scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    return;
  }

  setPhase("scoring");
  $("heard").textContent = ans;
  const secs = qClockSecs();          // real time spent on this question

  // Scoring is instant; a short pause so the avatar is seen to think
  setTimeout(() => {
    if (Quiz.on()) { markQuiz(ans, judged); return; }

    // The offline score is always computed first, even with AI on. It is the
    // base, and it is what shows if the AI never arrives.
    const offline = scoreAnswer(ans, current, course.mode, qNeedsEnglish(current), course.id);
    const q = current, c = course;      // so we can tell if the student moved on

    let entry = null;                 // this answer's history row, once saved

    function finish(r) {
      if (current !== q || course !== c) return;   // another question came up meanwhile
      lastResult = r;
      clearHint();

      /* `q` and `answer` stay on this phone. `cid` is for the backup - the
         server keeps (user, cid) unique, so re-sending the queue never
         duplicates anything. See sync.js for which fields actually leave.

         A retried AI mark replaces the offline one in the same row, so one
         answer is never counted twice. */
      const fields = {
        overall: r.overall, scores: r.scores,
        words: r.stats.words, coverage: r.stats.coverage,
        weakest: r.weakest, missed: r.missingMust, byAi: !!r.byAi
      };
      if (entry) Object.assign(entry, fields);
      else {
        entry = Object.assign({
          // The question id is a number but used as an identifier - store it as text
          ts: Date.now(), cid: newCid(), course: c.id,
          qid: q.id == null ? "" : String(q.id),
          q: q.q, cat: q.cat, answer: ans, secs: secs
        }, fields);
        bucket(c.id).history.push(entry);
      }
      save();
      Sync.flush();                  // does nothing when backup is off
      roundRecord(q, r);

      showResult(r, r.aiFailed ? askAi : null);
      renderProgress();
      setPhase("feedback");
      speakFeedback(r);
    }

    // Already marked, in the same call that transcribed it.
    if (judged) { finish(Judge.merge(offline, judged)); return; }

    if (!Judge.active()) {
      /* Their own language, and no AI to read it: scoring.js measures English
         and would hand back a low number that means nothing. Say why instead. */
      if (offline.unmarkableOffline) {
        setPhase("ready");
        $("result").hidden = false;
        $("result").innerHTML = '<div class="err">' + esc(t("res.needsNet")) + "</div>";
        revealResult();
        return;
      }
      finish(offline);
      return;
    }

    /* Ask the AI. When it does not answer - busy, offline, an error - the
       student is told so, plainly, and gets the offline score labelled as
       such with a button to try the AI again. Before, "AI is reading..." sat
       there for ever next to a score that was really the offline one. */
    function askAi() {
      if (current !== q || course !== c) return;
      setPhase("scoring");
      showAiWaiting();
      Judge.evaluate(ans, q, c.mode, getLang(), qNeedsEnglish(q)).then(j => {
        stopAiWaiting();
        if (j) return finish(Judge.merge(offline, j));
        if (current !== q || course !== c) return;
        /* Their own language, and no AI to read it: an offline number would
           mean nothing, so there is no score to show - only the retry. */
        if (offline.unmarkableOffline) return aiDown(askAi);
        finish(Object.assign({}, offline, { aiFailed: true }));
      });
    }
    askAi();
  }, 420);
}

/* "AI is reading your answer..." while it does - and after a while, that it is
   still going, since a busy model can take half a minute and one unchanging
   line that long makes the app look frozen. */
let aiPatience = null;

function showAiWaiting() {
  $("hint").className = "hint";
  $("hint").textContent = t("ai.reading");
  if (aiPatience) clearTimeout(aiPatience);
  aiPatience = setTimeout(() => {
    if (phase === "scoring") $("hint").textContent = t("ai.stillReading");
  }, 7000);
}

function stopAiWaiting() {
  if (aiPatience) { clearTimeout(aiPatience); aiPatience = null; }
  clearHint();
}

function clearHint() {
  $("hint").className = "hint";
  $("hint").textContent = "";
}

/* The AI did not answer and there is nothing offline to fall back on (an
   answer in Gujarati or Hindi). Say so, and offer to try again. */
function aiDown(retry) {
  setPhase("ready");
  $("result").hidden = false;
  $("result").innerHTML = '<div class="err" role="status">' + esc(t("ai.downNoScore")) + "</div>" +
    '<div class="row" style="margin-top:10px"><button class="act ghost sm" id="btnAiRetry">' +
    esc(t("ai.retry")) + "</button></div>";
  $("btnAiRetry").addEventListener("click", retry);
  revealResult();
}

/* A chapter quiz answer - marked against the book answer, and kept out of the
   interview history. With the AI on the student waits for its verdict, the
   same as in the interview. */
function markQuiz(ans, judged) {
  const q = current;
  if (!judged && Judge.active()) showAiWaiting();

  Quiz.mark(ans, q, judged).then(r => {
    stopAiWaiting();
    if (!Quiz.on() || current !== q) return;   // skipped or left meanwhile
    Quiz.record(q, ans, r);
    // The AI did not answer: the word-match verdict shows, with a retry
    Quiz.showResult(r, false, r.aiFailed ? () => {
      if (!Quiz.on() || current !== q) return;
      setPhase("scoring");
      markQuiz(ans);
    } : null);
    setPhase("feedback");
    Quiz.speak(r);
  });
}

/* Speak a short summary in the current language - not everything, only what is
   useful. */
/* The number as it is spoken. toFixed(1) always gives "4.0", which a voice reads
   as "four point zero" - wrong to the ear. Drop the decimal on a whole number;
   leave something like "4.2" alone. */
function sayScore(v) {
  const n = Math.round(Number(v) * 10) / 10;
  if (!isFinite(n)) return "0";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function speakFeedback(r) {
  const voice = LANG_VOICE[getLang()] || "en";
  if (!state.settings.speakFb || !Speech.hasVoice(voice)) return;

  let msg = t("fb.spoken", { v: sayScore(r.overall) });
  if (r.missingMust && r.missingMust.length) {
    msg += t("fb.spokenSafety", { list: r.missingMust.map(tMust).join(", ") });
  }
  msg += r.advice;

  Speech.speak(msg, { lang: voice, rate: state.settings.rate }).then(() => {
    if (phase === "feedback") Avatar.setState("idle");
  });
}

/* ---------------- Screen state by phase ---------------- */

/* Avatar, status text and button per phase. The text values are i18n keys. */
const PHASE_UI = {
  ready:     { av: "idle",      cls: "",    st: "status.ready",     btn: "btn.answer",      rec: false },
  asking:    { av: "speaking",  cls: "",    st: "status.asking",    btn: "btn.startAnswer", rec: false },
  listening: { av: "listening", cls: "rec", st: "status.listening", btn: "btn.done",        rec: true  },
  scoring:   { av: "thinking",  cls: "",    st: "status.scoring",   btn: "btn.checking",    rec: false },
  feedback:  { av: "speaking",  cls: "ok",  st: "status.feedback",  btn: "btn.next",        rec: false }
};

function setPhase(p) {

  if (!PHASE_UI[p]) p = "ready";
  if (p !== "listening") clearMicWatch();
  keepScreenAwake(p === "listening");
  // Shown by beginDictation; hidden again as soon as we stop listening, so a
  // fallback to SpeechRecognition never leaves a meter sitting there frozen.
  const meter = $("micMeter");
  if (meter && p !== "listening") meter.hidden = true;
  phase = p;
  const u = PHASE_UI[p];
  const typing = inputMode === "type";
  Avatar.setState(u.av);
  /* Typing: "tap Answer" would be wrong - there is no mic to answer with. */
  $("status").textContent = t(typing && p === "ready" ? (micOff ? "status.micOff" : "status.typeReady") : u.st);
  $("status").className = "status " + u.cls;
  const b = $("btnAct");
  // After the last question of a sequential course: "Finish", not "Next question"
  b.textContent = (p === "feedback" && atLastQuestion())
    ? t(Quiz.on() ? "quiz.seeReport" : "btn.finish") : t(u.btn);
  b.className = "act" + (u.rec ? " rec" : "");
  b.disabled = p === "scoring";
  // While typing, "Check my answer" is the button; this one returns for "Next"
  b.hidden = typing && (p === "ready" || p === "asking" || p === "listening");
  if (p === "ready" || p === "asking") { $("hint").className = "hint"; $("hint").textContent = ""; }
}

/* ---------------- Show the result ---------------- */

/* onRetry: given when the AI did not answer - the card then says so and
   offers to try the AI again. */
function showResult(r, onRetry) {
  const C = 2 * Math.PI * 33;
  const off = C * (1 - r.overall / 10);

  let h = '<div class="score">' +
    '<div class="ring"><svg viewBox="0 0 74 74">' +
      '<circle class="bgc" cx="37" cy="37" r="33"/>' +
      '<circle class="fgc" cx="37" cy="37" r="33" stroke="' + colorFor(r.overall) + '" ' +
        'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
    '</svg><b style="color:' + colorFor(r.overall) + '">' + r.overall.toFixed(1) + "</b></div>" +
    '<div class="txt"><div class="t">' + esc(t("res.score", { v: r.overall.toFixed(1) })) + "</div>" +
    '<div class="s">' + esc(t("res.meta", {
        cat: tCat(current.cat), w: r.stats.words, c: r.stats.coverage
      })) + "</div></div></div>";

  if (r.missingMust && r.missingMust.length) {
    h += '<div class="box safe"><b>' + esc(t("res.safety")) + "</b><ul>" +
      r.missingMust.map(m => "<li>" + esc(tMust(m)) + "</li>").join("") +
      '</ul><div style="margin-top:7px;font-size:13px">' +
      esc(t("res.safetyNote", { max: 6 })) + "</div></div>";
  }

  h += '<div style="margin-top:2px">';
  CRITERIA.forEach(c => {
    const v = r.scores[c.key];
    h += '<div class="crit"><div class="cline">' +
      '<span class="cname">' + esc(criterionLabel(c, r.mode, r.process)) + "</span>" +
      '<span class="bar2"><i style="width:' + (v * 10) + "%;background:" + colorFor(v) + '"></i></span>' +
      '<span class="cnum" style="color:' + colorFor(v) + '">' + v.toFixed(1) + "</span></div>" +
      '<div class="cnote">' + esc(r.notes[c.key]) + "</div></div>";
  });
  h += "</div>";

  if (r.grammar && r.grammar.length) {
    h += '<div class="box gerr"><b>' + esc(t("res.grammar")) + "</b><ul>" +
      r.grammar.map(g => "<li>" + esc(g) + "</li>").join("") + "</ul></div>";
  }

  /* Who marked it, on every result - the student should know. Offline
     marking only counts key words, and says so. */
  h += markedBy(r, onRetry);

  h += '<div class="box adv"><b>' + esc(t("res.advice")) + "</b>" + esc(r.advice) + "</div>";
  if (r.tip) h += '<div class="box tip"><b>' + esc(t("res.tip")) + '</b><span class="' +
    (qIsGuOnly(current) ? "guscript" : "") + '">' + esc(qField(current, "tip")) + "</span></div>";

  /* The explanation in the current language. Not needed in English mode - the
     "say it in English like this" section below carries the same words in the
     same language, and reading one paragraph twice confuses rather than helps. */
  h += '<details class="model"><summary>' + esc(t("res.model")) + "</summary>" +
    (getLang() === "en" ? "" :
      (qIsGuOnly(current) ? '<span class="enlab" style="margin-top:0">' + esc(t("res.modelGuOnly")) + "</span>" : "") +
      '<p class="gu' + (qIsGuOnly(current) ? " guscript" : "") + '">' + esc(qField(current, "gu")) + "</p>") +
    '<span class="enlab">' + esc(t("res.modelEn")) + "</span>" +
    '<p class="en" id="modelEn">' + esc(current.en) + "</p>" +
    '<div class="row" style="margin-top:10px;justify-content:flex-start">' +
    '<button class="mini" id="btnHear">' + esc(t("btn.hearModel")) + "</button></div></details>";

  $("result").hidden = false;
  $("result").innerHTML = h;
  if (onRetry) $("btnAiRetry").addEventListener("click", onRetry);

  $("btnHear").addEventListener("click", () => {

    Speech.stopListen(true);
    Avatar.setState("speaking");
    Speech.speak(current.en, { lang: "en", rate: state.settings.rate })
      .then(() => { if (phase === "feedback") Avatar.setState("idle"); });
  });

  revealResult();
}

/* "Marked by AI" or "Marked offline (counts key words)" - and when the AI was
   asked but did not answer, a plain notice that this is the offline score,
   with a button to try the AI again. Shared with the chapter quiz. */
function markedBy(r, onRetry) {
  if (r.byAi) return '<div class="aibadge">' + esc(t("ai.badge")) + "</div>";
  let h = '<div class="aibadge off">' + esc(t("ai.offBadge")) + "</div>";
  if (r.aiFailed) {
    h += '<div class="box aidown" role="status"><b>' + esc(t("ai.downT")) + "</b>" + esc(t("ai.downD")) +
      (onRetry ? '<div style="margin-top:9px"><button class="act ghost sm" id="btnAiRetry">' +
        esc(t("ai.retry")) + "</button></div>" : "") + "</div>";
  }
  return h;
}

/* Bring the result into view and tell a screen reader. On a small phone the
   card lands below the fold, and a tap that seems to do nothing reads as
   broken. Focus goes to the card itself, which is labelled as a status. */
function revealResult() {
  const el = $("result");
  if (!el || el.hidden) return;
  try { el.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { el.scrollIntoView(); }
  try { el.focus({ preventScroll: true }); } catch (e) {}
}

/* ---------------- Progress ---------------- */

function renderProgress() {
  if (Quiz.on()) return;          // that panel is hidden in a chapter quiz
  const h = bucket(course.id).history;
  $("cCount").textContent = h.length;

  if (!h.length) {
    $("cAvg").textContent = "—";
    $("cWeak").textContent = "—";
    $("histwrap").innerHTML = '<div class="empty">' + esc(t("res.empty")) + "</div>";
    return;
  }

  const avg = h.reduce((a, e) => a + e.overall, 0) / h.length;
  $("cAvg").textContent = avg.toFixed(1);
  $("cAvg").style.color = colorFor(avg);
  $("cWeak").textContent = weakestLabel(h, course.mode);

  const rows = h.slice().reverse().slice(0, 12).map(e =>
    "<tr><td>" + esc(tCat(e.cat)) + '</td><td class="n" style="color:' +
    colorFor(e.overall) + '">' + e.overall.toFixed(1) + "</td></tr>").join("");
  $("histwrap").innerHTML =
    "<table><thead><tr><th>" + esc(t("res.thCat")) + "</th><th>" +
    esc(t("res.thScore")) + "</th></tr></thead><tbody>" + rows + "</tbody></table>";
}

/* ---------------- Profile and settings ---------------- */

function paintSettings() {
  const s = state.settings;
  const nm = userName();
  $("setNameVal").textContent = nm || t("set.nameNotSet");
  // Initials of the name in the round avatar - a person icon when there is none
  $("setAva").textContent = nm
    ? nm.trim().split(/\s+/).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join("")
    : "👤";
  $("setVer").textContent = t("set.version", { v: APP_VERSION });
  Stats.renderProfileStats($("profStats"));
  paintAi();
  paintSync();
  $("swHands").classList.toggle("on", !!s.hands);
  $("swAsk").classList.toggle("on", !!s.ask);
  $("swFb").classList.toggle("on", !!s.speakFb);
  $("swHands").setAttribute("aria-checked", !!s.hands);
  $("swAsk").setAttribute("aria-checked", !!s.ask);
  $("swFb").setAttribute("aria-checked", !!s.speakFb);

  // aria-pressed: a screen reader hears which option is chosen
  Array.prototype.forEach.call($("segRate").children, b => {
    const on = Math.abs(parseFloat(b.dataset.r) - s.rate) < 0.02;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  Array.prototype.forEach.call($("segSil").children, b => {
    const on = parseInt(b.dataset.s, 10) === s.silence;
    b.textContent = t("set.sec", { n: parseInt(b.dataset.s, 10) / 1000 });
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });

  paintVoicePick();

  const fbVoice = LANG_VOICE[getLang()] || "en";
  const inUse = Speech.voiceFor(fbVoice);
  const lines = [
    t(Speech.micSupported() ? "diag.micYes" : "diag.micNo"),
    t(Speech.hasVoice("en") ? "diag.enYes" : "diag.enNo"),
    t(Speech.hasVoice(fbVoice) ? "diag.fbYes" : "diag.fbNo")
  ];
  if (inUse) lines.push(t("diag.voiceInUse", { name: voiceLabel(inUse) }));
  $("setDiag").innerHTML = lines.map(l => esc(l)).join("<br>");
}

/* ---------------- The interviewer's voice ----------------

   Automatic by default: a male voice for the app's language wherever the
   phone has one (speech.js). Phones name their voices differently and do not
   say which are male, so an instructor setting a phone up can pick the right
   one here and hear it first. Kept per language. */

function voiceLabel(v) {
  const g = Speech.gender(v);
  return v.name + (g === "m" ? " · " + t("set.voiceMale") : g === "f" ? " · " + t("set.voiceFemale") : "");
}

function paintVoicePick() {
  const lang = LANG_VOICE[getLang()] || "en";
  const list = Speech.voicesFor(lang);
  const sel = $("voiceSel");
  const chosen = (state.settings.voices || {})[lang] || "";
  sel.innerHTML = '<option value="">' + esc(t("set.voiceAuto")) + "</option>" +
    list.map(v => '<option value="' + esc(v.name) + '">' + esc(voiceLabel(v)) + "</option>").join("");
  sel.value = list.some(v => v.name === chosen) ? chosen : "";
  sel.disabled = !list.length;
  $("btnVoiceTest").disabled = !list.length;
  const auto = Speech.voiceFor(lang);
  $("voicePickD").textContent = !list.length ? t("diag.fbNo")
    : t("set.voicePickD", { name: auto ? voiceLabel(auto) : "—" });
}

/* ---------------- Progress backup ----------------

   With PB_URL empty in sync.js the whole section does not appear - the app stays
   the offline app it was. When it is filled in there are three steps:
   sign in -> consent -> sending starts. */

/* ---------------- AI evaluation ----------------

   With JUDGE_URL empty in judge.js the whole section does not appear.

   The consent is deliberately a button, not a switch: the student presses "turn
   on" only after reading what leaves the phone. A stray finger must not send
   answer text out. This is entirely separate from the backup consent. */

/* The AI button on the interview screen. It shares one setting with the button
   in settings - change either and the other follows. */
function paintAiTog() {
  const w = $("aiTog"), b = $("btnAiTog");
  if (!w || !b) return;
  if (!Judge.enabled()) { w.hidden = true; $("aiInfo").hidden = true; return; }
  w.hidden = false;

  const net = Judge.online();
  const on = Judge.consented() && net;
  w.classList.toggle("on", on);
  b.textContent = t(!net ? "ai.chipOffline" : (on ? "ai.chipOn" : "ai.chipOff"));
  if (!$("aiInfo").hidden) paintAiInfo();
}

/* What the badge means, in a sentence or two - and where to change it */
function paintAiInfo() {
  const net = Judge.online(), on = Judge.consented() && net;
  $("aiInfo").textContent = t(!net ? "ai.infoOffline" : (on ? "ai.infoOn" : "ai.infoOff"),
    { profile: uiLabels().profile, ai: uiLabels().ai });
}

function paintAi() {
  const wrap = $("aiWrap");
  if (!Judge.enabled()) { wrap.hidden = true; return; }
  wrap.hidden = false;

  const on = Judge.consented();
  const net = Judge.online();
  $("aiState").textContent = t(!net ? "ai.stOffline" : (on ? "ai.stOn" : "ai.stOff"));
  $("btnAiOn").hidden = on;
  $("btnAiOff").hidden = !on;
}

function paintSync() {
  const wrap = $("syncWrap");
  if (!Sync.enabled()) { wrap.hidden = true; return; }
  wrap.hidden = false;

  const s = Sync.status();
  const show = (id, on) => { $(id).hidden = !on; };

  // One-word status on the row
  $("syncState").textContent =
    !s.signedIn ? t("sync.stOff")
    : !s.consented ? t("sync.stReady")
    : s.pending ? t("sync.stPending", { n: s.pending })
    : t("sync.stOn");

  // Detail - what is pending, when it last went, is anything stuck?
  const bits = [];
  if (s.signedIn) bits.push(t("sync.asName", { name: s.name || "—" }));
  if (s.consented && !s.pending && s.lastAt) {
    bits.push(t("sync.lastAt", { time: new Date(s.lastAt).toLocaleTimeString() }));
  }
  if (s.legacy) bits.push(t("sync.legacy", { n: s.legacy }));
  if (!s.online) bits.push(t("sync.offline"));
  else if (s.error) bits.push(t("sync.err", { e: s.error }));
  $("syncDetail").textContent = bits.join(" · ") || t("sync.never");

  show("btnSyncIn", !s.signedIn);
  show("btnSyncOn", s.signedIn && !s.consented);
  show("btnSyncNow", s.signedIn && s.consented && s.pending > 0);
  show("btnSyncOff", s.signedIn && s.consented);
  show("btnSyncErase", s.signedIn);
  show("btnSyncOut", s.signedIn);
}

function toggle(key, el) {
  state.settings[key] = !state.settings[key];
  save();
  paintSettings();
  if (key === "hands" && phase === "listening") {
    /* Hands-free only decides whether a silence submits the answer, and that is
       fixed when listen() is called - so restart to pick the new setting up.
       The mic stays open either way; closing it here used to end the answer. */
    beginListen($("heard").textContent);
  }
}

/* ---------------- Confirmation dialog ----------------

   In place of the browser's confirm(): states exactly what will happen, in
   the app's language, and colours the button by what it does - red for
   erasing. Focus starts on Cancel, so a stray Enter never erases anything;
   Escape or a tap outside cancels. Resolves true or false. */
function askDialog(o) {
  return new Promise(resolve => {
    const dlg = $("dlg"), yes = $("dlgYes"), no = $("dlgNo");
    const back = document.activeElement;
    $("dlgT").textContent = o.title;
    $("dlgB").textContent = o.body;
    yes.textContent = o.yes;
    no.textContent = o.no || t("btn.cancel");
    yes.className = "act" + (o.danger ? " erase" : "");
    dlg.hidden = false;
    no.focus();

    function done(v) {
      dlg.hidden = true;
      yes.onclick = no.onclick = dlg.onclick = null;
      document.removeEventListener("keydown", onKey, true);
      try { if (back && back.focus) back.focus(); } catch (e) {}
      resolve(v);
    }
    function onKey(ev) {
      if (ev.key === "Escape") { ev.preventDefault(); done(false); }
      // Keep Tab inside the dialog
      if (ev.key === "Tab") {
        ev.preventDefault();
        (document.activeElement === no ? yes : no).focus();
      }
    }
    yes.onclick = () => done(true);
    no.onclick = () => done(false);
    dlg.onclick = ev => { if (ev.target === dlg) done(false); };
    document.addEventListener("keydown", onKey, true);
  });
}

/* ---------------- Wiring ---------------- */

/* The bottom tab bar */
Array.prototype.forEach.call($("tabbar").querySelectorAll(".tab"), b =>
  b.addEventListener("click", () => goTab(b.getAttribute("data-tab"))));

$("btnAiOn").addEventListener("click", () => { Judge.setConsent(true); paintAi(); paintAiTog(); });
$("btnAiOff").addEventListener("click", () => { Judge.setConsent(false); paintAi(); paintAiTog(); });

$("btnAiTog").addEventListener("click", () => {
  const box = $("aiInfo");
  box.hidden = !box.hidden;
  $("btnAiTog").setAttribute("aria-expanded", box.hidden ? "false" : "true");
  if (!box.hidden) paintAiInfo();
});

/* Show the connection coming and going in both places at once - the student
   should know who is marking them right now. */
window.addEventListener("online", () => { paintAiTog(); if (curScreen === "profile") paintAi(); });
window.addEventListener("offline", () => { paintAiTog(); if (curScreen === "profile") paintAi(); });

$("btnHelp").addEventListener("click", () => show("help"));
$("btnHelpBack").addEventListener("click", () => show("profile"));

/* The backup buttons. The app keeps running however badly these fail - hence a
   catch everywhere, with the error surfacing only on the status line. */
Sync.onChange(() => { if (!$("scProfile").hidden) paintSync(); });

$("btnSyncIn").addEventListener("click", () => {
  Sync.signIn().then(paintSync).catch(paintSync);
});
$("btnSyncOn").addEventListener("click", () => {
  askDialog({ title: t("sync.title"), body: t("sync.confirmOn"), yes: t("sync.turnOn") }).then(ok => {
    if (ok) Sync.setConsent(true).then(paintSync).catch(paintSync);
  });
});
$("btnSyncOff").addEventListener("click", () => {
  Sync.setConsent(false).then(paintSync).catch(paintSync);
});
$("btnSyncNow").addEventListener("click", () => {
  Sync.flush().then(paintSync);
});
$("btnSyncOut").addEventListener("click", () => { Sync.signOut(); paintSync(); });
$("btnSyncErase").addEventListener("click", () => {
  askDialog({ title: t("sync.erase"), body: t("sync.confirmErase"), yes: t("set.resetYes"), danger: true }).then(ok => {
    if (!ok) return;
    Sync.eraseRemote()
      .then(n => { toast(t("sync.erased", { n: n })); paintSync(); })
      .catch(paintSync);
  });
});

$("swHands").addEventListener("click", () => toggle("hands"));
$("swAsk").addEventListener("click", () => toggle("ask"));
$("swFb").addEventListener("click", () => toggle("speakFb"));

$("voiceSel").addEventListener("change", () => {
  const lang = LANG_VOICE[getLang()] || "en";
  if (!state.settings.voices || typeof state.settings.voices !== "object") state.settings.voices = {};
  state.settings.voices[lang] = $("voiceSel").value;
  save();
  paintSettings();
});
$("btnVoiceTest").addEventListener("click", () => {
  Speech.prime();
  const lang = LANG_VOICE[getLang()] || "en";
  Speech.speak(t("set.voiceSample"), { lang: lang, rate: state.settings.rate });
});

Array.prototype.forEach.call($("segRate").children, b =>
  b.addEventListener("click", () => { state.settings.rate = parseFloat(b.dataset.r); save(); paintSettings(); }));
Array.prototype.forEach.call($("segSil").children, b =>
  b.addEventListener("click", () => { state.settings.silence = parseInt(b.dataset.s, 10); save(); paintSettings(); }));

/* Both language pickers - on the intro screen and in Profile */
LANG_PICKERS.forEach(id =>
  Array.prototype.forEach.call($(id).children, b =>
    b.addEventListener("click", () => {
      Speech.stopAll();
      if (Dictation.active()) Dictation.abort();
      state.settings.lang = b.getAttribute("data-l");
      save();
      relocalize();
    })));

$("btnReset").addEventListener("click", () => {
  askDialog({ title: t("set.resetT"), body: t("set.resetList"), yes: t("set.resetYes"), danger: true })
    .then(ok => { if (ok) eraseEverything(); });
});

function eraseEverything() {
  state.courses = {};
  state.quiz = {};
  save();
  // Only pull a new question if practice is running - not on the briefing screen
  if (course && !$("scRun").hidden) { renderProgress(); pickQuestion(false); }
  renderBriefIfOpen();
  renderDash();
  paintSettings();       // the profile summary empties too
  toast(t("set.erased"));
}

$("btnSaveName").addEventListener("click", () => finishWelcome($("uname").value));
$("btnSkipName").addEventListener("click", () => { saveTrack(); show("practice"); });
$("uname").addEventListener("keydown", ev => {
  if (ev.key === "Enter") { ev.preventDefault(); finishWelcome($("uname").value); }
});
$("btnChangeName").addEventListener("click", openWelcome);
/* Loads Google's script and shows Google's own button in place of ours - the
   student taps that one to choose their account. */
$("btnGoogle").addEventListener("click", () => {
  $("btnGoogle").disabled = true;
  initGoogle();
});

/* Intro screen - "Get started" asks for a name, "Maybe later" goes straight to
   practice */
$("btnGetStarted").addEventListener("click", () => { Speech.prime(); openWelcome(); });
$("btnMaybeLater").addEventListener("click", () => { Speech.prime(); show("practice"); });

$("btnStart").addEventListener("click", startInterview);
$("btnResume").addEventListener("click", resumeInterview);

/* The end-of-round summary */
function leaveSummary() {
  course = null;
  show("practice");
  renderDash();
}
$("btnSumBack").addEventListener("click", leaveSummary);
$("btnSumDone").addEventListener("click", leaveSummary);
$("btnSumAgain").addEventListener("click", () => {
  if (!course) return leaveSummary();
  startInterview();
});
// Just the skipped questions, as a short round of their own
$("btnSumRetry").addEventListener("click", () => {
  if (!course) return leaveSummary();
  const old = bucket(course.id).round;
  if (!old || !old.skipped.length) return;
  const r = newRound(course, old.skipped);
  r.done = old.done;                   // the summary still covers the whole round
  bucket(course.id).round = r;
  save();
  Speech.prime();
  openRun();
});
$("btnBriefBack").addEventListener("click", leaveCourse);
$("btnBack").addEventListener("click", leaveCourse);
$("btnSkip").addEventListener("click", () => {
  if (!course) return;
  if (Quiz.on()) {
    // Skipping on the last question ends the chapter
    Quiz.skip(current);
    if (Quiz.atLast()) leaveCourse();
    else pickQuestion(true);
    return;
  }
  skipQuestion();
});

/* The two practice modes, and the chapter quiz's own screens */
Array.prototype.forEach.call($("pmodeSeg").children, b =>
  b.addEventListener("click", () => {
    state.settings.pmode = b.getAttribute("data-m");
    save();
    renderTiles();
  }));
$("btnChapBack").addEventListener("click", () => goTab("practice"));
$("btnRepBack").addEventListener("click", () => Quiz.backToChapters());
$("btnRepAgain").addEventListener("click", () => Quiz.again());
$("btnRepDone").addEventListener("click", () => Quiz.backToChapters());
$("btnRepeat").addEventListener("click", () => {
  Speech.stopListen(true);
  setPhase("asking");
  /* Through sayQuestion, on the same generation counter as askQuestion. Repeating
     while the question is still being asked cancels that ask, and a cancelled ask
     that still held the current generation would fall back to English on top of
     this one - the same fault as skipping mid-sentence. */
  const gen = ++askGen;
  sayQuestion(gen).then(spoken => {
    if (gen !== askGen || phase !== "asking") return;
    if (!spoken) { setPhase("ready"); return; }
    if (inputMode === "speak" && canListen()) beginListen();
    else setPhase("ready");
  });
});

$("btnAct").addEventListener("click", () => {
  if (phase === "asking") { Speech.cancelSpeech(); beginListen(); return; }
  if (phase === "listening") {
    if (Dictation.active()) {
      /* The recording still has to travel and be transcribed, which is seconds,
         not milliseconds. Say so: an unexplained pause here reads as a crash. */
      setPhase("scoring");
      $("status").textContent = t("status.transcribing");

      const q = current, lang = getLang(), needsEn = qNeedsEnglish(current);
      /* Transcript only, for the word match: a book-quiz answer is taken
         down in the question's language (see answerLang). With AI marking
         the app's own language stays, because that call also writes the
         feedback in it. */
      const sttLang = q.quiz ? answerLang() : lang;
      const useText = txt => {
        const full = [dictationSeed, txt].filter(Boolean).join(" ").trim();
        $("heard").textContent = full;
        return full;
      };

      /* A voice was recorded but no words came back. Transcribed as English,
         an answer given in Gujarati can come back empty (and the other way
         round), so try the student's other language once before giving up -
         that costs seconds, not the answer. */
      const otherLang = sttLang === "en" ? (lang === "hi" ? "hi" : "gu") : "en";
      const transcribeOnly = payload => Dictation.transcribe(payload, sttLang)
        .then(txt => txt || Dictation.transcribe(payload, otherLang))
        .then(txt => {
          const full = useText(txt);
          if (full) return submit(full);
          notCaught();
        });

      Dictation.stop().then(payload => {
        if (!payload) return submit("");          // nothing was said

        /* With AI marking on, one call transcribes AND marks - a whole round
           trip less for the student to sit through. If it comes back empty,
           fall back to transcribing alone: that costs time, not the answer. */
        if (Judge.active()) {
          return Judge.fromAudio(payload, q, course.mode, lang, needsEn).then(r => {
            if (r && r.text) return submit(useText(r.text), r);
            return transcribeOnly(payload);
          });
        }
        return transcribeOnly(payload);
      });
      return;
    }
    // Not `t`: that shadows the i18n t() for this whole block, and the
    // dictation branch above calls it.
    const said = Speech.stopListen(true);
    submit(said || $("heard").textContent);
    return;
  }
  if (phase === "feedback") {
    Speech.cancelSpeech();
    if (atLastQuestion()) {                // the end of the chapter / the round
      if (Quiz.on()) leaveCourse();
      else endRound();
      return;
    }
    pickQuestion(true);                    // the next question in the order
    return;
  }
  if (phase === "ready") { beginListen(); return; }
});

Array.prototype.forEach.call($("inModeSeg").children, b =>
  b.addEventListener("click", () => {
    const m = b.getAttribute("data-m");
    if (m === "speak") micOff = false;          // they want to try the mic again
    setInputMode(m);
    if (m === "type") $("ans").focus();
  }));

$("btnCheck").addEventListener("click", () => submit($("ans").value));

/* ---------------- When a new version arrives ----------------
   sw.js serves scripts from the cache, so even once a new service worker takes
   over, an open page keeps running the old JS - the student would have to reopen
   the app themselves, and nobody does. So we refresh it for them.

   But never mid-answer: reloading while they are speaking loses everything they
   said. It happens only on leaving the interview. */
let swFresh = false;

function reloadIfIdle() {
  if (!swFresh) return;
  if (curScreen === "run" || curScreen === "brief") return;
  swFresh = false;
  location.reload();
}

if (navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener("message", ev => {
    if (!ev.data || ev.data.type !== "sw-updated") return;
    swFresh = true;
    reloadIfIdle();
  });
}

$("btnClear").addEventListener("click", () => {
  $("heard").textContent = "";
  $("ans").value = "";
  if (phase === "listening") { stopListening(); setPhase("ready"); }
});

/* Mic and speaker both stop when the app goes to the background - for battery
   and for privacy. The question clock pauses too, so time spent with the app put
   away is never counted.

   Going hidden is not always the student walking away: with the wake lock
   unavailable or refused, Android's screen timeout lands here too, in the middle
   of an answer. So remember that we were listening, and pick the answer back up
   on return with everything heard so far - rather than silently dropping them on
   "Ready" having lost the rest of what they said. */
let micCutWhileHidden = false;

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    qClockPause();

    /* Dictation is ONE recording for the whole answer, and unlike the
       SpeechRecognition path there is no interim text on screen to fall back
       on - tearing it down here would throw away everything the student has
       said so far. So leave it running: the browser suspends and resumes the
       capture itself, and what was already recorded survives. Only the speaker
       is stopped. */
    if (Dictation.active()) { Speech.cancelSpeech(); return; }

    micCutWhileHidden = phase === "listening";
    Speech.stopAll();
    if (phase === "listening" || phase === "asking") setPhase("ready");
  } else if (!$("scRun").hidden) {
    qClockResume();
    if (micCutWhileHidden) {
      micCutWhileHidden = false;
      beginListen($("heard").textContent);
    }
  }
});

/* ---------------- Startup ---------------- */

loadState();
// The voice an instructor picked in Profile, per language ("" = automatic)
Speech.setChooser(lang => (state.settings.voices && state.settings.voices[lang]) || "");
/* Phones list their voices late. Repaint the voice picker when they arrive,
   if Profile is open. */
if (window.speechSynthesis && window.speechSynthesis.addEventListener) {
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    setTimeout(() => { if (curScreen === "profile") paintSettings(); }, 0);
  });
}
setLang(state.settings.lang);
applyI18n();
paintLang();
paintSettings();
renderDash();

/* No name yet: introduce the app first. Name known: show progress if they have
   practised, otherwise go straight to the practice tab (a course list is more
   use than an empty chart). */
if (!state.user) show("splash");
else show(allHistory().length ? "stats" : "practice");

/* Send any pending progress when the app opens - a no-op when backup is off.
   Not right at startup but slightly after: let the first screen paint. */
setTimeout(() => { try { Sync.flush(); } catch (e) {} }, 2500);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
