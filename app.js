/* એપ લોજિક — સ્ક્રીન, કોર્સ પસંદગી, અવતાર સાથેનો વાણી-સંવાદ, પરિણામ અને પ્રગતિ */
"use strict";

const STORE = "interview_practice_gu_v2";
const OLD_STORE = "interview_practice_gu_v1";
const APP_VERSION = "1.1";
const $ = id => document.getElementById(id);

const esc = s => String(s == null ? "" : s)
  .replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const colorFor = n => n >= 7.5 ? "var(--good)" : n >= 5 ? "var(--mid)" : "var(--low)";

/* દરેક જવાબની પોતાની ઓળખ — બૅકઅપ બમણો ન થાય તે માટે.
   randomUUID ફક્ત https/localhost પર મળે છે, તેથી પડતી વ્યવસ્થા રાખી છે. */
function newCid() {
  try {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  return "c" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

/* ---------------- સંગ્રહ ---------------- */

/* ---------------- Google સાઇન-ઇન ----------------

   Client ID જાહેર માહિતી છે — તે દરેક વેબ એપની સ્ક્રિપ્ટમાં દેખાય જ છે.
   (Client SECRET કદી અહીં ન મુકવું — તે ફક્ત સર્વર પર રહે.)

   ⚠ ચાલવા માટે Google Cloud Console → APIs & Services → Credentials →
   (આ OAuth client) → «Authorized JavaScript origins» માં એપનું સરનામું
   નોંધાયેલું હોવું જરૂરી છે. ફક્ત scheme + host (+ port) — રસ્તો (path) નહીં:
       https://msavtc-web2025.github.io      ✓ આમ લખો
       https://msavtc-web2025.github.io/Interview-Prep-App/   ✗ Google સ્વીકારશે નહીં
       http://localhost:8123                 (કમ્પ્યુટર પર ટેસ્ટ કરવા માટે)
   સરનામું નોંધ્યું ન હોય તો Google «Error 400: origin_mismatch» આપે છે.

   આ પ્રવાહમાં «Authorized redirect URIs» ની જરૂર નથી — બ્રાઉઝર જ ટોકન
   મેળવે છે, કોઈ સર્વર પર પાછું જવાનું નથી.

   OAuth consent screen «Testing» માં હોય તો ફક્ત «Test users» માં નોંધેલા
   ખાતાં સાઇન-ઇન કરી શકે. બધા વિદ્યાર્થીઓ માટે «Publish app» દબાવવું પડે
   (openid/email/profile બિન-સંવેદનશીલ છે, તેથી ચકાસણીની જરૂર નથી).

   નોંધ: આર્ટિફેક્ટની અંદર Google ની સ્ક્રિપ્ટ બ્લોક થાય છે, તેથી બટન ત્યાં
   દેખાતું નથી — ત્યાં નામનું ખાનું વાપરો. તમારા પોતાના સરનામે જ ચાલશે.

   ટોકનમાંથી ફક્ત નામ વાંચીએ છીએ. ઈમેલ કે ફોટો સાચવતા નથી, અને કોઈ
   પરવાનગી કે સલામતી આ ટોકન પર આધારિત નથી. */
const GOOGLE_CLIENT_ID = "604155826405-15oddjk71jr042kbe4bk3j02kdgt547e.apps.googleusercontent.com";

/* hands ડિફોલ્ટ બંધ: માઇક જાતે ચાલુ થાય તો વર્ગખંડમાં બાજુવાળાનો
   અવાજ પકડાય છે. ai ડિફોલ્ટ ચાલુ: ઓફલાઇન ગુણ શબ્દો ગણે છે, અને
   મોટા ભાગના વિદ્યાર્થી સેટિંગ ખોલતા જ નથી. */
const DEFAULTS = { hands: false, ask: true, speakFb: true, rate: 0.92, silence: 3000, lang: "en", ai: true, dflt2: true };

let state = { settings: Object.assign({}, DEFAULTS), courses: {}, user: null };

function loadState() {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p === "object") {
        state.settings = Object.assign({}, DEFAULTS, p.settings || {});
        /* પહેલાં સાચવેલું સેટિંગ ડિફોલ્ટ કરતાં ઉપર ચડે છે, તેથી જૂના ફોન
           પર નવો ડિફોલ્ટ કદી લાગુ ન થાય. બંને સુવિધા આજે જ ખૂલી છે,
           એટલે કોઈએ જાણીજોઈને પસંદ કરેલું નથી — એક વાર સુધારી લઈએ. */
        if (!p.settings || p.settings.dflt2 !== true) {
          state.settings.hands = false;
          state.settings.ai = true;
          state.settings.dflt2 = true;
        }
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
let micWatch = null;     // માઇક ચાલુ છે પણ કંઈ સંભળાતું નથી તે પકડવા

/* ---------------- પ્રશ્નનું ઘડિયાળ ----------------

   દરેક જવાબ પર કેટલો સમય ગયો તે નોંધીએ છીએ, જેથી ડૅશબોર્ડ «કેટલો સમય
   પ્રેક્ટિસ કરી» દેખાડી શકે. ફક્ત ખરો સમય ગણાય — એપ પાછળ જાય કે વિદ્યાર્થી
   બીજા ટૅબ પર જાય તો ઘડિયાળ થોભી જાય, નહીં તો રાતભર ખૂલી રહેલી એપ
   ખોટા કલાકો ઉમેરી દે. */

let qClock = { start: 0, acc: 0 };

function qClockReset() { qClock = { start: Date.now(), acc: 0 }; }
function qClockPause() {
  if (qClock.start) { qClock.acc += Date.now() - qClock.start; qClock.start = 0; }
}
function qClockResume() { if (!qClock.start) qClock.start = Date.now(); }

/* આ પ્રશ્ન પર ગયેલી સેકન્ડ — એક જવાબ માટે વધુમાં વધુ દસ મિનિટ ગણીએ */
function qClockSecs() {
  const acc = qClock.acc + (qClock.start ? Date.now() - qClock.start : 0);
  return Math.min(Math.round(acc / 1000), Stats.MAX_SECS);
}

/* ---------------- હોમ (વિશ્લેષણ) અને પ્રેક્ટિસ ટૅબ ---------------- */

/* બંને ટૅબ ફરી લખો — જવાબ તપાસાય કે ભાષા બદલાય ત્યારે બોલાવાય છે */
function renderDash() {
  renderTiles();
  renderStats();
}

function renderStats() {
  const fn = firstName();
  $("statsHeading").textContent = fn ? t("home.hello", { name: fn }) : t("stats.title");
  Stats.render($("statsBody"), () => show("practice"));
}

function renderTiles() {
  $("tiles").innerHTML = COURSES.map((c, i) => {
    const b = bucket(c.id);
    const n = b.history.length;
    const avg = n ? (b.history.reduce((a, e) => a + e.overall, 0) / n) : 0;
    const meta = n
      ? '<div class="mt done">' + esc(t("tile.done", { n: n, a: avg.toFixed(1) })) + "</div>"
      : '<div class="mt">' + esc(t("tile.questions", { n: c.questions.length })) + "</div>";
    // ઇમોજી પાછળનો પેસ્ટલ રંગ — કોર્સના ક્રમ પ્રમાણે ફરતો રહે
    return '<button class="tile" data-id="' + esc(c.id) + '">' +
      '<div class="chip t' + (i % 8 + 1) + '">' + esc(c.icon) + "</div>" +
      '<div class="nm">' + esc(tCourse(c, "name")) + "</div>" +
      '<div class="tg">' + esc(tCourse(c, "tagline")) + "</div>" + meta + "</button>";
  }).join("");

  Array.prototype.forEach.call($("tiles").querySelectorAll(".tile"), el => {
    el.addEventListener("click", () => openCourse(el.getAttribute("data-id")));
  });
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

/* ---------------- પ્રશ્નની ભાષા ----------------

   મૂળ નિયમ હજી એ જ છે: વિદ્યાર્થી જવાબ અંગ્રેજીમાં જ આપે છે અને તપાસ
   અંગ્રેજી પર જ થાય છે. પણ પ્રશ્ન સમજાય નહીં તો જવાબ આપી જ ન શકાય —
   તેથી જે ભાષામાં એપ ચાલે છે તેમાં પ્રશ્નનો અનુવાદ હોય તો એ દેખાય છે
   અને એ જ બોલાય છે.

   અનુવાદ પ્રશ્નમાં આ રીતે મુકાય છે:
       i18n: { hi: { q: "…" } }
   ન હોય તો અંગ્રેજી પ્રશ્ન જ રહે — એપ કદી ખાલી દેખાતી નથી. */

/* આ પ્રશ્ન ચાલુ ભાષામાં લખાયેલો — અનુવાદ ન હોય તો અંગ્રેજી */
function qText(q) {
  const lang = getLang();
  if (lang !== "en" && q && q.i18n && q.i18n[lang] && q.i18n[lang].q) return q.i18n[lang].q;
  return q ? q.q : "";
}

/* આ પ્રશ્નનો અનુવાદ છે? (દેખાવ માટે — લિપિ પ્રમાણે ફોન્ટ બદલવો પડે) */
function qHasTranslation(q) {
  const lang = getLang();
  return lang !== "en" && !!(q && q.i18n && q.i18n[lang] && q.i18n[lang].q);
}

/* પ્રશ્નનું લખાણ સ્ક્રીન પર મૂકો.
   .lat વર્ગ લેટિન ફોન્ટ પકડી રાખે છે — દેવનાગરી/ગુજરાતી અનુવાદ હોય
   ત્યારે એ કાઢી નાખવો પડે, નહીં તો અક્ષર તૂટેલા દેખાય. */
function paintQuestionText() {
  if (!current) return;
  const el = $("qtext");
  el.textContent = qText(current);
  el.classList.toggle("lat", !qHasTranslation(current));

  /* પહેલા પ્રશ્ન પહેલાંનું અભિવાદન — હવે ચાલુ ભાષામાં */
  const g = greetingLine();
  const ge = $("qgreet");
  ge.hidden = !g;
  ge.textContent = g;
  ge.classList.toggle("lat", getLang() === "en");
}

/* પ્રશ્ન કઈ ભાષામાં બોલવો.
   અનુવાદ હોય અને એ ભાષાનો વોઇસ ફોનમાં હોય તો જ એ ભાષામાં બોલાય.
   વોઇસ ન હોય તો અંગ્રેજીમાં બોલીએ — ચૂપ રહેવા કરતાં એ સારું, અને
   સ્ક્રીન પર અનુવાદ તો દેખાતો જ રહે છે. */
function spokenQuestionLang() {
  const lang = getLang();
  if (qHasTranslation(current) && Speech.hasVoice(lang)) return lang;
  return "en";
}

/* આ પ્રશ્નની સમજૂતી ભાષાંતર થઈ નથી? (તો વિદ્યાર્થીને જણાવીએ) */
function qIsGuOnly(q) {
  const lang = getLang();
  return lang !== "gu" && !(q.i18n && q.i18n[lang] && q.i18n[lang].gu != null);
}

/* ભાષાની પસંદગી બે જગ્યાએ છે — હોમના તળિયે અને સેટિંગમાં. બંને સાથે રંગાય. */
function paintLang() {
  ["langSeg", "langSeg2"].forEach(id => {
    Array.prototype.forEach.call($(id).children, b =>
      b.classList.toggle("on", b.getAttribute("data-l") === getLang()));
  });
  $("setLangVal").textContent = langDef(getLang()).label;
}

/* ભાષા બદલાય ત્યારે આખી સ્ક્રીન ફરી લખો */
function relocalize() {
  setLang(state.settings.lang);
  applyI18n();
  paintLang();
  renderDash();
  if (course) {
    renderBrief();
    $("runName").textContent = tCourse(course, "name");
    // ભાષા બદલાય તો પ્રશ્ન પણ એ ભાષામાં ફરી લખાય
    if (current) { $("qcat").textContent = tCat(current.cat); paintQuestionText(); }
    renderProgress();
    if (lastResult) showResult(lastResult);
    if (!$("scRun").hidden) setPhase(phase === "idle" ? "ready" : phase);
  }
  if (!$("scProfile").hidden) paintSettings();
}

/* ---------------- સ્ક્રીન બદલવી ---------------- */

const SC_ID = {
  splash: "scSplash", welcome: "scWelcome", stats: "scStats", practice: "scPractice",
  brief: "scBrief", run: "scRun", profile: "scProfile", help: "scHelp"
};
/* તળિયેની પટ્ટીવાળા ત્રણ ટૅબ — બાકીની સ્ક્રીન પર પટ્ટી છુપાય છે */
const TABS = ["stats", "practice", "profile"];

let curScreen = "splash";        // હાલ કઈ સ્ક્રીન ખૂલી છે — «પાછળ» બટન માટે

function show(which) {
  Object.keys(SC_ID).forEach(s => { $(SC_ID[s]).hidden = s !== which; });
  curScreen = which;
  armBack();                  // ફોનનું «પાછળ» બટન એપની અંદર જ રહે

  const isTab = TABS.indexOf(which) >= 0;
  $("tabbar").hidden = !isTab;
  document.body.classList.toggle("tabs", isTab);
  if (isTab) {
    Array.prototype.forEach.call($("tabbar").querySelectorAll(".tab"), b =>
      b.classList.toggle("on", b.getAttribute("data-tab") === which));
  }
  // પ્રેક્ટિસ સ્ક્રીન છોડીએ તો પ્રશ્નનું ઘડિયાળ થોભાવો
  if (which === "run") paintAiTog();
  if (which !== "run") qClockPause();
  window.scrollTo(0, 0);
  reloadIfIdle();            // બાકી હોય તો નવી આવૃત્તિ અહીં લાગુ થાય
}

/* ટૅબ પર જાઓ — જે ટૅબ ખૂલે તેની માહિતી તાજી કરીએ */
function goTab(tab) {
  Speech.stopAll();
  if (tab === "stats") renderStats();
  if (tab === "practice") renderTiles();
  if (tab === "profile") paintSettings();
  show(tab);
}

/* ---------------- ફોનનું «પાછળ» બટન ----------------

   આ એક જ પાનાની એપ છે, તેથી એન્ડ્રોઇડનું «પાછળ» બટન સીધું એપ બંધ કરી
   દેતું હતું — ભલે વિદ્યાર્થી ઇન્ટરવ્યુની વચ્ચે હોય. હવે એ સ્ક્રીન પરના
   «પાછળ» બટન જેવું જ કામ કરે છે.

   રીત: history માં આપણી એક વધારાની નોંધ મૂકી રાખીએ છીએ. «પાછળ» એ નોંધ
   ખાય છે અને આપણને popstate મળે છે — એટલે બ્રાઉઝર એપ છોડતું નથી, અને
   આપણે જાતે એક પગથિયું ઉપર જઈએ છીએ. ઉપર જતાં show() ફરી નોંધ મૂકી દે
   છે, તેથી પછીનું «પાછળ» પણ પકડાય.

   તળિયેની ત્રણ ટૅબ મૂળ સ્ક્રીન છે — ત્યાંથી ઉપર જવાનું કંઈ નથી. ત્યાં
   નોંધ ફરી મૂકતા નથી અને «ફરી દબાવો તો એપ બંધ» એટલું કહીએ છીએ, એટલે
   એન્ડ્રોઇડની જાણીતી «બે વાર દબાવો» રીત મળી રહે અને ભૂલથી એપ બંધ ન થાય. */

/* દરેક અંદરની સ્ક્રીન પરથી «પાછળ» ક્યાં લઈ જાય — સ્ક્રીન પરના પોતાના
   «પાછળ» બટન જે કરે છે તે જ, જેથી બંને એકસરખાં વર્તે. */
const BACK_TO = {
  splash:  null,                                                  // સૌથી પહેલી સ્ક્રીન
  welcome: () => { show(state.user ? "practice" : "splash"); },
  brief:   () => leaveCourse(),      // $("btnBriefBack") જે કરે છે તે જ
  run:     () => leaveCourse(),      // $("btnBack") જે કરે છે તે જ
  help:    () => show("profile")     // $("btnHelpBack") જે કરે છે તે જ
};

/* history માં આપણી નોંધ ન હોય તો મૂકી દો. હોય તો બીજી ઉમેરતા નથી —
   નહીં તો એક «પાછળ» માટે ઘણી વાર દબાવવું પડે. */
function armBack() {
  try {
    if (!(history.state && history.state.appBack)) history.pushState({ appBack: true }, "");
  } catch (e) {}
}

window.addEventListener("popstate", () => {
  const up = BACK_TO[curScreen];
  if (up) { up(); return; }          // up() → show() → armBack() ફરી નોંધ મૂકે
  // મૂળ સ્ક્રીન — નોંધ ફરી મૂકતા નથી, તેથી હવે પછીનું «પાછળ» એપ બંધ કરશે
  toast(t("nav.exitHint"));
});

/* તળિયે થોડી વાર દેખાતો સંદેશો */
let toastTimer = null;

function toast(msg) {
  const el = $("toast");
  if (!el) return;
  $("toastMsg").textContent = msg;
  el.hidden = false;
  // hidden કાઢ્યા પછીની ફ્રેમમાં વર્ગ ઉમેરીએ તો જ સરકવાની અસર દેખાય
  requestAnimationFrame(() => el.classList.add("on"));
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("on");
    toastTimer = setTimeout(() => { el.hidden = true; }, 250);
  }, 2200);
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
  show("practice");
}

/* Google સાઇન-ઇન — GOOGLE_CLIENT_ID ભરેલો હોય તો જ બટન દેખાય.
   ટોકનમાંથી ફક્ત નામ વાંચીએ છીએ; કોઈ પરવાનગી એના પર આધારિત નથી,
   તેથી અહીં ટોકનની ખરાઈ કરવાની જરૂર નથી. */
let googleLoading = false;

function initGoogle() {
  if (!GOOGLE_CLIENT_ID) return;
  $("gerr").hidden = true;

  // સ્ક્રિપ્ટ પહેલેથી આવી ગઈ હોય તો ફક્ત બટન ફરી દોરો
  if (window.google && window.google.accounts && window.google.accounts.id) {
    renderGoogleButton();
    return;
  }
  if (googleLoading) return;         // બે વાર સ્ક્રિપ્ટ ન ઉમેરો
  googleLoading = true;

  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.async = true;
  s.defer = true;
  s.onload = () => { googleLoading = false; renderGoogleButton(); };
  /* સ્ક્રિપ્ટ બ્લોક થાય કે ઇન્ટરનેટ ન હોય તો ચૂપચાપ નામના ખાના પર જ રહો —
     Google વગર પણ એપ પૂરેપૂરી ચાલે છે. */
  s.onerror = () => { googleLoading = false; $("gwrap").hidden = true; };
  document.head.appendChild(s);
}

function renderGoogleButton() {
  try {
    /* ખાનું પહેલાં દેખાડો: છુપાયેલા (display:none) ખાનામાં Google બટન
       પોતાનું માપ ખોટું ગણે છે અને કોઈ વાર દેખાતું જ નથી. */
    $("gwrap").hidden = false;
    $("gbtn").innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onGoogleCredential,
      auto_select: false,          // જાતે સાઇન-ઇન ન કરો — વિદ્યાર્થી પોતે દબાવે
      cancel_on_tap_outside: true,
      ux_mode: "popup",
      error_callback: onGoogleError
    });
    window.google.accounts.id.renderButton($("gbtn"), {
      theme: "outline", size: "large", shape: "pill",
      text: "signup_with", width: 280
    });
  } catch (e) {
    onGoogleError(e);
  }
}

