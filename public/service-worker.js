// Basic service worker for caching static assets
const CACHE_NAME = 'anucios-mz-cache-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Precache root and any other core assets you want available offline
      return cache.addAll([
        OFFLINE_URL,
        '/index.html'
      ].filter(Boolean));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Try network first, fallback to cache
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      // Put a copy in the cache
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => {
      return caches.match(event.request).then(match => match || caches.match(OFFLINE_URL));
    })
  );
});
