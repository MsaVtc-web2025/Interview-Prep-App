/* Offline scoring engine — needs no internet and no API.
   The answer is checked in English; the result is given in Gujarati. */

/* Criteria. Labels come from i18n.js — tech = a different label on technical courses. */
const CRITERIA = [
  { key: "communication" },
  { key: "sentences" },
  { key: "thought",  tech: true },
  { key: "speechGrammar" },
  { key: "accuracy", tech: true },
  { key: "coherence" }
];

/* Criterion label, in the current language and for the current mode.
   "Order of steps" only means something on a question that asks for steps -
   on "what is..." it was telling students their steps were out of order when
   they had been asked for a definition. process = false gives the plain label. */
function criterionLabel(c, mode, process) {
  if (mode === "technical" && c.tech && !(c.key === "thought" && process === false)) {
    return t("crit." + c.key + ".tech");
  }
  return t("crit." + c.key);
}

/* Does the question ask for steps - how something is done, in what order?
   Only then is the order of the answer marked as "order of steps". */
const PROCESS_Q = /\b(how\s+(do|would|will|did|can|should)\s+you(?!\s+(know|feel|think|see|rate|deal|define|decide|handle|manage|keep|stay|like|spend|describe))|how\s+to|what\s+steps|which\s+steps|steps|procedure|process\s+of|walk\s+me\s+through|what\s+(do|would|will)\s+you\s+do|before\s+(starting|you\s+start)|sequence)\b/i;

function isProcessQuestion(question) { return PROCESS_Q.test(String((question && question.q) || "")); }

/* Weights per mode — language matters in an interview, knowledge matters on a
   technical course. A short but correct answer is fine on a technical question,
   so the length requirement is relaxed there. */
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

/* Common grammar mistakes — the ones Indian English makes most often.
   The correction text lives in i18n.js under "gram.<id>" in all three languages. */
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

/* Filler words */
const FILLERS = ["um", "uh", "umm", "uhh", "er", "hmm", "haan", "matlab", "yaar", "actually", "basically", "means"];
/* Gujarati/Hindi words that should not appear in an English answer */
const NON_ENGLISH = ["matlab", "haan", "nahi", "aur", "phir", "bhi", "kya", "hai", "mane", "pachi", "ane", "etle"];

const CONNECTIVES = ["because", "so", "then", "after", "also", "and", "but", "when", "while", "first", "second", "finally", "therefore", "for example", "such as", "however", "since", "before"];

/* Function words. A real English sentence is 30-50% these; a bare list of
   keywords has almost none. That is how an answer like "feed speed tool fast
   finish" — all the keywords, not a single sentence — gets spotted. */
const FUNCTION_WORDS = ["a","an","the","is","are","was","were","am","be","been","being",
  "i","we","you","he","she","it","they","me","us","him","them",
  "my","our","your","his","her","its","their","this","that","these","those",
  "of","in","on","at","to","for","with","from","by","into","about","after","before","than",
  "and","or","but","if","when","because","so","then","also","not","no",
  "do","does","did","have","has","had","will","would","can","could","should","must",
  "there","which","what","how","why","where","who","as","all","some","any","more","very"];