/* Google ના પડી ભાંગે તો વિદ્યાર્થીને અટકવા ન દો — નામ ટાઇપ કરી શકાય છે.
   ખરી ભૂલ કન્સોલમાં જ રાખીએ; વિદ્યાર્થીને «origin_mismatch» કહેવાનો અર્થ નથી.

   વિદ્યાર્થીએ પોતે પૉપ-અપ બંધ કર્યું હોય (popup_closed) તો એ ભૂલ નથી —
   એમાં કંઈ કહેવાનું નથી. */
function onGoogleError(err) {
  const type = (err && (err.type || err.message)) || "unknown";
  if (type === "popup_closed") return;
  console.warn("Google sign-in unavailable:", type, err);
  $("gerr").hidden = false;
  $("gerr").textContent = t("err.google");
}

/* Google માંથી ફક્ત નામ લઈએ — ઈમેલ કે ફોટો સાચવતા નથી */
function onGoogleCredential(res) {
  const p = res && res.credential ? decodeJwt(res.credential) : null;
  const name = p && (p.name || p.given_name);
  if (name) finishWelcome(name, "google");
  else onGoogleError({ type: "no-name-in-token" });
}

function decodeJwt(jwt) {
  try {
    let part = String(jwt).split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    while (part.length % 4) part += "=";       // base64url માં ગાદી હોતી નથી
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
  if (!course) { show("practice"); return; }
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
  show("practice");
  renderDash();
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
  paintQuestionText();
  $("heard").textContent = "";
  $("ans").value = "";
  $("result").hidden = true;
  $("result").innerHTML = "";
  $("typeWrap").hidden = true;
  $("btnType").classList.remove("on");
  lastResult = null;

  qClockReset();          // આ પ્રશ્નનો સમય અહીંથી ગણાય
  askQuestion();
}

/* અભિવાદન — ફક્ત ક્રમવાળા કોર્સના પહેલા પ્રશ્ન પર, અને greet:true હોય તો.
   હંમેશા અંગ્રેજીમાં, કારણ કે ઇન્ટરવ્યુ લેનાર અંગ્રેજી બોલે છે. */
/* lang આપો તો એ ભાષામાં — બોલવા માટે વોઇસની ભાષા વપરાય છે, જે
   સ્ક્રીનની ભાષાથી અલગ હોઈ શકે. અંગ્રેજી વોઇસ દેવનાગરી વાંચે તો
   ગરબડ થાય, તેથી બોલવાનું અને લખવાનું અલગ રાખ્યું છે. */
function greetingLine(lang) {
  if (!course || !course.greet || !isSequential()) return "";
  if (bucket(course.id).pos !== 0) return "";
  const fn = firstName();
  const l = lang || getLang();
  return fn ? tIn(l, "q.greetName", { name: fn }) : tIn(l, "q.greet");
}

/* ---------------- અવતાર પ્રશ્ન પૂછે ---------------- */

function askQuestion() {

  Speech.stopAll();

  if (!state.settings.ask || !Speech.supported()) {
    setPhase("ready");
    return;
  }
  setPhase("asking");
  Speech.speak(spokenQuestion(), { lang: spokenQuestionLang(), rate: state.settings.rate }).then(() => {
    if (phase !== "asking") return;                // વચ્ચે વિદ્યાર્થીએ કંઈ કર્યું
    if (state.settings.hands && Speech.micSupported()) beginListen();
    else setPhase("ready");
  });
}

/* અવતાર જે બોલે — અભિવાદન (હોય તો) અને પછી પ્રશ્ન */
/* બોલવાનું આખું વાક્ય — અભિવાદન અને પ્રશ્ન, બંને એક જ ભાષામાં.
   સ્ક્રીન પર જે દેખાય છે તે અલગ હોઈ શકે: અનુવાદ હોય પણ એ ભાષાનો વોઇસ
   ન હોય તો સ્ક્રીન પર હિન્દી રહે અને બોલાય અંગ્રેજીમાં. */
function spokenQuestion() {
  const lang = spokenQuestionLang();
  const g = greetingLine(lang);
  const q = lang === "en" ? current.q : qText(current);
  return (g ? g + " " : "") + q;
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
    onStart: () => armMicWatch(),
    onInterim: txt => { $("heard").textContent = txt; if (txt.trim()) clearMicWatch(); },
    onSilence: txt => { $("heard").textContent = txt; submit(txt); },
    onError: err => onMicError(err)
  });
  if (!ok) setPhase("ready");
}

