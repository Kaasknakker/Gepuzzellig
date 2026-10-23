/* ---------- Hexcells ---------- */
const HDIR=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const HEXR=4;
const HD6=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
function hexBoardOld(R,N){const rm=shuf([[N,0],[N,-N],[0,-N],[-N,0],[-N,N],[0,N]],R).slice(0,R()*4|0),rmk=new Set(rm.map(x=>x.join()));
 const cells=[];for(let q=-N;q<=N;q++)for(let r=Math.max(-N,-q-N);r<=Math.min(N,-q+N);r++)if(!rmk.has(q+","+r))cells.push({q,r});return cells}
function hexConn(cells){const k=new Set(cells.map(c=>c.q+","+c.r)),seen=new Set([cells[0].q+","+cells[0].r]),st=[cells[0]];
 while(st.length){const c=st.pop();for(const[dq,dr]of HD6){const n=(c.q+dq)+","+(c.r+dr);if(k.has(n)&&!seen.has(n)){seen.add(n);st.push({q:c.q+dq,r:c.r+dr})}}}return seen.size===cells.length}
function hexGeo(R,T){const kinds=["hart","kruis","maan","zandloper","eilanden","ster","ovaal","donut"],kind=kinds[R()*kinds.length|0],AR={hart:1.4,kruis:1.65,maan:1.55,zandloper:1.7,eilanden:1,ster:1.5,ovaal:1.8,donut:1.6}[kind];
 const pr={hart:(u,v)=>{v=-v*1.05+.1;u*=.95;const a=u*u+v*v-1;return a*a*a-u*u*v*v*v<=0},
  kruis:(u,v)=>(Math.abs(u)<=.36||Math.abs(v)<=.36)&&Math.abs(u)<=1&&Math.abs(v)<=1,
  maan:(u,v)=>u*u+v*v<=1&&(u-.5)*(u-.5)+v*v>=.5,
  zandloper:(u,v)=>Math.abs(u)<=1&&Math.abs(v)<=.22+.78*Math.abs(u),
  ovaal:(u,v)=>u*u+v*v<=1,donut:(u,v)=>{const d=u*u+v*v;return d<=1&&d>=.2},
  eilanden:(u,v)=>(u-.55)*(u-.55)+v*v<=.2||(u+.55)*(u+.55)+v*v<=.2||(Math.abs(v)<=.2&&Math.abs(u)<=.6),
  ster:(u,v)=>{const r=Math.hypot(u,v),t=Math.atan2(v,u);return r<=.34+.66*Math.pow(Math.max(0,Math.cos(5*t)),1.4)}}[kind];
 const pos=[];for(let q=-14;q<=14;q++)for(let r=-14;r<=14;r++)pos.push([q,r,1.5*q,1.7320508*(r+q/2)]);
 let lo=1.5,hi=14,best=null;
 for(let it=0;it<14;it++){const sc=(lo+hi)/2,cs=pos.filter(p=>pr(p[2]/(sc*AR),p[3]/sc)).map(p=>({q:p[0],r:p[1]}));
  if(cs.length<T)lo=sc;else hi=sc;best=cs}
 best.shape=kind;return best}
const hexAsp=cs=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const x of cs){const X=1.5*x.q,Y=1.7320508*(x.r+x.q/2);if(X<a)a=X;if(X>b)b=X;if(Y<c)c=Y;if(Y>d)d=Y}return(b-a+2)/(d-c+1.7320508)};
const hexFill=cs=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const x of cs){const X=1.5*x.q,Y=1.7320508*(x.r+x.q/2);if(X<a)a=X;if(X>b)b=X;if(Y<c)c=Y;if(Y>d)d=Y}return cs.length*2.598/((b-a+2)*(d-c+1.7320508))};
function hexBoard(R,N0,lv){let best=null,ba=0;for(let t=0;t<30;t++){const c=hexBoardRaw(R,N0,lv),as=hexAsp(c);if(as>=1.3&&(!["ruit","blob","driehoek","ring","hex"].includes(c.shape)||hexFill(c)>=.5))return c;if(as>ba){ba=as;best=c}}
 const T=(HXL[lv]||HXL[2]).T;return hexGeo(()=>(6.5)/8,T)}
