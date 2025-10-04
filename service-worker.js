const CACHE_NAME = 'safe-safari-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/weather.html',
  '/trips.html',
  '/premium.html',
  '/contact.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// التثبيت
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// التفعيل
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// استرجاع البيانات
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        
        return fetch(event.request).then(fetchResponse => {
          // حفظ في الكاش للمرة القادمة
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
      .catch(() => {
        // صفحة بديلة عند عدم توفر الإنترنت
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});
