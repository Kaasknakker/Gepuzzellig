/* ---------- Nonogram ---------- */
function ls(cl,cur){const n=cur.length,a1=Array(n).fill(1),a0=Array(n).fill(1),a=Array(n).fill(0);let any=0;
 (function rec(b,p){if(b===cl.length){for(let k=p;k<n;k++)a[k]=0;
   for(let k=0;k<n;k++)if((cur[k]===1&&!a[k])||(cur[k]===2&&a[k]))return;
   any=1;for(let k=0;k<n;k++){if(a[k])a0[k]=0;else a1[k]=0}return}
  const rest=cl.slice(b+1).reduce((s,x)=>s+x+1,0);
  for(let s=p;s+cl[b]+rest<=n;s++){for(let k=p;k<s;k++)a[k]=0;for(let k=s;k<s+cl[b];k++)a[k]=1;if(s+cl[b]<n)a[s+cl[b]]=0;rec(b+1,s+cl[b]+1)}})(0,0);
 return cur.map((v,k)=>v||(a1[k]?1:a0[k]?2:0))}
/* ---------- Nonogram-plaatjes: eenvoudige vormen die op het raster worden "getekend" ---------- */
const npoly=(x,y,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
const ncirc=(x,y,cx,cy,r)=>(x-cx)**2+(y-cy)**2<=r*r,nell=(x,y,cx,cy,rx,ry)=>((x-cx)/rx)**2+((y-cy)/ry)**2<=1,nrect=(x,y,x0,y0,x1,y1)=>x>=x0&&x<=x1&&y>=y0&&y<=y1;
const nline=(x,y,ax,ay,bx,by,w)=>{const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-ax-t*dx,y-ay-t*dy)<=w};
const nstar=(cx,cy,ro,ri)=>Array.from({length:10},(_,k)=>{const a=-Math.PI/2+k*Math.PI/5,r=k%2?ri:ro;return[cx+r*Math.cos(a),cy+r*Math.sin(a)]});
const NPICS=[
 {n:"een huis",a:1,f:(x,y)=>(npoly(x,y,[[.5,.04],[.98,.46],[.02,.46]])||nrect(x,y,.12,.46,.88,.98))&&!nrect(x,y,.42,.66,.6,.98)&&!nrect(x,y,.2,.56,.34,.72)},
 {n:"een boom",a:.8,f:(x,y)=>nell(x,y,.5,.36,.46,.36)||nrect(x,y,.4,.6,.6,1)},
 {n:"een kerstboom",a:.8,f:(x,y)=>npoly(x,y,[[.5,0],[.82,.36],[.18,.36]])||npoly(x,y,[[.5,.2],[.92,.64],[.08,.64]])||npoly(x,y,[[.5,.42],[1,.86],[0,.86]])||nrect(x,y,.4,.86,.6,1)},
 {n:"een ster",a:1,f:(x,y)=>npoly(x,y,nstar(.5,.54,.52,.22))},
 {n:"een hart",a:1.1,f:(x,y)=>{const X=(x-.5)*2.4,Y=1.22-y*2.3;return(X*X+Y*Y-1)**3-X*X*Y**3<=0}},
 {n:"een paddenstoel",a:1,f:(x,y)=>(nell(x,y,.5,.46,.5,.42)&&y<=.46&&!ncirc(x,y,.3,.26,.08)&&!ncirc(x,y,.66,.2,.08))||nrect(x,y,.36,.46,.64,.98)},
 {n:"een vis",a:1.6,f:(x,y)=>(nell(x,y,.42,.5,.4,.34)||npoly(x,y,[[.72,.5],[1,.12],[1,.88]]))&&!ncirc(x,y,.22,.42,.06)},
 {n:"een kat",a:.9,f:(x,y)=>(ncirc(x,y,.5,.57,.4)||npoly(x,y,[[.12,.4],[.18,0],[.44,.22]])||npoly(x,y,[[.88,.4],[.82,0],[.56,.22]]))&&!nell(x,y,.35,.52,.06,.1)&&!nell(x,y,.65,.52,.06,.1)},
 {n:"een zeilboot",a:1.3,f:(x,y)=>npoly(x,y,[[0,.7],[1,.7],[.82,.97],[.18,.97]])||nrect(x,y,.47,.04,.54,.7)||npoly(x,y,[[.57,.06],[.57,.64],[.95,.64]])||npoly(x,y,[[.44,.16],[.44,.64],[.12,.64]])},
 {n:"een stoomtrein",a:1.8,f:(x,y)=>(nrect(x,y,.04,.36,.62,.8)||nrect(x,y,.56,.1,.9,.8)||nrect(x,y,.14,.12,.26,.36)||ncirc(x,y,.2,.86,.12)||ncirc(x,y,.46,.86,.12)||ncirc(x,y,.76,.86,.12)||nrect(x,y,.9,.6,1,.72))&&!nrect(x,y,.63,.2,.8,.42)},
 {n:"een molen",a:.9,big:1,f:(x,y)=>(npoly(x,y,[[.38,.36],[.62,.36],[.76,1],[.24,1]])||ncirc(x,y,.5,.36,.12)||(nline(x,y,.06,-.08,.94,.8,.075))||nline(x,y,.94,-.08,.06,.8,.075))&&!nrect(x,y,.44,.8,.56,1)},
 {n:"een vuurtoren",a:.6,f:(x,y)=>(npoly(x,y,[[.34,.26],[.66,.26],[.8,1],[.2,1]])&&!nrect(x,y,0,.46,1,.56)&&!nrect(x,y,0,.72,1,.82))||nrect(x,y,.36,.12,.64,.26)||npoly(x,y,[[.5,0],[.7,.13],[.3,.13]])},
 {n:"een maan",a:.8,f:(x,y)=>ncirc(x,y,.5,.5,.48)&&!ncirc(x,y,.72,.38,.4)},
 {n:"een paraplu",a:1,f:(x,y)=>(nell(x,y,.5,.48,.5,.44)&&y<=.48)||nrect(x,y,.45,.48,.55,.86)||(ncirc(x,y,.36,.86,.14)&&!ncirc(x,y,.36,.86,.05)&&y>=.86)},
 {n:"bergen met een zon",a:1.6,wide:1,f:(x,y)=>npoly(x,y,[[0,1],[.32,.34],[.62,1]])||npoly(x,y,[[.32,1],[.7,.18],[1,.7],[1,1]])||ncirc(x,y,.13,.2,.13)},
 {n:"een auto",a:2,f:(x,y)=>(nrect(x,y,.02,.45,.98,.8)||npoly(x,y,[[.2,.46],[.32,.12],[.68,.12],[.8,.46]])||ncirc(x,y,.25,.8,.17)||ncirc(x,y,.75,.8,.17))&&!npoly(x,y,[[.3,.42],[.37,.22],[.48,.22],[.48,.42]])&&!npoly(x,y,[[.52,.42],[.52,.22],[.63,.22],[.7,.42]])},
 {n:"een bloem",a:.7,f:(x,y)=>[0,1,2,3,4].some(k=>{const a=-Math.PI/2+k*2*Math.PI/5;return ncirc(x,y,.5+.24*Math.cos(a),.3+.22*Math.sin(a),.16)})||nrect(x,y,.45,.4,.55,1)||nell(x,y,.7,.74,.2,.08)},
 {n:"een sleutel",a:2,f:(x,y)=>(ncirc(x,y,.2,.5,.2)&&!ncirc(x,y,.2,.5,.09))||nrect(x,y,.36,.42,.98,.58)||nrect(x,y,.74,.58,.82,.82)||nrect(x,y,.88,.58,.96,.74)},
 {n:"een pijl",a:1.5,f:(x,y)=>nrect(x,y,0,.36,.6,.64)||npoly(x,y,[[.52,.02],[1,.5],[.52,.98]])},
 {n:"een tent",a:1.4,f:(x,y)=>npoly(x,y,[[.5,.04],[1,.98],[0,.98]])&&!npoly(x,y,[[.5,.45],[.66,.98],[.34,.98]])}
];/* Een plaatje op het raster zetten; het moet met de gewone regel-logica op te lossen zijn (geen gokken). */
function nonoPic(R,W,H){const nonoOK=g=>{const rc=rowsOf(g,W,H).map(lc),cc=colsOf(g,W,H).map(lc);let s=Array(W*H).fill(0),ch=1;
  while(ch){ch=0;for(let r=0;r<H;r++)ls(rc[r],s.slice(r*W,r*W+W)).forEach((v,c)=>{if(v!==s[r*W+c]){s[r*W+c]=v;ch=1}});
   const cs=colsOf(s,W,H);for(let c=0;c<W;c++)ls(cc[c],cs[c]).forEach((v,r)=>{if(v!==s[r*W+c]){s[r*W+c]=v;ch=1}})}return!s.includes(0)};
 const draw=(g,P,bx,by,bw,bh,mir)=>{for(let r=0;r<H;r++)for(let c=0;c<W;c++){let n=0;for(let a=0;a<3;a++)for(let b=0;b<3;b++){let u=(c+(a+.5)/3-bx)/bw,v=(r+(b+.5)/3-by)/bh;if(u<0||u>1||v<0||v>1)continue;if(mir)u=1-u;if(P.f(u,v))n++}if(n>=5)g[r*W+c]=1}};
 const GA=W/H,order=shuf(NPICS.map((_,i)=>i),R);
 for(let t=0;t<order.length*3;t++){const P=NPICS[order[t%order.length]];if(P.wide&&GA<1.2)continue;if(P.big&&W*H<120)continue;const g=Array(W*H).fill(0),mir=R()<.5;
  const mg=W*H>60?(R()<.5?0:1):0,fitH=H-2*mg,fitW=W-2*mg;
  /* het plaatje mag iets uitgerekt worden (tot 1,35×) om het raster beter te vullen */
  let bh=fitH,bw=Math.min(fitW,bh*P.a*1.35);if(bw<bh*P.a/1.35){bw=fitW;bh=Math.min(fitH,bw/P.a*1.35)}
  bw=Math.max(2,Math.round(bw));bh=Math.max(2,Math.round(bh));if(bw*bh<.5*W*H)continue;
  draw(g,P,Math.round((W-bw)/2),Math.round((H-bh)/2),bw,bh,mir);const d=g.reduce((a,b)=>a+b,0)/(W*H);if(d<.28||d>.75)continue;
  if(nonoOK(g))return{g,naam:P.n}}
 return null}
