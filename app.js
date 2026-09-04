/* એપ લોજિક — સ્ક્રીન, કોર્સ પસંદગી, અવતાર સાથેનો વાણી-સંવાદ, પરિણામ અને પ્રગતિ */
"use strict";

const STORE = "interview_practice_gu_v2";
const OLD_STORE = "interview_practice_gu_v1";
const $ = id => document.getElementById(id);

const esc = s => String(s == null ? "" : s)
  .replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const colorFor = n => n >= 7.5 ? "var(--good)" : n >= 5 ? "var(--mid)" : "var(--low)";

/* ---------------- સંગ્રહ ---------------- */

/* ---------------- Google સાઇન-ઇન ----------------

   Client ID જાહેર માહિતી છે — તે દરેક વેબ એપની સ્ક્રિપ્ટમાં દેખાય જ છે.
   (Client SECRET કદી અહીં ન મુકવું — તે ફક્ત સર્વર પર રહે.)

   ⚠ ચાલવા માટે Google Cloud Console માં «Authorized JavaScript origins»
   માં એપનું સરનામું નોંધાયેલું હોવું જરૂરી છે, જેમ કે:
       https://<તમારુંનામ>.github.io
       http://localhost:8123          (કમ્પ્યુટર પર ટેસ્ટ કરવા માટે)
   સરનામું નોંધ્યું ન હોય તો Google «origin_mismatch» ભૂલ આપે અને બટન ચાલે નહીં.

   નોંધ: આર્ટિફેક્ટની અંદર Google ની સ્ક્રિપ્ટ બ્લોક થાય છે, તેથી બટન ત્યાં
   દેખાતું નથી — ત્યાં નામનું ખાનું વાપરો. તમારા પોતાના સરનામે જ ચાલશે.

   ટોકનમાંથી ફક્ત નામ વાંચીએ છીએ. ઈમેલ કે ફોટો સાચવતા નથી, અને કોઈ
   પરવાનગી કે સલામતી આ ટોકન પર આધારિત નથી. */
const GOOGLE_CLIENT_ID = "604155826405-15oddjk71jr042kbe4bk3j02kdgt547e.apps.googleusercontent.com";

const DEFAULTS = { hands: true, ask: true, speakFb: true, rate: 0.92, silence: 3000, lang: "en" };

let state = { settings: Object.assign({}, DEFAULTS), courses: {}, user: null };

function loadState() {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p === "object") {
        state.settings = Object.assign({}, DEFAULTS, p.settings || {});
        state.courses = p.courses && typeof p.courses === "object" ? p.courses : {};
        state.user = (p.user && typeof p.user === "object") ? p.user : null;
        return;
      }
    }
    // જૂની આવૃત્તિનો ડેટા સાચવી લો (પહેલાં ફક્ત ઇન્ટરવ્યુ વિભાગ હતો)
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

/* ---------------- વપરાશકર્તાનું નામ ---------------- */

function userName() {
  return (state.user && state.user.name) ? String(state.user.name).trim() : "";
}

/* નામનો પહેલો શબ્દ — ઇન્ટરવ્યુમાં «Hello Ravi» એમ સંબોધવા માટે */
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

/* ---------------- ચાલુ સત્ર ---------------- */

let course = null;      // ચાલુ કોર્સ
let current = null;      // ચાલુ પ્રશ્ન
let phase = "idle";      // idle · asking · listening · scoring · feedback
let lastResult = null;

/* ---------------- હોમ સ્ક્રીન ---------------- */

