import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
/* Regressie: verstreken speeltijd mag een bord niet "nieuwer" maken (synchronisatieverlies tussen apparaten). */
const core=fs.readFileSync('js/core.js','utf8'),section=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
let now=1000,store={},pushes=[];
const clock=class extends Date{static now(){return now}};
const x=vm.createContext({console,Date:clock,PKEY:'pdprog4',GV:1,MGV:1,PGV:1,BGV:1,HGV:1,
 S:{},progAll:()=>JSON.parse(JSON.stringify(store)),progKey:()=>'d:2026-11-04:bin.3',progressPct:()=>x.pct,pct:40,
 progressDeletedAt:()=>0,rememberProgressDeletion:()=>0,cloudClearProgress:()=>{},
 cloudPushProgress:(k,e,force)=>pushes.push({k,at:e.at,force:!!force,cur:(e.cur||[]).join('')}),
 lsSet:(k,v)=>{store=JSON.parse(v);return true},UX:{saves:new Map(),paintStorage(){},storage(){}},
 $:()=>({value:'g'}),playMs:()=>now-x.S.start});
vm.runInContext(section(core,'function persist(','setInterval(persist'),x);
const reset=cur=>{x.pct=40;x.S={p:{},start:now,seed:'s',type:'bin',cur:cur.split(''),mist:0,hints:0};store={};pushes=[]};
const key='d:2026-11-04:bin.3';

// 1. Alleen speeltijd verstrijkt: at blijft staan, el loopt wel door, en er wordt niets gepusht.
reset('0101');x.persist();const at0=store[key].at;assert.equal(pushes.length,1,'eerste opslag pusht');pushes=[];
now+=120000;x.persist();assert.equal(store[key].at,at0,'speeltijd alleen verandert at niet');assert.equal(store[key].el,120000,'speeltijd wordt wel lokaal bijgehouden');assert.equal(pushes.length,0,'speeltijd alleen veroorzaakt geen cloud-push');

// 2. Geforceerd opslaan (app naar achtergrond) van een ongewijzigd bord behoudt de oude at, zodat de cloud-transactie een nieuwere stand van een ander apparaat niet overschrijft.
now+=60000;x.persist(true);assert.equal(store[key].at,at0,'geforceerde opslag zonder wijziging behoudt at');assert.equal(pushes.length,1);assert.equal(pushes[0].at,at0,'geforceerde push draagt de oude at');assert.equal(pushes[0].force,true);

// 3. Echte zet: at gaat omhoog en wordt gepusht.
pushes=[];now+=1000;x.S.cur=['0','1','0','1'].map((v,i)=>i===0?'1':v);x.persist();assert.ok(store[key].at>at0,'zet geeft nieuwere at');assert.equal(pushes.length,1);assert.equal(pushes[0].cur,'1101');

// 4. Notitie, undo/redo-geschiedenis tellen ook als wijziging.
const a1=store[key].at;now+=1000;x.S.nt={3:'12'};x.persist();assert.ok(store[key].at>a1,'notitie geeft nieuwere at');
const a2=store[key].at;now+=1000;x.S.hist=[{i:0}];x.persist();assert.ok(store[key].at>a2,'undo-geschiedenis geeft nieuwere at');
const a3=store[key].at;now+=1000;x.S.redo=[{i:0}];x.persist();assert.ok(store[key].at>a3,'redo-geschiedenis geeft nieuwere at');

// 5. Terug naar leeg bord (reset) wist de voortgang en pusht geen oud bord.
pushes=[];x.pct=0;x.S.nt={};x.S.hist=[];x.S.redo=[];x.persist();assert.equal(store[key],undefined,'leeg bord verwijdert de lokale voortgang');assert.equal(pushes.length,0);

// 6. Hint of fout op een stil bord: bord en at blijven, hintgegevens worden wel (geforceerd) gepusht.
reset('0101');x.persist();const h0=store[key].at;pushes=[];now+=1000;x.S.hintLedger={'c1':1};x.S.hints=1;x.persist(true);
assert.equal(store[key].at,h0,'hint verandert at niet');assert.equal(store[key].hints,1);assert.equal(pushes.length,1);assert.equal(pushes[0].at,h0);assert.equal(pushes[0].force,true,'hint wordt direct gepusht');
pushes=[];now+=1000;x.S.seenErrors={'2:1':true};x.S.mist=1;x.persist();assert.equal(store[key].at,h0,'fout/controle verandert at niet');assert.equal(pushes.length,1,'fout wordt gepusht ondanks 60 s-throttle');assert.equal(pushes[0].force,true);

