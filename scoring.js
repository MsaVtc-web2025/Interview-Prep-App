/* ઓફલાઇન સ્કોરિંગ એન્જિન — કોઈ ઇન્ટરનેટ કે API ની જરૂર નથી.
   જવાબ અંગ્રેજીમાં તપાસાય છે, પરિણામ ગુજરાતીમાં આપવામાં આવે છે. */

/* માપદંડ. નામ i18n.js માંથી આવે છે — tech = તકનીકી કોર્સમાં જુદું નામ. */
const CRITERIA = [
  { key: "communication" },
  { key: "sentences" },
  { key: "thought",  tech: true },
  { key: "speechGrammar" },
  { key: "accuracy", tech: true },
  { key: "coherence" }
];

/* માપદંડનું નામ ચાલુ ભાષામાં અને મોડ પ્રમાણે */
function criterionLabel(c, mode) {
  if (mode === "technical" && c.tech) return t("crit." + c.key + ".tech");
  return t("crit." + c.key);
}

/* મોડ પ્રમાણે વજન — ઇન્ટરવ્યુમાં ભાષા મહત્ત્વની, તકનીકી કોર્સમાં જ્ઞાન મહત્ત્વનું.
   તકનીકી પ્રશ્નમાં ટૂંકો પણ સાચો જવાબ સ્વીકાર્ય છે, તેથી લંબાઈની મર્યાદા ઢીલી. */
const MODE_PROFILES = {
  interview: {
    weights: { communication: 1, sentences: 1, thought: 1, speechGrammar: 1, accuracy: 1.2, coherence: 1 },
    shortOk: false
  },
  technical: {
    weights: { communication: 0.9, sentences: 0.6, thought: 1.3, speechGrammar: 0.7, accuracy: 2.4, coherence: 0.8 },
    shortOk: true
  }
};

function profileFor(mode) { return MODE_PROFILES[mode] || MODE_PROFILES.interview; }

/* સામાન્ય વ્યાકરણની ભૂલો — ભારતીય અંગ્રેજીમાં વારંવાર થતી.
   સુધારાનું લખાણ i18n.js માં "gram.<id>" કી હેઠળ ત્રણેય ભાષામાં છે. */
