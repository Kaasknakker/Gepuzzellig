/* ---------- Star Battle ---------- */
function starChoices(N,K){const ch=[];if(K===1){for(let a=0;a<N;a++)ch.push([a])}else for(let a=0;a<N;a++)for(let b=a+2;b<N;b++)ch.push([a,b]);return ch}
function starSolve(reg,N,lim,K){K=K||2;const sols=[],ch=starChoices(N,K),col=Array(N).fill(0),rc=Array(N).fill(0),cur=[],last=Array(N).fill(-1);
 for(let i=0;i<N*N;i++)last[reg[i]]=Math.max(last[reg[i]],i/N|0);
 (function rec(r){if(sols.length>=lim)return;if(r===N){sols.push(cur.slice());return}
  for(const cs of ch){if(cs.some(c=>col[c]>=K))continue;
   if(r&&cur[r-1].some(p=>cs.some(c=>Math.abs(c-p)<2)))continue;
   const gs=cs.map(c=>reg[r*N+c]),inc=new Map();let bad=false;gs.forEach(x=>inc.set(x,(inc.get(x)||0)+1));
   for(const[x,n]of inc)if(rc[x]+n>K){bad=true;break}
   if(bad)continue;
   cs.forEach(c=>col[c]++);gs.forEach(x=>rc[x]++);cur[r]=cs;let ok=true;
   for(let x=0;x<N;x++)if(last[x]===r&&rc[x]!==K){ok=false;break}
   if(ok)for(let c=0;c<N;c++)if(K-col[c]>N-1-r){ok=false;break}
   if(ok)rec(r+1);
   cs.forEach(c=>col[c]--);gs.forEach(x=>rc[x]--);cur.length=r}})(0);
 return sols}
function starRandSol(N,R,K){K=K||2;const rows=[],col=Array(N).fill(0),ch=starChoices(N,K);
 const ok=(function rec(r){if(r===N)return true;
  for(const cs of shuf(ch.slice(),R)){if(cs.some(c=>col[c]>=K))continue;
   if(r&&rows[r-1].some(p=>cs.some(c=>Math.abs(c-p)<2)))continue;
   cs.forEach(c=>col[c]++);rows[r]=cs;let f=true;for(let c=0;c<N;c++)if(K-col[c]>N-1-r){f=false;break}
   if(f&&rec(r+1))return true;cs.forEach(c=>col[c]--);rows.length=r}return false})(0);
 return rows}
function starRegions(sol,N,R,K){K=K||2;const reg=Array(N*N).fill(-1),stars=[];
 sol.forEach((cs,r)=>cs.forEach(c=>stars.push(r*N+c)));
 const dist=(x,y)=>Math.abs((x/N|0)-(y/N|0))+Math.abs(x%N-y%N),left=shuf(stars.slice(),R),pr=[];
 if(K===1)stars.forEach(s=>pr.push([s]));else while(left.length){const s=left.pop();left.sort((x,y)=>dist(s,x)-dist(s,y));const t=left.splice(Math.min(left.length-1,R()*3|0),1)[0];pr.push([s,t])}
 pr.forEach((gr,k)=>gr.forEach(s=>{reg[s]=k}));
 for(let k=0;k<pr.length;k++){if(pr[k].length<2)continue;const[s,t]=pr[k],par=new Map([[s,-1]]),q=[s];let found=false;
  while(q.length&&!found){const x=q.shift();for(const y of shuf(nb4(x,N),R)){if(par.has(y))continue;if(y===t){par.set(y,x);found=true;break}if(reg[y]===-1){par.set(y,x);q.push(y)}}}
  if(!found)return null;let x=par.get(t);while(x!==s){reg[x]=k;x=par.get(x)}}
 for(let f=reg.filter(v=>v<0).length;f>0;f--){const fr=[];
  for(let i=0;i<N*N;i++)if(reg[i]<0)for(const y of nb4(i,N))if(reg[y]>=0)fr.push([i,reg[y]]);
  const[i,g]=fr[R()*fr.length|0];reg[i]=g}
 return reg}