function renderHome() {
  $("tiles").innerHTML = COURSES.map(c => {
    const b = bucket(c.id);
    const n = b.history.length;
    const avg = n ? (b.history.reduce((a, e) => a + e.overall, 0) / n) : 0;
    const meta = n
      ? '<div class="mt done">' + esc(t("tile.done", { n: n, a: avg.toFixed(1) })) + "</div>"
      : '<div class="mt">' + esc(t("tile.questions", { n: c.questions.length })) + "</div>";
    return '<button class="tile" data-id="' + esc(c.id) + '">' +
      '<div class="ic">' + esc(c.icon) + "</div>" +
      '<div class="nm">' + esc(tCourse(c, "name")) + "</div>" +
      '<div class="tg">' + esc(tCourse(c, "tagline")) + "</div>" + meta + "</button>";
  }).join("");

  Array.prototype.forEach.call($("tiles").querySelectorAll(".tile"), el => {
    el.addEventListener("click", () => openCourse(el.getAttribute("data-id")));
  });

  // નામ ખબર હોય તો હોમ સ્ક્રીન પર નામથી સંબોધો
  const fn = firstName();
  $("homeHeading").textContent = fn
    ? t("home.hello", { name: fn })
    : t("home.heading");

  const h = allHistory();
  $("hCount").textContent = h.length;
  if (!h.length) { $("hAvg").textContent = "—"; $("hWeak").textContent = "—"; return; }
  const avg = h.reduce((a, e) => a + e.overall, 0) / h.length;
  $("hAvg").textContent = avg.toFixed(1);
  $("hAvg").style.color = colorFor(avg);
  $("hWeak").textContent = weakestLabel(h);
}

/* સૌથી નબળો માપદંડ. mode આપ્યો હોય તો તકનીકી કોર્સનું નામ વપરાય. */
function weakestLabel(h, mode) {
  const avgs = CRITERIA.map(c => ({
    label: criterionLabel(c, mode),
    v: h.reduce((a, e) => a + ((e.scores && e.scores[c.key]) || 0), 0) / h.length
  }));
  avgs.sort((a, b) => a.v - b.v);
  return avgs[0].label;
}

/* ---------------- ભાષા ---------------- */

/* પ્રશ્નનું કોચિંગ લખાણ (gu = સમજૂતી, tip = સૂચન) ચાલુ ભાષામાં.

   પ્રશ્નમાં આ રીતે ઉમેરો તો બીજી ભાષા વપરાશે:
     i18n: { en: { gu: "…", tip: "…" }, hi: { gu: "…", tip: "…" } }
   ન ઉમેરો તો મૂળ ગુજરાતી લખાણ દેખાય — એપ તૂટતી નથી. */
function qField(q, field) {
  const lang = getLang();
  if (lang !== "gu" && q.i18n && q.i18n[lang] && q.i18n[lang][field] != null) {
    return q.i18n[lang][field];
  }
  return q[field];
}

/* આ પ્રશ્નની સમજૂતી ભાષાંતર થઈ નથી? (તો વિદ્યાર્થીને જણાવીએ) */
function qIsGuOnly(q) {
  const lang = getLang();
  return lang !== "gu" && !(q.i18n && q.i18n[lang] && q.i18n[lang].gu != null);
}

function paintLang() {
  Array.prototype.forEach.call($("langSeg").children, b =>
    b.classList.toggle("on", b.getAttribute("data-l") === getLang()));
}

/* ભાષા બદલાય ત્યારે આખી સ્ક્રીન ફરી લખો */
function relocalize() {
  setLang(state.settings.lang);
  applyI18n();
  paintLang();
  renderHome();
  if (course) {
    renderBrief();
    $("runName").textContent = tCourse(course, "name");
    if (current) $("qcat").textContent = tCat(current.cat);
    renderProgress();
    if (lastResult) showResult(lastResult);
    if (!$("scRun").hidden) setPhase(phase === "idle" ? "ready" : phase);
  }
  if (!$("sheet").hidden) paintSettings();
}

/* ---------------- સ્ક્રીન બદલવી ---------------- */

function show(which) {
  $("scWelcome").hidden = which !== "welcome";
  $("scHome").hidden = which !== "home";
  $("scBrief").hidden = which !== "brief";
  $("scRun").hidden = which !== "run";
  window.scrollTo(0, 0);
}

/* ---------------- પહેલી વારની સ્ક્રીન (નામ) ---------------- */

function openWelcome() {
  $("uname").value = userName();
  show("welcome");
  initGoogle();
}

function finishWelcome(name, via) {
  setUser(name, via || "typed");
  relocalize();          // «નમસ્તે, રવિ» વગેરે ફરી લખાય
  show("home");
}

