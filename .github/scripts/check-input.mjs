// Exercise the actual pointer handlers: slow double taps, toggling and undo.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const core=fs.readFileSync('js/core.js','utf8');
const section=(a,b)=>core.slice(core.indexOf(a),core.indexOf(b,core.indexOf(a)));
const c=vm.createContext({assert,console});
vm.runInContext(`
let S,potlood=false,drag2=null,drag=null,G2,CS=30;
let binLastTap={t:0,i:-1},starLastTap={t:0,i:-1};
const DOUBLE_TAP_MS=600,$=()=>({setPointerCapture(){}}),mouseLR=e=>e.pointerType==='mouse'?(e.button===2?'r':'l'):null;
const gridGeo=()=>({x:0,y:0,pw:30,ph:30}),binCell=()=>0,gridHit=(_g,x,y)=>Math.floor(y/30)*(S.p.N||S.p.W)+Math.floor(x/30);
const invalidateHint=()=>{},paintBin=()=>{},paintAll=()=>{},paintNotes=()=>{},check=()=>{},lpStart=()=>{},ub=()=>{};
const disp=i=>S.cur[i],noteVal=i=>S.nt[i]||0,noteRaw=(i,v)=>S.nt[i]=v;
function begin(){S.gs=S.cur.slice()}
function commit(){if(S.gs&&S.gs.join()!==S.cur.join())S.hist.push(S.gs);S.gs=null}
function setCell(i,v){S.cur[i]=v}
function noteDragWrite(d,i,v){const from=noteVal(i);if(!d.nchanges.has(i))d.nchanges.set(i,{from,to:v});else d.nchanges.get(i).to=v;S.nt[i]=v}
function noteFinish(d){for(const [i,v]of d.nchanges)if(v.from!==v.to)S.hist.push({note:true,i,from:v.from,to:v.to})}
`,c);
vm.runInContext(section('function binDown(','$("#grid").addEventListener("touchstart"'),c);
vm.runInContext(section('function starDown(','function starEnter('),c);
vm.runInContext(section('function starEnter(','function starUp('),c);
vm.runInContext(section('function starUp(','addEventListener("pointerup",starUp)'),c);
vm.runInContext(`
for(const type of ['bin','star'])for(const pointerType of ['touch','pen','mouse'])for(const notes of [false,true]){
 const empty=type==='bin'?-1:0,secondary=type==='bin'?1:2;
 potlood=notes;S={type,p:{W:1,H:1,N:1,giv:[-1]},cur:[empty],nt:{},hist:[],redo:[],rowc:[],colc:[],start:0};
 binLastTap=starLastTap={t:0,i:-1};
 const value=()=>notes?noteVal(0):S.cur[0],down=type==='bin'?binDown:starDown,up=type==='bin'?binUp:starUp;
 function tap(t,button=0){const e={pointerType,button,pointerId:1,clientX:5,clientY:5,timeStamp:t,target:{closest:()=>null},preventDefault(){}};down(e);up({...e,timeStamp:t+40})}
 tap(1000);tap(1540);assert.equal(value(),notes?2:secondary,type+' slow double tap');assert.equal(S.hist.length,1,'one undo step');
 let h=S.hist.pop();if(notes)noteRaw(0,h.from);else S.cur=h;assert.equal(value(),notes?0:empty,'undo removes secondary');
 for(const mark of [notes?1:type==='bin'?0:1,notes?2:secondary]){
  S.hist=[];S.cur=[notes?empty:mark];S.nt=notes?{0:mark}:{};binLastTap=starLastTap={t:0,i:-1};
  tap(2500);assert.equal(value(),notes?0:empty,type+' one tap clears either existing mark');
 }
 S.hist=[];S.cur=[notes?empty:secondary];S.nt=notes?{0:2}:{};binLastTap=starLastTap={t:0,i:-1};
 tap(3000);tap(3540);assert.equal(value(),notes?0:empty,type+' '+pointerType+' notes='+notes+' double tap clears existing secondary');
 h=S.hist.pop();if(notes)noteRaw(0,h.from);else S.cur=h;assert.equal(value(),notes?2:secondary,'undo restores secondary');
 S.hist=[];S.cur=[empty];S.nt={};binLastTap=starLastTap={t:0,i:-1};tap(5000);tap(5800);assert.equal(value(),notes?0:empty,'separate taps toggle primary');
}
`,c);
// Crossing occupied cells, starting on one, and dragging back must preserve
// existing stars/crosses. A completed stroke remains a single undo step.
vm.runInContext(`
for(const pointerType of ['touch','pen','mouse'])for(const old of [0,1,2])for(const notes of [false,true]){
 potlood=notes;S={type:'star',p:{N:5},cur:Array(25).fill(0),nt:{},hist:[],redo:[],start:0};
 if(notes){S.nt={0:old,2:2,3:1}}else{S.cur[0]=old;S.cur[2]=2;S.cur[3]=1}
 const original=S.cur.slice();starLastTap={t:0,i:-1};
 const e={pointerType,button:0,pointerId:7,clientX:5,clientY:5,timeStamp:10000,preventDefault(){}};
 starDown(e);starMove({...e,clientX:135});
 const values=()=>Array.from({length:5},(_,i)=>notes?noteVal(i):S.cur[i]);
 assert.deepEqual(values(),[old||1,1,2,1,1],'drag preserves stars and existing crosses');
 starMove({...e,clientX:35});
 assert.deepEqual(values(),[old||1,1,2,1,0],'backtracking restores only new crosses');
 starUp({...e,timeStamp:10500});
 if(!notes){assert.equal(S.hist.length,1);S.cur=S.hist.pop();assert.deepEqual(S.cur,original,'one undo restores stroke')}
}
potlood=false;
`,c);
// Nonogram: a cross (including color Nonogram) also clears with one tap.
vm.runInContext(`let nd=null,lastTap={t:0,i:-1},nonoMode='f',nonoColorMode=1;const nonoAt=()=>0,nonoLine=()=>{},nonoAuto=()=>{};function nonoPaint(i,v){S.cur[i]=v}`,c);
vm.runInContext(section('function nonoDown(','function nonoMove('),c);
vm.runInContext(section('function nonoUp(','addEventListener("pointerup",nonoUp)'),c);
vm.runInContext(`
for(const color of [false,true])for(const pointerType of ['touch','pen','mouse']){
 S={type:'nono',p:{W:1,H:1,color},cur:[0],hist:[],redo:[],start:0};lastTap={t:0,i:-1};
 function tap(t){const e={pointerType,button:0,pointerId:1,clientX:5,clientY:5,timeStamp:t,target:{closest:()=>null},preventDefault(){}};nonoDown(e);nonoUp({...e,timeStamp:t+40})}
 tap(1000);tap(1540);assert.equal(S.cur[0],color?-1:2,'double tap places cross');assert.equal(S.hist.length,1);
 tap(3000);assert.equal(S.cur[0],0,'single tap clears cross');
 tap(4000);assert.equal(S.cur[0],1);tap(5000);assert.equal(S.cur[0],0,'single tap clears filled cell');
}
`,c);
// A Pencil contact must not activate a menu on both down and up/touchstart.
let scrollSurface=false;
const handlers={},button={matches:()=>false,closest:s=>s.startsWith('button')||scrollSurface&&s.startsWith('#home,')?button:null,click:()=>calls++};
let calls=0;
const pen=vm.createContext({document:{elementFromPoint:()=>button,addEventListener:(name,fn)=>{(handlers[name]??=[]).push(fn)}},performance:{now:()=>1000},Set});
vm.runInContext(section('function fastPenUI(){','fastPenUI();'),pen);vm.runInContext('fastPenUI()',pen);
const event={pointerType:'pen',pointerId:1,button:0,clientX:0,clientY:0,preventDefault(){}};
for(const name of ['pointerdown','touchstart','pointerup'])for(const fn of handlers[name]||[])fn(event);
assert.equal(calls,1,'one Pencil contact activates UI exactly once');
scrollSurface=true;calls=0;
for(const name of ['pointerdown','pointermove','pointerup'])for(const fn of handlers[name]||[])fn({...event,pointerId:2,clientY:name==='pointerdown'?0:100});
assert.equal(calls,0,'Pencil scroll over Home button never activates it on contact');
let suppressed=false;
for(const fn of handlers.click||[])fn({target:button,preventDefault(){suppressed=true},stopImmediatePropagation(){suppressed=true}});
// The preceding direct toolbar action used the same mock button. A normal Home
// button is a different DOM element and must retain the native completed click.
const homeButton={closest:()=>homeButton};suppressed=false;
for(const fn of handlers.click||[])fn({target:homeButton,preventDefault(){suppressed=true},stopImmediatePropagation(){suppressed=true}});
assert.equal(suppressed,false,'native click on scroll page remains available');
// Scrolls in account dialogs must not toggle the underlying Murdoku mode or
// suppress the browser's Pencil scroll gesture.
const modalEvents={},modal=vm.createContext({S:{type:'mur',p:{},mxm:false},document:{addEventListener:(name,fn)=>{(modalEvents[name]??=[]).push(fn)}}});
vm.runInContext(section('const BGX=','/* Verborgen tik-meter'),modal);
let modalPrevented=false;
const modalEvent={pointerType:'pen',button:0,changedTouches:[{touchType:'stylus'}],target:{closest:s=>s.includes('.authcover')?{}:null},preventDefault(){modalPrevented=true}};
for(const name of ['pointerdown','touchstart','touchend'])for(const fn of modalEvents[name]||[])fn(modalEvent);
assert.equal(modalPrevented,false,'Pencil scrolling in profile/group dialog is left to browser');
assert.equal(modal.S.mxm,false,'dialog scroll never changes puzzle input mode');
// The first pen stroke back up after the bottom edge must move immediately.
const scrollHandlers={},card={scrollHeight:1000,clientHeight:400,scrollTop:600,setPointerCapture(){},hasPointerCapture:()=>false};
let scrollClicks=0;
const scrollButton={isConnected:true,matches:()=>false,focus(){},click(){scrollClicks++}},scrollTarget={closest:s=>s==='.authcard'?card:s.startsWith('button')?scrollButton:null};
const scrollContext=vm.createContext({document:{addEventListener:(name,fn)=>{(scrollHandlers[name]??=[]).push(fn)}},performance:{now:()=>1000}});
vm.runInContext(section('function penScrollDialogs(){','penScrollDialogs();')+'penScrollDialogs();',scrollContext);
const scrollEvent=(y=300,extra={})=>({pointerType:'pen',pointerId:3,button:0,clientY:y,target:scrollTarget,preventDefault(){},stopImmediatePropagation(){},...extra});
const sendScroll=(type,event)=>{for(const fn of scrollHandlers[type]||[])fn(event)};
sendScroll('pointerdown',scrollEvent());sendScroll('pointermove',scrollEvent(200));sendScroll('pointerup',scrollEvent(200));assert.equal(card.scrollTop,600,'bottom is clamped');
sendScroll('pointerdown',scrollEvent());sendScroll('pointermove',scrollEvent(380));sendScroll('pointerup',scrollEvent(380));assert.equal(card.scrollTop,520,'first stroke from bottom moves up');assert.equal(scrollClicks,0,'scroll over button never clicks');
sendScroll('pointerdown',scrollEvent());sendScroll('pointerup',scrollEvent());assert.equal(scrollClicks,1,'short Pencil tap clicks once');
let compatBlocked=false;sendScroll('click',scrollEvent(300,{detail:1,preventDefault(){compatBlocked=true}}));assert(compatBlocked,'compatibility click is suppressed');
const dismissHandlers={};let open=true;
const dismiss=vm.createContext({window:{addEventListener:(name,fn)=>dismissHandlers[name]=fn},document:{getElementById:id=>id==='more'?{classList:{contains:()=>open,remove:()=>open=false}}:null}});
vm.runInContext(core.slice(0,core.indexOf('function fastPenUI(')),dismiss);
for(const navigation of [false,true]){
 open=true;let stopped=false;
 const e={target:{closest:s=>navigation&&s==='#tbHome,#tbMore,#pm'},preventDefault(){stopped=true},stopImmediatePropagation(){stopped=true}};
 dismissHandlers.pointerdown(e);assert.equal(open,false);assert.equal(stopped,!navigation,'navigation acts immediately; background only dismisses');
 stopped=false;dismissHandlers.pointerdown(e);assert.equal(stopped,false,'next contact is not swallowed');
}
for(const id of ['authaccount','groupaccount']){
 const handlers={},cover={hidden:false},dialog=vm.createContext({Event:class{constructor(type){this.type=type}},window:{addEventListener:(name,fn)=>handlers[name]=fn,dispatchEvent(){}},document:{getElementById:key=>key===id?cover:null}});
 vm.runInContext(core.slice(0,core.indexOf('function fastPenUI(')),dialog);
 cover.closest=()=>null;let stopped=0;
 const e={target:cover,detail:1,preventDefault(){stopped++},stopImmediatePropagation(){stopped++}};
 handlers.pointerdown(e);assert.equal(cover.hidden,true);assert(stopped>0,'backdrop contact is consumed');
 for(const type of ['pointerup','touchend','click']){stopped=0;handlers[type](e);assert(stopped>0,'dismissal never reaches underlying UI')}
 stopped=0;handlers.pointerdown({...e,target:{closest:()=>null}});assert.equal(stopped,0,'next contact remains usable');
}
// Run real save-and-return flow with Firestore's nested-array constraint.
let saved={},captured=null,rendered=false,failSave=false,status={};
const flags=new Set(),elements={};
function noNestedArrays(value){if(Array.isArray(value)){for(const item of value){assert(!Array.isArray(item),'Firestore rejects direct nested arrays');noNestedArrays(item)}}else if(value&&typeof value==='object')for(const item of Object.values(value))noNestedArrays(item)}
const home=vm.createContext({console,Date,Promise,Array,Object,Set,
 S:null,HOMEREADY:true,RANDOM:false,HVIEW:'',HDOPEN:'',GV:'test',MGV:'test',PGV:'test',BGV:'test',HGV:'test',PKEY:'progress',uid:'test',cloudProgLast:{},
 navigator:{onLine:true},cloudProgOk:()=>true,progressSolved:()=>false,cloudProgKey:k=>k,
 progAll:()=>JSON.parse(JSON.stringify(saved)),lsSet:(k,v)=>{saved=JSON.parse(v);return true},dstr:()=> '2026-10-23',addDays:()=> '2026-10-15',playMs:()=>1000,
 UX:{saves:new Map(),storage:(k,v)=>{status={...status,...v}},paintStorage(){}},
 $:id=>elements[id]??={value:'test',hidden:false,classList:{remove(){}}},
 document:{body:{classList:{add:x=>flags.add(x),remove:x=>flags.delete(x),contains:x=>flags.has(x)}}},
 clearOnline(){},clearHint(){},toggleSide(){},tapMode(){},renderHome(){rendered=true},pageIn(){},cloudClearProgress(){},
 window:{scrollTo(){},PD_DB:{saveProgress:o=>{noNestedArrays(o.entry);captured=o.entry;if(failSave)throw new Error('save failed');return Promise.resolve()}}}
});
for(const [a,b]of [
 ['function progKey(','const cloudProgKey'],['function progressPct(','/* Firestore kan'],
 ['function cloudProgressHistory(','function cloudClearProgress('],['function persist(','setInterval(persist'],
 ['function pausePlay(','function resumePlay('],['function pauseAndPersistActive(','function setFreePreferences('],
 ['function showHome(','const dayLvDevice=']
])vm.runInContext(section(a,b),home);
for(const type of ['bin','star','nono','plus','mur','hex']){
 saved={};captured=null;rendered=false;flags.clear();status={};
 home.S={type,practice:true,date:'2026-10-23',sf:'',seed:'test',start:1,p:{giv:[-1],cells:[{},{}],rev0:[]},cur:[type==='bin'?0:1],hist:[[-1],{note:1,i:0,from:0,to:1}],redo:[[0]],nt:{}};
 if(type==='hex')home.S.hx={rev:new Set([0])};
 home.showHome();assert(rendered&&flags.has('home'),type+' returns Home after input');
 await new Promise(setImmediate);assert(captured,type+' saved');assert.equal(status.remote,'saved');
 assert.deepEqual(JSON.parse(JSON.stringify(home.cloudProgressHistory(captured,false).hist)),[[-1],{note:1,i:0,from:0,to:1}]);
 assert.deepEqual(JSON.parse(JSON.stringify(home.cloudProgressHistory(captured,false).redo)),[[0]]);
 assert(Array.isArray(saved['p:'+type].hist[0]),'local undo format stays compatible');
}
failSave=true;rendered=false;home.showHome();assert(rendered,'sync cloud failure cannot block navigation');await new Promise(setImmediate);assert.equal(status.remote,'failed');
console.log('OK: single tap clears marks, slow double taps and undo for touch/Pencil/mouse; Nonogram crosses; Pencil navigation; save/return and cloud history for all six puzzles');
