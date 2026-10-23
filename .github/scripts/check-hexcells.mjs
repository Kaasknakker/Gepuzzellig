// Selecteer pittige borden op de echte hintvolgorde; verifieer elke afleiding apart.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c=vm.createContext({console,assert});
vm.runInContext('let S={};const cap=s=>s[0].toUpperCase()+s.slice(1),lst=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" en "+a[a.length-1],nw=n=>["geen","één","twee","drie","vier"][n]||String(n);',c);
for(const file of ['shared','hexcells'])vm.runInContext(fs.readFileSync('js/puzzles/'+file+'.js','utf8'),c);
const core=fs.readFileSync('js/core.js','utf8');
for(const[a,b]of[['const clueTxt=','function rHex('],['function hexHint(){','let hexLast=']])vm.runInContext(core.slice(core.indexOf(a),core.indexOf(b,core.indexOf(a))),c);
vm.runInContext('const GV="g17",MGV="m5",PGV="p2",BGV="b2",HGV="h2",GEN={hex:genHex},nonoMixOn=()=>false;let savedGen={};const lsGet=k=>savedGen[k],lsSet=(k,v)=>savedGen[k]=v;',c);
vm.runInContext(core.slice(core.indexOf('function hexVersion('),core.indexOf('/* Weekend (zaterdag')),c);
vm.runInContext(`
assert.equal(hexVersion('hex2026-10-23.3'),'h1');assert.equal(hexVersion('hex2026-10-24.3'),'h2');
assert.equal(hexVersion('qold',{seed:'qold'}),'h1');assert.equal(hexVersion('qold',{seed:'qold',hv:'h1'}),'h1');
assert.equal(hexVersion('qnew',{seed:'qold'}),'h2');assert.equal(hexVersion('qnew',{seed:'qnew',hv:'h2'}),'h2');
savedGen.pdgen=JSON.stringify({'g17|hex|qold|3':JSON.stringify({oldBoard:true})});
assert.ok(genCached('hex','qold',3,false,'classic',null,null,'h1').oldBoard);
assert.ok(!genCached('hex','qold',3,false,'classic',null,null,'h2').oldBoard);
assert.ok(genCached('hex','qold',3,false,'classic',null,null,'h1').oldBoard);
`,c);
// SHA256 van de oorspronkelijke generator in commit 3075e52.
const hashes=['f05677f4badc94a8dd4beeb34d9e869139f3ed2974c99d4eeb304a239edc935d', 'cd235d9f2760e69ff05592cb45df567fe70942a143a53612383ee91477627884', 'e767f4122e9f79117e2893903fb6ef64b51a87fc9464abbc5f46d328c189ff5b', 'f6b3df4430a58dd970c2cae27bd9fb72af5a33c0eafde114562c6e1f7cb5b398', 'a434ba5bfda175d97707e19e142e775c1f7ac4b3c82fe18d382dd83412c74a43', '015e3ad667f38ccfda2cab8a6f6e70ad4657b8bc89aebd2dd565c946057f6b2a'];
for(let lv=1;lv<=6;lv++)for(const enhanced of [false,...([1,2,4,5].includes(lv)?[true]:[])]){
 const p=vm.runInContext(`genHex(rng(hash('hex-compat-'+${lv})),${lv},false,${enhanced})`,c);
 assert.equal(createHash('sha256').update(JSON.stringify(p)).digest('hex'),hashes[lv-1]);
}
console.log('OK: zes oude Hexcells-borden, Makkelijk/Normaal en de generatiecache behouden');
vm.runInContext(`
// Onafhankelijke lokale controle. Gewone aantallen via doorsnedes en grenzen;
// bij {} of -- alle nog mogelijke vormen toetsen. Geen hexSat/hexSetOf/hexProp.
function canFit(clues,fixed){const values=new Map(fixed),typed=clues.filter(c=>c.type);
 const counts=()=>{const rest=clues.map(c=>{let need=c.cnt;const unknown=new Set();for(const i of c.pos)if(i>=0){if(values.has(i))need-=values.get(i);else unknown.add(i)}return{need,unknown}});
  if(rest.some(c=>c.need<0||c.need>c.unknown.size))return false;if(rest.length<2)return true;assert.equal(rest.length,2);
  const[A,B]=rest,s=[...A.unknown].filter(i=>B.unknown.has(i)).length,x=A.unknown.size-s,y=B.unknown.size-s;return Math.max(0,A.need-x,B.need-y)<=Math.min(s,A.need,B.need)};
 const shape=c=>{const v=c.pos.map(i=>i<0?0:values.get(i));if(v.some(x=>x===undefined))return true;let runs=0;for(let k=0;k<v.length;k++)if(v[k]&&(k? !v[k-1] : !c.cyc||!v[v.length-1]))runs++;if(c.cyc&&v.every(x=>x))runs=1;return c.type===1?runs<=1:runs>=2};
 function search(){if(!counts()||typed.some(c=>!shape(c)))return false;const next=typed.flatMap(c=>c.pos).find(i=>i>=0&&!values.has(i));if(next===undefined)return true;
  for(const v of[0,1]){values.set(next,v);if(search()){values.delete(next);return true}}values.delete(next);return false}return search()}
function profile(p,verify){assert.ok(p);S={p,hx:{rev:new Set([...p.rev0,...p.zs])}};const seq=[],kinds=new Set();
 while(p.sol.some((v,i)=>v&&!S.hx.rev.has(i))&&seq.length<p.n){const h=hexHint();assert.ok(h&&h.proof);assert.notEqual(h.proof.rule,'global');assert.ok(h.proof.clues.length<=2,'geen drietallen nodig');
  const fixed=new Map([...S.hx.rev].map(i=>[i,p.sol[i]]));
  for(const o of h.proof.clues){kinds.add(o.kind);if(o.kind==='ring'){assert.ok(S.hx.rev.has(o.id));assert.equal(p.sol[o.id],0);assert.ok(!p.qs.includes(o.id))}else if(o.kind==='zone')assert.ok(p.zs.includes(o.id)||p.zh.includes(o.id)&&S.hx.rev.has(o.id));else if(o.kind==='line')assert.ok(p.lineShow.includes(o.id));
   assert.equal(o.c.cnt,o.c.pos.reduce((n,i)=>n+(i<0?0:p.sol[i]),0));}
  for(const i of h.cells){assert.ok(!S.hx.rev.has(i));if(h.f!=null)assert.equal(h.f,p.sol[i]);if(verify){fixed.set(i,1-p.sol[i]);assert.ok(!canFit(h.proof.clues.map(o=>o.c),fixed),'tegenkleur moet onmogelijk zijn');fixed.delete(i)}}
  seq.push(h.proof.clues.length);h.cells.forEach(i=>S.hx.rev.add(i));
 }
 assert.ok(p.sol.every((v,i)=>!v||S.hx.rev.has(i)));return{total:seq.length,comb:seq.filter(n=>n===2).length,single:seq.filter(n=>n===1).length,seq,kinds}}
const reports={},allShapes=new Set(),allKinds=new Set();let checked=0;
for(const lv of[3,6]){let before=0,after=0,beforeTotal=0,afterTotal=0,maxMs=0,minComb=Infinity,maxRatio=0;
 for(let n=0;n<8;n++){const seed=n<4?'hex2026-10-'+(24+n)+'.'+lv:'qhex-test-'+lv+'-'+n;
  const old=genHex(rng(hash(seed)),lv,false,false),start=Date.now(),p=genHex(rng(hash(seed)),lv,false);maxMs=Math.max(maxMs,Date.now()-start);assert.ok(p);
  const a=profile(old,false),b=profile(p,true),rating=hexDifficulty(p,p.rev0,p.lineShow,p.zs);
  assert.ok(rating.all);assert.deepEqual(rating.seq,b.seq,'selectiemeting volgt exact de echte hints');assert.equal(p.st.pairs,b.comb);assert.equal(p.st.moves,b.total);
  assert.ok(b.comb>=2);assert.ok(b.single>b.comb,'gewone stappen blijven in de meerderheid');
  before+=a.comb;after+=b.comb;beforeTotal+=a.total;afterTotal+=b.total;minComb=Math.min(minComb,b.comb);maxRatio=Math.max(maxRatio,b.comb/b.total);allShapes.add(p.shape);b.kinds.forEach(k=>allKinds.add(k));checked++;
 }
assert.ok(after/afterTotal>before/beforeTotal,'combinatie-aandeel moet toenemen op niveau '+lv);
 reports[lv]={puzzles:8,before,after,beforeShare:Math.round(100*before/beforeTotal),afterShare:Math.round(100*after/afterTotal),minComb,maxShare:Math.round(100*maxRatio),maxMs};
 console.log('OK: niveau '+lv+' volledig via lokale hints; '+reports[lv].beforeShare+'% → '+reports[lv].afterShare+'% combinatiestappen');
}
assert.ok(allShapes.size>=3,'afwisseling in bordvormen');for(const kind of['ring','zone','line'])assert.ok(allKinds.has(kind));
console.log('OK: '+checked+' nieuwe Hexcells-puzzels, elke afleiding onafhankelijk gecontroleerd, '+allShapes.size+' bordvormen');console.log(JSON.stringify(reports));
`,c,{timeout:180000});