/* કેટલાક કમ્પ્યુટર બ્રાઉઝરમાં માઇક ચાલુ થાય પણ એક પણ શબ્દ પકડાતો નથી
   (ખોટો માઇક પસંદ થયો હોય, કે બ્રાઉઝરમાં આ સેવા ન હોય). થોડી વાર પછી
   વિદ્યાર્થીને જણાવીએ જેથી તે અટકી ન રહે — સાંભળવાનું ચાલુ જ રહે છે. */
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
  const secs = qClockSecs();          // આ પ્રશ્ન પર ગયેલો ખરો સમય

  // તપાસ તરત થાય છે; અવતાર «વિચારે» તે દેખાડવા સહેજ થોભો
  setTimeout(() => {
    // ઓફલાઇન ગુણ હંમેશાં પહેલાં ગણાય છે — AI ચાલુ હોય તોય. એ જ આધાર છે,
    // અને AI ન પહોંચે તો એ જ પરિણામ દેખાય છે.
    const offline = scoreAnswer(ans, current, course.mode);
    const q = current, c = course;      // વિદ્યાર્થી આગળ વધી જાય તો ઓળખવા માટે

    function finish(r) {
      if (current !== q || course !== c) return;   // વચ્ચે બીજો પ્રશ્ન આવી ગયો
      lastResult = r;

      /* `q` અને `answer` ફક્ત આ ફોનમાં રહે છે. `cid` બૅકઅપ માટે છે —
         સર્વર (user, cid) પર unique રાખે છે, તેથી કતાર ફરી મોકલાય તો પણ
         બમણું થતું નથી. sync.js માં કયાં ખાનાં બહાર જાય તે જોઈ લો. */
      bucket(c.id).history.push({
        // પ્રશ્નની ઓળખ આંકડો છે, પણ ઓળખ તરીકે વાપરીએ છીએ — તેથી લખાણમાં
        ts: Date.now(), cid: newCid(), course: c.id,
        qid: q.id == null ? "" : String(q.id),
        q: q.q, cat: q.cat,
        answer: ans, overall: r.overall, scores: r.scores,
        words: r.stats.words, coverage: r.stats.coverage,
        weakest: r.weakest, missed: r.missingMust, secs: secs,
        byAi: !!r.byAi
      });
      save();
      Sync.flush();                  // ચાલુ ન હોય તો કંઈ કરતું નથી

      showResult(r);
      renderProgress();
      setPhase("feedback");
      speakFeedback(r);
    }

    if (!Judge.active()) { finish(offline); return; }

    // AI વાંચે ત્યાં સુધી વિદ્યાર્થીને ખબર પડે કે કંઈક ચાલી રહ્યું છે
    $("hint").className = "hint";
    $("hint").textContent = t("ai.reading");
    /* મોડેલ વ્યસ્ત હોય તો Worker ફરી પૂછે છે, અને એમાં અડધી મિનિટ સુધી જઈ
       શકે છે. એટલી વાર એક જ લીટી વાંચ્યા કરવાથી એપ અટકી ગઈ હોય એવું લાગે —
       તેથી થોડી વાર પછી કહી દઈએ કે હજુ ચાલુ જ છે. */
    const patience = setTimeout(() => {
      if (phase === "scoring") $("hint").textContent = t("ai.stillReading");
    }, 7000);

    Judge.evaluate(ans, q, c.mode, getLang()).then(j => {
      clearTimeout(patience);
      finish(Judge.merge(offline, j));
    });
  }, 420);
}