function genNono(R,lv,hard){const[W,H]={1:[8,5],2:[15,10],3:[20,14],4:[5,8],5:[8,12],6:[10,15]}[lv||2],N=W;let g;
 for(let t=0;t<6000;t++){const den={1:.62,2:.58,3:.55,4:.62,5:.58,6:.55}[lv||2]-(hard?.04:0);g=Array.from({length:W*H},()=>R()<den?1:0);
  const rc=rowsOf(g,W,H).map(lc),cc=colsOf(g,W,H).map(lc);let s=Array(W*H).fill(0),ch=1;
  while(ch){ch=0;for(let r=0;r<H;r++)ls(rc[r],s.slice(r*W,r*W+W)).forEach((v,c)=>{if(v!==s[r*W+c]){s[r*W+c]=v;ch=1}});
   const cs=colsOf(s,W,H);for(let c=0;c<W;c++)ls(cc[c],cs[c]).forEach((v,r)=>{if(v!==s[r*W+c]){s[r*W+c]=v;ch=1}})}
  if(!s.includes(0))return{N,W,H,rc,cc,sol:g}}
 return{N,W,H,rc:rowsOf(g,W,H).map(lc),cc:colsOf(g,W,H).map(lc),sol:g}}


/* ---------- Kleur Nonogram ---------- */
const NCN=["","rood","blauw","geel","groen"];
const nonoColorCount=lv=>(lv===1||lv===4)?2:(lv===2||lv===5)?3:4;
function cnClue(a){const o=[];let c=0,n=0;for(const v of a.concat(0)){if(v&&v===c)n++;else{if(c)o.push({n,c});c=v;n=v?1:0}}return o}
function cnEq(a,b){return a.length===b.length&&a.every((x,i)=>x.n===b[i].n&&x.c===b[i].c)}
function cnText(cl){return cl.length?cl.map(x=>NCN[x.c]+" "+x.n).join(", "):"0"}
function cnLine(cl,cur){const n=cur.length,K=cl.length;
 const len=b=>cl[b].n,gap=b=>b<K-1&&cl[b].c===cl[b+1].c?1:0;
 const fits=(b,s)=>{if(s+len(b)>n)return false;for(let k=s;k<s+len(b);k++)if(cur[k]===-1||(cur[k]>0&&cur[k]!==cl[b].c))return false;
  if(gap(b)){if(s+len(b)>=n)return false;if(cur[s+len(b)]>0)return false}return true};
 const nxt=(b,s)=>s+len(b)+gap(b);
 /* B[b][p] = aantal geldige manieren om blok b..eind te leggen vanaf positie p. */
 const B=Array.from({length:K+1},()=>Array(n+2).fill(0));
 for(let p=n+1;p>=0;p--){let ok=true;for(let k=p;k<n;k++)if(cur[k]>0){ok=false;break}B[K][p]=p<=n&&ok?1:0}
 for(let b=K-1;b>=0;b--)for(let p=n;p>=0;p--){let t=0;for(let s=p;s<n;s++){if(s>p&&cur[s-1]>0)break;if(fits(b,s)){const q=nxt(b,s);if(q<=n)t+=B[b+1][q]}}B[b][p]=t}
 /* A + W tellen hoe vaak elk blok op elke startpositie voorkomt in alle oplossingen. */
 const A=Array.from({length:K+1},()=>Array(n+2).fill(0));A[0][0]=1;
 const W=Array.from({length:K},()=>Array(n).fill(0));
 for(let b=0;b<K;b++)for(let p=0;p<=n;p++){const a=A[b][p];if(!a)continue;for(let s=p;s<n;s++){if(s>p&&cur[s-1]>0)break;if(!fits(b,s))continue;const q=nxt(b,s);if(q>n)continue;A[b+1][q]+=a;W[b][s]+=a*B[b+1][q]}}
 const tot=B[0][0],fix=Array(n).fill(0),mn=Array(K).fill(1e9),mx=Array(K).fill(-1);
 if(!tot)return{cnt:0,overflow:false,fix,mn,mx};
 const cov=Array(n).fill(0),col=Array.from({length:n},()=>new Set());
 for(let b=0;b<K;b++)for(let s=0;s<n;s++)if(W[b][s]){mn[b]=Math.min(mn[b],s);mx[b]=Math.max(mx[b],s);for(let k=s;k<s+len(b);k++){cov[k]+=W[b][s];col[k].add(cl[b].c)}}
 for(let k=0;k<n;k++){const leeg=cov[k]<tot;if(leeg&&!col[k].size)fix[k]=-1;else if(!leeg&&col[k].size===1)fix[k]=[...col[k]][0]}
 return{cnt:tot,overflow:false,fix,mn,mx}}
