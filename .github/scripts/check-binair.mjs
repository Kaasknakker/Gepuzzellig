// Moeilijkheid meten met de echte hints; oplossingen apart controleren.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c=vm.createContext({console,assert});
vm.runInContext('let S={};',c);
for(const file of ['shared','binair'])vm.runInContext(fs.readFileSync('js/puzzles/'+file+'.js','utf8'),c);
const core=fs.readFileSync('js/core.js','utf8');
vm.runInContext(core.slice(core.indexOf('const BLc='),core.indexOf('/* ---- Nonogram-hint')),c);
vm.runInContext('const GV="g17",MGV="m5",PGV="p2",BGV="b2",GEN={bin:genBin},nonoMixOn=()=>false;let savedGen={};const lsGet=k=>savedGen[k],lsSet=(k,v)=>savedGen[k]=v;',c);
vm.runInContext(core.slice(core.indexOf('function binVersion('),core.indexOf('/* Weekend (zaterdag')),c);
vm.runInContext(`
assert.equal(binVersion('bin2026-10-23.3'),'b1');assert.equal(binVersion('bin2026-10-24.3'),'b2');
assert.equal(binVersion('qold',{seed:'qold'}),'b1');assert.equal(binVersion('qold',{seed:'qold',bv:'b1'}),'b1');
assert.equal(binVersion('qnew',{seed:'qold'}),'b2');assert.equal(binVersion('qnew',{seed:'qnew',bv:'b2'}),'b2');
savedGen.pdgen=JSON.stringify({'g17|bin|qold|3':JSON.stringify({oldBoard:true})});
assert.ok(genCached('bin','qold',3,false,'classic',null,'b1').oldBoard);
assert.ok(!genCached('bin','qold',3,false,'classic',null,'b2').oldBoard);
assert.ok(genCached('bin','qold',3,false,'classic',null,'b1').oldBoard);
`,c);
// Vastgelegd met de ongewijzigde generator uit commit 5a8f206.
const hashes=[
'9beed95b1c28ec5d216a124a48f78a6d12c131cf29521700c109f8fc48efe4c8',
'a85e22c1fd3f2c408fc80204b72b081767c72ba13cb3c034e51c69ef439dc481',
'cd6507883b4e425e61200806a8fe4663ae5049a8dca7e67b7ba6241dedadfd2c',
'b4796a1fbc820559053fa97e132062b6bdfcedc45e3be10b5cd98e88895f1597',
'bfffa7bf3e46f2d7be402b743c12d0c38dee7ef29a88ec62c835d1d1d248fd5a',
'0eefaa4fce1983655f0b3bed6a38170441ccd8ff03ff06efec6254a4b1272950'];
for(let lv=1;lv<=6;lv++)for(const enhanced of [false,...([1,2,4,5].includes(lv)?[true]:[])]){
 const p=vm.runInContext(`genBin(rng(hash('binair-compat-'+${lv})),${lv},false,${enhanced})`,c);
 assert.equal(createHash('sha256').update(JSON.stringify(p)).digest('hex'),hashes[lv-1]);
}
console.log('OK: oude borden, Makkelijk/Normaal en gescheiden generatiecache behouden');
vm.runInContext(`
// Eigen lijnpatronen en volledige oplossingteller, los van binHuman/binSolve.
const patterns={};function validPatterns(n){if(patterns[n])return patterns[n];const out=[];
 function rec(v,ones){if(ones>n/2||v.length-ones>n/2)return;if(v.length===n){out.push(v);return}
  for(const a of[0,1])if(v.length<2||v[v.length-1]!==a||v[v.length-2]!==a)rec([...v,a],ones+a)}rec([],0);return patterns[n]=out}
function countSolutions(p){const W=p.W,H=p.H,lines=[];for(let r=0;r<H;r++)lines.push(Array.from({length:W},(_,x)=>r*W+x));for(let x=0;x<W;x++)lines.push(Array.from({length:H},(_,r)=>r*W+x));
 function solve(start){const g=start.slice();let changed=true;
  while(changed){changed=false;for(let q=0;q<lines.length;q++){const line=lines[q],v=line.map(i=>g[i]),same=lines.filter((_,j)=>(j<H)===(q<H)&&j!==q).map(l=>l.map(i=>g[i])).filter(l=>!l.includes(-1));
    const options=validPatterns(line.length).filter(a=>v.every((x,k)=>x<0||a[k]===x)&&!same.some(b=>a.every((x,k)=>x===b[k])));if(!options.length)return 0;
    for(let k=0;k<v.length;k++)if(g[line[k]]<0&&options.every(a=>a[k]===options[0][k])){g[line[k]]=options[0][k];changed=true}}}
  const i=g.indexOf(-1);if(i<0)return 1;g[i]=0;const a=solve(g);if(a>=2)return 2;g[i]=1;return Math.min(2,a+solve(g))}
 return solve(p.giv)}
function hintProfile(p){S={p,cur:p.giv.slice()};let advanced=0,total=0;const rules={};
 while(S.cur.includes(-1)&&total<=p.W*p.H){const h=binHint();assert.ok(h&&h.proof,'geen verborgen antwoord of ontbrekende hint');assert.equal(h.kind,'tech');
  for(const i of h.cells){assert.equal(S.cur[i],-1);assert.equal(h.set,p.sol[i]);S.cur[i]=h.set}const rule=h.proof.rule;rules[rule]=(rules[rule]||0)+1;if(!['pair','gap','balance'].includes(rule))advanced++;total++}
 assert.deepEqual(S.cur,p.sol);return{advanced,total,rules}}
const report={};
for(const lv of[3,6]){let oldSum=0,newSum=0,oldTotal=0,newTotal=0,maxMs=0,minAdvanced=Infinity;
 for(let n=0;n<16;n++){const seed=n<8?'bin2026-10-'+String(24+n).padStart(2,'0')+'.'+lv:'qtest-binair-'+lv+'-'+n;
  const old=genBin(rng(hash(seed)),lv,false,false),start=Date.now(),p=genBin(rng(hash(seed)),lv,false);maxMs=Math.max(maxMs,Date.now()-start);
  const d=binDifficulty(p);assert.ok(d.solved&&!d.basicSolved);assert.ok(d.advanced>=(lv===3?6:4));
  assert.equal(countSolutions(p),1,'één oplossing '+seed);
  const oldHints=hintProfile(old),newHints=hintProfile(p);assert.ok(newHints.advanced>=3,'meerdere gevorderde hints');minAdvanced=Math.min(minAdvanced,newHints.advanced);
  oldSum+=oldHints.advanced;newSum+=newHints.advanced;oldTotal+=oldHints.total;newTotal+=newHints.total;
  assert.ok(p.giv.filter(x=>x>=0).length<=old.giv.filter(x=>x>=0).length);
 }
 assert.ok(newSum>oldSum);assert.ok(newSum/newTotal>oldSum/oldTotal);
 report[lv]={puzzles:16,oldAdvanced:oldSum,newAdvanced:newSum,oldShare:Math.round(100*oldSum/oldTotal),newShare:Math.round(100*newSum/newTotal),minAdvanced,maxMs};
 const reserve=genBin0(rng(hash('binair-moeilijk-reserve-'+lv)),lv,false,true),r=binDifficulty(reserve);assert.ok(r.solved&&!r.basicSolved&&r.advanced>=(lv===3?6:4));assert.equal(countSolutions(reserve),1);hintProfile(reserve);
 // Ook de begrensde terugval wordt daadwerkelijk doorlopen.
 let calls=0;const original=genBin0;genBin0=(...args)=>{calls++;return calls<=6?{W:4,H:4,giv:[0,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0],sol:[]}:original(...args)};
 try{const p=genBin(rng(hash('force-fallback')),lv,false);assert.equal(calls,7);assert.deepEqual(p,reserve)}finally{genBin0=original}
}
console.log('OK: 32 nieuwe Binair-puzzels uniek, zonder gokken via echte hints oplosbaar; twee reserves gecontroleerd');console.log(JSON.stringify(report));
`,c,{timeout:120000});
