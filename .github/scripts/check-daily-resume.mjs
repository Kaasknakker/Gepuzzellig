import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const core=fs.readFileSync('js/core.js','utf8');
const section=(a,b)=>{const i=core.indexOf(a),j=core.indexOf(b,i);assert(i>=0&&j>i);return core.slice(i,j)};
const line=a=>core.split('\n').find(s=>s.startsWith(a));
const types=['bin','star','nono','hex','plus','mur'];
function context(phone=false,cutover=''){
 const c=vm.createContext({PHONE:phone,window:{PD_SETUP:{dailyPreferencesFrom:cutover}},Date,console,lvOf:()=>phone?5:2,ACTIVE:types,TYPES:Object.fromEntries(types.map(t=>[t,t]))});
 vm.runInContext(fs.readFileSync('js/puzzle-registry.js','utf8'),c);
 vm.runInContext(section('const DAGVANAF=','/* Nonogram-dagvariant:'),c);return c;
}
// Production without an explicit cutover preserves every legacy weekday/weekend level.
for(const phone of [false,true]){
 const c=context(phone);for(const t of types)for(const [d,l]of [['2026-10-24',3],['2026-10-25',3],['2026-10-26',2],['2026-11-01',3]])assert.equal(vm.runInContext(`dagLv('${t}','${d}')`,c),l+(phone?3:0));
 const next=context(phone,'2026-10-27');vm.runInContext('PLAYER_PREFS.dailyDifficulty.bin="hard"',next);
 assert.equal(vm.runInContext('dagLv("bin","2026-10-26")',next),phone?5:2);
 assert.equal(vm.runInContext('dagLv("bin","2026-10-27")',next),phone?6:3);
 vm.runInContext('DAILY_PLANS["2026-10-27"]={difficulties:{bin:"easy"}}',next);
 assert.equal(vm.runInContext('dagLv("bin","2026-10-27")',next),phone?4:1);
}
// Execute the actual load/resume/persist path with isolated DOM, storage and generator boundaries.
let count=0;
for(const phone of [false,true])for(const type of types)for(const level of [1,2,3,4,5,6]){
 const date='2026-10-25',sf=level===2?'':'.'+level,key=`d:${date}:${type}${sf}`,seed=type+date+sf;
 const oldVersion=type==='mur'?{mv:'m4'}:type==='bin'?{bv:'b1'}:type==='hex'?{hv:'h1'}:{};
 let saved={[key]:{seed,gv:'g17',pv:'p1',...oldVersion,nv:'classic',cur:[1,0,1,0],rev:[1],hist:[[1,0,0,0]],redo:[[0,0,0,0]],el:12000,at:100,mist:2,hints:1,pc:50,group:'g',nt:{0:2}}},generated;
 const el={value:'g',hidden:true,textContent:'',innerHTML:'',style:{},dataset:{},classList:{add(){},remove(){},contains(){return false},toggle(){}},closest(){return null}};
 const c=context(phone,'2026-10-25');Object.assign(c,{$:()=>el,document:{body:el,documentElement:el,querySelectorAll:()=>[]},S:null,MAX_REASONABLE_MS:21600000,GV:'g17',PGV:'p1',MGV:'m5',BGV:'b2',HGV:'h2',loadId:0,MAX_DAY_PROGRESS:50,MAX_OPEN_DAILY:50,NIEUW:false,HOMEREADY:false,cache:{},potlood:false,RANDOM:false,
  dstr:()=> '2026-10-26',sfx:l=>l===2?'':'.'+l,nonoDayVariant:()=> 'color',isWk:()=>true,progAll:()=>saved,progDel:()=>{},progressList:()=>Array(50).fill({}),myDone:()=>false,lsSet:(k,v)=>{if(k==='pdprog4')saved=JSON.parse(v)},pauseAndPersistActive(){},clearHomeSkinAccent(){},pageIn(){},hideHint(){},ub(){},updateArchiveVisibility(){},helpOf:()=>'',setT(){},setTimeout:fn=>{fn()},render(){},updTabs(){},pingOnline(){},localDoneInGroup:()=>false,featOf:()=>'',dnl:d=>d,fmt:x=>String(x),playMs:()=>12000,restoreHintUsage(){},CustomEvent:function(){},
  genCached:(...args)=>{generated=args;return{W:2,H:2,N:2,giv:[-1,-1,-1,-1],sol:[0,1,0,1],rev0:[],zs:[],cells:[{},{},{},{}]}},
  LVN:Object.fromEntries(types.map(t=>[t,[1,2,3,4,5,6]])),setFreePreferences(){},clearFreeProgressType(){},PKEY:'pdprog4',UX:{saves:new Map(),storage(){},paintStorage(){}},cloudPushProgress(){},cloudClearProgress(){}});
 c.window.dispatchEvent=()=>{};
 for(const code of [line('function progKey('),section('function progressMeta(','const nonoMetaVariant'),line('const nonoMetaVariant='),section('function dailyResumeMeta(','function load('),section('function murVersion(','function genCached('),section('function load(','const LANDQ='),line('function resumeProgress('),section('function progressPct(','function cloudPushProgress('),section('function persist(','setInterval(persist')])vm.runInContext(code,c);
 c.resumeProgress(key);
 assert.equal(c.S.lvl,level);assert.equal(c.S.sf,sf);assert.equal(c.S.seed,seed);assert.equal(generated[2],level);assert.equal(c.S.resumed,true,`${type}/${level}/${phone}`);assert.equal(c.S.mist,2);assert.equal(c.S.hist.length,1);assert.equal(c.S.nt[0],2);
 if(type==='hex')assert(c.S.hx.rev.has(1));else assert.deepEqual(Array.from(c.S.cur),[1,0,1,0]);
 if(type==='nono'){assert.equal(c.S.nv,'classic');assert.equal(generated[4],'classic')}
 if(type==='bin')assert.equal(c.S.bv,'b1');if(type==='hex')assert.equal(c.S.hv,'h1');if(type==='mur')assert.equal(c.S.mv,'m4');
 c.S.start=1;c.persist(true);assert(saved[key],key);assert.equal(saved[key].seed,seed);if(type==='nono')assert.equal(saved[key].nv,'classic');
 // A saved key from a different date/type cannot override this request.
 assert.equal(c.dailyResumeMeta(type,'2026-10-26',key),null);
 if(!phone){c.progressRelevant=()=>true;c.progressSolved=()=>false;c.cloudProgressHistory=e=>e;
 vm.runInContext(section('function mergeCloudProgress(','function pullCloudProgress('),c);
 const remote={...saved[key],k:key,at:Date.now()+1000,cur:[0,1,0,1],rev:[2]};
 c.mergeCloudProgress({item:remote});
 assert.equal(c.S.lvl,level);assert.equal(c.S.seed,seed);assert.equal(c.S.resumed,true);
 if(type==='hex')assert(c.S.hx.rev.has(2));else assert.deepEqual(Array.from(c.S.cur),[0,1,0,1]);
 if(type==='nono')assert.equal(c.S.nv,'classic');}
 count++;
}
const prod=fs.readFileSync('js/config.js','utf8'),test=fs.readFileSync('js/config.test.js','utf8');assert(!prod.includes('dailyPreferencesFrom'));assert(test.includes('dailyPreferencesFrom:"2026-10-25"'));
console.log(`OK: legacy kalender, expliciete cutover, immutable dagplan en ${count} echte hervat-/opslagpaden met oude niveaus, apparaatvarianten, borden, notities en generatorversies.`);


