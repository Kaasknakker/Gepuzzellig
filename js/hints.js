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
  if(kind==="V2")parts.push("De ruimte van "+nm(p.V)+" kan geen twee andere personen bevatten: de moordenaar was alleen met het slachtoffer.");
  if(kind==="V0")parts.push(nm(p.V)+" kan niet alleen in een ruimte liggen; er moet ook iemand anders in die ruimte kunnen staan.");
  if(kind==="V1")parts.push("Het slachtoffer ligt "+p.arts[+f[1]]+". Zoek wie volgens de kaartjes nog bij het slachtoffer kan staan; er moet precies één ander zijn.");
  if(kind==="V3")parts.push(nm(p.V)+" en "+nm(+f[2])+" horen samen "+p.arts[+f[1]]+". Voor een derde persoon is daar geen plaats.");
 }
 if(!used.length&&!direct.length)parts.push("Voor "+name+" kan ik op dit moment geen korte afleiding geven. Je kunt de eigen aanwijzingen vergelijken; de concrete plaats is alleen in de volgende stap beschikbaar.");
 else parts.push("Houd voor "+name+" alleen plekken over die aan al deze voorwaarden voldoen. Vakjes met een voorwerp waarop je niet kunt zitten vallen af. Zo beperk je de mogelijkheden zonder te gokken.");
 return {direction,reason:[...new Set(parts)].join(" "),lookCards:owners.length?[...new Set(primary.map(c=>c.p))]:[person],reasonCards:[...new Set([person,...used.map(c=>c.p)])]};
}
function prepareHint(move){
 const p=S.p,t=S.type,i=move.cells[0],W=p.W||p.N;
 const all=Array.from({length:S.cur?S.cur.length:p.n},(_,j)=>j);
 let scope=[],direction="",reason="",cards=[],unit,lookCards,reasonCards;
 const row=()=>all.filter(j=>(j/W|0)===(i/W|0));
 if(t==="hex"){
  // Alleen reeds zichtbare aanwijzingen, nooit de nog te openen doelvakjes.
  scope=(move.why||[]).filter(j=>S.hx.rev.has(j));
  direction=move.rest?'Kijk naar de teller “nog te vinden” en de zichtbare aanwijzingen.':scope.length?"Bekijk de gestippeld omrande aanwijzingen en tel wat al bekend is.":"Vergelijk de zichtbare aanwijzingen rond de onbekende vakjes.";
  reason="Een getal legt vast hoeveel blauwe vakjes bij de aanwijzing horen. Trek de gevonden blauwe vakjes daarvan af en vergelijk dat met het aantal onbekende vakjes.";
  if(move.nk>1||move.kind==="deduce")reason+=" Combineer de aanwijzingen die vakjes delen: een verdeling moet bij alle betrokken getallen passen. Dezelfde blauwe vakjes tellen in het totaal maar één keer.";
 }else if(t==="mur"){
  // Een rij van de oplossing zou hier de plaats al verraden: gebruik kaartjes.
  const guide=murGuidance(move);({direction,reason,lookCards,reasonCards}=guide);cards=lookCards;
  if(move.kind!=="fix")move.cards=reasonCards;
 }else{
  const why=move.why||[];
  // Een volledige lijn of regio houdt ook bij één doelvakje de zet verborgen.
  scope=why.length>1?[...new Set(why)]:row();
  if(t==="plus"&&move.unit!=null){scope=S.pu[move.unit].cells.slice();unit=move.unit}
  if(t==="star"&&why.length<=1&&p.reg)scope=all.filter(j=>p.reg[j]===p.reg[i]);
  if(t==="nono"||t==="bin"){
   const anchor=scope[0];
   if(scope.every(j=>(j/W|0)===(anchor/W|0)))scope=all.filter(j=>(j/W|0)===(anchor/W|0));
   else if(scope.every(j=>j%W===anchor%W))scope=all.filter(j=>j%W===anchor%W);
  }
  const rows=[...new Set(scope.map(j=>j/W|0))],cols=[...new Set(scope.map(j=>j%W))];
  const name=rows.length===1?"rij "+(rows[0]+1):cols.length===1?"kolom "+(cols[0]+1):t==="star"&&scope.every(j=>p.reg[j]===p.reg[i])?"het gemarkeerde gebied":"de gemarkeerde rijen of kolommen";
  direction="Kijk naar "+name+". Vergelijk wat er al staat met de regels van deze puzzel.";
  if(t==="bin"){
   reason=/twee keer.*naast elkaar|vakje ertussen/.test(move.text)?"Drie gelijke tekens achter elkaar mogen niet. Zoek een paar gelijke tekens of twee gelijke tekens met een opening ertussen en bekijk hoe je een drietal voorkomt.":/gelijk|Vergelijk/.test(move.text)?"Elke rij en kolom heeft evenveel kruisjes als rondjes, nooit drie dezelfde achter elkaar, en mag niet gelijk zijn aan een andere volledige lijn. Vergelijk de mogelijkheden met die drie regels.":"Tel kruisjes en rondjes in de gemarkeerde lijn: van elk moet precies de helft voorkomen. Zodra één soort compleet is, volgt de andere soort voor de resterende vakjes.";
  }else if(t==="nono"){
   reason=p.color?"Schuif de gekleurde blokken zo ver mogelijk naar beide kanten, rekening houdend met ingevulde vakjes. Vakjes die in elke geldige plaatsing dezelfde kleur hebben, staan vast. Blokken van dezelfde kleur hebben een leeg vakje ertussen; verschillende kleuren mogen elkaar raken.":"Schuif de blokken zo ver mogelijk naar beide kanten, rekening houdend met ingevulde vakjes en minstens één leeg vakje tussen blokken. Overlap is zeker gevuld; een vakje dat geen enkel blok kan bereiken blijft leeg.";
   if(rows.length===1||cols.length===1){const cl=rows.length===1?p.rc[rows[0]]:p.cc[cols[0]];reason="De aanwijzing is "+(p.color?cnText(cl):cl.join(", ")||"0")+". "+reason}
  }else if(t==="plus"){
   const u=unit==null?null:S.pu[unit],kept=u?u.cells.reduce((a,j)=>a+(S.cur[j]===1?p.num[j]:0),0):0;
   reason=u?"De lijn moet samen "+u.t+" zijn. Omcirkelde getallen tellen al voor "+kept+" mee; er ontbreekt dus "+(u.t-kept)+". Vergelijk de combinaties van de overige getallen. Getallen die in elke passende combinatie voorkomen blijven staan; getallen die in geen enkele voorkomen vallen af.":"Trek de omcirkelde getallen af van het lijntotaal. Vergelijk welke combinaties van de overige getallen precies het ontbrekende totaal maken.";
  }else if(t==="star"){
   const k=p.K||2;
   reason="Elke rij, kolom en regio bevat "+k+(k===1?" ster":" sterren")+". Sterren raken elkaar ook schuin niet. Tel de beschikbare plekken en vergelijk hoeveel sterren de gemarkeerde lijnen en gebieden samen nodig hebben.";
   if(move.kind==="contra"||move.kind==="deep"||/Stel dat/.test(move.text))reason+=" Probeer een mogelijkheid in gedachten en volg de gevolgen: als er elders te weinig ruimte overblijft, valt die mogelijkheid af.";
  }
 }
 if(move.kind==="fix"&&t!=="mur")reason="Er staat invoer in dit kijkgebied die niet met een geldige oplossing samengaat. Controleer de ingevulde keuzes opnieuw met de puzzelregels. In de volgende stap wijs ik aan welke invoer je kunt wissen; een correctie is nog geen nieuwe oplossingszet.";
 // Een veilige, concrete aanleiding uit de bestaande redenering toevoegen.
 // Zinnen over een doelvakje of een uitkomst horen pas bij de concrete zet.
 if(move.kind!=="fix"&&t!=="mur"){
  const first=(move.text||"").match(/^(?:Kijk naar (?:rij|kolom) \d+\. )?((?:In (?:rij|kolom) \d+|Het (?:eerste|tweede|derde|vierde|vijfde|zesde|zevende|achtste) blok)[^.]+\.)/);
  if(first&&!/dit vakje|deze vakjes|hier|dus|wordt|worden|blijven|ster:|kruisje:/i.test(first[1]))reason=first[1]+" "+reason;
 }
 if(move.kind==="reveal"||move.kind==="deep"||(t==="mur"&&!move.steps&&move.kind==="set"))reason+=" Voor deze stap is geen korte, controleerbare uitleg beschikbaar. De volgende stap toont de uitkomst van de oplosser.";
 const key=JSON.stringify([t,move.kind||"tech",move.set==null?null:move.set,move.cells,move.kind==="fix"?move.cells.map(j=>S.cur[j]):null]);
 return {move,key,level:1,scope,direction,reason,cards,unit,lookCards,reasonCards,cells:[],why:scope};
}
function projectHint(h){
 const full=h.level===3,m=h.move;
 h.cells=full?m.cells:[];h.why=full?(m.why||[]):h.scope;
 h.ghost=full?m.ghost:null;h.cards=full?m.cards:h.level===1?h.lookCards||h.cards:h.reasonCards||h.cards;
 h.rest=m.rest;h.unit=full?m.unit:h.unit;
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
function showHintLevel(h,level,focusNext){
 h.level=level;projectHint(h);registerHint(h,level);
 if(!S.start)S.start=Date.now();
 const b=$("#hint"),action=b.querySelector(".hintnext");clearTimeout(hintHideT);b.classList.remove("closing");b.replaceChildren();
 const add=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;e.textContent=text;b.append(e);return e};
 const close=add("button","hx","✕");close.setAttribute("aria-label","Hint sluiten");close.onclick=()=>clearHint();
 const names=["Kijkrichting","Redenering","Concrete zet"];
 const title=add("h2","hht","💡 "+names[level-1]);title.id="hinttitle";b.setAttribute("aria-labelledby",title.id);
 add("div","hintprogress","Stap "+level+" van 3 · "+names.slice(0,level).join(" → "));
 add("p","hintbody",level===1?h.direction:level===2?h.reason:hintConcrete(h));
 add("p","hintlegend",level<3?"┄ Gestippelde rand: kijkgebied of aanwijzing. De zet is nog verborgen.":"┄ Gestippeld: kijkgebied · ═ Dubbele rand: hier gebeurt de zet.");
 // Behoud de knopidentiteit: de bestaande Pencil-afhandeling moet een
 // nageleverde compatibiliteitsklik op dezelfde knop kunnen tegenhouden.
 const next=action||document.createElement("button");next.className="hintnext";b.append(next);
 if(level<3){next.textContent=level===1?"Meer hulp: redenering":"Meer hulp: concrete zet";next.onclick=()=>showHintLevel(h,level+1,true)}
 else{next.textContent=h.move.btn;next.onclick=doStep}
 if(level>1){const back=add("button","hintback","← "+names[level-2]);back.onclick=()=>showHintLevel(h,level-1,true)}
 add("div","hintusage",hintSummary({hints:S.hints,hintSteps:hintTotals()}));
 b.style.display="block";
 const dock=PHONE||innerWidth<1100;
 document.body.classList.toggle("hintdock",dock);
 if(dock){
  HINTSIDE=0;document.body.classList.remove("hintside");
  const pb=$("#pbot").getBoundingClientRect();
  b.classList.remove("side");Object.assign(b.style,{transform:"none",left:"6px",right:"auto",width:(innerWidth-12)+"px",bottom:"auto",top:"0px"});
  HINTPAD=b.offsetHeight+8;
  b.style.top=Math.max(0,Math.round(pb.top-b.offsetHeight-6))+"px";
  const stage=$("#stage");stage.style.setProperty("--hint-board-height",Math.max(100,pb.top-b.offsetHeight-14-stage.getBoundingClientRect().top)+"px");
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
 persist(true);if(focusNext)next.focus({preventScroll:true});
}
