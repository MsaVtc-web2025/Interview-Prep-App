/* અવતાર — સ્ક્રીન પર દેખાતો ઇન્ટરવ્યુ લેનાર.

   ફોટો `interviewer.jpg` માંથી આવે છે અને વિડિયો-કૉલ જેવી ટાઇલમાં દેખાય છે.
   ફોટો બદલવો હોય તો એ જ નામની ચોરસ ફાઇલ મૂકી દો — બીજું કંઈ બદલવું ન પડે.
   ફોટો ન મળે તો નીચે આપેલો SVG ચહેરો દેખાય છે, જેથી એપ કદી ખાલી ન લાગે.

   ફોટો હોઠ હલાવી શકતો નથી, તેથી અવતાર શું કરે છે તે નીચેના બૅજથી દેખાડીએ છીએ:
   speaking → અવાજની પટ્ટીઓ · listening → લાલ ટપકું · thinking → ત્રણ ટપકાં
*/
"use strict";

const Avatar = (function () {

  /* આર્ટિફેક્ટ બિલ્ડમાં ફોટો data: URI તરીકે અંદર જ મુકાય છે */
  const PHOTO = (typeof window !== "undefined" && window.AVATAR_PHOTO) || "./interviewer.jpg";

  /* ફોટો ન મળે તો આ ચહેરો — માથું ઉપર, ખભા નીચે */
  const FACE_SVG =
    '<svg viewBox="0 0 120 120" class="av-svg" aria-hidden="true">' +
      '<path   class="av-body" d="M16 116q0-32 44-32t44 32z"/>' +
      '<circle class="av-face" cx="60" cy="44" r="32"/>' +
      '<g class="av-eyes">' +
        '<ellipse class="av-eye" cx="49" cy="41" rx="3.8" ry="5"/>' +
        '<ellipse class="av-eye" cx="71" cy="41" rx="3.8" ry="5"/>' +
      '</g>' +
      '<path class="av-brow" d="M44 31q5-2.5 10 0"/>' +
      '<path class="av-brow" d="M66 31q5-2.5 10 0"/>' +
      '<ellipse class="av-mouth" cx="60" cy="58" rx="9" ry="2.6"/>' +
    '</svg>';

  const MARKUP =
    '<div class="av-frame">' +
      '<img class="av-photo" alt="" src="' + PHOTO + '">' +
      '<div class="av-fallback">' + FACE_SVG + '</div>' +
      '<span class="av-ring"></span><span class="av-ring2"></span>' +
    '</div>' +
    '<span class="av-badge">' +
      '<span class="b-speak"><i></i><i></i><i></i></span>' +
      '<span class="b-listen"></span>' +
      '<span class="b-think"><i></i><i></i><i></i></span>' +
    '</span>';

  let root = null, mouth = null, eyes = null, photoOk = true, state = "idle";
  let mouthTimer = null, blinkTimer = null;

  function mount(el) {
    root = el;
    root.className = "avatar is-idle";
    root.innerHTML = MARKUP;

    const img = root.querySelector(".av-photo");
    mouth = root.querySelector(".av-mouth");
    eyes = root.querySelector(".av-eyes");

    /* ફોટો ન લોડ થાય તો દોરેલા ચહેરા પર જાઓ */
    img.addEventListener("error", useFallback);
    if (img.complete && img.naturalWidth === 0) useFallback();

    scheduleBlink();
    return root;
  }

  function useFallback() {
    photoOk = false;
    if (root) root.classList.add("no-photo");
  }

  /* દોરેલો ચહેરો દેખાતો હોય ત્યારે આંખો પલકારે */
  function scheduleBlink() {
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(() => {
      if (!photoOk && eyes) {
        eyes.classList.add("blink");
        setTimeout(() => eyes && eyes.classList.remove("blink"), 150);
      }
      scheduleBlink();
    }, 2600 + Math.random() * 3800);
  }

  /* દોરેલા ચહેરાના હોઠ — ફોટો હોય ત્યારે જરૂર નથી */
  function startMouth() {
    stopMouth();
    if (photoOk) return;
    mouthTimer = setInterval(() => {
      if (!mouth) return;
      mouth.setAttribute("ry", (1.8 + Math.random() * 5.5).toFixed(1));
      mouth.setAttribute("rx", (7.5 + Math.random() * 3).toFixed(1));
    }, 115);
  }

  function stopMouth() {
    if (mouthTimer) { clearInterval(mouthTimer); mouthTimer = null; }
    if (mouth) { mouth.setAttribute("ry", "2.6"); mouth.setAttribute("rx", "9"); }
  }

  function setState(s) {
    if (!root || s === state) return;
    state = s;
    root.className = "avatar is-" + s + (photoOk ? "" : " no-photo");
    if (s === "speaking") startMouth(); else stopMouth();
  }

  function get() { return state; }

  function destroy() {
    clearTimeout(blinkTimer);
    stopMouth();
    root = mouth = eyes = null;
  }

  return { mount, setState, get, destroy };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { Avatar };
