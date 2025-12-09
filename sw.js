const CACHE_NAME = "kasam-cache-v1";
const OFFLINE_URLS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js"
];

// Install – cacha grundfiler
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

// Aktivera – rensa gamla cache-versioner om du byter namn
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// Fetch – försök nätet först, fall tillbaka på cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