function hexBoardRaw(R,N0,lv){const N=N0||HEXR,T=(HXL[lv]||HXL[2]).T,roll=R();let cells=null,shape="hex";
 if(roll<.12){cells=hexBoardOld(R,N)}
 else if(roll<.3){shape="blob";const k=new Set(["0,0"]),L=[{q:0,r:0}];
  while(L.length<T){const fr=new Map();for(const c of L)for(const[dq,dr]of HD6){const q=c.q+dq,r=c.r+dr,key=q+","+r;if(k.has(key))continue;let n=0;for(const[a,b]of HD6)if(k.has((q+a)+","+(r+b)))n++;const d=Math.max(Math.abs(q),Math.abs(r),Math.abs(-q-r));if(d>N+1)continue;fr.set(key,{q,r,w:n*n+(n>=2?3:0)})}
   const arr=[...fr.values()],tot=arr.reduce((a,x)=>a+x.w,0);let x=R()*tot,pick=arr[0];for(const f of arr){x-=f.w;if(x<=0){pick=f;break}}
   k.add(pick.q+","+pick.r);L.push({q:pick.q,r:pick.r})}
  cells=L}
 else if(roll<.38){shape="ring";const hr=lv===1||lv===4?1:R()<.5?1:2;cells=[];for(let q=-N;q<=N;q++)for(let r=Math.max(-N,-q-N);r<=Math.min(N,-q+N);r++){const d=Math.max(Math.abs(q),Math.abs(r),Math.abs(-q-r));if(d>hr||(d===hr&&hr===2&&false))cells.push({q,r})}
  if(hr===1&&N<3)cells=null}
 else if(roll<.46){shape="ruit";const w={1:9,2:12,3:12,4:8,5:11,6:11}[lv||2],h={1:4,2:5,3:6,4:4,5:4,6:5}[lv||2];cells=[];for(let q=0;q<w;q++)for(let r=0;r<h;r++)cells.push({q,r})}
 else if(roll<.54){shape="driehoek";const m={1:7,2:10,3:10,4:6,5:8,6:9}[lv||2];cells=[];for(let q=0;q<=m;q++)for(let r=0;r+q<=m;r++)cells.push({q,r})}
  else{cells=hexGeo(R,T);shape=cells.shape}
 if(!cells||cells.length<20||!hexConn(cells)){cells=hexBoardOld(R,N);shape="hex"}
 if(shape!=="hart"&&shape!=="kruis"&&shape!=="maan"&&shape!=="zandloper"&&shape!=="eilanden"&&shape!=="ster"&&shape!=="ovaal"&&shape!=="donut"){let br=0,bs=0;for(let rot=0;rot<6;rot++){const cc=cells.map(c=>{let q=c.q,r=c.r;for(let i=0;i<rot;i++){const nq=-r,nr=q+r;q=nq;r=nr}return{q,r}}),as=hexAsp(cc)+R()*.02;if(as>bs){bs=as;br=rot}}
  if(br)cells=cells.map(c=>{let q=c.q,r=c.r;for(let i=0;i<br;i++){const nq=-r,nr=q+r;q=nq;r=nr}return{q,r}})}
 cells.shape=shape;return cells}
function hexLines(cells){const lines=[];
 for(let d=0;d<3;d++){const g=new Map();cells.forEach((c,i)=>{const k=d===0?c.q:d===1?c.r:-c.q-c.r;if(!g.has(k))g.set(k,[]);g.get(k).push(i)});
  g.forEach(arr=>{if(arr.length<2)return;arr.sort((a,b)=>d===0?cells[a].r-cells[b].r:cells[a].q-cells[b].q);if(arr.some((x,i)=>i&&(d===0?cells[x].r-cells[arr[i-1]].r:cells[x].q-cells[arr[i-1]].q)!==1))return;
   const f=cells[arr[0]],l=cells[arr[arr.length-1]],v=d===0?[l.q,l.r+1]:d===1?[l.q+1,l.r]:[f.q-1,f.r+1];lines.push({d,idx:arr,vq:v[0],vr:v[1]})})}
 return lines}
const hexRuns=(v,cyc)=>{const m=v.length;if(cyc&&v.every(x=>x))return 1;let r=0;for(let i=0;i<m;i++)if(v[i]&&(cyc?!v[(i+m-1)%m]:(i===0||!v[i-1])))r++;return r};
function hexType(a,c){const v=c.pos.map(p=>p<0?0:a[p]),r=hexRuns(v,c.cyc);return c.type===1?r<=1:r>=2}
function mkClue(pos,cyc,sol,R,pr){pr=pr==null?.6:pr;const v=pos.map(p=>p<0?0:sol[p]),cnt=v.reduce((a,b)=>a+b,0),r=hexRuns(v,cyc);let type=0;
 if(cnt>=2){if(r===1&&R()<pr)type=1;else if(r>=2&&R()<pr)type=2}return{pos,cyc,cnt,type}}
