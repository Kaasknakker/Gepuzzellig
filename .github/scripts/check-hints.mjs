import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const context=vm.createContext({assert,console});
vm.runInContext('let S={};',context);
vm.runInContext(fs.readFileSync('js/hints.js','utf8'),context);
vm.runInContext(`
const move={kind:'tech',cells:[1],why:[0,1,2,3],set:1,text:'In rij 1 staan twee keer ○ naast elkaar.',btn:'Invullen'};
S={type:'bin',p:{W:4,H:4},cur:Array(16).fill(-1),hints:0,mist:0};
const h=prepareHint(move);projectHint(h);
assert.equal(h.cells.length,0);assert.equal(h.why.length,4);
registerHint(h,1);assert.equal(S.hints,1);assert.equal(hintTotals().look,1);
registerHint(h,2);assert.equal(S.hints,1);assert.equal(hintTotals().look,0);assert.equal(hintTotals().reason,1);
registerHint(h,3);assert.equal(S.hints,1);assert.equal(hintTotals().move,1);
h.level=3;projectHint(h);assert.equal(h.cells[0],1);
registerHint(prepareHint(move),1);assert.equal(S.hints,1);assert.equal(hintTotals().move,1);
const saved=JSON.parse(JSON.stringify(S));S={...saved,hintLedger:null};restoreHintUsage(saved);
registerHint(prepareHint(move),2);assert.equal(S.hints,1);assert.equal(hintTotals().move,1);
S={type:'bin',p:{W:4},cur:Array(16).fill(-1),hints:5,mist:0};restoreHintUsage({hints:5});
registerHint(prepareHint(move),1);assert.equal(S.hints,6);assert.equal(hintTotals().legacy,5);assert.equal(hintTotals().move,0);
assert.equal(hintSummary({hints:4,hintSteps:{look:2,reason:1,move:1,legacy:0}}),'2 kleine zetjes · 1 uitleg · 1 volledige hint');
assert.equal(hintSummary({hints:2}),'2 hints (oude registratie)');
assert.equal(hintSummary({hints:0}),'zonder hint');assert.equal(hintSummary({}),'');
S.mist=0;S.cur[2]=1;
const fix=prepareHint({kind:'fix',cells:[2],set:-1,text:'Wis dit vakje.'});
registerHint(fix,1);assert.equal(S.mist,0);registerHint(fix,2);assert.equal(S.mist,0);
registerErrors([2]);assert.equal(S.mist,1);registerHint(fix,3);assert.equal(S.mist,1);
registerHint(fix,3);registerErrors([2]);assert.equal(S.mist,1);
S.cur[3]=1;registerErrors([2,3]);assert.equal(S.mist,2);
// Zonder voorafgaande controle telt de concrete correctie precies eenmaal.
S.seenErrors={};S.mist=0;registerHint(fix,3);assert.equal(S.mist,1);registerErrors([2]);assert.equal(S.mist,1);
// Murdoku: geen locatie van een persoon in kijkrichting/redenering.
S={type:'mur',p:{N:4,ppl:['A']},cur:Array(16).fill(-1),hints:0};
const mh=prepareHint({kind:'set',cells:[6],set:0,cards:[0],text:'A staat op rij 2, kolom 3.'});
projectHint(mh);assert.equal(mh.cells.length,0);assert.equal(mh.why.length,0);assert.ok(!mh.direction.includes('rij 2'));
// Een al vastliggend Nonogramblok zelf markeren zou de zet verraden.
S={type:'nono',p:{W:5,H:2,rc:[[2],[1]],cc:[[],[],[],[],[]]},cur:Array(10).fill(0)};
const nh=prepareHint({kind:'tech',cells:[1,2],why:[1,2],set:1,text:'Vul het blauw omrande stuk.'});
projectHint(nh);assert.equal(nh.why.join(),'0,1,2,3,4');assert.equal(nh.cells.length,0);
assert.ok(!hintConcrete(nh).includes('blauw omrand'));
// Hexcells: alleen zichtbare aanwijzingen, geen verborgen doelcel.
S={type:'hex',p:{n:4},hx:{rev:new Set([0])},hints:0};
const hh=prepareHint({cells:[2],why:[0,1],kind:'tech',text:'Blauw'});projectHint(hh);
assert.equal(hh.cells.length,0);assert.equal(hh.why.join(), '0');
`,context);
console.log('OK: hintniveaus, diepste registratie, heropenen/hervatten, oude aantallen, correcties en verborgen doelen');

// De eerste twee echte Murdoku-hints moeten bij de actuele afleiding horen.
const murContext=vm.createContext({assert,console});
vm.runInContext(`let S={};const GROUP_INFO={},window={PD_SETUP:{group:'live'}};const $=()=>({value:'test'});`,murContext);
for(const name of ['shared','murdoku'])vm.runInContext(fs.readFileSync('js/puzzles/'+name+'.js','utf8'),murContext);
vm.runInContext(fs.readFileSync('js/hints.js','utf8'),murContext);
const core=fs.readFileSync('js/core.js','utf8');
vm.runInContext(core.slice(core.indexOf('const murM='),core.indexOf('\n',core.indexOf('const murM='))),murContext);
vm.runInContext(core.slice(core.indexOf('function murHint(){'),core.indexOf('/* ---- Foutloos',core.indexOf('function murHint(){'))),murContext);
vm.runInContext(`
for(const lv of [1,2,3,4,5,6]){
 const p=genMur(rng(hash('persoonlijke-hints-'+lv)),lv,false);
 assert.ok(p);S={type:'mur',p,cur:Array(p.N*p.N).fill(-1),hints:0};
 const hints=[];
 for(let step=0;step<p.N;step++){
  const move=murHint(),h=prepareHint(move);projectHint(h);hints.push(h);
  assert.ok(move.proof);assert.ok(h.lookCards.some(s=>h.direction.includes(p.ppl[s])));
  if(step<2)assert.ok(h.reason.includes('“'));assert.equal(h.cells.length,0);assert.equal(h.why.length,0);
  const exact='rij '+((move.cells[0]/p.N|0)+1)+', kolom '+(move.cells[0]%p.N+1);
  assert.ok(!h.direction.includes(exact));assert.ok(!h.reason.includes(exact));
  const prerequisites=h.reason.match(/Bepaal met deze kaartjes eerst de plek van ([^.]+)\./);
  assert.ok(!prerequisites||!prerequisites[1].includes(p.ppl[move.set]),'Een hint mag niet de eigen conclusie als voorwaarde gebruiken');
  // De eerste twee teksten lezen geen oplossingcoördinaat uit de zet.
  assert.equal(murGuidance({...move,cells:[(move.cells[0]+1)%(p.N*p.N)]}).reason,h.reason);
  S.cur[move.cells[0]]=move.set;
 }
 assert.notEqual(hints[0].direction,hints[1].direction);
 assert.notEqual(hints[0].reason,hints[1].reason);
}
`,murContext);
console.log('OK: opeenvolgende Murdoku-hints op alle zes niveaus, zonder doelcoördinaten of cirkelredenering');
