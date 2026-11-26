// Compleat web app cache. The page and version.json always come from the network when it can be reached, so a new build
// shows up as soon as it is published. Everything else (art, sound, fonts) is served from the cache, and an asset is
// dropped from the cache when version.json says its contents changed.
const C='c75-cache';
const LIVE=/(\/|\/index\.html|\/version\.json|\/sw\.js|\/manifest\.webmanifest)$/;
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('message',e=>{const d=e.data;if(d&&d.t==='files')e.waitUntil(sync(d.files))});
async function sync(files){const c=await caches.open(C);const old=await c.match('__files');const of=old?await old.json():null;
 if(of)for(const k in of)if(of[k]!==files[k])await c.delete(new URL(k,self.registration.scope).href);
 await c.put('__files',new Response(JSON.stringify(files)))}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 if(u.pathname.endsWith('.apk')||r.headers.has('range')||r.destination==='audio'||r.destination==='video')return;
 if(r.mode==='navigate'||LIVE.test(u.pathname)){
  e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res.ok&&!u.search){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})
   .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match(new URL('./',self.registration.scope).href))));return}
 e.respondWith(caches.open(C).then(async c=>{const m=await c.match(r,{ignoreSearch:true});if(m)return m;const res=await fetch(r);if(res.ok&&res.status===200&&res.type==='basic')c.put(r,res.clone());return res}))});
