// === OneSignal Service Worker (добавлено для push-уведомлений) ===
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// === Твой собственный код кеширования (без изменений) ===
const CACHE_NAME = 'slip-v3'; // Увеличьте версию, чтобы сбросить старый кэш

// Файлы, которые хотим закэшировать при установке
const PRECACHE_ASSETS = [
  './',
  './manifest.json',
  './icon.png' // если используете
];

self.addEventListener('install', event => {
  self.skipWaiting(); // сразу активировать новый SW
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('Не удалось закэшировать некоторые ресурсы:', err);
      });
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
  // Пропускаем POST-запросы и другие не-GET
  if (event.request.method !== 'GET') return;

  // Для навигации (HTML) всегда пытаемся получить свежую версию из сети
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./'))
    );
    return;
  }

  // Для остальных GET-запросов: сначала кэш, иначе сеть, и сохраняем в кэш
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Обновляем кэш в фоне
        fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      // Если нет в кэше – запрашиваем сеть и кэшируем
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => {
        // Для изображений можно вернуть заглушку, если нужно
        return new Response('', { status: 408 });
      });
    })
  );
});
