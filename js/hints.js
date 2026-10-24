/* Stapsgewijze presentatie bovenop de bestaande, puzzelspecifieke oplossers.
   De oorspronkelijke zet blijft afgeschermd tot niveau 3. */
function hintTotals(){
 const levels=Object.values(S.hintLedger||{}),count=n=>levels.filter(x=>x===n).length;
 return {look:count(1),reason:count(2),move:count(3),legacy:S.hintLegacy||0};
}
function hintSummary(r){
 const q=r&&r.hintSteps;
 if(!q)return r&&r.hints>0?r.hints+(r.hints===1?" hint (oude registratie)":" hints (oude registratie)"):r&&r.hints===0?"zonder hint":"";
 const a=[];
 if(q.look)a.push(q.look+(q.look===1?" klein zetje":" kleine zetjes"));
 if(q.reason)a.push(q.reason+" uitleg");
 if(q.move)a.push(q.move+(q.move===1?" volledige hint":" volledige hints"));
 if(q.legacy)a.push(q.legacy+(q.legacy===1?" eerdere hint":" eerdere hints")+" (oude registratie)");
 return a.join(" · ")||(r.hints===0?"zonder hint":"");
}
function restoreHintUsage(saved){
 S.hintLedger=Object.assign({},saved.hintLedger||{});
 S.hintLegacy=saved.hintLegacy==null?(saved.hints||0):saved.hintLegacy;
 S.seenErrors=Object.assign({},saved.seenErrors||{});
}
function registerHint(h,level){
 S.hintLedger=S.hintLedger||{};
 if(S.hintLegacy==null)S.hintLegacy=S.hints||0;
 S.hintLedger[h.key]=Math.max(S.hintLedger[h.key]||0,level);
 S.hints=S.hintLegacy+Object.keys(S.hintLedger).length;
 if(level===3&&h.move.kind==="fix")registerErrors(h.move.cells);
}
/* Een controle-actie telt één foutmoment. Dezelfde invoer opnieuw bekijken
   via Controleer of een correctiehint telt niet opnieuw. */
function registerErrors(cells){
 S.seenErrors=S.seenErrors||{};let fresh=false;
 for(const i of cells){const key=i+":"+S.cur[i];if(!S.seenErrors[key]){fresh=true;S.seenErrors[key]=true}}
 if(fresh)S.mist=(S.mist||0)+1;
}
/* Gebruik de echte afleiding van de Murdoku-oplosser. Citeer uitsluitend
   gegeven aanwijzingen; afgeleide coördinaten blijven tot stap 3 verborgen. */