function hexProp(a,cons){let ch=true;
 while(ch){ch=false;for(const c of cons){let k=0,u=0;for(const p of c.pos){if(p<0)continue;const x=a[p];if(x===1)k++;else if(x<0)u++}
  if(k>c.cnt||k+u<c.cnt)return false;
  if(u&&(k===c.cnt||k+u===c.cnt)){const v=k===c.cnt?0:1;for(const p of c.pos)if(p>=0&&a[p]<0)a[p]=v;ch=true}
  else if(!u&&c.type&&!hexType(a,c))return false}}
 return true}
function hexSat(a,cons){if(!hexProp(a,cons))return null;let pick=-1,bu=99;
 for(const c of cons){let u=0,f=-1;for(const p of c.pos)if(p>=0&&a[p]<0){u++;if(f<0)f=p}if(u&&u<bu){bu=u;pick=f}}
 if(pick<0){pick=a.indexOf(-1);if(pick<0)return a}
 for(const v of[1,0]){const b=a.slice();b[pick]=v;const r=hexSat(b,cons);if(r)return r}return null}
function hexDeduce(P,rev,ls,zs){zs=zs||[];const n=P.cells.length,R2=new Set([...rev,...zs]);
 for(;;){const a=Array(n).fill(-1);R2.forEach(i=>{a[i]=P.sol[i]});
  const cons=[];R2.forEach(i=>{if(!P.sol[i])cons.push(P.ring[i])});ls.forEach(j=>cons.push(P.lines[j].clue));zs.forEach(i=>cons.push(P.zone[i]));
  const base=a.slice();if(!hexProp(base,cons))return{all:false,rev:R2};
  const found=[];for(let i=0;i<n;i++){if(R2.has(i))continue;
   if(base[i]>=0)found.push(i);else for(const v of[0,1]){const t=base.slice();t[i]=v;if(!hexSat(t,cons)){found.push(i);break}}}
  if(!found.length)return{all:R2.size===n,rev:R2};
  found.forEach(i=>R2.add(i));if(R2.size===n)return{all:true,rev:R2}}}
/* Lokale deductie: een vakje mag alleen bepaald worden met hooguit maxC aanwijzingen tegelijk (die elkaar raken). */
function hexSatS(a,cons){if(!hexProp(a,cons))return false;let pick=-1,bu=99;
 for(const c of cons){let u=0,f=-1;for(const p of c.pos)if(p>=0&&a[p]<0){u++;if(f<0)f=p}if(u&&u<bu){bu=u;pick=f}}
 if(pick<0)return true;
 for(const v of[1,0]){const b=a.slice();b[pick]=v;if(hexSatS(b,cons))return true}return false}
/* Zelfde als hexProp, maar onthoudt welke aanwijzingen echt iets hebben opgeleverd (U). */
function hexPropU(a,cons,U){let ch=true;
 while(ch){ch=false;for(const c of cons){let k=0,u=0;for(const p of c.pos){if(p<0)continue;const x=a[p];if(x===1)k++;else if(x<0)u++}
  if(k>c.cnt||k+u<c.cnt)return false;
  if(u&&(k===c.cnt||k+u===c.cnt)){const v=k===c.cnt?0:1;for(const p of c.pos)if(p>=0&&a[p]<0)a[p]=v;ch=true;if(U)U.add(c)}
  else if(!u&&c.type&&!hexType(a,c))return false}}
 return true}
/* Twee gewone tel-aanwijzingen (zonder {} of --) samen: dat kan met rekenen in plaats van zoeken.
   s = aantal blauwe in de gedeelde vakjes; het vakje ligt vast als het voor elke mogelijke s dezelfde kleur heeft. */
function hexPair(i,A,B,a){let nA=A.cnt,nB=B.cnt,uA=0,uB=0,S=0;const inB=new Set();
 for(const p of B.pos){if(p<0)continue;const x=a[p];if(x===1)nB--;else if(x<0){inB.add(p);uB++}}
 let iA=false;for(const p of A.pos){if(p<0)continue;const x=a[p];if(x===1)nA--;else if(x<0){uA++;if(inB.has(p))S++;if(p===i)iA=true}}
 const iB=inB.has(i),oA=uA-S,oB=uB-S,lo=Math.max(0,nA-oA,nB-oB),hi=Math.min(S,nA,nB);if(lo>hi)return false;
 if(iA&&iB)return lo===S||hi===0;
 if(iA)return nA-hi===oA||nA-lo===0;
 if(iB)return nB-hi===oB||nB-lo===0;
 return false}
/* Welke onbekende vakjes liggen vast door één of twee aanwijzingen samen? We proberen alle mogelijkheden voor de
   aanwijzing met {} of -- (weinig vakjes) en tellen bij de andere aanwijzing alleen hoeveel blauwe er nog over zijn. */