const GRAMMAR = [
  { re: /\bmyself\s+[a-z]+/i,                      id: "myself" },
  { re: /\bi\s+am\s+having\b/i,                    id: "amHaving" },
  { re: /\bi\s+am\s+(knowing|understanding|wanting|needing)\b/i, id: "amKnowing" },
  { re: /\bdidn'?t\s+(went|came|did|saw)\b/i,      id: "didntWent" },
  { re: /\b(he|she|it)\s+do\b/i,                   id: "heDo" },
  { re: /\b(he|she|it)\s+have\b/i,                 id: "heHave" },
  { re: /\b(they|we|you)\s+is\b/i,                 id: "theyIs" },
  { re: /\bi\s+has\b/i,                            id: "iHas" },
  { re: /\bi\s+are\b/i,                            id: "iAre" },
  { re: /\bmy\s+(father|mother|brother|sister)\s+(he|she)\b/i, id: "doubleSubject" },
  { re: /\b(more\s+better|most\s+best|more\s+easier)\b/i, id: "moreBetter" },
  { re: /\bdiscuss\s+about\b/i,                    id: "discussAbout" },
  { re: /\b(return|revert|repeat)\s+back\b/i,      id: "returnBack" },
  { re: /\b(give|giving|gave)\s+(an?\s+)?exam/i,   id: "giveExam" },
  { re: /\bpass(ed)?\s+out\b/i,                    id: "passedOut" },
  { re: /\bcousin\s+(brother|sister)\b/i,          id: "cousinBrother" },
  { re: /\bout\s+of\s+station\b/i,                 id: "outOfStation" },
  { re: /\bprepone\b/i,                            id: "prepone" },
  { re: /\byour\s+good\s+name\b/i,                 id: "goodName" },
  { re: /\bdo\s+the\s+needful\b/i,                 id: "needful" },
  { re: /\blike\s+that\s+only\b|\blike\s+this\s+only\b/i, id: "likeThatOnly" },
  { re: /\bi\s+am\s+belong/i,                      id: "amBelong" },
  { re: /\bevery\s+(days|weeks|months|years)\b/i,  id: "everyDays" },
  { re: /\bin\s+night\b/i,                         id: "inNight" },
  { re: /\bmarried\s+with\b/i,                     id: "marriedWith" }
];

/* ભરતીના શબ્દો (fillers) */
const FILLERS = ["um", "uh", "umm", "uhh", "er", "hmm", "haan", "matlab", "yaar", "actually", "basically", "means"];
/* ગુજરાતી/હિન્દી શબ્દો જે અંગ્રેજી જવાબમાં ન આવવા જોઈએ */
const NON_ENGLISH = ["matlab", "haan", "nahi", "aur", "phir", "bhi", "kya", "hai", "mane", "pachi", "ane", "etle"];

const CONNECTIVES = ["because", "so", "then", "after", "also", "and", "but", "when", "while", "first", "second", "finally", "therefore", "for example", "such as", "however", "since", "before"];

/* કાર્યાત્મક શબ્દો. ખરા અંગ્રેજી વાક્યમાં આ ૩૦-૫૦% હોય છે; ચાવીરૂપ શબ્દોની
   સૂકી યાદીમાં લગભગ એકેય હોતો નથી. «feed speed tool fast finish» જેવો
   જવાબ — જેમાં બધા ચાવીરૂપ શબ્દો છે પણ એકેય વાક્ય નથી — આનાથી ઓળખાય છે. */
const FUNCTION_WORDS = ["a","an","the","is","are","was","were","am","be","been","being",
  "i","we","you","he","she","it","they","me","us","him","them",
  "my","our","your","his","her","its","their","this","that","these","those",
  "of","in","on","at","to","for","with","from","by","into","about","after","before","than",
  "and","or","but","if","when","because","so","then","also","not","no",
  "do","does","did","have","has","had","will","would","can","could","should","must",
  "there","which","what","how","why","where","who","as","all","some","any","more","very"];

/* «મને ખબર નથી» — વિદ્યાર્થીએ પ્રશ્નનો જવાબ આપ્યો જ નથી.
   આ પ્રામાણિક છે, પણ જવાબ નથી. અગાઉ આવા વાક્યનું વ્યાકરણ સાચું હોવાથી
   ૫ થી વધુ ગુણ મળી જતા, એટલે એપ સાચું કહેવા કરતાં બહાનું બનાવવાનું
   શીખવતી હતી. */
const NO_ANSWER = [
  /\b(i\s+)?(don'?t|do\s+not|dont)\s+know\b/i,
  /\bno\s+idea\b/i,
  /\bnot\s+sure\b/i,
  /\bi\s+(will|would|can|could)\s+learn\b/i,
  /\bi\s+(forgot|forget)\b/i,
  /\bcan'?t\s+(remember|say|tell)\b/i,
  /\bsorry\b[^.!?]*\b(know|idea|remember)\b/i
];

const VERBS = ["am","is","are","was","were","be","been","have","has","had","do","does","did","will","would","can","could","should","may","might","must","go","goes","went","work","works","working","worked","study","studies","studying","studied","live","lives","living","like","likes","want","wants","make","makes","making","made","complete","completed","pass","passed","use","uses","using","used","enter","enters","know","knows","think","thinks","looking","look","doing","get","gets","got","come","comes","came","take","takes","give","gives","say","says","said","learn","learned","learnt","help","helps","stay","stays","start","started","prefer","enjoy","enjoys","manage","handle","speak","speaks","talk","talks","pay","pays","send","sends","scan","open","opens","check","find","finds","apply","applied","join","joined","stand","stands","belong","belongs","support","supports","provide","read","reads","write","writes"];

function clamp(n) {
  if (!isFinite(n)) return 1;
  return Math.max(1, Math.min(10, Math.round(n * 10) / 10));
}

function analyse(text) {
  const clean = String(text || "").trim();
  const lower = clean.toLowerCase();
  const words = lower.replace(/[^a-z0-9'\s]/g, " ").split(/\s+/).filter(Boolean);
  const wc = words.length;

  let sentences = clean.split(/[.!?]+/).map(s => s.trim()).filter(s => s.split(/\s+/).filter(Boolean).length > 0);
  if (sentences.length <= 1 && wc > 22) {
    // ડિક્ટેશનમાં પૂર્ણવિરામ ન આવ્યું હોય તો જોડાણ શબ્દો પરથી અંદાજ
    sentences = clean.split(/\b(?:and then|after that|then|because|but|also)\b/i).map(s => s.trim()).filter(s => s.split(/\s+/).filter(Boolean).length > 2);
    if (!sentences.length) sentences = [clean];
  }

  const uniq = new Set(words);
  const fillerCount = words.filter(w => FILLERS.includes(w)).length;
  const funcCount = words.filter(w => FUNCTION_WORDS.includes(w)).length;
  const nonEng = words.filter(w => NON_ENGLISH.includes(w)).length;
  const connCount = CONNECTIVES.filter(c =>
    new RegExp("\\b" + c.replace(/\s+/g, "\\s+") + "\\b", "i").test(lower)
  ).length;

  const fragments = sentences.filter(s => {
    const sw = s.toLowerCase().replace(/[^a-z0-9'\s]/g, " ").split(/\s+/).filter(Boolean);
    if (sw.length < 3) return true;
    return !sw.some(w => VERBS.includes(w) || /(?:ing|ed)$/.test(w));
  }).length;

  const grammarHits = GRAMMAR.filter(g => g.re.test(clean)).map(g => g.id);

  return {
    clean, lower, words, wc,
    sentences, sentCount: sentences.length,
    avgSentLen: sentences.length ? wc / sentences.length : wc,
    fragRatio: sentences.length ? fragments / sentences.length : 1,
    fillerCount, nonEng, connCount,
    funcRatio: wc ? funcCount / wc : 0,
    repetition: wc ? 1 - uniq.size / wc : 0,
    grammarHits
  };
}

/* ચાવીરૂપ શબ્દ આખો મળે તો જ ગણો.

   પહેલાં સાદું includes() વાપરાતું, તેથી «feed» એ «feedback» માં ગણાઈ જતું
   અને «mm» એ «programme», «comment», «summer» માં. પરિણામે પ્રશ્ન સાથે કોઈ
   સંબંધ ન હોય એવા જવાબને પણ ચોકસાઈના ગુણ મળી જતા હતા.

   બહુવચન અને -ing/-ed રૂપ સ્વીકારીએ છીએ, જેથી «feeds» અને «feeding» પણ
   ગણાય — પણ «feedback» નહીં, કારણ કે ત્યાં શબ્દની સીમા નથી. */
const TERM_RE = {};

function termRegex(term) {
  const key = String(term).toLowerCase().trim();
  if (!TERM_RE[key]) {
    const body = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    TERM_RE[key] = new RegExp("\\b" + body + "(?:s|es|ed|ing)?\\b", "i");
  }
  return TERM_RE[key];
}

function hasTerm(a, term) { return termRegex(term).test(a.lower); }

function coverage(a, kw) {
  if (!kw || !kw.length) return 0.5;
  let hit = 0;
  kw.forEach(group => {
    if (group.some(term => hasTerm(a, term))) hit++;
  });
  return hit / kw.length;
}

/* ફરજિયાત મુદ્દા (સલામતી) — જે ચૂકી ગયા હોય તેની ગુજરાતી યાદી પાછી આપે */
function missingMust(a, must) {
  if (!Array.isArray(must) || !must.length) return [];
  return must
    .filter(m => m && Array.isArray(m.kw) && !m.kw.some(term => hasTerm(a, term)))
    .map(m => m.gu);
}

/* દરેક માપદંડ માટે ગુણ + ચાલુ ભાષામાં ટૂંકી નોંધ.
   base = "note.accuracy" જેવો કી-ઉપસર્ગ; .low / .mid / .high જોડાય છે. */
function band(v, base) {
  return t(base + (v < 4.5 ? ".low" : v < 7.5 ? ".mid" : ".high"));
}

function scoreAnswer(text, question, mode) {
  mode = mode === "technical" ? "technical" : "interview";
  const prof = profileFor(mode);
  const tech = mode === "technical";
  const a = analyse(text);
  const cov = coverage(a, question.kw);
  const missing = missingMust(a, question.must);
  const s = {}, notes = {};

  /* વિદ્યાર્થીએ «ખબર નથી» કહ્યું છે? ચાવીરૂપ શબ્દો ઓછા હોય ત્યારે જ ગણીએ —
     «ચોક્કસ આંકડો ખબર નથી, પણ ફીડ રેટ એટલે…» એ તો સારો જવાબ છે. */
  const noAnswer = cov < 0.4 && NO_ANSWER.some(re => re.test(a.clean));

  /* ચાવીરૂપ શબ્દોની યાદી બોલી ગયા, વાક્ય એકેય નહીં? શબ્દો આવડવા અને
     સમજ હોવી એ બે જુદી વાત છે — યાદીને પૂરા ગુણ ન મળે. */
  const wordList = a.wc >= 4 && a.funcRatio < 0.15;

  /* 1. જવાબની ચોકસાઈ / તકનીકી ચોકસાઈ */
  let accuracy = 1 + cov * 9;
  if (a.wc < 4) accuracy = Math.min(accuracy, 3);
  if (wordList) accuracy = Math.min(accuracy, 5);
  if (noAnswer) accuracy = 1;
  s.accuracy = clamp(accuracy);
  notes.accuracy = band(s.accuracy, tech ? "note.accuracyT" : "note.accuracy");

  /* 2. સ્પષ્ટ સંવાદ — તકનીકી મોડમાં ટૂંકો પણ સાચો જવાબ સ્વીકાર્ય */
  let lenScore = prof.shortOk
    ? (a.wc < 4 ? 2 : a.wc < 8 ? 5 : a.wc < 12 ? 8 : a.wc <= 120 ? 9 : 8)
    : (a.wc < 4 ? 2 : a.wc < 8 ? 4 : a.wc < 15 ? 6 : a.wc <= 60 ? 9 : a.wc <= 90 ? 8 : 6);
  s.communication = clamp(lenScore * 0.7 + cov * 3 - Math.min(3, a.fillerCount * 0.6));
  notes.communication = band(s.communication, "note.communication");

  /* 3. પૂર્ણ વાક્યો */
  let sent = a.wc < 4 ? 2 : 10 - a.fragRatio * 7;
  if (a.avgSentLen < 4) sent -= 2;
  if (a.avgSentLen > 35) sent -= 2;
  // «speed», «feed», «welding» જેવા શબ્દો -ed/-ing માં પૂરા થાય છે, તેથી
  // ક્રિયાપદ શોધનારી ચકાસણી યાદીને વાક્ય ગણી લે છે. યાદી હોય તો ગુણ ઓછા.
  if (wordList) sent = Math.min(sent, 3);
  s.sentences = clamp(sent);
  notes.sentences = band(s.sentences, "note.sentences");

  /* 4. વિચારોની સ્પષ્ટતા */
  let thought = 3 + Math.min(3, a.connCount * 0.8) + cov * 4;
  if (a.wc < 8) thought = Math.min(thought, 4);
  if (a.sentCount >= 2) thought += 0.5;
  s.thought = clamp(thought);
  notes.thought = band(s.thought, tech ? "note.thoughtT" : "note.thought");

  /* 5. વ્યાકરણ અને શબ્દપ્રયોગ.
     નોંધ: આ ભૂલો શોધે છે, સાચાપણું માપતું નથી — ભૂલ ન મળે એટલે ૧૦ મળે.
     તેથી વાક્ય જ ન હોય ત્યાં ૧૦ આપવા દેતા નથી. */
  let gram = 10 - a.grammarHits.length * 1.8 - Math.min(2, (a.wc ? a.fillerCount / a.wc : 0) * 12) - a.nonEng * 1.2;
  if (a.wc < 5) gram = Math.min(gram, 4);
  if (wordList) gram = Math.min(gram, 4);
  s.speechGrammar = clamp(gram);
  notes.speechGrammar = a.grammarHits.length
    ? t("note.speechGrammar.found", { n: a.grammarHits.length })
    : band(s.speechGrammar, "note.speechGrammar");

  /* 6. વાણીની સુસંગતતા */
  let coh = 4 + Math.min(3, a.connCount * 0.7) + cov * 3 - a.repetition * 5;
  if (a.wc < 6) coh = Math.min(coh, 3);
  if (a.sentCount >= 2) coh += 0.5;
  s.coherence = clamp(coh);
  notes.coherence = band(s.coherence, "note.coherence");

  /* કુલ ગુણ — મોડ પ્રમાણે વજન સાથે સરેરાશ */
  let wSum = 0, wTot = 0;
  CRITERIA.forEach(c => {
    const w = prof.weights[c.key] != null ? prof.weights[c.key] : 1;
    wSum += s[c.key] * w;
    wTot += w;
  });
  let overall = clamp(wSum / wTot);

  /* પ્રશ્નનો જવાબ જ ન આપ્યો હોય તો સાચું વ્યાકરણ પણ કુલ ગુણ ઊંચા ન રાખી શકે */
  let offTopic = false;
  if (s.accuracy < 2.2) {
    overall = clamp(Math.min(overall, s.accuracy + 3));
    offTopic = true;
  } else if (s.accuracy < 3.5) {
    overall = clamp(Math.min(overall, s.accuracy + 4));
  }

  /* «ખબર નથી» એ ઇન્ટરવ્યુમાં નાપાસ જવાબ છે — ભાષા ગમે તેટલી સારી હોય */
  if (noAnswer) overall = clamp(Math.min(overall, 2));

  /* સલામતીનો દરવાજો — ફરજિયાત મુદ્દો ચૂકી ગયા હોય તો કુલ ગુણ ૬ થી વધુ ન મળે.
     ઉદ્યોગમાં આ મુદ્દા ચૂકવાથી નોકરી મળતી નથી, તેથી એપ પણ છૂટ આપતી નથી. */
  if (missing.length) overall = clamp(Math.min(overall, 6));

  /* સૌથી નબળા માપદંડ પરથી ભલામણ */
  let weakest = CRITERIA[0].key;
  CRITERIA.forEach(c => { if (s[c.key] < s[weakest]) weakest = c.key; });

  /* સલાહ — સૌથી નબળા માપદંડ પરથી. તકનીકી કોર્સમાં જુદી ("advT.").
     સલામતીનો મુદ્દો ચૂક્યા હોય તો બીજી બધી સલાહ કરતાં એ પહેલી આવે. */
  let advice;
  if (noAnswer) {
    advice = t("adv.dontKnow");
  } else if (missing.length) {
    advice = t("adv.missing", { list: missing.map(tMust).join(", ") });
  } else if (offTopic) {
    advice = t(tech ? "adv.offTopicT" : "adv.offTopic");
  } else if (overall >= 8.5 && s[weakest] >= 8) {
    advice = t("adv.praise");
  } else {
    advice = tech ? t("advT." + weakest) : t("adv." + weakest);
  }

  return {
    scores: s,
    notes: notes,
    overall: overall,
    weakest: weakest,
    offTopic: offTopic,
    noAnswer: noAnswer,
    missingMust: missing,
    mode: mode,
    advice: advice,
    tip: question.tip,
    grammar: a.grammarHits.map(id => t("gram." + id)),
    stats: { words: a.wc, sentences: a.sentCount, fillers: a.fillerCount, coverage: Math.round(cov * 100) }
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { scoreAnswer, CRITERIA, analyse, criterionLabel, MODE_PROFILES };
}
