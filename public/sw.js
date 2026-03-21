var CACHE = 'mediintake-v2';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (e.request.url.indexOf('supabase') > -1) return;
  if (e.request.url.indexOf('chrome-extension') > -1) return;

  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});
