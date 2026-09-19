/* Continuous dictation - one microphone, open from the first word to the button.

   Why this exists at all. Everything else in this app records speech through
   the browser's SpeechRecognition API, and on Android that API is not one
   continuous microphone: the platform ends the recognition session after every
   sentence, plays its own chime, and hands back control a moment later. The app
   reopens it immediately, but the moment in between is real, it is audible, and
   words spoken into it are gone. That behaviour belongs to Android and no
   setting in the Web Speech API turns it off - `continuous = true` is already
   set and ignored. Four rounds of tightening the restart made the gap smaller
   and never made it disappear, because the gap is not ours.

   So this module does not use that API at all. It opens ONE audio stream with
   getUserMedia and holds it for the whole answer. Nothing closes it, nothing
   restarts it, there are no sessions and therefore no gaps and no chimes. The
   student speaks for as long as they like, with whatever pauses they like, and
   the microphone is still the same microphone it was when they started. It is
   released only when they press the button.

   The cost of that: the browser is now only a recorder. Turning the audio into
   text happens on the server, so speech needs internet, and the recording of
   the student's voice leaves the phone to be transcribed. Neither is true of
   the SpeechRecognition path, which is why this is kept behind DICTATION_URL
   and off until that is filled in.

   Audio is sent as 16 kHz mono WAV, built here from the raw samples rather than
   taken from MediaRecorder. MediaRecorder on Android produces WebM/Opus, which
   is not one of the audio formats the transcription model accepts; WAV is, and
   building it ourselves means the format never depends on what a given phone
   happens to support.
*/
"use strict";

/* The Cloudflare Worker endpoint that turns audio into text. Empty means the
   whole feature is off and the app keeps using SpeechRecognition exactly as
   before. See backend/worker/README.md.
   Example: "https://interview-judge.<your-name>.workers.dev/transcribe" */
const DICTATION_URL = "";

