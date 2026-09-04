/* વાણી એન્જિન — બોલવું (Text to Speech) અને સાંભળવું (Speech to Text)
   બંને બ્રાઉઝરની Web Speech API વાપરે છે. કોઈ API કી કે સર્વરની જરૂર નથી.

   એન્ડ્રોઇડ Chrome ની જાણીતી મર્યાદાઓ અહીં સંભાળી લેવામાં આવી છે:
   1. getVoices() પહેલી વાર ખાલી યાદી આપે → voiceschanged પર ફરી વાંચીએ છીએ.
   2. પહેલી વાર બોલવા માટે વપરાશકર્તાનો ટૅપ જરૂરી → prime() વાપરીએ છીએ.
   3. લાંબું લખાણ વચ્ચેથી કપાઈ જાય → નાના ટુકડામાં વહેંચીને બોલીએ છીએ.
   4. onend કોઈ વાર આવતું જ નથી → વોચડોગ ટાઇમર રાખ્યો છે.
   5. continuous recognition એન્ડ્રોઇડમાં જાતે બંધ થઈ જાય → ફરી ચાલુ કરીએ છીએ.
   6. સ્પીકર ચાલુ હોય ત્યારે માઇક પોતાનો અવાજ સાંભળે → બંને કદી સાથે ચાલુ ન કરીએ.
*/
"use strict";

