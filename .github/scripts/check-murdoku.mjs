// Onafhankelijke oplossingstelling en compatibiliteit met bewaarde m4-borden.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c=vm.createContext({assert,console});
vm.runInContext('let S={};const GROUP_INFO={},window={PD_SETUP:{group:"test"}};const $=()=>({value:"test"});',c);
for(const file of ['puzzles/shared','puzzles/murdoku','hint-guidance','hints'])vm.runInContext(fs.readFileSync('js/'+file+'.js','utf8'),c);
const core=fs.readFileSync('js/core.js','utf8');
vm.runInContext('const MGV="m5";'+core.slice(core.indexOf('function murVersion('),core.indexOf('function genCached(')),c);
for(const [a,b]of [['const murM=','\n'],['function murHint(){','/* ---- Foutloos']]){const i=core.indexOf(a);vm.runInContext(core.slice(i,core.indexOf(b,i)),c)}
vm.runInContext(`
assert.equal(murVersion('mur2026-10-23.3'),'m4');
assert.equal(murVersion('mur2026-10-24.3'),'m5');
assert.equal(murVersion('qold',{seed:'qold',mv:'m4'}),'m4');
assert.equal(murVersion('qnew',{seed:'qold',mv:'m4'}),'m5');
assert.equal(murVersion('qnew',{seed:'qnew',mv:'m5'}),'m5');
`,c);
// Deze hashes zijn vastgelegd met de ongewijzigde generator van commit 4cfc7f8.
const legacy=[
'17fc1d4c4a14671d681fb4828bc6d27aed634b0c5096caf97641505ce4b70805',
'33771e96aea7c9e9bf2c4ee0601eea637d5c3af2881017fa3a71365029ba63c9',
'2a38cd671a7b4f3a07d9e9234a66a8dc9bc7f54ccea528083b8085bd2c4bca20',
'fc2d62fd63f77d08b38a0517bf17e7321720f8e5e5e364c2d4f9b8ffeef949de',
'f619f5102ed4704a12e876b4c4ea13ff97520f5f53d5d635f90cd6fc31fa3fb6',
'597d9b09210c1009242cd9f6ee710cb5dbc68a6acfff4eec35c51af5893aa80f'];
for(let lv=1;lv<=6;lv++){
 const p=vm.runInContext(`genMur(rng(hash('compat-murdoku-${lv}')),${lv},false,false)`,c);
 assert.equal(createHash('sha256').update(JSON.stringify(p)).digest('hex'),legacy[lv-1],`m4-bord niveau ${lv}`);
}
console.log('OK: zes oude Murdoku-borden exact behouden; versie per datum en vrije voortgang');
vm.runInContext(`
// Uitputtend zoeken met uitsluitend spelregels en kaartjes; niet met murSolve.
function countSolutions(p){const M=murM(p),pos=Array(p.N).fill(null),unary=p.cd.filter(c=>c.x==null&&!['alone','nalone'].includes(c.t));
 const candidates=pos.map((_,q)=>Array.from({length:p.N*p.N},(_,i)=>i).filter(i=>{if(!murFree(i,M))return false;pos[q]=i;const ok=unary.filter(c=>c.p===q).every(c=>murE(c,pos,M));pos[q]=null;return ok}));
 let count=0;
 const valid=()=>{const chosen=pos.filter(i=>i!=null);if(new Set(chosen.map(i=>i/p.N|0)).size!==chosen.length||new Set(chosen.map(i=>i%p.N)).size!==chosen.length)return false;
  for(const cl of p.cd){if(pos[cl.p]==null)continue;if(cl.x!=null){if(pos[cl.x]!=null&&!murE(cl,pos,M))return false}else if(cl.t==='alone'){if(!murE(cl,pos,M))return false}else if(cl.t==='nalone'){if(chosen.length===p.N&&!murE(cl,pos,M))return false}else if(!murE(cl,pos,M))return false}
  if(pos[p.V]!=null){const neighbors=pos.filter((i,q)=>q!==p.V&&i!=null&&p.reg[i]===p.reg[pos[p.V]]).length;if(neighbors>1||chosen.length===p.N&&neighbors!==1)return false}return true};
 function visit(){if(count>=2)return;let who=-1,options=null;
  for(let q=0;q<p.N;q++)if(pos[q]==null){const a=candidates[q].filter(i=>{pos[q]=i;const ok=valid();pos[q]=null;return ok});if(!a.length)return;if(!options||a.length<options.length){who=q;options=a}}
  if(who<0){count++;return}for(const i of options){pos[who]=i;visit();pos[who]=null;if(count>=2)return}}
 visit();return count}
let trials=0,generated=0,maxMs=0;
for(const lv of [1,2,3,4,5,6])for(let n=0;n<2;n++){
 const begin=Date.now(),seed='nieuwe-murdoku-'+lv+'-'+n,p=genMur(rng(hash(seed)),lv,false);maxMs=Math.max(maxMs,Date.now()-begin);assert.ok(p);
 assert.equal(countSolutions(p),1,'één oplossing '+seed);
 assert.ok(murDone(murSolve(murM(p),p.cd,{st:5})),seed);
 const solved=murSolve(murM(p),p.cd,{st:5});assert.equal(JSON.stringify(solved.D.map(d=>d[0])),JSON.stringify(p.sol));
 if(p.need===5){trials++;assert.ok(!murDone(murSolve(murM(p),p.cd,{st:4})))}
 S={type:'mur',p,cur:Array(p.N*p.N).fill(-1),hints:0};
 for(let step=0;step<p.N;step++){const move=murHint();assert.ok(move.proof,'hint met afleiding '+seed);assert.equal(p.sol[move.set],move.cells[0]);const h=prepareHint(move);projectHint(h);assert.equal(h.cells.length,0);S.cur[move.cells[0]]=move.set}
 generated++;
}
assert.ok(trials>0,'de nieuwe techniek wordt daadwerkelijk gebruikt');
console.log('OK: '+generated+' Murdoku’s uniek en volledig via verklaarde hints oplosbaar; '+trials+' vereisen de nieuwe stap; langzaamste generator '+maxMs+' ms');
`,c,{timeout:120000});
