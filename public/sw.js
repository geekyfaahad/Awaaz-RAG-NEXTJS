self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch handler
  // Required by Chrome to recognize the app as an installable PWA
  return;
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
