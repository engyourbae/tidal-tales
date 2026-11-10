const CACHE='tidal-tales-v18';
const PRE=['./','index.html','manifest.webmanifest','data/fish_catalog.csv','data/gear.csv','data/menus.csv','data/locations.csv','data/autofish.csv','data/topup.csv','icon-192.png','icon-512.png','logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 if(/\/audio\//.test(new URL(r.url).pathname))return; // audio langsung dari jaringan (streaming/Range), tidak lewat cache
 e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))))});
