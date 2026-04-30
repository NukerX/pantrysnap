// PantrySnap service worker — minimal shell + recipes caching.
// Strategy:
//  - HTML/navigation: network-first, fallback to cache
//  - Static assets (_next/static, /icons, manifest, recipes JSON): stale-while-revalidate

const CACHE_VERSION = "v1";
const CACHE_NAME = `pantrysnap-${CACHE_VERSION}`;
const PRECACHE_URLS = ["/manifest.json", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("pantrysnap-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((m) => m || caches.match("/"))),
    );
    return;
  }

  // Static assets: stale-while-revalidate
  if (url.pathname.startsWith("/_next/") || url.pathname.match(/\.(png|svg|jpg|jpeg|webp|json|css|js|woff2?)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((response) => {
              if (response && response.status === 200) cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached);
          return cached || networkFetch;
        }),
      ),
    );
  }
});
