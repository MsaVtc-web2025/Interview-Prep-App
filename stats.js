/* Progress analysis — the numbers, charts and suggestions on the home dashboard.

   No external libraries. Every chart is built from CSS and inline SVG, so the
   app still looks right offline.

   A note on timing: older answers have no `secs` (that came later). So the time
   charts count only answers that carry `secs` — scores and averages still cover
   every answer. A new user seeing an empty "time" section is therefore expected.
*/
"use strict";

const Stats = (function () {

  const DAY = 86400000;
  const MAX_SECS = 600;      // count at most 10 minutes for a single answer
  const WEEK_TARGET = 30;    // weekly practice target, in minutes
  const DAY_KEYS = ["day.sun", "day.mon", "day.tue", "day.wed", "day.thu", "day.fri", "day.sat"];

  function startOfDay(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }

  /* Weeks start on Monday */
  function startOfWeek(ts) {
    const d = new Date(startOfDay(ts));
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.getTime();
  }

  function secsOf(e) {
    return (typeof e.secs === "number" && e.secs > 0) ? Math.min(e.secs, MAX_SECS) : 0;
  }

  function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }

  /* The bar colour is a shade darker than the text colour — that is the design */
  function barFor(n) {
    return n >= 7.5 ? "var(--goodbar)" : n >= 5 ? "var(--midbar)" : "var(--lowbar)";
  }

  /* Readable duration — shown in decimal hours once it passes an hour */
  function fmtDur(min) {
    if (!min) return "—";
    if (min >= 60) return t("unit.h", { v: (min / 60).toFixed(1) });
    return t("unit.min", { v: Math.max(1, Math.round(min)) });
  }

  /* ---------------- Gathering the data ---------------- */

  function summarise() {
    const hist = allHistory().slice().sort((a, b) => (a.ts || 0) - (b.ts || 0));
    const timed = hist.filter(e => secsOf(e) > 0);
    const totalSecs = timed.reduce((a, e) => a + secsOf(e), 0);
    const today = startOfDay(Date.now());

    // Last seven days — minutes per day
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d0 = today - i * DAY;
      const s = timed.reduce((a, e) => a + (startOfDay(e.ts) === d0 ? secsOf(e) : 0), 0);
      days.push({ ts: d0, min: s / 60, today: i === 0 });
    }

    // Per week — used for the average
    const wk = {};
    timed.forEach(e => { const k = startOfWeek(e.ts); wk[k] = (wk[k] || 0) + secsOf(e); });
    const wkKeys = Object.keys(wk);
    const weekAvgMin = wkKeys.length ? mean(wkKeys.map(k => wk[k])) / 60 : 0;
    const thisWeekMin = (wk[startOfWeek(Date.now())] || 0) / 60;
    const lastWeekMin = (wk[startOfWeek(Date.now() - 7 * DAY)] || 0) / 60;

    // Practice streak in days — counted by answers, not by time
    const seen = {};
    hist.forEach(e => { seen[startOfDay(e.ts)] = true; });
    let streak = 0, cur = today;
    if (!seen[cur]) cur -= DAY;                  // nothing today? start counting from yesterday
    while (seen[cur]) { streak++; cur -= DAY; }

    // Average per criterion
    const crit = CRITERIA.map(c => {
      const vals = hist.map(e => e.scores && e.scores[c.key]).filter(v => typeof v === "number");
      return { key: c.key, label: t("crit." + c.key), v: mean(vals), n: vals.length };
    }).filter(c => c.n);

    // Average per course (do not use bucket() — it adds empty courses to storage)
    const courses = COURSES.map(c => {
      const h = (state.courses[c.id] && state.courses[c.id].history) || [];
      return { def: c, n: h.length, avg: mean(h.map(e => e.overall)) };
    });

    // By question type — general interview or technical
    function modeOf(id) { const c = getCourse(id); return c && c.mode === "technical" ? "technical" : "interview"; }
    const byMode = ["interview", "technical"].map(m => {
      const h = hist.filter(e => modeOf(e.course) === m);
      return { mode: m, n: h.length, avg: mean(h.map(e => e.overall)) };
    });

    // Last ten scores — the trend chart
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
      weekAvgMin: weekAvgMin, thisWeekMin: thisWeekMin, lastWeekMin: lastWeekMin,
      streak: streak, crit: crit, courses: courses, byMode: byMode,
      trend: trend, delta: delta
    };
  }

  /* ---------------- Pieces ---------------- */

  function cell(v, k, cls) {
    return '<div class="sc"><div class="v' + (cls ? " " + cls : "") + '">' + v +
           '</div><div class="k">' + esc(k) + "</div></div>";
  }

  /* The top strip, per the design: answers, average, weakest criterion.
     The third cell holds an icon and the criterion name, not a number. */
  function panels(s) {
    const weak = s.crit.slice().sort((a, b) => a.v - b.v)[0];
    const weakCell =
      '<div class="sc">' +
        '<svg class="svi" aria-hidden="true" style="width:20px;height:20px;margin:0 auto;color:' +
          (weak ? colorFor(weak.v) : "var(--accent)") + '"><use href="#i-chart"/></svg>' +
        '<div style="font-size:12px;font-weight:650;margin-top:3px">' +
          esc(weak ? weak.label : "—") + "</div>" +
        '<div style="font-size:11px;color:var(--muted)">' + esc(t("st.weak")) + "</div>" +
      "</div>";

    return '<div class="statpanel">' +
        cell(s.n, t("st.answered")) +
        cell(s.avg ? '<span style="color:' + colorFor(s.avg) + '">' + s.avg.toFixed(1) + "</span>" : "—", t("st.avg")) +
        weakCell +
      "</div>" +
      '<div class="statpanel" style="margin-top:12px">' +
        cell(s.hours ? s.hours.toFixed(1) : "—", t("st.hours")) +
        cell(esc(fmtDur(s.weekAvgMin)), t("stats.weekAvg"), "sm") +
        cell(s.streak || "—", t("st.streakLab")) +
      "</div>";
  }

  /* Overall score — the ring, the trend, and the line of recent answers */
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

  /* Line of recent scores — not worth drawing for fewer than three.
     Using the full 0-10 range makes the line look flat, so we scale to the
     range the scores actually span, which shows the ups and downs properly. */
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

    /* Fill straight from rgba. In some contexts CSS fill:url(#gradient) does
       not resolve and the whole area renders black. */
    return '<svg class="spark" viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">' +
      '<polygon class="ar" points="' + P + "," + (H - P) + " " + pts.join(" ") + " " + (W - P) + "," + (H - P) + '"/>' +
      '<polyline class="ln" points="' + pts.join(" ") + '"/>' + dots + "</svg>";
  }

  /* Time per day — seven vertical bars */
  function timeCard(s) {
    let body, foot;

    if (!s.timedN) {
      body = '<p class="note">' + esc(t("stats.noTime")) + "</p>";
      foot = "";
    } else {
      // In the design the bar colour goes from light to dark with height, and
      // the tallest day gets the full accent colour
      const top = Math.max.apply(null, s.days.map(d => d.min));
      const scale = Math.max(top, 5);
      body = '<div class="chart">' + s.days.map(d => {
        const pct = d.min ? Math.max(6, Math.round(d.min / scale * 100)) : 6;
        const r = top ? d.min / top : 0;
        let cls = "cb";
        if (!d.min) cls += " zero";
        else if (r > 0.999) cls += " top";
        else if (r >= 0.66) cls += " q3";
        else if (r >= 0.33) cls += " q2";
        return '<div class="' + cls + '">' +
          '<i style="height:' + pct + '%"></i>' +
          "<em>" + esc(t(DAY_KEYS[new Date(d.ts).getDay()])) + "</em></div>";
      }).join("") + "</div>";
      foot = '<div class="cfoot">' +
        esc(t("stats.weekFoot", { n: s.n, dur: fmtDur(s.thisWeekMin) })) + "</div>";
    }

    // Change against last week — the design puts this text at the top right
    let delta = "";
    if (s.timedN && s.lastWeekMin > 0) {
      const d = s.thisWeekMin - s.lastWeekMin;
      const cls = d >= 1 ? "up" : d <= -1 ? "dn" : "flat";
      delta = '<span class="cdelta ' + cls + '">' +
        esc(t("stats.vsLast", { d: (d > 0 ? "+" : "") + Math.round(d) })) + "</span>";
    }

    return '<div class="card">' +
      '<div class="chead"><p class="ctitle">' + esc(t("stats.thisWeek")) + "</p>" + delta + "</div>" +
      body + foot + "</div>";
  }

  /* Recent answers — score chip, category, course and day */
  function recentCard(s) {
    const rows = s.hist.slice().reverse().slice(0, 3).map(e => {
      const c = getCourse(e.course);
      const tint = e.overall >= 7.5 ? "var(--goodtint)" : e.overall >= 5 ? "var(--midtint)" : "var(--lowtint)";
      return '<div class="ra">' +
        '<span class="rs" style="background:' + tint + ";color:" + colorFor(e.overall) + '">' +
          e.overall.toFixed(1) + "</span>" +
        '<span class="rt"><b>' + esc(tCat(e.cat)) + "</b><i>" +
          esc((c ? tCourse(c, "name") : e.course) + " · " + relDay(e.ts)) + "</i></span>" +
      "</div>";
    }).join("");
    return '<h2 class="sec">' + esc(t("stats.recent")) + "</h2>" +
      '<div class="card tight">' + rows + "</div>";
  }

  /* "Today", "Yesterday", "3 days ago" */
  function relDay(ts) {
    const days = Math.round((startOfDay(Date.now()) - startOfDay(ts)) / DAY);
    if (days <= 0) return t("rel.today");
    if (days === 1) return t("rel.yesterday");
    return t("rel.days", { n: days });
  }

  /* Per criterion — the same bars as the result card, so it feels familiar */
  function critCard(s) {
    if (!s.crit.length) return "";
    /* The design puts the name and score on one line above, with a full-width
       bar below — a different shape from the result card's bars. */
    const rows = s.crit.slice().sort((a, b) => b.v - a.v).map(c =>
      '<div class="skill"><div class="sl">' +
        '<span class="sn">' + esc(c.label) + "</span>" +
        '<span class="sv" style="color:' + colorFor(c.v) + '">' + c.v.toFixed(1) + "</span>" +
      "</div>" +
      '<div class="st"><i style="width:' + (c.v * 10).toFixed(0) + "%;background:" + barFor(c.v) + '"></i></div>' +
      "</div>").join("");
    return '<h2 class="sec">' + esc(t("stats.byCrit")) + "</h2>" +
      '<div class="card"><div class="skills">' + rows + "</div></div>";
  }

  /* By question type — general interview and technical */
  function modeCard(s) {
    const c = s.byMode.map(m =>
      cell(m.n ? '<span style="color:' + colorFor(m.avg) + '">' + m.avg.toFixed(1) + "</span>" : "—",
           t(m.mode === "interview" ? "stats.modeInterview" : "stats.modeTech") +
           (m.n ? " · " + t("stats.nAns", { n: m.n }) : ""))).join("");
    // Only two cells, so a two-column strip — otherwise a third sits there empty
    return '<div class="card"><p class="ctitle">' + esc(t("stats.byMode")) + "</p>" +
      '<p class="csub">' + esc(t("stats.byModeD")) + '</p><div class="statpanel two">' + c + "</div></div>";
  }

  /* Per course — courses already started first, then the rest */
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

  /* ---------------- Suggestions ---------------- */

  function recommendations(s) {
    const out = [];

    // 1. Safety points missed — the most important one
    const missed = s.hist.slice(-5).reduce((a, e) => a + ((e.missed && e.missed.length) || 0), 0);
    if (missed) out.push({ ic: "i-info", tint: "red", t: t("rec.safety.t"), d: t("rec.safety.d", { n: missed }) });

    // 2. Weakest criterion
    const weak = s.crit.slice().sort((a, b) => a.v - b.v)[0];
    if (weak && weak.v < 7.5) {
      out.push({ ic: "i-trend", tint: "amber", t: t("rec.weak.t", { crit: weak.label }), d: t("rec.crit." + weak.key) });
    }

    // 3. Light practice this week (only once timings are being recorded)
    if (s.timedN && s.thisWeekMin < WEEK_TARGET) {
      const left = { m: Math.max(1, Math.round(WEEK_TARGET - s.thisWeekMin)) };
      out.push({ ic: "i-clock", tint: "blue", t: t("rec.time.t", left), d: t("rec.time.d", left) });
    }

    // 4. A full mock interview is still pending
    const iv = s.courses.filter(c => c.def.mode === "interview")[0];
    if (iv && iv.n < iv.def.questions.length) {
      out.push({ ic: "i-mic", tint: "green", t: t("rec.mock.t"),
                 d: t("rec.mock.d", { n: iv.def.questions.length - iv.n }) });
    }

    // 5. A course not touched yet
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

  /* ---------------- Public surface ---------------- */

  /* Redraw the dashboard. onPractise = what to do when "Practise" is pressed. */
  function render(el, onPractise) {
    const s = summarise();
    if (!s.n) {
      el.innerHTML = emptyCard();
      const g = document.getElementById("statsGo");
      if (g && onPractise) g.addEventListener("click", onPractise);
      return s;
    }
    /* Design order: numbers -> this week -> your skills -> recent answers,
       then the extra cards that already existed, and finally "Keep practising". */
    el.innerHTML = panels(s) + timeCard(s) + critCard(s) + recentCard(s) +
                   overallCard(s) + modeCard(s) + courseCard(s) + recCard(s) +
                   '<button class="act" id="statsGo" style="margin-top:4px">' +
                     '<span>' + esc(t("btn.keepPractising")) + "</span>" +
                     '<svg class="svi xs" aria-hidden="true"><use href="#i-arrow"/></svg>' +
                   "</button>";
    const g = document.getElementById("statsGo");
    if (g && onPractise) g.addEventListener("click", onPractise);
    return s;
  }

  /* The small strip on the profile screen */
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
