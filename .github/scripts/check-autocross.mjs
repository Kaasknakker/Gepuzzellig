import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const core=fs.readFileSync('js/core.js','utf8');
const between=(a,b)=>core.slice(core.indexOf(a),core.indexOf(b,core.indexOf(a)));
const storage=new Map(),button={hidden:false,state:{},dataset:{},classList:{toggle(){}},setAttribute(k,v){this.state[k]=v},querySelector(){return this}};
const context=vm.createContext({localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},console,button,assert});
vm.runInContext(`let S={}; const $=()=>button;let renders=0;function render(){renders++}function clearHint(){};const noteVal=i=>S.nt[i]||0;`,context);
for(const file of ['shared','nonogram'])vm.runInContext(fs.readFileSync('js/puzzles/'+file+'.js','utf8'),context);
vm.runInContext(between('const lsGet=','let nonoVariant='),context);
vm.runInContext(between('function adjStar(','/* Te veel sterren'),context);
vm.runInContext(between('function noteAdjStar(','function applyNoteDrag'),context);
vm.runInContext(between('function nonoAuto(','let nonoMode='),context);
vm.runInContext(`function nonoPaint(i,v){S.cur[i]=v}`,context);
vm.runInContext(`
S={type:'star',p:{N:3},cur:[2,0,0,0,0,0,0,0,1],nt:{6:2}};
assert.equal(autoCrossOn(),true);assert.equal(disp(1),1);assert.equal(noteDisp(7),1);
const before=JSON.stringify(S);toggleAutoCross();
assert.equal(autoCrossOn(),false);assert.equal(disp(1),0);assert.equal(disp(8),1);assert.equal(noteDisp(7),0);assert.equal(JSON.stringify(S),before);
updateAutoCross();assert.equal(button.hidden,false);assert.equal(button.state['aria-checked'],'false');assert.equal(button.textContent,'Uit');
S.type='bin';updateAutoCross();assert.equal(button.hidden,true);
S.type='nono';assert.equal(autoCrossOn(),true);S.type='star';assert.equal(autoCrossOn(),false);
toggleAutoCross();assert.equal(disp(1),1);
for(const color of [false,true]){
 S={type:'nono',p:{W:3,H:1,color,rc:[color?[{n:1,c:1}]:[1]],cc:[color?[{n:1,c:1}]:[1],[],[]]},cur:[1,0,0]};
 nonoAuto([0]);assert.equal(S.cur[1],color?-1:2);assert.equal(S.cur[2],color?-1:2);
 toggleAutoCross();S.cur=[1,0,0];nonoAuto([0]);assert.equal(S.cur.join(), '1,0,0');
 S.cur[2]=color?-1:2;nonoAuto([0]);assert.equal(S.cur[2],color?-1:2);toggleAutoCross();
}
`,context);
// Murdoku: repaint the actual board logic with lightweight cells.
vm.runInContext(`const isDark=()=>false,murBlocked=()=>false,murTok=()=>'',popEl=()=>{},paintNotes=()=>{};
const document={querySelectorAll:()=>[]};
function cell(){return {dataset:{},flags:{},classList:{toggle(k,v){this.owner.flags[k]=v}},querySelector(){return {innerHTML:''}}}}
`,context);
vm.runInContext(between('function paintMur(){','function murAccuse('),context);
vm.runInContext(`S={type:'mur',p:{N:2,sol:[3]},cur:[0,-1,-2,-1],mcells:Array.from({length:4},()=>{const c=cell();c.classList.owner=c;return c}),str:new Set()};
paintMur();assert.equal(S.mcells[1].flags.xx,true);assert.equal(S.mcells[2].flags.xx,true);
toggleAutoCross();paintMur();assert.equal(S.mcells[1].flags.xx,false);assert.equal(S.mcells[2].flags.xx,true);
toggleAutoCross();paintMur();assert.equal(S.mcells[1].flags.xx,true);`,context);
console.log('OK: automatische kruisjes, handmatige markeringen, voorkeur per puzzelsoort en schakelaarstatus');