/* Google સાઇન-ઇન — GOOGLE_CLIENT_ID ભરેલો હોય તો જ બટન દેખાય.
   ટોકનમાંથી ફક્ત નામ વાંચીએ છીએ; કોઈ પરવાનગી એના પર આધારિત નથી,
   તેથી અહીં ટોકનની ખરાઈ કરવાની જરૂર નથી. */
let googleTried = false;

function initGoogle() {
  if (!GOOGLE_CLIENT_ID || googleTried) return;
  googleTried = true;
  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.async = true;
  s.defer = true;
  s.onload = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: onGoogleCredential,
        auto_select: false,          // જાતે સાઇન-ઇન ન કરો — વિદ્યાર્થી પોતે દબાવે
        cancel_on_tap_outside: true
      });
      window.google.accounts.id.renderButton($("gbtn"), {
        theme: "outline", size: "large", shape: "pill",
        text: "signup_with", width: 280
      });
      $("gwrap").hidden = false;
    } catch (e) {
      googleTried = false;         // ફરી પ્રયત્ન થઈ શકે
      $("gwrap").hidden = true;
    }
  };
  /* સ્ક્રિપ્ટ બ્લોક થાય કે ઇન્ટરનેટ ન હોય તો ચૂપચાપ નામના ખાના પર જ રહો.
     googleTried પાછું ખોલીએ, જેથી ઇન્ટરનેટ આવે પછી ફરી પ્રયત્ન થાય. */
  s.onerror = () => { googleTried = false; $("gwrap").hidden = true; };
  document.head.appendChild(s);
}

/* Google માંથી ફક્ત નામ લઈએ — ઈમેલ કે ફોટો સાચવતા નથી */
function onGoogleCredential(res) {
  const p = res && res.credential ? decodeJwt(res.credential) : null;
  if (p && p.name) finishWelcome(p.name, "google");
}

