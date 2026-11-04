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
const reset=cur=>{x.S={p:{},start:now,seed:'s',type:'bin',cur:cur.split(''),mist:0,hints:0};store={};pushes=[]};
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
console.log('OK: speeltijd alleen geeft geen nieuwe at of push; echte wijzigingen wel; geforceerd opslaan behoudt de oude at.');
