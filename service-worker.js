const CACHE_NAME="billing-v1";

const urlsToCache=[
"./",
"./index.html",
"./style.css",
"./app.js",
"./manifest.json",
"./icon.png"
];

self.addEventListener("install",event=>{
event.waitUntil(
caches.open(CACHE_NAME)
.then(cache=>cache.addAll(urlsToCache))
);
self.skipWaiting();
});

self.addEventListener("activate",event=>{
event.waitUntil(
caches.keys().then(keys=>{
return Promise.all(
keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
);
})
);
self.clients.claim();
});

self.addEventListener("fetch",event=>{
event.respondWith(
caches.match(event.request)
.then(res=>res||fetch(event.request))
);
});
