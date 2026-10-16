/* dbn service worker: app shell offline, fast repeat visits. Bump VERSION to force a refresh. */
var VERSION='dbn-v1',SHELL=['./','index.html','manifest.webmanifest','portrait-720.jpg','f-inter.woff2','f-instrument-serif.woff2','f-instrument-serif-italic.woff2','f-jetbrains-mono.woff2','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==VERSION}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!=='GET')return;var u=new URL(r.url);if(u.origin!==location.origin)return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(VERSION).then(function(c){c.put('index.html',cp)});return res}).catch(function(){return caches.match('index.html')}));return}
 e.respondWith(caches.match(r).then(function(hit){var net=fetch(r).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(VERSION).then(function(c){c.put(r,cp)})}return res}).catch(function(){return hit});return hit||net}))});