function hexSetOf(cs,a){
 /* Met de teller (alle vakjes): X heeft precies nX blauwe in zijn eigen vakjes, dus buiten X moeten er nog R-nX blauw zijn. */
 if(cs.length===2&&(cs[0].big||cs[1].big)){const G=cs[0].big?cs[0]:cs[1],X=cs[0].big?cs[1]:cs[0],inX=new Set();let nX=X.cnt;
  for(const p of X.pos){if(p<0)continue;if(a[p]===1)nX--;else if(a[p]<0)inX.add(p)}
  let R=G.cnt;const out=[];for(let p=0;p<a.length;p++){if(a[p]===1)R--;else if(a[p]<0&&!inX.has(p))out.push(p)}
  const res=new Set();if(out.length&&(R===nX||R-nX===out.length))out.forEach(p=>res.add(p));return res}
const[A,B]=cs,typed=cs.filter(c=>c.type);if(cs.length===2&&!typed.length){const r=new Set();for(const c of cs)for(const p of c.pos)if(p>=0&&a[p]<0&&hexPair(p,A,B,a))r.add(p);return r}
 const X=cs.length===1?A:(typed.length===2?(A.pos.filter(p=>p>=0&&a[p]<0).length<=B.pos.filter(p=>p>=0&&a[p]<0).length?A:B):typed[0]),Y=cs.length===1?null:(X===A?B:A);
 const ux=X.pos.filter(p=>p>=0&&a[p]<0),seen=new Map();const mark=(p,v)=>{seen.set(p,(seen.get(p)||0)|(v?2:1))};
 const inX=new Set(ux),uy=Y?Y.pos.filter(p=>p>=0&&a[p]<0&&!inX.has(p)):[];let any=false;
 if((1<<ux.length)*(Y&&Y.type?1<<uy.length:1)>1024)return null;
 const okT=(c,val)=>{const v=c.pos.map(p=>p<0?0:val(p));let k=0;for(const x of v)k+=x;if(k!==c.cnt)return false;return!c.type||hexType2(v,c)};
 for(let m=0;m<1<<ux.length;m++){const asg=new Map();ux.forEach((p,b)=>asg.set(p,m>>b&1));const val=p=>a[p]>=0?a[p]:asg.has(p)?asg.get(p):0;
  if(!okT(X,val))continue;
  if(!Y){any=true;ux.forEach((p,b)=>mark(p,m>>b&1));continue}
  let k=0;for(const p of Y.pos){if(p<0)continue;if(a[p]>=0)k+=a[p];else if(asg.has(p))k+=asg.get(p)}const r=Y.cnt-k,o=uy.length;if(r<0||r>o)continue;
  if(!Y.type){any=true;ux.forEach((p,b)=>mark(p,m>>b&1));uy.forEach(p=>{if(r>=1)mark(p,1);if(r<=o-1)mark(p,0)});continue}
  for(let q=0;q<1<<o;q++){let pc=0;for(let b=0;b<o;b++)pc+=q>>b&1;if(pc!==r)continue;const a2=new Map(asg);uy.forEach((p,b)=>a2.set(p,q>>b&1));
   if(!okT(Y,p=>a[p]>=0?a[p]:a2.get(p)))continue;any=true;ux.forEach((p,b)=>mark(p,m>>b&1));uy.forEach((p,b)=>mark(p,q>>b&1))}}
 const res=new Set();if(any)seen.forEach((v,p)=>{if(v!==3)res.add(p)});return res}
