/* ---------- Binair ---------- */
function binLines(N){const out=[];
 (function rec(i,m,ones,l1,l2){if(i===N){if(ones===N/2)out.push(m);return}
  for(const v of[0,1]){if(i>=2&&l1===v&&l2===v)continue;const o=ones+v;if(o>N/2||i+1-o>N/2)continue;rec(i+1,v?m|(1<<i):m,o,v,l1)}})(0,0,0,-1,-1);
 out.s=new Set(out);return out}
function binProp(g,W,H,LW,LH){let ch=true;
 while(ch){ch=false;
  for(let o=0;o<2;o++){const nl=o?W:H,len=o?H:W,L=o?LH:LW,FULL=(1<<len)-1,km=[],vm=[];
   for(let l=0;l<nl;l++){let k=0,v=0;for(let i=0;i<len;i++){const x=o?g[i*W+l]:g[l*W+i];if(x>=0){k|=1<<i;if(x)v|=1<<i}}km[l]=k;vm[l]=v}
   const full=new Set();let nf=0;
   for(let l=0;l<nl;l++)if(km[l]===FULL){if(!L.s.has(vm[l]))return false;full.add(vm[l]);nf++}
   if(full.size<nf)return false;
   for(let l=0;l<nl;l++){if(km[l]===FULL)continue;let and=FULL,or=0,n=0;const k=km[l],v=vm[l];
    for(let j=0;j<L.length;j++){const p=L[j];if((p&k)!==v||full.has(p))continue;and&=p;or|=p;n++}
    if(!n)return false;
    for(let i=0;i<len;i++){if(k>>i&1)continue;let val=-1;if(and>>i&1)val=1;else if(!(or>>i&1))val=0;
     if(val>=0){if(o)g[i*W+l]=val;else g[l*W+i]=val;ch=true}}}}}
 return true}
function binSolve(g,W,H,LW,LH,R,out,bud){if(bud.n--<=0)return;if(!binProp(g,W,H,LW,LH))return;const i=g.indexOf(-1);if(i<0){out.push(g.slice());return}
 for(const v of(R&&R()<.5?[1,0]:[0,1])){const h=g.slice();h[i]=v;binSolve(h,W,H,LW,LH,R,out,bud);if(out.length||bud.n<=0)return}}
/* Menselijke Binair-oplosser: alleen stappen die de hint ook kan uitleggen.
   1 twee gelijke naast elkaar, 2 gat ertussen, 3 helft vol, 4 "als hier X komt is X vol en ontstaan er drie op een rij",
   5 twee rijen/kolommen mogen niet gelijk zijn (nog 2 lege vakjes). */
function binHuman(g,W,H,o){g=g.slice();const L=[];for(let r=0;r<H;r++){const ci=[];for(let c=0;c<W;c++)ci.push(r*W+c);L.push(ci)}for(let c=0;c<W;c++){const ci=[];for(let r=0;r<H;r++)ci.push(r*W+c);L.push(ci)}
 const tri=v=>{for(let k=0;k+2<v.length;k++)if(v[k]>=0&&v[k]===v[k+1]&&v[k]===v[k+2])return true;return false};
 for(let guard=0;guard<4000;guard++){let ch=false;
  for(const ci of L){const n=ci.length,h=n/2,v=ci.map(i=>g[i]);
   for(let k=0;k<n;k++){if(v[k]<0)continue;
    if(k+1<n&&v[k+1]===v[k]){if(k>0&&v[k-1]<0){v[k-1]=1-v[k];ch=true}if(k+2<n&&v[k+2]<0){v[k+2]=1-v[k];ch=true}}
    if(k+2<n&&v[k+2]===v[k]&&v[k+1]<0){v[k+1]=1-v[k];ch=true}}
   for(const a of[0,1]){let c=0;for(const x of v)if(x===a)c++;if(c>h)return null;if(c===h)for(let k=0;k<n;k++)if(v[k]<0){v[k]=1-a;ch=true}}
   if(tri(v))return null;
   if(ch){ci.forEach((i,k)=>{g[i]=v[k]});break}}
  if(ch)continue;if(o&&o.basicOnly)break;
  for(let k=0;k<L.length&&!ch;k++){const ci=L[k],v=ci.map(i=>g[i]),E=[];v.forEach((x,j)=>{if(x<0)E.push(j)});if(E.length!==2)continue;
   for(let m=0;m<L.length;m++){if(m===k||(m<H)!==(k<H))continue;const w=L[m].map(i=>g[i]);if(w.includes(-1))continue;
    if(v.every((x,j)=>x<0||x===w[j])&&w[E[0]]!==w[E[1]]){g[ci[E[0]]]=1-w[E[0]];g[ci[E[1]]]=1-w[E[1]];if(o&&o.stats)o.stats.different++;ch=true;break}}}
  if(ch)continue;
  for(const ci of L){const v=ci.map(i=>g[i]),n=v.length,h=n/2;
   for(let e=0;e<n&&!ch;e++){if(v[e]>=0)continue;for(const a of[0,1]){let c=0;for(const x of v)if(x===a)c++;if(c+1!==h)continue;const t=v.map((x,j)=>j===e?a:x<0?1-a:x);if(tri(t)){g[ci[e]]=1-a;if(o&&o.stats)o.stats.balanceConflict++;ch=true;break}}}
   if(ch)break}
  if(!ch)break}
 return g}
const BINSZ={1:[12,10,.5],2:[18,14,.4],3:[20,16,.3],4:[6,8,.5],5:[8,10,.42],6:[10,14,.32]};
const BLC={};const binLinesC=n=>BLC[n]||(BLC[n]=binLines(n));
function genBin0(R,lv,hard,trimAll){const[W,H,fr0]=BINSZ[lv||2],fr=hard?fr0*.8:fr0,LW=binLinesC(W),LH=binLinesC(H),out=[];
 while(!out.length)binSolve(Array(W*H).fill(-1),W,H,LW,LH,R,out,{n:300});const sol=out[0],g=sol.slice();let giv=W*H;
 for(const i of shuf([...Array(W*H).keys()],R)){if(!trimAll&&giv<=Math.round(W*H*fr))break;
  const t=g.slice();t[i]=-1;const u=binHuman(t,W,H);if(u&&!u.includes(-1)){g[i]=-1;giv--}}
 return{W,H,giv:g,sol}}

/* Moeilijk: haal verder weg zolang dezelfde menselijke technieken de puzzel oplossen.
   Beoordeel daarna alleen gevorderde stappen die ná uitputting van de basis nodig zijn.
   Oude puzzels en Makkelijk/Normaal volgen exact de oude generator. */
function binDifficulty(p){const stats={different:0,balanceConflict:0},g=binHuman(p.giv,p.W,p.H,{stats}),basic=binHuman(p.giv,p.W,p.H,{basicOnly:true});
 return{solved:!!g&&!g.includes(-1),basicSolved:!!basic&&!basic.includes(-1),advanced:stats.different+stats.balanceConflict,...stats}}
function genBin(R,lv,hard,enhanced=true){lv=lv||2;if(!enhanced||(lv!==3&&lv!==6))return genBin0(R,lv,hard,false);
 const enough=p=>{const d=binDifficulty(p);return d.solved&&!d.basicSolved&&d.advanced>=(lv===3?6:4)};
 for(let attempt=0;attempt<6;attempt++){const p=genBin0(R,lv,hard,true);if(enough(p))return p}
 /* Begrens herpogingen, ook op een telefoon. Deze vaste reserve wordt in CI gecontroleerd. */
 return genBin0(rng(hash("binair-moeilijk-reserve-"+lv)),lv,hard,true)}
