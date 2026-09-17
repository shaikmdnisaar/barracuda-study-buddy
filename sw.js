// PWA service worker — enables offline caching + "Add to Home Screen"
const CACHE = 'bcv-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './data/playlist.js',
  './icons/icon128.png',
  './icons/icon48.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network-first for Firebase and JS modules, cache-first for static assets
  if (e.request.url.includes('gstatic.com') || e.request.url.includes('googleapis.com') || e.request.url.includes('firestore') || e.request.url.includes('firebase/')) {
    return; // let Firebase handle its own requests — always fetch fresh
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      if (resp.ok && e.request.method === 'GET') {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }).catch(() => cached))
  );
});