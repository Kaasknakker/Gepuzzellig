import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
/* S28b: delta-start. De resultatencache mag alleen gebruikt worden als hij bij speler+groep+lidmaatschap+versie hoort,
   niet te oud en niet beschadigd is; anders volledige lezing. */
const src=fs.readFileSync('js/firebase.js','utf8'),line=n=>src.split('\n').find(l=>l.startsWith(n));
const consts=line('const SYNC_KEY='),rd=line('const syncCacheRead='),wr=line('const syncCacheWrite=');
assert.ok(consts&&rd&&wr,'syncCache-regels ontbreken');
const store={};
const ctx=vm.createContext({JSON,Date,Array,Object,console:{warn(){}},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}});
vm.runInContext([consts,rd,wr].join('\n'),ctx);
const run=c=>vm.runInContext(c,ctx),DAY=864e5,n=Date.now();
const row=[ 'id1',{uid:'p',type:'bin.1',date:'2026-11-01'} ];
const good=(o={})=>Object.assign({syncedAt:n-DAY,fullAt:n-2*DAY,P:[row],G:[row]},o);
const put=(k,c)=>{ctx.__c=c;run(`syncCacheWrite(${JSON.stringify(k)},__c)`)};
const get=k=>run(`syncCacheRead(${JSON.stringify(k)})`);
put('a',good());assert.ok(get('a'),'geldige cache moet gelezen worden');
assert.equal(get('b'),null,'andere sleutel (speler/groep/lidmaatschap) heeft geen cache');
put('c',good({fullAt:n-8*DAY,syncedAt:n-8*DAY}));assert.equal(get('c'),null,'te oude volledige lezing → volledig opnieuw');
put('d',good({syncedAt:n+DAY}));assert.equal(get('d'),null,'klok teruggezet → volledig opnieuw');
put('e',good({P:[['x',{}]]}));assert.equal(get('e'),null,'beschadigde rij → volledig opnieuw');
store['pdsync1|f']='{kapot';assert.equal(get('f'),null,'onleesbare cache → volledig opnieuw');
store['pdsync1|g']=JSON.stringify(Object.assign({v:99,k:'g'},good()));assert.equal(get('g'),null,'andere dataversie → volledig opnieuw');
// listenFrom gebruikt delta alleen met cache, en leest zonder cache de hele collectie
const lf=line('  listenFrom:');assert.ok(lf);
assert.match(src,/delta\?f\.query\(pc,f\.where\("completedAt",">=",since\)\):pc/,'persoonlijke delta-query ontbreekt');
assert.match(src,/delta\?Math\.max\(joined,since\):joined/,'groeps-delta-query ontbreekt');
assert.match(src,/if\(!delta\)pm\.clear\(\)/,'volledige lezing moet de cache vervangen');
console.log('OK: delta-start gebruikt de cache alleen als die klopt, anders volledige lezing');
