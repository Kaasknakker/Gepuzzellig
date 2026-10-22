/* Gepuzzellig: offline app-shell + altijd eerst de nieuwste online versie.
   Oude Gepuzzellig-caches worden bij activatie opgeruimd; andere caches op hetzelfde domein laten we met rust. */
const PREFIX="gepuzzellig-";
const C=PREFIX+"v67";

const sleutel=r=>{const u=new URL(r.url);u.search="";u.hash="";if(u.pathname.endsWith("/index.html"))u.pathname=u.pathname.slice(0,-10);return u.href};

self.addEventListener("install",e=>{
 e.waitUntil((async()=>{
  const c=await caches.open(C);
  await Promise.all(["./","raadsels.html","admin.html"].map(async u=>{
   try{
    const req=new Request(new URL(u,self.registration.scope),{cache:"reload"});
    const res=await fetch(req);
    if(res.ok)await c.put(sleutel(req),res.clone());
   }catch(err){}
  }));
 })());
 self.skipWaiting();
});

self.addEventListener("activate",e=>{
 e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith(PREFIX)&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
 if(u.origin===location.origin){
  e.respondWith((async()=>{
   const c=await caches.open(C),k=sleutel(r);
   const oud=async()=>await c.match(k)||(r.mode==="navigate"?await c.match(new URL("./",location).href):null);
   try{
    const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),4000);
    const res=await fetch(r,{signal:ctl.signal,cache:"no-store"});clearTimeout(t);
    if(res.ok){c.put(k,res.clone());return res}
    const hit=await oud();return hit||res;
   }catch(err){const hit=await oud();if(hit)return hit;throw err}
  })());
  return;
 }
 if(u.hostname==="www.gstatic.com"&&u.pathname.startsWith("/firebasejs/")){
  e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(r);if(hit)return hit;const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res}));
 }
});