function regionOK(reg,N,g,c){const cells=[];for(let i=0;i<N*N;i++)if(reg[i]===g&&i!==c)cells.push(i);
 const seen=new Set([cells[0]]),q=[cells[0]];while(q.length){const x=q.pop();for(const y of nb4(x,N))if(reg[y]===g&&y!==c&&!seen.has(y)){seen.add(y);q.push(y)}}
 return seen.size===cells.length}
/* Fast logical Star Battle solver (generator side). Same deductions as the hint engine:
   basic (unit full / exact / "only touching cells left"), confinement of k regions in k lines,
   look: "a star here leaves some row/column/region without room".
   opt: {look:0|1|2, conf:maxk}. Returns decided-cell count (N*N = solved), -1 on contradiction. */
const SLC={};
function slPre(N){if(SLC[N])return SLC[N];const NN=N*N,nbr=[];
 for(let i=0;i<NN;i++){const r=i/N|0,c=i%N,o=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if((dr||dc)&&rr>=0&&rr<N&&cc>=0&&cc<N)o.push(rr*N+cc)}nbr.push(o)}
 const combos=[];for(let k=0;k<=4;k++){const out=[];(function rec(s,m,n){if(n===k){out.push(m);return}for(let i=s;i<N;i++)rec(i+1,m|1<<i,n+1)})(0,0,0);combos.push(out)}
 return SLC[N]={nbr,combos}}
