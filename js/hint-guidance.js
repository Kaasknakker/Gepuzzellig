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

/* Korte leeslaag: één kijkvraag en hooguit drie losse gedachten.
   De volledige afleiding blijft bewaard voor ‘Meer uitleg’. Geen doelvakjes
   of verborgen oplossingswaarden lezen bij het maken van deze teksten. */
// Vertel de redenering: waar kijken we, wat weten we, wat volgt daaruit?
function compactGuidance(move,guide){
 const p=S.p,q=move.proof||{},rule=q.rule;
 const result=(direction,...steps)=>({shortDirection:direction,reasonSteps:steps.filter(Boolean)});
 const fallback=()=>result('Kijk nog eens naar de gemarkeerde aanwijzingen.','Voor deze stap kan ik nog geen korte uitleg geven. Je kunt de volledige hint openen om te zien welke zet mogelijk is.');
 if(move.kind==='fix')return result('Kijk nog eens naar wat je hier hebt ingevuld.','Een van je keuzes past niet bij de aanwijzingen van de puzzel.','Open de volledige hint als je wilt zien welk vakje je kunt herstellen.');
 if(S.type==='mur'){
  if(move.kind==='kill')return result('Wie was er bij het slachtoffer?','Het slachtoffer was alleen met de moordenaar in een ruimte.','Kijk wie er in diezelfde ruimte staat. Die persoon is dus de moordenaar.');
  if(!move.proof)return fallback();
  return {shortDirection:guide.shortDirection||'Lees de gemarkeerde kaartjes nog eens.',reasonSteps:guide.reasonSteps||['Kijk welke plekken passen bij wat op deze kaartjes staat.','Een plek die niet bij alle aanwijzingen past, kun je wegstrepen.']};
 }
 if(S.type==='bin'){
  const l=q.line;if(!l)return fallback();
  const name=(l.o?'kolom ':'rij ')+(l.x+1),where=l.o?'kolom':'rij',one=q.symbol?'rondje':'kruisje',many=q.symbol?'rondjes':'kruisjes',other=q.symbol?'kruisje':'rondje',half=l.len/2;
  if(rule==='pair')return result('Kijk naar '+name+'. Zie je de twee '+many+' naast elkaar?','Er mogen nooit drie dezelfde tekens achter elkaar staan.','Direct naast deze twee '+many+' mag dus geen '+one+' meer komen. Op een lege plek ernaast hoort een '+other+'.');
  if(rule==='gap')return result('Kijk naar '+name+'. Tussen twee '+many+' zit nog een leeg vakje.','Als je daar ook een '+one+' zet, staan er drie dezelfde tekens achter elkaar. Dat mag niet.','In dat middelste vakje moet daarom een '+other+' komen.');
  if(rule==='balance')return result('Kijk naar '+name+' en tel de '+many+'.','In deze '+where+' moeten precies '+half+' kruisjes en '+half+' rondjes komen. Er staan al '+half+' '+many+'.','Er kan dus geen '+one+' meer bij. In de overgebleven lege vakjes komt het andere teken.');
  if(rule==='balanceConflict')return result('Kijk naar '+name+'. Er kan nog maar één '+one+' bij.','Probeer in gedachten waar dat laatste '+one+' zou kunnen staan. Alle andere lege vakjes moeten dan een '+other+' krijgen.','Krijg je zo ergens drie dezelfde tekens achter elkaar? Dan kan dat laatste '+one+' niet op de plek die je probeerde.');
  if(rule==='different'){const otherName=(q.other.o?'kolom ':'rij ')+(q.other.x+1);return result('Kijk naar '+name+' en vergelijk die met '+otherName+'.','De tekens die al zijn ingevuld, staan op dezelfde plekken. Maar twee volledig ingevulde '+(l.o?'kolommen':'rijen')+' mogen nooit precies hetzelfde zijn.','Vul de lege vakjes dus zo aan dat beide tekens even vaak voorkomen én deze '+where+' verschilt van '+otherName+'.')}
  return result('Kijk naar de lege vakjes in '+name+'.','Vul ze in gedachten aan: evenveel kruisjes als rondjes, nooit drie dezelfde tekens achter elkaar en geen twee gelijke '+(l.o?'kolommen':'rijen')+'.','Er '+(q.count===1?'is nog maar één manier die aan die regels voldoet.':'zijn nog '+q.count+' manieren die aan die regels voldoen. Kijk welk teken bij al die manieren op dezelfde plek staat. Dat teken kun je alvast invullen.'));
 }
 if(S.type==='nono'){
  const l=q.line,name=l?l.nm:hintLine(guide.scope,p.W),where=name.startsWith('kolom')?'kolom':'rij';
  if(rule==='empty')return result('Kijk naar het getal bij '+name+'. Dat is 0.','In deze '+where+' hoeft dus geen enkel vakje gevuld te worden.','Je kunt alle lege vakjes in deze '+where+' wegkruisen.');
  if(rule==='complete')return result('Kijk naar de ingevulde blokken in '+name+'.','Ze hebben al precies de lengtes en de volgorde die de getallen aangeven. Alle blokken zijn dus klaar.','De lege vakjes die overblijven, mogen niet meer gevuld worden. Daar kun je kruisjes zetten.');
  if(rule==='overlap'){
   const block=ORD[q.block]||(q.block+1)+'e',span=q.max-q.min+q.length,overlap=q.length-(q.max-q.min);
   return result('Kijk naar het '+block+' blok in '+name+'. Hoe ver kun je dat nog verschuiven?','Het blok is '+hintCount(q.length,'vakje','vakjes')+' lang'+(q.color?' en heeft de kleur '+NCN[q.color]:'')+'. Er is nog ruimte voor dat blok binnen '+hintCount(span,'vakje','vakjes')+'.',q.min===q.max?'Het blok past nog maar op één plek. Je kunt het daar dus invullen.':'Schuif het in gedachten eerst helemaal naar het begin en daarna helemaal naar het einde. Er '+(overlap===1?'is 1 vakje dat':'zijn '+overlap+' vakjes die')+' in beide gevallen bij het blok '+(overlap===1?'hoort':'horen')+'. Die kun je alvast invullen.');
  }
  if(rule==='outside')return result('Kijk naar de blokken die nog in '+name+' moeten komen.','Schuif ze in gedachten zo ver mogelijk naar beide kanten, zonder dat ze botsen met wat je al weet.','Een leeg vakje waar geen enkel blok bij kan komen, blijft zeker leeg. Daar kun je een kruisje zetten.');
  return result('Kijk hoe de blokken nog in '+name+' passen.','De getallen geven de lengte en volgorde van de blokken aan. Wat al is ingevuld, helpt je om sommige plekken uit te sluiten.','Kijk wat bij alle overgebleven mogelijkheden hetzelfde blijft. Is een vakje steeds gevuld'+(p.color?' met dezelfde kleur':'')+'? Dan kun je dat invullen. Blijft het steeds leeg? Dan komt er een kruisje.');
 }
 if(S.type==='plus'){
  const u=move.unit!=null?S.pu[move.unit]:null;if(!u)return fallback();
  const L=plusLook(u,S.cur,p.num),name=plusName(u),start='De omcirkelde getallen moeten samen '+u.t+' zijn. Je hebt al '+L.K+' omcirkeld, dus je hebt nog '+L.need+' nodig.';
  if(rule==='complete')return result('Kijk naar de omcirkelde getallen in '+name+'.','Samen zijn ze al precies '+u.t+'. De som is dus klaar.','Als je nog een getal meetelt, wordt de som te groot. Je kunt de andere open getallen hier wegstrepen.');
  if(rule==='remaining')return result('Kijk naar de getallen die nog open zijn in '+name+'.',start,'Die open getallen zijn samen '+L.s0+': precies wat je nog nodig hebt. Je moet ze dus allemaal meetellen en kunt ze omcirkelen.');
  if(rule==='tooLarge')return result('Kijk naar '+name+'. Welk getal is groter dan wat je nog nodig hebt?',start,'Een getal boven '+L.need+' maakt de som meteen te groot. Zo’n getal kun je dus wegstrepen.');
  if(rule==='essential')return result('Kijk naar '+name+'. Kun je de som nog maken als je een getal overslaat?',start,'Tel de open getallen bij elkaar op en laat er telkens één weg. Kom je zonder dat getal niet meer aan '+L.need+'? Dan heb je het nodig en kun je het omcirkelen.');
  return result('Kijk welke getallen samen de som in '+name+' kunnen maken.',start,rule==='cannotInclude'?'Tel een open getal in gedachten mee. Kun je met de andere getallen daarna niet meer precies op '+L.need+' uitkomen? Dan kan dat getal niet meedoen en kun je het wegstrepen.':rule==='cannotExclude'?'Laat een open getal in gedachten weg. Kun je met de andere getallen dan niet meer precies '+L.need+' maken? Dan heb je dat getal nodig en kun je het omcirkelen.':'Probeer welke groepjes open getallen samen precies '+L.need+' zijn. Een getal dat je elke keer nodig hebt, kun je omcirkelen. Een getal dat nooit meedoet, kun je wegstrepen.');
 }
 if(S.type==='star'){
  const K=p.K||2,u=q.unit,name=u?unitName(u.kind,u.k):null;
  if(rule==='regionsInLines'||rule==='linesInRegions'){
   const lines=lineNames(q.kind,q.lines),regions=regNames(q.regions),single=q.lines.length===1,area=q.regions.length===1,total=q.lines.length*K;
   const line=single?'deze '+(q.kind==='r'?'rij':'kolom'):'deze '+(q.kind==='r'?'rijen':'kolommen'),region=area?'dit gekleurde vlak':'deze gekleurde vlakken';
   const lineCells=q.lines.flatMap(k=>Array.from({length:p.N},(_,j)=>q.kind==='r'?k*p.N+j:j*p.N+k)),regCells=p.reg.map((r,i)=>q.regions.includes(r)?i:-1).filter(i=>i>=0);
   if(single&&area){
    const noun=q.kind==='r'?'rij':'kolom',same='In deze '+noun+' '+(K===1?'moet':'moeten')+' '+hintCount(K,'ster','sterren')+' komen. In het hele vlak '+(K===1?'moet':'moeten')+' er ook '+K+' komen. Het gaat dus om dezelfde '+(K===1?'ster':'sterren')+'.';
    const steps=rule==='linesInRegions'?[
     'Alle vrije vakjes in '+lines+' liggen in hetzelfde gekleurde vlak: '+regions+'.',
     same,
     'Alle lege vakjes van dat vlak buiten deze '+noun+' kun je daarom wegkruisen.'
    ]:[
     'Alle vrije vakjes van '+regions+' liggen in '+lines+'.',
     same,
     'Alle lege vakjes van deze '+noun+' buiten dat vlak kun je daarom wegkruisen.'
    ];
    return {...result('Kijk naar '+lines+' en '+regions+'. Waar kunnen de sterren nog komen?',...steps),reasonScopes:[lineCells,regCells,[...new Set([...lineCells,...regCells])]]};
   }
   const steps=rule==='linesInRegions'?[
    'Alle plekken waar in '+line+' nog een ster kan komen, liggen in '+regions+'.',
    'In '+line+' '+(total===1?'moet':'moeten')+' '+hintCount(total,'ster','sterren')+' komen. In '+region+' '+(total===1?'moet':'moeten')+' er in totaal ook '+total+' komen. Dat moeten dus dezelfde sterren zijn.',
    'Daarom is er in '+region+' buiten '+lines+' geen ruimte meer voor een ster. De lege vakjes daar kun je wegkruisen.'
   ]:[
    'Alle plekken waar in '+regions+' nog een ster kan komen, liggen in '+lines+'.',
    'In '+region+' '+(total===1?'moet':'moeten')+' samen '+hintCount(total,'ster','sterren')+' komen. In '+line+' '+(total===1?'moet':'moeten')+' er ook precies '+total+' komen. De sterren uit '+region+' vullen '+line+' dus helemaal.',
    'Daarom kan er in '+line+' buiten '+regions+' geen ster meer bij. De lege vakjes daar kun je wegkruisen.'
   ];
   return {...result('Kijk naar '+lines+'. Vergelijk de plekken voor de sterren met '+regions+'.',...steps),reasonScopes:[lineCells,regCells,[...new Set([...lineCells,...regCells])]]};
  }
  if(rule==='trial')return result('Kijk naar de gemarkeerde vrije plekken. Wat gebeurt er als je daar een ster probeert?','Stel dat je een ster op een van die plekken zet. In de vakjes eromheen mag dan geen ster meer komen, ook niet schuin ernaast.','Voor '+name+' zijn daarna nog '+hintCount(q.need,'ster','sterren')+' nodig. '+(q.available?'Maar de '+hintCount(q.available,'overgebleven plek','overgebleven plekken')+' '+(q.available===1?'biedt':'bieden')+' samen ruimte voor hooguit één ster.':'Maar er is dan geen vrije plek meer over.'),'Dat kan dus niet. Een plek die dit probleem veroorzaakt, kun je wegkruisen.');
  if(u){const which=u.kind==='g'?'dit vlak':u.kind==='r'?'deze rij':'deze kolom',need=K-q.stars;
   if(rule==='complete')return result('Kijk naar '+name+' en tel de sterren.','In '+which+' '+(K===1?'moet':'moeten')+' '+hintCount(K,'ster','sterren')+' staan. '+(K===1?'Die staat er al.':'Die staan er al.'),'Er mag dus geen ster meer bij. Je kunt de andere lege vakjes in '+which+' wegkruisen.');
   if(rule==='remaining')return result('Kijk naar de lege vakjes in '+name+'.',(q.stars===0?'In '+which+' staat nog geen ster.':'In '+which+' '+(q.stars===1?'staat':'staan')+' al '+hintCount(q.stars,'ster','sterren')+'.')+' Er '+(need===1?'moet':'moeten')+' nog '+hintCount(need,'ster','sterren')+' bij.',q.open===1?'Er is nog maar één vrij vakje. Dat vakje heb je dus nodig voor de ontbrekende ster.':'Er zijn nog maar '+q.open+' vrije vakjes. Je hebt ze dus allemaal nodig voor de ontbrekende sterren.');
   if(rule==='separate')return result('Kijk naar de vrije vakjes in '+name+'. Welke raken elkaar?','Er moeten nog twee sterren in '+which+' komen. Ze mogen elkaar niet raken, ook niet schuin.','Laat in gedachten een vrij vakje weg. Raken alle andere vrije vakjes elkaar? Dan past daar maar één ster. De tweede ster moet dus in het vakje komen dat je wegliet.');
  }
  if(rule==='chain')return result('Probeer in gedachten een ster in het gemarkeerde vlak.','Kruis de buurvakjes in gedachten weg. Kijk daarna waar er nog sterren kunnen komen.','Dan loop je vast: “'+q.conflict+'”. Dat betekent dat de keuze die je probeerde niet kan.');
  return fallback();
 }
 if(S.type==='hex'){
  const clues=q.clues||[],rev=S.hx.rev,label=o=>o.kind==='rest'?'de teller boven het bord':o.kind==='line'?'de lijn met het getal '+clueTxt(o.c):'het '+(o.kind==='zone'?'blauwe':'zwarte')+' vakje met het getal '+clueTxt(o.c);
  const stats=o=>{const unknown=o.c.pos.filter(i=>i>=0&&!rev.has(i)),found=o.c.pos.filter(i=>i>=0&&rev.has(i)).reduce((n,i)=>n+p.sol[i],0);return{unknown,need:o.c.cnt-found}};
  const fact=o=>{const v=stats(o);return 'Bij '+label(o)+' '+(v.unknown.length===1?'is nog 1 vakje':'zijn nog '+v.unknown.length+' vakjes')+' dicht. Daarvan '+(v.need===1?'moet er nog 1 blauw worden':'moeten er nog '+v.need+' blauw worden')+'.'};
  const grouped=o=>o.c.type===1?'De haakjes betekenen: de blauwe vakjes moeten één groepje vormen, zonder gat ertussen.':'De streepjes betekenen: er moeten minstens twee losse groepjes blauwe vakjes zijn.';
  if(!clues.length||rule==='global')return result('Kijk naar de getallen op het bord en de teller erboven.','Alle getallen moeten tegelijk kloppen. Ook het totale aantal blauwe vakjes moet passen.','Voor deze stap kan ik nog geen korte uitleg geven. De volledige hint laat je zien welke vakjes je kunt openen.');
  const first=clues.find(o=>o.kind!=='rest')||clues[0],A=stats(first);
  if(clues.length===1)return result('Kijk naar '+label(first)+'.',fact(first),first.c.type?grouped(first)+' Probeer hoe de blauwe vakjes kunnen liggen. Vakjes die bij elke mogelijkheid dezelfde kleur krijgen, kun je openen.':A.need===0?'Je hebt de blauwe vakjes die dit getal aangeeft al gevonden. De vakjes die hier nog dicht zijn, moeten dus zwart zijn.':'Er zijn precies genoeg dichte vakjes over voor het ontbrekende aantal blauwe vakjes. Ze moeten dus allemaal blauw zijn.');
  const second=clues.find(o=>o!==first),B=stats(second),direction='Kijk naar '+label(first)+' en '+label(second)+'.';
  if(clues.length>2)return result('Kijk naar de drie gemarkeerde getallen.',...clues.map((o,i)=>fact(o)+(o.c.type?' '+grouped(o):'')+(i===2?' Probeer waar de blauwe vakjes passen. Alle drie de getallen moeten tegelijk kloppen.':'')));
  if(second.kind==='rest')return result(direction,'De teller zegt dat je op het hele bord nog '+hintCount(B.need,'blauw vakje','blauwe vakjes')+' moet vinden.',fact(first),(first.c.type?grouped(first)+' ':'')+'Buiten de dichte vakjes bij dit getal moeten dus nog '+hintCount(B.need-A.need,'blauw vakje','blauwe vakjes')+' liggen.');
  const types=clues.filter(o=>o.c.type),shared=A.unknown.filter(i=>B.unknown.includes(i)).length;
  if(types.length)return result(direction,fact(first)+(first.c.type?' '+grouped(first):''),fact(second)+(second.c.type?' '+grouped(second):''),'Kijk naar de '+hintCount(shared,'dichte plek','dichte plekken')+' die bij beide getallen '+(shared===1?'hoort':'horen')+'. Kun je de groepjes zo maken dat beide getallen kloppen?');
  const low=Math.max(0,A.need-(A.unknown.length-shared),B.need-(B.unknown.length-shared)),high=Math.min(shared,A.need,B.need);
  return result(direction,fact(first),fact(second)+' Er '+(shared===1?'is 1 dicht vakje dat':'zijn '+shared+' dichte vakjes die')+' bij beide getallen '+(shared===1?'hoort':'horen')+'. Daar '+(low===high?'moeten precies '+hintCount(low,'blauw vakje','blauwe vakjes')+' komen.':'moeten minstens '+low+' en hooguit '+high+' blauwe vakjes komen.'));
 }
 return fallback();
}