const hexType2=(v,c)=>{const r=hexRuns(v,c.cyc);return c.type===1?r<=1:r>=2};
function hexDeduceL(P,rev,ls,zs,maxC,full,U){zs=zs||[];const n=P.cells.length,R2=new Set([...rev,...zs]),KD=new Map(),prof=[];let steps=0,hard=0;
 const Q=P._q||new Set(P.qs||[]),ZH=P._zh||P.zh||[];
 const zl=c=>KD.get(c)?1:0,ord=a=>a.slice().sort((x,y)=>zl(y)-zl(x));
 for(;;){const a=Array(n).fill(-1);R2.forEach(i=>{a[i]=P.sol[i]});
  const cons=[];R2.forEach(i=>{if(!P.sol[i]&&!Q.has(i))cons.push(P.ring[i])});ls.forEach(j=>{const c=P.lines[j].clue;KD.set(c,1);cons.push(c)});zs.forEach(i=>{KD.set(P.zone[i],1);cons.push(P.zone[i])});ZH.forEach(i=>{if(R2.has(i)){KD.set(P.zone[i],1);cons.push(P.zone[i])}});if(P._G)cons.push(P._G);
  const act=cons.filter(c=>c.pos.some(p=>p>=0&&a[p]<0));
  const base=a.slice();if(!hexPropU(base,act,U))return{all:false,rev:R2,prof};
  const found=[];for(let i=0;i<n;i++)if(!R2.has(i)&&base[i]>=0)found.push(i);
  let rz=-1;
  if(!found.length&&maxC>=2){const cof=new Map();act.forEach(c=>c.pos.forEach(p=>{if(p>=0&&base[p]<0){if(!cof.has(p))cof.set(p,[]);cof.get(p).push(c)}}));
   const nbOf=new Map(),nb=c=>{if(nbOf.has(c))return nbOf.get(c);const s=new Set();c.pos.forEach(p=>{if(p>=0&&base[p]<0)(cof.get(p)||[]).forEach(x=>{if(x!==c)s.add(x)})});const r=ord([...s]);nbOf.set(c,r);return r};
   /* Zoeken op een klein lokaal stukje: alleen de vakjes van deze aanwijzingen (veel sneller dan het hele bord kopiëren). */
   const PC=new Map(),setOf=cs=>{let m=PC.get(cs[0]);if(!m)PC.set(cs[0],m=new Map());const k=cs[1]||cs[0];let r=m.get(k);if(r===undefined){r=hexSetOf(cs,base);m.set(k,r);let m2=PC.get(k);if(!m2)PC.set(k,m2=new Map());m2.set(cs[0],r)}return r};
   const test=(i,cs)=>{if(cs.length===2&&((!cs[0].type&&!cs[1].type)||cs[0].big||cs[1].big))return setOf(cs).has(i);
    const mp=new Map(),b=[],lc=cs.map(c=>({pos:c.pos.map(p=>{if(p<0)return -1;let j=mp.get(p);if(j===undefined){j=b.length;mp.set(p,j);b.push(base[p])}return j}),cyc:c.cyc,cnt:c.cnt,type:c.type}));
    const li=mp.get(i);if(li===undefined)return false;for(const v of[0,1]){const t=b.slice();t[li]=v;if(!hexSatS(t,lc))return true}return false};
   /* eerst één aanwijzing met {n} of -n- (los), dan paren, pas daarna drietallen */
   for(const c of act){if(!c.type)continue;for(const p of c.pos){if(p<0||base[p]>=0||found.includes(p))continue;if(test(p,[c])){found.push(p);if(U)U.add(c);if(!full)break}}if(found.length&&!full)break}
   if(found.length){prof.push({c:0});steps++;found.forEach(i=>R2.add(i));if(R2.size===n)return{all:true,rev:R2,steps,hard,prof};continue}
   for(const[i,cs0]of cof){let done=false;for(const c1 of ord(cs0)){for(const c2 of nb(c1))if(test(i,[c1,c2])){found.push(i);if(U){U.add(c1);U.add(c2)}rz=Math.max(rz,zl(c1)+zl(c2));done=true;break}if(done)break}if(done&&!full)break}
   if(!found.length&&maxC>=3)for(const[i,cs0]of cof){let done=false;
    for(const c1 of ord(cs0)){const n1=nb(c1);for(let x=0;x<n1.length&&!done;x++){const c2=n1[x],n3=new Set(n1.slice(x+1));nb(c2).forEach(c=>{if(c!==c1)n3.add(c)});
      for(const c3 of n3)if(test(i,[c1,c2,c3])){found.push(i);if(U){U.add(c1);U.add(c2);U.add(c3)}hard++;rz=Math.max(rz,zl(c1)+zl(c2)+zl(c3));done=true;break}}if(done)break}
    if(done&&!full)break}}
  if(!found.length)return{all:R2.size===n,rev:R2,hard,prof};
  prof.push(rz<0?{c:0}:{c:1,zl:rz,n:found.length});
  steps++;found.forEach(i=>R2.add(i));if(R2.size===n)return{all:true,rev:R2,steps,hard,prof}}}
/* Meet de speelroute: eerst alle beschikbare losse aanwijzingen, daarna twee
   overlappende aanwijzingen. De volgorde komt overeen met hexHint en wordt in CI
   daarmee vergeleken. Geen drietallen of globale zoekstappen voor de selectie. */
