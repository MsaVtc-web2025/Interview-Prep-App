/* Service worker — caches everything so the app works with no internet.
   NOTE: bump CACHE whenever any file below changes, otherwise installed
   phones keep running the old version. */
const CACHE = "interview-practice-v7";

const ASSETS = [
  "./",
  "./index.html",
  "./i18n.js",
  "./i18n-content.js",
  "./courses.js",
  "./questions.js",
  "./bank-computer.js",
  "./bank-cnc.js",
  "./bank-electrician.js",
  "./bank-automotive.js",
  "./bank-evehicle.js",
  "./bank-nursing.js",
  "./bank-welding.js",
  "./scoring.js",
  "./speech.js",
  "./avatar.js",
  "./app.js",
  "./manifest.webmanifest",
  "./interviewer.jpg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", ev => {
  ev.waitUntil(
    caches.open(CACHE)
      // one missing file must not break the whole install
      .then(c => Promise.all(ASSETS.map(a => c.add(a).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", ev => {
  if (ev.request.method !== "GET") return;

  /* App shell: network first, so a new version reaches students as soon as
     they open the app online. Falls back to cache when offline. */
  if (ev.request.mode === "navigate") {
    ev.respondWith(
      fetch(ev.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(ev.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(ev.request).then(hit => hit || caches.match("./index.html")))
    );
    return;
  }

  /* Everything else: cache first — the app has no server data. */
  ev.respondWith(
    caches.match(ev.request).then(hit => {
      if (hit) return hit;
      return fetch(ev.request)
        .then(res => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(ev.request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
