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

  /* Offline (the chapter quiz): cover = the weighted share of the book
     answer's words the student said; focus = the weighted share of the
     student's words that are about the book answer (see offline()). Set
     against every book answer in the bank - see the test bench numbers in
     README.md. AI: the judge's accuracy mark out of 10. */
  const RIGHT_AT = 0.65, PART_AT = 0.25;
  const FOCUS_RIGHT = 0.5, FOCUS_PART = 0.3;
  const POINTS_PART = 0.25;    // a quarter of a 3+ point answer's points named
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

  /* The section a question comes from, shown above it: one name, or a name
     per language for a chapter made of the book's sections */
  function topic(b) {
    if (!b.t) return "";
    return typeof b.t === "object" ? b.t[getLang()] || b.t.gu : b.t;
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
    paintQuizModes();                  // app.js
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
      q: v.q, en: v.a, cat: topic(b) || chTitle(run.ch),
      quiz: true, i: i, qlang: v.lang, alts: versions(b)
    };
  }

  /* The current question again - in the new language, after a change */
  function current() { return question(run.idx); }

  /* Multiple choice: the book answer and three wrong ones, in the language
     the question is shown in. The wrong ones are those written for the
     question (mcq-*.js): the same kind of answer, so the right one cannot be
     guessed. Without them, answers to other questions of the chapter - the
     closest in length, and none that the checker would pass as right. The
     order is shuffled the same way every time for a question. */
  function choices() {
    const b = run.ch.qs[run.idx];
    const mine = version(b, getLang());
    const q = question(run.idx);
    const flat = s => norm(s).replace(/\s/g, "");
    const clip = s => {
      const t = String(s).replace(/^[•\s]+/, "").replace(/\s*\n\s*[•]?\s*/g, "; ").trim();
      return t.length > 220 ? t.slice(0, 217).trim() + "…" : t;
    };
    let seed = (run.idx + 1) * 7919 + run.ch.id.length * 104729;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

    const seen = new Set([flat(mine.a)]);
    // The written wrong options for this question, when there are some
    const own = getMcq(run.cid, run.ch.id, run.idx);
    const mineOwn = own && Array.isArray(own[mine.lang]) ? own[mine.lang].filter(a => a && !seen.has(flat(a))) : [];
    const pool = mineOwn.length >= 3 ? [] : run.ch.qs.map((x, j) => j === run.idx ? null : version(x, getLang()))
      .filter(v => v && v.lang === mine.lang)
      .sort((x, y) => Math.abs(x.a.length - mine.a.length) - Math.abs(y.a.length - mine.a.length));
    const others = mineOwn.slice(0, 3);
    others.forEach(a => seen.add(flat(a)));
    for (const v of pool) {
      if (others.length >= 3) break;
      const f = flat(v.a);
      if (seen.has(f) || offline(v.a, q).v !== "wrong") continue;   // never a second right answer
      seen.add(f);
      others.push(v.a);
    }
    const list = [{ text: clip(mine.a), right: true, full: mine.a }].concat(others.map(a => ({ text: clip(a), right: false, full: a })));
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const x = list[i]; list[i] = list[j]; list[j] = x; }
    return list;
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
    "है हैं था थी थे और या के की का को में से पर लिए क्या क्यों कैसे कौन कौनसा किस किन कब कहाँ " +
    "यह वह ये वे जो तो भी एक होता होती होते होना करना करने करते करता करती किया जाता जाती जाते " +
    "the a an of to and or is are was be in on at for with by as it its that this from into " +
    "what why how which when where who do does done should can will used use using not their they " +
    "make sure whether has had have been being would could may might must shall also any " +
    "we you he she them his her our your my me us am were so very just " +
    "હોવું હોવી હોવો હોવા રાખવું રાખવી રાખવા રાખો જોઈએ જોઇએ તથા પણ વગેરે ખૂબ જ જેમ જેવી જેવા જેવું વખતે " +
    "कि हो हुआ हुई हुए गया गई गए दी दिया दिए रखना रखें रखा करें करे जाना वाला वाली वाले तरह जैसे ही तक तथा एवं जब तब"
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
      // "Z.R.N", "S.I." - an abbreviation is one word
      .replace(/\b[a-z](?:\.[a-z])+\.?/g, w => w.replace(/\./g, ""))
      // The axis direction is the answer: "X+" and "X–" are different words
      .replace(/\b([abcuvwxyz])\s*\+/g, "$1plus ")
      .replace(/\b([abcuvwxyz])\s*[-–−](?=[\s.,;।)]|$)/g, "$1minus ")
      .replace(/\b([abcuvwxyz])\s+(plus|minus)\b/g, "$1$2")
      // × and ÷ are the answer in a unit conversion
      .replace(/×/g, " multiply ").replace(/÷/g, " divide ")
      .replace(/[।॥]/g, " ")
      // "...है या नहीं", "...છે કે નહીં", "whether or not" - a question, not a negation
      .replace(/\s(या|કે|or)\s+(नहीं|નહીં|નહિ|not)(?=\s|$)/g, " ")
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
    ["pulse", "નાડી", "પલ્સ"], ["muscle", "સ્નાયુ", "મસલ"], ["system", "તંત્ર", "સિસ્ટમ"],
    ["dose", "માત્રા", "ડોઝ", "ડોસ"], ["check", "તપાસ", "તપાસવું", "તપાસવા", "ચેક"],
    ["medicine", "દવા", "દવાઓ", "દવાની", "મેડિસિન", "મેડીસીન"]
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
    pulse: ["नाड़ी", "नब्ज़", "नब्ज", "पल्स"], muscle: ["मांसपेशी", "मसल"],
    dose: ["मात्रा", "डोज़", "डोज"], check: ["जाँच", "जांच", "जाँचें", "जांचें", "चेक"],
    medicine: ["दवा", "दवाई", "दवाएँ", "दवाइयाँ", "मेडिसिन"]
  };
  const CANON = Object.create(null);
  SAME.forEach(g => g.forEach(w => { CANON[w] = g[0]; }));
  Object.keys(SAME_HI).forEach(k => SAME_HI[k].forEach(w => { CANON[w.normalize("NFC")] = k; }));

  /* "Not visible" is not "visible": a negation is joined to the word it
     negates - the next word in English and Hindi ("not visible", "नहीं दिखते"),
     the one before in Gujarati ("દેખાતી નથી"). */
  const NOT_BEFORE = new Set(["not", "no", "never", "without", "नहीं", "न", "मत", "बिना"]);
  const NOT_AFTER = new Set(["નથી", "નહીં", "નહિ", "ના"]);

  function negate(toks) {
    const out = [];
    for (let i = 0; i < toks.length; i++) {
      const w = toks[i];
      if (NOT_BEFORE.has(w) && i + 1 < toks.length) { out.push("not_" + toks[++i]); continue; }
      if (NOT_AFTER.has(w) && out.length && !/^not_/.test(out[out.length - 1])) { out.push("not_" + out.pop()); continue; }
      out.push(w);
    }
    return out;
  }

  /* A single letter is kept when it is English (the X axis, G-code, M-code);
     a stray Gujarati or Hindi letter is noise. */
  function words(s) {
    const toks = norm(s).split(" ").filter(Boolean).map(stem).map(w => CANON[w] || w);
    const out = negate(toks).map(w => /^not_/.test(w) ? "not_" + (CANON[w.slice(4)] || w.slice(4)) : w)
      .filter(w => !STOP.has(w) && (w.length > 1 || /[a-z\d]/.test(w)));
    return out.filter((w, i) => out.indexOf(w) === i);
  }

  /* One word the same as another - exactly, or one the start of the other
     when they are nearly as long ("spindle" / "spindles", "chip" / "chips",
     but not "cut" / "cutting tool"). Numbers have to match exactly: 25.4 is
     not 25. */
  function same(a, b) {
    if (a === b) return true;
    if (/\d/.test(a) || /\d/.test(b)) return false;
    const s = Math.min(a.length, b.length), l = Math.max(a.length, b.length);
    if (s >= 3 && s / l >= 0.6 && (a.startsWith(b) || b.startsWith(a))) return true;
    return sounds(a, b);
  }

  /* ---- The same word in another script --------------------------------
     A Gujarati or Hindi phone writes English words down in its own letters -
     "પર્સનલ પ્રોટેક્ટિવ ઇક્વિપમેન્ટ" for "Personal Protective Equipment" - while
     the books write them in English letters. So a word in one script is
     compared with a word in the other by its consonants: p-r-s-n-l either
     way. Vowels are dropped (they are spelt too many ways to compare) and
     sounds a speaker does not tell apart are one (t/th, d/dh, s/sh, v/w). */
  const CONS = {
    "ક": "k", "ખ": "k", "ગ": "g", "ઘ": "g", "ઙ": "n", "ચ": "c", "છ": "c", "જ": "j", "ઝ": "j", "ઞ": "n",
    "ટ": "t", "ઠ": "t", "ડ": "d", "ઢ": "d", "ણ": "n", "ત": "t", "થ": "t", "દ": "d", "ધ": "d", "ન": "n",
    "પ": "p", "ફ": "f", "બ": "b", "ભ": "b", "મ": "m", "ય": "y", "ર": "r", "લ": "l", "ળ": "l", "વ": "v",
    "શ": "s", "ષ": "s", "સ": "s", "હ": "", "ં": "n",
    "क": "k", "ख": "k", "ग": "g", "घ": "g", "ङ": "n", "च": "c", "छ": "c", "ज": "j", "झ": "j", "ञ": "n",
    "ट": "t", "ठ": "t", "ड": "d", "ढ": "d", "ण": "n", "त": "t", "थ": "t", "द": "d", "ध": "d", "न": "n",
    "प": "p", "फ": "f", "ब": "b", "भ": "b", "म": "m", "य": "y", "र": "r", "ल": "l", "ळ": "l", "व": "v",
    "श": "s", "ष": "s", "स": "s", "ह": "", "ं": "n", "ऱ": "r", "ड़": "d", "ढ़": "d", "ज़": "j", "फ़": "f"
  };
  const skelCache = Object.create(null);
  function skeleton(w) {
    if (w in skelCache) return skelCache[w];
    let k;
    if (/^[a-z]+$/.test(w)) {
      // "ch" is held as C while the soft c ("ce" = s) and hard c (= k) are decided
      k = w.replace(/ph/g, "f").replace(/tch/g, "ch").replace(/ch/g, "C").replace(/qu/g, "kv").replace(/ck/g, "k")
        .replace(/g(?=[eiy])/g, "j").replace(/c(?=[eiy])/g, "s").replace(/c/g, "k").replace(/q/g, "k").replace(/x/g, "ks")
        .replace(/w/g, "v").replace(/z/g, "j").replace(/sh/g, "s").replace(/(?<=[tdkgb])h/g, "")
        .replace(/[aeiouh]/g, "").replace(/C/g, "c");
    } else {
      k = "";
      for (const ch of w.normalize("NFD").replace(/\u093C|\u0ABC/g, "")) k += CONS[ch] != null ? CONS[ch] : "";
    }
    k = k.replace(/y/g, "").replace(/(.)\1+/g, "$1");      // y: a glide, spelt or not
    return (skelCache[w] = k);
  }
  function sounds(a, b) {
    if (/[a-z]/.test(a) === /[a-z]/.test(b)) return false;      // only across scripts
    const x = skeleton(a), y = skeleton(b);
    // Too short to tell apart - three consonants only for longer words, exactly
    if (x.length < 3 || y.length < 3) return false;
    if (x.length === 3 || y.length === 3) return x === y && a.length >= 5 && b.length >= 5;
    if (x === y) return true;
    const s = Math.min(x.length, y.length), l = Math.max(x.length, y.length);
    return s / l >= 0.8 && (x.startsWith(y) || y.startsWith(x));
  }

  /* The book answer in its own phrases, for "you also needed to say...". Split
     at "and" too, so half a sentence the student did say is not repeated. */
  function phrases(a) {
    return String(a || "").split(/\n|[.;।]\s|,\s|\s(?:અને|and|और)\s/)
      .map(s => s.replace(/^[•\s]+/, "").replace(/[.\s]+$/, "").trim())
      .filter(s => s.length > 1);
  }

  /* ---- How much a word tells -----------------------------------------
     A word in nearly every answer of the book ("Patient", "Machine",
     "Safety") says little about whether this answer is right; a word in
     three answers ("Interlock", "ઘર્ષણ") says a lot. So every word weighs
     log(1 + answers / answers that have it), counted over every book answer
     in every course, once. */
  let weights = null;
  function weightOf(w) {
    if (!weights) {
      const df = Object.create(null);
      let n = 0;
      Object.keys(CHAPTERS).forEach(cid => getChapters(cid).forEach(ch => ch.qs.forEach(b =>
        versions(b).forEach(v => { n++; words(v.a).forEach(x => { df[x] = (df[x] || 0) + 1; }); }))));
      weights = { df: df, n: Math.max(n, 1) };
    }
    return Math.log(1 + weights.n / (1 + (weights.df[w] || 0)));
  }

  /* "I don't know" in any of the three languages - a short answer that only
     says it does not know is wrong, whatever else it happens to share. */
  const DONT_KNOW = /\b(don'?t know|do not know|no idea|not sure|forgot|forget|can'?t remember)\b|ખબર\s*નથી|ખબર\s*નહીં|યાદ\s*નથી|આવડતું\s*નથી|नहीं\s*पता|पता\s*नहीं|मालूम\s*नहीं|याद\s*नहीं|नहीं\s*आता/i;

  /* Opposites: the answer with "Minimum" where the book says "Maximum",
     "left" for "right", "Hole" for "Shaft" shares nearly every other word -
     and is wrong. Each pair is matched as words (see same()), in English,
     Gujarati and Hindi. */
  const OPPOSITES = [
    ["minimum", "maximum"], ["min", "max"], ["smallest", "largest"], ["smallest", "biggest"],
    ["small", "large"], ["small", "big"], ["smaller", "larger"], ["smaller", "bigger"],
    ["lower", "upper"], ["low", "high"], ["internal", "external"], ["inside", "outside"],
    ["inner", "outer"], ["left", "right"], ["positive", "negative"], ["increase", "decrease"],
    ["increases", "decreases"], ["more", "less"], ["hot", "cold"], ["open", "close"],
    ["clockwise", "anticlockwise"], ["before", "after"], ["above", "below"], ["start", "stop"],
    ["tight", "loose"], ["fast", "slow"], ["hard", "soft"], ["wet", "dry"], ["hole", "shaft"],
    ["capital", "small"], ["multiply", "divide"], ["xplus", "xminus"], ["yplus", "yminus"],
    ["zplus", "zminus"], ["visible", "hidden"], ["male", "female"], ["full", "empty"],
    ["નાનું", "મોટું"], ["નાના", "મોટા"], ["નાની", "મોટી"], ["ઓછું", "વધુ"], ["ઓછી", "વધારે"],
    ["ડાબી", "જમણી"], ["ડાબે", "જમણે"], ["અંદર", "બહાર"], ["આંતરિક", "બાહ્ય"],
    ["પહેલાં", "પછી"], ["ઉપર", "નીચે"], ["ગરમ", "ઠંડુ"], ["ગરમ", "ઠંડા"], ["શરૂ", "બંધ"],
    ["છोटा", "बड़ा"], ["छोटा", "बड़ा"], ["छोटे", "बड़े"], ["छोटी", "बड़ी"], ["सबसे छोटा", "सबसे बड़ा"],
    ["कम", "ज़्यादा"], ["कम", "अधिक"], ["बाईं", "दाईं"], ["बाएँ", "दाएँ"], ["बाएं", "दाएं"],
    ["अंदर", "बाहर"], ["आंतरिक", "बाहरी"], ["पहले", "बाद"], ["ऊपर", "नीचे"], ["गर्म", "ठंडा"], ["गरम", "ठंडा"]
  ].filter(p => p.every(w => !/\s/.test(w)));
  const OPP = Object.create(null);
  OPPOSITES.forEach(([a, b]) => {
    a = CANON[a] || a; b = CANON[b] || b;
    (OPP[a] = OPP[a] || []).push(b);
    (OPP[b] = OPP[b] || []).push(a);
  });

  /* Did the student say the opposite of something the book answer says -
     the opposite word without the book's word, or the book's word negated? */
  function contradicts(said, book) {
    const has = (list, w) => list.some(x => same(x, w));
    // An opposite the book itself uses ("the Hole is larger than the Shaft") is no clash
    return book.some(w =>
      ((OPP[w] || []).some(o => has(said, o) && !has(book, o)) && !has(said, w)) ||
      (!/^not_/.test(w) && has(said, "not_" + w) && !has(book, "not_" + w)) ||
      (/^not_/.test(w) && has(said, w.slice(4)) && !has(said, w) && !has(book, w.slice(4))));
  }

  /* Numbers with the unit right after them ("25.4 mm", "1000 Micron") -
     a number said with a different unit is a different fact. */
  function numberUnits(s) {
    const t = norm(s).split(" ");
    const out = [];
    t.forEach((w, i) => {
      if (/^\d+(\.\d+)?$/.test(w) && t[i + 1] && !/\d/.test(t[i + 1])) out.push([w, CANON[stem(t[i + 1])] || stem(t[i + 1])]);
    });
    return out;
  }

  /* Score one version of the book answer against what was said:
       cover - the weight of the book answer's words the student said
       focus - the weight of the student's words that are in the book answer
     Words of the question count in neither: repeating the question back is
     not knowing the answer. */
  function against(saidAll, ans, v) {
    const qw = words(v.q);
    const inQ = w => qw.some(x => same(x, w));
    const bookAll = words(v.a);
    let key = bookAll.filter(w => !inQ(w));
    // The book answer is all question words ("In the X- Direction", "Workpiece"):
    // then they are the answer, and count
    const restates = !key.length;
    if (restates) key = bookAll;
    const said = restates ? saidAll : saidAll.filter(w => !inQ(w));
    const has = (list, w) => list.some(x => same(x, w)) ||
      (/^[a-z]{2,5}$/.test(w) && list.length >= w.length && w.split("").every(ch => list.indexOf(ch) >= 0));

    const kw = key.reduce((s, w) => s + weightOf(w), 0);
    const cover = kw ? key.filter(w => has(said, w)).reduce((s, w) => s + weightOf(w), 0) / kw : 0;
    const sw = said.reduce((s, w) => s + weightOf(w), 0);
    const focus = sw ? said.filter(w => has(bookAll, w)).reduce((s, w) => s + weightOf(w), 0) / sw : 0;

    // Every number-and-unit of the book answer, said with the same unit
    const said_nu = numberUnits(ans);
    const unitsOk = numberUnits(v.a).every(([n, u]) =>
      !said_nu.some(([sn]) => sn === n) || said_nu.some(([sn, su]) => sn === n && same(su, u)));

    /* Points: the book answer as its separate points ("right Patient, right
       medicine, right time..."). A point is named when most of its words were
       said - its question words too, since "right medicine" is a point even
       though "medicine" is in the question. Naming some of the points is
       partly right, however light their words weigh. */
    const pts = phrases(v.a).map(words).filter(pw => pw.length);
    const named = pts.filter(pw => pw.filter(w => has(saidAll, w)).length / pw.length >= 0.6).length;
    const points = pts.length >= 3 ? named / pts.length : 0;

    return { cover: cover, focus: focus, points: points, unitsOk: unitsOk, said: said.length, clash: contradicts(saidAll, bookAll) };
  }

  /* The verdict. Right needs most of the book answer's weight (cover), an
     answer that is mostly about it (focus), and its numbers with their own
     units. Partly right: a real share of it, still on the subject. */
  function decide(s) {
    if (!s.said || s.clash) return "wrong";
    if (s.cover >= RIGHT_AT && s.focus >= FOCUS_RIGHT && s.unitsOk) return "right";
    if ((s.cover >= PART_AT || s.points >= POINTS_PART) && s.focus >= FOCUS_PART) return "partial";
    return "wrong";
  }

  /* Word match against the book answer, in whichever of its languages the
     student came closest to - they may answer in any of the three. */
  function offline(ans, q) {
    const saidAll = words(ans);
    const alts = q.alts && q.alts.length ? q.alts : [{ q: q.q, a: q.en }];
    if (DONT_KNOW.test(String(ans || "")) && saidAll.length <= 6) {
      return { v: "wrong", miss: phrases(alts[0].a).slice(0, 4), fb: "", byAi: false };
    }

    const RANK = { right: 2, partial: 1, wrong: 0 };
    let best = null;
    alts.forEach(v => {
      const s = against(saidAll, ans, v);
      const verdict = decide(s);
      if (best && (RANK[verdict] < RANK[best.v] || (RANK[verdict] === RANK[best.v] && s.cover <= best.cover))) return;

      const hit = w => saidAll.some(x => same(x, w));
      const qw = words(v.q);
      // A point is missing when most of its weight was not said ("right
      // Method": "right" was said, "Method" - the point - was not)
      const miss = phrases(v.a).filter(p => {
        const pw = words(p).filter(w => !qw.some(x => same(x, w)));
        const all = pw.reduce((n, w) => n + weightOf(w), 0);
        return all && pw.filter(hit).reduce((n, w) => n + weightOf(w), 0) / all < 0.6;
      }).slice(0, 4);
      best = { v: verdict, cover: s.cover, miss: miss };
    });

    return { v: best.v, miss: best.v === "right" ? [] : best.miss, fb: "", byAi: false };
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

  /* Marked here, against the book answer, at once - the chapter quiz never
     asks the AI, which is kept for interview practice (Gemini's free quota
     ran out on quiz marking). judged: marks that came with a transcript, on
     the rare phone that can only answer by recording. Never rejects. */
  function mark(ans, q, judged) {
    const off = offline(ans, q);
    return Promise.resolve(judged ? withAi(off, judged) : off);
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
    // Checked here against the book; "Marked by AI" only for a recorded answer the AI marked
    h += r.byAi ? markedBy(r, lastRetry) : '<div class="aibadge off">' + esc(t("quiz.bookBadge")) + "</div>";

    $("hint").className = "hint";
    $("hint").textContent = "";
    $("result").hidden = false;
    $("result").innerHTML = h;
    if (lastRetry && $("btnAiRetry")) $("btnAiRetry").addEventListener("click", lastRetry);
    if (quiet) return;
    if (r.v === "right") cheer(true);
    if (r.v === "wrong") cheer(false);
    revealResult();
  }

  /* The sound with the thumb, made on the phone (no file, works offline):
     right - three quick notes up (C6 E6 G6); wrong - two low falling notes. */
  let audio = null;
  function tone(f, at, len, type, vol, cutoff) {
    const a = audio, t0 = a.currentTime + at;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    o.connect(g);
    if (cutoff) {                        // soften the square wave's buzz
      const lp = a.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = cutoff;
      g.connect(lp).connect(a.destination);
    } else g.connect(a.destination);
    o.start(t0);
    o.stop(t0 + len + 0.05);
  }
  function chime(up) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audio = audio || new AC();
      if (audio.state === "suspended") audio.resume();
      if (up) {
        tone(1046.5, 0, 0.12, "sine", 0.3);
        tone(1318.5, 0.08, 0.12, "sine", 0.3);
        tone(1568, 0.16, 0.34, "sine", 0.32);
      } else {
        tone(311, 0, 0.16, "square", 0.12, 1200);
        tone(233, 0.13, 0.3, "square", 0.12, 1000);
      }
    } catch (e) { /* no sound is fine */ }
  }

  /* The big thumbs up. Off the page again by itself; it never blocks a tap. */
  /* up: the green thumbs up; otherwise the red thumbs down */
  function cheer(up) {
    const el = $("cheer");
    if (!el) return;
    const thumb = el.querySelector(".thumb");
    thumb.textContent = up ? "👍" : "👎";
    thumb.classList.toggle("down", !up);
    chime(up);
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
    /* Right and wrong are said by the thumbs up and down alone - only a
       partly right answer is spoken, because it says what is missing */
    if (r.v !== "partial" || !state.settings.speakFb || !Speech.hasVoice(voice)) { Avatar.setState("idle"); return Promise.resolve(); }

    let msg = t(r.v === "right" ? "quiz.sayRight" : r.v === "partial" ? "quiz.sayPartial" : "quiz.sayWrong");
    if (r.v === "partial") {
      if (r.fb) msg += " " + r.fb;
      else if (r.miss.length && !FOREIGN[voice].test(r.miss.join(" "))) {
        msg += " " + t("quiz.missing") + " " + r.miss.join(". ");
      }
    }
    return Speech.speak(msg, { lang: voice, rate: state.settings.rate }).then(() => {
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
      tries: ((old && old.tries) || (old ? 1 : 0)) + 1,
      entries: list
    };

    /* The attempt for the institute, sent by access.js - counts only, no
       answers. Stamped with the student who did it. */
    if (Access.enabled() && Access.sid()) {
      if (!Array.isArray(state.quizLog)) state.quizLog = [];
      state.quizLog.push({
        cid: newCid(), sid: Access.sid(), ts: Date.now(),
        course: run.cid, chapter: run.ch.id, no: run.ch.no,
        title: (run.ch.titles && run.ch.titles.en) || run.ch.title,
        total: n, answered: cnt.right + cnt.partial + cnt.wrong,
        right: cnt.right, partial: cnt.partial, wrong: cnt.wrong, skipped: cnt.skip, pct: pct,
        lang: getLang()
      });
    }
    save();
    Access.flush();
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
    on, begin, next, current, choices, progress, atLast, title,
    mark, record, skip, showResult, speak, relocalize, finish,
    renderTrades, openChapters, renderChapters, openReport, renderReport,
    again, backToChapters, drop
  };
})();