function hexDifficulty(P,rev,ls,zs){const seen=new Set([...rev,...zs]),Q=P._q||new Set(P.qs||[]),hidden=P._zh||P.zh||[],seq=[];
 const G={pos:P.sol.map((_,i)=>i),cyc:false,cnt:P.sol.reduce((a,b)=>a+b,0),type:0};
 for(let guard=0;guard<P.n;guard++){
  if(P.sol.every((v,i)=>!v||seen.has(i)))return{all:true,total:seq.length,comb:seq.filter(x=>x===2).length,single:seq.filter(x=>x===1).length,seq};
  const cons=[];seen.forEach(i=>{if(!P.sol[i]&&!Q.has(i))cons.push({c:P.ring[i],kind:"ring"})});[...zs,...[...hidden].filter(i=>seen.has(i))].forEach(i=>cons.push({c:P.zone[i],kind:"zone"}));ls.forEach(j=>cons.push({c:P.lines[j].clue,kind:"line"}));cons.push({c:G,kind:"rest"});
  let found=null;
  for(const o of cons){let k=0;const hid=[];for(const i of o.c.pos)if(i>=0){if(seen.has(i))k+=P.sol[i];else hid.push(i)}if(hid.length&&(k===o.c.cnt||k+hid.length===o.c.cnt)){found={cells:hid,count:1};break}}
  if(!found){const a=P.sol.map((v,i)=>seen.has(i)?v:-1),act=cons.filter(o=>o.c.pos.some(i=>i>=0&&a[i]<0)),cof=new Map();act.forEach(o=>o.c.pos.forEach(i=>{if(i>=0&&a[i]<0){if(!cof.has(i))cof.set(i,[]);if(!cof.get(i).includes(o))cof.get(i).push(o)}}));
   const weight=o=>o.kind==="rest"?-5:o.kind==="ring"?0:1,order=arr=>arr.slice().sort((x,y)=>weight(y)-weight(x)),neighbors=new Map(),nb=o=>{if(neighbors.has(o))return neighbors.get(o);const set=new Set();o.c.pos.forEach(i=>{if(i>=0&&a[i]<0)(cof.get(i)||[]).forEach(x=>{if(x!==o)set.add(x)})});const r=order([...set]);neighbors.set(o,r);return r};
   const bad=(i,set)=>{const t=a.slice();t[i]=1-P.sol[i];return!hexSatS(t,set.map(o=>o.c))};
   for(const[i,cs]of cof){for(const o of cs)if(bad(i,[o])){found={cells:[i],count:1};break}if(found)break}
   if(!found){let score=-1e9;for(const[i,cs]of cof){for(const o1 of order(cs)){for(const o2 of nb(o1))if(bad(i,[o1,o2])){const value=weight(o1)+weight(o2);if(value>score){score=value;found={cells:[i],count:2,keep:[o1,o2]}}break}}if(score>=2)break}}}
  if(!found)return{all:false,total:seq.length,comb:seq.filter(x=>x===2).length,single:seq.filter(x=>x===1).length,seq};
  if(found.keep&&found.keep.some(o=>o.kind==="rest")){const o=found.keep.find(o=>o.kind!=="rest");if(!o.c.type){const inside=new Set(o.c.pos),out=P.sol.map((_,i)=>i).filter(i=>!seen.has(i)&&!inside.has(i)),need=o.c.cnt-o.c.pos.filter(i=>i>=0&&seen.has(i)).reduce((n,i)=>n+P.sol[i],0),left=G.cnt-[...seen].reduce((n,i)=>n+P.sol[i],0);if(out.includes(found.cells[0])&&((left===need&&!P.sol[found.cells[0]])||(left-need===out.length&&P.sol[found.cells[0]])))found.cells=out}}
  if(found.keep&&!found.keep.some(o=>o.kind==="rest")){const target=found.cells[0],f=P.sol[target],unknown=o=>o.c.pos.filter(i=>i>=0&&!seen.has(i)),need=o=>o.c.cnt-o.c.pos.filter(i=>i>=0&&seen.has(i)).reduce((n,i)=>n+P.sol[i],0);
   for(const[A,B]of[found.keep,found.keep.slice().reverse()]){const UA=unknown(A),UB=unknown(B),shared=UA.filter(i=>UB.includes(i)),outsideA=UA.length-shared.length,outsideB=UB.filter(i=>!shared.includes(i)),nA=need(A),nB=need(B),min=Math.max(0,nA-outsideA),max=Math.min(shared.length,nA);if(!shared.length||!outsideB.includes(target))continue;if((!f&&min===nB&&min>0)||(f&&max===nA&&nB-max===outsideB.length&&outsideB.length>0)){found.cells=outsideB;break}}}
  seq.push(found.count);found.cells.forEach(i=>seen.add(i));
 }
 return{all:false,total:seq.length,comb:0,single:0,seq}}
/* Niveaus. T = ongeveer aantal vakjes, MC = hoeveel aanwijzingen je hooguit tegelijk moet combineren,
   zf = deel van de blauwe vakjes dat een getal krijgt (vóór het weghalen), zr = deel daarvan dat al open ligt,
   q = hoeveel zwarte vakjes hooguit een "?" krijgen (geen getal). */
