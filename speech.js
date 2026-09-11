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

  function normLang(l) { return String(l || "").toLowerCase().replace("_", "-"); }

  const VOICE_PREFS = {
    en: ["en-in", "en-gb", "en-au", "en-us", "en"],
    gu: ["gu-in", "gu"],
    hi: ["hi-in", "hi"]
  };

  /* નામથી ઓળખીતા સારા વોઇસ. ફોનમાં એકથી વધુ હિન્દી વોઇસ હોય ત્યારે
     «Google हिन्दी» જ વપરાય તે માટે. નામ લિપિ પ્રમાણે બદલાય છે, તેથી
     બંને રીતે તપાસીએ છીએ. */
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

  /* વોઇસ પસંદ કરવાનો ક્રમ:
     1. ભાષા બરાબર મળે (hi-in પહેલાં, પછી hi)
     2. એમાંથી ફોનમાં જ ચાલતો (offline) વોઇસ પહેલો — ઇન્ટરનેટ વગર પણ બોલે
     3. offline ન હોય તો નામથી ઓળખીતો સારો વોઇસ (Google हिन्दी)
     4. તે પણ ન હોય તો જે મળે તે પહેલો
     ડિઝાઇનનો નિર્ણય: વિદ્યાર્થીને પસંદ કરવાનું આપતા નથી — જાતે જ સૌથી
     સારો વોઇસ લેવાય, જેથી ખોટો વોઇસ પસંદ થવાની શક્યતા જ ન રહે. */
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

  /* આ વોઇસ ઇન્ટરનેટ વગર બોલે છે? (Google ના વોઇસ નેટવર્ક પર ચાલે છે) */
  function voiceIsOffline(lang) {
    const v = voiceFor(lang);
    return !!(v && v.localService);
  }

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
  let committed = "";         // પહેલાંનાં recogniser સેશનનું પાકું લખાણ (+ seed)
  let sessionFinal = "";      // ચાલુ સેશનનું પાકું લખાણ
  let interimText = "";       // ચાલુ સેશનનું કામચલાઉ લખાણ
  let lastVoiceAt = 0;
  let silenceTimer = null;
  let startTimer = null;
  let restarts = 0;
  let handlers = {};
  const MAX_RESTARTS = 40;

  function clearSilence() { if (silenceTimer) { clearInterval(silenceTimer); silenceTimer = null; } }
  function clearStartTimer() { if (startTimer) { clearTimeout(startTimer); startTimer = null; } }

  /* --- લખાણ જોડવાનું કામ ---
     કેટલાક એન્ડ્રોઇડ ફોન એક જ વાક્ય વધતું વધતું ફરી ફરી «પાકું» તરીકે મોકલે છે
     («I» → «I am» → «I am Prakash») અને માઇક ફરી ચાલુ થાય ત્યારે જૂનું વાક્ય
     બીજી વાર મોકલે છે. તેથી નવો ટુકડો સીધો ઉમેરવાને બદલે, જે ભાગ પહેલેથી
     લખાયેલો છે તે ઓળખીને છોડી દઈએ છીએ — નહીં તો સ્ક્રીન પર લખાણ બમણું થાય. */

  function toWords(s) { return String(s || "").trim().split(/\s+/).filter(Boolean); }

  /* સરખામણી માટે શબ્દની સાદી ચાવી — નાના અક્ષર, વિરામચિહ્ન વગર */
  function wordKey(w) { return String(w).toLowerCase().replace(/[.,!?;:।'"“”‘’()\-]/g, ""); }

  function sameRun(a, b) {
    for (let i = 0; i < a.length; i++) if (wordKey(a[i]) !== wordKey(b[i])) return false;
    return true;
  }

  /* acc પછી piece જોડો, પણ પુનરાવર્તન વગર */
  function mergeWords(acc, piece) {
    if (!piece.length) return acc;
    if (!acc.length) return piece;
    // piece એ acc નો જ વિસ્તાર હોય → વધારે પૂરું piece રાખો
    if (piece.length >= acc.length && sameRun(acc, piece.slice(0, acc.length))) return piece;
    // piece પહેલેથી acc માં આવી ગયું છે → કંઈ ઉમેરવાનું નથી
    if (acc.length >= piece.length && sameRun(piece, acc.slice(0, piece.length))) return acc;
    // acc ના છેલ્લા n શબ્દ = piece ના પહેલા n શબ્દ → એટલા છોડીને જોડો
    const max = Math.min(acc.length, piece.length);
    for (let n = max; n > 0; n--) {
      if (sameRun(acc.slice(acc.length - n), piece.slice(0, n))) return acc.concat(piece.slice(n));
    }
    return acc.concat(piece);
  }

  /* આખું સાંભળેલું લખાણ — દર વખતે ફરીથી બનાવીએ, જૂનામાં ઉમેરતા નથી */
  function fullText() {
    let w = mergeWords(toWords(committed), toWords(sessionFinal));
    w = mergeWords(w, toWords(interimText));
    return w.join(" ");
  }

  /* ચાલુ સેશનનું લખાણ કાયમી ખાતામાં નાખો (માઇક ફરી ચાલુ થાય તે પહેલાં).

     પાકું (final) લખાણ જ નહીં, કામચલાઉ (interim) પણ સાચવીએ છીએ. એન્ડ્રોઇડ
     સેશન જાતે બંધ કરે ત્યારે છેલ્લો વાક્યાંશ ઘણી વાર «પાકો» થયા વગર જ રહી
     જાય છે — ફક્ત પાકું લખાણ સાચવીએ તો એ આખો વાક્યાંશ ગુમ થઈ જાય, અને
     વિદ્યાર્થીનો અડધો જવાબ જ તપાસાય. કામચલાઉ લખાણ સહેજ કાચું હોઈ શકે, પણ
     ગુમ થયેલા શબ્દો કરતાં કાચા શબ્દો ઘણા સારા. mergeWords બેવડાતું ટાળે છે. */
  function commitSession() {
    committed = fullText();
    sessionFinal = "";
    interimText = "";
  }

  /* ડેસ્કટૉપ Chrome માં speechSynthesis પૂરું બંધ ન થયું હોય ત્યાં સુધી માઇક ચાલુ
     થાય પણ એક પણ શબ્દ પકડાતો નથી. તેથી synth શાંત થાય તેની રાહ જોઈને જ શરૂ કરીએ.

     એન્ડ્રોઇડમાં એક ડગલું આગળ છે: onend આવી ગયા પછી પણ TTS એન્જિન થોડી વાર
     ઑડિયોનો કબજો છોડતું નથી. એ છૂટે તે પહેલાં માઇક ચાલુ કરીએ તો પહેલું સેશન
     તરત જ મરી જાય અને નીચેનો onend એને ફરી ચાલુ કરે — વિદ્યાર્થીને «બીપ…
     બીપ… બીપ» એમ ત્રણ ટહુકા સંભળાય (ચાલુ, બંધ, ફરી ચાલુ), જોકે જવાબ પછી
     બરાબર પકડાય છે. તેથી synth શાંત *થઈ ગયા પછી* પણ થોડી વાર શાંત રહે તેની
     ખાતરી કરીને જ માઇક ખોલીએ છીએ. આ થોભો વિદ્યાર્થીને દેખાતો નથી, પણ
     વધારાના ટહુકા નીકળી જાય છે. */
  const SETTLE_MS = 600;      // synth શાંત થયા પછી માઇક ખોલતાં પહેલાંનો થોભો

  function whenSynthQuiet(cb) {
    clearStartTimer();
    if (!synth) { startTimer = setTimeout(cb, 0); return; }
    const t0 = Date.now();
    let quietAt = 0;                        // ક્યારથી શાંત છે
    (function wait() {
      // હજી બોલાય છે (અને બહુ વાર નથી થઈ) → રાહ જુઓ, અને થોભો ફરી શરૂ ગણો
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

  /* સાંભળવાનું શરૂ કરો.
     opts = { lang, seed, silenceMs, onInterim, onFinal, onSilence, onError, onStart } */
  function listen(opts) {
    opts = opts || {};
    handlers = opts;

    if (!SR) { if (opts.onError) opts.onError("unsupported"); return false; }

    stopListen(true);
    if (isSpeaking()) cancelSpeech();     // અવતાર બોલતો હોય તો પહેલાં બંધ કરો
    committed = opts.seed ? String(opts.seed).trim() : "";
    sessionFinal = "";
    interimText = "";
    restarts = 0;
    active = true;
    lastVoiceAt = Date.now();

    whenSynthQuiet(() => {
      if (!active) return;
      lastVoiceAt = Date.now();           // રાહ જોયેલો સમય મૌન ન ગણાય
      startRecogniser();
    });

    // મૌન પકડવા માટે — હાથ વગરના મોડમાં જવાબ પૂરો થયો કે નહીં તે નક્કી કરે
    if (opts.silenceMs) {
      clearSilence();
      silenceTimer = setInterval(() => {
        if (!active) return;
        // જે લખાણ મોકલવાનું છે તે જ ગણીએ — કામચલાઉ સહિત. નહીં તો જેનો આખો
        // જવાબ «પાકો» થયો ન હોય તે વિદ્યાર્થી માટે જાતે તપાસવાનું ચાલુ જ ન થાય.
        const words = toWords(fullText()).length;
        if (words >= 3 && Date.now() - lastVoiceAt > opts.silenceMs) {
          const t = fullText();
          stopListen(true);
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
      // આખી results યાદીમાંથી ફરીથી બનાવીએ — ફક્ત resultIndex પછીના ટુકડા
      // ઉમેરવાથી કેટલાક ફોનમાં લખાણ બમણું થઈ જાય છે
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
      if (hadFinal || inter.length) lastVoiceAt = Date.now();
      if (handlers.onInterim) handlers.onInterim(fullText(), hadFinal);
    };

    rec.onerror = ev => {
      const m = ev && ev.error ? String(ev.error) : "unknown";
      // આ બે સામાન્ય છે — વિદ્યાર્થી વિચારતો હોય ત્યારે આવે, ભૂલ ગણવાની જરૂર નથી
      if (m === "no-speech" || m === "aborted") return;
      active = false;
      clearSilence();
      clearStartTimer();
      if (handlers.onError) handlers.onError(m);
    };

    // એન્ડ્રોઇડમાં continuous હોવા છતાં માઇક જાતે બંધ થઈ જાય — તેથી ફરી ચાલુ કરીએ
    rec.onend = () => {
      if (!active) return;
      commitSession();                    // નવું સેશન જૂનું લખાણ ફરી ન મોકલે
      if (++restarts > MAX_RESTARTS) {
        active = false;
        clearSilence();
        if (handlers.onError) handlers.onError("too-many-restarts");
        return;
      }
      // આ થોભા દરમિયાન માઇક બંધ છે — વિદ્યાર્થી બોલતો રહે તો એટલા શબ્દો
      // ગુમ થાય. તેથી જૂનું સેશન સમેટાય એટલો જ થોભો રાખીએ, વધારે નહીં.
      clearStartTimer();
      startTimer = setTimeout(() => { if (active) startRecogniser(); }, 150);
    };

    try { rec.start(); } catch (e) { /* પહેલેથી ચાલુ હોય તો વાંધો નથી */ }
  }

  /* સાંભળવાનું બંધ કરો. quiet = true હોય તો કોઈ handler ન બોલાવો. */
  function stopListen(quiet) {
    active = false;
    clearSilence();
    clearStartTimer();
    if (rec) {
      try { rec.onend = null; rec.onresult = null; rec.onerror = null; rec.stop(); } catch (e) {}
      try { rec.abort && rec.abort(); } catch (e) {}
      rec = null;
    }
    const txt = fullText();
    if (!quiet && handlers.onFinal) handlers.onFinal(txt);
    return txt;
  }

  function isListening() { return active; }

  /* બોલવાનું અને સાંભળવાનું બંને તરત બંધ */
  function stopAll() { cancelSpeech(); stopListen(true); }

  return {
    // બોલવું
    speak, cancelSpeech, isSpeaking, prime, hasVoice, voiceFor, voiceIsOffline, supported, toChunks,
    // સાંભળવું
    listen, stopListen, isListening, micSupported,
    // બંને
    stopAll
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { Speech };
