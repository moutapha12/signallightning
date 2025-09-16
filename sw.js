// --- Kaolack PWA service worker ---
// Incrémente la version à chaque déploiement pour forcer l'update du cache
const CACHE_NAME = "kaolack-v6";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo-salvi.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

// Requêtes à ne jamais servir depuis le cache
function isBypassCache(req) {
  const url = new URL(req.url);

  // Méthodes non-GET -> réseau
  if (req.method !== "GET") return true;

  // API Supabase (REST/Realtime/Auth) -> toujours réseau
  if (url.host.endsWith("supabase.co")) return true;

  // Tuiles OpenStreetMap / Leaflet -> réseau
  if (url.host.includes("tile.openstreetmap.org")) return true;

  // Par défaut, on ne bypass pas
  return false;
}

// Ne cache que les réponses valides (status 200 & type "basic" = même origine)
function shouldCacheResponse(res) {
  return !!res && res.status === 200 && res.type === "basic";
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// support “skipWaiting” manuel depuis la page (facultatif)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // 0) Bypass global pour non-GET, Supabase, OSM, etc.
  if (isBypassCache(req)) {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  const url = new URL(req.url);

  // 1) Navigation SPA : network-first vers index.html
  //   - couvre "/" / "/index.html" et toutes les routes futures
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // On met en cache le dernier index pour offline
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put("./index.html", clone));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // 2) Cache-first pour tout le reste (fichiers statiques, images locales…)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      // Miss: on va au réseau, et on ré-alimente le cache si pertinent
      return fetch(req).then((res) => {
        if (shouldCacheResponse(res)) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, resClone));
        }
        return res;
      }).catch(() => {
        // Fallback minimal : si la ressource demandée est l’HTML, renvoyer index
        if (req.headers.get("accept")?.includes("text/html")) {
          return caches.match("./index.html");
        }
        // sinon on laisse échouer (ou tu peux renvoyer une image/asset par défaut)
        return Promise.reject(new Error("Network error and no cache match"));
      });
    })
  );
});
