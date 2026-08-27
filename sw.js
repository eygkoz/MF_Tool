// Service worker for GRF000113008 Tactical Decision Tool
// Served under the /MF_Tool/ project-page path on GitHub Pages.
// Bump CACHE_NAME on every deploy so old clients pick up new files instead
// of being served stale cached versions forever.
const CACHE_NAME = "athex-tool-v1";

const APP_SHELL = [
  "/MF_Tool/",
  "/MF_Tool/manifest.json",
  "/MF_Tool/icons/icon-192.png",
  "/MF_Tool/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Cache-first for the app shell (this is an offline/on-device tool per its
// own header comment), falling back to network, and updating the cache
// with whatever the network returns so the next launch has the latest copy.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // offline and not cached: nothing we can do

      return cached || networkFetch;
    })
  );
});
