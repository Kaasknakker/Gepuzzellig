/* ---------- Pluszle ---------- */
/* Elk getal blijft staan of wordt weggestreept. Wat blijft staan moet per rij, per kolom (en op Moeilijk per gekleurd vlak) optellen tot de som.
   We maken alleen puzzels die je met redeneren per rij, kolom of vlak helemaal kunt oplossen: dus één oplossing en nooit gokken.
   Op Moeilijk zijn de vlakken echt nodig: met alleen rijen en kolommen kom je vast te zitten. */
const PLV={1:{W:5,H:5,pk:.55,tries:10},2:{W:6,H:6,pk:.5,tries:14},3:{W:7,H:7,pk:.5,reg:1,tries:18},4:{W:5,H:5,pk:.55,tries:10},5:{W:6,H:6,pk:.5,tries:14},6:{W:6,H:7,pk:.5,reg:1,tries:18}};
function plusUnits(p){const{W,H}=p,u=[];
 for(let r=0;r<H;r++){const c=[];for(let x=0;x<W;x++)c.push(r*W+x);u.push({kind:"r",k:r,cells:c,t:p.rs[r]})}
 for(let x=0;x<W;x++){const c=[];for(let r=0;r<H;r++)c.push(r*W+x);u.push({kind:"c",k:x,cells:c,t:p.cs[x]})}
 (p.rg||[]).forEach((g,k)=>u.push({kind:"g",k,cells:g.cells,t:g.t}));return u}
/* Eén rij, kolom of vlak: alle manieren om met de open getallen de som te halen.
   and = open getallen die in elke manier zitten (blijven), or = die in minstens één manier zitten (de rest moet weg). */
function plusLook(u,st,num){let K=0,s0=0;const U=[];for(const i of u.cells){if(st[i]===1)K+=num[i];else if(st[i]===0){U.push(i);s0+=num[i]}}
 const need=u.t-K,m=U.length,F=(1<<m)-1,S=new Int16Array(1<<m);let and=F,or=0,n=0;
 for(let mk=1;mk<=F;mk++){const lb=mk&-mk;S[mk]=S[mk^lb]+num[U[31-Math.clz32(lb)]]}
 for(let mk=0;mk<=F;mk++)if(S[mk]===need){and&=mk;or|=mk;n++}
 return{K,U,need,n,and,or,s0,S}}
function plusSolve(p,st,units){const N=p.W*p.H;st=st||Array(N).fill(0);units=units||plusUnits(p);
 const of=Array.from({length:N},()=>[]);units.forEach((u,k)=>u.cells.forEach(i=>of[i].push(k)));
 const q=units.map((_,k)=>k),inq=units.map(()=>1);
 while(q.length){const k=q.shift();inq[k]=0;const L=plusLook(units[k],st,p.num);if(!L.n)return null;
  L.U.forEach((i,b)=>{const v=L.and>>b&1?1:!(L.or>>b&1)?2:0;if(v){st[i]=v;for(const j of of[i])if(!inq[j]){inq[j]=1;q.push(j)}}})}
 return st}
/* Hoe zou een mens het oplossen? Steeds de makkelijkste stap die er is:
   0 = som is al bereikt of alles moet blijven, 1 = getal te groot, 2 = zonder dit getal te weinig, 3 = combinaties bekijken. */
function plusRate(p,units){const N=p.W*p.H,st=Array(N).fill(0),num=p.num,c=[0,0,0,0];let mx=0,big=0,steps=0,deep=0;
 for(let it=0;it<600;it++){let best=null;
  for(const u of units){const L=plusLook(u,st,num);if(!L.U.length)continue;if(!L.n)return null;
   const ded=[];L.U.forEach((i,b)=>{const v=L.and>>b&1?1:!(L.or>>b&1)?2:0;if(v)ded.push([i,v])});if(!ded.length)continue;
   let cls=3,use=ded;
   if(L.need===0||L.need===L.s0)cls=0;
   else{const tb=ded.filter(([i,v])=>v===2&&num[i]>L.need),mk=ded.filter(([i,v])=>v===1&&L.s0-num[i]<L.need);if(tb.length){cls=1;use=tb}else if(mk.length){cls=2;use=mk}}
   const sc=cls*100+L.U.length+(cls===3?Math.min(L.n,20)/100:0);if(!best||sc<best.sc)best={sc,cls,use,m:L.U.length,n:L.n}}
  if(!best)break;c[best.cls]++;if(best.cls===3){mx=Math.max(mx,best.m);big+=best.m;if(best.n>3)deep++}
  for(const[i,v]of best.use)st[i]=v;steps++}
 return{c,mx,big,steps,deep,solved:!st.includes(0)}}
function plusTargets(p){const{W,H,num,sol}=p;p.rs=[];p.cs=[];
 for(let r=0;r<H;r++){let s=0;for(let c=0;c<W;c++)if(sol[r*W+c])s+=num[r*W+c];p.rs.push(s)}
 for(let c=0;c<W;c++){let s=0;for(let r=0;r<H;r++)if(sol[r*W+c])s+=num[r*W+c];p.cs.push(s)}
 p.rg.forEach(g=>{g.t=g.cells.reduce((a,i)=>a+(sol[i]?num[i]:0),0)})}
