/* ભાષા (i18n) — એપના ઇન્ટરફેસની ભાષા: English (ડિફોલ્ટ) · ગુજરાતી · हिन्दी
   Interface language layer. English is the default.

   પ્રશ્નો હંમેશા અંગ્રેજીમાં જ રહે છે અને વિદ્યાર્થી અંગ્રેજીમાં જ જવાબ આપે છે —
   એ તાલીમનો હેતુ છે. ભાષા બદલવાથી ફક્ત એપ જે બોલે/લખે તે બદલાય છે.

   નવી લીટી ઉમેરવી હોય તો ત્રણેય ભાષામાં એક જ કી નીચે ઉમેરો.
   કી ન મળે તો એપ English પર પડી જાય છે (કદી ખાલી નહીં દેખાય).
*/
"use strict";

const LANGS = [
  { id: "en", label: "English",   font: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif' },
  { id: "gu", label: "ગુજરાતી",   font: '"Noto Sans Gujarati","Shruti",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif' },
  { id: "hi", label: "हिन्दी",     font: '"Noto Sans Devanagari","Nirmala UI","Mangal",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif' }
];

/* મૂલ્યાંકન બોલવા માટે કયો વોઇસ વાપરવો */
const LANG_VOICE = { en: "en", gu: "gu", hi: "hi" };

const STRINGS = {

/* ==================== ENGLISH ==================== */
en: {
  "app.name": "Interview Practice",
  "app.tagline": "Questions in English · Answer aloud in English · Feedback in English",

  "home.heading": "Which course do you want to practise?",
  "home.lang": "App language",
  "home.progress": "Your overall progress",
  "home.foot1": "The app works without internet. Speaking your answer needs internet.",
  "home.foot2": "Scoring is automatic — it is guidance, not a final verdict.",

  "st.answered": "Answered",
  "st.avg": "Average score",
  "st.weak": "Needs work",

  "tile.questions": "{n} questions",
  "tile.done": "{n} answered · avg {a}",

  "run.progress": "This course",
  "run.answerLabel": "Your answer (in English)",
  "run.typePlaceholder": "Type your answer in English here.",
  "run.back": "Back",
  "run.settings": "Settings",

  "status.ready": "Ready — tap “Answer”",
  "status.asking": "Asking the question…",
  "status.listening": "Listening… speak in English",
  "status.scoring": "Checking your answer…",
  "status.feedback": "Your feedback is ready",

  "btn.answer": "🎤 Answer",
  "btn.startAnswer": "⏭ Start answering",
  "btn.done": "✓ Done answering",
  "btn.checking": "Checking…",
  "btn.next": "Next question →",
  "btn.nextIn": "Next question → ({n})",
  "btn.repeat": "🔊 Hear it again",
  "btn.skip": "↻ Another question",
  "btn.type": "⌨ Type instead",
  "btn.clear": "Clear",
  "btn.check": "Check my answer",
  "btn.hearModel": "🔊 Hear the model answer",
  "btn.start": "Start mock interview",
  "brief.eyebrow": "Before you begin",
  "brief.meta": "{n} questions · about {m} minutes",
  "brief.i1": "Sit somewhere quiet. The mic picks up background noise too.",
  "brief.i2": "The question is asked in English. Answer aloud in English, in full sentences.",
  "brief.i3": "Answer all {n} questions — that is what gives you the real feel of an interview.",
  "brief.i4": "Read the feedback after every answer. That is where the improvement comes from.",
  "btn.close": "Close",
  "btn.continue": "Continue",
  "btn.skipName": "Skip for now",
  "btn.change": "Change",
  "btn.finish": "Finish",
  "welcome.title": "Welcome",
  "welcome.lead": "Practise real job-interview questions. The interviewer asks in English, you answer aloud, and the feedback comes back in your language.",
  "welcome.nameLabel": "What is your name?",
  "welcome.namePh": "Your full name",
  "welcome.why": "Your name is only used to greet you during the interview. It stays on this phone — nothing is saved on any server of ours.",
  "welcome.or": "or",
  "home.hello": "Hello, {name}",
  "set.name": "Your name",
  "set.nameNotSet": "Not set",
  "btn.erase": "Erase",

  "res.score": "{v} out of 10",
  "res.meta": "{cat} · {w} words · {c}% of key points",
  "res.grammar": "Grammar corrections",
  "res.advice": "Do this next time",
  "res.tip": "Special tip for this question",
  "res.safety": "⚠ You missed a compulsory safety point",
  "res.safetyNote": "An answer without these points is not accepted in industry, so the total score cannot go above {max}.",
  "res.modelGuOnly": "The explanation below is in Gujarati — not yet translated.",
  "res.model": "See the model answer",
  "res.modelEn": "Say it in English like this:",
  "res.empty": "No answers checked in this course yet.",
  "res.thCat": "Section",
  "res.thScore": "Score",
  "res.noAnswer": "Speak or type your answer first.",

  "crit.communication": "Clear communication",
  "crit.sentences": "Complete sentences",
  "crit.thought": "Clarity of thought",
  "crit.thought.tech": "Order of steps",
  "crit.speechGrammar": "Pronunciation and grammar",
  "crit.accuracy": "Accuracy of the answer",
  "crit.accuracy.tech": "Technical accuracy",
  "crit.coherence": "Fluency",

  "set.title": "Settings",
  "set.hands": "Hands-free mode",
  "set.handsD": "The avatar asks the question, then the mic opens by itself and your answer is checked automatically when you stop speaking.",
  "set.ask": "Ask questions aloud",
  "set.askD": "The avatar reads the question out in English.",
  "set.fb": "Read the feedback aloud",
  "set.fbD": "The score and advice are read out. Works only if your phone has a voice for this language.",
  "set.rate": "Speaking speed",
  "set.rateD": "Keep it on “Slow” for beginners.",
  "set.rateSlow": "Slow",
  "set.rateNormal": "Normal",
  "set.rateFast": "Fast",
  "set.silence": "Pause that ends your answer",
  "set.silenceD": "In hands-free mode, staying quiet this long means your answer is finished.",
  "set.sec": "{n} seconds",
  "set.reset": "Erase everything and start again",
  "set.resetD": "All answers and scores in every course will be deleted permanently.",
  "set.resetAsk": "Delete all answers and scores in every course?",

  "diag.micYes": "✓ You can answer by speaking (needs internet)",
  "diag.micNo": "✗ This phone cannot convert speech to text — please type your answer",
  "diag.enYes": "✓ English voice found — the avatar can ask questions aloud",
  "diag.enNo": "✗ No English voice found",
  "diag.fbYes": "✓ Voice found for this language — feedback can be read aloud",
  "diag.fbNo": "✗ No voice found for this language. Download one from Settings → Language & input → Text-to-speech on your phone.",

  "err.mic.denied": "Microphone permission was not given. Turn on the mic in your browser settings, or tap “Type instead”.",
  "err.mic.network": "Speaking your answer needs internet. Without it, type your answer — the scoring still works offline.",
  "err.mic.unsupported": "This phone cannot convert speech to text. Type your answer, or use the mic button on your keyboard.",
  "err.mic.other": "The mic stopped ({e}). Try again, or type your answer.",

  "hint.speak": "Speak slowly and clearly, in full sentences. Pausing is fine.",
  "hint.edit": "Fix anything that came out wrong, then tap “Check my answer”.",

  "fb.spoken": "You scored {v} out of 10. ",
  "fb.spokenSafety": "Careful — you missed a compulsory safety point: {list}. ",

  "note.accuracy.low": "The main points of the question are missing. Listen carefully and answer exactly what was asked.",
  "note.accuracy.mid": "Some of the needed points are there, but a few are missing. Compare with the model answer.",
  "note.accuracy.high": "You covered almost all the points the question needed. Well done.",
  "note.accuracyT.low": "Almost none of the technical points came through. Read the model answer and remember the key terms.",
  "note.accuracyT.mid": "Some technical points are correct, but a few are missing. Compare with the model answer.",
  "note.accuracyT.high": "You covered almost all the technical points. Well done.",
  "note.communication.low": "The answer is far too short or unclear. Speak at least two or three full sentences.",
  "note.communication.mid": "You can be understood, but add a little more detail and use fewer filler words.",
  "note.communication.high": "Your point came across clearly and at a good length.",
  "note.sentences.low": "The answer is just loose words. Speak a full sentence with a subject and a verb.",
  "note.sentences.mid": "Most sentences are complete, but a few were left unfinished.",
  "note.sentences.high": "Every sentence is complete and well formed.",
  "note.thought.low": "There is no order in your ideas. Arrange them as first, then, finally.",
  "note.thought.mid": "The thinking is fine, but connect your points in a clearer order.",
  "note.thought.high": "Your points were presented in a logical, well-ordered way.",
  "note.thoughtT.low": "The steps are out of order. Say them in sequence: “First… then… finally…”.",
  "note.thoughtT.mid": "The order is roughly right, but set the steps out more clearly, one after another.",
  "note.thoughtT.high": "The steps were given in the correct order and clearly explained.",
  "note.speechGrammar.low": "There are too many filler words. Speak slowly and clearly.",
  "note.speechGrammar.mid": "Your grammar is fine. Cut down the filler words.",
  "note.speechGrammar.high": "Your grammar is correct and your language is clear.",
  "note.speechGrammar.found": "Grammar mistakes found: {n}. The corrections are given below.",
  "note.coherence.low": "The answer sounds broken, or words are repeated too often.",
  "note.coherence.mid": "The flow is alright, but join your sentences better — use “because”, “so”, “after that”.",
  "note.coherence.high": "The whole answer flows smoothly and hangs together.",

  "adv.communication": "Next time make your answer a little longer — speak at least three full sentences and avoid words like “um” and “basically”.",
  "adv.sentences": "Next time do not answer in one or two words. Start every answer with a full sentence, like “I have…” or “My father works…”.",
  "adv.thought": "Next time think for two seconds before speaking and put your points in order — what first, what next, what last.",
  "adv.speechGrammar": "Next time speak slowly. Practise the grammar mistakes below by saying them correctly out loud five times.",
  "adv.accuracy": "Next time listen to the question carefully and answer only what was asked. Remember the points from the model answer.",
  "adv.coherence": "Next time use linking words — “because”, “so”, “after that” — so your answer flows as one piece.",
  "advT.accuracy": "Next time remember the key technical terms from the model answer and use them. That is what the interviewer is listening for.",
  "advT.thought": "Next time give the steps in order — “first… then… after that… finally”. It shows you have actually done the work.",
  "advT.communication": "Next time say one or two sentences more, and name each step as you go.",
  "advT.sentences": "Next time answer in full sentences, not loose words — for example “First I switch off the power to the machine”.",
  "advT.speechGrammar": "Next time speak slowly and pronounce the technical terms clearly.",
  "advT.coherence": "Next time join the steps with “then”, “after that”, “finally”, so the whole process sounds continuous.",
  "adv.missing": "Your answer is alright as language, but you missed a compulsory safety point — {list}. In industry, missing this costs you the job. Say this answer again, with those points included.",
  "adv.offTopic": "This answer does not match the question that was asked. Your language was fine, but an answer like this does not work in an interview — listen to the question properly first, and only then start speaking.",
  "adv.offTopicT": "This answer does not match the question that was asked. Listen to the question properly, then read the model answer and try again.",
  "adv.praise": "Very good answer. Now practise saying it out loud in front of a mirror or a friend, so you can say it confidently in the interview.",

  "gram.myself": "“Myself Ravi” is wrong. Say “My name is Ravi”.",
  "gram.amHaving": "Say “I have” instead of “I am having”.",
  "gram.amKnowing": "“I am knowing” is wrong. Say “I know” directly.",
  "gram.didntWent": "“didn't went” is wrong. Say “didn't go”.",
  "gram.heDo": "Say “he does” instead of “he do”.",
  "gram.heHave": "Say “he has” instead of “he have”.",
  "gram.theyIs": "Say “they are” instead of “they is”.",
  "gram.iHas": "“I has” is wrong. Say “I have”.",
  "gram.iAre": "“I are” is wrong. Say “I am”.",
  "gram.doubleSubject": "Do not use the subject twice in one sentence. Say “My father is working” instead of “My father he is working”.",
  "gram.moreBetter": "“more better” is wrong. Just say “better”.",
  "gram.discussAbout": "Say just “discuss” instead of “discuss about”.",
  "gram.returnBack": "In “return back”, the word “back” is extra. Just say “return”.",
  "gram.giveExam": "Instead of “give exam”, say “appear for an exam” or “take an exam”.",
  "gram.passedOut": "Instead of “passed out”, say “graduated” or “completed my degree”.",
  "gram.cousinBrother": "Say just “cousin” instead of “cousin brother”.",
  "gram.outOfStation": "Say “out of town” instead of “out of station”.",
  "gram.prepone": "“prepone” is not an English word. Say “move it earlier”.",
  "gram.goodName": "Say just “your name” instead of “your good name”.",
  "gram.needful": "“do the needful” is old-fashioned. Say clearly what you need.",
  "gram.likeThatOnly": "Say “like that” instead of “like that only”.",
  "gram.amBelong": "“I am belong” is wrong. Say “I belong to” or “I am from”.",
  "gram.everyDays": "“every days” is wrong. Say “every day”, in the singular.",
  "gram.inNight": "Say “at night” instead of “in night”.",
  "gram.marriedWith": "Say “married to” instead of “married with”."
},

/* ==================== ગુજરાતી ==================== */
gu: {
  "app.name": "ઇન્ટરવ્યુ પ્રેક્ટિસ",
  "app.tagline": "પ્રશ્ન અંગ્રેજીમાં · જવાબ અંગ્રેજીમાં બોલો · મૂલ્યાંકન ગુજરાતીમાં",

  "home.heading": "કયો વિભાગ પ્રેક્ટિસ કરવો છે?",
  "home.lang": "એપની ભાષા",
  "home.progress": "તમારી કુલ પ્રગતિ",
  "home.foot1": "એપ ઇન્ટરનેટ વગર ચાલે છે. બોલીને જવાબ આપવા માટે ઇન્ટરનેટ જોઈએ.",
  "home.foot2": "મૂલ્યાંકન આપોઆપ થાય છે — તે માર્ગદર્શન માટે છે, અંતિમ ચુકાદો નથી.",

  "st.answered": "જવાબ આપ્યા",
  "st.avg": "સરેરાશ ગુણ",
  "st.weak": "સુધારવાની જરૂર",

  "tile.questions": "{n} પ્રશ્ન",
  "tile.done": "{n} જવાબ · સરેરાશ {a}",

  "run.progress": "આ વિભાગની પ્રગતિ",
  "run.answerLabel": "તમારો જવાબ (અંગ્રેજીમાં)",
  "run.typePlaceholder": "જવાબ અંગ્રેજીમાં અહીં ટાઇપ કરો.",
  "run.back": "પાછા",
  "run.settings": "સેટિંગ",

  "status.ready": "તૈયાર — «જવાબ આપો» દબાવો",
  "status.asking": "પ્રશ્ન પુછાઈ રહ્યો છે…",
  "status.listening": "સાંભળી રહ્યા છીએ… અંગ્રેજીમાં બોલો",
  "status.scoring": "જવાબ તપાસાઈ રહ્યો છે…",
  "status.feedback": "મૂલ્યાંકન તૈયાર છે",

  "btn.answer": "🎤 જવાબ આપો",
  "btn.startAnswer": "⏭ જવાબ આપવાનું શરૂ કરો",
  "btn.done": "✓ જવાબ પૂરો થયો",
  "btn.checking": "તપાસાઈ રહ્યું છે…",
  "btn.next": "આગળનો પ્રશ્ન →",
  "btn.nextIn": "આગળનો પ્રશ્ન → ({n})",
  "btn.repeat": "🔊 ફરી સાંભળો",
  "btn.skip": "↻ બીજો પ્રશ્ન",
  "btn.type": "⌨ ટાઇપ કરીને લખું",
  "btn.clear": "સાફ કરો",
  "btn.check": "જવાબ તપાસો",
  "btn.hearModel": "🔊 નમૂનારૂપ જવાબ સાંભળો",
  "btn.start": "મૉક ઇન્ટરવ્યુ શરૂ કરો",
  "brief.eyebrow": "શરૂ કરતાં પહેલાં",
  "brief.meta": "{n} પ્રશ્ન · આશરે {m} મિનિટ",
  "brief.i1": "શાંત જગ્યાએ બેસો. માઇક આસપાસનો અવાજ પણ પકડે છે.",
  "brief.i2": "પ્રશ્ન અંગ્રેજીમાં પુછાશે. જવાબ અંગ્રેજીમાં, પૂરાં વાક્યોમાં બોલો.",
  "brief.i3": "બધા {n} પ્રશ્નના જવાબ આપો — ત્યારે જ ખરા ઇન્ટરવ્યુનો અંદાજ આવે.",
  "brief.i4": "દરેક જવાબ પછી મૂલ્યાંકન વાંચો. સુધારો એમાંથી જ થાય છે.",
  "btn.close": "બંધ કરો",
  "btn.continue": "આગળ વધો",
  "btn.skipName": "હમણાં રહેવા દો",
  "btn.change": "બદલો",
  "btn.finish": "પૂરું કરો",
  "welcome.title": "સ્વાગત છે",
  "welcome.lead": "ખરા ઇન્ટરવ્યુના પ્રશ્નોની પ્રેક્ટિસ કરો. પ્રશ્ન અંગ્રેજીમાં પુછાશે, તમે બોલીને જવાબ આપશો, અને મૂલ્યાંકન તમારી ભાષામાં મળશે.",
  "welcome.nameLabel": "તમારું નામ શું છે?",
  "welcome.namePh": "તમારું પૂરું નામ",
  "welcome.why": "તમારું નામ ફક્ત ઇન્ટરવ્યુમાં તમને સંબોધવા વપરાય છે. તે આ ફોનમાં જ રહે છે — અમારા કોઈ સર્વર પર કંઈ સચવાતું નથી.",
  "welcome.or": "અથવા",
  "home.hello": "નમસ્તે, {name}",
  "set.name": "તમારું નામ",
  "set.nameNotSet": "નાખ્યું નથી",
  "btn.erase": "ભૂંસો",

  "res.score": "દસમાંથી {v} ગુણ",
  "res.meta": "{cat} · {w} શબ્દ · મુદ્દા {c}%",
  "res.grammar": "વ્યાકરણ સુધારો",
  "res.advice": "આગલી વખતે આ કરો",
  "res.tip": "આ પ્રશ્ન માટે ખાસ સૂચન",
  "res.safety": "⚠ સલામતીનો ફરજિયાત મુદ્દો ચૂકી ગયા",
  "res.safetyNote": "આ મુદ્દા વગરનો જવાબ ઉદ્યોગમાં સ્વીકારાતો નથી, તેથી કુલ ગુણ {max} થી વધુ મળી શકતા નથી.",
  "res.modelGuOnly": "નીચેની સમજૂતી ગુજરાતીમાં છે.",
  "res.model": "નમૂનારૂપ જવાબ જુઓ",
  "res.modelEn": "અંગ્રેજીમાં આ રીતે બોલો:",
  "res.empty": "આ વિભાગમાં હજી કોઈ જવાબ તપાસ્યો નથી.",
  "res.thCat": "વિભાગ",
  "res.thScore": "ગુણ",
  "res.noAnswer": "પહેલાં જવાબ બોલો અથવા ટાઇપ કરો.",

  "crit.communication": "સ્પષ્ટ સંવાદ",
  "crit.sentences": "પૂર્ણ વાક્યો",
  "crit.thought": "વિચારોની સ્પષ્ટતા",
  "crit.thought.tech": "પગલાંનો ક્રમ",
  "crit.speechGrammar": "ઉચ્ચાર અને વ્યાકરણ",
  "crit.accuracy": "જવાબની ચોકસાઈ",
  "crit.accuracy.tech": "તકનીકી ચોકસાઈ",
  "crit.coherence": "વાણીની સુસંગતતા",

  "set.title": "સેટિંગ",
  "set.hands": "હાથ વગરનો મોડ",
  "set.handsD": "અવતાર પ્રશ્ન પૂછે, પછી માઇક જાતે ચાલુ થાય અને તમે બોલવાનું બંધ કરો ત્યારે જવાબ જાતે તપાસાય.",
  "set.ask": "પ્રશ્ન બોલીને પુછાય",
  "set.askD": "અવતાર પ્રશ્ન અંગ્રેજીમાં મોટેથી બોલે.",
  "set.fb": "મૂલ્યાંકન બોલીને સંભળાવો",
  "set.fbD": "ગુણ અને સલાહ મોટેથી વંચાય. ફોનમાં આ ભાષાનો વોઇસ નાખેલો હોય તો જ ચાલે.",
  "set.rate": "બોલવાની ઝડપ",
  "set.rateD": "શરૂઆતના વિદ્યાર્થી માટે «ધીમી» રાખો.",
  "set.rateSlow": "ધીમી",
  "set.rateNormal": "સામાન્ય",
  "set.rateFast": "ઝડપી",
  "set.silence": "બોલવાનું બંધ થયું ગણવાનો સમય",
  "set.silenceD": "હાથ વગરના મોડમાં તમે આટલી સેકન્ડ ચૂપ રહો તો જવાબ પૂરો ગણાય.",
  "set.sec": "{n} સેકન્ડ",
  "set.reset": "બધું ભૂંસીને ફરી શરૂ કરો",
  "set.resetD": "બધા વિભાગના જવાબ અને ગુણ કાયમ માટે ભૂંસાઈ જશે.",
  "set.resetAsk": "બધા વિભાગના જવાબ અને ગુણ ભૂંસી નાખવા છે?",

  "diag.micYes": "✓ બોલીને જવાબ આપી શકાય છે (ઇન્ટરનેટ જરૂરી)",
  "diag.micNo": "✗ આ ફોનમાં બોલીને લખવાની સુવિધા નથી — જવાબ ટાઇપ કરો",
  "diag.enYes": "✓ અંગ્રેજી વોઇસ મળી ગયો — અવતાર પ્રશ્ન બોલી શકશે",
  "diag.enNo": "✗ અંગ્રેજી વોઇસ મળ્યો નથી",
  "diag.fbYes": "✓ આ ભાષાનો વોઇસ મળી ગયો — મૂલ્યાંકન બોલીને સંભળાવી શકાશે",
  "diag.fbNo": "✗ આ ભાષાનો વોઇસ મળ્યો નથી. ફોનના Settings → Language & input → Text-to-speech માં વોઇસ ડાઉનલોડ કરો.",

  "err.mic.denied": "માઇક્રોફોનની પરવાનગી મળી નથી. બ્રાઉઝરના સેટિંગમાં માઇક ચાલુ કરો, અથવા «ટાઇપ કરીને લખું» દબાવો.",
  "err.mic.network": "બોલીને જવાબ આપવા માટે ઇન્ટરનેટ જરૂરી છે. ઇન્ટરનેટ ન હોય તો જવાબ ટાઇપ કરો — મૂલ્યાંકન ઓફલાઇન થશે.",
  "err.mic.unsupported": "આ ફોનમાં બોલીને લખવાની સુવિધા નથી. જવાબ ટાઇપ કરો, અથવા કીબોર્ડ પરના માઇક બટનથી બોલો.",
  "err.mic.other": "માઇક બંધ થઈ ગયો ({e}). ફરી પ્રયત્ન કરો અથવા ટાઇપ કરો.",

  "hint.speak": "પૂરાં વાક્યોમાં, ધીમે અને સ્પષ્ટ બોલો. વચ્ચે અટકો તો વાંધો નથી.",
  "hint.edit": "ખોટું લખાયું હોય તો સુધારી લો, પછી «જવાબ તપાસો» દબાવો.",

  "fb.spoken": "તમને દસમાંથી {v} ગુણ મળ્યા. ",
  "fb.spokenSafety": "ધ્યાન રાખો, સલામતીનો ફરજિયાત મુદ્દો ચૂકી ગયા છો: {list}. ",

  "note.accuracy.low": "પ્રશ્નના મુખ્ય મુદ્દા જવાબમાં આવ્યા નથી. પ્રશ્ન ધ્યાનથી સાંભળીને સીધો જવાબ આપો.",
  "note.accuracy.mid": "કેટલાક જરૂરી મુદ્દા આવ્યા છે, પણ થોડા રહી ગયા છે. નમૂનારૂપ જવાબ સાથે સરખાવો.",
  "note.accuracy.high": "પ્રશ્નના લગભગ બધા જ જરૂરી મુદ્દા આવરી લીધા છે. સરસ.",
  "note.accuracyT.low": "તકનીકી મુદ્દા લગભગ આવ્યા નથી. નમૂનારૂપ જવાબ વાંચીને મુખ્ય શબ્દો યાદ રાખો.",
  "note.accuracyT.mid": "કેટલાક તકનીકી મુદ્દા સાચા છે, પણ થોડા રહી ગયા છે. નમૂનારૂપ જવાબ સાથે સરખાવો.",
  "note.accuracyT.high": "તકનીકી મુદ્દા લગભગ બધા આવરી લીધા છે. સરસ.",
  "note.communication.low": "જવાબ ઘણો ટૂંકો કે અસ્પષ્ટ છે. ઓછામાં ઓછાં બે-ત્રણ પૂરાં વાક્યો બોલો.",
  "note.communication.mid": "વાત સમજાય છે, પણ થોડી વધુ વિગત અને ઓછા ભરતીના શબ્દો જોઈએ.",
  "note.communication.high": "વાત સ્પષ્ટ અને યોગ્ય લંબાઈમાં રજૂ થઈ છે.",
  "note.sentences.low": "જવાબ છૂટા શબ્દોમાં છે. કર્તા અને ક્રિયાપદ સાથે પૂરું વાક્ય બોલો.",
  "note.sentences.mid": "મોટા ભાગનાં વાક્યો પૂરાં છે, પણ થોડાં અધૂરાં રહી ગયાં છે.",
  "note.sentences.high": "બધાં જ વાક્યો પૂરાં અને વ્યવસ્થિત છે.",
  "note.thought.low": "વિચારોમાં ક્રમ દેખાતો નથી. પહેલાં–પછી–છેલ્લે એ ક્રમમાં ગોઠવીને બોલો.",
  "note.thought.mid": "વિચાર ઠીક છે, પણ મુદ્દા વધુ ક્રમબદ્ધ રીતે જોડો.",
  "note.thought.high": "મુદ્દા ક્રમબદ્ધ અને તાર્કિક રીતે રજૂ થયા છે.",
  "note.thoughtT.low": "પગલાં ક્રમમાં આવ્યાં નથી. «પહેલાં… પછી… છેલ્લે…» એમ ક્રમ પ્રમાણે બોલો.",
  "note.thoughtT.mid": "ક્રમ ઠીક છે, પણ પગલાં વધુ સ્પષ્ટ રીતે એક પછી એક ગોઠવો.",
  "note.thoughtT.high": "પગલાં સાચા ક્રમમાં અને વ્યવસ્થિત રીતે રજૂ થયાં છે.",
  "note.speechGrammar.low": "ભરતીના શબ્દો વધારે છે. ધીમે અને સ્પષ્ટ બોલો.",
  "note.speechGrammar.mid": "વ્યાકરણ ઠીક છે. ભરતીના શબ્દો ઓછા કરો.",
  "note.speechGrammar.high": "વ્યાકરણ સાચું અને ભાષા સ્પષ્ટ છે.",
  "note.speechGrammar.found": "વ્યાકરણની {n} ભૂલ મળી. નીચે સુધારા આપ્યા છે.",
  "note.coherence.low": "જવાબ તૂટક લાગે છે અથવા શબ્દો વારંવાર દોહરાય છે.",
  "note.coherence.mid": "પ્રવાહ ઠીક છે, પણ વાક્યો વધુ સારી રીતે જોડો — «because», «so», «after that» વાપરો.",
  "note.coherence.high": "આખો જવાબ સળંગ અને સુસંગત રીતે વહે છે.",

  "adv.communication": "આગલી વખતે જવાબ થોડો લાંબો કરો — ઓછામાં ઓછાં ત્રણ પૂરાં વાક્યો બોલો અને «um», «matlab» જેવા શબ્દો ટાળો.",
  "adv.sentences": "આગલી વખતે એક-બે શબ્દમાં જવાબ ન આપો. દરેક જવાબ «I have…», «My father works…» એમ પૂરા વાક્યથી શરૂ કરો.",
  "adv.thought": "આગલી વખતે બોલતાં પહેલાં બે સેકન્ડ વિચારો અને મુદ્દા ક્રમમાં ગોઠવો — પહેલાં શું, પછી શું, છેલ્લે શું.",
  "adv.speechGrammar": "આગલી વખતે ધીમે બોલો. નીચે આપેલી વ્યાકરણની ભૂલો મોટેથી સાચી રીતે પાંચ વાર બોલીને પ્રેક્ટિસ કરો.",
  "adv.accuracy": "આગલી વખતે પ્રશ્ન ધ્યાનથી સાંભળો અને જે પુછાયું છે તેનો જ જવાબ આપો. નમૂનારૂપ જવાબના મુદ્દા યાદ રાખો.",
  "adv.coherence": "આગલી વખતે વાક્યોને જોડતા શબ્દો વાપરો — «because», «so», «after that» — જેથી જવાબ સળંગ લાગે.",
  "advT.accuracy": "આગલી વખતે નમૂનારૂપ જવાબના મુખ્ય તકનીકી શબ્દો યાદ રાખીને બોલો. ઇન્ટરવ્યુ લેનાર એ શબ્દો સાંભળવા માંગે છે.",
  "advT.thought": "આગલી વખતે પગલાં ક્રમ પ્રમાણે બોલો — «પહેલાં… પછી… ત્યાર બાદ… છેલ્લે…». તેનાથી લાગે છે કે તમે ખરેખર કામ કર્યું છે.",
  "advT.communication": "આગલી વખતે એક-બે વાક્ય વધુ બોલો અને દરેક પગલું નામ સાથે કહો.",
  "advT.sentences": "આગલી વખતે છૂટા શબ્દોમાં નહીં, પૂરા વાક્યમાં જવાબ આપો — «પહેલાં હું મશીનનો પાવર બંધ કરું છું» એમ.",
  "advT.speechGrammar": "આગલી વખતે ધીમે બોલો અને તકનીકી શબ્દોના ઉચ્ચાર સ્પષ્ટ કરો.",
  "advT.coherence": "આગલી વખતે પગલાંને «પછી», «ત્યાર બાદ», «છેલ્લે» વડે જોડો, જેથી આખી પ્રક્રિયા સળંગ લાગે.",
  "adv.missing": "તમારો જવાબ ભાષાની દૃષ્ટિએ ઠીક છે, પણ સલામતીનો ફરજિયાત મુદ્દો ચૂકી ગયા છો — {list}. ઉદ્યોગમાં આ મુદ્દા ચૂકવાથી નોકરી મળતી નથી. આ જવાબ ફરીથી, આ મુદ્દા સાથે બોલો.",
  "adv.offTopic": "આ જવાબ પુછાયેલા પ્રશ્ન સાથે મેળ ખાતો નથી. ભાષા સારી હોવા છતાં ઇન્ટરવ્યુમાં આવો જવાબ ચાલતો નથી — પહેલાં પ્રશ્ન બરાબર સાંભળો, પછી જ બોલવાનું શરૂ કરો.",
  "adv.offTopicT": "આ જવાબ પુછાયેલા પ્રશ્ન સાથે મેળ ખાતો નથી. પહેલાં પ્રશ્ન બરાબર સાંભળો, પછી નમૂનારૂપ જવાબ વાંચીને ફરી પ્રયત્ન કરો.",
  "adv.praise": "ખૂબ સરસ જવાબ. હવે આ જ જવાબ અરીસા સામે કે મિત્ર સામે મોટેથી બોલીને પ્રેક્ટિસ કરો, જેથી ઇન્ટરવ્યુમાં આત્મવિશ્વાસથી બોલી શકો.",

  "gram.myself": "«Myself Ravi» ખોટું છે. «My name is Ravi» બોલો.",
  "gram.amHaving": "«I am having» ને બદલે «I have» બોલો.",
  "gram.amKnowing": "«I am knowing» ખોટું છે. «I know» એમ સીધું બોલો.",
  "gram.didntWent": "«didn't went» ખોટું છે. «didn't go» બોલો.",
  "gram.heDo": "«he do» ને બદલે «he does» બોલો.",
  "gram.heHave": "«he have» ને બદલે «he has» બોલો.",
  "gram.theyIs": "«they is» ને બદલે «they are» બોલો.",
  "gram.iHas": "«I has» ખોટું છે. «I have» બોલો.",
  "gram.iAre": "«I are» ખોટું છે. «I am» બોલો.",
  "gram.doubleSubject": "એક વાક્યમાં બે વાર કર્તા ન વાપરો. «My father he is working» ને બદલે «My father is working» બોલો.",
  "gram.moreBetter": "«more better» ખોટું છે. ફક્ત «better» બોલો.",
  "gram.discussAbout": "«discuss about» ને બદલે ફક્ત «discuss» બોલો.",
  "gram.returnBack": "«return back» માં «back» વધારાનું છે. ફક્ત «return» બોલો.",
  "gram.giveExam": "«give exam» ને બદલે «appear for an exam» અથવા «take an exam» બોલો.",
  "gram.passedOut": "«passed out» ને બદલે «graduated» અથવા «completed my degree» બોલો.",
  "gram.cousinBrother": "«cousin brother» ને બદલે ફક્ત «cousin» બોલો.",
  "gram.outOfStation": "«out of station» ને બદલે «out of town» બોલો.",
  "gram.prepone": "«prepone» અંગ્રેજી શબ્દ નથી. «move it earlier» બોલો.",
  "gram.goodName": "«your good name» ને બદલે ફક્ત «your name» બોલો.",
  "gram.needful": "«do the needful» જૂની શૈલી છે. શું જોઈએ છે તે સ્પષ્ટ બોલો.",
  "gram.likeThatOnly": "«like that only» ને બદલે «like that» બોલો.",
  "gram.amBelong": "«I am belong» ખોટું છે. «I belong to» અથવા «I am from» બોલો.",
  "gram.everyDays": "«every days» ખોટું છે. «every day» એકવચનમાં બોલો.",
  "gram.inNight": "«in night» ને બદલે «at night» બોલો.",
  "gram.marriedWith": "«married with» ને બદલે «married to» બોલો."
},

/* ==================== हिन्दी ==================== */
hi: {
  "app.name": "इंटरव्यू प्रैक्टिस",
  "app.tagline": "प्रश्न अंग्रेज़ी में · जवाब अंग्रेज़ी में बोलें · मूल्यांकन हिन्दी में",

  "home.heading": "कौन सा विभाग प्रैक्टिस करना है?",
  "home.lang": "ऐप की भाषा",
  "home.progress": "आपकी कुल प्रगति",
  "home.foot1": "ऐप इंटरनेट के बिना चलता है। बोलकर जवाब देने के लिए इंटरनेट चाहिए।",
  "home.foot2": "मूल्यांकन अपने आप होता है — यह मार्गदर्शन के लिए है, अंतिम फ़ैसला नहीं।",

  "st.answered": "जवाब दिए",
  "st.avg": "औसत अंक",
  "st.weak": "सुधार की ज़रूरत",

  "tile.questions": "{n} प्रश्न",
  "tile.done": "{n} जवाब · औसत {a}",

  "run.progress": "इस विभाग की प्रगति",
  "run.answerLabel": "आपका जवाब (अंग्रेज़ी में)",
  "run.typePlaceholder": "जवाब अंग्रेज़ी में यहाँ टाइप करें।",
  "run.back": "पीछे",
  "run.settings": "सेटिंग",

  "status.ready": "तैयार — «जवाब दें» दबाएँ",
  "status.asking": "प्रश्न पूछा जा रहा है…",
  "status.listening": "सुन रहे हैं… अंग्रेज़ी में बोलें",
  "status.scoring": "जवाब जाँचा जा रहा है…",
  "status.feedback": "मूल्यांकन तैयार है",

  "btn.answer": "🎤 जवाब दें",
  "btn.startAnswer": "⏭ जवाब देना शुरू करें",
  "btn.done": "✓ जवाब पूरा हुआ",
  "btn.checking": "जाँच रहे हैं…",
  "btn.next": "अगला प्रश्न →",
  "btn.nextIn": "अगला प्रश्न → ({n})",
  "btn.repeat": "🔊 फिर सुनें",
  "btn.skip": "↻ दूसरा प्रश्न",
  "btn.type": "⌨ टाइप करके लिखूँ",
  "btn.clear": "साफ़ करें",
  "btn.check": "जवाब जाँचें",
  "btn.hearModel": "🔊 नमूना जवाब सुनें",
  "btn.start": "मॉक इंटरव्यू शुरू करें",
  "brief.eyebrow": "शुरू करने से पहले",
  "brief.meta": "{n} प्रश्न · लगभग {m} मिनट",
  "brief.i1": "शांत जगह पर बैठें। माइक आसपास की आवाज़ भी पकड़ता है।",
  "brief.i2": "प्रश्न अंग्रेज़ी में पूछा जाएगा। जवाब अंग्रेज़ी में, पूरे वाक्यों में बोलें।",
  "brief.i3": "सभी {n} प्रश्नों के जवाब दें — तभी असली इंटरव्यू का अंदाज़ा आता है।",
  "brief.i4": "हर जवाब के बाद मूल्यांकन पढ़ें। सुधार उसी से होता है।",
  "btn.close": "बंद करें",
  "btn.continue": "आगे बढ़ें",
  "btn.skipName": "अभी छोड़ दें",
  "btn.change": "बदलें",
  "btn.finish": "पूरा करें",
  "welcome.title": "स्वागत है",
  "welcome.lead": "असली इंटरव्यू के प्रश्नों का अभ्यास करें। प्रश्न अंग्रेज़ी में पूछा जाएगा, आप बोलकर जवाब देंगे, और मूल्यांकन आपकी भाषा में मिलेगा।",
  "welcome.nameLabel": "आपका नाम क्या है?",
  "welcome.namePh": "आपका पूरा नाम",
  "welcome.why": "आपका नाम सिर्फ़ इंटरव्यू में आपको संबोधित करने के लिए इस्तेमाल होता है। यह इसी फ़ोन में रहता है — हमारे किसी सर्वर पर कुछ नहीं सहेजा जाता।",
  "welcome.or": "या",
  "home.hello": "नमस्ते, {name}",
  "set.name": "आपका नाम",
  "set.nameNotSet": "नहीं भरा",
  "btn.erase": "मिटाएँ",

  "res.score": "दस में से {v} अंक",
  "res.meta": "{cat} · {w} शब्द · मुद्दे {c}%",
  "res.grammar": "व्याकरण सुधार",
  "res.advice": "अगली बार यह करें",
  "res.tip": "इस प्रश्न के लिए ख़ास सुझाव",
  "res.safety": "⚠ सुरक्षा का अनिवार्य मुद्दा छूट गया",
  "res.safetyNote": "इन मुद्दों के बिना जवाब उद्योग में स्वीकार नहीं किया जाता, इसलिए कुल अंक {max} से ज़्यादा नहीं मिल सकते।",
  "res.modelGuOnly": "नीचे दी गई समझ गुजराती में है — अभी अनुवाद नहीं हुआ।",
  "res.model": "नमूना जवाब देखें",
  "res.modelEn": "अंग्रेज़ी में इस तरह बोलें:",
  "res.empty": "इस विभाग में अभी कोई जवाब जाँचा नहीं गया।",
  "res.thCat": "विभाग",
  "res.thScore": "अंक",
  "res.noAnswer": "पहले जवाब बोलें या टाइप करें।",

  "crit.communication": "स्पष्ट संवाद",
  "crit.sentences": "पूरे वाक्य",
  "crit.thought": "विचारों की स्पष्टता",
  "crit.thought.tech": "चरणों का क्रम",
  "crit.speechGrammar": "उच्चारण और व्याकरण",
  "crit.accuracy": "जवाब की सटीकता",
  "crit.accuracy.tech": "तकनीकी सटीकता",
  "crit.coherence": "वाणी की प्रवाहमयता",

  "set.title": "सेटिंग",
  "set.hands": "हाथ लगाए बिना चलने वाला मोड",
  "set.handsD": "अवतार प्रश्न पूछता है, फिर माइक अपने आप चालू होता है और आप बोलना बंद करें तो जवाब अपने आप जाँचा जाता है।",
  "set.ask": "प्रश्न बोलकर पूछा जाए",
  "set.askD": "अवतार प्रश्न अंग्रेज़ी में ज़ोर से बोलता है।",
  "set.fb": "मूल्यांकन बोलकर सुनाएँ",
  "set.fbD": "अंक और सलाह ज़ोर से पढ़े जाते हैं। फ़ोन में इस भाषा की आवाज़ हो तभी चलेगा।",
  "set.rate": "बोलने की गति",
  "set.rateD": "शुरुआती विद्यार्थियों के लिए «धीमी» रखें।",
  "set.rateSlow": "धीमी",
  "set.rateNormal": "सामान्य",
  "set.rateFast": "तेज़",
  "set.silence": "जवाब पूरा मानने का समय",
  "set.silenceD": "हाथ लगाए बिना चलने वाले मोड में आप इतने सेकंड चुप रहें तो जवाब पूरा माना जाता है।",
  "set.sec": "{n} सेकंड",
  "set.reset": "सब मिटाकर फिर से शुरू करें",
  "set.resetD": "सभी विभागों के जवाब और अंक हमेशा के लिए मिट जाएँगे।",
  "set.resetAsk": "सभी विभागों के जवाब और अंक मिटा देने हैं?",

  "diag.micYes": "✓ बोलकर जवाब दिया जा सकता है (इंटरनेट ज़रूरी)",
  "diag.micNo": "✗ इस फ़ोन में बोलकर लिखने की सुविधा नहीं है — जवाब टाइप करें",
  "diag.enYes": "✓ अंग्रेज़ी आवाज़ मिल गई — अवतार प्रश्न बोल सकेगा",
  "diag.enNo": "✗ अंग्रेज़ी आवाज़ नहीं मिली",
  "diag.fbYes": "✓ इस भाषा की आवाज़ मिल गई — मूल्यांकन बोलकर सुनाया जा सकेगा",
  "diag.fbNo": "✗ इस भाषा की आवाज़ नहीं मिली। फ़ोन के Settings → Language & input → Text-to-speech में आवाज़ डाउनलोड करें।",

  "err.mic.denied": "माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र की सेटिंग में माइक चालू करें, या «टाइप करके लिखूँ» दबाएँ।",
  "err.mic.network": "बोलकर जवाब देने के लिए इंटरनेट ज़रूरी है। इंटरनेट न हो तो जवाब टाइप करें — मूल्यांकन ऑफ़लाइन हो जाएगा।",
  "err.mic.unsupported": "इस फ़ोन में बोलकर लिखने की सुविधा नहीं है। जवाब टाइप करें, या कीबोर्ड के माइक बटन से बोलें।",
  "err.mic.other": "माइक बंद हो गया ({e})। फिर कोशिश करें या टाइप करें।",

  "hint.speak": "पूरे वाक्यों में, धीरे और साफ़ बोलें। बीच में रुकें तो कोई बात नहीं।",
  "hint.edit": "ग़लत लिखा गया हो तो सुधार लें, फिर «जवाब जाँचें» दबाएँ।",

  "fb.spoken": "आपको दस में से {v} अंक मिले। ",
  "fb.spokenSafety": "ध्यान रखें, सुरक्षा का अनिवार्य मुद्दा छूट गया है: {list}. ",

  "note.accuracy.low": "प्रश्न के मुख्य मुद्दे जवाब में नहीं आए। प्रश्न ध्यान से सुनकर सीधा जवाब दें।",
  "note.accuracy.mid": "कुछ ज़रूरी मुद्दे आए हैं, पर कुछ रह गए। नमूना जवाब से मिलाकर देखें।",
  "note.accuracy.high": "प्रश्न के लगभग सभी ज़रूरी मुद्दे शामिल कर लिए। बहुत अच्छा।",
  "note.accuracyT.low": "तकनीकी मुद्दे लगभग नहीं आए। नमूना जवाब पढ़कर मुख्य शब्द याद रखें।",
  "note.accuracyT.mid": "कुछ तकनीकी मुद्दे सही हैं, पर कुछ रह गए। नमूना जवाब से मिलाकर देखें।",
  "note.accuracyT.high": "तकनीकी मुद्दे लगभग सभी शामिल कर लिए। बहुत अच्छा।",
  "note.communication.low": "जवाब बहुत छोटा या अस्पष्ट है। कम से कम दो-तीन पूरे वाक्य बोलें।",
  "note.communication.mid": "बात समझ में आती है, पर थोड़ा और विस्तार और कम भरती के शब्द चाहिए।",
  "note.communication.high": "बात स्पष्ट और सही लंबाई में रखी गई है।",
  "note.sentences.low": "जवाब बिखरे शब्दों में है। कर्ता और क्रिया के साथ पूरा वाक्य बोलें।",
  "note.sentences.mid": "ज़्यादातर वाक्य पूरे हैं, पर कुछ अधूरे रह गए।",
  "note.sentences.high": "सभी वाक्य पूरे और व्यवस्थित हैं।",
  "note.thought.low": "विचारों में क्रम नहीं दिखता। पहले–फिर–अंत में, इस क्रम में बोलें।",
  "note.thought.mid": "विचार ठीक हैं, पर मुद्दों को और क्रम से जोड़ें।",
  "note.thought.high": "मुद्दे क्रम से और तार्किक ढंग से रखे गए हैं।",
  "note.thoughtT.low": "चरण क्रम में नहीं आए। «पहले… फिर… अंत में…» इस क्रम से बोलें।",
  "note.thoughtT.mid": "क्रम ठीक है, पर चरणों को और साफ़ तरीके से एक के बाद एक रखें।",
  "note.thoughtT.high": "चरण सही क्रम में और व्यवस्थित ढंग से बताए गए हैं।",
  "note.speechGrammar.low": "भरती के शब्द बहुत ज़्यादा हैं। धीरे और साफ़ बोलें।",
  "note.speechGrammar.mid": "व्याकरण ठीक है। भरती के शब्द कम करें।",
  "note.speechGrammar.high": "व्याकरण सही और भाषा स्पष्ट है।",
  "note.speechGrammar.found": "व्याकरण की {n} ग़लती मिली। नीचे सुधार दिए गए हैं।",
  "note.coherence.low": "जवाब टूटा-टूटा लगता है या शब्द बार-बार दोहराए गए हैं।",
  "note.coherence.mid": "प्रवाह ठीक है, पर वाक्यों को बेहतर ढंग से जोड़ें — «because», «so», «after that» का प्रयोग करें।",
  "note.coherence.high": "पूरा जवाब लगातार और जुड़ा हुआ बहता है।",

  "adv.communication": "अगली बार जवाब थोड़ा लंबा करें — कम से कम तीन पूरे वाक्य बोलें और «um», «matlab» जैसे शब्द टालें।",
  "adv.sentences": "अगली बार एक-दो शब्दों में जवाब न दें। हर जवाब «I have…», «My father works…» की तरह पूरे वाक्य से शुरू करें।",
  "adv.thought": "अगली बार बोलने से पहले दो सेकंड सोचें और मुद्दे क्रम में रखें — पहले क्या, फिर क्या, अंत में क्या।",
  "adv.speechGrammar": "अगली बार धीरे बोलें। नीचे दी गई व्याकरण की ग़लतियों को ज़ोर से सही तरीके से पाँच बार बोलकर अभ्यास करें।",
  "adv.accuracy": "अगली बार प्रश्न ध्यान से सुनें और जो पूछा गया है उसी का जवाब दें। नमूना जवाब के मुद्दे याद रखें।",
  "adv.coherence": "अगली बार वाक्यों को जोड़ने वाले शब्द इस्तेमाल करें — «because», «so», «after that» — जिससे जवाब लगातार लगे।",
  "advT.accuracy": "अगली बार नमूना जवाब के मुख्य तकनीकी शब्द याद रखकर बोलें। इंटरव्यू लेने वाला वही शब्द सुनना चाहता है।",
  "advT.thought": "अगली बार चरण क्रम से बोलें — «पहले… फिर… उसके बाद… अंत में…»। इससे लगता है कि आपने वाकई काम किया है।",
  "advT.communication": "अगली बार एक-दो वाक्य ज़्यादा बोलें और हर चरण नाम के साथ बताएँ।",
  "advT.sentences": "अगली बार बिखरे शब्दों में नहीं, पूरे वाक्य में जवाब दें — जैसे «पहले मैं मशीन का पावर बंद करता हूँ»।",
  "advT.speechGrammar": "अगली बार धीरे बोलें और तकनीकी शब्दों का उच्चारण साफ़ करें।",
  "advT.coherence": "अगली बार चरणों को «फिर», «उसके बाद», «अंत में» से जोड़ें, जिससे पूरी प्रक्रिया लगातार लगे।",
  "adv.missing": "आपका जवाब भाषा के हिसाब से ठीक है, पर सुरक्षा का अनिवार्य मुद्दा छूट गया है — {list}. उद्योग में यह मुद्दा छूटने से नौकरी नहीं मिलती। यह जवाब दोबारा, इन मुद्दों के साथ बोलें।",
  "adv.offTopic": "यह जवाब पूछे गए प्रश्न से मेल नहीं खाता। भाषा अच्छी होने पर भी इंटरव्यू में ऐसा जवाब नहीं चलता — पहले प्रश्न ठीक से सुनें, फिर बोलना शुरू करें।",
  "adv.offTopicT": "यह जवाब पूछे गए प्रश्न से मेल नहीं खाता। पहले प्रश्न ठीक से सुनें, फिर नमूना जवाब पढ़कर दोबारा कोशिश करें।",
  "adv.praise": "बहुत अच्छा जवाब। अब यही जवाब आईने के सामने या किसी दोस्त के सामने ज़ोर से बोलकर अभ्यास करें, जिससे इंटरव्यू में आत्मविश्वास से बोल सकें।",

  "gram.myself": "«Myself Ravi» ग़लत है। «My name is Ravi» बोलें।",
  "gram.amHaving": "«I am having» के बजाय «I have» बोलें।",
  "gram.amKnowing": "«I am knowing» ग़लत है। «I know» सीधे बोलें।",
  "gram.didntWent": "«didn't went» ग़लत है। «didn't go» बोलें।",
  "gram.heDo": "«he do» के बजाय «he does» बोलें।",
  "gram.heHave": "«he have» के बजाय «he has» बोलें।",
  "gram.theyIs": "«they is» के बजाय «they are» बोलें।",
  "gram.iHas": "«I has» ग़लत है। «I have» बोलें।",
  "gram.iAre": "«I are» ग़लत है। «I am» बोलें।",
  "gram.doubleSubject": "एक वाक्य में दो बार कर्ता न लगाएँ। «My father he is working» के बजाय «My father is working» बोलें।",
  "gram.moreBetter": "«more better» ग़लत है। सिर्फ़ «better» बोलें।",
  "gram.discussAbout": "«discuss about» के बजाय सिर्फ़ «discuss» बोलें।",
  "gram.returnBack": "«return back» में «back» फ़ालतू है। सिर्फ़ «return» बोलें।",
  "gram.giveExam": "«give exam» के बजाय «appear for an exam» या «take an exam» बोलें।",
  "gram.passedOut": "«passed out» के बजाय «graduated» या «completed my degree» बोलें।",
  "gram.cousinBrother": "«cousin brother» के बजाय सिर्फ़ «cousin» बोलें।",
  "gram.outOfStation": "«out of station» के बजाय «out of town» बोलें।",
  "gram.prepone": "«prepone» अंग्रेज़ी शब्द नहीं है। «move it earlier» बोलें।",
  "gram.goodName": "«your good name» के बजाय सिर्फ़ «your name» बोलें।",
  "gram.needful": "«do the needful» पुरानी शैली है। जो चाहिए वह साफ़ बोलें।",
  "gram.likeThatOnly": "«like that only» के बजाय «like that» बोलें।",
  "gram.amBelong": "«I am belong» ग़लत है। «I belong to» या «I am from» बोलें।",
  "gram.everyDays": "«every days» ग़लत है। «every day» एकवचन में बोलें।",
  "gram.inNight": "«in night» के बजाय «at night» बोलें।",
  "gram.marriedWith": "«married with» के बजाय «married to» बोलें।"
}
};

/* ---------------- ભાષા સંભાળવી ---------------- */

let LANG = "en";

function langDef(id) {
  for (let i = 0; i < LANGS.length; i++) if (LANGS[i].id === id) return LANGS[i];
  return LANGS[0];
}

function getLang() { return LANG; }

function setLang(id) {
  LANG = STRINGS[id] ? id : "en";
  const d = langDef(LANG);
  document.documentElement.lang = LANG;
  document.documentElement.setAttribute("data-lang", LANG);
  document.documentElement.style.setProperty("--font", d.font);
  document.title = t("app.name");
  return LANG;
}

/* t("key", {n:3}) — કી ન મળે તો English, એ પણ ન મળે તો કી પોતે */
function t(key, vars) {
  let s = (STRINGS[LANG] && STRINGS[LANG][key]);
  if (s == null) s = STRINGS.en[key];
  if (s == null) return key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      s = s.split("{" + k + "}").join(String(vars[k]));
    });
  }
  return s;
}

/* HTML માં data-i18n લખેલા બધા ભાગ ભરી દો */
function applyI18n(root) {
  const scope = root || document;
  Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n]"), el => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n-ph]"), el => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });
  Array.prototype.forEach.call(scope.querySelectorAll("[data-i18n-aria]"), el => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { LANGS, STRINGS, t, setLang, getLang, applyI18n, LANG_VOICE };
}