function cnHuman(p){const W=p.W,H=p.H,cur=Array(W*H).fill(0);let steps=0,passes=0,maxWays=0;
 for(let z=0;z<250;z++){let ch=0;passes++;
  for(let r=0;r<H;r++){const idx=Array.from({length:W},(_,x)=>r*W+x),q=cnLine(p.rc[r],idx.map(i=>cur[i]));if(!q.cnt||q.overflow)return{solved:false,cur,steps,passes,maxWays};maxWays=Math.max(maxWays,q.cnt);q.fix.forEach((v,k)=>{const i=idx[k];if(cur[i]===0&&v!==0){cur[i]=v;steps++;ch++}})}
  for(let x=0;x<W;x++){const idx=Array.from({length:H},(_,r)=>r*W+x),q=cnLine(p.cc[x],idx.map(i=>cur[i]));if(!q.cnt||q.overflow)return{solved:false,cur,steps,passes,maxWays};maxWays=Math.max(maxWays,q.cnt);q.fix.forEach((v,k)=>{const i=idx[k];if(cur[i]===0&&v!==0){cur[i]=v;steps++;ch++}})}
  if(!ch)break}
 const solved=cur.every((v,i)=>v===(p.sol[i]||-1));return{solved,cur,steps,passes,maxWays}}