const Speech = (function () {

  const synth = window.speechSynthesis || null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  /* ---------------- બોલવું (TTS) ---------------- */

  let voices = [];
  let primed = false;
  let speakToken = 0;          // દરેક નવો speak() જૂનાને રદ કરે
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
    // કેટલાક ફોનમાં ઇવેન્ટ આવતો નથી — થોડી વાર જાતે ફરી વાંચીએ
    let tries = 0;
    const poll = setInterval(() => {
      refreshVoices();
      if (voices.length || ++tries > 10) clearInterval(poll);
    }, 400);
  }

  /* પસંદગીના ક્રમમાં પહેલો મળતો વોઇસ */
  function pickVoice(prefs) {
    if (!voices.length) refreshVoices();
    for (const p of prefs) {
      const v = voices.find(v => v.lang && v.lang.toLowerCase().replace("_", "-").indexOf(p) === 0);
      if (v) return v;
    }
    return null;
  }

  const VOICE_PREFS = {
    en: ["en-in", "en-gb", "en-au", "en-us", "en"],
    gu: ["gu-in", "gu"],
    hi: ["hi-in", "hi"]
  };

  function voiceFor(lang) { return pickVoice(VOICE_PREFS[lang] || VOICE_PREFS.en); }

  /* ગુજરાતી વોઇસ ફોનમાં નાખેલો છે કે નહીં — ન હોય તો એપ ગુજરાતી બોલવાનું છોડી દે છે */
  function hasVoice(lang) { return !!voiceFor(lang); }
  function supported() { return !!synth; }
  function micSupported() { return !!SR; }

  /* એન્ડ્રોઇડમાં પહેલો speak() વપરાશકર્તાના ટૅપ પછી જ ચાલે — તેથી ટૅપ વખતે એક વાર જગાડી લઈએ */
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

  /* લાંબા લખાણને વાક્ય પ્રમાણે નાના ટુકડામાં વહેંચો (એન્ડ્રોઇડ લાંબું લખાણ કાપી નાખે છે) */
  function toChunks(text, max) {
    max = max || 170;
    const out = [];
    // વાક્યો છૂટાં પાડો (જૂના એન્ડ્રોઇડ WebView માં lookbehind ચાલતું નથી, તેથી match વાપર્યું)
    const src = String(text).replace(/\s+/g, " ").trim();
    const parts = (src.match(/[^.!?।]+[.!?।]*/g) || [src]).map(s => s.trim()).filter(Boolean);
    let buf = "";
    parts.forEach(p => {
      while (p.length > max) {                 // ખૂબ લાંબું વાક્ય — અલ્પવિરામ પર તોડો
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

  /* text બોલો. Promise પાછું આપે જે બોલવાનું પૂરું થાય (કે રદ થાય) ત્યારે પૂરું થાય.
     opts = { lang:"en"|"gu", rate, onChunk }  */
  function speak(text, opts) {
    opts = opts || {};
    const lang = opts.lang || "en";
    const voice = voiceFor(lang);

    // ભારતીય ભાષાનો વોઇસ ન હોય તો બોલવાનું છોડી દો — બીજી ભાષાનો વોઇસ
    // ગુજરાતી/હિન્દી લિપિ ખોટી બોલે અને વિદ્યાર્થી ગૂંચવાય
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
        if (token !== speakToken) return resolve(false);   // વચ્ચે રદ થયું
        clearWatchdog();
        if (i >= chunks.length) return done(true);

        const part = chunks[i++];
        const u = new SpeechSynthesisUtterance(part);
        if (voice) { u.voice = voice; u.lang = voice.lang; }
        u.rate = rate;
        u.pitch = 1;
        u.volume = 1;
        u.onend = next;
        u.onerror = next;          // ભૂલ આવે તો અટકી ન રહો, આગળ વધો

        if (opts.onChunk) { try { opts.onChunk(part); } catch (e) {} }

        // onend ન આવે તો પણ આગળ વધીએ: અંદાજે ૧૨ અક્ષર પ્રતિ સેકન્ડ + ૪ સેકન્ડ છૂટ
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

  /* ---------------- સાંભળવું (STT) ---------------- */

  let rec = null;
  let active = false;
  let finalText = "";
  let interimText = "";
  let lastVoiceAt = 0;
  let silenceTimer = null;
  let restarts = 0;
  let handlers = {};
  const MAX_RESTARTS = 40;

  function clearSilence() { if (silenceTimer) { clearInterval(silenceTimer); silenceTimer = null; } }

  function fullText() { return (finalText + " " + interimText).replace(/\s{2,}/g, " ").trim(); }

  /* સાંભળવાનું શરૂ કરો.
     opts = { lang, seed, silenceMs, onInterim, onFinal, onSilence, onError, onStart } */
  function listen(opts) {
    opts = opts || {};
    handlers = opts;

    if (!SR) { if (opts.onError) opts.onError("unsupported"); return false; }
    if (isSpeaking()) cancelSpeech();     // અવતાર બોલતો હોય તો પહેલાં બંધ કરો

    stopListen(true);
    finalText = opts.seed ? String(opts.seed).replace(/\s+$/, "") + " " : "";
    interimText = "";
    restarts = 0;
    active = true;
    lastVoiceAt = Date.now();

    startRecogniser();

    // મૌન પકડવા માટે — હાથ વગરના મોડમાં જવાબ પૂરો થયો કે નહીં તે નક્કી કરે
    if (opts.silenceMs) {
      clearSilence();
      silenceTimer = setInterval(() => {
        if (!active) return;
        const words = finalText.trim().split(/\s+/).filter(Boolean).length;
        if (words >= 3 && Date.now() - lastVoiceAt > opts.silenceMs) {
          const t = fullText();
          stopListen();
          if (handlers.onSilence) handlers.onSilence(t);
        }
      }, 400);
    }
    return true;
  }

  function startRecogniser() {
    try {
      rec = new SR();
    } catch (e) {
      active = false;
      if (handlers.onError) handlers.onError("start-failed");
      return;
    }
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = handlers.lang || "en-IN";
    rec.maxAlternatives = 1;

    rec.onstart = () => { if (handlers.onStart) handlers.onStart(); };

    rec.onresult = ev => {
      let fin = "", inter = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) fin += t + " "; else inter += t;
      }
      if (fin) finalText += fin;
      interimText = inter;
      if (fin || inter) lastVoiceAt = Date.now();
      if (handlers.onInterim) handlers.onInterim(fullText(), !!fin);
    };

    rec.onerror = ev => {
      const m = ev && ev.error ? String(ev.error) : "unknown";
      // આ બે સામાન્ય છે — વિદ્યાર્થી વિચારતો હોય ત્યારે આવે, ભૂલ ગણવાની જરૂર નથી
      if (m === "no-speech" || m === "aborted") return;
      active = false;
      clearSilence();
      if (handlers.onError) handlers.onError(m);
    };

    // એન્ડ્રોઇડમાં continuous હોવા છતાં માઇક જાતે બંધ થઈ જાય — તેથી ફરી ચાલુ કરીએ
    rec.onend = () => {
      if (!active) return;
      if (++restarts > MAX_RESTARTS) {
        active = false;
        clearSilence();
        if (handlers.onError) handlers.onError("too-many-restarts");
        return;
      }
      setTimeout(() => { if (active) startRecogniser(); }, 250);
    };

    try { rec.start(); } catch (e) { /* પહેલેથી ચાલુ હોય તો વાંધો નથી */ }
  }

  /* સાંભળવાનું બંધ કરો. quiet = true હોય તો કોઈ handler ન બોલાવો. */
  function stopListen(quiet) {
    active = false;
    clearSilence();
    if (rec) {
      try { rec.onend = null; rec.stop(); } catch (e) {}
      try { rec.abort && rec.abort(); } catch (e) {}
      rec = null;
    }
    if (!quiet && handlers.onFinal) handlers.onFinal(fullText());
    return fullText();
  }

  function isListening() { return active; }

  /* બોલવાનું અને સાંભળવાનું બંને તરત બંધ */
  function stopAll() { cancelSpeech(); stopListen(true); }

  return {
    // બોલવું
    speak, cancelSpeech, isSpeaking, prime, hasVoice, supported, toChunks,
    // સાંભળવું
    listen, stopListen, isListening, micSupported,
    // બંને
    stopAll
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { Speech };
