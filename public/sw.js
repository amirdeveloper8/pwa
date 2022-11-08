self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing Service Worker", event);
});

self.addEventListener("active", (event) => {
  console.log("[Service Worker] Activating Service Worker", event);
  return self.clients.claim(); //make sure service worker are loaded or are activated correctly
});

self.addEventListener("fetch", (event) => {
  console.log("[Service Worker] fetching Service Worker", event);
  event.respondWith(fetch(event.request));
});
