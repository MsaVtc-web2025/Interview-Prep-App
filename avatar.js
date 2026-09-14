/* Avatar — the interviewer the student sees on screen.

   The photo comes from `interviewer.jpg` and sits in a video-call style tile.
   To change it, drop in a square file with the same name — nothing else to edit.
   If the photo is missing, the SVG face below is shown instead, so the app
   never looks empty.

   A photo cannot move its lips, so the badge below shows what the avatar is
   doing: speaking -> sound bars, listening -> red dot, thinking -> three dots.
*/
"use strict";

const Avatar = (function () {

  /* In the artifact build the photo is inlined as a data: URI */
  const PHOTO = (typeof window !== "undefined" && window.AVATAR_PHOTO) || "./interviewer.jpg";

  /* Shown when there is no photo — head on top, shoulders below */
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

    /* Fall back to the drawn face if the photo fails to load */
    img.addEventListener("error", useFallback);
    if (img.complete && img.naturalWidth === 0) useFallback();

    scheduleBlink();
    return root;
  }

  function useFallback() {
    photoOk = false;
    if (root) root.classList.add("no-photo");
  }

  /* Blink the eyes while the drawn face is showing */
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

  /* Lips on the drawn face — not needed when there is a photo */
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
