const CACHE_NAME = "cerita-app-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.png",
  "/src/scripts/app.js",
  "/src/scripts/data/api.js",
  "/src/scripts/models/model.js",
  "/src/scripts/presenters/presenter.js",
  "/src/scripts/views/view.js",
  "/src/scripts/router.js",
  "/src/scripts/routes/routes.js",
  "/src/scripts/pages/login/login-page.js",
  "/src/scripts/pages/register/register-page.js",
  "/src/scripts/pages/stories/stories-page.js",
  "/src/scripts/pages/stories/detail-story-page.js",
  "/src/scripts/pages/add-story/add-story-page.js",
  "/src/scripts/pages/maps/maps-page.js",
  "/src/scripts/pages/saved-stories/saved-stories-page.js",
  "/src/scripts/pages/notifications/notifications-page.js",
  "/src/scripts/pages/about/about-page.js",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching files:", urlsToCache);
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("Failed to cache:", error);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log("Deleting old cache:", cache);
              return caches.delete(cache);
            }
          })
        );
      }),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log("Serving from cache:", event.request.url);
        return response;
      }
      console.log("Fetching from network:", event.request.url);
      return fetch(event.request).catch(() => {
        console.error("Network request failed, serving offline page");
        return caches.match("/index.html");
      });
    })
  );
});

self.addEventListener("push", (event) => {
  console.log("Push event received with data:", event.data);

  let data;
  try {
    data = event.data ? event.data.json() : {};
    console.log("Parsed push data:", data);
  } catch (error) {
    console.error("Failed to parse push data as JSON:", error);
    data = { title: "Notifikasi", options: { body: "Data notifikasi tidak valid." } };
    console.log("Fallback data used:", data);
  }

  const { title = "Notifikasi", options = { body: "Pesan default jika data kosong." } } = data;

  console.log("Showing notification with title:", title, "and options:", options);

  event.waitUntil(
    self.registration
      .showNotification(title, {
        ...options,
        icon: "/favicon.png",
        badge: "/favicon.png",
        vibrate: [200, 100, 200],
      })
      .catch((error) => {
        console.error("Failed to show notification:", error);
      })
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification);
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/").catch((error) => {
      console.error("Failed to open window:", error);
    })
  );
});

self.addEventListener("message", (event) => {
  console.log("Message received from client:", event.data);
});