function cnQuality(p,rt,lv){const W=p.W,H=p.H;
 const sig=a=>JSON.stringify(a),freq=a=>{const m=new Map();a.forEach(x=>m.set(sig(x),(m.get(sig(x))||0)+1));return Math.max(...m.values())/a.length};
 const ur=new Set(p.rc.map(sig)).size/H,uc=new Set(p.cc.map(sig)).size/W,rep=Math.max(freq(p.rc),freq(p.cc));
 const forced=new Set();for(let r=0;r<H;r++){const q=cnLine(p.rc[r],Array(W).fill(0));q.fix.forEach((v,x)=>{if(v!==0)forced.add(r*W+x)})}
 for(let x=0;x<W;x++){const q=cnLine(p.cc[x],Array(H).fill(0));q.fix.forEach((v,r)=>{if(v!==0)forced.add(r*W+x)})}
 const init=forced.size/(W*H),multi=(p.rc.filter(x=>x.length>1).length+p.cc.filter(x=>x.length>1).length)/(W+H);
 let trans=0;for(let r=0;r<H;r++)for(let x=0;x<W;x++){const i=r*W+x,a=p.sol[i];if(!a)continue;if(x+1<W){const b=p.sol[i+1];if(b&&a!==b)trans++}if(r+1<H){const b=p.sol[i+W];if(b&&a!==b)trans++}}
 const easy=lv===1||lv===4,normal=lv===2||lv===5;
 const ok=easy?(rt.passes>=2&&rep<.82):(normal?(rt.passes>=4&&init<.76&&rep<.62&&ur>.42&&uc>.42):(rt.passes>=5&&init<.66&&rep<.55&&ur>.48&&uc>.48));
 const score=rt.passes*7+(ur+uc)*18+multi*12+Math.min(18,trans*.35)-init*28-rep*22;
 return{ok,score,init,rep,ur,uc,multi,trans}}