// 7. Cloud: een ouder bord overschrijft een nieuwer bord nooit, maar hints/fouten van het oude apparaat gaan niet verloren.
const fb=fs.readFileSync('js/firebase.js','utf8'),line=(t,a)=>t.split('\n').find(y=>y.trim().startsWith(a)).trim(),docs=new Map(),snap=d=>({exists:()=>!!d,data:()=>structuredClone(d)});
const f={doc:(_,...p)=>p.join('/'),runTransaction:async(_,fn)=>fn({get:async r=>snap(docs.get(r)),set:(r,d)=>docs.set(r,structuredClone(d))})};
const c=vm.createContext({f,db:{},currentProfile:{playerId:'me'},window:{},console});vm.runInContext(section(fb,'function mergeProgressMeta(','window.PD_DB='),c);
vm.runInContext('window.PD_DB={'+line(fb,'saveProgress:').replace(/,$/,'')+'}',c);const api=c.window.PD_DB,doc='progress/me/items/k';
const save=e=>api.saveProgress({uid:'me',ck:'k',entry:Object.assign({k:key},e)});
await save({at:300,pc:60,cur:['1','1','1','1','1'],hintLedger:{a:1},hints:1,mist:0});
await save({at:100,pc:20,cur:['1'],hintLedger:{a:2,b:1},hints:2,mist:2,seenErrors:{'1:1':true}});
let d=docs.get(doc).state;assert.equal(d.at,300,'nieuwer bord houdt zijn at');assert.equal(d.cur.length,5,'nieuwer bord blijft staan');assert.equal(d.pc,60);
assert.deepEqual(d.hintLedger,{a:2,b:1},'hints van het oude apparaat worden samengevoegd (hoogste niveau)');assert.equal(d.hints,2);assert.equal(d.mist,2);assert.deepEqual(d.seenErrors,{'1:1':true});
const before=JSON.stringify(docs.get(doc));await save({at:100,pc:20,cur:['1'],hintLedger:{a:1},hints:1,mist:1});assert.equal(JSON.stringify(docs.get(doc)),before,'niets nieuws: geen schrijfactie');
await save({at:300,pc:60,cur:['1','1','1','1','1'],hintLedger:{a:2,b:1,c:1},hints:3,mist:2});assert.equal(docs.get(doc).state.hints,3,'gelijke at met meer meta wordt gewoon opgeslagen');

// 8. Lokaal: wat de cloud meer weet aan hints/fouten komt erbij, het bord en at blijven onaangeroerd.
const m=vm.createContext({});vm.runInContext(section(core,'function mergeMetaInto(','function mergeCloudProgress('),m);
const loc={at:300,cur:['1'],hintLedger:{a:1},hints:1,mist:0},rem={at:300,hintLedger:{a:2,b:1},hints:2,mist:3,seenErrors:{'1:1':true}};
assert.equal(m.mergeMetaInto(loc,rem),true);assert.equal(JSON.stringify(loc.hintLedger),'{"a":2,"b":1}');assert.equal(loc.hints,2);assert.equal(loc.mist,3);assert.equal(JSON.stringify(loc.seenErrors),'{"1:1":true}');assert.equal(loc.at,300);assert.equal(JSON.stringify(loc.cur),'["1"]');
assert.equal(m.mergeMetaInto(loc,rem),false,'tweede keer: niets te winnen');

// 9. Een nieuwere bordopslag behoudt eerder samengevoegde hints van een ander apparaat.
docs.clear();await save({at:300,pc:60,cur:['1','1'],hintLedger:{a:1},hints:1});await save({at:100,pc:20,cur:['1'],hintLedger:{a:1,x:2},hints:2,seenErrors:{'9:1':true}});
await save({at:400,pc:70,cur:['1','1','1'],hintLedger:{a:1},hints:1});
d=docs.get(doc).state;assert.equal(d.at,400,'nieuwer bord wordt opgeslagen');assert.equal(d.cur.length,3);assert.equal(JSON.stringify(d.hintLedger),'{"a":1,"x":2}','hint van A blijft na nieuwere bordopslag van B');assert.equal(JSON.stringify(d.seenErrors),'{"9:1":true}');assert.equal(d.hints,2);
// 10. Een metadata-update met gelijke at vervangt het bord niet.
docs.clear();await save({at:500,pc:60,cur:['1','1','1','1'],hintLedger:{},hints:0});
await save({at:500,pc:20,cur:['9'],hintLedger:{q:1},hints:1,seenErrors:{'5:5':true}});
d=docs.get(doc).state;assert.equal(d.cur.length,4,'bord blijft staan bij metadata-update met gelijke at');assert.equal(d.pc,60);assert.equal(d.hints,1);assert.equal(JSON.stringify(d.hintLedger),'{"q":1}');
// 11. Alleen de numerieke hintteller verandert (bijvoorbeeld uit een oude opslag): ook dat wordt samengevoegd, lokaal en in de cloud.
await save({at:100,pc:20,cur:['1'],hints:5});assert.equal(docs.get(doc).state.hints,5,'teller alleen wordt in de cloud samengevoegd');assert.equal(docs.get(doc).state.cur.length,4);
const l2={at:1,hints:1,hintLedger:{}},r2={at:1,hints:4};assert.equal(m.mergeMetaInto(l2,r2),true);assert.equal(l2.hints,4,'teller alleen wordt lokaal samengevoegd');
// 12. Groepswissel (group) maakt het bord niet nieuwer, maar wordt wel gepusht.
reset('0101');x.persist();const g0=store[key].at;pushes=[];now+=1000;x.$=()=>({value:'andere-groep'});x.persist();assert.equal(store[key].at,g0,'groepswissel verandert at niet');assert.equal(store[key].group,'andere-groep');assert.equal(pushes.length,1);assert.equal(pushes[0].at,g0);
console.log('OK: speeltijd, hints en fouten maken een oud bord niet nieuwer; de cloud voegt hints samen zonder een nieuwer bord te overschrijven.');
