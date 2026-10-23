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
const gridGeo=()=>({x:0,y:0,pw:30,ph:30}),binCell=()=>0,gridHit=()=>0;
const invalidateHint=()=>{},paintBin=()=>{},paintAll=()=>{},check=()=>{},lpStart=()=>{},ub=()=>{};
const disp=i=>S.cur[i],noteVal=i=>S.nt[i]||0,noteRaw=(i,v)=>S.nt[i]=v;
function begin(){S.gs=S.cur.slice()}
function commit(){if(S.gs&&S.gs.join()!==S.cur.join())S.hist.push(S.gs);S.gs=null}
function setCell(i,v){S.cur[i]=v}
function noteDragWrite(d,i,v){const from=noteVal(i);if(!d.nchanges.has(i))d.nchanges.set(i,{from,to:v});else d.nchanges.get(i).to=v;S.nt[i]=v}
function noteFinish(d){for(const [i,v]of d.nchanges)if(v.from!==v.to)S.hist.push({note:true,i,from:v.from,to:v.to})}
`,c);
vm.runInContext(section('function binDown(','$("#grid").addEventListener("touchstart"'),c);
vm.runInContext(section('function starDown(','function starEnter('),c);
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
 S.hist=[];S.cur=[notes?empty:secondary];S.nt=notes?{0:2}:{};binLastTap=starLastTap={t:0,i:-1};
 tap(3000);tap(3540);assert.equal(value(),notes?0:empty,type+' '+pointerType+' notes='+notes+' double tap clears existing secondary');
 h=S.hist.pop();if(notes)noteRaw(0,h.from);else S.cur=h;assert.equal(value(),notes?2:secondary,'undo restores secondary');
 S.hist=[];S.cur=[empty];S.nt={};binLastTap=starLastTap={t:0,i:-1};tap(5000);tap(5800);assert.equal(value(),notes?0:empty,'separate taps toggle primary');
}
`,c);
// A Pencil contact must not activate a menu on both down and up/touchstart.
const handlers={},button={matches:()=>false,closest:s=>s.startsWith('button')?button:null,click:()=>calls++};
let calls=0;
const pen=vm.createContext({document:{elementFromPoint:()=>button,addEventListener:(name,fn)=>{(handlers[name]??=[]).push(fn)}},performance:{now:()=>1000},Set});
vm.runInContext(section('function fastPenUI(){','fastPenUI();'),pen);vm.runInContext('fastPenUI()',pen);
const event={pointerType:'pen',pointerId:1,button:0,clientX:0,clientY:0,preventDefault(){}};
for(const name of ['pointerdown','touchstart','pointerup'])for(const fn of handlers[name]||[])fn(event);
assert.equal(calls,1,'one Pencil contact activates UI exactly once');
const dismissHandlers={};let open=true;
const dismiss=vm.createContext({window:{addEventListener:(name,fn)=>dismissHandlers[name]=fn},document:{getElementById:id=>id==='more'?{classList:{contains:()=>open,remove:()=>open=false}}:null}});
vm.runInContext(core.slice(0,core.indexOf('/* Snelle Apple Pencil-tikken')),dismiss);
for(const navigation of [false,true]){
 open=true;let stopped=false;
 const e={target:{closest:s=>navigation&&s==='#tbHome,#tbMore,#pm'},preventDefault(){stopped=true},stopImmediatePropagation(){stopped=true}};
 dismissHandlers.pointerdown(e);assert.equal(open,false);assert.equal(stopped,!navigation,'navigation acts immediately; background only dismisses');
 stopped=false;dismissHandlers.pointerdown(e);assert.equal(stopped,false,'next contact is not swallowed');
}
console.log('OK: slow double taps and undo for touch/Pencil/mouse, regular and pencil marks; one UI action per Pencil contact');
