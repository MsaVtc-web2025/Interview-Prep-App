/* Chapter Quiz - questions straight from the trade's course book, one chapter
   at a time (the banks are the chapters-*.js files).

   It runs on the interview screen as it is - the avatar asks, the student
   speaks or types, the same AI judge reads the answer - and changes only what
   happens once an answer is marked:

     right    -> a thumbs up on screen and "Correct!" spoken
     partial  -> written and spoken feedback on what was missing
     wrong    -> no answer yet; the book answer waits in the report card at
                 the end, so the student tries every question first

   The books are Gujarati; each question also carries an English and a Hindi
   translation (en / hi), and the quiz is asked in the app's language. A
   question with no translation yet is asked in Gujarati.

   The answer is marked against the book's own answer. With AI on the judge
   reads both for meaning, so an answer in any language counts; offline the
   words are matched against the book answer in all three languages, which
   works for an answer in the book's own words.

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

  /* ---------------- Language ---------------- */

  const LANGS3 = ["gu", "en", "hi"];

  /* A book question in one language - Gujarati, the book's own, when there is
     no translation into the one asked for. */
  function version(b, lang) {
    if (lang !== "gu" && b[lang] && b[lang].q && b[lang].a) return { q: b[lang].q, a: b[lang].a, lang: lang };
    return { q: b.q, a: b.a, lang: "gu" };
  }

  /* Every language the question exists in - the word match tries them all */
  function versions(b) {
    return LANGS3.map(l => version(b, l)).filter((v, i, all) => all.findIndex(x => x.lang === v.lang) === i);
  }

  function chTitle(ch) {
    const l = getLang();
    return (l !== "gu" && ch.titles && ch.titles[l]) || ch.title;
  }

  /* Is any question of these chapters missing from this language? */
  function untranslated(chs, lang) {
    return lang !== "gu" && chs.some(ch => ch.qs.some(b => version(b, lang).lang !== lang));
  }

  /* The book question a report row belongs to, whichever language it was
     asked in. By index first; by its text if the bank has been edited since. */
  function bookQuestion(ch, e) {
    const has = b => b && versions(b).some(v => v.q === e.q);
    if (has(ch.qs[e.i])) return ch.qs[e.i];
    return ch.qs.filter(has)[0] || null;
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
    // Questions not translated yet are asked in Gujarati - say so up front
    $("chapLead").textContent = t("quiz.chLead", { n: chs.length }) +
      (untranslated(chs, getLang()) ? " " + t("quiz.bookGu") : "");

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
          '<span class="tx"><span class="nm' + (chTitle(ch) === ch.title ? " guscript" : "") + '">' + esc(chTitle(ch)) + "</span>" +
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

  /* The question as the run screen wants it, in the app's language. The book
     answer goes in `en`, which is where the AI judge looks for the model
     answer; `qlang` is the language it is actually in (Gujarati when there is
     no translation), which decides the font and the voice. */
  function question(i) {
    const b = run.ch.qs[i];
    const v = version(b, getLang());
    return {
      id: "quiz." + run.cid + "." + run.ch.id + "." + i + "." + v.lang,
      q: v.q, en: v.a, cat: b.t || chTitle(run.ch),
      quiz: true, i: i, qlang: v.lang, alts: versions(b)
    };
  }

  /* The current question again - in the new language, after a change */
  function current() { return question(run.idx); }

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
    "है हैं था थी थे और या के की का को में से पर लिए क्या क्यों कैसे कौन कौनसा किस किन कब कहाँ " +
    "यह वह ये वे जो तो भी एक होता होती होते होना करना करने करते करता करती किया जाता जाती जाते " +
    "the a an of to and or is are was be in on at for with by as it its that this from into " +
    "what why how which when where who do does done should can will used use using not their they"
  ).split(/\s+/));

  /* Gujarati sticks the postposition onto the word - "મશીનમાં", "ટૂલનો" - so
     strip it before comparing. Longest first. */
  const SUFFIX = ["માંથી", "માં", "નાં", "નો", "ની", "નું", "ના", "ને", "થી"];

  /* NFC: a nukta letter (ज़) arrives either as one character or as two,
     depending on the keyboard or recogniser - make them the same. */
  function norm(s) {
    return String(s || "").normalize("NFC").toLowerCase()
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

  /* One word, three spellings. The books now say "Safety", but a student may
     still type "સલામતી", and speech recognition often writes the English word
     in Gujarati letters - "સેફ્ટી". Each group is matched as one word: the
     English first, then the Gujarati the books used to have, then the English
     spelt in Gujarati. */
  const SAME = [
    ["safety", "સલામતી", "સુરક્ષા", "સેફ્ટી"], ["safe", "સલામત", "સેફ"],
    ["accident", "અકસ્માત", "એક્સિડન્ટ"], ["injury", "ઈજા", "ઇજા", "ઈન્જરી", "ઇન્જરી"],
    ["injuries", "ઈજાઓ", "ઇજાઓ"],
    ["measurement", "માપન", "મેઝરમેન્ટ"], ["accuracy", "ચોકસાઈ", "એક્યુરસી"],
    ["surface", "સપાટી", "સરફેસ"], ["diameter", "વ્યાસ", "ડાયામીટર", "ડાયમીટર"],
    ["length", "લંબાઈ", "લેન્થ"], ["width", "પહોળાઈ", "વિડ્થ"], ["height", "ઊંચાઈ", "હાઈટ", "હાઇટ"],
    ["depth", "ઊંડાઈ", "ડેપ્થ"], ["formula", "સૂત્ર", "ફોર્મ્યુલા"], ["principle", "સિદ્ધાંત", "પ્રિન્સિપલ"],
    ["unit", "એકમ", "યુનિટ"], ["friction", "ઘર્ષણ", "ફ્રિક્શન"], ["production", "ઉત્પાદન", "પ્રોડક્શન"],
    ["process", "પ્રક્રિયા", "પ્રોસેસ"], ["method", "પદ્ધતિ", "મેથડ"], ["pressure", "દબાણ", "પ્રેશર"],
    ["temperature", "તાપમાન", "ટેમ્પરેચર", "ટેમ્પ્રેચર"], ["parts", "ભાગો", "પાર્ટ્સ"],
    ["cleaning", "સફાઈ", "ક્લીનિંગ"], ["maintenance", "જાળવણી", "મેન્ટેનન્સ"],
    ["defect", "ખામી", "ડિફેક્ટ"], ["internal", "આંતરિક", "ઇન્ટરનલ"], ["external", "બાહ્ય", "એક્સટર્નલ"],
    ["axis", "ધરી", "એક્સિસ"], ["direction", "દિશા", "ડિરેક્શન"], ["speed", "ઝડપ", "સ્પીડ"],
    ["calculation", "ગણતરી", "કેલ્ક્યુલેશન"], ["line", "રેખા", "લાઇન", "લાઈન"],
    ["metal", "ધાતુ", "મેટલ"], ["material", "સામગ્રી", "મટીરિયલ"], ["movement", "હલનચલન", "મૂવમેન્ટ"],
    ["patient", "દર્દી", "પેશન્ટ"], ["patients", "દર્દીઓ", "પેશન્ટ્સ"],
    ["treatment", "સારવાર", "ઉપચાર", "ટ્રીટમેન્ટ"], ["diagnosis", "નિદાન", "ડાયગ્નોસિસ"],
    ["infection", "ચેપ", "ઇન્ફેક્શન", "ઈન્ફેકશન", "ઇન્ફેકશન"], ["heart", "હૃદય", "હાર્ટ"],
    ["artery", "ધમની", "આર્ટરી"], ["vein", "શિરા", "વેઇન", "વેઈન"], ["kidney", "મૂત્રપિંડ", "કિડની"],
    ["vaccine", "રસી", "વેક્સિન"], ["urine", "પેશાબ", "યુરીન", "યુરિન"], ["skin", "ત્વચા", "સ્કિન"],
    ["consent", "સંમતિ", "કન્સેન્ટ"], ["waste", "કચરો", "કચરા", "વેસ્ટ"], ["sterile", "જંતુરહિત", "સ્ટરાઈલ"],
    ["hygiene", "સ્વચ્છતા", "હાઇજીન"], ["mental", "માનસિક", "મેન્ટલ"], ["physical", "શારીરિક", "ફિઝિકલ"],
    ["nutrition", "પોષણ", "ન્યુટ્રિશન"], ["diet", "આહાર", "ડાયેટ"], ["emergency", "કટોકટી", "ઇમરજન્સી"],
    ["pulse", "નાડી", "પલ્સ"], ["muscle", "સ્નાયુ", "મસલ"], ["system", "તંત્ર", "સિસ્ટમ"]
  ];
  /* The same for Hindi: the formal Hindi word, then the English spelt in
     Devanagari. Joined onto the group of the English word in front. */
  const SAME_HI = {
    safety: ["सुरक्षा", "सेफ्टी"], safe: ["सुरक्षित", "सेफ"], accident: ["दुर्घटना", "एक्सीडेंट"],
    injury: ["चोट", "इंजरी"], injuries: ["चोटें", "चोटों"], accuracy: ["सटीकता", "एक्यूरेसी"],
    surface: ["सतह", "सरफेस"], diameter: ["व्यास", "डायमीटर"], length: ["लंबाई", "लेंथ"],
    width: ["चौड़ाई", "विड्थ"], height: ["ऊँचाई", "ऊंचाई", "हाइट"], depth: ["गहराई", "डेप्थ"],
    formula: ["सूत्र", "फॉर्मूला"], principle: ["सिद्धांत", "प्रिंसिपल"], unit: ["इकाई", "यूनिट"],
    friction: ["घर्षण", "फ्रिक्शन"], production: ["उत्पादन", "प्रोडक्शन"], process: ["प्रक्रिया", "प्रोसेस"],
    method: ["विधि", "पद्धति", "मेथड"], pressure: ["दबाव", "प्रेशर"], temperature: ["तापमान", "टेम्परेचर"],
    parts: ["पुर्ज़े", "पुर्जे", "पार्ट्स"], maintenance: ["रखरखाव", "मेंटेनेंस"], defect: ["ख़राबी", "खराबी", "दोष", "डिफेक्ट"],
    internal: ["आंतरिक", "इंटरनल"], axis: ["अक्ष", "एक्सिस"], direction: ["दिशा", "डायरेक्शन"],
    speed: ["रफ़्तार", "रफ्तार", "स्पीड"], calculation: ["गणना", "कैलकुलेशन"], metal: ["धातु", "मेटल"],
    patient: ["मरीज़", "मरीज", "रोगी", "पेशेंट"], patients: ["मरीज़ों", "मरीजों", "रोगियों"],
    treatment: ["उपचार", "ट्रीटमेंट"], diagnosis: ["निदान", "डायग्नोसिस"], infection: ["संक्रमण", "इन्फेक्शन", "इंफेक्शन"],
    heart: ["हृदय", "हार्ट"], artery: ["धमनी", "आर्टरी"], vein: ["शिरा", "वेन"], kidney: ["गुर्दा", "गुर्दे", "किडनी"],
    vaccine: ["टीका", "वैक्सीन"], urine: ["मूत्र", "यूरिन"], skin: ["त्वचा", "स्किन"], consent: ["सहमति", "कंसेंट"],
    hygiene: ["स्वच्छता", "हाइजीन"], mental: ["मानसिक", "मेंटल"], physical: ["शारीरिक", "फिजिकल"],
    nutrition: ["पोषण", "न्यूट्रिशन"], diet: ["आहार", "डाइट"], emergency: ["आपातकाल", "आपातकालीन", "इमरजेंसी"],
    pulse: ["नाड़ी", "नब्ज़", "नब्ज", "पल्स"], muscle: ["मांसपेशी", "मसल"]
  };
  const CANON = Object.create(null);
  SAME.forEach(g => g.forEach(w => { CANON[w] = g[0]; }));
  Object.keys(SAME_HI).forEach(k => SAME_HI[k].forEach(w => { CANON[w.normalize("NFC")] = k; }));

  function words(s) {
    const out = norm(s).split(" ").filter(Boolean).map(stem).map(w => CANON[w] || w)
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
    const said = words(ans);
    const hit = w => said.some(s => same(s, w));

    /* The student may answer in any of the three languages, whatever the app
       shows - so mark against the book answer they came closest to. */
    let best = null;
    (q.alts && q.alts.length ? q.alts : [{ q: q.q, a: q.en }]).forEach(v => {
      const qw = words(v.q);
      const fresh = ws => ws.filter(w => qw.indexOf(w) === -1);
      let key = fresh(words(v.a));
      if (!key.length) key = words(v.a);
      const share = key.length ? key.filter(hit).length / key.length : 0;
      if (best && share <= best.share) return;

      const miss = phrases(v.a).filter(p => {
        const pw = fresh(words(p));
        return pw.length && pw.filter(hit).length / pw.length < 0.5;
      }).slice(0, 4);
      best = { share: share, miss: miss };
    });

    return {
      v: best.share >= RIGHT_AT ? "right" : best.share >= PART_AT ? "partial" : "wrong",
      miss: best.miss, fb: "", byAi: false
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
    // No reply from the AI: the word match stands, and the card says so
    return Judge.evaluate(ans, q, "technical", getLang(), false)
      .then(j => j ? withAi(off, j) : Object.assign({}, off, { aiFailed: true }));
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
    // The phrases come from whichever language's book answer was closest
    return "<ul>" + miss.map(m =>
      "<li" + (/[઀-૿]/.test(m) ? ' class="guscript"' : "") + ">" + esc(m) + "</li>").join("") + "</ul>";
  }

  let lastRetry = null;        // "Try AI again" for the result on screen

  /* quiet = redraw only (a language change) - no thumbs up a second time.
     onRetry: the AI did not answer - offer to try it again. */
  function showResult(r, quiet, onRetry) {
    lastMark = r;
    if (!quiet) lastRetry = onRetry || null;
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
    h += markedBy(r, lastRetry);          // "Marked by AI" / "Marked offline" - app.js

    $("hint").className = "hint";
    $("hint").textContent = "";
    $("result").hidden = false;
    $("result").innerHTML = h;
    if (lastRetry && $("btnAiRetry")) $("btnAiRetry").addEventListener("click", lastRetry);
    if (quiet) return;
    if (r.v === "right") cheer();
    revealResult();
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

  /* Script a voice can read. English words inside Gujarati or Hindi go to
     the English voice (speech.js), but a Hindi voice cannot read Gujarati
     letters, nor an English one either Indian script. */
  const FOREIGN = { en: /[ऀ-ॿ઀-૿]/, gu: /[ऀ-ॿ]/, hi: /[઀-૿]/ };

  /* Spoken feedback in the app's language. A partly right answer gets the
     judge's advice read out (it writes in the student's language); without
     the judge the missing phrases come from the book answer the student was
     closest to, and are read only when the voice can read that script. */
  function speak(r) {
    const voice = LANG_VOICE[getLang()] || "en";
    if (!state.settings.speakFb || !Speech.hasVoice(voice)) { Avatar.setState("idle"); return; }

    let msg = t(r.v === "right" ? "quiz.sayRight" : r.v === "partial" ? "quiz.sayPartial" : "quiz.sayWrong");
    if (r.v === "partial") {
      if (r.fb) msg += " " + r.fb;
      else if (r.miss.length && !FOREIGN[voice].test(r.miss.join(" "))) {
        msg += " " + t("quiz.missing") + " " + r.miss.join(". ");
      }
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
      '<h2 class="repch' + (chTitle(ch) === ch.title ? " guscript" : "") + '">' + esc(chTitle(ch)) + "</h2>" +
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
      // shows a report row against some other question's answer. Question
      // and answer then show in the app's language now, whichever language
      // the question was asked in.
      const b = bookQuestion(ch, e);
      const bv = b ? version(b, getLang()) : { q: e.q, a: "", lang: "gu" };
      const gu = bv.lang === "gu" ? " guscript" : "";
      const book = bv.a;
      const bookHtml = '<p class="rcor' + gu + '">' + esc(book) + "</p>";
      const v = BADGE[e.v] ? e.v : "wrong";

      let row = '<div class="card rrow ' + v + '">' +
        '<div class="rhead"><span class="rnum">' + esc(t("quiz.qn", { n: e.i + 1 })) + "</span>" +
        '<span class="rbadge">' + BADGE[v] + " " + esc(t(VKEY[v])) + "</span></div>" +
        '<p class="rq' + gu + '">' + esc(bv.q) + "</p>" +
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
    on, begin, next, current, progress, atLast, title,
    mark, record, skip, showResult, speak, relocalize, finish,
    renderTrades, openChapters, renderChapters, openReport, renderReport,
    again, backToChapters, drop
  };
})();