/* ચાલુ ભાષામાં ટૂંકો સાર બોલો — બધું નહીં, ફક્ત જે કામનું છે */
/* બોલવા માટેનો આંકડો. toFixed(1) હંમેશાં «4.0» આપે છે, અને વાચક એને
   «four point zero» બોલે છે — જે સાંભળવામાં ખોટું લાગે છે. પૂરો આંક હોય
   તો દશાંશ કાઢી નાખો; «4.2» જેવો હોય તો એમ જ રહેવા દો. */
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
  if (p !== "listening") clearMicWatch();
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

  // AI એ તપાસ્યું હોય તો કહી દઈએ — વિદ્યાર્થીને ખબર હોવી જોઈએ કે ગુણ કોણે આપ્યા
  if (r.byAi) h += '<div class="aibadge">' + esc(t("ai.badge")) + "</div>";

  h += '<div class="box adv"><b>' + esc(t("res.advice")) + "</b>" + esc(r.advice) + "</div>";
  if (r.tip) h += '<div class="box tip"><b>' + esc(t("res.tip")) + '</b><span class="' +
    (qIsGuOnly(current) ? "guscript" : "") + '">' + esc(qField(current, "tip")) + "</span></div>";

  /* સમજૂતી ચાલુ ભાષામાં. અંગ્રેજી મોડમાં એ બતાવવાની જરૂર નથી — નીચે
     «અંગ્રેજીમાં આ રીતે બોલો» માં એ જ વાત એ જ ભાષામાં આવે છે, અને એક જ
     ફકરો બે વાર વાંચવો પડે એ મદદ નહીં, ગૂંચવણ છે. */
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

