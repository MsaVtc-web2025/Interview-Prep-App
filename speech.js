/* Speech engine - speaking (text to speech) and listening (speech to text).
   Both use the browser's Web Speech API. No API key and no server required.

   The known Android Chrome limitations are handled here:
   1. getVoices() returns an empty list at first -> re-read it on voiceschanged.
   2. The first speak() needs a user tap -> prime() handles that.
   3. Long text gets cut off mid-way -> we speak it in small chunks.
   4. onend sometimes never fires -> there is a watchdog timer.
   5. Continuous recognition stops by itself on Android -> we restart it, reusing
      one recogniser, because rebuilding one costs dead air and so costs words.
   6. The mic hears the speaker's own output -> the two are never on together.
   7. rec.start() throws while the previous session is winding down -> we back
      off and retry. (Swallowing that error leaves the mic off for good while the
      screen still says "listening".)
   8. A Gujarati voice goes silent on acronyms like "PPE" -> they are spelled
      out in the voice's own letters, see spellOut(). One voice reads the whole
      sentence; the interviewer's voice is male wherever the phone has one.
*/
"use strict";

const Speech = (function () {

  const synth = window.speechSynthesis || null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  /* ---------------- Speaking (TTS) ---------------- */

  let voices = [];
  let primed = false;
  let speakToken = 0;          // each new speak() cancels the previous one
  let watchdog = null;

  function refreshVoices() {
    if (!synth) return;
    try { voices = synth.getVoices() || []; } catch (e) { voices = []; }
  }

  if (synth) {
    refreshVoices();
    if (typeof synth.addEventListener === "function") {
      synth.addEventListener("voiceschanged", refreshVoices);
    } else {
      synth.onvoiceschanged = refreshVoices;
    }
    // On some phones the event never fires - poll for a short while instead
    let tries = 0;
    const poll = setInterval(() => {
      refreshVoices();
      if (voices.length || ++tries > 10) clearInterval(poll);
    }, 400);
  }

  function normLang(l) { return String(l || "").toLowerCase().replace("_", "-"); }

  const VOICE_PREFS = {
    en: ["en-in", "en-gb", "en-au", "en-us", "en"],
    gu: ["gu-in", "gu"],
    hi: ["hi-in", "hi"]
  };

  /* The interviewer is a man, so the voice is male wherever the phone has one.
     The Web Speech API does not say which voices are male, so it is read from
     the name. These are the names in use on the phones and browsers this app
     meets: Android's Google voices (en-in-x-end, hi-in-x-hid ...), Windows and
     Edge (Ravi, Hemant, Madhur, Niranjan ...), and iOS (Rishi). A name that
     says "male" is taken at its word. Android's Gujarati voice names do not
     give the gender away, which is what the Profile setting is for. A phone with no male voice for a
     language still uses the voice it has, so the question is always heard;
     the Profile voice setting lets an instructor fix the choice by hand. */
  const MALE_HINTS = [
    /\bmale\b/, /\bman\b/,
    /x-end\b/, /x-ene\b/, /x-hid\b/, /x-hie\b/,
    /ravi\b/, /hemant/, /prabhat/, /madhur/, /niranjan/, /kunal/, /aarav/, /rishi\b/,
    /david\b/, /mark\b/, /guy\b/, /ryan\b/, /george\b/, /daniel\b/
  ];
  const FEMALE_HINTS = [
    /female/, /woman/,
    /x-ena\b/, /x-enc\b/, /x-ahp\b/, /x-cxx\b/, /x-hia\b/, /x-hic\b/,
    /heera/, /kalpana/, /swara/, /dhwani/, /neerja/, /lekha/, /veena/, /zira/, /hazel/, /susan/,
    /google हिन्दी/, /google hindi/, /google uk english female/
  ];

  function gender(v) {
    const n = String((v && v.name) || "").toLowerCase();
    if (FEMALE_HINTS.some(r => r.test(n))) return "f";
    if (MALE_HINTS.some(r => r.test(n))) return "m";
    return "?";
  }

  /* An instructor's own pick for this phone, from Profile -> Voice. Read
     through a hook so this file does not reach into the app's state. */
  let chosenName = () => "";
  function setChooser(fn) { if (typeof fn === "function") chosenName = fn; }

  /* All voices for a language, best first: male, then unknown, then female;
     within each, on-device (works offline) before network. */
  function voicesFor(lang) {
    if (!voices.length) refreshVoices();
    const prefs = VOICE_PREFS[lang] || VOICE_PREFS.en;
    for (const p of prefs) {
      const matches = voices.filter(v => v.lang && normLang(v.lang).indexOf(p) === 0);
      if (!matches.length) continue;
      const rank = v => ({ m: 0, "?": 1, f: 2 })[gender(v)] * 2 + (v.localService ? 0 : 1);
      return matches.slice().sort((a, b) => rank(a) - rank(b));
    }
    return [];
  }

  /* Voice selection:
     1. The voice an instructor chose for this language in Profile, if the
        phone still has it
     2. Otherwise the best match for the language (hi-in before hi), male
        first, on-device before network
     The student is never asked; the default works without anyone choosing. */
  function voiceFor(lang) {
    const list = voicesFor(lang);
    const want = chosenName(lang);
    if (want) {
      const hit = list.filter(v => v.name === want)[0];
      if (hit) return hit;
    }
    return list[0] || null;
  }

  /* Does this voice work without internet? (Google's voices run over the network) */
  function voiceIsOffline(lang) {
    const v = voiceFor(lang);
    return !!(v && v.localService);
  }

  /* Is a Gujarati voice installed? Without one the app stops speaking Gujarati */
  function hasVoice(lang) { return !!voiceFor(lang); }
  function supported() { return !!synth; }
  function micSupported() { return !!SR; }

  /* On Android the first speak() only works after a user tap - so wake it once on that tap */
  function prime() {
    if (primed || !synth) return;
    primed = true;
    try {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      synth.speak(u);
      synth.cancel();
    } catch (e) {}
  }

  /* Sentences end at . ! ? । followed by a space or the end. A full stop with
     no space after it is part of the word - "S.I.", "25.4", "F.P.S." - and
     cutting there made the voice say "25" and then "4" as separate sentences.
     (Old Android WebView has no lookbehind, hence the loop.) */
  function sentences(src) {
    const out = [];
    let start = 0;
    for (let i = 0; i < src.length; i++) {
      if (".!?।".indexOf(src[i]) >= 0 && (i + 1 === src.length || src[i + 1] === " ")) {
        out.push(src.slice(start, i + 1).trim());
        start = i + 1;
      }
    }
    if (start < src.length) out.push(src.slice(start).trim());
    return out.filter(Boolean);
  }

  /* Split long text into small chunks at sentence boundaries (Android truncates long text) */
  function toChunks(text, max) {
    max = max || 170;
    const out = [];
    const src = String(text).replace(/\s+/g, " ").trim();
    const parts = sentences(src);
    let buf = "";
    parts.forEach(p => {
      while (p.length > max) {                 // a very long sentence - break it at a comma
        let cut = p.lastIndexOf(",", max);
        if (cut < max * 0.4) cut = p.lastIndexOf(" ", max);
        if (cut < 1) cut = max;
        out.push(p.slice(0, cut).trim());
        p = p.slice(cut).trim();
      }
      if ((buf + " " + p).trim().length <= max) buf = (buf + " " + p).trim();
      else { if (buf) out.push(buf); buf = p; }
    });
    if (buf) out.push(buf);
    return out.filter(Boolean);
  }

  /* "PPE", "CNC", "ECG" are said letter by letter, but a voice reads them as
     a word - "PPE" came out as one mumbled syllable, and a Gujarati voice
     often said nothing at all. So short all-capital words are spelled out.
     For an English voice that is "P P E"; a Gujarati or Hindi voice gets the
     letters' names in its own script - "પી પી ઈ", "पी पी ई" - which it reads
     properly, so the whole sentence stays in ONE voice. (It used to switch to
     the English voice for every English word, which sounded like two people
     taking turns.)

     Capitals that ARE words in this app's banks (the CNC keys and modes,
     ON/OFF, MIG/TIG, AMBU, DOTS...) are left alone, and so is anything of five
     letters or more (RESET, RAPID, INPUT, NSAID); ABCDE and DRSABCD are letters.
     Letters mixed with digits are spelled when there are two letters or more
     (SPO2, PP2BS); a code like G01 or M03 reads fine as it is. */
  const AS_WORDS = new Set(("GO NO OK ON UP IN OUT OFF NOT SET KEY JOG CAT RAM RAY SUM PET DIN " +
    "SCAN AUTO DOWN EDIT HOME MODE PAGE SEND ZERO OMIT DOTS AMBU LASA DAMA MIG TIG GERD").split(" "));
  const SAY_AS = { RECV: "receive" };
  const SPELL_LONG = new Set(["ABCDE", "DRSABCD"]);

  const LETTER_NAMES = {
    gu: "એ બી સી ડી ઈ એફ જી એચ આઈ જે કે એલ એમ એન ઓ પી ક્યૂ આર એસ ટી યૂ વી ડબલ્યૂ એક્સ વાય ઝેડ".split(" "),
    hi: "ए बी सी डी ई एफ जी एच आई जे के एल एम एन ओ पी क्यू आर एस टी यू वी डब्ल्यू एक्स वाई ज़ेड".split(" ")
  };

  function spell(w, lang) {
    const names = LETTER_NAMES[lang];
    return w.split("").map(c => (names && c >= "A" && c <= "Z") ? names[c.charCodeAt(0) - 65] : c).join(" ");
  }

  function spellOut(text, lang) {
    return String(text).replace(/[A-Z0-9]*[A-Z][A-Z0-9]*/g, w => {
      if (SAY_AS[w]) return SAY_AS[w];
      const letters = w.replace(/[0-9]/g, "").length;
      if (letters < 2) return w;                                   // G01, M03, X40, A1
      if (/[0-9]/.test(w)) return spell(w, lang);                  // SPO2 -> S P O 2
      if (SPELL_LONG.has(w)) return spell(w, lang);
      if (w.length > 4 || AS_WORDS.has(w)) return w;
      return spell(w, lang);                                       // PPE -> P P E
    });
  }

  function clearWatchdog() { if (watchdog) { clearTimeout(watchdog); watchdog = null; } }

  /* Android hands cancel() to the speech engine a moment late. Speak again
     straight away - "Skip question" does exactly that - and the late cancel
     lands on the NEW utterance, so the next question lost its first words and
     only its second half was heard. After stopping something that was really
     playing, the next utterance waits this long for the cancel to settle. */
  const CANCEL_SETTLE_MS = 350;
  let settleUntil = 0;

  function hush() {
    if (!synth) return;
    if (isSpeaking()) settleUntil = Math.max(settleUntil, Date.now() + CANCEL_SETTLE_MS);
    try { synth.cancel(); } catch (e) {}
  }

  function cancelSpeech() {
    speakToken++;
    clearWatchdog();
    hush();
  }

  /* Speak text. Resolves TRUE only if the words actually reached the speaker,
     FALSE if nothing was heard - cancelled, no voice, or a device whose TTS
     engine fails every utterance instantly.

     That distinction matters to the caller. The app opens the microphone once
     the question has been asked, and on a phone with no working voice every
     utterance errors in milliseconds: the promise used to settle as success, so
     the app concluded the question had been asked and went straight to
     listening, having never said a word.

     opts = { lang:"en"|"gu", rate, onChunk }  */
  function speak(text, opts) {
    opts = opts || {};
    const lang = opts.lang || "en";
    const voice = voiceFor(lang);

    // With no Indian-language voice, say nothing - a voice for another language
    // mispronounces Gujarati/Hindi script and only confuses the student
    if (!synth || !text) return Promise.resolve(false);
    if ((lang === "gu" || lang === "hi") && !voice) return Promise.resolve(false);

    cancelSpeech();
    const token = speakToken;
    const chunks = toChunks(spellOut(String(text), lang))
      .map(c => ({ text: c, voice: voice, lang: lang }));
    const rate = opts.rate || (lang === "gu" ? 1 : 0.92);

    return new Promise(resolve => {
      let i = 0;
      let spoke = false;            // did any chunk actually reach the speaker?
      const done = ok => { if (token === speakToken) { clearWatchdog(); resolve(ok); } };

      function next() {
        if (token !== speakToken) return resolve(false);   // cancelled mid-way
        clearWatchdog();
        if (i >= chunks.length) return done(spoke);

        const item = chunks[i++];
        const part = item.text;
        const u = new SpeechSynthesisUtterance(part);
        /* Assigning the voice can throw if the browser will not accept the
           object. Left unguarded that rejects the promise, and the caller -
           which now waits on it to know whether the question was asked - waits
           for ever. Speaking in the default voice is a far better outcome. */
        try { if (item.voice) { u.voice = item.voice; u.lang = item.voice.lang; } } catch (e) {}
        u.rate = rate;
        u.pitch = 1;
        u.volume = 1;

        /* Move on even if onend never comes. The budget is how long the words
           take to say: about 12 letters a second in English, 8 in Gujarati
           and Hindi (vowel signs count as letters but take no time).

           It is counted from when the voice starts, not from when it was
           asked. Google's Gujarati voice runs over the network and can take
           a few seconds to begin; counting from the request cut a long
           question off part way through. Until it starts, the wait allows
           for that delay as well. */
        const cps = item.lang === "en" ? 12 : 8;
        const budget = (part.length / (cps * rate)) * 1000 + 3000;

        /* Each utterance moves the queue on once. Without this, the watchdog
           moving on and then the same utterance's late onend/onerror moving
           on again skipped the piece after it. */
        let settled = false;
        const advance = () => {
          if (settled) return;
          settled = true;
          next();
        };
        const stall = () => {
          if (settled || token !== speakToken) return;
          /* onend never came, but the budget is the time the words would have
             taken, so they were almost certainly heard. This is the Android
             quirk the watchdog exists for - not a failure. */
          spoke = true;
          settled = true;
          hush();
          next();
        };

        /* onstart, not onend, is what proves audio began. A cancel part way
           through still spoke the words that came before it, and on some phones
           an interrupted utterance reports onerror rather than onend - reading
           either of those as "nothing was said" would be wrong. */
        u.onstart = () => {
          spoke = true;
          if (settled || token !== speakToken) return;
          clearWatchdog();
          watchdog = setTimeout(stall, budget);
        };
        u.onend = advance;
        /* Stopped by a cancel that was not ours - a late one from before, or
           the engine clearing its queue. Our own cancels change the token or
           settle this piece first, so this one cut words the student never
           heard: say the piece again (twice at most) instead of moving on
           without it. Any other error: move on, never stall. */
        u.onerror = ev => {
          const why = ev && ev.error;
          if (!settled && token === speakToken &&
              (why === "interrupted" || why === "canceled") && (item.retries || 0) < 2) {
            settled = true;
            item.retries = (item.retries || 0) + 1;
            i--;
            clearWatchdog();
            settleUntil = Math.max(settleUntil, Date.now() + CANCEL_SETTLE_MS);
            next();
            return;
          }
          advance();
        };

        if (opts.onChunk) { try { opts.onChunk(part); } catch (e) {} }

        /* Wait out a cancel that has not settled yet, then speak */
        const go = () => {
          if (token !== speakToken) return resolve(false);   // cancelled while waiting
          if (settled) return;
          watchdog = setTimeout(stall, budget + 6000);
          try { synth.speak(u); } catch (e) { advance(); }
        };
        const wait = settleUntil - Date.now();
        if (wait > 0) setTimeout(go, wait);
        else go();
      }
      next();
    });
  }

  function isSpeaking() {
    try { return !!(synth && (synth.speaking || synth.pending)); } catch (e) { return false; }
  }

  /* ---------------- Listening (STT) ---------------- */

  let rec = null;
  let active = false;
  let committed = "";         // settled text from earlier recogniser sessions (+ seed)
  let sessionFinal = "";      // final text from the current session
  let interimText = "";       // interim text from the current session
  let lastVoiceAt = 0;
  let silenceTimer = null;
  let startTimer = null;
  let restarts = 0;
  let restartDelay = 0;       // back-off before restarting when the engine is not ready
  let handlers = {};
  const MAX_RESTARTS = 40;
  const SILENCE_TICK = 150;   // how often silence is checked

  function clearSilence() { if (silenceTimer) { clearInterval(silenceTimer); silenceTimer = null; } }
  function clearStartTimer() { if (startTimer) { clearTimeout(startTimer); startTimer = null; } }

  /* --- Joining the text together ---
     Some Android phones send the same sentence as "final" over and over as it
     grows ("I" -> "I am" -> "I am Prakash"), and resend the old sentence when the
     mic restarts. So rather than appending each new piece, we detect the part
     already written and skip it - otherwise the text doubles up on screen. */

  function toWords(s) { return String(s || "").trim().split(/\s+/).filter(Boolean); }

  /* A plain key for comparing words - lower case, no punctuation */
  function wordKey(w) { return String(w).toLowerCase().replace(/[.,!?;:।'"“”‘’()\-]/g, ""); }

  function sameRun(a, b) {
    for (let i = 0; i < a.length; i++) if (wordKey(a[i]) !== wordKey(b[i])) return false;
    return true;
  }

  /* Append piece after acc, without repeating anything */
  function mergeWords(acc, piece) {
    if (!piece.length) return acc;
    if (!acc.length) return piece;
    // piece extends acc -> keep the more complete piece
    if (piece.length >= acc.length && sameRun(acc, piece.slice(0, acc.length))) return piece;
    // piece is already inside acc -> nothing to add
    if (acc.length >= piece.length && sameRun(piece, acc.slice(0, piece.length))) return acc;
    // last n words of acc == first n of piece -> join, skipping those n
    const max = Math.min(acc.length, piece.length);
    for (let n = max; n > 0; n--) {
      if (sameRun(acc.slice(acc.length - n), piece.slice(0, n))) return acc.concat(piece.slice(n));
    }
    return acc.concat(piece);
  }

  /* The full heard text - rebuilt every time, never appended to in place */
  function fullText() {
    let w = mergeWords(toWords(committed), toWords(sessionFinal));
    w = mergeWords(w, toWords(interimText));
    return w.join(" ");
  }

  /* Move the current session's text into the permanent store (before the mic
     restarts).

     We keep the interim text, not only the final. When Android closes a session
     by itself the last phrase has often not been finalised - keeping only final
     text would lose that whole phrase and score half the student's answer.
     Interim text can be slightly rough, but rough words beat missing words.
     mergeWords keeps it from doubling up. */
  function commitSession() {
    committed = fullText();
    sessionFinal = "";
    interimText = "";
  }

  /* Roughly how long Android takes to reconnect to the recognition service when
     the mic restarts. If the silence window would expire within that time,
     restarting is pointless - the mic would be closed again before it is ready. */
  const RESTART_MS = 400;

  /* Is the answer finished, in hands-free mode? Yes if more than three words
     were spoken and the configured silence has passed since. Two places check
     this - the silence timer and the end of a session - so the rule lives here
     once. grace = how much earlier than the deadline to call it finished. */
  function answerDone(grace) {
    const ms = handlers.silenceMs;
    if (!ms) return false;                          // hands-free mode is off
    // Count exactly the text that will be submitted, interim included. Otherwise
    // auto-scoring never starts for a student whose answer never went final.
    if (toWords(fullText()).length < 3) return false;
    return Date.now() - lastVoiceAt > ms - (grace || 0);
  }

  function finish() {
    const t = fullText();
    stopListen(true);
    if (handlers.onSilence) handlers.onSilence(t);
  }

  /* On desktop Chrome, while speechSynthesis has not fully stopped, the mic opens
     but catches not a single word. So we wait for synth to go quiet before
     starting.

     Android goes one step further: even after onend, the TTS engine can hold on
     to the audio for a moment. Open the mic before it lets go and the first
     session dies instantly; the onend below reopens it, and the student hears an
     extra chime pair. That is what the pause below used to guard against.

     It is 0 now, deliberately. The pause sat between the end of the question and
     the mic actually opening, and students start talking the moment the question
     ends - so it was not a harmless wait, it was a gap that swallowed the first
     words of the answer. An extra chime is cheaper than lost words.

     Waiting for synth to go quiet at all is NOT optional and stays above: the
     mic must never be open while the speaker is playing, or it records the app
     talking to itself.

     If a device brings the triple chime back, this is the single number to
     raise - 300 is enough on most phones. */
  const SETTLE_MS = 0;        // pause after synth goes quiet, before opening the mic

  function whenSynthQuiet(cb) {
    clearStartTimer();
    if (!synth) { startTimer = setTimeout(cb, 0); return; }
    const t0 = Date.now();
    let quietAt = 0;                        // quiet since when
    (function wait() {
      // Still speaking (and not for too long yet) -> wait, and restart the pause
      if (isSpeaking() && Date.now() - t0 < 1200) {
        quietAt = 0;
        startTimer = setTimeout(wait, 60);
        return;
      }
      if (!quietAt) quietAt = Date.now();
      const left = SETTLE_MS - (Date.now() - quietAt);
      if (left > 0) { startTimer = setTimeout(wait, Math.min(left, 100)); return; }
      startTimer = setTimeout(cb, 0);
    })();
  }

  /* Start listening.
     opts = { lang, seed, silenceMs, onInterim, onFinal, onSilence, onError, onStart } */
  function listen(opts) {
    opts = opts || {};
    handlers = opts;

    if (!SR) { if (opts.onError) opts.onError("unsupported"); return false; }

    stopListen(true);
    if (isSpeaking()) cancelSpeech();     // stop the avatar first if it is speaking
    committed = opts.seed ? String(opts.seed).trim() : "";
    sessionFinal = "";
    interimText = "";
    restarts = 0;
    restartDelay = 0;
    active = true;
    lastVoiceAt = Date.now();

    whenSynthQuiet(() => {
      if (!active) return;
      lastVoiceAt = Date.now();           // time spent waiting does not count as silence
      startRecogniser();
    });

    // Silence detection - decides in hands-free mode whether the answer is done
    if (opts.silenceMs) {
      clearSilence();
      silenceTimer = setInterval(() => {
        if (active && answerDone()) finish();
      }, SILENCE_TICK);
    }
    return true;
  }

  /* Give up on listening and tell the app why. */
  function fail(why) {
    active = false;
    clearSilence();
    clearStartTimer();
    if (handlers.onError) handlers.onError(why);
  }

  /* Build a recogniser with every handler attached. Called once per answer -
     see startRecogniser for why it is not called per session. */
  function makeRecogniser() {
    let r;
    try { r = new SR(); } catch (e) { return null; }

    r.continuous = true;
    r.interimResults = true;
    r.lang = handlers.lang || "en-IN";
    r.maxAlternatives = 1;

    r.onstart = () => { if (handlers.onStart) handlers.onStart(); };

    r.onresult = ev => {
      // Rebuild from the whole results list - appending only the pieces after
      // resultIndex doubles the text on some phones
      let fin = [], inter = [];
      for (let i = 0; i < ev.results.length; i++) {
        const r = ev.results[i];
        const txt = r && r[0] && r[0].transcript ? r[0].transcript : "";
        if (!txt) continue;
        if (r.isFinal) fin = mergeWords(fin, toWords(txt));
        else inter = mergeWords(inter, toWords(txt));
      }
      const hadFinal = fin.length > 0;
      sessionFinal = fin.join(" ");
      interimText = inter.join(" ");
      if (hadFinal || inter.length) {
        lastVoiceAt = Date.now();
        // The mic is clearly working - so reset the restart tally. Otherwise a
        // student who speaks in pauses has their mic die on them mid-answer.
        restarts = 0;
      }
      if (handlers.onInterim) handlers.onInterim(fullText(), hadFinal);
    };

    r.onerror = ev => {
      const m = ev && ev.error ? String(ev.error) : "unknown";
      // These two are routine - they arrive while the student thinks, not errors
      if (m === "no-speech" || m === "aborted") return;
      fail(m);
    };

    // On Android the mic stops by itself despite continuous - so restart it
    r.onend = () => {
      if (!active) return;
      commitSession();                    // so a new session does not resend old text

      /* If the student's answer is already over there is no point restarting
         the mic. Restarting plays the chime, and a moment later the silence
         timer closes it again - so the moment they stop speaking they hear
         "chime on... chime off" and think the mic has gone wrong. Start scoring
         right here instead: the submitted text is identical, the useless chime
         is gone.

         The RESTART_MS grace is there because Android often ends the session
         just before the silence window expires. The mic could not even finish
         opening in that time, so there is nothing left for it to hear - only a
         chime to play. */
      if (answerDone(RESTART_MS)) return finish();

      if (++restarts > MAX_RESTARTS) return fail("too-many-restarts");

      // The mic is off for the whole of this delay - every word spoken in it is
      // lost. So restart with no delay at all. If the engine is still winding
      // down the old session, start() throws, and only then do we back off.
      clearStartTimer();
      startTimer = setTimeout(() => { if (active) startRecogniser(); }, restartDelay);
    };

    return r;
  }

  /* Open the mic, reusing the recogniser we already have.

     Every `new SpeechRecognition()` makes Android bind to its recognition
     service again, and that binding is the slowest part of reopening the mic.
     Between two sentences it is dead air, and dead air is words the student
     said and the app never heard. Calling start() on the instance we already
     have skips it, so one recogniser is kept for the whole answer and only
     stopListen() throws it away.

     Falling back to a fresh one still matters: an instance can end up wedged,
     and a restart loop that never rebuilds would never recover. So the first
     retry reuses, and any retry after that starts from a new instance - which
     is what the old code did every single time. */
  function startRecogniser() {
    if (!rec) {
      rec = makeRecogniser();
      if (!rec) return fail("start-failed");
    }

    try {
      rec.start();
      restartDelay = 0;
    } catch (e) {
      // Usually the engine is still winding the previous session down. Give it
      // a moment, doubling the wait so a genuine failure does not spin.
      if (restartDelay) {                 // already retried once - this one is wedged
        try { rec.onend = rec.onresult = rec.onerror = rec.onstart = null; } catch (e2) {}
        try { rec.abort && rec.abort(); } catch (e2) {}
        rec = null;
      }
      restartDelay = Math.min(restartDelay ? restartDelay * 2 : 50, 400);
      if (++restarts > MAX_RESTARTS) return fail("start-failed");
      clearStartTimer();
      startTimer = setTimeout(() => { if (active) startRecogniser(); }, restartDelay);
    }
  }

  /* Stop listening. With quiet = true, call no handler. */
  function stopListen(quiet) {
    active = false;
    clearSilence();
    clearStartTimer();
    // The recogniser is reused across sessions but not across answers, so this
    // is where it is let go; the next listen() builds a fresh one.
    if (rec) {
      try {
        rec.onend = rec.onresult = rec.onerror = rec.onstart = null;
        rec.stop();
      } catch (e) {}
      try { rec.abort && rec.abort(); } catch (e) {}
      rec = null;
    }
    const txt = fullText();
    if (!quiet && handlers.onFinal) handlers.onFinal(txt);
    return txt;
  }

  function isListening() { return active; }

  /* Stop both speaking and listening at once */
  function stopAll() { cancelSpeech(); stopListen(true); }

  return {
    // speaking
    speak, cancelSpeech, isSpeaking, prime, hasVoice, voiceFor, voiceIsOffline, supported, toChunks,
    voicesFor, gender, setChooser,
    // listening
    listen, stopListen, isListening, micSupported,
    // both
    stopAll
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { Speech };