const bitc=m=>{let n=0;while(m){m&=m-1;n++}return n};
function starLogic(reg,N,K,opt){
 const NN=N*N,st=new Int8Array(NN),{nbr,combos}=slPre(N),U=3*N,units=[],R=new Int8Array(NN),C=new Int8Array(NN);
 for(let k=0;k<U;k++)units.push([]);
 for(let i=0;i<NN;i++){R[i]=i/N|0;C[i]=i%N;units[R[i]].push(i);units[N+C[i]].push(i);units[2*N+reg[i]].push(i)}
 const adj=(a,b)=>Math.abs(R[a]-R[b])<=1&&Math.abs(C[a]-C[b])<=1;
 const roomFor=(cs,need)=>{if(need<=0)return true;if(!cs.length)return false;if(need<2)return true;
  for(let x=0;x<cs.length;x++)for(let y=x+1;y<cs.length;y++)if(!adj(cs[x],cs[y]))return true;return false};
 const star=i=>{st[i]=2;for(const j of nbr[i])if(st[j]===0)st[j]=1};
 const stat=u=>{let a=0;const cs=[];for(const i of units[u]){if(st[i]===2)a++;else if(st[i]===0)cs.push(i)}return[a,cs]};
 function basic(){let ch=false;for(let u=0;u<U;u++){const[a,cs]=stat(u);if(!cs.length)continue;
   if(a===K){for(const i of cs)st[i]=1;ch=true;continue}
   const need=K-a;if(cs.length===need){for(const i of cs)if(st[i]===0)star(i);ch=true;continue}
   if(need===2)for(const x of cs){if(!roomFor(cs.filter(y=>y!==x),2)){star(x);ch=true;break}}}
  return ch}
 function conf(k){let ch=false;
  for(const dir of[0,1]){const L=dir?C:R,rm=new Int32Array(N),lm=new Int32Array(N);// rm[g]: lines used by open cells of region g; lm[l]: regions with open cells in line l
   for(let i=0;i<NN;i++)if(st[i]!==1){rm[reg[i]]|=1<<L[i];lm[L[i]]|=1<<reg[i]}
   for(const M of combos[k]){let ins=0,tm=0;for(let g=0;g<N;g++)if(rm[g]&&!(rm[g]&~M))ins|=1<<g;for(let l=0;l<N;l++)if(M>>l&1)tm|=lm[l];
    if(bitc(ins)===k)for(let i=0;i<NN;i++)if(st[i]===0&&(M>>L[i]&1)&&!(ins>>reg[i]&1)){st[i]=1;ch=true}
    if(bitc(tm)===k)for(let i=0;i<NN;i++)if(st[i]===0&&(tm>>reg[i]&1)&&!(M>>L[i]&1)){st[i]=1;ch=true}
    if(ch)return true}}
  return ch}
 function look1(){let ch=false;const A=new Int8Array(U),CS=[],PR=[],stp=new Int32Array(U);
  for(let u=0;u<U;u++){let a=0;const cs=[];for(const i of units[u]){if(st[i]===2)a++;else if(st[i]===0)cs.push(i)}A[u]=a;CS.push(cs);
   if(K-a>=2){const pr=[];for(let p=0;p<cs.length;p++)for(let q=p+1;q<cs.length;q++)if(!adj(cs[p],cs[q]))pr.push(cs[p],cs[q]);PR.push(pr)}else PR.push(null)}
  const chk=(u,x)=>{if(stp[u]===x+1)return true;stp[u]=x+1;const own=u===R[x]||u===N+C[x]||u===2*N+reg[x],need=K-A[u]-(own?1:0);if(need<=0)return true;
   const rx=R[x],cx=C[x],far=j=>st[j]===0&&(Math.abs(R[j]-rx)>1||Math.abs(C[j]-cx)>1);
   if(need===1){for(const j of CS[u])if(far(j))return true;return false}
   const pr=PR[u];for(let k=0;k<pr.length;k+=2)if(far(pr[k])&&far(pr[k+1]))return true;return false};
  for(let x=0;x<NN;x++){if(st[x]!==0)continue;const r=R[x],c=C[x];let ok=true;
   for(let d=-1;d<=1&&ok;d++){if(r+d>=0&&r+d<N&&!chk(r+d,x))ok=false;if(ok&&c+d>=0&&c+d<N&&!chk(N+c+d,x))ok=false}
   if(ok&&!chk(2*N+reg[x],x))ok=false;
   for(const j of nbr[x]){if(!ok)break;if(!chk(2*N+reg[j],x))ok=false}
   if(!ok){st[x]=1;ch=true}}
  return ch}
 function look2(){let ch=false;for(let x=0;x<NN;x++){if(st[x]!==0)continue;const sv=st.slice();star(x);
   for(const u of[R[x],N+C[x],2*N+reg[x]]){const[a,cs]=stat(u);if(a===K)for(const j of cs)st[j]=1}
   let bad=false;for(let u=0;u<U&&!bad;u++){const[a,cs]=stat(u);if(a>K||!roomFor(cs,K-a))bad=true}
   st.set(sv);if(bad){st[x]=1;ch=true}}
  return ch}
 const order=[basic,()=>conf(1)];
 if(opt.look>=1)order.push(look1);
 for(let k=2;k<=opt.conf;k++){order.push(()=>conf(k));if(k===2&&opt.look>=2)order.push(look2)}
 if(opt.conf<2&&opt.look>=2)order.push(look2);
 let guard=0;
 outer:while(guard++<500){for(const f of order){if(f())continue outer}break}
 let n=0;for(let i=0;i<NN;i++)if(st[i])n++;
 for(let u=0;u<U;u++){const[a,cs]=stat(u);if(a>K||!roomFor(cs,K-a))return -1}
 return n}
const STLV={1:[8,1,{look:1,conf:1}],2:[9,2,{look:1,conf:2}],3:[10,2,{look:1,conf:3}],4:[7,1,{look:1,conf:1}],5:[8,2,{look:1,conf:2}],6:[9,2,{look:1,conf:3}]};
/* Bouw gebieden rond een vaste oplossing en schuif grensvakjes tot de puzzel met de toegestane redeneringen helemaal oplosbaar is.
   Alles telt in stappen, niet in tijd: zo krijgt elk apparaat met dezelfde seed precies dezelfde puzzel. */
/* Fase 1: schuif grensvakjes tot de puzzel met de toegestane redeneringen oplosbaar is.
   Fase 2 (rq): blijf schuiven, zolang hij oplosbaar blijft, tot je hem NIET meer kunt oplossen zonder gebieden over
   meerdere rijen/kolommen te tellen. Zo komt die mooie stap echt in elke puzzel voor. */