/* "I don't know" — the student has not answered the question at all.
   That is honest, but it is not an answer. These sentences used to score above
   5 because their grammar is correct, which taught the app to reward excuses
   over saying the truth. */
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
    // Dictation often has no full stops — fall back to connective words
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

  /* A sentence has a verb if a word is a known verb, ends -ing/-ed, or comes
     straight after a subject ("It runs", "I wear", "that controls") - the verb
     list cannot hold every verb, and "It runs all the programs" was being
     marked as an unfinished sentence. */
  const SUBJECT = /^(i|we|you|he|she|it|they|that|which|who)$/;
  const fragments = sentences.filter(s => {
    const sw = s.toLowerCase().replace(/[^a-z0-9'\s]/g, " ").split(/\s+/).filter(Boolean);
    if (sw.length < 3) return true;
    return !sw.some((w, i) => VERBS.includes(w) || /(?:ing|ed)$/.test(w) ||
      (i > 0 && SUBJECT.test(sw[i - 1]) && !FUNCTION_WORDS.includes(w)));
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

/* Count a keyword only on a whole-word match.

   A plain includes() was used before, so "feed" matched inside "feedback" and
   "mm" matched inside "programme", "comment" and "summer". Answers with no
   connection to the question were picking up accuracy marks that way.

   Plurals and -ing/-ed forms are accepted, so "feeds" and "feeding" count too —
   but not "feedback", because there is no word boundary there. */
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

/* Mandatory (safety) points — returns the Gujarati list of the ones missed */
function missingMust(a, must) {
  if (!Array.isArray(must) || !must.length) return [];
  return must
    .filter(m => m && Array.isArray(m.kw) && !m.kw.some(term => hasTerm(a, term)))
    .map(m => m.gu);
}

/* A score plus a short note in the current language, per criterion.
   base = a key prefix such as "note.accuracy"; .low / .mid / .high is appended. */
function band(v, base) {
  return t(base + (v < 4.5 ? ".low" : v < 7.5 ? ".mid" : ".high"));
}

/* The note under each criterion, from its score. In one place so that when
   the AI replaces the scores (judge.js merge), the notes are rewritten to match
   them - an AI 8 for "complete sentences" sitting next to the offline note
   "the answer is just loose words" was the feedback contradicting itself.
   ctx = { tech, process, hasFillers, grammarHits } from the answer itself. */
function notesFor(s, ctx) {
  return {
    accuracy: band(s.accuracy, ctx.tech ? "note.accuracyT" : "note.accuracy"),
    communication: bandFill(s.communication, "note.communication", ctx.hasFillers),
    sentences: band(s.sentences, "note.sentences"),
    thought: band(s.thought, ctx.process ? "note.thoughtT" : "note.thought"),
    speechGrammar: ctx.grammarHits
      ? t("note.speechGrammar.found", { n: ctx.grammarHits })
      : bandFill(s.speechGrammar, "note.speechGrammar", ctx.hasFillers),
    coherence: band(s.coherence, "note.coherence")
  };
}

/* band(), but a note that talks about filler words is used only when the
   answer had some - "use fewer filler words" to a student who used none is
   simply wrong. Keys: <base>.mid / <base>.midFill, <base>.low / <base>.lowFill. */
function bandFill(v, base, hasFillers) {
  const lvl = v < 4.5 ? ".low" : v < 7.5 ? ".mid" : ".high";
  return t(base + lvl + (hasFillers && lvl !== ".high" ? "Fill" : ""));
}

/* A full-sentence example from the student's own trade, for the advice */
function courseExample(courseId) {
  const k = "ex." + (courseId || "interview");
  const v = t(k);
  return v === k ? t("ex.interview") : v;
}

/* Does this text contain Gujarati or Devanagari letters? If it does, the
   student answered in their own language, and every English-specific rule below
   - the filler list, the function-word ratio, the grammar patterns - is
   measuring the wrong thing. */
function hasIndicScript(s) { return /[ऀ-ॿ઀-૿]/.test(String(s || "")); }

/* needsEnglish defaults to true: every existing caller is English practice, and
   a question that has not opted out should not quietly become unmarked.
   courseId picks the example in the advice, so a Computer student is not
   shown "First I switch off the power to the machine". */
function scoreAnswer(text, question, mode, needsEnglish, courseId) {
  mode = mode === "technical" ? "technical" : "interview";
  const mustBeEnglish = needsEnglish !== false;
  const prof = profileFor(mode);
  const tech = mode === "technical";
  // Steps are marked as steps only when the question asks for them
  const process = tech && isProcessQuestion(question);
  const a = analyse(text);
  const cov = coverage(a, question.kw);
  const missing = missingMust(a, question.must);
  const s = {};

  /* Did the student say "I don't know"? Only count it when keyword coverage is
     low — "I don't know the exact figure, but feed rate means..." is a good answer. */
  const noAnswer = cov < 0.4 && NO_ANSWER.some(re => re.test(a.clean));

  /* Reeled off the keywords but formed no sentence? Knowing the words and
     understanding them are two different things — a list does not score full marks. */
  /* Answered in their own language, on a question that did not ask for English.
     None of the English-specific measures apply, and `kw` is a list of English
     words that will never match, so offline marking cannot judge this answer at
     all. Say so rather than inventing a low score - the AI marks it properly,
     and this is only the fallback for when the AI could not be reached. */
  const ownLanguage = !mustBeEnglish && hasIndicScript(a.clean);

  // Meaningless on an answer with no English function words in it to count.
  const wordList = !ownLanguage && a.wc >= 4 && a.funcRatio < 0.15;

  /* No full sentence at all - a list of words, or phrases with no verb.
     Reciting the right keywords is not answering, so this is capped below. */
  const noSentence = !ownLanguage && (wordList || (a.wc >= 4 && a.fragRatio >= 1));

  // Filler words are mentioned in the feedback only when there were some
  const hasFillers = a.fillerCount > 0;

  /* 1. Answer accuracy / technical accuracy */
  let accuracy = 1 + cov * 9;
  if (a.wc < 4) accuracy = Math.min(accuracy, 3);
  if (wordList) accuracy = Math.min(accuracy, 5);
  if (noAnswer) accuracy = 1;
  s.accuracy = clamp(accuracy);

  /* 2. Clear communication — in technical mode a short but correct answer is fine */
  let lenScore = prof.shortOk
    ? (a.wc < 4 ? 2 : a.wc < 8 ? 5 : a.wc < 12 ? 8 : a.wc <= 120 ? 9 : 8)
    : (a.wc < 4 ? 2 : a.wc < 8 ? 4 : a.wc < 15 ? 6 : a.wc <= 60 ? 9 : a.wc <= 90 ? 8 : 6);
  s.communication = clamp(lenScore * 0.7 + cov * 3 - Math.min(3, a.fillerCount * 0.6));

  /* 3. Complete sentences */
  let sent = a.wc < 4 ? 2 : 10 - a.fragRatio * 7;
  if (a.avgSentLen < 4) sent -= 2;
  if (a.avgSentLen > 35) sent -= 2;
  // Words like "speed", "feed" and "welding" end in -ed/-ing, so the verb check
  // mistakes a bare list for a sentence. Cap the score when it is a list.
  if (wordList) sent = Math.min(sent, 3);
  s.sentences = clamp(sent);

  /* 4. Clarity of thought */
  let thought = 3 + Math.min(3, a.connCount * 0.8) + cov * 4;
  if (a.wc < 8) thought = Math.min(thought, 4);
  if (a.sentCount >= 2) thought += 0.5;
  s.thought = clamp(thought);

  /* 5. Grammar and word choice.
     Note: this finds mistakes, it does not measure correctness — no mistakes
     found means 10. So we refuse to award 10 where there is no sentence at all. */
  /* The non-English word penalty only makes sense where English was asked for.
     Elsewhere it punishes the student for answering the way they were told they
     could. */
  let gram = 10 - a.grammarHits.length * 1.8 - Math.min(2, (a.wc ? a.fillerCount / a.wc : 0) * 12)
             - (mustBeEnglish ? a.nonEng * 1.2 : 0);
  if (a.wc < 5) gram = Math.min(gram, 4);
  if (wordList) gram = Math.min(gram, 4);
  s.speechGrammar = clamp(gram);

  /* 6. Coherence of speech */
  let coh = 4 + Math.min(3, a.connCount * 0.7) + cov * 3 - a.repetition * 5;
  if (a.wc < 6) coh = Math.min(coh, 3);
  if (a.sentCount >= 2) coh += 0.5;
  s.coherence = clamp(coh);

  const noteCtx = { tech: tech, process: process, hasFillers: hasFillers, grammarHits: a.grammarHits.length };
  const notes = notesFor(s, noteCtx);

  /* Overall score — the average weighted by mode */
  let wSum = 0, wTot = 0;
  CRITERIA.forEach(c => {
    const w = prof.weights[c.key] != null ? prof.weights[c.key] : 1;
    wSum += s[c.key] * w;
    wTot += w;
  });
  let overall = clamp(wSum / wTot);

  /* If the question was not answered, correct grammar must not keep the score high */
  let offTopic = false;
  if (s.accuracy < 2.2) {
    overall = clamp(Math.min(overall, s.accuracy + 3));
    offTopic = true;
  } else if (s.accuracy < 3.5) {
    overall = clamp(Math.min(overall, s.accuracy + 4));
  }

  /* "I don't know" fails an interview, however good the language is */
  if (noAnswer) overall = clamp(Math.min(overall, 2));

  /* Keywords with no sentence: "windows linux operating system software
     hardware" used to score 5.0. Knowing the words is not answering. */
  if (noSentence) overall = clamp(Math.min(overall, 4.5));

  /* Safety gate — miss a mandatory point and the overall score is capped at 6.
     Missing these costs you the job in industry, so the app does not excuse it either. */
  if (missing.length) overall = clamp(Math.min(overall, 6));

  /* Recommendation based on the weakest criterion */
  let weakest = CRITERIA[0].key;
  CRITERIA.forEach(c => { if (s[c.key] < s[weakest]) weakest = c.key; });

  /* Advice — from the weakest criterion. Technical courses use a different set
     ("advT."). A missed safety point outranks every other piece of advice. */
  /* The step-by-step advice only fits a question that asks for steps; on any
     other question the general advice is given. A list of words gets the
     "full sentences" advice, whatever else is weak. */
  const adviceKey = k => {
    if (k === "communication" && !process) return hasFillers ? "adv.communicationFill" : "adv.communication";
    if (!tech) return "adv." + k;
    if (!process && (k === "thought" || k === "coherence")) return "adv." + k;
    return "advT." + k;
  };
  const ex = { ex: courseExample(courseId) };
  let advice;
  if (noAnswer) {
    advice = t("adv.dontKnow");
  } else if (missing.length) {
    advice = t("adv.missing", { list: missing.map(tMust).join(", ") });
  } else if (offTopic) {
    advice = t(tech ? "adv.offTopicT" : "adv.offTopic");
  } else if (noSentence) {
    advice = t(tech ? "advT.sentences" : "adv.sentences", ex);
  } else if (overall >= 8.5 && s[weakest] >= 8) {
    advice = t("adv.praise");
  } else {
    advice = t(adviceKey(weakest), ex);
  }

  return {
    scores: s,
    notes: notes,
    /* True when offline marking could not judge this answer - it is in the
       student's own language and every measure here is built for English. The
       app shows a "needs internet" note instead of these numbers. */
    unmarkableOffline: ownLanguage,
    overall: overall,
    weakest: weakest,
    offTopic: offTopic,
    noAnswer: noAnswer,
    noSentence: noSentence,
    process: process,
    noteCtx: noteCtx,
    missingMust: missing,
    mode: mode,
    advice: advice,
    tip: question.tip,
    grammar: a.grammarHits.map(id => t("gram." + id)),
    stats: { words: a.wc, sentences: a.sentCount, fillers: a.fillerCount, coverage: Math.round(cov * 100) }
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { scoreAnswer, CRITERIA, analyse, criterionLabel, MODE_PROFILES, notesFor, isProcessQuestion };
}
