/* Gepuzzellig: zorgt dat de app ook zonder internet opent.
   Pagina's: eerst internet proberen (dan heb je altijd de nieuwste versie), anders de bewaarde kopie van die pagina.
   Geeft de site een foutpagina (bijv. als hij even stil staat), dan ook de bewaarde kopie.
   De Firebase-bestanden: de bewaarde kopie (die veranderen niet). De database zelf wordt niet aangeraakt. */
const C="gepuzzellig-v8";
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(["./","raadsels.html"].map(u=>c.add(u).catch(()=>{})))).catch(()=>{}));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const sleutel=r=>{const u=new URL(r.url);u.search="";u.hash="";if(u.pathname.endsWith("/index.html"))u.pathname=u.pathname.slice(0,-10);return u.href};
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
 if(u.origin===location.origin){
  e.respondWith((async()=>{const c=await caches.open(C),k=sleutel(r);
   const oud=async()=>await c.match(k)||(r.mode==="navigate"?await c.match(new URL("./",location).href):null);
   try{const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),4000);const res=await fetch(r,{signal:ctl.signal,cache:"no-store"});clearTimeout(t);
    if(res.ok){c.put(k,res.clone());return res}const hit=await oud();return hit||res}
   catch(err){const hit=await oud();if(hit)return hit;throw err}})());return}
 if(u.hostname==="www.gstatic.com"&&u.pathname.startsWith("/firebasejs/")){
  e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(r);if(hit)return hit;const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res}))}});
