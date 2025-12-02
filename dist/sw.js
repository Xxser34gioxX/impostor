const CACHE_NAME = 'impostor-v2';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// A runtime cache for other requests (assets, API calls, etc.)
const RUNTIME = 'impostor-runtime';

// Install event - cache files
self.addEventListener('install', event => {
  // Pre-cache important app shell files
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Same-origin requests: try cache first, then network fallback
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(networkResponse => {
            // Don't cache opaque or error responses
            if (networkResponse && networkResponse.status === 200) {
              try {
                cache.put(event.request, networkResponse.clone());
              } catch (e) {
                // Some requests might be cross-origin or invalid to cache
              }
            }
            return networkResponse;
          }).catch(() => {
            // If both network and cache fail, show index.html for SPA navigation
            return caches.match('/index.html');
          });
        });
      })
    );
  } else {
    // For cross-origin resources, just try network then cache fallback
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
