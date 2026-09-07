/* પ્રગતિનું વિશ્લેષણ — હોમ ડૅશબોર્ડના આંકડા, આલેખ અને સૂચનો.

   કોઈ બહારની લાઇબ્રેરી નથી. બધા આલેખ CSS અને inline SVG થી બનાવ્યા છે,
   જેથી એપ ઓફલાઇન પણ બરાબર દેખાય.

   સમયની નોંધ: જૂના જવાબોમાં `secs` નથી (એ સુવિધા પછી ઉમેરાઈ). તેથી
   સમયના આલેખ ફક્ત `secs` વાળા જવાબો ગણે છે — ગુણ અને સરેરાશ તો બધા
   જવાબોના જ રહે છે. એટલે નવો વપરાશકર્તા «સમય» ખાલી જુએ તો નવાઈ નહીં.
*/
"use strict";

const Stats = (function () {

  const DAY = 86400000;
  const MAX_SECS = 600;      // એક જવાબ માટે વધુમાં વધુ ૧૦ મિનિટ ગણીએ
  const WEEK_TARGET = 30;    // અઠવાડિયે આટલી મિનિટ પ્રેક્ટિસનું લક્ષ્ય
  const DAY_KEYS = ["day.sun", "day.mon", "day.tue", "day.wed", "day.thu", "day.fri", "day.sat"];

  function startOfDay(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }

  /* અઠવાડિયું સોમવારથી ગણીએ */
  function startOfWeek(ts) {
    const d = new Date(startOfDay(ts));
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.getTime();
  }

  function secsOf(e) {
    return (typeof e.secs === "number" && e.secs > 0) ? Math.min(e.secs, MAX_SECS) : 0;
  }

  function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }

  /* સમય વાંચી શકાય તેવો — એક કલાકથી વધુ હોય તો દશાંશ કલાકમાં */
  function fmtDur(min) {
    if (!min) return "—";
    if (min >= 60) return t("unit.h", { v: (min / 60).toFixed(1) });
    return t("unit.min", { v: Math.max(1, Math.round(min)) });
  }

  /* ---------------- માહિતી એકત્ર ---------------- */

  function summarise() {
    const hist = allHistory().slice().sort((a, b) => (a.ts || 0) - (b.ts || 0));
    const timed = hist.filter(e => secsOf(e) > 0);
    const totalSecs = timed.reduce((a, e) => a + secsOf(e), 0);
    const today = startOfDay(Date.now());

    // છેલ્લા સાત દિવસ — દરરોજની મિનિટ
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d0 = today - i * DAY;
      const s = timed.reduce((a, e) => a + (startOfDay(e.ts) === d0 ? secsOf(e) : 0), 0);
      days.push({ ts: d0, min: s / 60, today: i === 0 });
    }

    // અઠવાડિયાવાર — સરેરાશ કાઢવા માટે
    const wk = {};
    timed.forEach(e => { const k = startOfWeek(e.ts); wk[k] = (wk[k] || 0) + secsOf(e); });
    const wkKeys = Object.keys(wk);
    const weekAvgMin = wkKeys.length ? mean(wkKeys.map(k => wk[k])) / 60 : 0;
    const thisWeekMin = (wk[startOfWeek(Date.now())] || 0) / 60;

    // સળંગ કેટલા દિવસ પ્રેક્ટિસ કરી — સમય નહીં, જવાબ ગણીએ
    const seen = {};
    hist.forEach(e => { seen[startOfDay(e.ts)] = true; });
    let streak = 0, cur = today;
    if (!seen[cur]) cur -= DAY;                  // આજે ન કર્યું હોય તો ગઈકાલથી ગણો
    while (seen[cur]) { streak++; cur -= DAY; }

    // માપદંડવાર સરેરાશ
    const crit = CRITERIA.map(c => {
      const vals = hist.map(e => e.scores && e.scores[c.key]).filter(v => typeof v === "number");
      return { key: c.key, label: t("crit." + c.key), v: mean(vals), n: vals.length };
    }).filter(c => c.n);

    // કોર્સવાર સરેરાશ (bucket() ન વાપરો — એ ખાલી કોર્સ પણ સંગ્રહમાં ઉમેરી દે)
    const courses = COURSES.map(c => {
      const h = (state.courses[c.id] && state.courses[c.id].history) || [];
      return { def: c, n: h.length, avg: mean(h.map(e => e.overall)) };
    });

    // પ્રશ્નના પ્રકાર પ્રમાણે — સામાન્ય ઇન્ટરવ્યુ કે તકનીકી
    function modeOf(id) { const c = getCourse(id); return c && c.mode === "technical" ? "technical" : "interview"; }
    const byMode = ["interview", "technical"].map(m => {
      const h = hist.filter(e => modeOf(e.course) === m);
      return { mode: m, n: h.length, avg: mean(h.map(e => e.overall)) };
    });

    // છેલ્લા દસ ગુણ — વલણનો આલેખ
    const trend = hist.slice(-10).map(e => e.overall);
    let delta = null;
    if (hist.length >= 6) {
      const last = hist.slice(-3).map(e => e.overall);
      const before = hist.slice(-8, -3).map(e => e.overall);
      if (before.length) delta = mean(last) - mean(before);
    }

    return {
      hist: hist, n: hist.length, timedN: timed.length,
      avg: mean(hist.map(e => e.overall)),
      hours: totalSecs / 3600, days: days,
      weekAvgMin: weekAvgMin, thisWeekMin: thisWeekMin,
      streak: streak, crit: crit, courses: courses, byMode: byMode,
      trend: trend, delta: delta
    };
  }

  /* ---------------- ટુકડા ---------------- */

  function cell(v, k, cls) {
    return '<div class="sc"><div class="v' + (cls ? " " + cls : "") + '">' + v +
           '</div><div class="k">' + esc(k) + "</div></div>";
  }

  function panels(s) {
    return '<div class="statpanel">' +
        cell(s.n, t("st.answered")) +
        cell(s.avg ? '<span style="color:' + colorFor(s.avg) + '">' + s.avg.toFixed(1) + "</span>" : "—", t("st.avg")) +
        cell(s.hours ? s.hours.toFixed(1) : "—", t("st.hours")) +
      "</div>" +
      '<div class="statpanel" style="margin-top:10px">' +
        cell(esc(fmtDur(s.thisWeekMin)), t("stats.thisWeek"), "sm") +
        cell(esc(fmtDur(s.weekAvgMin)), t("stats.weekAvg"), "sm") +
        cell(s.streak || "—", t("st.streakLab")) +
      "</div>";
  }

  /* એકંદર ગુણ — વર્તુળ, વલણ અને છેલ્લા જવાબોની રેખા */
  function overallCard(s) {
    const C = 2 * Math.PI * 33;
    const off = C * (1 - s.avg / 10);
    let sub;
    if (s.delta == null) sub = t("stats.trendNew");
    else if (s.delta >= 0.3) sub = t("stats.trendUp", { d: s.delta.toFixed(1) });
    else if (s.delta <= -0.3) sub = t("stats.trendDown", { d: Math.abs(s.delta).toFixed(1) });
    else sub = t("stats.trendFlat");

    return '<div class="card"><p class="ctitle">' + esc(t("stats.overall")) + "</p>" +
      '<p class="csub">' + esc(t("stats.overallD", { n: s.n })) + "</p>" +
      '<div class="score">' +
        '<div class="ring"><svg viewBox="0 0 74 74">' +
          '<circle class="bgc" cx="37" cy="37" r="33"/>' +
          '<circle class="fgc" cx="37" cy="37" r="33" stroke="' + colorFor(s.avg) + '" ' +
            'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
        '</svg><b style="color:' + colorFor(s.avg) + '">' + s.avg.toFixed(1) + "</b></div>" +
        '<div class="txt"><div class="t">' + esc(t("res.score", { v: s.avg.toFixed(1) })) + "</div>" +
        '<div class="s">' + esc(sub) + "</div></div>" +
      "</div>" + sparkline(s.trend) + "</div>";
  }

  /* છેલ્લા જવાબોના ગુણની રેખા — ત્રણથી ઓછા હોય તો દોરવાનો અર્થ નથી.
     આખો ૦–૧૦ પટ્ટો વાપરીએ તો રેખા સપાટ દેખાય, તેથી જેટલા ગુણ છે તેની
     આસપાસનો જ પટ્ટો લઈએ — ચઢ-ઉતાર સાચી રીતે દેખાય. */
  function sparkline(vals) {
    if (!vals || vals.length < 3) return "";
    const W = 300, H = 76, P = 8;
    const lo = Math.max(0, Math.min.apply(null, vals) - 0.6);
    const hi = Math.min(10, Math.max.apply(null, vals) + 0.6);
    const span = Math.max(1, hi - lo);
    const step = (W - P * 2) / (vals.length - 1);
    const y = v => P + (H - P * 2) * (1 - (v - lo) / span);
    const pts = vals.map((v, i) => (P + i * step).toFixed(1) + "," + y(v).toFixed(1));
    const dots = vals.map((v, i) =>
      '<circle class="dt" cx="' + (P + i * step).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="2.6"/>').join("");

    return '<svg class="spark" viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">' +
      '<defs><linearGradient id="sparkg" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + "#2f4fd0" + '" stop-opacity=".45"/>' +
        '<stop offset="1" stop-color="#2f4fd0" stop-opacity="0"/>' +
      "</linearGradient></defs>" +
      '<polygon class="ar" points="' + P + "," + (H - P) + " " + pts.join(" ") + " " + (W - P) + "," + (H - P) + '"/>' +
      '<polyline class="ln" points="' + pts.join(" ") + '"/>' + dots + "</svg>";
  }

  /* દરરોજ કેટલો સમય — સાત ઊભી પટ્ટી */
  function timeCard(s) {
    let body;
    if (!s.timedN) {
      body = '<p class="note">' + esc(t("stats.noTime")) + "</p>";
    } else {
      const top = Math.max.apply(null, s.days.map(d => d.min).concat([5]));
      body = '<div class="chart">' + s.days.map(d => {
        const pct = Math.max(3, Math.round(d.min / top * 100));
        const lab = DAY_KEYS[new Date(d.ts).getDay()];
        return '<div class="cb' + (d.min ? "" : " zero") + (d.today ? " today" : "") + '">' +
          '<span class="cbv">' + (d.min ? Math.max(1, Math.round(d.min)) : "") + "</span>" +
          '<i style="height:' + pct + '%"></i>' +
          "<em>" + esc(t(lab)) + "</em></div>";
      }).join("") + "</div>";
    }
    return '<div class="card"><p class="ctitle">' + esc(t("stats.time")) + "</p>" +
      '<p class="csub">' + esc(t("stats.timeD")) + "</p>" + body +
      '<div class="mrow">' +
        '<div><div class="k">' + esc(t("stats.thisWeek")) + '</div><div class="v">' + esc(fmtDur(s.thisWeekMin)) + "</div></div>" +
        '<div><div class="k">' + esc(t("stats.weekAvg")) + '</div><div class="v">' + esc(fmtDur(s.weekAvgMin)) + "</div></div>" +
      "</div></div>";
  }

  /* માપદંડવાર — પરિણામ કાર્ડ જેવી જ પટ્ટીઓ, જેથી ઓળખીતું લાગે */
  function critCard(s) {
    if (!s.crit.length) return "";
    const rows = s.crit.slice().sort((a, b) => b.v - a.v).map(c =>
      '<div class="crit tight"><div class="cline">' +
        '<span class="cname">' + esc(c.label) + "</span>" +
        '<span class="bar2"><i style="width:' + (c.v * 10).toFixed(0) + "%;background:" + colorFor(c.v) + '"></i></span>' +
        '<span class="cnum" style="color:' + colorFor(c.v) + '">' + c.v.toFixed(1) + "</span>" +
      "</div></div>").join("");
    return '<div class="card"><p class="ctitle">' + esc(t("stats.byCrit")) + "</p>" +
      '<p class="csub">' + esc(t("stats.byCritD")) + "</p>" + rows + "</div>";
  }

  /* પ્રશ્નના પ્રકાર પ્રમાણે — સામાન્ય ઇન્ટરવ્યુ અને તકનીકી */
  function modeCard(s) {
    const c = s.byMode.map(m =>
      cell(m.n ? '<span style="color:' + colorFor(m.avg) + '">' + m.avg.toFixed(1) + "</span>" : "—",
           t(m.mode === "interview" ? "stats.modeInterview" : "stats.modeTech") +
           (m.n ? " · " + t("stats.nAns", { n: m.n }) : ""))).join("");
    return '<div class="card"><p class="ctitle">' + esc(t("stats.byMode")) + "</p>" +
      '<p class="csub">' + esc(t("stats.byModeD")) + '</p><div class="statpanel">' + c + "</div></div>";
  }

  /* કોર્સવાર — શરૂ કરેલા કોર્સ પહેલાં, પછી બાકીના */
  function courseCard(s) {
    const done = s.courses.filter(c => c.n).sort((a, b) => b.avg - a.avg);
    const rest = s.courses.filter(c => !c.n);
    if (!done.length) return "";
    const row = c =>
      '<div class="crow"><span class="chip sm t' + (COURSES.indexOf(c.def) % 8 + 1) + '">' + esc(c.def.icon) + "</span>" +
      '<span class="cn"><b>' + esc(tCourse(c.def, "name")) + "</b>" +
      "<i>" + esc(c.n ? t("stats.nAns", { n: c.n }) : t("stats.notStarted")) + "</i></span>" +
      (c.n ? '<span class="bar2"><i style="width:' + (c.avg * 10).toFixed(0) + "%;background:" + colorFor(c.avg) + '"></i></span>' +
             '<span class="sc" style="color:' + colorFor(c.avg) + '">' + c.avg.toFixed(1) + "</span>"
           : '<span class="sc" style="color:var(--muted)">—</span>') + "</div>";
    return '<div class="card"><p class="ctitle">' + esc(t("stats.byCourse")) + "</p>" +
      '<p class="csub">' + esc(t("stats.byCourseD")) + "</p>" +
      done.map(row).join("") + rest.slice(0, 3).map(row).join("") + "</div>";
  }

  /* ---------------- સૂચનો ---------------- */

  function recommendations(s) {
    const out = [];

    // ૧. સલામતીના મુદ્દા ચૂક્યા હોય — સૌથી અગત્યનું
    const missed = s.hist.slice(-5).reduce((a, e) => a + ((e.missed && e.missed.length) || 0), 0);
    if (missed) out.push({ ic: "i-info", tint: "red", t: t("rec.safety.t"), d: t("rec.safety.d", { n: missed }) });

    // ૨. સૌથી નબળો માપદંડ
    const weak = s.crit.slice().sort((a, b) => a.v - b.v)[0];
    if (weak && weak.v < 7.5) {
      out.push({ ic: "i-trend", tint: "amber", t: t("rec.weak.t", { crit: weak.label }), d: t("rec.crit." + weak.key) });
    }

    // ૩. આ અઠવાડિયે ઓછી પ્રેક્ટિસ (સમય નોંધાવા લાગ્યો હોય ત્યારે જ)
    if (s.timedN && s.thisWeekMin < WEEK_TARGET) {
      const left = { m: Math.max(1, Math.round(WEEK_TARGET - s.thisWeekMin)) };
      out.push({ ic: "i-clock", tint: "blue", t: t("rec.time.t", left), d: t("rec.time.d", left) });
    }

    // ૪. પૂરો મૉક ઇન્ટરવ્યુ બાકી છે
    const iv = s.courses.filter(c => c.def.mode === "interview")[0];
    if (iv && iv.n < iv.def.questions.length) {
      out.push({ ic: "i-mic", tint: "green", t: t("rec.mock.t"),
                 d: t("rec.mock.d", { n: iv.def.questions.length - iv.n }) });
    }

    // ૫. હજી અડ્યા ન હોય એવો કોર્સ
    const fresh = s.courses.filter(c => !c.n)[0];
    if (fresh) {
      out.push({ ic: "i-play", tint: "purple",
                 t: t("rec.newCourse.t", { course: tCourse(fresh.def, "name") }),
                 d: t("rec.newCourse.d") });
    }

    if (!out.length) out.push({ ic: "i-check", tint: "green", t: t("rec.good.t"), d: t("rec.good.d") });
    return out.slice(0, 4);
  }

  function recCard(s) {
    const rows = recommendations(s).map(r =>
      '<div class="rec"><span class="li ' + r.tint + '"><svg class="svi" aria-hidden="true"><use href="#' +
      r.ic + '"/></svg></span><span class="rt"><b>' + esc(r.t) + "</b><p>" + esc(r.d) + "</p></span></div>").join("");
    return '<div class="card"><p class="ctitle">' + esc(t("stats.next")) + "</p>" +
      '<p class="csub">' + esc(t("stats.nextD")) + '</p><div class="recs">' + rows + "</div></div>";
  }

  function emptyCard() {
    return '<div class="card"><div class="emptybox">' +
      '<span class="li blue"><svg class="svi" aria-hidden="true"><use href="#i-chart"/></svg></span>' +
      "<b>" + esc(t("stats.empty")) + "</b><p>" + esc(t("stats.emptyD")) + "</p>" +
      '<button class="act" id="statsGo">' + esc(t("stats.goPractise")) + "</button></div></div>";
  }

  /* ---------------- બહાર દેખાતું ---------------- */

  /* ડૅશબોર્ડ ફરી લખો. onPractise = «પ્રેક્ટિસ કરો» દબાય ત્યારે શું કરવું. */
  function render(el, onPractise) {
    const s = summarise();
    if (!s.n) {
      el.innerHTML = emptyCard();
      const g = document.getElementById("statsGo");
      if (g && onPractise) g.addEventListener("click", onPractise);
      return s;
    }
    el.innerHTML = panels(s) + overallCard(s) + timeCard(s) +
                   critCard(s) + modeCard(s) + courseCard(s) + recCard(s);
    return s;
  }

  /* પ્રોફાઇલ પરની નાની પટ્ટી */
  function renderProfileStats(el) {
    const s = summarise();
    const best = s.courses.filter(c => c.n).sort((a, b) => b.avg - a.avg)[0];
    el.innerHTML =
      cell(s.n, t("st.answered")) +
      cell(s.hours ? s.hours.toFixed(1) : "—", t("st.hours")) +
      cell(best ? esc(tCourse(best.def, "name")) : "—", t("st.strong"), "sm");
    return s;
  }

  return { summarise, render, renderProfileStats, fmtDur, MAX_SECS };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { Stats };
