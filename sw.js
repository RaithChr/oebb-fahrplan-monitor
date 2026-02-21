const CACHE_NAME = 'oebb-monitor-v7';
const urlsToCache = [
  '/oebb/',
  '/oebb/index.php',
  '/oebb/style.css',
  '/oebb/script.js',
  '/oebb/fetch-departures.php',
  '/oebb/autocomplete.php'
];

// Installation - Cache die wichtigsten Dateien
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Aktivierung - Lösche alte Caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network First, dann Cache (für Live-Daten)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone der Response für Cache
        const responseClone = response.clone();
        
        // Nur erfolgreiche Responses cachen
        if (response.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Fallback auf Cache wenn offline
        return caches.match(event.request);
      })
  );
});
