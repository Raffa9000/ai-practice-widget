// --- sw.js (PWA Service Worker) ---
// Bump CACHE when you want clients to fetch a fresh shell
const CACHE = 'ai-coach-v3';
const ROOT = '/ai-practice-widget/';
const PRECACHE = [
  ROOT,
  ROOT + 'index.html?v=3',
  ROOT + 'manifest.webmanifest?v=3'
];

// Allow the page to tell us to activate immediately
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  // Don’t call skipWaiting here; allow page to trigger when ready
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Network-first with cache fallback
self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    fetch(req)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return resp;
      })
      .catch(() => caches.match(req))
  );
});
