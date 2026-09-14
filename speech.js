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

  /* Good voices recognised by name, so that "Google Hindi" is the one picked
     when a phone carries more than one Hindi voice. The name is spelled in
     either script, so we check both. */
  const VOICE_NAMES = {
    hi: ["google हिन्दी", "google hindi"],
    gu: ["google ગુજરાતી", "google gujarati"]
  };

  function byName(list, names) {
    if (!names) return null;
    for (const n of names) {
      const hit = list.filter(v => String(v.name || "").toLowerCase().indexOf(n) >= 0)[0];
      if (hit) return hit;
    }
    return null;
  }

  /* Voice selection order:
     1. Exact language match (hi-in first, then hi)
     2. Of those, an on-device (offline) voice first - it speaks without internet
     3. Failing that, a known-good voice by name (Google Hindi)
     4. Failing that, whichever comes first
     Design decision: the student is never asked to choose - the best voice is
     picked automatically, so a wrong choice is not even possible. */
  function pickVoice(prefs, names) {
    if (!voices.length) refreshVoices();
    for (const p of prefs) {
      const matches = voices.filter(v => v.lang && normLang(v.lang).indexOf(p) === 0);
      if (!matches.length) continue;
      const local = matches.filter(v => v.localService);
      if (local.length) return byName(local, names) || local[0];
      return byName(matches, names) || matches[0];
    }
    return null;
  }

  function voiceFor(lang) {
    return pickVoice(VOICE_PREFS[lang] || VOICE_PREFS.en, VOICE_NAMES[lang]);
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

  /* Split long text into small chunks at sentence boundaries (Android truncates long text) */
  function toChunks(text, max) {
    max = max || 170;
    const out = [];
    // Split into sentences (old Android WebView has no lookbehind, hence match)
    const src = String(text).replace(/\s+/g, " ").trim();
    const parts = (src.match(/[^.!?।]+[.!?।]*/g) || [src]).map(s => s.trim()).filter(Boolean);
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

  function clearWatchdog() { if (watchdog) { clearTimeout(watchdog); watchdog = null; } }

  function cancelSpeech() {
    speakToken++;
    clearWatchdog();
    if (!synth) return;
    try { synth.cancel(); } catch (e) {}
  }

  /* Speak text. Returns a Promise that settles when speaking finishes (or is
     cancelled).  opts = { lang:"en"|"gu", rate, onChunk }  */
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
    const chunks = toChunks(text);
    const rate = opts.rate || (lang === "gu" ? 1 : 0.92);

    return new Promise(resolve => {
      let i = 0;
      const done = ok => { if (token === speakToken) { clearWatchdog(); resolve(ok); } };

      function next() {
        if (token !== speakToken) return resolve(false);   // cancelled mid-way
        clearWatchdog();
        if (i >= chunks.length) return done(true);

        const part = chunks[i++];
        const u = new SpeechSynthesisUtterance(part);
        if (voice) { u.voice = voice; u.lang = voice.lang; }
        u.rate = rate;
        u.pitch = 1;
        u.volume = 1;
        u.onend = next;
        u.onerror = next;          // on error do not stall, move on

        if (opts.onChunk) { try { opts.onChunk(part); } catch (e) {} }

        // Move on even if onend never comes: roughly 12 chars a second, plus 4s slack
        const budget = (part.length / (12 * rate)) * 1000 + 4000;
        watchdog = setTimeout(() => {
          if (token !== speakToken) return;
          try { synth.cancel(); } catch (e) {}
          next();
        }, budget);

        try { synth.speak(u); } catch (e) { next(); }
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
    // listening
    listen, stopListen, isListening, micSupported,
    // both
    stopAll
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { Speech };