/* Kleuring "gemengd" (vanaf 24 oktober 2026): elke kleur in 2 à 3 kleinere vlekken verspreid over het veld,
   en vlekken die naast elkaar liggen zo veel mogelijk een andere kleur. Zo zit niet elke kleur als één groot vlak bij elkaar. */
function nonoMixColor(R,mask,W,H,K){const per=K===4?2:3,M=K*per,cols=Math.ceil(Math.sqrt(M*W/H)),rows=Math.ceil(M/cols),ctr=[];
 for(const k of shuf([...Array(cols*rows).keys()],R).slice(0,M)){const cx=k%cols,cy=k/cols|0;ctr.push({x:(cx+.2+R()*.6)*W/cols,y:(cy+.2+R()*.6)*H/rows,w:.7+R()*.6})}
 let best=null,bs=-1;for(let t=0;t<40;t++){const cl=shuf([...Array(M).keys()].map(i=>i%K+1),R);let sc=0;
  for(let a=0;a<M;a++)for(let b=a+1;b<M;b++){if(cl[a]===cl[b]&&Math.hypot(ctr[a].x-ctr[b].x,(ctr[a].y-ctr[b].y)*W/H)<W/cols*1.6)sc--}
  if(best===null||sc>bs){bs=sc;best=cl}}
 const sol=Array(W*H).fill(0),use=Array(K+1).fill(0);
 for(let i=0;i<W*H;i++)if(mask[i]){const r=i/W|0,x=i%W;let bc=1,bd=1e9;for(let k=0;k<M;k++){const a=ctr[k],d=(((x+.5-a.x)/(W/cols))**2+((r+.5-a.y)/(H/rows))**2)/a.w+(R()-.5)*.08;if(d<bd){bd=d;bc=best[k]}}sol[i]=bc;use[bc]++}
 return{sol,use}}