function starClimb(R,N,K,opt,EV,rq,rq3,EV2){let rows,reg;do{rows=starRandSol(N,R,K);reg=starRegions(rows,N,R,K)}while(!reg);
 const sol=Array(N*N).fill(0);rows.forEach((cs,r)=>cs.forEach(c=>{sol[r*N+c]=1}));
 const mv=()=>{for(let t=0;t<40;t++){const c=R()*N*N|0;if(sol[c])continue;const gs=[...new Set(nb4(c,N).map(y=>reg[y]).filter(x=>x!==reg[c]))];if(!gs.length||!regionOK(reg,N,reg[c],c))continue;const old=reg[c];reg[c]=gs[R()*gs.length|0];return[c,old]}return null};
 let cur=starLogic(reg,N,K,opt),e=0;
 while(e<EV&&cur!==N*N){const T=Math.max(.3,6*(1-e/EV)),m=mv();if(!m)break;const sc=starLogic(reg,N,K,opt);e++;if(sc>=cur||R()<Math.exp((sc-cur)/T))cur=sc;else reg[m[0]]=m[1]}
 if(cur!==N*N)return null;
 const res=()=>({N,K,reg:reg.slice(),sol});if(!rq)return res();
 const brk=(q,budget)=>{let r=starLogic(reg,N,K,q);if(r<N*N)return true;
  for(let e2=0;e2<budget;e2++){const m=mv();if(!m)return false;if(starLogic(reg,N,K,opt)!==N*N){reg[m[0]]=m[1];continue}
   const r2=starLogic(reg,N,K,q);if(r2<N*N)return true;if(r2<=r||R()<.25)r=r2;else reg[m[0]]=m[1]}return false};
 if(!brk(rq,EV2))return null;
 if(rq3){const keep=reg.slice();if(!brk(rq3,EV2)){for(let i=0;i<N*N;i++)reg[i]=keep[i]}}
 return res()}
const STRQ={1:null,2:{look:2,conf:1},3:{look:2,conf:1},4:null,5:{look:2,conf:1},6:{look:2,conf:1}},STRQ3={3:{look:2,conf:2},6:{look:2,conf:2}};
/* Variatie: niet elke puzzel hoeft de telstap over meerdere rijen/kolommen. Kans per niveau (vast per dag, dus voor jullie allebei gelijk). */
const STP={2:.4,3:.6,5:.35,6:.55};
function genStar(R,lv,hard){const[N,K,opt]=STLV[lv]||STLV[2],need=!!STRQ[lv]&&(hard||R()<(STP[lv]||0)),deep=need&&!!STRQ3[lv]&&R()<(hard?.85:.5);
 for(let a=0;a<60;a++){const h=starClimb(R,N,K,opt,600,need?STRQ[lv]:null,deep?STRQ3[lv]:null,400);if(h)return h}
 for(let a=0;a<80;a++){const h=starClimb(R,N,K,opt,600);if(h)return h}
 for(let a=0;a<80;a++){const h=starClimb(R,N,K,{look:2,conf:4},600);if(h)return h}
 return genStarU(R,N,K)}
function genStarU(R,N,K){let fb=null;
 for(let a=0;a<400;a++){const rows=starRandSol(N,R,K),reg=starRegions(rows,N,R,K);if(!reg)continue;
  const sol=Array(N*N).fill(0);rows.forEach((cs,r)=>cs.forEach(c=>{sol[r*N+c]=1}));const key=s=>s.join(";"),sk=key(rows);
  fb={N,K,reg,sol};
  for(let it=0;it<120;it++){const ss=starSolve(reg,N,2,K);if(ss.length<2)return fb;
   const alt=ss.find(s=>key(s)!==sk),cand=[];alt.forEach((cs,r)=>cs.forEach(c=>{if(!sol[r*N+c])cand.push(r*N+c)}));
   let moved=false;for(const c of shuf(cand,R)){const gs=[...new Set(nb4(c,N).map(y=>reg[y]).filter(x=>x!==reg[c]))];
    if(!gs.length||!regionOK(reg,N,reg[c],c))continue;reg[c]=gs[R()*gs.length|0];moved=true;break}
   if(!moved)break}}
 return fb}