const HXL={1:{T:36,RAD:3,MC:2,zf:.3,zr:.5,q:0,tries:3},
 2:{T:60,RAD:4,MC:2,zf:.4,zr:.4,q:.15,tries:5},
 3:{T:72,RAD:5,MC:2,zf:.45,zr:.35,q:.35,tries:4},
 4:{T:30,RAD:3,MC:2,zf:.3,zr:.5,q:0,tries:3},
 5:{T:44,RAD:4,MC:2,zf:.4,zr:.4,q:.15,tries:5},
 6:{T:54,RAD:4,MC:2,zf:.45,zr:.35,q:.35,tries:5}};
const HXB={l:-.2,z:0,t:.2},HXB1={l:-.3,z:.1,t:.2};
const HMC={1:HXL[1].MC,2:HXL[2].MC,3:HXL[3].MC,4:HXL[4].MC,5:HXL[5].MC,6:HXL[6].MC};
/* Nieuwe opzet: begin met veel aanwijzingen (alle lijnen, veel blauwe getallen) en haal daarna alles weg wat niet nodig is.
   Zo is elke aanwijzing die overblijft echt nodig. Eerst krijgen zwarte vakjes een "?", dan pas gaan lijnen en blauwe getallen eruit,
   zodat de blauwe getallen en lijnen het werk moeten doen. Daarna kiezen we de puzzel waarbij je de blauwe getallen het meest nodig hebt. */