function murGuidance(move){
 const p=S.p,nm=s=>p.ppl[s],person=move.set,proof=move.proof;
 const join=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" en "+a[a.length-1];
 if(move.kind==="kill"){
  const victim=nm(p.V),at=S.cur.indexOf(p.V),room=at>=0?p.arts[p.reg[at]]:"in één ruimte";
  return {direction:"Bekijk de ruimte waar "+victim+" lag. Wie stond daar nog meer?",reason:victim+" lag "+room+". Het slachtoffer was alleen met de moordenaar. Vergelijk daarom de personen in die ruimte met de personen in de andere ruimtes; alleen iemand die bij het slachtoffer stond kan de moordenaar zijn.",lookCards:[p.V],reasonCards:[p.V]};
 }
 if(move.kind==="fix")return {direction:"Vergelijk de ingevulde keuzes met de kaartjes over hun ruimte en onderlinge positie.",reason:"Een ingevulde keuze past niet bij de aanwijzingen. Controleer eerst de genoemde ruimte, voorwerpen en relaties met andere personen. Daarna kun je gericht een keuze wissen en opnieuw redeneren.",lookCards:[],reasonCards:[]};
 const clues=new Set(),events=[],seen=new Set();
 function visit(s){
  if(seen.has(s)||s==null)return;seen.add(s);
  for(const code of proof&&proof.W[s]||[]){
   const f=code.split("|"),kind=f[0];
   if(kind[0]==="#"){clues.add(+kind.slice(1));if(f[1]!=null)visit(+f[1])}
   else if(kind[0]==="@"){const other=+kind.slice(1);events.push({kind:"occupied",person:other,subject:s});if(proof.fix[other]<0)visit(other)}
   else{
    events.push({kind,f,subject:s});
    if(kind==="P"||kind==="L"){visit(+f[4]);visit(+f[5])}
    if(kind==="H"||kind==="V0"||kind==="V2")for(let other=0;other<p.N;other++)if(other!==s)visit(other);
    if(kind==="V1"||kind==="V3")visit(p.V);
    if(kind==="V3")visit(+f[2]);
   }
  }
 }
 visit(person);
 if(!proof)for(const [j,c] of (p.cd||[]).entries())if((move.cards||[]).includes(c.p))clues.add(j);
 const used=[...clues].map(j=>p.cd[j]).filter(Boolean);
 // Afhankelijkheden leveren kaartjes, maar hun uitsluitingen gelden niet
 // automatisch voor de persoon van deze hint (en kunnen terugverwijzen).
 const direct=events.filter(e=>e.subject===person);
 const own=used.filter(c=>c.p===person),primary=own.length?own:used;
 const types=[...new Set(primary.map(c=>c.t))],focus=[];
 if(types.some(t=>t==="room"||t==="notroom"))focus.push("de genoemde ruimte");
 if(types.some(t=>["sit","nobj","lobj"].includes(t)))focus.push("de voorwerpen");
 if(types.some(t=>["corner","tb","lr","row","col"].includes(t)))focus.push("de genoemde rijen, kolommen of hoeken");
 if(types.some(t=>["np","same","nsame","hi","lo","le","ri","alone","nalone"].includes(t)))focus.push("de relatie met andere personen");
 const name=nm(person)||nm((move.cards||[])[0])||"deze persoon";
 const owners=[...new Set(primary.map(c=>nm(c.p)))];
 const direction="Bekijk "+(primary.length>1?"de aanwijzingen":"het kaartje")+" van "+(owners.length?join(owners):name)+". "+(focus.length?"Let op "+join(focus)+" en welke plekken daarbij passen.":"Welke mogelijkheden kun je met dit kaartje uitsluiten?");
 const parts=used.map(c=>nm(c.p)+": “"+c.text+"”");
 if(types.includes("sit"))parts.push("‘Zat op’ betekent dat de persoon op het vakje met dat zitmeubel staat.");
 if(types.includes("nobj")||types.includes("np"))parts.push("‘Naast’ is recht ernaast, in dezelfde ruimte; schuin of door een muur telt niet.");
 if(types.includes("lobj"))parts.push("Het voorwerp moet in dezelfde genoemde rij of kolom én in dezelfde ruimte staan; de persoon staat niet op dat voorwerp.");
 if(types.some(t=>["hi","lo","le","ri"].includes(t)))parts.push("Vergelijk de mogelijke rijen of kolommen van beide personen en schrap combinaties die de genoemde volgorde omkeren.");
 const occupied=[...new Set(direct.filter(e=>e.kind==="occupied").map(e=>e.person))];
 const placed=occupied.filter(s=>proof.fix[s]>=0),derived=occupied.filter(s=>proof.fix[s]<0);
 if(placed.length)parts.push(join(placed.map(s=>nm(s)+" bezet rij "+((proof.fix[s]/p.N|0)+1)+" en kolom "+(proof.fix[s]%p.N+1)))+". Die rijen en kolommen vallen voor "+name+" af.");
 if(derived.length)parts.push("Bepaal met deze kaartjes eerst de plek van "+join(derived.map(nm))+". De rijen en kolommen van die personen vallen vervolgens voor "+name+" af.");
 for(const {kind,f} of direct){
  if(kind==="H")parts.push("Vergelijk wie nog in "+(f[1]==="0"?"rij ":"kolom ")+(+f[2]+1)+" kan staan. Volgens deze aanwijzingen blijft daarvoor maar één persoon over.");
  if(kind==="P"||kind==="L")parts.push(nm(+f[4])+" en "+nm(+f[5])+" hebben samen de twee "+(f[1]==="0"?"rijen ":"kolommen ")+(+f[2]+1)+" en "+(+f[3]+1)+" nodig. Die zijn daarmee voor andere personen niet meer beschikbaar.");
  if(kind==="T")parts.push(name+" heeft nog maar een paar mogelijke plekken. Probeer er in gedachten één uit en redeneer verder"+(+f[2]>=0&&+f[2]!==person?": kan "+nm(+f[2])+" dan nog ergens staan?":": loopt het dan ergens vast?")+" Zo valt een van die plekken af.");
  if(kind==="V2")parts.push("De ruimte van "+nm(p.V)+" kan geen twee andere personen bevatten: de moordenaar was alleen met het slachtoffer.");
  if(kind==="V0")parts.push(nm(p.V)+" kan niet alleen in een ruimte liggen; er moet ook iemand anders in die ruimte kunnen staan.");
  if(kind==="V1")parts.push("Het slachtoffer ligt "+p.arts[+f[1]]+". Zoek wie volgens de kaartjes nog bij het slachtoffer kan staan; er moet precies één ander zijn.");
  if(kind==="V3")parts.push(nm(p.V)+" en "+nm(+f[2])+" horen samen "+p.arts[+f[1]]+". Voor een derde persoon is daar geen plaats.");
 }
 if(!used.length&&!direct.length)parts.push("Voor "+name+" kan ik op dit moment geen korte afleiding geven. Je kunt de eigen aanwijzingen vergelijken; de concrete plaats is alleen in de volgende stap beschikbaar.");
 else parts.push("Houd voor "+name+" alleen plekken over die aan al deze voorwaarden voldoen. Vakjes met een voorwerp waarop je niet kunt zitten vallen af. Zo beperk je de mogelijkheden zonder te gokken.");
 const briefFacts=(own.length?own:used).slice(0,2).map(c=>nm(c.p)+": “"+c.text+"”"),event=direct.find(e=>["T","P","L","H","V0","V1","V2","V3"].includes(e.kind));
 const briefRule=event?(event.kind==="T"?"Probeer een mogelijke plek: kan "+(+event.f[2]>=0?nm(+event.f[2]):"iedereen")+" dan nog ergens staan?":event.kind==="P"||event.kind==="L"?"Vergelijk de twee rijen of kolommen die deze personen samen nodig hebben.":event.kind==="H"?"Controleer wie nog in "+(event.f[1]==="0"?"rij ":"kolom ")+(+event.f[2]+1)+" past.":"Bij het slachtoffer hoort precies één andere persoon."):occupied.length?"Een rij of kolom waar al iemand staat valt af.":"Voorwerpen zonder zitplek vallen af.";
 const reasonSteps=[...briefFacts,briefRule];if(reasonSteps.length<3)reasonSteps.push("Schrap voor "+name+" de plekken die niet aan deze voorwaarden voldoen.");
 const shortDirection="Bekijk "+(primary.length>1?"de gemarkeerde kaartjes rond ":"het kaartje van ")+(owners[0]||name)+".";
 return {shortDirection,reasonSteps,direction,reason:[...new Set(parts)].join(" "),lookCards:owners.length?[...new Set(primary.map(c=>c.p))]:[person],reasonCards:[...new Set([person,...used.map(c=>c.p)])]};
}
function prepareHint(move){
 const t=S.type;
 let scope=[],reasonScope,direction="",reason="",cards=[],unit,lookCards,reasonCards,lookHexLines,reasonHexLines,briefSource;
 if(t==="mur"){
  const guide=murGuidance(move);briefSource=guide;({direction,reason,lookCards,reasonCards}=guide);cards=lookCards;
  if(move.kind!=="fix")move.cards=reasonCards;
  if(!move.steps&&move.kind==="set")reason+=" Voor deze stap is geen korte, controleerbare uitleg beschikbaar. De volgende stap toont de uitkomst van de oplosser.";
 }else{
  ({scope,reasonScope,direction,reason,unit,lookHexLines,reasonHexLines}=puzzleGuidance(move));
 }
 const key=JSON.stringify([t,move.kind||"tech",move.set==null?null:move.set,move.cells,move.kind==="fix"?move.cells.map(j=>S.cur[j]):null]);
 const guide={scope,direction,reason,unit,lookCards,reasonCards};
 if(t==="mur")Object.assign(guide,briefSource);
 const brief=compactGuidance(move,guide);

 return {move,key,level:1,scope,direction,reason,...brief,cards,unit,lookCards,reasonCards,reasonScope:reasonScope||scope,lookHexLines,reasonHexLines,cells:[],why:scope};
}
function hintStepScope(h,index){
 const q=h.move.proof||{},text=h.reasonSteps[index]||"",p=S.p,N=p.W||p.N;
 if(S.type==="hex"){
  const clues=q.clues||[],numbered=clues.filter(o=>o.kind!=="rest");
  if(/gedeelde|alle getallen|andere aanwijzingen/.test(text))return null;
  const target=/lijn/.test(text)?numbered.find(o=>o.kind==="line"):/getal/.test(text)?numbered.find(o=>o.kind!=="line"):null;
  const o=target||clues[Math.min(index,clues.length-1)];
  if(o)return {cells:[...new Set([...(o.c?.pos||[]),...(o.kind==="zone"||o.kind==="ring"?[o.id]:[])])].filter(i=>i>=0),lines:o.kind==="line"?[o.id]:[]};
 }
 const rows=[...text.matchAll(/rij (\d+)/g)].map(m=>+m[1]-1),cols=[...text.matchAll(/kolom (\d+)/g)].map(m=>+m[1]-1);
 if(rows.length||cols.length){const cells=[];for(const r of rows)for(let c=0;c<N;c++)cells.push(r*N+c);for(const c of cols)for(let r=0;r<(p.H||N);r++)cells.push(r*N+c);return {cells:[...new Set(cells)]}}
 if(S.type==="star"&&q.rule==="trial"){if(index===0)return {cells:p.reg.map((r,i)=>r===p.reg[h.move.cells[0]]?i:-1).filter(i=>i>=0)};if(index===1)return {cells:q.unit.cells}}
 if(S.type==="star"&&q.regions&&/gebieden/.test(text))return {cells:p.reg.map((r,i)=>q.regions.includes(r)?i:-1).filter(i=>i>=0)};
 if(S.type==="star"&&q.lines&&/lijnen|rijen|kolommen/.test(text))return {cells:q.lines.flatMap(k=>Array.from({length:N},(_,j)=>q.kind==="c"?j*N+k:k*N+j))};
 return null;
}
function projectHint(h){
 const full=h.level===3,m=h.move;
 h.cells=full?m.cells:[];h.why=full?(m.why||[]):h.level===1?h.scope:h.reasonScope;
 h.hexLines=h.level===1?h.lookHexLines:h.reasonHexLines;
 h.ghost=full?m.ghost:null;h.cards=full?m.cards:h.level===1?h.lookCards||h.cards:h.reasonCards||h.cards;
 h.rest=m.rest;h.unit=full?m.unit:h.unit;
 h.focusScope=null;if(h.level===2&&h.focusStep!=null){const focus=hintStepScope(h,h.focusStep);if(focus){h.focusScope=focus.cells;h.why=focus.cells;h.hexLines=focus.lines||[];h.rest=false}}

}
function hintConcrete(h){
 const m=h.move,text=m.steps?[m.intro,...m.steps,m.outro].join(" "):m.text;
 // Oude kleurnamen vervangen door de betekenis van de nieuwe lijnpatronen.
 let out=text.replace(/(?:paars|blauw) omrand(e)?/g,"gestippeld omrand$1").replace(/de lichte oranje kruisjes/g,"de lichte voorbeeldkruisjes");
 if(S.type!=="hex"){
  const W=S.p.W||S.p.N;
  out+=" Zetgebied: "+m.cells.map(i=>"rij "+((i/W|0)+1)+", kolom "+(i%W+1)).join("; ")+".";
 }else out+=" De doorgetrokken dubbele rand wijst de te openen vakjes aan.";
 return out;
}
function hintConclusion(h){
 const m=h.move,one=m.cells.length===1,where=one?"het dubbel omrande vakje":"de dubbel omrande vakjes";
 if(m.kind==="fix")return "Herstel de invoer in "+where+".";
 if(S.type==="bin")return "Vul "+where+" met "+sy(m.set)+".";
 if(S.type==="star")return m.set===2?(one?"Plaats een ster in ":"Plaats sterren in ")+where+".":"Zet kruisjes in "+where+".";
 if(S.type==="nono")return S.p.color?m.set>0?"Kleur "+where+" "+NCN[m.set]+".":"Zet kruisjes in "+where+".":m.set===1?"Vul "+where+".":"Zet kruisjes in "+where+".";
 if(S.type==="plus")return (m.set===1?"Omcirkel de dubbel omrande getallen.":"Streep de dubbel omrande getallen weg.");
 if(S.type==="hex"){const color=m.f==null?S.p.sol[m.cells[0]]:m.f;return "Open "+where+" als "+(color?"blauw":"zwart")+"."}
 if(S.type==="mur")return m.kind==="kill"?m.text:"Plaats "+S.p.ppl[m.set]+" op "+where+".";
 return m.text;
}
function layoutHintCard(h){const b=$("#hint");
 b.style.display="block";
 const dock=PHONE||innerWidth<1100;
 document.body.classList.toggle("hintdock",dock);
 if(dock){
  HINTSIDE=0;document.body.classList.remove("hintside");
  const stage=$("#stage"),pb=$("#pbot").getBoundingClientRect(),rail=!PHONE&&document.body.classList.contains("tablet")&&LANDQ.matches;
  const area=stage.getBoundingClientRect(),left=Math.max(6,area.left),right=Math.min(innerWidth-6,area.right),bottom=rail?innerHeight-12:pb.top;
  b.classList.remove("side");Object.assign(b.style,{transform:"none",left:Math.round(left)+"px",right:"auto",width:Math.max(100,right-left)+"px",bottom:"auto",top:"0px"});
  HINTPAD=b.offsetHeight+8;
  b.style.top=Math.max(0,Math.round(bottom-b.offsetHeight-6))+"px";
  stage.style.setProperty("--hint-board-height",Math.max(100,bottom-b.offsetHeight-14-stage.getBoundingClientRect().top)+"px");
  resetPuzzleFit();render();
 }else{
  // Reserveer ook op desktop ruimte, zodat de kaart geen bord of bediening bedekt.
  b.classList.add("side");Object.assign(b.style,{transform:"",left:"",top:"",width:"",bottom:"",right:""});
  HINTPAD=0;HINTSIDE=1;document.body.classList.add("hintside");resetPuzzleFit();render();
 }
 repaintHint();
 if(dock){
  const stage=$("#stage"),i=h.cells[0]??h.why[0];
  const cell=S.type==="mur"?S.mcells&&S.mcells[i]:S.type==="hex"?$("#hexsvg").querySelector('g[data-i="'+i+'"]'):S.cells&&S.cells[i];
  if(cell){const r=cell.getBoundingClientRect(),v=stage.getBoundingClientRect();if(r.bottom>v.bottom)stage.scrollTop+=r.bottom-v.bottom+6;else if(r.top<v.top)stage.scrollTop-=v.top-r.top+6}
 }
}
function showHintLevel(h,level,focusNext){
 h.level=level;h.focusStep=null;if(!h.stale){projectHint(h);registerHint(h,level)}
 if(!S.start)S.start=Date.now();
 const b=$("#hint"),action=b.querySelector(".hintnext");clearTimeout(hintHideT);b.classList.remove("closing");b.replaceChildren();
 const add=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;e.textContent=text;b.append(e);return e};
 const close=add("button","hx","✕");close.setAttribute("aria-label","Hint sluiten");close.onclick=()=>clearHint();
 const names=["Klein duwtje","Uitleg","Volledige hint"];
 const title=add("h2","hht","💡 "+names[level-1]);title.id="hinttitle";b.setAttribute("aria-labelledby",title.id);
 add("div","hintprogress","Stap "+level+" van 3");
 if(level===2){const steps=add("ol","hintbody hintsteps","");for(const [index,text] of h.reasonSteps.entries()){const li=document.createElement("li");li.textContent=text;steps.append(li);
 if(hintStepScope(h,index)){const focus=document.createElement("button");focus.className="hintfocus";focus.textContent="Toon op het bord";focus.setAttribute("aria-pressed","false");focus.onclick=()=>{if(h.stale)return;h.focusStep=h.focusStep===index?null:index;for(const b of bSteps())b.setAttribute("aria-pressed",String(b===focus&&h.focusStep===index));projectHint(h);layoutHintCard(h)};li.append(focus)}}
 function bSteps(){return b.querySelectorAll(".hintfocus")}
}
 else add("p","hintbody",level===1?h.shortDirection:hintConclusion(h));
 if(level>1){const details=add("details","hintdetails","");details.open=!!(h.detailsOpen&&h.detailsOpen[level]);
  const summary=document.createElement("summary");summary.textContent="Meer uitleg";details.append(summary);
  const body=document.createElement("p");body.className="hintbody";body.textContent=level===2?h.reason:hintConcrete(h);details.append(body);
  details.addEventListener("toggle",()=>{h.detailsOpen=h.detailsOpen||{};h.detailsOpen[level]=details.open;if(S.hint===h&&b.isConnected&&b.contains(details)&&(PHONE||innerWidth<1100))layoutHintCard(h)});
 }
 add("p","hintlegend",h.stale?"Het bord is gewijzigd. Vernieuw de hint voor een actuele aanwijzing.":level<3?"┄ Gestippeld: kijkgebied.":"═ Dubbele rand: hier komt de zet.");
 // Behoud de knopidentiteit: de bestaande Pencil-afhandeling moet een
 // nageleverde compatibiliteitsklik op dezelfde knop kunnen tegenhouden.
 const next=action||document.createElement("button");next.className="hintnext";b.append(next);
 if(h.stale){next.textContent="Vernieuw hint voor dit bord";next.onclick=()=>{clearHint();hintGo()}}
 else if(level<3){next.textContent=level===1?"Geef wat meer uitleg":"Toon de volledige hint";next.onclick=()=>showHintLevel(h,level+1,true)}
 else{next.textContent=h.move.btn;next.onclick=doStep}
 if(level>1&&!h.stale){const back=add("button","hintback","← "+names[level-2]);back.onclick=()=>showHintLevel(h,level-1,true)}
 add("div","hintusage",hintSummary({hints:S.hints,hintSteps:hintTotals()}));
 layoutHintCard(h);
 persist(true);if(focusNext)next.focus({preventScroll:true});
}
