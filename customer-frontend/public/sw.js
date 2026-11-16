// Lightweight PWA Service Worker for Basaveshwara Dabha Customer App
const CACHE_NAME = 'bd-customer-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network requests pass through cleanly
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