function genHex(R,lv,hard,enhanced=true){const tough=enhanced&&(lv===3||lv===6);const L0=HXL[lv||2]||HXL[2],L=hard?Object.assign({},L0,{q:L0.q+.1,zf:L0.zf+.05,tries:L0.tries+2}):L0,MC=L.MC;let best=null,bs=-Infinity,ok=0;
 /* Soms (ongeveer 1 op de 3) mag de teller "nog te vinden" nodig zijn; dan krijgen zulke puzzels voorrang. Anders is hij nooit nodig. */
 const useG=R()<.35;
 for(let att=0;att<40&&ok<(tough?L.tries+5:L.tries);att++){const cells=hexBoard(R,L.RAD,lv),n=cells.length,key=new Map(cells.map((c,i)=>[c.q+","+c.r,i]));
  const sol=cells.map(()=>R()<.5?1:0),nb=sol.reduce((a,b)=>a+b,0);if(nb<n*.4||nb>n*.6)continue;
  const ring=cells.map(c=>mkClue(HDIR.map(([dq,dr])=>{const j=key.get((c.q+dq)+","+(c.r+dr));return j===undefined?-1:j}),true,sol,R,1));
  const lines=hexLines(cells).map(l=>({...l,clue:mkClue(l.idx,false,sol,R,1)}));
  const zone=cells.map((c,i)=>{const pos=[];cells.forEach((d,j)=>{if(j===i)return;const dq=d.q-c.q,dr=d.r-c.r;if((Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr))/2<=2)pos.push(j)});const cnt=pos.reduce((a,j)=>a+sol[j],0);return{pos,cyc:false,cnt,type:0}});
  const blue=[],blk=[];sol.forEach((v,i)=>(v?blue:blk).push(i));
  const zn=shuf(blue.filter(i=>zone[i].cnt>0),R).slice(0,Math.max(2,Math.round(blue.length*L.zf))),nzs=Math.max(1,Math.round(zn.length*L.zr));
  const zs=new Set(zn.slice(0,nzs)),zh=new Set(zn.slice(nzs)),ls=new Set(lines.map((_,j)=>j)),rev=new Set(shuf(blk.slice(),R).slice(0,2));
  const cand={cells,sol,ring,lines,zone,n,shape:cells.shape,_q:new Set(),_zh:zh,_G:useG?{pos:cells.map((_,i)=>i),cyc:false,cnt:nb,type:0,big:1}:null};
  /* U = de aanwijzingen die de oplossing echt gebruikt. Een aanwijzing die daar niet in zit kan weg zonder opnieuw te rekenen. */
  let U=new Set();const solv=()=>{const u=new Set(),ok=hexDeduceL(cand,rev,ls,zs,MC,false,u).all;if(ok)U=u;return ok};
  const drop=(x,off,on)=>{off();if(!U.has(x))return;if(!solv())on()};
  let g=0;while(!solv()&&g++<40){const hid=blk.filter(i=>!rev.has(i));if(!hid.length)break;rev.add(hid[R()*hid.length|0])}
  if(!solv())continue;
  /* 1. open zwarte vakjes aan het begin, 2. "?" op zwarte vakjes, 3. lijnen, 4. verborgen en 5. open blauwe getallen weghalen zolang het oplosbaar blijft */
  for(const i of shuf([...rev],R)){if(rev.size<=1)break;rev.delete(i);if(!solv())rev.add(i)}
  const qcap=Math.round(blk.length*L.q);for(const i of shuf(blk.slice(),R)){if(cand._q.size>=qcap)break;if(!U.has(ring[i]))cand._q.add(i)}
  /* Lijnen, blauwe getallen en {n}/-n- in één gemengde volgorde weghalen. Wat later aan de beurt is, blijft vaker staan;
     lijnen komen gemiddeld het laatst, dan blauwe getallen, dan de tekens. Alles wat overblijft is nodig. */
  const HB=(typeof window!=="undefined"&&window.HB)||(lv===1||lv===4?HXB1:HXB),it=[];
  ls.forEach(j=>it.push({k:"l",j,o:R()+HB.l}));zh.forEach(z=>it.push({k:"h",z,o:R()+HB.z}));zs.forEach(z=>it.push({k:"s",z,o:R()+HB.z}));
  blk.forEach(i=>{if(!cand._q.has(i)&&ring[i].type)it.push({k:"t",c:ring[i],o:R()+HB.t})});ls.forEach(j=>{if(lines[j].clue.type)it.push({k:"t",c:lines[j].clue,j,o:R()+HB.t})});
  it.sort((a,b)=>a.o-b.o);
  for(const x of it){if(x.k==="l")drop(lines[x.j].clue,()=>ls.delete(x.j),()=>ls.add(x.j));
   else if(x.k==="h")drop(zone[x.z],()=>zh.delete(x.z),()=>zh.add(x.z));
   else if(x.k==="s"){if(zs.size+rev.size<=1)continue;zs.delete(x.z);if(!solv())zs.add(x.z)}
   else{if(x.j!=null&&!ls.has(x.j))continue;const c=x.c,t0=c.type;c.type=0;if(U.has(c)&&!solv())c.type=t0}}
  /* Heb je aan het eind het aantal "nog te vinden" nodig? Dat maakt het spannend, dus zulke puzzels krijgen voorrang. */
  const G0=cand._G;cand._G=null;const r0=hexDeduceL(cand,rev,ls,zs,MC,false),needG=!r0.all&&blue.some(i=>!r0.rev.has(i));cand._G=G0;
  /* Hoe goed werken de blauwe getallen en lijnen mee? Kijk hoeveel je zonder ze zou kunnen oplossen (minder is beter). */
  const zAll=[...zs,...zh],pr=hexDeduceL(cand,rev,ls,zs,MC,true),c=pr.prof.filter(x=>x.c).length;
  const zh0=cand._zh;cand._zh=new Set();const noZ=zAll.length?hexDeduceL(cand,[...rev,...zs],ls,[],MC).rev.size/n:1;cand._zh=zh0;
  const noL=ls.size?hexDeduceL(cand,rev,[],zs,MC).rev.size/n:1;
  const hard=lv===3||lv===6,mid=lv===2||lv===5;
  const route=tough?hexDifficulty(cand,rev,ls,zs):null;if(route&&!route.all)continue;
  const sc=tough?Math.min(route.comb/Math.max(1,route.total),.4)*250+Math.min(route.comb,12)*2+(1-noZ)*8+(1-noL)*4+Math.min(zAll.length,7)
   :hard?c*1.5+(1-noZ)*30+(1-noL)*8+Math.min(zAll.length,7)*1.5-(zAll.length<3?20:0)
   :mid?Math.min(c,6)+(1-noZ)*20+(1-noL)*6+Math.min(zAll.length,5)-(zAll.length<2?10:0)
   :-c*2+(1-noZ)*6+Math.min(zAll.length,3);
  /* Twee lijngetallen bij hetzelfde startpunt zijn lastig te lezen: zulke puzzels alleen als er niets beters is. */
  const nT=blk.filter(i=>!cand._q.has(i)&&ring[i].type).length+[...ls].filter(j=>lines[j].clue.type).length;
  const scG=(needG?8:0)+Math.min(nT,8)*(hard?1.5:mid?1.2:.8);let dupV=0;{const vs=new Set();[...ls].forEach(j=>{const k=lines[j].vq+","+lines[j].vr;if(vs.has(k))dupV++;vs.add(k)})}
  ok++;if(sc+scG-dupV*1000>bs){bs=sc+scG-dupV*1000;cand.rev0=[...rev];cand.lineShow=[...ls];cand.zs=[...zs];cand.zh=[...zh];cand.qs=[...cand._q];cand.st={c,noZ:Math.round(noZ*100),noL:Math.round(noL*100),needG,nT};if(tough){cand.st.pairs=route.comb;cand.st.moves=route.total}best=cand}
  if(tough&&ok>=L.tries&&dupV===0&&route.comb>=5&&route.comb/route.total>=.25)break}
 if(best){delete best._q;delete best._zh}
 return best}