function decodeJwt(jwt) {
  try {
    const part = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(part);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (e) { return null; }
}

/* કોર્સ પસંદ થાય → પહેલાં સૂચના સ્ક્રીન, પ્રશ્નો પછી */
function openCourse(id) {
  const c = getCourse(id);
  if (!c) return;
  Speech.prime();                 // વપરાશકર્તાનો ટૅપ — અહીં જ TTS જગાડી લેવો પડે
  course = c;
  renderBrief();
  show("brief");
}

function renderBriefIfOpen() {
  if (course && !$("scBrief").hidden) renderBrief();
}

function renderBrief() {
  const n = course.questions.length;
  $("briefIcon").textContent = course.icon;
  $("briefName").textContent = tCourse(course, "name");
  // આશરે દોઢ મિનિટ પ્રતિ પ્રશ્ન — પુછાવું, જવાબ આપવો અને મૂલ્યાંકન વાંચવું
  $("briefMeta").textContent = t("brief.meta", { n: n, m: Math.round(n * 1.5) });
  $("briefI3").textContent = t("brief.i3", { n: n });
}

/* «મૉક ઇન્ટરવ્યુ શરૂ કરો» — અહીંથી ખરી પ્રેક્ટિસ ચાલુ થાય */
function startInterview() {
  if (!course) { show("home"); return; }
  Speech.prime();                 // પહેલા speak() પહેલાંનો ટૅપ
  // મૉક ઇન્ટરવ્યુ હંમેશા પહેલા પ્રશ્નથી શરૂ થાય
  if (isSequential()) { bucket(course.id).pos = 0; save(); }
  $("runName").textContent = tCourse(course, "name");
  show("run");
  Avatar.mount($("av"));
  renderProgress();
  pickQuestion(false);
}

function leaveCourse() {

  Speech.stopAll();
  Avatar.setState("idle");
  phase = "idle";
  course = null;
  show("home");
  renderHome();
}

/* ---------------- પ્રશ્ન પસંદગી ---------------- */

/* ક્રમમાં ચાલતો કોર્સ છે? (ઇન્ટરવ્યુ સામાન્ય — order યાદી પ્રમાણે) */
function isSequential() { return !!(course && Array.isArray(course.order) && course.order.length); }

/* છેલ્લો પ્રશ્ન પુછાઈ ગયો? */
function atLastQuestion() {
  if (!isSequential()) return false;
  return bucket(course.id).pos >= course.order.length - 1;
}

/* advance = true હોય તો ક્રમમાં આગળ વધો; false હોય તો ચાલુ સ્થાન પર જ રહો */
function pickQuestion(advance) {
  const b = bucket(course.id);
  const qs = course.questions;

  if (isSequential()) {
    if (advance) b.pos++;
    if (b.pos >= course.order.length) b.pos = 0;      // ફરી શરૂથી
    const id = course.order[b.pos];
    current = qs.filter(q => q.id === id)[0] || qs[b.pos];
    $("runProg").textContent = (b.pos + 1) + "/" + course.order.length;
  } else {
    let pool = qs.map((_, i) => i).filter(i => b.asked.indexOf(i) === -1);
    if (!pool.length) { b.asked = []; pool = qs.map((_, i) => i); }
    const idx = pool[Math.floor(Math.random() * pool.length)];
    current = qs[idx];
    b.asked.push(idx);
    $("runProg").textContent = b.asked.length + "/" + qs.length;
  }
  save();

  $("qcat").textContent = tCat(current.cat);
  $("qtext").textContent = current.q;      // પ્રશ્ન હંમેશા અંગ્રેજીમાં

  /* પહેલા પ્રશ્ન પહેલાં ઇન્ટરવ્યુ લેનારનું અભિવાદન — નામ સાથે.
     આ અંગ્રેજીમાં જ રહે છે, કારણ કે ઇન્ટરવ્યુ લેનાર અંગ્રેજી બોલે છે. */
  const greet = greetingLine();
  $("qgreet").hidden = !greet;
  $("qgreet").textContent = greet;
  $("heard").textContent = "";
  $("ans").value = "";
  $("result").hidden = true;
  $("result").innerHTML = "";
  $("typeWrap").hidden = true;
  $("btnType").classList.remove("on");
  lastResult = null;

  askQuestion();
}

/* અભિવાદન — ફક્ત ક્રમવાળા કોર્સના પહેલા પ્રશ્ન પર, અને greet:true હોય તો.
   હંમેશા અંગ્રેજીમાં, કારણ કે ઇન્ટરવ્યુ લેનાર અંગ્રેજી બોલે છે. */
function greetingLine() {
  if (!course || !course.greet || !isSequential()) return "";
  if (bucket(course.id).pos !== 0) return "";
  const fn = firstName();
  return fn
    ? "Hello " + fn + ". Thank you for coming in today. Let's begin."
    : "Hello. Thank you for coming in today. Let's begin.";
}

/* ---------------- અવતાર પ્રશ્ન પૂછે ---------------- */

function askQuestion() {

  Speech.stopAll();

  if (!state.settings.ask || !Speech.supported()) {
    setPhase("ready");
    return;
  }
  setPhase("asking");
  Speech.speak(spokenQuestion(), { lang: "en", rate: state.settings.rate }).then(() => {
    if (phase !== "asking") return;                // વચ્ચે વિદ્યાર્થીએ કંઈ કર્યું
    if (state.settings.hands && Speech.micSupported()) beginListen();
    else setPhase("ready");
  });
}

/* અવતાર જે બોલે — અભિવાદન (હોય તો) અને પછી પ્રશ્ન */
function spokenQuestion() {
  const g = $("qgreet").hidden ? "" : $("qgreet").textContent;
  return (g ? g + " " : "") + current.q;
}

/* ---------------- વિદ્યાર્થી બોલે ---------------- */

function beginListen() {
  if (!Speech.micSupported()) {
    setPhase("ready");
    showTypeFallback("આ ફોનમાં બોલીને લખવાની સુવિધા નથી. જવાબ ટાઇપ કરો.");
    return;
  }
  Speech.cancelSpeech();
  setPhase("listening");

  const ok = Speech.listen({
    lang: "en-IN",
    silenceMs: state.settings.hands ? state.settings.silence : 0,
    onInterim: txt => { $("heard").textContent = txt; },
    onSilence: txt => { $("heard").textContent = txt; submit(txt); },
    onError: err => onMicError(err)
  });
  if (!ok) setPhase("ready");
}

function onMicError(err) {
  setPhase("ready");
  const h = $("hint");
  h.className = "hint warn";
  if (err === "not-allowed" || err === "service-not-allowed") h.textContent = t("err.mic.denied");
  else if (err === "network") h.textContent = t("err.mic.network");
  else if (err === "unsupported") h.textContent = t("err.mic.unsupported");
  else h.textContent = t("err.mic.other", { e: err });
  showTypeFallback(null);
}

function showTypeFallback(msg) {
  $("typeWrap").hidden = false;
  $("btnType").classList.add("on");
  if (msg) { $("hint").className = "hint warn"; $("hint").textContent = msg; }
}

/* ---------------- જવાબ તપાસો ---------------- */

function submit(text) {
  const ans = String(text || "").trim();
  Speech.stopListen(true);

  if (!ans) {
    setPhase("ready");
    $("result").hidden = false;
    $("result").innerHTML = '<div class="err">' + esc(t("res.noAnswer")) + "</div>";
    return;
  }

  setPhase("scoring");
  $("heard").textContent = ans;

  // તપાસ તરત થાય છે; અવતાર «વિચારે» તે દેખાડવા સહેજ થોભો
  setTimeout(() => {
    const r = scoreAnswer(ans, current, course.mode);
    lastResult = r;

    bucket(course.id).history.push({
      ts: Date.now(), course: course.id, q: current.q, cat: current.cat,
      answer: ans, overall: r.overall, scores: r.scores,
      weakest: r.weakest, missed: r.missingMust
    });
    save();

    showResult(r);
    renderProgress();
    setPhase("feedback");
    speakFeedback(r);
  }, 420);
}

/* ચાલુ ભાષામાં ટૂંકો સાર બોલો — બધું નહીં, ફક્ત જે કામનું છે */
function speakFeedback(r) {
  const voice = LANG_VOICE[getLang()] || "en";
  if (!state.settings.speakFb || !Speech.hasVoice(voice)) return;

  let msg = t("fb.spoken", { v: r.overall.toFixed(1) });
  if (r.missingMust && r.missingMust.length) {
    msg += t("fb.spokenSafety", { list: r.missingMust.map(tMust).join(", ") });
  }
  msg += r.advice;

  Speech.speak(msg, { lang: voice, rate: state.settings.rate }).then(() => {
    if (phase === "feedback") Avatar.setState("idle");
  });
}

/* ---------------- સ્થિતિ પ્રમાણે સ્ક્રીન ---------------- */

/* દરેક સ્થિતિ માટે અવતાર, સ્થિતિનું લખાણ અને બટન. લખાણ i18n કી છે. */
const PHASE_UI = {
  ready:     { av: "idle",      cls: "",    st: "status.ready",     btn: "btn.answer",      rec: false },
  asking:    { av: "speaking",  cls: "",    st: "status.asking",    btn: "btn.startAnswer", rec: false },
  listening: { av: "listening", cls: "rec", st: "status.listening", btn: "btn.done",        rec: true  },
  scoring:   { av: "thinking",  cls: "",    st: "status.scoring",   btn: "btn.checking",    rec: false },
  feedback:  { av: "speaking",  cls: "ok",  st: "status.feedback",  btn: "btn.next",        rec: false }
};

function setPhase(p) {

  if (!PHASE_UI[p]) p = "ready";
  phase = p;
  const u = PHASE_UI[p];
  Avatar.setState(u.av);
  $("status").textContent = t(u.st);
  $("status").className = "status " + u.cls;
  const b = $("btnAct");
  // ક્રમવાળા કોર્સનો છેલ્લો પ્રશ્ન પતે તો «આગળનો પ્રશ્ન» નહીં, «પૂરું કરો»
  b.textContent = (p === "feedback" && atLastQuestion()) ? t("btn.finish") : t(u.btn);
  b.className = "act" + (u.rec ? " rec" : "");
  b.disabled = p === "scoring";
  if (p === "ready" || p === "asking") { $("hint").className = "hint"; $("hint").textContent = ""; }
}

/* ---------------- પરિણામ દેખાડો ---------------- */

function showResult(r) {
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
      '<span class="cname">' + esc(criterionLabel(c, r.mode)) + "</span>" +
      '<span class="bar2"><i style="width:' + (v * 10) + "%;background:" + colorFor(v) + '"></i></span>' +
      '<span class="cnum" style="color:' + colorFor(v) + '">' + v.toFixed(1) + "</span></div>" +
      '<div class="cnote">' + esc(r.notes[c.key]) + "</div></div>";
  });
  h += "</div>";

  if (r.grammar && r.grammar.length) {
    h += '<div class="box gerr"><b>' + esc(t("res.grammar")) + "</b><ul>" +
      r.grammar.map(g => "<li>" + esc(g) + "</li>").join("") + "</ul></div>";
  }

  h += '<div class="box adv"><b>' + esc(t("res.advice")) + "</b>" + esc(r.advice) + "</div>";
  if (r.tip) h += '<div class="box tip"><b>' + esc(t("res.tip")) + '</b><span class="' +
    (qIsGuOnly(current) ? "guscript" : "") + '">' + esc(qField(current, "tip")) + "</span></div>";

  h += '<details class="model"><summary>' + esc(t("res.model")) + "</summary>" +
    (qIsGuOnly(current) ? '<span class="enlab" style="margin-top:0">' + esc(t("res.modelGuOnly")) + "</span>" : "") +
    '<p class="gu' + (qIsGuOnly(current) ? " guscript" : "") + '">' + esc(qField(current, "gu")) + "</p>" +
    '<span class="enlab">' + esc(t("res.modelEn")) + "</span>" +
    '<p class="en" id="modelEn">' + esc(current.en) + "</p>" +
    '<div class="row" style="margin-top:10px;justify-content:flex-start">' +
    '<button class="mini" id="btnHear">' + esc(t("btn.hearModel")) + "</button></div></details>";

  $("result").hidden = false;
  $("result").innerHTML = h;

  $("btnHear").addEventListener("click", () => {

    Speech.stopListen(true);
    Avatar.setState("speaking");
    Speech.speak(current.en, { lang: "en", rate: state.settings.rate })
      .then(() => { if (phase === "feedback") Avatar.setState("idle"); });
  });

  $("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------------- પ્રગતિ ---------------- */

function renderProgress() {
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

/* ---------------- સેટિંગ ---------------- */

function paintSettings() {
  const s = state.settings;
  $("setNameVal").textContent = userName() || t("set.nameNotSet");
  $("swHands").classList.toggle("on", !!s.hands);
  $("swAsk").classList.toggle("on", !!s.ask);
  $("swFb").classList.toggle("on", !!s.speakFb);
  $("swHands").setAttribute("aria-checked", !!s.hands);
  $("swAsk").setAttribute("aria-checked", !!s.ask);
  $("swFb").setAttribute("aria-checked", !!s.speakFb);

  Array.prototype.forEach.call($("segRate").children, b =>
    b.classList.toggle("on", Math.abs(parseFloat(b.dataset.r) - s.rate) < 0.02));
  Array.prototype.forEach.call($("segSil").children, b => {
    b.textContent = t("set.sec", { n: parseInt(b.dataset.s, 10) / 1000 });
    b.classList.toggle("on", parseInt(b.dataset.s, 10) === s.silence);
  });

  const fbVoice = LANG_VOICE[getLang()] || "en";
  const lines = [
    t(Speech.micSupported() ? "diag.micYes" : "diag.micNo"),
    t(Speech.hasVoice("en") ? "diag.enYes" : "diag.enNo"),
    t(Speech.hasVoice(fbVoice) ? "diag.fbYes" : "diag.fbNo")
  ];
  $("setDiag").innerHTML = lines.map(l => esc(l)).join("<br>");
}

function toggle(key, el) {
  state.settings[key] = !state.settings[key];
  save();
  paintSettings();
  if (key === "hands" && !state.settings.hands && phase === "listening") {
    // હાથ વગરનો મોડ બંધ કર્યો — મૌન પર જાતે તપાસવાનું બંધ કરો
    Speech.stopListen(true);
    setPhase("ready");
  }
}

/* ---------------- જોડાણ ---------------- */

$("btnSet").addEventListener("click", () => { paintSettings(); $("sheet").hidden = false; });
$("btnCloseSet").addEventListener("click", () => { $("sheet").hidden = true; });
$("sheet").addEventListener("click", ev => { if (ev.target === $("sheet")) $("sheet").hidden = true; });

$("swHands").addEventListener("click", () => toggle("hands"));
$("swAsk").addEventListener("click", () => toggle("ask"));
$("swFb").addEventListener("click", () => toggle("speakFb"));

Array.prototype.forEach.call($("segRate").children, b =>
  b.addEventListener("click", () => { state.settings.rate = parseFloat(b.dataset.r); save(); paintSettings(); }));
Array.prototype.forEach.call($("segSil").children, b =>
  b.addEventListener("click", () => { state.settings.silence = parseInt(b.dataset.s, 10); save(); paintSettings(); }));

Array.prototype.forEach.call($("langSeg").children, b =>
  b.addEventListener("click", () => {
    Speech.stopAll();
    state.settings.lang = b.getAttribute("data-l");
    save();
    relocalize();
  }));

$("btnReset").addEventListener("click", () => {
  if (!confirm(t("set.resetAsk"))) return;
  state.courses = {};
  save();
  $("sheet").hidden = true;
  // પ્રેક્ટિસ ચાલુ હોય તો જ નવો પ્રશ્ન લાવો — સૂચના સ્ક્રીન પર હોઈએ તો નહીં
  if (course && !$("scRun").hidden) { renderProgress(); pickQuestion(false); }
  renderBriefIfOpen();
  renderHome();
});

$("btnSaveName").addEventListener("click", () => finishWelcome($("uname").value));
$("btnSkipName").addEventListener("click", () => { show("home"); });
$("uname").addEventListener("keydown", ev => {
  if (ev.key === "Enter") { ev.preventDefault(); finishWelcome($("uname").value); }
});
$("btnChangeName").addEventListener("click", () => { $("sheet").hidden = true; openWelcome(); });

$("btnStart").addEventListener("click", startInterview);
$("btnBriefBack").addEventListener("click", leaveCourse);
$("btnBack").addEventListener("click", leaveCourse);
$("btnSkip").addEventListener("click", () => { if (course) pickQuestion(true); });
$("btnRepeat").addEventListener("click", () => {
  Speech.stopListen(true);
  setPhase("asking");
  Speech.speak(spokenQuestion(), { lang: "en", rate: state.settings.rate }).then(() => {
    if (phase !== "asking") return;
    if (state.settings.hands && Speech.micSupported()) beginListen();
    else setPhase("ready");
  });
});

$("btnAct").addEventListener("click", () => {
  if (phase === "asking") { Speech.cancelSpeech(); beginListen(); return; }
  if (phase === "listening") { const t = Speech.stopListen(true); submit(t || $("heard").textContent); return; }
  if (phase === "feedback") {
    Speech.cancelSpeech();
    if (atLastQuestion()) leaveCourse();   // મૉક ઇન્ટરવ્યુ પૂરો
    else pickQuestion(true);               // ક્રમમાં આગળનો પ્રશ્ન
    return;
  }
  if (phase === "ready") { beginListen(); return; }
});

$("btnType").addEventListener("click", () => {
  const wrap = $("typeWrap");
  wrap.hidden = !wrap.hidden;
  $("btnType").classList.toggle("on", !wrap.hidden);
  if (!wrap.hidden) {
    if (phase === "listening") { Speech.stopListen(true); setPhase("ready"); }
    Speech.cancelSpeech();
    $("ans").value = $("heard").textContent.trim();
    $("ans").focus();
  }
});

$("btnCheck").addEventListener("click", () => submit($("ans").value));

$("btnClear").addEventListener("click", () => {
  $("heard").textContent = "";
  $("ans").value = "";
  if (phase === "listening") { Speech.stopListen(true); setPhase("ready"); }
});

/* એપ પાછળ જાય તો માઇક અને સ્પીકર બંધ — બેટરી અને પ્રાઇવસી બંને માટે */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    Speech.stopAll();
    if (phase === "listening" || phase === "asking") setPhase("ready");
  }
});

/* ---------------- શરૂઆત ---------------- */

loadState();
setLang(state.settings.lang);
applyI18n();
paintLang();
renderHome();

/* પહેલી વાર એપ ખૂલે અને નામ ખબર ન હોય તો પહેલાં નામ પૂછો */
if (state.user) show("home"); else openWelcome();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
