/* Chapter Quiz - questions straight from the trade's course book, one chapter
   at a time (the banks are the chapters-*.js files).

   It runs on the interview screen as it is - the avatar asks, the student
   speaks or types, the same AI judge reads the answer - and changes only what
   happens once an answer is marked:

     right    -> a thumbs up on screen and "Correct!" spoken
     partial  -> written and spoken feedback on what was missing
     wrong    -> no answer yet; the book answer waits in the report card at
                 the end, so the student tries every question first

   The answer is marked against the book's own answer. With AI on the judge
   reads both for meaning, so an answer in any language counts; offline the
   words are matched against the book, which only works for an answer in the
   book's own words.

   Quiz answers stay out of the interview history: a book quiz is not an
   interview, and its marks would pull the interview averages around. They are
   kept apart in state.quiz, one record per chapter (the latest attempt). */
"use strict";

const Quiz = (function () {

  /* Offline: the share of the book answer's words the student said.
     AI: the judge's accuracy mark out of 10. */
  const RIGHT_AT = 0.6, PART_AT = 0.25;
  const AI_RIGHT = 7, AI_PART = 4;
  const MAX_KEEP = 1200;       // characters of an answer kept in the report

  let run = null;              // the quiz in progress: { cid, ch, idx, entries, done }
  let lastMark = null;         // the result on screen - redrawn when the language changes
  let listCid = null;          // the course whose chapter list is open
  let rep = null;              // the report card open: { cid, chId }
  let cheerTimer = null;

  function on() { return !!(run && !run.done); }

  function store(cid) {
    if (!state.quiz || typeof state.quiz !== "object") state.quiz = {};
    if (!state.quiz[cid] || typeof state.quiz[cid] !== "object") state.quiz[cid] = {};
    return state.quiz[cid];
  }

  function findChapter(cid, chId) {
    return getChapters(cid).filter(c => c.id === chId)[0] || null;
  }

  const pctColor = p => colorFor(p / 10);

  /* ---------------- Practice tab: the trades ---------------- */

  /* Same tiles as the interview mode, but only the trades - and a trade whose
     book has not been added yet says so instead of opening an empty list. */
  function renderTrades(el) {
    const tc = trackCourse();
    const list = COURSES.filter(c => c.mode === "technical" && (!tc || c === tc));
    el.innerHTML = list.map(c => {
      const i = COURSES.indexOf(c);    // keeps each course's colour fixed
      const n = getChapters(c.id).length;
      const meta = n
        ? '<div class="mt">' + esc(t("quiz.nChapters", { n: n })) + "</div>"
        : '<div class="mt soon">' + esc(t("quiz.soon")) + "</div>";
      return '<button class="tile" data-id="' + esc(c.id) + '"' + (n ? "" : " disabled") + ">" +
        '<div class="chip t' + (i % 8 + 1) + '">' + esc(c.icon) + "</div>" +
        '<div class="nm">' + esc(tCourse(c, "name")) + "</div>" +
        '<div class="tg">' + esc(tCourse(c, "tagline")) + "</div>" + meta + "</button>";
    }).join("");

    Array.prototype.forEach.call(el.querySelectorAll(".tile:not([disabled])"), b => {
      b.addEventListener("click", () => openChapters(b.getAttribute("data-id")));
    });
  }

  /* ---------------- The chapter list ---------------- */

  function openChapters(cid) {
    const c = getCourse(cid || listCid);
    if (!c || !getChapters(c.id).length) { goTab("practice"); return; }
    listCid = c.id;
    renderChapters();
    show("chapters");
  }

  function renderChapters() {
    const c = getCourse(listCid);
    if (!c) return;
    const chs = getChapters(c.id), saved = store(c.id);
    $("chapIcon").textContent = c.icon;
    $("chapName").textContent = tCourse(c, "name");
    // The books are in Gujarati - say so up front rather than surprise them
    $("chapLead").textContent = t("quiz.chLead", { n: chs.length }) +
      (getLang() === "gu" ? "" : " " + t("quiz.bookGu"));

    $("chapList").innerHTML = chs.map(ch => {
      const r = saved[ch.id];
      const last = r && r.n
        ? '<div class="chlast"><span style="color:' + pctColor(r.pct) + '">' +
            esc(t("quiz.last", { p: r.pct })) + "</span>" +
            '<button class="mini" data-rep="' + esc(ch.id) + '">' + esc(t("quiz.viewReport")) + "</button></div>"
        : "";
      return '<div class="chrow">' +
        '<button class="chgo" data-ch="' + esc(ch.id) + '">' +
          '<span class="no">' + esc(ch.no) + "</span>" +
          '<span class="tx"><span class="nm guscript">' + esc(ch.title) + "</span>" +
          '<span class="mt">' + esc(t("tile.questions", { n: ch.qs.length })) + "</span></span>" +
          '<svg class="svi sm" aria-hidden="true"><use href="#i-next"/></svg>' +
        "</button>" + last + "</div>";
    }).join("");

    Array.prototype.forEach.call($("chapList").querySelectorAll("[data-ch]"), b => {
      b.addEventListener("click", () => startChapterQuiz(listCid, b.getAttribute("data-ch")));
    });
    Array.prototype.forEach.call($("chapList").querySelectorAll("[data-rep]"), b => {
      b.addEventListener("click", () => openReport(listCid, b.getAttribute("data-rep")));
    });
  }

  /* ---------------- Running a chapter ---------------- */

  /* Called by startChapterQuiz() in app.js, which then opens the run screen */
  function begin(cid, chId) {
    const ch = findChapter(cid, chId);
    if (!ch) return false;
    run = { cid: cid, ch: ch, idx: -1, entries: [], done: false };
    listCid = cid;
    lastMark = null;
    return true;
  }

  /* The question as the run screen wants it. The book answer goes in `en`,
     which is where the AI judge looks for the model answer. */
  function question(i) {
    const b = run.ch.qs[i];
    return {
      id: "quiz." + run.cid + "." + run.ch.id + "." + i,
      q: b.q, en: b.a, cat: b.t || run.ch.title,
      quiz: true, i: i
    };
  }

  /* The first question, the next one, or (advance false) the same one again */
  function next(advance) {
    if (advance || run.idx < 0) run.idx = Math.min(run.idx + 1, run.ch.qs.length - 1);
    lastMark = null;
    return question(run.idx);
  }

  function progress() { return (run.idx + 1) + "/" + run.ch.qs.length; }
  function atLast() { return !!run && run.idx >= run.ch.qs.length - 1; }
  function title() { return run ? t("quiz.ch", { no: run.ch.no }) : ""; }

  /* ---------------- Marking ---------------- */

  /* Words that carry no meaning of their own - matching on them would make
     any sentence look half right. */
  const STOP = new Set((
    "છે છો હતું હતી હતા હોય થાય થઈ થયેલ અને અથવા કે તો તે તેને તેમાં તેના તેની તેનો તેનું " +
    "આ એ જે જેમાં જેથી માટે થી નો ની નું ના ને માં પર સાથે શું શા કેમ કયા કયું કયો કઈ કેવી " +
    "રીતે કરવા કરવું કરે કરવી કરવો કરવામાં કરીને આવે આવતી આવતો આવતું આવેલ વપરાય દ્વારા " +
    "સુધી પહેલાં પછી " +
    "है हैं और या के की का को में से पर लिए क्या " +
    "the a an of to and or is are was be in on at for with by as it its that this from into"
  ).split(/\s+/));

  /* Gujarati sticks the postposition onto the word - "મશીનમાં", "ટૂલનો" - so
     strip it before comparing. Longest first. */
  const SUFFIX = ["માંથી", "માં", "નાં", "નો", "ની", "નું", "ના", "ને", "થી"];

  function norm(s) {
    return String(s || "").toLowerCase()
      .replace(/[૦-૯]/g, d => String(d.charCodeAt(0) - 0x0AE6))   // Gujarati digits
      .replace(/[०-९]/g, d => String(d.charCodeAt(0) - 0x0966))   // Devanagari digits
      .replace(/[^a-z0-9ऀ-ॿ઀-૿]+/g, " ")
      .trim();
  }

  function stem(w) {
    for (let i = 0; i < SUFFIX.length; i++) {
      const s = SUFFIX[i];
      if (w.length > s.length + 1 && w.endsWith(s)) return w.slice(0, -s.length);
    }
    return w;
  }

  function words(s) {
    const out = norm(s).split(" ").filter(Boolean).map(stem)
      .filter(w => !STOP.has(w) && (w.length > 1 || /\d/.test(w)));
    return out.filter((w, i) => out.indexOf(w) === i);
  }

  /* One word the same as another - exactly, or one the start of the other
     ("ગ્લોવ્સ" / "ગ્લોવ્ઝ" are not caught, "spindle" / "spindles" are). Numbers
     have to match exactly: 25.4 is not 25. */
  function same(a, b) {
    if (a === b) return true;
    if (/\d/.test(a) || /\d/.test(b)) return false;
    return Math.min(a.length, b.length) >= 3 && (a.startsWith(b) || b.startsWith(a));
  }

  /* The book answer in its own phrases, for "you also needed to say...". Split
     at "and" too, so half a sentence the student did say is not repeated. */
  function phrases(a) {
    return String(a || "").split(/\n|[.;।]\s|,\s|\s(?:અને|and|और)\s/)
      .map(s => s.replace(/^[•\s]+/, "").replace(/[.\s]+$/, "").trim())
      .filter(s => s.length > 1);
  }

  /* Word match against the book answer. Words the question already gives away
     do not count - repeating the question back is not knowing the answer. */
  function offline(ans, q) {
    const qw = words(q.q);
    const fresh = ws => ws.filter(w => qw.indexOf(w) === -1);
    let key = fresh(words(q.en));
    if (!key.length) key = words(q.en);
    const said = words(ans);
    const hit = w => said.some(s => same(s, w));
    const share = key.length ? key.filter(hit).length / key.length : 0;

    const miss = phrases(q.en).filter(p => {
      const pw = fresh(words(p));
      return pw.length && pw.filter(hit).length / pw.length < 0.5;
    }).slice(0, 4);

    return {
      v: share >= RIGHT_AT ? "right" : share >= PART_AT ? "partial" : "wrong",
      miss: miss, fb: "", byAi: false
    };
  }

  /* The judge's reply on top of the word match. Its accuracy mark decides; a
     "don't know" or an answer about something else is wrong whatever the
     number. Anything malformed leaves the word match standing. */
  function withAi(off, j) {
    if (!j) return off;
    const acc = j.scores && j.scores.accuracy != null ? j.scores.accuracy : j.overall;
    if (acc == null || !isFinite(acc)) return off;
    let v = acc >= AI_RIGHT ? "right" : acc >= AI_PART ? "partial" : "wrong";
    if (j.classification === "dont_know" || j.classification === "off_topic") v = "wrong";
    return {
      v: v,
      miss: v === "partial" ? (j.missed && j.missed.length ? j.missed : off.miss) : [],
      fb: v === "partial" ? (j.advice || "") : "",
      byAi: true
    };
  }

  /* judged = marks that came back with the transcript, from the one call that
     does both. Always resolves, never rejects. */
  function mark(ans, q, judged) {
    const off = offline(ans, q);
    if (judged) return Promise.resolve(withAi(off, judged));
    if (!Judge.active()) return Promise.resolve(off);
    return Judge.evaluate(ans, q, "technical", getLang(), false).then(j => withAi(off, j));
  }

  /* The latest answer to a question replaces any earlier one */
  function record(q, ans, r) {
    if (!on()) return;
    run.entries[q.i] = {
      i: q.i, q: q.q, ans: String(ans || "").slice(0, MAX_KEEP),
      v: r.v, fb: r.fb, miss: r.miss, ai: !!r.byAi
    };
  }

  /* A skipped question counts as not answered - unless it already was */
  function skip(q) {
    if (!on() || !q || run.entries[q.i]) return;
    run.entries[q.i] = { i: q.i, q: q.q, ans: "", v: "skip", fb: "", miss: [], ai: false };
  }

  /* ---------------- Showing the verdict ---------------- */

  function verdict(cls, icon, head, sub) {
    return '<div class="qv ' + cls + '"><span class="ic" aria-hidden="true">' + icon + "</span>" +
      "<div><b>" + esc(head) + "</b><small>" + esc(sub) + "</small></div></div>";
  }

  function missList(miss) {
    return '<ul class="guscript">' + miss.map(m => "<li>" + esc(m) + "</li>").join("") + "</ul>";
  }

  /* quiet = redraw only (a language change) - no thumbs up a second time */
  function showResult(r, quiet) {
    lastMark = r;
    let h;
    if (r.v === "right") {
      h = verdict("right", "👍", t("quiz.right"), t("quiz.rightD"));
    } else if (r.v === "partial") {
      h = verdict("part", "📝", t("quiz.partial"), t("quiz.partialD"));
      if (r.fb) h += '<div class="box adv"><b>' + esc(t("quiz.feedback")) + "</b>" + esc(r.fb) + "</div>";
      if (r.miss.length) h += '<div class="box tip"><b>' + esc(t("quiz.missing")) + "</b>" + missList(r.miss) + "</div>";
    } else {
      h = verdict("wrong", "❌", t("quiz.wrong"), t("quiz.wrongD"));
    }
    if (r.byAi) h += '<div class="aibadge">' + esc(t("ai.badge")) + "</div>";

    $("hint").className = "hint";
    $("hint").textContent = "";
    $("result").hidden = false;
    $("result").innerHTML = h;
    if (quiet) return;
    if (r.v === "right") cheer();
    $("result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* The big thumbs up. Off the page again by itself; it never blocks a tap. */
  function cheer() {
    const el = $("cheer");
    if (!el) return;
    el.hidden = false;
    el.classList.remove("on");
    void el.offsetWidth;               // restart the animation on a second right answer
    el.classList.add("on");
    if (cheerTimer) clearTimeout(cheerTimer);
    cheerTimer = setTimeout(() => { el.classList.remove("on"); el.hidden = true; }, 1700);
  }

  /* Spoken feedback in the app's language. A partly right answer gets the
     judge's advice read out (it writes in the student's language); without
     the judge the missing phrases are the book's Gujarati, so they are read
     only by a Gujarati voice. */
  function speak(r) {
    const voice = LANG_VOICE[getLang()] || "en";
    if (!state.settings.speakFb || !Speech.hasVoice(voice)) { Avatar.setState("idle"); return; }

    let msg = t(r.v === "right" ? "quiz.sayRight" : r.v === "partial" ? "quiz.sayPartial" : "quiz.sayWrong");
    if (r.v === "partial") {
      if (r.fb) msg += " " + r.fb;
      else if (r.miss.length && voice === "gu") msg += " " + t("quiz.missing") + " " + r.miss.join(". ");
    }
    Speech.speak(msg, { lang: voice, rate: state.settings.rate }).then(() => {
      if (phase === "feedback") Avatar.setState("idle");
    });
  }

  /* Redraw what is on the run screen after a language change */
  function relocalize() {
    if (on() && lastMark && phase === "feedback") showResult(lastMark, true);
  }

  /* ---------------- The end of the chapter ---------------- */

  /* Save the attempt and close the run. Returns where the report card is, or
     null when nothing was answered at all (then there is nothing to report).
     The score is out of the whole chapter - a partly right answer is half a
     mark - so stopping early cannot look like a perfect chapter. */
  function finish() {
    if (!on()) return null;
    run.done = true;
    const list = run.entries.filter(Boolean);
    if (!list.length) return null;

    const n = run.ch.qs.length;
    const cnt = { right: 0, partial: 0, wrong: 0, skip: 0 };
    list.forEach(e => { cnt[e.v] = (cnt[e.v] || 0) + 1; });
    const pct = Math.round((cnt.right + cnt.partial * 0.5) / n * 100);

    const s = store(run.cid);
    const old = s[run.ch.id];
    s[run.ch.id] = {
      ts: Date.now(), n: n, cnt: cnt, pct: pct,
      best: Math.max(pct, (old && old.best) || 0),
      entries: list
    };
    save();
    return { cid: run.cid, chId: run.ch.id };
  }

  /* ---------------- Report card ---------------- */

  function openReport(cid, chId) {
    rep = { cid: cid, chId: chId };
    if (!renderReport()) { openChapters(cid); return; }
    show("qreport");
  }

  const BADGE = { right: "✓", partial: "½", wrong: "✗", skip: "–" };
  const VKEY = { right: "quiz.cRight", partial: "quiz.cPart", wrong: "quiz.cWrong", skip: "quiz.cSkip" };

  function renderReport() {
    if (!rep) return false;
    const c = getCourse(rep.cid), ch = findChapter(rep.cid, rep.chId);
    const r = c && ch ? store(rep.cid)[rep.chId] : null;
    if (!r || !Array.isArray(r.entries)) return false;

    const C = 2 * Math.PI * 33;
    const off = C * (1 - r.pct / 100);
    const nm = userName();
    const when = new Date(r.ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

    let h = '<div class="card repsum">' +
      '<div class="reporg">' + esc(t("quiz.org")) + "</div>" +
      '<div class="reptrade">' + esc(c.icon + " " + tCourse(c, "name") + " · " + t("quiz.ch", { no: ch.no })) + "</div>" +
      '<h2 class="repch guscript">' + esc(ch.title) + "</h2>" +
      '<div class="repmeta">' + esc((nm ? t("quiz.student", { name: nm }) + " · " : "") + when) + "</div>" +
      '<div class="ring big"><svg viewBox="0 0 74 74">' +
        '<circle class="bgc" cx="37" cy="37" r="33"/>' +
        '<circle class="fgc" cx="37" cy="37" r="33" stroke="' + pctColor(r.pct) + '" ' +
          'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
      '</svg><b style="color:' + pctColor(r.pct) + '">' + r.pct + "%</b></div>" +
      '<div class="repcnt">' +
        ["right", "partial", "wrong", "skip"].map(k =>
          '<div class="' + k + '"><b>' + (r.cnt[k] || 0) + "</b>" + esc(t(VKEY[k])) + "</div>").join("") +
      "</div>" +
      '<div class="repmeta">' + esc(t("quiz.asked", { a: r.entries.length - (r.cnt.skip || 0), n: r.n })) +
        (r.best > r.pct ? " · " + esc(t("quiz.best", { p: r.best })) : "") + "</div>" +
      "</div>";

    h += r.entries.map(e => {
      // Look the book answer up by its question, so an edited bank never
      // shows a report row against some other question's answer.
      const b = ch.qs[e.i] && ch.qs[e.i].q === e.q ? ch.qs[e.i] : ch.qs.filter(x => x.q === e.q)[0];
      const book = b ? b.a : "";
      const bookHtml = '<p class="rcor guscript">' + esc(book) + "</p>";
      const v = BADGE[e.v] ? e.v : "wrong";

      let row = '<div class="card rrow ' + v + '">' +
        '<div class="rhead"><span class="rnum">' + esc(t("quiz.qn", { n: e.i + 1 })) + "</span>" +
        '<span class="rbadge">' + BADGE[v] + " " + esc(t(VKEY[v])) + "</span></div>" +
        '<p class="rq guscript">' + esc(e.q) + "</p>" +
        '<div class="rlab">' + esc(t("quiz.yourAns")) + "</div>" +
        (e.ans ? '<p class="rans">' + esc(e.ans) + "</p>" : '<p class="rans none">' + esc(t("quiz.noAns")) + "</p>");

      if (v === "partial" && e.fb) row += '<div class="rlab">' + esc(t("quiz.feedback")) + '</div><p class="rans">' + esc(e.fb) + "</p>";
      if (v === "partial" && e.miss && e.miss.length) row += '<div class="rlab">' + esc(t("quiz.missing")) + "</div>" + missList(e.miss);

      // Right answers keep the book answer folded away - it is there to
      // compare, not to read twice.
      row += book
        ? (v === "right"
            ? '<details class="rbook"><summary>' + esc(t("quiz.bookAns")) + "</summary>" + bookHtml + "</details>"
            : '<div class="rlab">' + esc(t("quiz.bookAns")) + "</div>" + bookHtml)
        : "";
      return row + "</div>";
    }).join("");

    $("repTitle").textContent = t("quiz.report");
    $("repBody").innerHTML = h;
    return true;
  }

  /* Throw away an unfinished chapter - a mock interview is starting, and it
     must not run as a quiz. */
  function drop() { run = null; lastMark = null; }

  function again() { if (rep) startChapterQuiz(rep.cid, rep.chId); }
  function backToChapters() { openChapters(rep ? rep.cid : listCid); }

  return {
    on, begin, next, progress, atLast, title,
    mark, record, skip, showResult, speak, relocalize, finish,
    renderTrades, openChapters, renderChapters, openReport, renderReport,
    again, backToChapters, drop
  };
})();
