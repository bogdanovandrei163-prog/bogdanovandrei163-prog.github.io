const CACHE_NAME = 'slip-v2'; // Увеличивайте версию при каждом важном обновлении

self.addEventListener('install', event => {
  self.skipWaiting(); // Сразу активировать новый Service Worker
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        './',
        './manifest.json'
        // Не кэшируем index.html, чтобы он всегда загружался с сервера
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Для навигации (HTML) всегда обращаемся к сети
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }
  // Для остальных ресурсов – кэш, но с обновлением
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
      return cached || fetched;
    })
  );
});