// Change VERSION with every release. Never delete IndexedDB or other apps' caches.
const VERSION='toeic-beat-v6';
const ROOT=new URL('./',self.location).href;
const FILES=['./','index.html','styles.css','app.js','core.js','db.js','audio.js','tracks.js','words.json','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES.map(f=>new Request(new URL(f,ROOT).href,{cache:'reload'})))));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('toeic-beat-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||!u.href.startsWith(ROOT))return;e.respondWith(caches.open(VERSION).then(async c=>{const exact=await c.match(e.request,{ignoreSearch:true});if(exact)return exact;try{return await fetch(e.request);}catch(err){if(e.request.mode==='navigate')return c.match(ROOT+'index.html');throw err;}}));});
