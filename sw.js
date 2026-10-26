/* Gepuzzellig service worker.
   - Pagina's (index, raadsels, admin): eerst online proberen (dan heb je altijd de nieuwste versie), anders de bewaarde kopie.
   - Bestanden met een versienummer (css/app.css?v=…, js/…?v=…): per exacte versie bewaard en daaruit geserveerd.
     Zo draait een pagina altijd met precies de scripts van haar eigen versie; nooit een mix van oud en nieuw.
   - Een nieuwe worker neemt meteen over, maar de app herlaadt daarvoor niet terwijl je bezig bent (zie core.js).
   Oude Gepuzzellig-caches worden bij activatie opgeruimd; andere caches op hetzelfde domein laten we met rust. */
const PREFIX="gepuzzellig-";
const C=PREFIX+"v227";
const PAGES=["./","raadsels.html","admin.html","verhaal.html"];

/* Pagina's: sleutel zonder ?zoekdeel (en index.html = ./). Versiebestanden: de volledige url, inclusief ?v=. */
const isPage=u=>u.pathname.endsWith("/")||u.pathname.endsWith(".html");
const pageKey=u=>{u=new URL(u);u.search="";u.hash="";if(u.pathname.endsWith("/index.html"))u.pathname=u.pathname.slice(0,-10);return u.href};
const versioned=u=>u.searchParams.has("v");

/* Haal de versiebestanden op die een pagina gebruikt (src="…?v=…" en href="…?v=…"). */
const assetsOf=(html,base)=>[...html.matchAll(/(?:src|href)="([^"]+\?v=[^"]+)"/g)].map(m=>new URL(m[1],base).href);

self.addEventListener("install",e=>{
 e.waitUntil((async()=>{
  const c=await caches.open(C);
  for(const p of PAGES){
   try{
    const url=new URL(p,self.registration.scope),res=await fetch(new Request(url,{cache:"reload"}));
    if(!res.ok)continue;
    const html=await res.clone().text();await c.put(pageKey(url),res);
    await Promise.all(assetsOf(html,url).map(async a=>{try{if(await c.match(a))return;const r=await fetch(new Request(a,{cache:"reload"}));if(r.ok)await c.put(a,r)}catch(err){}}));
   }catch(err){}
  }
 })());
 self.skipWaiting();
});

self.addEventListener("activate",e=>{
 e.waitUntil((async()=>{
  /* Versiebestanden (en de Firebase-bestanden) uit oudere caches meenemen: een nog openstaande oude pagina kan ze nodig hebben,
     en zo blijft offline opstarten werken direct na een update. */
  const ks=await caches.keys(),cur=await caches.open(C);
  for(const k of ks){if(!k.startsWith(PREFIX)||k===C)continue;
   try{const old=await caches.open(k);for(const req of await old.keys()){if((versioned(new URL(req.url))||new URL(req.url).hostname==="www.gstatic.com")&&!(await cur.match(req))){const r=await old.match(req);if(r)await cur.put(req,r)}}}catch(err){}
   await caches.delete(k)}
  /* Niet onbeperkt laten groeien: bewaar per bestand alleen de laatste 3 versies. */
  try{const by={};for(const req of await cur.keys()){const u=new URL(req.url);if(!versioned(u))continue;(by[u.pathname]=by[u.pathname]||[]).push(req)}
   for(const list of Object.values(by)){list.sort((a,b)=>String(new URL(b.url).searchParams.get("v")).localeCompare(String(new URL(a.url).searchParams.get("v")),undefined,{numeric:true}));for(const req of list.slice(3))await cur.delete(req)}}catch(err){}
  await self.clients.claim();
 })());
});

self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
 if(u.origin===location.origin){
  if(versioned(u)){
   /* Vaste versie: eerst de bewaarde kopie van precies deze versie, anders online ophalen en bewaren. */
   e.respondWith((async()=>{const c=await caches.open(C),hit=await c.match(r.url);if(hit)return hit;const res=await fetch(r);if(res.ok)c.put(r.url,res.clone());return res})());
   return;
  }
  e.respondWith((async()=>{
   const c=await caches.open(C),k=isPage(u)?pageKey(u):(()=>{const x=new URL(u);x.hash="";return x.href})();
   const oud=async()=>await c.match(k)||(r.mode==="navigate"?await c.match(pageKey(new URL("./",location))):null);
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