function genColorNono(R,lv,hard,mix){const K=nonoColorCount(lv),minScore=(lv===1||lv===4)?50:(lv===2||lv===5)?70:90;let best=null,bs=-1,W=0,H=0;
 /* Een goede kandidaat is goed genoeg: maximaal 3 basisvormen × 18 kleuringen. */
 for(let batch=0;batch<3||(!best&&batch<12);batch++){const base=genNono(R,lv,hard),mask=base.sol;W=base.W;H=base.H;
  for(let t=0;t<18;t++){let sol,use;if(mix){({sol,use}=nonoMixColor(R,mask,W,H,K))}else{const ctr=Array.from({length:K},(_,k)=>({x:(k+.28+R()*.44)*W/K,y:(.12+R()*.76)*H,w:.65+R()*.9,tilt:(R()-.5)*.32}));shuf(ctr,R);
   sol=Array(W*H).fill(0);use=Array(K+1).fill(0);
   for(let i=0;i<sol.length;i++)if(mask[i]){const r=i/W|0,x=i%W;let bc=1,bd=1e9;for(let k=0;k<K;k++){const a=ctr[k],xx=x+.5+a.tilt*(r-H/2),d=((xx-a.x)/(W/K*a.w))**2+((r+.5-a.y)/(H*.58))**2+(R()-.5)*.055;if(d<bd){bd=d;bc=k+1}}sol[i]=bc;use[bc]++}
   }if(use.slice(1).some(n=>n<2))continue;
   const p={N:W,W,H,K,color:1,rc:rowsOf(sol,W,H).map(cnClue),cc:colsOf(sol,W,H).map(cnClue),sol,pic:base.pic||""},rt=cnHuman(p);if(!rt.solved)continue;
   const q=cnQuality(p,rt,lv);p.rate=rt.steps+"/"+rt.passes+" c"+K+" q"+q.score.toFixed(0);
   if(q.ok&&q.score>=minScore)return p;
   if(q.score>bs){bs=q.score;best=p}
  }}
 if(best)return best;
 /* Begrensd vangnet: probeer nog 24 verschillende diagonale kleuringen en accepteer alleen
    een puzzel die de menselijke solver volledig kan oplossen. */
 for(let z=0;z<24;z++){const base=genNono(R,lv,hard),fw=base.W,fh=base.H,perm=shuf(Array.from({length:K},(_,i)=>i+1),R);
  const sol=base.sol.map((v,i)=>v?perm[(Math.floor((i%fw)/(2+z%3))+Math.floor((i/fw|0)/(2+(z>>2)%2)))%K]:0);
  const p={N:fw,W:fw,H:fh,K,color:1,rc:rowsOf(sol,fw,fh).map(cnClue),cc:colsOf(sol,fw,fh).map(cnClue),sol,pic:base.pic||"",rate:"finite-fallback"},rt=cnHuman(p);
  if(rt.solved)return p}
 /* Laatste veiligheidsnet is eindig; de app kan nooit in een generatorlus blijven hangen. */
 const base=genNono(R,lv,hard),fw=base.W,fh=base.H,perm=shuf(Array.from({length:K},(_,i)=>i+1),R),filled=base.sol.reduce((a,v,i)=>(v&&a.push(i),a),[]),sol=Array(fw*fh).fill(0);
 /* Kleuren in banden (boven/onder of links/rechts); alleen als hij logisch oplosbaar blijft. Anders één kleur: die is altijd oplosbaar. */
 const mk=f=>{const s2=Array(fw*fh).fill(0);filled.forEach(i=>s2[i]=f(i));return{N:fw,W:fw,H:fh,K,color:1,rc:rowsOf(s2,fw,fh).map(cnClue),cc:colsOf(s2,fw,fh).map(cnClue),sol:s2,pic:base.pic||"",rate:"safe-fallback"}};
 for(const f of[i=>perm[Math.min(K-1,Math.floor((i/fw|0)*K/fh))],i=>perm[Math.min(K-1,Math.floor((i%fw)*K/fw))]]){const q=mk(f);if(cnHuman(q).solved)return q}
 return mk(()=>perm[0])}