/* ---------------- પ્રોફાઇલ અને સેટિંગ ---------------- */

function paintSettings() {
  const s = state.settings;
  const nm = userName();
  $("setNameVal").textContent = nm || t("set.nameNotSet");
  // નામનો પહેલો અક્ષર — ગોળ ચકતીમાં
  $("setAva").textContent = nm ? nm.trim().charAt(0).toUpperCase() : "•";
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

/* ---------------- પ્રગતિનો બૅકઅપ ----------------

   sync.js માં PB_URL ખાલી હોય તો આખો વિભાગ દેખાતો જ નથી — એપ પહેલાં
   જેવી ઓફલાઇન એપ રહે છે. ભરેલું હોય તો ત્રણ પગથિયાં છે:
   સાઇન-ઇન → સંમતિ → મોકલવાનું ચાલુ. */

/* ---------------- AI મૂલ્યાંકન ----------------

   judge.js માં JUDGE_URL ખાલી હોય તો આખો વિભાગ દેખાતો જ નથી.

   સંમતિ જાણી જોઈને સ્વિચ નથી, બટન છે: વિદ્યાર્થી શું બહાર જાય છે તે
   વાંચ્યા પછી જ «ચાલુ કરો» દબાવે. આંગળી અડી જવાથી જવાબનું લખાણ બહાર
   જવું ન જોઈએ. પ્રગતિના બૅકઅપની સંમતિથી આ સાવ અલગ છે. */

/* ઇન્ટરવ્યુ સ્ક્રીન પરનું AI બટન. સેટિંગવાળા બટન સાથે એક જ પસંદગી
   વાપરે છે — બેમાંથી ગમે ત્યાં બદલો, બીજું પણ બદલાય. */
function paintAiTog() {
  const b = $("btnAiTog");
  if (!b) return;
  if (!Judge.enabled()) { b.hidden = true; return; }
  b.hidden = false;

  const net = Judge.online();
  const on = Judge.consented() && net;
  b.classList.toggle("on", on);
  b.disabled = !net;                       // ઇન્ટરનેટ વગર ચાલુ કરવાનો અર્થ નથી
  b.setAttribute("aria-pressed", on ? "true" : "false");
  const lab = t("ai.title") + " — " + t(!net ? "ai.stOffline" : (on ? "ai.stOn" : "ai.stOff"));
  b.setAttribute("aria-label", lab);
  b.title = lab;
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

  // પટ્ટી પર એક શબ્દમાં સ્થિતિ
  $("syncState").textContent =
    !s.signedIn ? t("sync.stOff")
    : !s.consented ? t("sync.stReady")
    : s.pending ? t("sync.stPending", { n: s.pending })
    : t("sync.stOn");

  // વિગત — શું બાકી છે, છેલ્લે ક્યારે ગયું, કંઈ અટક્યું છે?
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
  if (key === "hands" && !state.settings.hands && phase === "listening") {
    // હાથ વગરનો મોડ બંધ કર્યો — મૌન પર જાતે તપાસવાનું બંધ કરો
    Speech.stopListen(true);
    setPhase("ready");
  }
}

/* ---------------- જોડાણ ---------------- */

/* તળિયેની ટૅબ પટ્ટી */
Array.prototype.forEach.call($("tabbar").querySelectorAll(".tab"), b =>
  b.addEventListener("click", () => goTab(b.getAttribute("data-tab"))));

$("btnAiOn").addEventListener("click", () => { Judge.setConsent(true); paintAi(); paintAiTog(); });
$("btnAiOff").addEventListener("click", () => { Judge.setConsent(false); paintAi(); paintAiTog(); });

$("btnAiTog").addEventListener("click", () => {
  if (!Judge.online()) return;
  Judge.setConsent(!Judge.consented());
  paintAiTog();
});

/* ઇન્ટરનેટ આવે કે જાય તો બંને જગ્યાએ તરત દેખાય — વિદ્યાર્થીને ખબર હોવી
   જોઈએ કે અત્યારે કોણ તપાસી રહ્યું છે. */
window.addEventListener("online", () => { paintAiTog(); if (curScreen === "profile") paintAi(); });
window.addEventListener("offline", () => { paintAiTog(); if (curScreen === "profile") paintAi(); });

$("btnHelp").addEventListener("click", () => show("help"));
$("btnHelpBack").addEventListener("click", () => show("profile"));

/* બૅકઅપના બટન. બધું નિષ્ફળ જાય તો પણ એપ ચાલુ રહે — તેથી દરેક જગ્યાએ
   catch છે અને ભૂલ ફક્ત સ્થિતિની લીટીમાં દેખાય છે. */
Sync.onChange(() => { if (!$("scProfile").hidden) paintSync(); });

$("btnSyncIn").addEventListener("click", () => {
  Sync.signIn().then(paintSync).catch(paintSync);
});
$("btnSyncOn").addEventListener("click", () => {
  if (!confirm(t("sync.confirmOn"))) return;
  Sync.setConsent(true).then(paintSync).catch(paintSync);
});
$("btnSyncOff").addEventListener("click", () => {
  Sync.setConsent(false).then(paintSync).catch(paintSync);
});
$("btnSyncNow").addEventListener("click", () => {
  Sync.flush().then(paintSync);
});
$("btnSyncOut").addEventListener("click", () => { Sync.signOut(); paintSync(); });
$("btnSyncErase").addEventListener("click", () => {
  if (!confirm(t("sync.confirmErase"))) return;
  Sync.eraseRemote()
    .then(n => { alert(t("sync.erased", { n: n })); paintSync(); })
    .catch(paintSync);
});

$("swHands").addEventListener("click", () => toggle("hands"));
$("swAsk").addEventListener("click", () => toggle("ask"));
$("swFb").addEventListener("click", () => toggle("speakFb"));

Array.prototype.forEach.call($("segRate").children, b =>
  b.addEventListener("click", () => { state.settings.rate = parseFloat(b.dataset.r); save(); paintSettings(); }));
Array.prototype.forEach.call($("segSil").children, b =>
  b.addEventListener("click", () => { state.settings.silence = parseInt(b.dataset.s, 10); save(); paintSettings(); }));

/* ભાષાની બંને પસંદગી-પટ્ટી — હોમના તળિયે અને સેટિંગમાં */
["langSeg", "langSeg2"].forEach(id =>
  Array.prototype.forEach.call($(id).children, b =>
    b.addEventListener("click", () => {
      Speech.stopAll();
      state.settings.lang = b.getAttribute("data-l");
      save();
      relocalize();
    })));

$("btnReset").addEventListener("click", () => {
  if (!confirm(t("set.resetAsk"))) return;
  state.courses = {};
  save();
  // પ્રેક્ટિસ ચાલુ હોય તો જ નવો પ્રશ્ન લાવો — સૂચના સ્ક્રીન પર હોઈએ તો નહીં
  if (course && !$("scRun").hidden) { renderProgress(); pickQuestion(false); }
  renderBriefIfOpen();
  renderDash();
  paintSettings();       // પ્રોફાઇલ પરનો સાર પણ ખાલી થાય
});

$("btnSaveName").addEventListener("click", () => finishWelcome($("uname").value));
$("btnSkipName").addEventListener("click", () => { show("practice"); });
$("uname").addEventListener("keydown", ev => {
  if (ev.key === "Enter") { ev.preventDefault(); finishWelcome($("uname").value); }
});
$("btnChangeName").addEventListener("click", openWelcome);

/* પરિચય સ્ક્રીન — «શરૂ કરો» નામ પૂછે, «પછી જોઈશ» સીધા પ્રેક્ટિસ પર લઈ જાય */
$("btnGetStarted").addEventListener("click", () => { Speech.prime(); openWelcome(); });
$("btnMaybeLater").addEventListener("click", () => { Speech.prime(); show("practice"); });

$("btnStart").addEventListener("click", startInterview);
$("btnBriefBack").addEventListener("click", leaveCourse);
$("btnBack").addEventListener("click", leaveCourse);
$("btnSkip").addEventListener("click", () => { if (course) pickQuestion(true); });
$("btnRepeat").addEventListener("click", () => {
  Speech.stopListen(true);
  setPhase("asking");
  Speech.speak(spokenQuestion(), { lang: spokenQuestionLang(), rate: state.settings.rate }).then(() => {
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

/* ---------------- નવી આવૃત્તિ આવે ત્યારે ----------------
   sw.js સ્ક્રિપ્ટો કૅશમાંથી જ આપે છે, તેથી નવો service worker કબજો લે
   ત્યારે પણ ખૂલેલું પાનું જૂનું JS ચલાવતું રહે છે — વિદ્યાર્થીએ જાતે બીજી
   વાર ખોલવું પડે, અને એ કોઈ કરતું નથી. તેથી જાતે તાજું કરી લઈએ.

   પણ વચ્ચે નહીં: જવાબ આપતી વખતે પાનું તાજું થાય તો બોલેલું બધું જાય.
   ઇન્ટરવ્યુ બહાર નીકળે ત્યારે જ થાય. */
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
  if (phase === "listening") { Speech.stopListen(true); setPhase("ready"); }
});

/* એપ પાછળ જાય તો માઇક અને સ્પીકર બંધ — બેટરી અને પ્રાઇવસી બંને માટે.
   પ્રશ્નનું ઘડિયાળ પણ થોભે, જેથી બંધ પડેલી એપનો સમય ન ગણાય. */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    qClockPause();
    Speech.stopAll();
    if (phase === "listening" || phase === "asking") setPhase("ready");
  } else if (!$("scRun").hidden) {
    qClockResume();
  }
});

/* ---------------- શરૂઆત ---------------- */

loadState();
setLang(state.settings.lang);
applyI18n();
paintLang();
paintSettings();
renderDash();

/* નામ ખબર ન હોય તો પહેલાં એપનો પરિચય. નામ ખબર હોય તો — પ્રેક્ટિસ કરી
   હોય તો પ્રગતિ દેખાડો, નહીં તો સીધા પ્રેક્ટિસ ટૅબ પર (ખાલી આલેખ કરતાં
   કોર્સની યાદી વધુ કામની છે). */
if (!state.user) show("splash");
else show(allHistory().length ? "stats" : "practice");

/* એપ ખૂલે ત્યારે બાકી રહેલી પ્રગતિ મોકલી દો — ચાલુ ન હોય તો કંઈ થતું નથી.
   શરૂઆતમાં જ નહીં, થોડું મોડું: પહેલો પડદો દોરાવા દો. */
setTimeout(() => { try { Sync.flush(); } catch (e) {} }, 2500);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
