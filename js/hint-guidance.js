/* Presentatie van bewezen hinttechnieken. Deze functies kiezen geen nieuwe
   zet en lezen geen verborgen oplossingswaarden. */
const hintJoin=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" en "+a[a.length-1];
const hintCount=(n,one,many)=>n+" "+(n===1?one:many);
function hintLine(cells,W){
 const rs=[...new Set(cells.map(i=>i/W|0))],cs=[...new Set(cells.map(i=>i%W))];
 return rs.length===1?"rij "+(rs[0]+1):cs.length===1?"kolom "+(cs[0]+1):"het gemarkeerde gebied";
}
function hintBroadScope(move){
 const p=S.p,W=p.W||p.N,i=move.cells[0],all=Array.from({length:S.cur.length},(_,j)=>j),why=move.why||[];
 if(S.type==="plus"&&move.unit!=null)return S.pu[move.unit].cells.slice();
 if(S.type==="star"&&why.length<2)return all.filter(j=>p.reg[j]===p.reg[i]);
 let scope=why.length>1?[...new Set(why)]:all.filter(j=>(j/W|0)===(i/W|0));
 if(S.type==="bin"||S.type==="nono"){
  if(scope.every(j=>(j/W|0)===(scope[0]/W|0)))scope=all.filter(j=>(j/W|0)===(scope[0]/W|0));
  else if(scope.every(j=>j%W===scope[0]%W))scope=all.filter(j=>j%W===scope[0]%W);
 }
 return scope;
}
function binGuidance(move,scope){
 const q=move.proof,l=q&&q.line,W=S.p.W;
 const name=l?(l.o?"kolom ":"rij ")+(l.x+1):hintLine(scope,W);
 if(!l)return {scope,direction:"Bekijk de ingevulde tekens in "+name+".",reason:"Voor deze zet heeft de oplosser geen korte afleiding meegeleverd. De concrete invulling blijft in de volgende stap verborgen tot je die zelf opent."};
 const cross=l.v.filter(v=>v===0).length,round=l.v.filter(v=>v===1).length,empty=l.v.filter(v=>v<0).length;
 const count="In "+name+" staan "+hintCount(cross,"kruisje","kruisjes")+" en "+hintCount(round,"rondje","rondjes")+"; "+hintCount(empty,"vakje is","vakjes zijn")+" nog leeg.";
 const guide={scope:l.ci,direction:"Kijk naar "+name+".",reason:count};
 switch(q.rule){
  case "pair":guide.direction+=" Zoek twee "+(q.symbol?"rondjes":"kruisjes")+" naast elkaar.";guide.reason="In "+name+" staat een paar "+sy(q.symbol)+sy(q.symbol)+". Drie gelijke tekens achter elkaar zijn verboden. Bekijk daarom de aansluitende lege plekken: hetzelfde teken zou het paar tot een drietal verlengen.";break;
  case "gap":guide.direction+=" Let op de volgorde van de "+(q.symbol?"rondjes":"kruisjes")+".";guide.reason="In "+name+" staat "+sy(q.symbol)+" met een lege plek en daarna weer "+sy(q.symbol)+". Een gelijk teken in die opening zou drie gelijke tekens achter elkaar maken. De andere mogelijkheid voorkomt dat.";break;
  case "balance":guide.direction+=" Tel hoe vaak "+sy(q.symbol)+" al voorkomt.";guide.reason=count+" Er mogen van elk teken precies "+l.len/2+" staan. Het aantal "+sy(q.symbol)+" is al compleet; nog zo'n teken toevoegen zou de balans verstoren.";break;
  case "balanceConflict":guide.direction+=" Combineer het tellen met de regel over drie gelijke tekens.";guide.reason=count+" Van "+sy(q.symbol)+" kan er nog maar één bij voordat het maximum van "+l.len/2+" is bereikt. Probeer voor die laatste plaats de mogelijkheden in gedachten: de overige lege plekken moeten dan het andere teken krijgen. Een mogelijkheid die daardoor een drietal veroorzaakt valt af.";break;
  case "different":{
   const other=(q.other.o?"kolom ":"rij ")+(q.other.x+1);
   guide.direction+=" Vergelijk deze lijn met een volledig ingevulde lijn.";
   guide.reason="Vergelijk "+name+" met "+other+". De ingevulde tekens komen al overeen en "+name+" heeft nog "+empty+" open plekken. Beide tekens moeten even vaak voorkomen, maar twee volledige lijnen mogen niet gelijk zijn. Een aanvulling die de volledige lijn kopieert valt daarom af.";
   guide.reasonScope=[...new Set([...l.ci,...q.other.ci])];break;
  }
  case "options":guide.direction+=" Vergelijk welke aanvullingen nog aan alle drie de regels voldoen.";guide.reason=count+" Er "+(q.count===1?"is nog één geldige aanvulling":"zijn nog "+q.count+" geldige aanvullingen")+": evenveel kruisjes als rondjes, geen drietal en geen kopie van een volledige lijn. Vergelijk deze aanvullingen; wat in elke aanvulling hetzelfde is, staat vast.";break;
 }
 return guide;
}
function nonoGuidance(move,scope){
 const p=S.p,q=move.proof,l=q&&q.line,name=l?l.nm:hintLine(scope,p.W);
 const cells=l?l.ci:scope,cl=l?l.cl:name.startsWith("rij")?p.rc[cells[0]/p.W|0]:p.cc[cells[0]%p.W];
 const clues=p.color?cnText(cl):cl.join(", ")||"0";
 const known=cells.filter(i=>S.cur[i]>0&&(!p.color?S.cur[i]===1:true)).length;
 const guide={scope:cells,direction:"Kijk naar "+name+" en de aanwijzing "+clues+".",reason:"De aanwijzing van "+name+" is "+clues+". Er "+(known===1?"is":"zijn")+" al "+hintCount(known,"gevuld vakje","gevulde vakjes")+"."};
 if(!q){guide.reason+=" Voor deze zet is geen korte afleiding meegeleverd. De concrete zet staat pas in de volgende stap.";return guide}
 switch(q.rule){
  case "empty":guide.direction="Bekijk de aanwijzing bij "+name+".";guide.reason="De aanwijzing van "+name+" is 0: er is geen enkel blok om te plaatsen. Een gevuld vakje zou dus een blok toevoegen dat niet in de aanwijzing voorkomt.";break;
  case "complete":guide.direction+=" Vergelijk de bestaande blokken met de aanwijzing.";guide.reason+=" De bestaande blokken hebben al precies de opgegeven lengtes en volgorde. Een extra gevuld vakje zou een blok verlengen of een extra blok maken.";break;
  case "overlap":{
   const block=(ORD[q.block]||(q.block+1)+"e")+" blok",color=q.color?" in de kleur "+NCN[q.color]:"",span=q.max-q.min+q.length,overlap=q.length-(q.max-q.min);
   guide.direction="Bekijk in "+name+" vooral het "+block+" van "+hintCount(q.length,"vakje","vakjes")+color+". Hoe ver kan dat blok nog schuiven?";
   guide.reason+=" Het "+block+" is "+hintCount(q.length,"vakje","vakjes")+" lang en kan, rekening houdend met wat er al staat, alleen binnen een strook van "+hintCount(span,"vakje","vakjes")+" liggen. "+(q.min===q.max?"Het blok kan daarin niet meer verschuiven.":"Zelfs tussen de uiterste plaatsingen "+(overlap===1?"blijft":"blijven")+" "+hintCount(overlap,"vakje","vakjes")+" overlappen. Vergelijk die uiterste plaatsingen om te zien wat ze gemeen hebben.");break;
  }
  case "outside":guide.direction+=" Bekijk hoe ver de blokken nog kunnen reiken.";guide.reason+=" Bij het bekijken van "+hintCount(q.count,"geldige plaatsing","geldige plaatsingen")+" blijken er open plekken te zijn die geen enkel blok kan bereiken. Vergelijk de uiterste posities van de blokken; een plek buiten hun bereik kan geen deel van een blok zijn.";break;
  case "options":guide.direction+=" Gebruik de ingevulde vakjes om plaatsingen uit te sluiten.";guide.reason+=" Met deze invoer "+(q.count==null?"worden alle passende plaatsingen vergeleken":q.count===1?"past de blokkenreeks nog op één manier":"zijn er nog "+q.count+" passende plaatsingen")+". Vergelijk wat op dezelfde plekken terugkomt. "+(p.color?"Een kleur staat pas vast als die plek in alle plaatsingen dezelfde kleur heeft. Verschillende kleuren mogen elkaar raken; dezelfde kleur heeft een lege plek ertussen.":"Een plek staat vast als die in alle plaatsingen gevuld is, of in alle plaatsingen leeg blijft. Tussen twee blokken blijft minstens één vakje leeg.");break;
 }
 return guide;
}
function plusGuidance(move,scope){
 const q=move.proof,unit=move.unit,u=unit!=null?S.pu[unit]:null;
 if(!u)return {scope,direction:"Bekijk de sommen bij "+hintLine(scope,S.p.W)+".",reason:"Voor deze zet heeft de oplosser geen korte afleiding gevonden. De concrete keuze is pas in de volgende stap beschikbaar."};
 const name=plusName(u),L=plusLook(u,S.cur,S.p.num),values=L.U.map(i=>S.p.num[i]);
 const guide={scope:u.cells,unit,direction:"Kijk naar "+name+" met som "+u.t+".",reason:"In "+name+" tellen de omcirkelde getallen op tot "+L.K+". Van de som "+u.t+" ontbreekt dus nog "+L.need+". De open getallen zijn "+hintJoin(values)+"."};
 const rule=q&&q.rule;
 if(rule==="complete"){guide.direction+=" Vergelijk het omcirkelde totaal met de som.";guide.reason+=" De gevraagde som is al bereikt. Elk extra positief getal zou het totaal te groot maken."}
 else if(rule==="remaining"){guide.direction+=" Tel de open getallen bij elkaar op.";guide.reason+=" De open getallen zijn samen "+L.s0+": precies het ontbrekende totaal. Een van die getallen weglaten zou het totaal te klein maken."}
 else if(rule==="tooLarge"){guide.direction+=" Vergelijk de grootte van de open getallen met wat nog ontbreekt.";guide.reason+=" Er "+(q.excluded===1?"is één open getal dat":"zijn "+q.excluded+" open getallen die")+" groter "+(q.excluded===1?"is":"zijn")+" dan het ontbrekende totaal. Zo'n getal kan niet in een passende combinatie zitten, omdat de andere getallen positief zijn."}
 else if(rule==="essential"){guide.direction+=" Bekijk hoeveel er overblijft als je een getal niet meetelt.";guide.reason+=" Alle open getallen zijn samen "+L.s0+". Laat om de beurt een getal weg en tel de rest: als de rest minder dan "+L.need+" oplevert, kan de gevraagde som zonder dat getal niet meer worden bereikt."}
 else{
  guide.direction+=" Vergelijk de combinaties die het ontbrekende totaal kunnen maken.";
  guide.reason+=" Er "+(q&&q.count===1?"is één passende getalcombinatie":"zijn "+(q?q.count:L.n)+" passende getalcombinaties")+" voor "+L.need+". ";
  guide.reason+=rule==="cannotInclude"?"Probeer een open getal mee te tellen en controleer of de overige getallen het resterende totaal nog kunnen maken. Als geen combinatie dat lukt, valt die mogelijkheid af.":rule==="cannotExclude"?"Probeer een open getal weg te laten. Als geen combinatie van de overige getallen nog het ontbrekende totaal kan maken, is dat getal noodzakelijk.":"Vergelijk welke getallen in alle passende combinaties voorkomen en welke in geen enkele. Zo onderscheid je noodzakelijke en onmogelijke keuzes.";
 }
 return guide;
}
function starGuidance(move,scope){
 const p=S.p,q=move.proof,K=p.K||2,N=p.N,all=Array.from({length:N*N},(_,j)=>j),region=p.reg[move.cells[0]],regionCells=all.filter(j=>p.reg[j]===region),regionName=unitName("g",region);
 const guide={scope,direction:"Bekijk de vrije plekken in "+regionName+".",reason:"Voor deze stap is geen korte afleiding beschikbaar. De concrete zet is alleen in de volgende stap zichtbaar."};
 if(!q)return guide;
 if(q.unit){
  const name=unitName(q.unit.kind,q.unit.k);guide.scope=q.unit.cells;
  guide.direction="Kijk naar "+name+".";
  if(q.rule==="complete"||q.rule==="remaining"||q.rule==="separate")guide.reason="In "+name+" "+(q.stars===1?"staat":"staan")+" "+hintCount(q.stars,"ster","sterren")+" en "+(q.open===1?"is":"zijn")+" nog "+hintCount(q.open,"plek","plekken")+" vrij. Deze "+(q.unit.kind==="g"?"regio":"lijn")+" heeft in totaal "+hintCount(K,"ster","sterren")+" nodig.";
  if(q.rule==="complete"){guide.direction+=" Tel de geplaatste sterren.";guide.reason+=" Het vereiste aantal is al bereikt. Nog een ster zou er te veel zijn."}
  if(q.rule==="remaining"){guide.direction+=" Vergelijk de vrije plekken met het ontbrekende aantal sterren.";guide.reason+=" Er "+(K-q.stars===1?"ontbreekt":"ontbreken")+" nog "+hintCount(K-q.stars,"ster","sterren")+": evenveel als er vrije plekken over zijn. Een van die plekken uitsluiten zou te weinig ruimte overlaten."}
  if(q.rule==="separate"){guide.direction+=" Let op welke vrije plekken elkaar raken.";guide.reason+=" Er moeten nog twee sterren bij, maar sterren mogen elkaar ook schuin niet raken. Zoek welke vrije plekken onderling allemaal aan elkaar grenzen: in zo'n groep past hooguit één ster. Er moet daarnaast ruimte blijven voor de tweede."}
  if(q.rule==="trial"){
   guide.scope=regionCells;guide.reasonScope=[...new Set([...regionCells,...q.unit.cells])];
   guide.direction="Vergelijk de vrije plekken in "+regionName+" met "+name+". Let op de plekken die bij een ster zouden afvallen.";
   guide.reason="Neem de mogelijkheden in "+regionName+" in gedachten door. Een tijdelijke ster sluit de acht buurposities uit. "+(q.full.length?"Een volle rij, kolom of regio sluit daarna ook de overige plekken uit. ":"")+"Bij de onmogelijke aanname heeft "+name+" daarna nog "+hintCount(q.need,"ster","sterren")+" nodig, terwijl er "+hintCount(q.available,"vrije plek","vrije plekken")+" over "+(q.available===1?"is":"zijn")+". "+(q.available?"Die vrije plekken raken elkaar allemaal, dus er past hooguit één ster.":"Daar kan dan geen ster meer bij.")+" Deze tegenspraak laat zien welke aanname je kunt uitsluiten.";
  }
 }else if(q.rule==="regionsInLines"||q.rule==="linesInRegions"){
  const lines=lineNames(q.kind,q.lines),regions=regNames(q.regions),lineCells=q.lines.flatMap(k=>all.filter(i=>q.kind==="r"?(i/N|0)===k:i%N===k)),regCells=all.filter(i=>q.regions.includes(p.reg[i]));
  guide.scope=lineCells;guide.reasonScope=[...new Set([...lineCells,...regCells])];
  guide.direction="Vergelijk "+lines+" met "+regions+". Waar liggen de vrije plekken van "+(q.regions.length===1?"dat gebied":"die gebieden")+"?";
  guide.reason=(q.rule==="regionsInLines"?"Alle vrije plekken van "+regions+" liggen in "+lines+".":"De sterren van "+lines+" kunnen alleen nog in "+regions+" liggen.")+" Het vereiste totaal voor "+lines+" is "+hintCount(q.lines.length*K,"ster","sterren")+"; voor "+regions+" is dat "+hintCount(q.regions.length*K,"ster","sterren")+". Vergelijk die twee totalen: dezelfde sterren tellen in beide mee. Daardoor is de capaciteit aan beide kanten volledig gereserveerd.";
 }else if(q.rule==="chain"){
  guide.scope=regionCells;guide.direction+=" Vergelijk de gevolgen van een tijdelijke ster en een tijdelijk kruisje.";
  guide.reason="Bij een van de aannames in "+regionName+" volgen "+q.count+" logische vervolgstappen. Uiteindelijk ontstaat deze tegenspraak: “"+q.conflict+"”. Volg het uitsluiten van buurvakjes en het vullen van rijen, kolommen en gebieden om te ontdekken welke aanname daartoe leidt. Een aanname die de puzzel onmogelijk maakt valt af.";
 }
 return guide;
}
function hexGuidance(move){
 const p=S.p,rev=S.hx.rev,q=move.proof;
 if(!q)return {scope:(move.why||[]).filter(i=>rev.has(i)),direction:"Bekijk de zichtbare aanwijzingen rond de onbekende vakjes.",reason:"Voor deze zet is geen korte afleiding meegeleverd. De concrete zet staat pas in de volgende stap."};
 const clues=q.clues,anchors=clues.filter(o=>o.kind==="ring"||o.kind==="zone").map(o=>o.id).filter(i=>rev.has(i)),lines=clues.filter(o=>o.kind==="line").map(o=>o.id);
 const label=o=>o.kind==="rest"?'de teller “nog te vinden”':o.kind==="line"?"de lijn met "+clueTxt(o.c):"het "+(o.kind==="zone"?"blauwe":"zwarte")+" vakje met "+clueTxt(o.c);
 const stats=o=>{const cells=o.c.pos.filter(i=>i>=0),unknown=cells.filter(i=>!rev.has(i)),found=cells.filter(i=>rev.has(i)&&p.sol[i]).length;return {unknown,found,need:o.c.cnt-found}};
 const first=clues.find(o=>o.kind!=="rest")||clues[0],part=stats(first);
 const guide={scope:first.kind==="line"||first.kind==="rest"?[]:[first.id],reasonScope:anchors,lookHexLines:first.kind==="line"?[first.id]:[],reasonHexLines:lines,direction:"Bekijk "+label(first)+".",reason:""};
 if(q.rule==="global"){
  guide.scope=anchors;guide.lookHexLines=lines;
  guide.direction="Vergelijk de zichtbare aanwijzingen met de teller “nog te vinden”.";
  guide.reason="Deze stap vraagt om de combinatie van alle zichtbare aanwijzingen en het resterende totaal. De oplosser heeft hiervoor geen korte lokale afleiding gevonden. De concrete uitkomst blijft verborgen tot je de volgende stap opent.";return guide;
 }
 guide.direction+=clues.length>1?" Vergelijk deze met "+hintJoin(clues.filter(o=>o!==first).map(label))+"; ze beperken elkaar.":first.c.type===1?" Let op de haakjes: de blauwe vakjes moeten één aaneengesloten groep vormen.":first.c.type===2?" Let op de streepjes: de blauwe vakjes mogen niet één aaneengesloten groep vormen.":" Tel wat daar al gevonden is en hoeveel plekken nog onbekend zijn.";
 const parts=clues.map(o=>{const v=stats(o);return "Bij "+label(o)+" "+(v.found===1?"is":"zijn")+" "+hintCount(v.found,"blauw vakje","blauwe vakjes")+" gevonden; de aanwijzing vraagt om "+hintCount(o.c.cnt,"blauw vakje","blauwe vakjes")+". Er "+(v.unknown.length===1?"is":"zijn")+" "+hintCount(v.unknown.length,"onbekende plek","onbekende plekken")+" over en er "+(v.need===1?"ontbreekt":"ontbreken")+" nog "+hintCount(v.need,"blauw vakje","blauwe vakjes")+"."});
 for(const o of clues){
  if(o.c.type===1)parts.push("De haakjes in "+clueTxt(o.c)+" vereisen één aaneengesloten groep blauwe vakjes. Een aanvulling die die groep verbreekt valt af.");
  if(o.c.type===2)parts.push("De streepjes in "+clueTxt(o.c)+" vereisen minstens twee afzonderlijke groepjes blauwe vakjes. Een aanvulling die er één aaneengesloten groep van maakt valt af.");
 }
 if(clues.length===1&&!first.c.type)parts.push(part.need===0?"Het gevraagde aantal is al bereikt. Nog een blauw vakje zou de aanwijzing overschrijden.":"Er ontbreken evenveel blauwe vakjes als er onbekende plekken zijn. Een van die plekken overslaan zou het gevraagde aantal onbereikbaar maken.");
 if(clues.length===2){
  const A=stats(clues[0]),B=stats(clues[1]),shared=A.unknown.filter(i=>B.unknown.includes(i)),outside=A.unknown.length-shared.length;
  if(shared.length)parts.push("Deze aanwijzingen delen "+shared.length+" onbekende plekken. De eerste heeft daarbuiten nog "+outside+" onbekende plekken. Daarom moeten er in het gedeelde deel minstens "+Math.max(0,A.need-outside)+" en hooguit "+Math.min(shared.length,A.need)+" blauwe vakjes zitten. Vergelijk dit met het aantal dat de andere aanwijzing nog nodig heeft.");
 }
 if(clues.length>1)parts.push("Vergelijk de verdelingen die bij elke aanwijzing passen. Een aanvulling moet alle getallen en voorgeschreven groepjes tegelijk respecteren; gedeelde blauwe vakjes tellen voor het totaalaantal maar één keer.");
 guide.reason=parts.join(" ");return guide;
}
function puzzleGuidance(move){
 if(S.type==="hex")return hexGuidance(move);
 const scope=hintBroadScope(move);
 if(move.kind==="fix"){
  const name=S.type==="star"?unitName("g",S.p.reg[move.cells[0]]):hintLine(scope,S.p.W||S.p.N);
  let context="";
  if(S.type==="bin")context="Daar staan nu "+scope.filter(i=>S.cur[i]===0).length+" kruisjes en "+scope.filter(i=>S.cur[i]===1).length+" rondjes. Controleer de balans en de drietallen.";
  if(S.type==="nono"){const cl=name.startsWith("rij")?S.p.rc[scope[0]/S.p.W|0]:S.p.cc[scope[0]%S.p.W];context="De aanwijzing is "+(S.p.color?cnText(cl):cl.join(", ")||"0")+". Vergelijk de ingevulde blokken met die lengtes, volgorde en eventuele kleuren."}
  if(S.type==="star")context="Vergelijk de geplaatste sterren en kruisjes met de "+(S.p.K||2)+" sterren die elke rij, kolom en regio nodig heeft. Sterren mogen elkaar ook schuin niet raken.";
  if(S.type==="plus"){const r=scope[0]/S.p.W|0,total=S.p.rs[r],sum=scope.reduce((a,i)=>a+(S.cur[i]===1?S.p.num[i]:0),0);context="De som van rij "+(r+1)+" moet "+total+" zijn; de omcirkelde getallen tellen nu op tot "+sum+". Vergelijk de eerdere keuzes ook met de kruisende kolomsommen."}
  return {scope,direction:"Controleer je eerdere keuzes in "+name+".",reason:context+" Een keuze in dit kijkgebied wijkt af van een geldige oplossing. In de volgende stap wijs ik aan welke invoer je kunt herstellen."};
 }
 return S.type==="bin"?binGuidance(move,scope):S.type==="nono"?nonoGuidance(move,scope):S.type==="plus"?plusGuidance(move,scope):starGuidance(move,scope);
}
