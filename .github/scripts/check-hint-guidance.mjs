import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const core=fs.readFileSync('js/core.js','utf8');
const between=(a,b)=>{const start=core.indexOf(a);assert.ok(start>=0,a);const end=core.indexOf(b,start);assert.ok(end>start,b);return core.slice(start,end)};
const context=vm.createContext({assert,console});
vm.runInContext('let S={};const autoCrossOn=()=>true;',context);
for(const file of ['shared','binair','starbattle','nonogram','hexcells','pluszle'])vm.runInContext(fs.readFileSync('js/puzzles/'+file+'.js','utf8'),context);
for(const file of ['hint-guidance','hints'])vm.runInContext(fs.readFileSync('js/'+file+'.js','utf8'),context);
for(const code of [
 between('const RN=','function paintNonoHint('),
 between('function adjStar(','/* Te veel sterren'),
 between('const clueTxt=','function rHex('),
 between('function hexHint(){','let hexLast='),
 between('const PHUE=','function rPlus('),
 between('const nwS=','/* ---- Ongedaan maken')
])vm.runInContext(code,context);

vm.runInContext(`
const generators={bin:genBin,star:genStar,nono:genNono,color:(R,l)=>genColorNono(R,l,false,true),hex:genHex,plus:genPlus};
const rules=new Set();let moves=0;
for(const type of Object.keys(generators))for(const level of [1,2,3,4,5,6]){
 const p=generators[type](rng(hash('gerichte-hints-'+type+'-'+level)),level,false);
 S={type:type==='color'?'nono':type,p,cur:type==='hex'?null:type==='bin'?p.giv.slice():Array((p.W||p.N)*(p.H||p.N)).fill(0),hints:0,mist:0};
 if(type==='hex'){delete S.cur;S.hx={rev:new Set([...p.rev0,...(p.zs||[])])}}
 if(type==='star')STK=p.K||2;
 for(let step=0;step<8;step++){
  const move=type==='bin'?binHint():type==='star'?starHint():type==='nono'||type==='color'?nonoHint():type==='hex'?hexHint():plusHint();
  if(!move)break;
  assert.notEqual(move.kind,'fix','De correcte proefinvoer mag geen correctiehint opleveren: '+type);
  const h=prepareHint(move),q=move.proof;
  assert.ok(h.thinkSteps.some(s=>s.includes("?")),"Tweede duwtje stelt een denkvraag");
  assert.ok(!/daarom.*wegkruisen|dus.*omcirkelen/.test(h.thinkSteps.join(" ")),"De volledige zet blijft voor stap 3");
  assert.ok(!/\\b1 (rijen|kolommen|gebieden|sterren|vakjes)\\b/.test(h.shortDirection+" "+h.reason),"Correct enkelvoud in hints");
  assert.ok(h.shortDirection.length>10);assert.ok(h.shortDirection.split(/\s+/).length<=30,'kort duwtje: '+h.shortDirection);
  assert.ok(h.reasonSteps.length>=1&&h.reasonSteps.length<=3);
  for(const line of h.reasonSteps){assert.ok(line.split(/\s+/).length<=40,'korte stap: '+line);assert.ok(!/undefined|NaN/.test(line))}

  if(move.kind!=='deep'&&move.kind!=='reveal')assert.ok(q,type+' mist de echte afleiding');
  if(q)rules.add(type+':'+q.rule);
  projectHint(h);assert.equal(h.cells.length,0);assert.ok(h.direction.length>20);assert.ok(h.reason.length>40);
  assert.ok(!/undefined|NaN/.test(h.direction+' '+h.reason),type+' ongeldige uitleg');
  const count=S.hints;registerHint(h,1);registerHint(h,2);registerHint(h,3);registerHint(h,1);assert.equal(S.hints,count+1);
  h.level=2;projectHint(h);assert.equal(h.cells.length,0);
  if(S.cur){
   const exact='rij '+((move.cells[0]/(p.W||p.N)|0)+1)+', kolom '+(move.cells[0]%(p.W||p.N)+1);
   assert.ok(!h.direction.includes(exact));assert.ok(!h.reason.includes(exact));
  }else{
   assert.ok(h.scope.every(i=>S.hx.rev.has(i)));
   assert.ok(h.reasonScope.every(i=>S.hx.rev.has(i)));
   for(const o of q.clues){
    if(o.kind==='ring'||o.kind==='zone')assert.ok(S.hx.rev.has(o.id),'Alleen zichtbare aanwijzingen');
    if(o.kind==='line')assert.ok(p.lineShow.includes(o.id));
    const unknown=o.c.pos.filter(i=>i>=0&&!S.hx.rev.has(i)),found=o.c.pos.filter(i=>i>=0&&S.hx.rev.has(i)&&p.sol[i]).length;
    assert.ok(o.c.cnt-found>=0&&o.c.cnt-found<=unknown.length,'Kloppende tussentelling');
   }
  }
  if(q&&q.line){
   if(type==='bin')assert.equal(q.line.v.join(),q.line.ci.map(i=>S.cur[i]).join());
   if(q.rule==='overlap'){
    const cl=q.line.cl,cur=q.line.ci.map(i=>S.cur[i]);
    const bounds=type==='color'?cnLine(cl,cur):nonoArr(cl,cur);
    assert.equal(q.min,bounds.mn[q.block]);assert.equal(q.max,bounds.mx[q.block]);
    assert.ok(q.length-(q.max-q.min)>0);
   }
  }
  if(type==='plus'&&q){
   const u=S.pu[move.unit],look=plusLook(u,S.cur,p.num);
   if(q.rule==='complete')assert.equal(look.need,0);
   if(q.rule==='remaining')assert.equal(look.need,look.s0);
   if(q.rule==='tooLarge')assert.equal(q.excluded,look.U.filter(i=>p.num[i]>look.need).length);
  }
  if(type==='star'&&q&&['complete','remaining','separate'].includes(q.rule)){
   assert.equal(q.stars,q.unit.cells.filter(i=>disp(i)===2).length);
   assert.equal(q.open,q.unit.cells.filter(i=>disp(i)===0).length);
  }
  // De gekozen zet blijft consistent met de echte puzzeloplossing.
  for(const i of move.cells){
   if(type==='bin')assert.equal(move.set,p.sol[i]);
   else if(type==='star')assert.equal(move.set===2,!!p.sol[i]);
   else if(type==='color')assert.equal(move.set===-1?0:move.set,p.sol[i]);
   else if(type==='nono')assert.equal(move.set===1?1:0,p.sol[i]);
   else if(type==='plus')assert.equal(move.set===1,!!p.sol[i]);
   else if(move.f!=null)assert.equal(move.f,p.sol[i]);
  }
  h.level=3;projectHint(h);assert.equal(h.cells.join(),move.cells.join());
  if(type==='hex')move.cells.forEach(i=>S.hx.rev.add(i));else move.cells.forEach(i=>S.cur[i]=move.set);
  moves++;
 }
}
console.log('OK: '+moves+' opeenvolgende zetten, alle vijf puzzelsoorten + kleurnonogram, elk op zes niveaus');
console.log('Gecontroleerde technieken: '+[...rules].sort().join(', '));
// Rarere presentatietakken: balans, lijnvergelijking en volledige enumeratie.
S={type:'bin',p:{W:4,H:4},cur:Array(16).fill(-1)};
const line={o:1,x:2,ci:[2,6,10,14],len:4,v:[1,0,1,-1]};line.ci.forEach((i,k)=>S.cur[i]=line.v[k]);
let extra=prepareHint({kind:'tech',cells:[14],why:line.ci,set:0,proof:{rule:'balance',line,symbol:1}});
assert.ok(extra.reason.includes('2 rondjes'));assert.ok(extra.reason.includes('precies 2'));assert.ok(extra.direction.includes('kolom 3'));
const other={o:0,x:1,ci:[4,5,6,7],len:4,v:[0,1,0,1]},incomplete={o:0,x:0,ci:[0,1,2,3],len:4,v:[0,-1,-1,1]};
S.cur=Array(16).fill(-1);incomplete.ci.forEach((i,k)=>S.cur[i]=incomplete.v[k]);other.ci.forEach((i,k)=>S.cur[i]=other.v[k]);
extra=prepareHint({kind:'tech',cells:[1],why:[...incomplete.ci,...other.ci],set:0,proof:{rule:'different',line:incomplete,other}});
extra.level=1;projectHint(extra);assert.equal(extra.why.length,4);
extra.level=2;projectHint(extra);assert.equal(extra.why.join(),"1,2");assert.ok(extra.reason.includes('rij 2'));
// De Hexcells-uitleg mag onbekende oplossingskleuren niet lezen.
S={type:'hex',p:{n:3,sol:[0,1,0]},hx:{rev:new Set([0])}};
const hexMove={cells:[1],kind:'deduce',why:[0],proof:{rule:'constraints',clues:[{kind:'ring',id:0,c:{cnt:1,type:1,pos:[1,2]}}]}};
const before=prepareHint(hexMove);S.p.sol[1]=0;S.p.sol[2]=1;
const after=prepareHint(hexMove);assert.equal(before.direction,after.direction);assert.equal(before.reason,after.reason);assert.equal(before.shortDirection,after.shortDirection);assert.deepEqual(before.reasonSteps,after.reasonSteps);
assert.ok(before.reason.includes('haakjes'));assert.ok(before.scope.every(i=>S.hx.rev.has(i)));
const global=prepareHint({...hexMove,proof:{...hexMove.proof,rule:'global'}});
assert.ok(global.reason.includes('nog geen korte uitleg'));assert.equal(global.cells.length,0);
console.log('OK: specifieke balans/vergelijking, groeiende context en geen uitlezen van verborgen Hexcells-kleuren');
`,context,{timeout:180000});

// Eén rij en één gekleurd vlak: dezelfde sterren, met de juiste richting van wegkruisen.
vm.runInContext(`
for(const K of [1,2])for(const kind of ['r','c'])for(const rule of ['linesInRegions','regionsInLines']){
 S={type:'star',p:{N:3,K,reg:[0,0,1,0,2,1,2,2,1]},cur:Array(9).fill(0)};
 const h=prepareHint({kind:'tech',cells:[2],why:[0,1,2],set:1,proof:{rule,kind,lines:[0],regions:[0]}});
 assert.equal(h.reasonSteps.length,3);assert.ok(h.reason.includes('dezelfde '+(K===1?'ster':'sterren')));
 assert.ok(!/1 (rijen|kolommen|gebieden|sterren)/.test(h.reason));
 assert.ok(h.reasonSteps[2].includes(rule==='linesInRegions'?'van dat vlak buiten deze':'buiten dat vlak'));
 assert.equal(hintStepScope(h,0).cells.length,3);assert.equal(hintStepScope(h,1).cells.join(),'0,1,3');
}
`,context);
console.log('OK: mensentaal en wegkruisrichting bij één rij/kolom en één vlak');
