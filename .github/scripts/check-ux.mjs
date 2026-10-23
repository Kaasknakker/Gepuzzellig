// Regressies uit de UX-review: echte opslag-, hervat- en validatiefuncties.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8'),core=read('js/core.js'),raad=read('raadsels.html');
const section=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
let count=0,saved={},pushes=[],clears=[];
const context={S:null,GV:1,MGV:1,PGV:1,BGV:1,PKEY:'test',dstr:()=> '2026-10-23',addDays:()=> '2026-10-15',nonoDayVariant:()=> 'color',
 progAll:()=>JSON.parse(JSON.stringify(saved)),lsSet:(k,v)=>{saved=JSON.parse(v);return true},playMs:()=>1000,
 cloudPushProgress:(...args)=>pushes.push(args),cloudClearProgress:k=>clears.push(k),$:()=>({value:'groep'}),
 UX:{saves:new Map(),storage(){},paintStorage(){}},tijd:n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
vm.createContext(context);
for(const [a,b]of [['function progKey(','const cloudProgKey'],['function progressPct(','function cloudPushProgress('],['function persist(','setInterval(persist'],['function progressMeta(','const nonoMetaVariant']])vm.runInContext(section(core,a,b),context);
vm.runInContext(section(raad,'function raadCheck(','function raadMaak('),context);
for(const type of ['bin','star','nono','hex','plus','mur'])for(const level of [1,2,3,4,5,6])for(const practice of [false,true]){
 const key=(practice?'p:'+type:'d:2026-10-23:'+type)+(level===2?'':'.'+level),m=context.progressMeta(key,{});
 assert(m,key);assert.equal(m.type,type);assert.equal(m.lvl,level);assert.equal(m.practice,practice);count++;
}
for(const suffix of ['', '.1','.3','.4','.5','.6']){const m=context.progressMeta('p:nono'+suffix+'c',{});assert.equal(m.type,'nono');assert.equal(m.color,true);count++}
for(const type of ['bin','star','mur'])for(const practice of [false,true]){
 saved={};pushes=[];clears=[];context.S={type,practice,p:{},cur:[type==='star'?0:-1],nt:{0:type==='mur'?1048576:2},start:1,seed:'seed',sf:'.5',date:'2026-10-23',hist:[{note:1}],redo:[]};
 context.persist(true);const key=context.progKey(type,practice,context.S.date,'.5');assert.equal(saved[key].pc,0);assert.equal(saved[key].nt[0],context.S.nt[0]);assert.equal(pushes.length,1);count++;
 context.S.cur=[type==='star'?1:0];context.persist();context.S.cur=[type==='star'?0:-1];context.persist();assert.equal(saved[key].pc,0);assert(saved[key].nt);count++;
 context.S.nt={};context.persist();assert.equal(saved[key],undefined);assert(clears.includes(key));count++;
 context.S.nt={0:0};context.persist();assert.equal(saved[key],undefined);count++;
 context.S.hints=1;context.persist();assert(saved[key]);count++;
}
context.S={type:'hex',practice:true,p:{cells:[{},{}],rev0:[]},hx:{rev:new Set()},cs:{l0:1},start:1,seed:'hex',sf:'',hist:[{hexClue:'l0',from:0}]};saved={};context.persist();assert.equal(saved['p:hex'].cs.l0,1);assert.equal(saved['p:hex'].pc,0);count++;
function check(inp,ans,want,soort='getal'){if(arguments.length<3)want=true;assert.equal(context.raadCheck({soort,ans},inp),want,String(inp));count++}
for(const [inp,ans]of [['12',12],['12,5',12.5],['12.5',12.5],['1.234',1234],['1.234.567,89',1234567.89],['1 234,5',1234.5],['1\u00a0234',1234],['-12',-12],['−12',-12],['+12',12],[',5',.5],['.5',.5],['€ 12,50',12.5],['12,50 €',12.5],[0,0]])check(inp,ans);
for(const inp of ['12abc','12+4','12/1','12 km','1,2,3','1.23,45','1 2','€','1e2','Infinity','NaN','12€3','12,','1..234'])check(inp,12,undefined);
check('',12,null);check('13',12,false);
for(const inp of ['13:45','13.45','1345','13 45'])check(inp,'13:45',true,'tijd');
for(const inp of ['25:00','13:99','12:60','-1:00','13:45abc'])check(inp,'13:45',undefined,'tijd');
check('13:46','13:45',false,'tijd');check('0012','0012',true,'code');check('12','0012',false,'code');for(const inp of ['0012abc','00+12','00-12'])check(inp,'0012',undefined,'code');check('A','A',true,'keuze');check('B','A',false,'keuze');
for(const block of raad.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!block[1].includes('src='))new vm.Script(block[2]);
const ux={lsGet:()=>JSON.stringify({types:['bin'],level:'current'}),TYPES:{bin:'Binair',star:'Star Battle'},lvOf:()=>5,rndLevel:()=>2};vm.createContext(ux);vm.runInContext(read('js/ux.js')+'\nglobalThis.subject=UX;',ux);for(let n=0;n<30;n++){const pick=ux.subject.chooseRandom('bin');assert.equal(pick.t,'bin');assert.equal(pick.l,5);count++}
ux.subject.paintStorage=()=>{};ux.subject.storage('session',{at:200,remote:'failed'});ux.subject.storage('session',{at:100,remote:'saved'});assert.equal(ux.subject.saves.get('session').remote,'failed');count++;
console.log('OK: '+count+' UX-regressies (sessies, notities, markeringen, validatie, willekeurig en opslagstatus)');

// Oude Binair-voortgang blijft ook na opnieuw opslaan bij dezelfde generator.
context.S={type:'bin',practice:true,p:{giv:[-1,-1]},cur:[0,-1],nt:{1:2},start:1,seed:'qold',sf:'',date:'2026-10-23',bv:'b1',hist:[],redo:[]};saved={};context.persist();assert.equal(saved['p:bin'].bv,'b1');assert.equal(saved['p:bin'].cur[0],0);assert.equal(saved['p:bin'].nt[1],2);
context.S.bv='b2';context.persist();assert.equal(saved['p:bin'].bv,'b2');
console.log('OK: Binair bewaart de generatorversie met de voortgang en potloodnotities');
