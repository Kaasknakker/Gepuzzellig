/* ---------- Murdoku ---------- */
/* ===== Murdoku, zoals in het boek =====
   N personen op een N×N plattegrond (de laatste is het slachtoffer), één per rij en kolom.
   Voorwerpen: op stoel/bed/bank kun je zitten, op de rest kan niemand staan.
   "Naast" = recht ernaast (niet schuin) én in dezelfde ruimte. De moordenaar was alleen met het slachtoffer. */
const MLEGACY_NAMES=[["Aart","m"],["Sijmon","m"],["Lisa","v"],["Martijn","m"],["Iris","v"],["Jeroen","m"],["Iwona","v"],["Thomas","m"],["Lieke","v"],["Peter","m"],["Ingrid","v"],["Renske","v"],["Jan","m"],["Feliks","m"],["Daan","m"],["Olaf","m"],["Lars","m"],["Emma","v"]];
const MNEUTRAL_NAMES=["Sam","Noor","Finn","Emma","Lucas","Mila","Daan","Olivia","Bas","Yara","Hugo","Zoë","Kees","Vera","Ruben","Iris","Gwen","Timo"].map(n=>[n,"x"]);
const MVICT=[["Notaris Vos","m"],["Wanda","v"],["Yvonne","v"],["Zwaantje","v"],["Wim","m"]];
const murCleanName=n=>String(n||"").replace(/[<>&"'\x60]/g,"").replace(/\s+/g," ").trim().slice(0,24);
function murNamePool(){
 const gid=($("#group")&&$("#group").value)||"",custom=Array.isArray(GROUP_INFO&&GROUP_INFO.murdokuNames)?GROUP_INFO.murdokuNames.map(murCleanName).filter(Boolean):[];
 if(!custom.length&&gid===(window.PD_SETUP&&window.PD_SETUP.group||""))return MLEGACY_NAMES.map(x=>x.slice());
 const src=[...custom,...MNEUTRAL_NAMES.map(x=>x[0])],seen=new Set(),out=[];
 for(const n0 of src){const n=murCleanName(n0),k=n.toLocaleLowerCase("nl");if(!n||seen.has(k))continue;seen.add(k);out.push([n,"x"]);if(out.length===18)break}
 return out.length>=8?out:MNEUTRAL_NAMES.map(x=>x.slice())
}
const murCastSig=()=>murNamePool().map(x=>x[0]).join("|");
function murTag(p,s){const nm=String(p.ppl[s]||"?");for(let n=1;n<=Math.min(3,nm.length);n++){const q=nm.slice(0,n).toLocaleLowerCase("nl");if(p.ppl.filter(x=>String(x).slice(0,n).toLocaleLowerCase("nl")===q).length===1)return nm.slice(0,n)}return nm.slice(0,1)+(s+1)}
const MROOM=[["in de keuken","Keuken"],["in de eetkamer","Eetkamer"],["in de woonkamer","Woonkamer"],["in de badkamer","Badkamer"],["in de logeerkamer","Logeerkamer"],["in de slaapkamer","Slaapkamer"],["in de hal","Hal"],["op de zolder","Zolder"],["in de werkkamer","Werkkamer"],["in de bibliotheek","Bibliotheek"],["in de serre","Serre"],["in de garage","Garage"]];
const murObjIcon=(body,cls="")=>'<svg class="mobjicon '+cls+'" viewBox="0 0 24 24" aria-hidden="true">'+body+'</svg>';
const MOBJ={
 stoel:{e:murObjIcon('<path class="mi-main" d="M7 4.5h10v8H7z"/><path class="mi-dark" d="M5 11h14v5H5z"/><path class="mi-line" d="M7 16v4M17 16v4"/>'),n:"stoel",seat:1},
 bed:{e:murObjIcon('<path class="mi-main" d="M4 9h16v8H4z"/><path class="mi-light" d="M6 7h6v5H6z"/><path class="mi-dark" d="M4 14h16v3H4z"/><path class="mi-line" d="M5 17v3M19 17v3"/>'),n:"bed",seat:1},
 bank:{e:murObjIcon('<path class="mi-main" d="M6 6h12v8H6z"/><path class="mi-dark" d="M3.5 11h17v6h-17z"/><path class="mi-light" d="M8 8h3v5H8zM13 8h3v5h-3z"/><path class="mi-line" d="M6 17v2.5M18 17v2.5"/>'),n:"bank",seat:1},
 tafel:{e:murObjIcon('<ellipse class="mi-main" cx="12" cy="8" rx="8" ry="3.5"/><path class="mi-dark" d="M10 10h4v8h-4z"/><path class="mi-line" d="M7 20h10"/>'),n:"tafel"},
 plant:{e:murObjIcon('<path class="mi-main" d="M12 12C5 11 5 5 6 3c4 0 6 2 6 6 1-4 3-5 6-5 1 4-1 7-6 8z"/><path class="mi-line" d="M12 8v7"/><path class="mi-dark" d="M7 14h10l-2 7H9z"/>'),n:"plant"},
 tv:{e:murObjIcon('<rect class="mi-dark" x="3" y="5" width="18" height="12" rx="2"/><rect class="mi-main" x="5" y="7" width="14" height="8" rx="1"/><path class="mi-line" d="m9 21 3-4 3 4"/>'),n:"tv"},
 kast:{e:murObjIcon('<rect class="mi-main" x="5" y="3" width="14" height="18" rx="2"/><path class="mi-dark" d="M11 3h2v18h-2z"/><circle class="mi-light" cx="9" cy="12" r="1"/><circle class="mi-light" cx="15" cy="12" r="1"/>'),n:"kast"},
 cadeau:{e:murObjIcon('<rect class="mi-main" x="4" y="8" width="16" height="13" rx="1"/><path class="mi-dark" d="M10.5 8h3v13h-3zM3 7h18v4H3z"/><path class="mi-light" d="M12 7C8 7 6 6 6 4.5S7 2 8.5 2C10.5 2 12 4 12 7zm0 0c4 0 6-1 6-2.5S17 2 15.5 2C13.5 2 12 4 12 7z"/>'),n:"cadeau"},
 piano:{e:murObjIcon('<path class="mi-dark" d="M4 4h16v13H4z"/><path class="mi-main" d="M6 7h12v7H6z"/><path class="mi-light" d="M7 10h10v4H7z"/><path class="mi-line" d="M9 10v4M12 10v4M15 10v4M6 17v4M18 17v4"/>'),n:"piano"}
};
const MLV={1:6,2:7,3:8,4:5,5:6,6:7};
function murRooms(N,K,R){for(let att=0;att<300;att++){const reg=Array(N*N).fill(-1);shuf([...Array(N*N).keys()],R).slice(0,K).forEach((c,k)=>{reg[c]=k});
  let free=N*N-K;while(free>0){const fr=[];for(let i=0;i<N*N;i++)if(reg[i]<0)for(const y of nb4(i,N))if(reg[y]>=0)fr.push([i,reg[y]]);const[i,g]=fr[R()*fr.length|0];reg[i]=g;free--}
  const sz=Array(K).fill(0);reg.forEach(g=>sz[g]++);if(Math.min(...sz)>=3&&Math.max(...sz)<=Math.ceil(N*N/K*1.5))return reg}
 return null}
const murN=(a,M)=>nb4(a,M.N).filter(j=>M.reg[j]===M.reg[a]);
const murFree=(i,M)=>!M.obj[i]||!!MOBJ[M.obj[i].t].seat;
/* Is aanwijzing c waar, met pos[persoon]=vakje? */
function murE(c,pos,M){const N=M.N,a=pos[c.p],ra=a/N|0,ca=a%N,rg=M.reg,ob=M.obj,b=c.x!=null?pos[c.x]:-1,rb=b/N|0,cb=b%N;
 switch(c.t){case"room":return rg[a]===c.k;case"notroom":return rg[a]!==c.k;
  case"sit":return!!ob[a]&&ob[a].t===c.T;
  case"nobj":return murN(a,M).some(j=>ob[j]&&ob[j].t===c.T);
  case"lobj":for(let j=0;j<N;j++){const q=c.d?j*N+ca:ra*N+j;if(q!==a&&rg[q]===rg[a]&&ob[q]&&ob[q].t===c.T)return true}return false;
  case"corner":return(ra===0||ra===N-1)&&(ca===0||ca===N-1);case"tb":return ra===0||ra===N-1;case"lr":return ca===0||ca===N-1;
  case"row":return ra===c.k;case"col":return ca===c.k;
  case"np":return Math.abs(ra-rb)+Math.abs(ca-cb)===1&&rg[a]===rg[b];case"same":return rg[a]===rg[b];case"nsame":return rg[a]!==rg[b];
  case"hi":return ra<rb;case"lo":return ra>rb;case"le":return ca<cb;case"ri":return ca>cb;
  case"alone":return pos.every((q,o)=>o===c.p||q==null||rg[q]!==rg[a]);case"nalone":return pos.some((q,o)=>o!==c.p&&q!=null&&rg[q]===rg[a])}
 return true}
/* Menselijke oplosser. Geeft per persoon de nog mogelijke vakjes, en (met o.why) per persoon de redenen waarom vakjes afvielen.
   Stappen: 1 losse aanwijzingen en bezette rijen/kolommen; 2 + aanwijzingen over twee personen, alleen/niet alleen, het slachtoffer;
   3 + "in deze rij/kolom kan alleen X nog"; 4 + paren;
   5 + "stel dat": heeft iemand nog 2 of 3 plekken, probeer er één en kijk of het dan met stap 1-4 vastloopt. */
function murSolve(M,cl,o){o=o||{};const N=M.N,V=M.V,st=o.st||4,rg=M.reg,R=i=>i/N|0,C=i=>i%N;
 const D=[];for(let p=0;p<N;p++)D.push(o.D0?o.D0[p].slice():o.fix&&o.fix[p]>=0?[o.fix[p]]:[...Array(N*N).keys()].filter(i=>murFree(i,M)));
 const W=o.why?D.map(()=>[]):null,U=o.why?D.map(()=>new Set()):null,pos=[];
 const ord=[];D.forEach((d,p)=>{if(d.length===1)ord.push(p)});
 const cut=(p,keep,r,cj)=>{const a=D[p].filter(keep);if(a.length===D[p].length)return false;D[p]=a;if(a.length===1&&!ord.includes(p))ord.push(p);if(W){if(!W[p].includes(r))W[p].push(r);if(cj!=null)U[p].add(cj)}return true};
 const roomsOf=p=>new Set(D[p].map(i=>rg[i]));
 for(let it=0;it<300;it++){let ch=false;
  for(let p=0;p<N;p++)if(D[p].length===1){const x=D[p][0];for(let q=0;q<N;q++)if(q!==p)ch=cut(q,i=>R(i)!==R(x)&&C(i)!==C(x),"@"+p)||ch}
  cl.forEach((c,j)=>{if(c.x!=null||c.t==="alone"||c.t==="nalone")return;ch=cut(c.p,i=>{pos[c.p]=i;return murE(c,pos,M)},"#"+j,j)||ch});
  if(st>=2){
   cl.forEach((c,j)=>{if(c.x==null)return;for(const[u,v]of[[c.p,c.x],[c.x,c.p]]){const dv=D[v].length<=3?"|"+v+"|"+D[v].join(","):"";
     ch=cut(u,i=>D[v].some(y=>{if(R(y)===R(i)||C(y)===C(i))return false;pos[u]=i;pos[v]=y;return murE(c,pos,M)}),"#"+j+dv,j)||ch}});
   cl.forEach((c,j)=>{if(c.t==="alone"){ch=cut(c.p,i=>!D.some((d,q)=>q!==c.p&&d.every(y=>rg[y]===rg[i])),"#"+j,j)||ch;
      const rs=roomsOf(c.p);if(rs.size===1){const k=[...rs][0];for(let q=0;q<N;q++)if(q!==c.p)ch=cut(q,i=>rg[i]!==k,"#"+j,j)||ch}}
    else if(c.t==="nalone")ch=cut(c.p,i=>D.some((d,q)=>q!==c.p&&d.some(y=>rg[y]===rg[i]&&R(y)!==R(i)&&C(y)!==C(i))),"#"+j,j)||ch});
   const sure=k=>{const a=[];for(let q=0;q<V;q++)if(D[q].every(y=>rg[y]===k))a.push(q);return a},poss=k=>{const a=[];for(let q=0;q<V;q++)if(D[q].some(y=>rg[y]===k))a.push(q);return a};
   ch=cut(V,i=>sure(rg[i]).length<2,"V2")||ch;ch=cut(V,i=>poss(rg[i]).length>0,"V0")||ch;
   const vr=roomsOf(V);if(vr.size===1){const k=[...vr][0],ps=poss(k),cs=sure(k);
    if(ps.length===1)ch=cut(ps[0],i=>rg[i]===k,"V1|"+k)||ch;
    if(cs.length===1)for(let q=0;q<V;q++)if(q!==cs[0])ch=cut(q,i=>rg[i]!==k,"V3|"+k+"|"+cs[0])||ch}}
  if(st>=3)for(const dim of[0,1]){const key=dim?C:R;
   for(let l=0;l<N;l++){const who=[];for(let q=0;q<N;q++)if(D[q].some(x=>key(x)===l))who.push(q);
    if(who.length===1)ch=cut(who[0],x=>key(x)===l,"H|"+dim+"|"+l)||ch}
   if(st>=4){
    for(let a=0;a<N;a++)for(let b=a+1;b<N;b++){const ls=new Set([...D[a],...D[b]].map(key));if(ls.size!==2)continue;const L=[...ls].sort((x,y)=>x-y);
     for(let q=0;q<N;q++)if(q!==a&&q!==b)ch=cut(q,x=>!ls.has(key(x)),"P|"+dim+"|"+L.join("|")+"|"+a+"|"+b)||ch}
    for(let l1=0;l1<N;l1++)for(let l2=l1+1;l2<N;l2++){const who=[];for(let q=0;q<N;q++)if(D[q].some(x=>key(x)===l1||key(x)===l2))who.push(q);
     if(who.length===2)for(const q of who)ch=cut(q,x=>key(x)===l1||key(x)===l2,"L|"+dim+"|"+l1+"|"+l2+"|"+who[0]+"|"+who[1])||ch}}}
  if(D.some(d=>!d.length)){if(o.out)o.out.empty=D.findIndex(d=>!d.length);return null}
  /* Stap 5 alleen als de makkelijkere stappen niets meer opleveren: per persoon met 2-3 plekken één plek uitproberen. */
  if(!ch&&st>=5)for(let q=0;q<N&&!ch;q++){if(D[q].length<2||D[q].length>3)continue;
   for(const i of D[q]){const D0=D.map(d=>d.slice()),out={};D0[q]=[i];
    if(!murSolve(M,cl,{st:4,D0,out})){ch=cut(q,x=>x!==i,"T|"+i+"|"+(out.empty>=0?out.empty:-1))||ch;break}}}
  if(!ch)break}
 return{D,W,U,ord}}
const murDone=r=>!!r&&r.D.every(d=>d.length===1);
/* Lukt het (zelden, vooral op Moeilijk) niet om een goede puzzel te vinden, probeer dan nog een ronde, en anders een niveau lager.
   Zo blijft de app nooit hangen op "Puzzel maken...". Puzzels die het eerste keer al lukte, blijven precies hetzelfde. */
function genMur(R,lv,hard,enhanced=true){lv=lv||2;for(let t=0;t<2;t++){const p=genMur0(R,lv,hard,enhanced);if(p)return p}return(lv===3||lv===6)?genMur0(R,lv-1,hard,enhanced):genMur0(R,2,false,enhanced)}
function genMur0(R,lv,hard,enhanced){lv=lv||2;const N=MLV[lv]||6,V=N-1,easy=(lv===1||lv===4)&&!hard,tough=(lv===3||lv===6)||hard;const SM=enhanced&&tough?5:4;
 let best=null,bs=-1;
 for(let att=0;att<400&&!(best&&att>=(tough&&(!enhanced||best.need<5)?16:6));att++){
  const K=Math.max(4,N-1-(R()<.5?1:0)),reg=murRooms(N,K,R);if(!reg)continue;
  const rows=shuf([...Array(N).keys()],R),cols=shuf([...Array(N).keys()],R),sol=rows.map((r,p)=>r*N+cols[p]);
  const vk=reg[sol[V]],inV=[];for(let p=0;p<V;p++)if(reg[sol[p]]===vk)inV.push(p);if(inV.length!==1)continue;
  const obj=Array(N*N).fill(null),occ=new Set(sol),kinds=shuf(Object.keys(MOBJ),R);
  const seats=kinds.filter(k=>MOBJ[k].seat).slice(0,2+(R()<.5?1:0)),blocks=kinds.filter(k=>!MOBJ[k].seat).slice(0,3+(R()<.5?1:0)),pk=a=>a[R()*a.length|0];
  sol.forEach(c=>{if(R()<.4)obj[c]={t:pk(seats)}});
  let nb=Math.round(N*N*.17),ns=Math.round(N*.7);
  const lab=new Set();reg.forEach((k,i)=>{if(![...lab].some(j=>reg[j]===k))lab.add(i)});
  for(const i of shuf([...Array(N*N).keys()].filter(i=>!occ.has(i)&&!lab.has(i)),R)){if(nb>0){obj[i]={t:pk(blocks)};nb--}else if(ns>0){obj[i]={t:pk(seats)};ns--}else break}
  const M={N,V,reg,obj},nameR=rng(hash(sol.join(",")+"|mur-names")),ppl=(()=>{const seen=new Set(),o=[];for(const x of shuf(murNamePool().slice(),nameR)){const k=x[0].toLocaleLowerCase("nl");if(seen.has(k))continue;seen.add(k);o.push(x);if(o.length===V)break}return o})().sort((a,b)=>a[0]<b[0]?-1:1).concat([MVICT[Math.floor(nameR()*MVICT.length)]]);
  const rooms=shuf([...Array(MROOM.length).keys()],R).slice(0,K).map(k=>MROOM[k]);
  const pool=[],add=(c,w)=>{if(murE(c,sol,M))pool.push({c,w})};
  for(let p=0;p<V;p++){
   for(let k=0;k<K;k++){add({p,t:"room",k},3);add({p,t:"notroom",k},.4)}
   for(const T of new Set([...seats,...blocks])){if(MOBJ[T].seat)add({p,t:"sit",T},3);add({p,t:"nobj",T},2.5);add({p,t:"lobj",T,d:0},1);add({p,t:"lobj",T,d:1},1)}
   add({p,t:"corner"},1);add({p,t:"tb"},.8);add({p,t:"lr"},.8);add({p,t:"row",k:0},.5);add({p,t:"row",k:N-1},.5);add({p,t:"col",k:0},.5);add({p,t:"col",k:N-1},.5);
   add({p,t:"alone"},1.5);add({p,t:"nalone"},.6);
   for(let x=0;x<N;x++){if(x===p)continue;add({p,t:"np",x},2.5);if(x!==V){add({p,t:"same",x},1.2);add({p,t:"nsame",x},.5)}
    for(const t of["hi","lo","le","ri"])add({p,t,x},.5)}}
  const wpick=a=>{let s=a.reduce((x,y)=>x+y.w,0)*R();for(const e of a){s-=e.w;if(s<=0)return e}return a[a.length-1]};
  const cards=Array.from({length:V},()=>[]),all=()=>cards.flat();const solveAll=()=>{const r=murSolve(M,all(),{st:4});return SM>4&&!murDone(r)&&r?murSolve(M,all(),{st:5}):r};/* Eerst aanvullen tot stap 1-4 genoeg is, daarna bij Moeilijk weghalen zolang "stel dat" het nog oplost. */
  for(let p=0;p<V;p++){const e=wpick(pool.filter(e=>e.c.p===p));cards[p].push(e.c)}
  let rs=murSolve(M,all(),{st:4}),ok=murDone(rs);
  for(let g=0;!ok&&rs&&g<N*2;g++){const open=[];for(let q=0;q<V;q++)if(rs.D[q].length>1&&cards[q].length<3)open.push(q);
   const tgt=open.length?open.sort((a,b)=>rs.D[b].length-rs.D[a].length)[R()<.7?0:R()*open.length|0]:-1;
   const cand=pool.filter(e=>(tgt<0?cards[e.c.p].length<3:e.c.p===tgt)&&!cards[e.c.p].includes(e.c));if(!cand.length)break;
   const e=wpick(cand);cards[e.c.p].push(e.c);rs=murSolve(M,all(),{st:4});ok=murDone(rs)}
  if(!ok)continue;
  for(const c of shuf(all(),R)){const cd=cards[c.p];if(cd.length<2)continue;cd.splice(cd.indexOf(c),1);if(!murDone(solveAll()))cd.push(c)}
  if(cards.some(c=>c.length>3))continue;
  const need=easy?(murDone(murSolve(M,all(),{st:3}))?3:9):[2,3,4,5].find(s=>s<=SM&&murDone(murSolve(M,all(),{st:s})))||9;
  if(easy&&need>3)continue;if(enhanced&&tough&&need<4)continue;
  const sc=(easy?10-all().length:need*10+all().length)+R();if(sc>bs){bs=sc;
   const flat=all(),txt=c=>murClauseTxt(c,M,ppl,rooms);
   best={N,V,reg,obj:obj.map(o=>o?o.t:""),rooms:rooms.map(r=>r[1]),arts:rooms.map(r=>r[0]),ppl:ppl.map(x=>x[0]),gen:ppl.map(x=>x[1]),sol,killer:inV[0],
    cd:flat.map(c=>Object.assign({},c,{text:txt(c)})),cards:cards.map(cs=>cs.map(c=>flat.indexOf(c))),need}}
 }
 if(best)best.cardTxt=best.cards.map(ix=>murCardTxt(ix.map(j=>best.cd[j]),best));
 return best}
function murClauseTxt(c,M,ppl,rooms){const N=M.N,X=c.x!=null?ppl[c.x][0]:"",o=c.T?MOBJ[c.T].n:"",g=ppl[c.p][1],zh=g==="v"?"haar":g==="m"?"zijn":"";
 switch(c.t){case"room":return`Bevond zich ${rooms[c.k][0]}.`;case"notroom":return`Was niet ${rooms[c.k][0]}.`;
  case"sit":return`Zat op een ${o}.`;case"nobj":return`Bevond zich naast een ${o}.`;case"lobj":return zh?`Er stond een ${o} in ${zh} ${c.d?"kolom":"rij"}, in dezelfde ruimte.`:`Er stond een ${o} in dezelfde ${c.d?"kolom":"rij"} als ${ppl[c.p][0]}, in dezelfde ruimte.`;
  case"corner":return"Bevond zich in een hoek.";case"tb":return"Bevond zich in de bovenste of de onderste rij.";case"lr":return"Bevond zich in de eerste of de laatste kolom.";
  case"row":return`Bevond zich in de ${c.k?"onderste":"bovenste"} rij.`;case"col":return`Bevond zich in de ${c.k?"laatste":"eerste"} kolom.`;
  case"np":return`Stond naast ${X}.`;case"same":return`Was in dezelfde ruimte als ${X}.`;case"nsame":return`Was niet in dezelfde ruimte als ${X}.`;
  case"hi":return`Stond in een hogere rij dan ${X}.`;case"lo":return`Stond in een lagere rij dan ${X}.`;case"le":return`Stond meer naar links dan ${X}.`;case"ri":return`Stond meer naar rechts dan ${X}.`;
  case"alone":return"Was alleen.";case"nalone":return"Was niet alleen."}return""}
/* Kaartje: zinnen samenvoegen zoals in het boek ("Bevond zich in de keuken, naast een tafel."). */
function murCardTxt(cs,p){const rm=cs.find(c=>c.t==="room");if(rm){const art=p.arts[rm.k],o=cs.find(c=>c!==rm&&(c.t==="nobj"||c.t==="sit"||c.t==="same"));
  if(o){const rest=cs.filter(c=>c!==rm&&c!==o).map(c=>c.text);const X=o.x!=null?p.ppl[o.x]:"",n=o.T?MOBJ[o.T].n:"";
   const m=o.t==="nobj"?`Bevond zich ${art}, naast een ${n}.`:o.t==="sit"?`Zat ${art} op een ${n}.`:`Was ${art} met ${X}.`;return[m,...rest].join(" ")}}
 return cs.map(c=>c.text).join(" ")}

//==UI==

