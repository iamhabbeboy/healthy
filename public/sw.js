const staticDevCoffee = "healthy-v1"
const assets = [
    "/",
    "/index.html",
    "/images/icon-72x72.png",
    "/images/icon-96x96.png",
    "/images/icon-128x128.png",
    "/images/icon-144x144.png",
    "/images/icon-152x152.png",
    "/images/icon-192x192.png",
    "/images/icon-512x512.png",
]

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(staticDevCoffee).then(cache => {
            cache.addAll(assets)
        })
    )
})
self.addEventListener("activate", event => {
    console.log('Activate!');
});

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request)
        })
    )
})