function plusMake(R,L){const W=L.W,H=L.H,n=W*H,num=[],sol=[];
 for(let i=0;i<n;i++){num.push(1+(R()*9|0));sol.push(R()<L.pk?1:0)}
 const fixL=idx=>{if(!idx.some(i=>sol[i]))sol[idx[R()*idx.length|0]]=1;if(idx.every(i=>sol[i]))sol[idx[R()*idx.length|0]]=0};
 for(let pass=0;pass<3;pass++){for(let r=0;r<H;r++)fixL([...Array(W)].map((_,c)=>r*W+c));for(let c=0;c<W;c++)fixL([...Array(H)].map((_,r)=>r*W+c))}
 const reg=Array(n).fill(-1),rg=[],p={W,H,num,sol,reg,rg};let cover=0;
 /* Een vlak van 2 tot 5 vakjes laten groeien vanaf een vakje dat nog niet op te lossen is. Een vlak heeft altijd iets dat blijft en iets dat weg moet. */
 const addReg=seed=>{for(let a=0;a<6;a++){const sz=2+(R()*4|0),cells=[seed],has=new Set(cells);
   while(cells.length<sz){const fr=[];for(const i of cells){const r=i/W|0,c=i%W;for(const[y,x]of[[r-1,c],[r+1,c],[r,c-1],[r,c+1]]){const j=y*W+x;if(y>=0&&x>=0&&y<H&&x<W&&reg[j]<0&&!has.has(j)&&!fr.includes(j))fr.push(j)}}
    if(!fr.length)break;const j=fr[R()*fr.length|0];cells.push(j);has.add(j)}
   if(cells.length<2)return false;const k=cells.filter(i=>sol[i]).length;if(!k||k===cells.length)continue;
   cells.sort((a,b)=>a-b);cells.forEach(i=>{reg[i]=rg.length});rg.push({cells});cover+=cells.length;return true}
  return false};
 for(let rep=0;rep<120;rep++){plusTargets(p);const st=plusSolve(p),un=[];st.forEach((v,i)=>{if(!v)un.push(i)});
  if(!un.length)break;
  if(L.reg&&cover<n*.5){const free=un.filter(i=>reg[i]<0);if(free.length&&addReg(free[R()*free.length|0]))continue}
  const i=un[R()*un.length|0];let v;do v=1+(R()*9|0);while(v===num[i]);num[i]=v}
 plusTargets(p);const st=plusSolve(p);if(!st||st.includes(0))return null;
 if(L.reg){p.needR=!!plusSolve(Object.assign({},p,{rg:[]})).includes(0);
  /* Alleen de vlakken houden die echt nodig zijn: elk extra vlak maakt de puzzel makkelijker. */
  for(const rem of shuf(rg.slice(),R)){if(rg.length<=1)break;const g=rg.indexOf(rem);
   rg.splice(g,1);rem.cells.forEach(i=>{reg[i]=-1});rg.forEach((x,j)=>x.cells.forEach(i=>{reg[i]=j}));plusTargets(p);const s2=plusSolve(p);
   if(!s2||s2.includes(0)){rg.splice(g,0,rem);rg.forEach((x,j)=>x.cells.forEach(i=>{reg[i]=j}))}}
  p.needR=!!plusSolve(Object.assign({},p,{rg:[]})).includes(0);
  plusTargets(p)}
 return p}
/* Makkelijk: een paar stappen waarbij je combinaties moet bekijken. Normaal: veel van zulke stappen.
   Moeilijk: zoveel mogelijk, en ook stappen met veel mogelijke combinaties (dan moet je echt rekenen). */
function plusScore(lv,rt,p,hard){const c3=rt.c[3],dp=rt.deep;
 if(lv===1||lv===4)return -Math.abs(c3-(lv===1?3:2)-(hard?2:0))*2-Math.max(0,rt.mx-(hard?6:5));
 if(lv===2||lv===5)return -Math.abs(c3-(lv===2?6:5)-(hard?3:0))-Math.max(0,dp-(hard?2:1))*2;
 return (p.needR?40:0)+c3+3*dp+rt.mx+2*Math.min(p.rg.length,3)}
function genPlus(R,lv,hard){lv=PLV[lv]?lv:2;const L0=PLV[lv],L=hard?Object.assign({},L0,{pk:.5,tries:L0.tries+4}):L0;let best=null,bs=-1e9;
 for(let t=0;t<L.tries*4&&!(best&&t>=L.tries);t++){const p=plusMake(R,L);if(!p)continue;const rt=plusRate(p,plusUnits(p));if(!rt||!rt.solved)continue;
  const sc=plusScore(lv,rt,p,hard)+R()*.5;if(sc>bs){bs=sc;best=p;p.rate=rt.c.join("/")+" mx"+rt.mx+" d"+rt.deep}}
 return best}
const $=s=>document.querySelector(s);
