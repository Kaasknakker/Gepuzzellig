// Completion day is activity metadata; daily puzzle IDs must remain stable.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const core=fs.readFileSync('js/core.js','utf8');
const section=(a,b)=>core.slice(core.indexOf(a),core.indexOf(b,core.indexOf(a)));
let today='2026-10-24',sent=[],free=[],deleted=[];
const elements={};
const c=vm.createContext({
 assert,console,Date,Set,Map,Promise,
 S:{},store:{},SG:{},XS:{},uid:'me',lastRows:[],TYPES:{star:'Star Battle'},
 $:id=>elements[id]??=({value:id==='#group'?'group':'Speler',textContent:'',classList:{add(){}}}),
 dstr:()=>today,playMs:()=>10000,clearOnline(){},clearFreeProgressType(){},progDel:k=>deleted.push(k),progKey:(_t,_p,d,sf)=>d+'star'+sf,
 hideHint(){},setT(){},fmt:String,badges:()=>'',TSHOW:false,render(){},celebrate(){},hintTotals:()=>({look:0,reason:0,move:0,legacy:0}),
 freeLoc:()=>free,lsSet(){},renderStats(){},dbSave:r=>{sent.push(r);return Promise.resolve()},
 save(){},saveSG(){},xsSave(){},board(){},setTimeout(){},
 isFree:r=>r.type.startsWith('v~'),legacyGroup:()=> 'group',scoreGroup:()=> 'group',window:{PD_DB:{}},
 addDays:(ds,n)=>{const d=new Date(ds+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
});
for(const [a,b]of [
 ['function myRow(','function dbSave('],['function finish(){','setInterval(()=>{if(S.start'],
 ['const baseT=','const freeLvl='],['function allRows(','function streakOf('],
 ['function pullMine(','/* Tijden die nog niet'],['function resync(','addEventListener("pdready",startBoard)']
])vm.runInContext(section(a,b),c);
vm.runInContext('globalThis.statsRows=statsRows',c);
for(const practice of [false,true]){
 c.store={};c.XS={};c.SG={};c.lastRows=[];sent=[];free=[];deleted=[];
 c.S={type:'star',practice,date:'2026-10-23',sf:'.3',seed:'testseed',start:1,hints:0,mist:0};
 c.finish();
 assert.equal(sent.length,1);
 const row=sent[0];
 assert.equal(practice?row.date:row.completedOn,today,'completion after midnight counts today');
 assert.equal(c.S.date,'2026-10-23','puzzle date stays stable');
 if(!practice){
  assert.equal(row.date,'2026-10-23');assert.equal(row.type,'star.3');
  assert.equal(deleted[0],'2026-10-23star.3','delete original progress key');
  assert.equal(c.myRow(row.date,row.type).completedOn,today,'offline resync keeps completion day');
 }else assert.equal(free[0].date,today,'free local result uses completion day');
 const stats=c.statsRows([row]);assert.equal(stats[0].date,today);
 if(!practice)assert.equal(stats[0].puzzleDate,'2026-10-23');
}
const rows=[
 {uid:'me',date:'2026-10-20',completedOn:today,type:'star.3',secs:10,group:'group'},
 {uid:'me',date:'2026-10-21',completedOn:today,type:'star.3',secs:20,group:'group'},
 {uid:'me',date:'2026-10-22',type:'star.3',secs:30,group:'group'}
];
assert.equal(c.statsRows(rows).filter(r=>r.date===today).length,2,'distinct daily puzzles completed today both count');
assert.equal(c.statsRows(rows)[2].date,'2026-10-22','legacy result retains recorded date');
assert.equal(rows[0].date,'2026-10-20','statistics never mutate result identity');
c.store={};c.XS={};c.SG={};c.lastRows=[];c.S.done=true;
c.pullMine(rows);
assert.equal(c.XS['2026-10-20star.3'].completedOn,today,'new device receives completion date');
c.lastRows=rows.map(({completedOn,...r})=>r);
assert.equal(c.allRows()[0].completedOn,today,'local metadata supplements older cached snapshot');
c.store={'2020-01-01star.3':15};c.XS={'2020-01-01star.3':{completedOn:today}};sent=[];
c.resync([]);assert.equal(sent.filter(r=>!r.type.startsWith('v~')).length,1,'old archive puzzle completed recently syncs offline result');assert.equal(sent.filter(r=>r.type.startsWith('v~')).length,1,'offline free result also syncs personally');
assert.equal(sent[0].date,'2020-01-01');assert.equal(sent[0].completedOn,today);
console.log('OK: afrondingsdag na middernacht, vaste puzzelidentiteit, oude resultaten, lokale opslag en synchronisatie');
