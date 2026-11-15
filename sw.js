/* L'Atelier du Cartable - Service Worker, version 3 fichiers */
const CACHE = 'atelier-cartable-v3';
const CORE = ['./', './index.html', './manifest.webmanifest'];
self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(CORE); }).then(function() { return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) { return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })); }).then(function() { return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e) {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(function() { return caches.match('./index.html'); }));
    return;
  }
  var url = new URL(e.request.url);
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(e.request).then(function(hit) {
      if (hit) return hit;
      return fetch(e.request).then(function(res) {
        var copy = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, copy); });
        return res;
      });
    }).catch(function() { return caches.match(e.request); }));
    return;
  }
  e.respondWith(fetch(e.request).catch(function() { return caches.match(e.request); }));
});