const Dictation = (function () {

  const SAMPLE_RATE = 16000;      // what the transcription model wants
  const MAX_SECONDS = 180;        // a hard ceiling, so nothing can record forever
  const TIMEOUT_MS = 40000;       // upload + transcription; longer than judging

  let stream = null;              // the one open microphone
  let ctx = null;
  let source = null, processor = null, analyser = null;
  let chunks = [];                // captured audio, at the context's own rate
  let captured = 0;               // samples kept, for the length ceiling
  let recording = false;
  let startedAt = 0;
  let handlers = {};
  let levelTimer = null;

  function supported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia &&
              (window.AudioContext || window.webkitAudioContext));
  }

  function enabled() { return !!DICTATION_URL && supported(); }
  function active() { return recording; }
  function seconds() { return recording ? Math.round((Date.now() - startedAt) / 1000) : 0; }

  /* ---------------- capture ---------------- */

  /* Open the microphone and keep it open. Resolves true once audio is really
     flowing - the caller uses that to tell the student to start speaking, so it
     must not resolve early. */
  function start(opts) {
    handlers = opts || {};
    if (recording) return Promise.resolve(true);
    if (!enabled()) return Promise.resolve(false);

    chunks = [];
    captured = 0;

    return navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    }).then(s => {
      stream = s;
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();

      // Some phones hand back a suspended context until something resumes it.
      if (ctx.state === "suspended" && ctx.resume) { try { ctx.resume(); } catch (e) {} }

      source = ctx.createMediaStreamSource(stream);

      /* An analyser drives the level meter. It is the only thing the student
         has to tell them the mic is live, now that there is no interim text. */
      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      /* ScriptProcessor is deprecated in favour of AudioWorklet, but it needs no
         second file and works on every Android Chrome this app runs on. The work
         per block is a copy, so keeping it on the main thread is not a problem. */
      processor = ctx.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = ev => {
        if (!recording) return;
        const inBuf = ev.inputBuffer.getChannelData(0);
        if (captured / ctx.sampleRate >= MAX_SECONDS) return;   // ceiling reached, ignore the rest
        chunks.push(new Float32Array(inBuf));                   // copy: the buffer is reused
        captured += inBuf.length;
      };
      source.connect(processor);
      /* A ScriptProcessor only fires while it is connected to the destination.
         A zero gain node keeps it running without playing the student back to
         themselves through the speaker. */
      const mute = ctx.createGain();
      mute.gain.value = 0;
      processor.connect(mute);
      mute.connect(ctx.destination);

      recording = true;
      startedAt = Date.now();
      startLevelMeter();

      if (handlers.onLive) handlers.onLive();
      return true;
    }).catch(err => {
      teardown();
      const name = (err && err.name) || "unknown";
      if (handlers.onError) {
        // Map to the same reasons the SpeechRecognition path reports, so the
        // app's existing error messages keep working unchanged.
        handlers.onError(name === "NotAllowedError" || name === "SecurityError"
          ? "not-allowed"
          : name === "NotFoundError" ? "audio-capture" : "start-failed");
      }
      return false;
    });
  }

  function startLevelMeter() {
    stopLevelMeter();
    const buf = new Uint8Array(analyser.frequencyBinCount);
    levelTimer = setInterval(() => {
      if (!recording || !analyser) return;
      analyser.getByteTimeDomainData(buf);
      let peak = 0;
      for (let i = 0; i < buf.length; i++) {
        const d = Math.abs(buf[i] - 128);
        if (d > peak) peak = d;
      }
      if (handlers.onLevel) handlers.onLevel(Math.min(1, peak / 64));
      if (handlers.onTick) handlers.onTick(seconds());
    }, 100);
  }

  function stopLevelMeter() { if (levelTimer) { clearInterval(levelTimer); levelTimer = null; } }

  /* Let the microphone go. Kept separate from stop() because aborting must
     release the hardware without spending anything on transcription. */
  function teardown() {
    recording = false;
    stopLevelMeter();
    try { if (processor) { processor.onaudioprocess = null; processor.disconnect(); } } catch (e) {}
    try { if (source) source.disconnect(); } catch (e) {}
    try { if (analyser) analyser.disconnect(); } catch (e) {}
    try { if (stream) stream.getTracks().forEach(t => t.stop()); } catch (e) {}
    try { if (ctx && ctx.close) ctx.close(); } catch (e) {}
    processor = source = analyser = stream = ctx = null;
  }

  /* Throw the answer away and release the mic. Nothing is uploaded. */
  function abort() {
    chunks = [];
    captured = 0;
    teardown();
  }

  /* ---------------- audio -> WAV ---------------- */

  function flatten(list, total) {
    const out = new Float32Array(total);
    let at = 0;
    for (let i = 0; i < list.length; i++) { out.set(list[i], at); at += list[i].length; }
    return out;
  }

  /* Average down to SAMPLE_RATE. Averaging rather than picking every Nth sample
     keeps the aliasing out that would otherwise sound like a lisp to the model. */
  function downsample(data, from, to) {
    if (to >= from) return data;
    const ratio = from / to;
    const out = new Float32Array(Math.floor(data.length / ratio));
    for (let i = 0; i < out.length; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.min(data.length, Math.floor((i + 1) * ratio));
      let sum = 0, n = 0;
      for (let j = start; j < end; j++) { sum += data[j]; n++; }
      out[i] = n ? sum / n : 0;
    }
    return out;
  }

  function toWav(samples, rate) {
    const bytes = samples.length * 2;
    const buf = new ArrayBuffer(44 + bytes);
    const v = new DataView(buf);
    const str = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };

    str(0, "RIFF");
    v.setUint32(4, 36 + bytes, true);
    str(8, "WAVE");
    str(12, "fmt ");
    v.setUint32(16, 16, true);          // PCM header size
    v.setUint16(20, 1, true);           // PCM
    v.setUint16(22, 1, true);           // mono
    v.setUint32(24, rate, true);
    v.setUint32(28, rate * 2, true);    // byte rate
    v.setUint16(32, 2, true);           // block align
    v.setUint16(34, 16, true);          // bits per sample
    str(36, "data");
    v.setUint32(40, bytes, true);

    let off = 44;
    for (let i = 0; i < samples.length; i++, off += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buf;
  }

  function toBase64(buf) {
    const b = new Uint8Array(buf);
    let s = "";
    // In blocks: one apply() over a megabyte of samples blows the argument limit.
    for (let i = 0; i < b.length; i += 0x8000) {
      s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    }
    return btoa(s);
  }

  /* ---------------- stop and transcribe ---------------- */

  /* Stop recording, release the mic, and resolve with the transcript.
     Never rejects: on any failure it resolves with "" and the caller falls back
     to whatever it already had, the same way judge.js degrades to the offline
     score. */
  function stop() {
    if (!recording) return Promise.resolve("");

    const rate = ctx ? ctx.sampleRate : SAMPLE_RATE;
    const audio = flatten(chunks, captured);
    chunks = [];
    teardown();

    if (!audio.length) return Promise.resolve("");

    const wav = toWav(downsample(audio, rate, SAMPLE_RATE), SAMPLE_RATE);
    const payload = {
      audio: toBase64(wav),
      mimeType: "audio/wav",
      lang: "en"                        // the student is practising English
    };

    let ctrl = null, timer = null;
    try { ctrl = new AbortController(); } catch (e) { ctrl = null; }
    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    };
    if (ctrl) {
      opts.signal = ctrl.signal;
      timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, TIMEOUT_MS);
    }

    return fetch(DICTATION_URL, opts)
      .then(res => (res && res.ok ? res.json() : null))
      .then(r => {
        const txt = r && typeof r.text === "string" ? r.text.replace(/\s+/g, " ").trim() : "";
        return txt;
      })
      .catch(() => "")
      .then(txt => { if (timer) clearTimeout(timer); return txt; });
  }

  return {
    enabled, supported, active, start, stop, abort, seconds, MAX_SECONDS, DICTATION_URL,
    // exposed for tests - a malformed WAV header is rejected by the model with
    // nothing on screen to say why, so it is worth checking byte by byte
    _wav: { toWav, downsample, toBase64, flatten }
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { Dictation };