// Het tweede duwtje stelt een vraag; de afleiding en de zet blijven voor stap 3.
function thoughtGuidance(move,guide){
 const p=S.p,q=move.proof||{},rule=q.rule,N=p.W||p.N,scope=(guide.scope||[]).slice();
 const result=(cells,...steps)=>({thinkScope:[...new Set(cells)],thinkSteps:steps.filter(Boolean)});
 if(move.kind==='fix')return result(scope,'Kijk naar je ingevulde vakjes. Welke keuze zou botsen met een aanwijzing als je die laat staan?');
 if(S.type==='bin'&&q.line){
  const l=q.line,symbol=q.symbol?'rondje':'kruisje',blank=l.ci.filter(i=>S.cur[i]<0);
  const near=rule==='pair'||rule==='gap'?l.ci.filter(i=>move.cells.includes(i)||move.cells.some(j=>Math.abs(l.ci.indexOf(i)-l.ci.indexOf(j))<=2)):blank;
  if(rule==='pair'||rule==='gap')return result(near,'Kijk naar deze lege vakjes. Wat gebeurt er als je hier ook een '+symbol+' invult? Hoeveel dezelfde tekens staan er dan achter elkaar?');
  if(rule==='balance')return result(blank,'Van elk teken mogen er precies '+l.len/2+' in deze '+(l.o?'kolom':'rij')+' staan. Het aantal '+(q.symbol?'rondjes':'kruisjes')+' is al compleet. Wat gebeurt er als je er nog één bij zet?');
  if(rule==='balanceConflict')return result(blank,'Er kan nog maar één '+symbol+' bij. Probeer om de beurt een van deze vakjes. Krijg je dan ergens drie dezelfde tekens achter elkaar?');
  if(rule==='different')return result(blank,'Probeer de tekens uit de andere '+(l.o?'kolom':'rij')+' in deze lege vakjes over te nemen. Wat gebeurt er dan met de regel dat twee '+(l.o?'kolommen':'rijen')+' nooit hetzelfde mogen zijn?');
  return result(blank,'Probeer hier beide tekens in gedachten. Met welke keuze kun je verder zonder te veel van één teken, drie gelijke tekens of een gelijke '+(l.o?'kolom':'rij')+' te krijgen?');
 }
 if(S.type==='star'){
  const K=p.K||2;
  if(q.lines&&q.regions){
   const lineCells=q.lines.flatMap(k=>Array.from({length:p.N},(_,j)=>q.kind==='r'?k*p.N+j:j*p.N+k));
   const shared=lineCells.filter(i=>q.regions.includes(p.reg[i])&&disp(i)!==1);
   return result(shared,'Kijk naar de vakjes die de '+(q.lines.length===1?(q.kind==='r'?'rij':'kolom'):(q.kind==='r'?'rijen':'kolommen'))+' en '+(q.regions.length===1?'het gekleurde vlak':'de gekleurde vlakken')+' delen. Ze hebben allebei in totaal '+hintCount(q.lines.length*K,'ster','sterren')+' nodig.','Stel dat er daarbuiten ook nog een ster komt. Kunnen die twee aantallen dan nog allebei kloppen?');
  }
  const cells=q.unit?q.unit.cells.filter(i=>disp(i)===0):move.cells;
  if(rule==='complete')return result(cells,'Er '+(K===1?'staat al één ster':'staan al '+K+' sterren')+' in deze rij, kolom of dit vlak. Wat gebeurt er met het aantal als je in een van deze vakjes nog een ster zet?');
  if(rule==='remaining')return result(cells,'Er '+(K-q.stars===1?'moet nog één ster':'moeten nog '+(K-q.stars)+' sterren')+' bij. Wat gebeurt er als je een van deze vrije vakjes wegkruist? Houd je dan genoeg plekken over?');
  if(rule==='separate')return result(cells,'Er moeten nog twee sterren komen die elkaar niet raken. Laat in gedachten één vrij vakje weg. Passen beide sterren dan nog op de andere vrije plekken?');
  return result(move.cells,'Probeer in deze vakjes in gedachten een ster. Kruis de buurvakjes eromheen weg, ook schuin.','Kijk waar de overige sterren dan nog kunnen komen. Blijft er voor elke rij, kolom en elk vlak genoeg ruimte over?');
 }
 if(S.type==='nono'){
  const l=q.line,cells=l&&rule==='overlap'?l.ci.slice(q.min,q.max+q.length):l?l.ci:scope;
  if(rule==='overlap')return result(cells,'Schuif dit blok in gedachten helemaal naar de ene kant en daarna naar de andere kant.','Welke vakjes horen in beide gevallen bij het blok?');
  if(rule==='empty'||rule==='complete')return result(cells,'Kijk naar de getallen en wat al ingevuld is. Past er nog een gevuld vakje bij, zonder een blok langer te maken of een extra blok toe te voegen?');
  if(rule==='outside')return result(cells,'Schuif de blokken in gedachten zo ver mogelijk op. Kan een van de blokken deze vakjes ooit bereiken?');
  return result(cells,'Probeer hoe de blokken hier nog kunnen liggen. Welke vakjes blijven bij elke mogelijkheid hetzelfde?'+(p.color?' Let ook op de kleuren.':''));
 }
 if(S.type==='plus'&&move.unit!=null){
  const u=S.pu[move.unit],L=plusLook(u,S.cur,p.num);
  const base='Je hebt nog '+L.need+' nodig om op '+u.t+' uit te komen. ';
  if(rule==='complete')return result(L.U,'De omcirkelde getallen zijn samen al '+u.t+'. Wat gebeurt er als je een van deze open getallen ook meetelt?');
  if(rule==='remaining'||rule==='essential'||rule==='cannotExclude')return result(L.U,base+'Laat in gedachten een van deze getallen weg. Kun je de som met de andere getallen dan nog maken?');
  return result(L.U,base+'Tel in gedachten een van deze getallen mee. Kun je met de andere open getallen dan nog precies op de som uitkomen?');
 }
 if(S.type==='hex'&&q.clues){
  const cells=q.clues.flatMap(o=>[...(o.c.pos||[]),...(o.kind==='zone'||o.kind==='ring'?[o.id]:[])]).filter(i=>i>=0);
  const grouped=q.clues.some(o=>o.c.type);
  return result(cells,grouped?'Probeer hoe de blauwe vakjes hier kunnen liggen. Bij haakjes moeten ze één groepje vormen; bij streepjes moeten het juist losse groepjes zijn.':'Probeer in gedachten een van deze dichte vakjes blauw te maken.','Kunnen alle gemarkeerde getallen dan nog kloppen? En wat gebeurt er als je datzelfde vakje juist zwart maakt?');
 }
 if(S.type==='mur')return result(scope,...(guide.reasonSteps||[]).filter(s=>s.includes('“')).slice(0,2),'Welke plekken passen nog bij deze aanwijzingen? Probeer in gedachten een plek en kijk of de andere personen dan ook nog ergens kunnen staan.');
 return result(scope,'Probeer hier in gedachten een mogelijkheid. Past die bij alle gemarkeerde aanwijzingen, of loop je ergens vast?');
}
