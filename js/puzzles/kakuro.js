/* ---------- Kakuro ---------- */
let KW=8;
function kakCount(order,hr,vr,runs,lim,sols){const used=Array(runs.length).fill(0),sm=Array(runs.length).fill(0),ct=Array(runs.length).fill(0),cur=[];let n=0,nodes=0;
 const okr=(id,d)=>{const t=runs[id].sum,len=runs[id].cells.length,s=sm[id]+d,rem=len-ct[id]-1;if(rem===0)return s===t;const mk=used[id]|(1<<d);let lo=0,hi=0,a=0,b=0;for(let x=1;x<=9&&a<rem;x++)if(!(mk>>x&1)){lo+=x;a++}for(let x=9;x>=1&&b<rem;x--)if(!(mk>>x&1)){hi+=x;b++}return a===rem&&s+lo<=t&&s+hi>=t};
 (function rec(k){if(n>=lim||nodes>60000)return;nodes++;if(k===order.length){n++;if(sols)sols.push(cur.slice());return}
  const i=order[k],a=hr[i],b=vr[i];
  for(let d=1;d<=9;d++){const m=1<<d;if(used[a]&m||used[b]&m||!okr(a,d)||!okr(b,d))continue;
   used[a]|=m;used[b]|=m;sm[a]+=d;sm[b]+=d;ct[a]++;ct[b]++;cur[k]=d;rec(k+1);used[a]&=~m;used[b]&=~m;sm[a]-=d;sm[b]-=d;ct[a]--;ct[b]--}})(0);
 return nodes>60000?99:n}
/* Menselijke Kakuro-oplosser: per reeks alleen de cijfercombinaties die de som halen en in de vakjes passen; kruisende reeksen beperken elkaar. */
const KC={};function kakCombos(L,S){const k=L+","+S;if(KC[k])return KC[k];const out=[];for(let m=2;m<1024;m+=2){let n=0,s=0;for(let d=1;d<=9;d++)if(m>>d&1){n++;s+=d}if(n===L&&s===S)out.push(m)}return KC[k]=out}
function kakRunAllowed(r,cand){const L=r.cells.length,al=new Int32Array(L),asg=[];
 for(const m of kakCombos(L,r.sum)){const cs=r.cells.map(c=>cand[c]&m);if(cs.some(x=>!x))continue;
  (function rec(k,used){if(k===L){for(let j=0;j<L;j++)al[j]|=1<<asg[j];return}for(let d=1;d<=9;d++){if(!(cs[k]>>d&1)||(used>>d&1))continue;asg[k]=d;rec(k+1,used|1<<d)}})(0,0)}
 return al}
function kakHuman(p,cand0){const n=p.W*p.H,cand=cand0?Int32Array.from(cand0):new Int32Array(n);if(!cand0)for(let i=0;i<n;i++)if(p.w[i])cand[i]=1022;
 for(let it=0;it<300;it++){let ch=false;
  for(const r of p.runs){const al=kakRunAllowed(r,cand);r.cells.forEach((c,j)=>{const nv=cand[c]&al[j];if(nv!==cand[c]){cand[c]=nv;ch=true}})}
  if(!ch)break}
 let k=0;for(let i=0;i<n;i++)if(p.w[i]){const v=cand[i];if(v&&!(v&(v-1)))k++}
 return{n:k,cand}}
function genKak(R){const W=KW,H=KW;let fb=null;
 for(let t=0;t<800;t++){const w=Array(W*H).fill(0);
  for(let r=1;r<H;r++)for(let c=1;c<W;c++)w[r*W+c]=R()<.68?1:0;
  let ch=true;while(ch){ch=false;for(let i=0;i<W*H;i++)if(w[i]){const r=i/W|0,c=i%W;let hl=1,vl=1;
   for(let k=c-1;k>=1&&w[r*W+k];k--)hl++;for(let k=c+1;k<W&&w[r*W+k];k++)hl++;
   for(let k=r-1;k>=1&&w[k*W+c];k--)vl++;for(let k=r+1;k<H&&w[k*W+c];k++)vl++;
   if(hl<2||vl<2||((hl>5||vl>5)&&R()<.35)){w[i]=0;ch=true}}}
  if(w.reduce((a,b)=>a+b,0)<24)continue;
  const runs=[],hr=Array(W*H).fill(-1),vr=Array(W*H).fill(-1);
  for(let r=1;r<H;r++){let c=1;while(c<W){if(w[r*W+c]){const cells=[];while(c<W&&w[r*W+c]){cells.push(r*W+c);c++}cells.forEach(x=>hr[x]=runs.length);runs.push({cells,sum:0})}else c++}}
  for(let c=1;c<W;c++){let r=1;while(r<H){if(w[r*W+c]){const cells=[];while(r<H&&w[r*W+c]){cells.push(r*W+c);r++}cells.forEach(x=>vr[x]=runs.length);runs.push({cells,sum:0})}else r++}}
  const order=[];for(let i=0;i<W*H;i++)if(w[i])order.push(i);
  const val=Array(W*H).fill(0),used=Array(runs.length).fill(0);let nodes=0;
  const fill=k=>{if(k===order.length)return true;if(++nodes>20000)return false;const i=order[k];
   for(const d of shuf([1,2,3,4,5,6,7,8,9],R)){const m=1<<d;if(used[hr[i]]&m||used[vr[i]]&m)continue;used[hr[i]]|=m;used[vr[i]]|=m;val[i]=d;if(fill(k+1))return true;used[hr[i]]&=~m;used[vr[i]]&=~m;val[i]=0}return false};
  if(!fill(0))continue;
  const setSums=()=>runs.forEach(r=>r.sum=r.cells.reduce((a,i)=>a+val[i],0));
  setSums();const sc=()=>kakHuman({W,H,w,runs}).n;let cnt=sc();
  for(let s=0;s<150&&cnt<order.length;s++){
   const i=order[R()*order.length|0],old=val[i],others=new Set();
   for(const id of[hr[i],vr[i]])runs[id].cells.forEach(x=>{if(x!==i)others.add(val[x])});
   const opts=[1,2,3,4,5,6,7,8,9].filter(d=>d!==old&&!others.has(d));if(!opts.length)continue;
   val[i]=opts[R()*opts.length|0];setSums();const c2=sc();
   if(c2>=cnt)cnt=c2;else{val[i]=old;setSums()}}
  fb={W,H,w,hr,vr,runs,sol:val};
  if(cnt===order.length)return fb}
 return fb}

