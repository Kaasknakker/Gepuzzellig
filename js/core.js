/* Snelle Apple Pencil-tikken: gewone UI reageert direct op pen-pointerevents.
   Puzzelvelden en teken/rekenvlakken zijn uitgesloten en houden hun eigen bediening. */
function fastPenUI(){
 const excluded="#grid,#mgrid,#hexsvg,#mur,#m24,#mpal,#papier,canvas,.calc";
 const targetAt=(x,y)=>{const el=document.elementFromPoint(x,y),b=el&&el.closest&&el.closest("button,a[href],summary,[role=button]");if(!b||b.matches(":disabled")||b.closest(excluded))return null;return b};
 const active=new Set();let firing=false,last=null,lastAt=-1e9;
 const fire=b=>{if(!b)return false;const now=performance.now();if(b===last&&now-lastAt<35)return true;firing=true;try{b.click()}finally{firing=false}last=b;lastAt=now;return true};
 document.addEventListener("pointerdown",e=>{if(e.pointerType!=="pen"||e.button>0)return;const b=targetAt(e.clientX,e.clientY);if(!b)return;e.preventDefault();active.add(e.pointerId);fire(b)},true);
 document.addEventListener("pointerup",e=>{if(e.pointerType!=="pen")return;const had=active.delete(e.pointerId);if(had)return;const b=targetAt(e.clientX,e.clientY);if(!b)return;e.preventDefault();fire(b)},true);
 document.addEventListener("pointercancel",e=>active.delete(e.pointerId),true);
 document.addEventListener("touchstart",e=>{const t=[...e.changedTouches].find(t=>t.touchType==="stylus");if(!t)return;const b=targetAt(t.clientX,t.clientY);if(!b)return;e.preventDefault();fire(b)},{passive:false,capture:true});
 document.addEventListener("click",e=>{if(firing||!last||performance.now()-lastAt>520)return;const b=e.target.closest&&e.target.closest("button,a[href],summary,[role=button]");if(b===last){e.preventDefault();e.stopImmediatePropagation()}},true);
}
fastPenUI();
const ALLTYPES={bin:"Binair",star:"Star Battle",nono:"Nonogram",kak:"Kakuro",hex:"Hexcells",plus:"Pluszle",mur:"Murdoku",m24:"Maak 24"};
/* Welke puzzels in de app staan. Kakuro en Maak 24 zitten nog in de code en kunnen later weer worden aangezet. */
const ACTIVE=["bin","star","nono","hex","plus","mur"];
const TYPES=Object.fromEntries(ACTIVE.map(t=>[t,ALLTYPES[t]]));
const HELP={
 bin:"Vul de vakjes met ✕ en ○. Nooit drie dezelfde naast elkaar, in elke rij en kolom evenveel ✕ als ○, en geen twee rijen of twee kolommen gelijk. Tik of linksklik voor ✕; dubbeltik, dubbelklik of rechtermuisklik voor ○. Nog een tik op een ✕ maakt het vakje weer leeg. Sleep over een paar rijen (omlaag) of kolommen (opzij) om te zien of ze al gelijk zijn: lijnen waarvan de ingevulde ✕ en ○ overal gelijk zijn (lege vakjes tellen niet mee, minstens de helft van de lijn bij beide ingevuld) worden groen samen met de lijn waar je op dat moment overheen sleept. Laat je los terwijl ze groen zijn, dan blijven ze staan.",
 star:"Zet in elke rij, elke kolom en elk gekleurd gebied precies __K__ __S__. Sterren raken elkaar nooit, ook niet diagonaal. Tik of linksklik voor ✕ (geen ster); dubbeltik, dubbelklik of rechtermuisklik voor ★. Nog een tik op een ✕ maakt het vakje weer leeg.",
 nono:"De getallen geven de lengtes van de blokken gevulde vakjes in die rij of kolom, in volgorde. Kies links ■ Vullen of ✕ Kruisje, of tik naast het veld (met je vinger of de Pencil) om te wisselen. Tik op een vakje om het te vullen of een kruisje te zetten, nog eens tikken maakt het weer leeg. Slepen werkt in dezelfde stand. Klopt een rij of kolom precies met de getallen, dan wordt het getal lichter. Met Automatisch kruisjes aan worden de lege vakjes daarin vanzelf kruisjes. Tik op een getal om alle lege vakjes in die rij of kolom kruisjes te maken.",
 kak:"Vul cijfers 1 t/m 9 in. De getallen in de zwarte vakjes zijn de som van het stuk rechts (bovenste getal) of eronder (onderste getal). Binnen één som komt elk cijfer maar één keer voor.",
 hex:"Elk vakje is blauw of zwart. Een zwart vakje met een getal vertelt hoeveel van zijn 6 buren blauw zijn. {3} betekent dat die blauwe buren aan elkaar liggen, -3- dat ze niet allemaal aan elkaar liggen. Een zwart vakje met ? zegt niets. Een blauw vakje met een getal vertelt hoeveel vakjes in het gebied eromheen (tot twee vakjes ver, het vakje zelf telt niet mee) blauw zijn. Sommige blauwe vakjes laten pas een getal zien als je ze gevonden hebt. Tik met Blauw op zo'n getal om de zone te tonen: een lichte zeshoek met een witte rand. Waar zones overlappen wordt het nog lichter. Zwart maakt het getal lichter als je er klaar mee bent. Getallen buiten het veld gelden voor de hele lijn in de richting van de pijl. Kies Blauw en tik op zo'n getal om een lichte lijn door die vakjes te zetten; tik nog een keer om hem weg te halen. Kies Zwart en tik op het getal als je klaar bent met die lijn: de lijn verdwijnt en het getal wordt lichter. Kies Blauw of Zwart en tik op een oranje vakje. Tik naast het veld (met je vinger of de Pencil) om te wisselen tussen Blauw en Zwart.",
 mur:"Er is een moord gepleegd. Zet iedereen op zijn plek, ook het slachtoffer (💀). In elke rij en elke kolom staat precies één persoon. Kies iemand onderaan en tik op een vakje. Weet je zeker dat er ergens niemand kan staan? Kies ✕ Kruisje en tik op dat vakje (nog eens tikken haalt het weg). Naast het bord tikken wisselt ook tussen kruisjes en personen. Foutje? Tik op iemand op het bord: dan is het vakje weer leeg en is die persoon meteen gekozen, zodat je hem ergens anders kunt neerzetten. Met Automatisch kruisjes aan komen in de rij en kolom van iemand die staat vanzelf kruisjes. Op stoelen, bedden en banken kun je zitten; op de andere voorwerpen kan niemand staan. Naast betekent recht ernaast in dezelfde ruimte, dus niet schuin en niet door een muur. Alleen betekent: niemand anders in dezelfde ruimte. Tik op een kaartje om het door te strepen. De moordenaar was alleen met het slachtoffer: als iedereen goed staat, wijs je hem aan.",
 plus:"Elk getal blijft staan of moet weg. De getallen die blijven staan tellen per rij op tot de som rechts, en per kolom tot de som onder. Op Moeilijk zijn er ook gekleurde vlakken: daarin tellen ze op tot het kleine getal in de hoek van het vlak. Kies ✕ Wegstrepen of ○ Omcirkelen (dat getal blijft zeker staan), of tik naast het veld (met je vinger of de Pencil) om te wisselen. Tik op een getal, nog eens tikken maakt het weer open. Open betekent: nog niet weggestreept en niet omcirkeld. Slepen werkt in dezelfde stand. Tik op een som om er een schuine streep door te zetten als je klaar bent met die rij of kolom; nog eens tikken haalt hem weg. De app rekent niet mee en vult niets vanzelf in. Je bent klaar als alle sommen kloppen.",
 m24:"Maak met alle vier de getallen precies 24. Tik een getal, een bewerking en een tweede getal. Er zijn 5 rondes en je totaaltijd telt."};
const TIPS={
 bin:["Twee dezelfde naast elkaar? Dan komt aan beide kanten het andere teken.","Twee dezelfde met één leeg vakje ertussen? In dat gat komt het andere teken.","Staat de helft van een rij al vol met ✕ (of ○)? Dan worden alle lege vakjes het andere teken.","Mag er in een rij nog maar één ✕ bij? Kijk waar die niet kan, omdat de rest dan drie ○ naast elkaar zou krijgen.","Lijkt een rij met nog 2 lege vakjes op een volle rij? Vul dan andersom in, want twee rijen mogen nooit gelijk zijn."],
 star:["Staat het aantal sterren in een rij, kolom of gebied al vast? Dan wordt de rest kruisjes. Rond elke ster komen ook kruisjes.","Ligt een gebied helemaal in één rij of kolom? Dan horen de sterren van die rij bij dat gebied: de rest van de rij wordt kruisjes.","Tel over meerdere rijen of kolommen: liggen er twee (of drie) gebieden helemaal binnen twee (of drie) rijen, dan vullen ze die rijen. De rest van die rijen wordt kruisjes.","En andersom: kunnen in drie kolommen alleen nog sterren komen van drie gebieden? Dan zitten alle sterren van die gebieden in die kolommen, en worden hun vakjes daarbuiten kruisjes.","Vraag je per vakje af: als hier een ster stond, heeft elke rij, kolom en elk gebied dan nog plek genoeg? Zo niet, dan is het een kruisje."],
 nono:["Begin met de grote getallen: een blok van 7 in een rij van 10 bedekt altijd de middelste 4 vakjes.","Zet kruisjes waar geen blok meer kan komen, bijvoorbeeld naast een blok dat al compleet is.","Elke stap volgt uit één rij of kolom tegelijk. Kom je vast te zitten, kijk dan naar een kolom die je net veranderd hebt."],
 kak:["Sommige sommen kunnen maar op één manier: 3 in 2 vakjes is 1+2, 4 in 2 is 1+3, 16 in 2 is 7+9, 17 in 2 is 8+9, 6 in 3 is 1+2+3 en 24 in 3 is 7+8+9.","Een cijfer mag niet twee keer in dezelfde som.","Waar een rij-som en een kolom-som elkaar kruisen, moet het cijfer in allebei passen. Daar vind je vaak het eerste cijfer."],
 hex:["Begin bij getallen die meteen alles zeggen: een 0 betekent dat alle buren zwart zijn, en als een getal gelijk is aan het aantal onbekende buren, zijn ze allemaal blauw.","Let op {3} en -3-: aan elkaar liggen of juist niet maakt vaak het verschil.","Combineer aanwijzingen die vakjes delen: twee getallen, twee lijnen, een zone en een lijn. Moet het ene getal zijn blauwe vakjes al in de gedeelde vakjes hebben, dan is de rest van het andere zwart.","Op Moeilijk kom je regelmatig vast te zitten tot je twee of drie aanwijzingen tegelijk bekijkt. Tik op lijnen en zones om ze te markeren, dat helpt bij het combineren.","Elke aanwijzing is ergens nodig: de blauwe getallen, de lijnen en de vakjes die je aan het begin krijgt. Heb je er één nog niet gebruikt, kijk daar dan eens."],
 mur:["Begin bij de kaartjes met een ruimte of een voorwerp: zitplaatsen zijn er vaak maar een paar.","Het slachtoffer heeft geen kaartje. Het ligt in een ruimte met precies één ander: de moordenaar.","Kan een rij of kolom nog maar door één persoon gebruikt worden? Dan staat die daar."],
 plus:["Begin met getallen die te groot zijn: moet een rij nog maar 6 maken, dan kan een 8 daarin nooit blijven staan.","Andersom: zijn alle andere getallen samen te weinig zonder een bepaald getal, dan moet dat getal blijven. Omcirkel het.","Omcirkelen helpt: zo weet je in de kruisende rij of kolom ook al een stukje van de som.","Lukt dat niet, bekijk dan alle manieren om de som te maken. Zit een getal in geen enkele manier, dan moet het weg. Zit het in elke manier, dan blijft het.","Op Moeilijk heb je de gekleurde vlakken echt nodig. Zit je vast in de rijen en kolommen, kijk dan naar een vlak."],
 m24:["Zoek eerst naar 3×8, 4×6, 2×12 of 25−1.","Breuken mogen tussendoor: 8 ÷ 3 kan handig zijn als je daarna weer vermenigvuldigt."]};
const tipsOf=t=>t==="nono"&&S&&S.nv==="color"?["Begin met lange gekleurde blokken: overlap werkt net als bij een gewone Nonogram.","Let extra op de kleurgrens: rood naast blauw mag direct, rood naast rood niet.","Als een gekleurd blok volledig vastligt, kun je vaak meteen bepalen welke vakjes ernaast leeg moeten blijven.","Kom je vast te zitten, kijk naar een rij of kolom waarin al één of meer kleuren staan. Die beperken de mogelijke plaatsen sterk."]:(TIPS[t]||[]).map(x=>x.startsWith("__2X2__")?x.slice(7):x).concat(t==="star"&&(STLV[lvOf("star")]||[0,2])[1]>1?["Vakjes die elkaar allemaal raken (bijvoorbeeld een blokje van 2×2) kunnen samen maar één ster hebben."]:[]);
const NOTEH={bin:" Met ✏️ Potlood werkt het hetzelfde als normaal (tik ✕, dubbeltik ○), maar kleiner en lichter. Slepen blijft de rij/kolomvergelijking. Aantekeningen tellen niet mee.",star:" Met ✏️ Potlood werkt het bord hetzelfde als normaal (tik ✕, dubbeltik ★), maar kleiner en lichter. Sleep om snel kleine kruisjes te zetten of weg te halen; met Automatisch kruisjes aan verschijnen rond een potloodster lichte kruisjes. Aantekeningen tellen niet mee.",mur:" Met ✏️ Potlood maak je kandidaat-aantekeningen: kies iemand onderaan en tik op een vakje, dan komt daar de kleine letter van die persoon. Je kunt meerdere kandidaten in één vakje bewaren. Aantekeningen tellen niet mee."};
const helpOf=t=>{let s=t==="nono"&&S&&S.nv==="color"?"De gekleurde getallen geven de blokken in die rij of kolom, in volgorde. Blokken van dezelfde kleur moeten minstens één leeg vakje tussen zich hebben; blokken van verschillende kleuren mogen direct tegen elkaar liggen. Kies onderaan een kleur of ✕ Kruisje. Tik of sleep om die stand toe te passen; nogmaals met dezelfde stand maakt het vakje weer leeg. Tik op een aanwijzing om de overige open vakjes in die rij of kolom als leeg te markeren.":HELP[t]+(NOTEH[t]?NOTEH[t]+" Snel: houd een vakje even ingedrukt om meteen een aantekening te zetten, zonder te wisselen.":"");if(t==="star"){const k=(STLV[lvOf("star")]||[0,2])[1];s=s.replace("__K__",k).replace("__S__",k>1?"sterren":"ster")}return s};
const isDark=()=>{const t=document.documentElement.dataset.theme;return t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches};
const dstr=()=>new Date().toLocaleDateString("sv");
const fmt=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
const fmtDuration=s=>{s=Math.max(0,Math.round(+s||0));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return h?`${h} u ${m} min`:`${m} min`};
const GEN={bin:genBin,star:genStar,nono:genNono,kak:genKak,hex:genHex,plus:genPlus,mur:genMur,m24:gen24};
let S={},store={},cache={},loadId=0,lastRows=[],CS=40,SG={};
try{const _r=JSON.parse(localStorage.getItem("pdrows")||"[]");if(Array.isArray(_r))lastRows=_r}catch(e){}
try{store=JSON.parse(localStorage.getItem("pd2")||"{}")}catch(e){}
try{SG=JSON.parse(localStorage.getItem("pdscoregroups")||"{}")}catch(e){SG={}}
const save=()=>{try{localStorage.setItem("pd2",JSON.stringify(store))}catch(e){}};
const saveSG=()=>{try{localStorage.setItem("pdscoregroups",JSON.stringify(SG))}catch(e){}};
const legacyGroup=()=>window.PD_SETUP&&window.PD_SETUP.group||"";
const scoreGroup=k=>SG[k]||legacyGroup();
const localDoneInGroup=(k,g)=>!!store[k]&&scoreGroup(k).toLowerCase()===String(g||"").toLowerCase();
let uid="x";
const lsGet=k=>{try{return localStorage.getItem(k)||""}catch(e){return""}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const autoCrossPrefs=Object.fromEntries(["star","nono","mur"].map(t=>[t,lsGet("pdautocross:"+t)!=="off"]));
const autoCrossOn=(t=S.type)=>autoCrossPrefs[t]!==false;
function updateAutoCross(){const b=$("#autocross");if(!b)return;b.hidden=!["star","nono","mur"].includes(S.type);b.setAttribute("aria-checked",String(autoCrossOn()));b.querySelector(".autocrossstate").textContent=autoCrossOn()?"Aan":"Uit"}
/* De voorkeur verandert geen opgeslagen zetten of ongedaan-geschiedenis. Nonogram past hem toe bij volgende zetten. */
function toggleAutoCross(){autoCrossPrefs[S.type]=!autoCrossOn();lsSet("pdautocross:"+S.type,autoCrossOn()?"on":"off");clearHint();render()}
let nonoVariant=lsGet("pdnvar")==="color"?"color":"classic";
/* iPhone (of andere kleine telefoon): eigen indeling en eigen puzzelformaten (niveau 4-6, hoger dan breed).
   Testen op de computer kan met ?tel=1 achter de link, uitzetten met ?tel=0. */
/* De nieuwe indeling (Vandaag-scherm) is nu standaard. Met ?oud=1 krijg je nog de oude indeling. */
const NIEUW=new URLSearchParams(location.search).get("oud")!=="1";
const PHONE=(()=>{const q=new URLSearchParams(location.search).get("tel");if(q==="1")return true;if(q==="0")return false;
 return /iPhone|iPod/.test(navigator.userAgent)||(Math.min(screen.width,screen.height)<500&&matchMedia("(pointer:coarse)").matches)})();
const LVN=PHONE?{bin:[4,5,6],star:[4,5,6],nono:[4,5,6],hex:[4,5,6],plus:[4,5,6],mur:[4,5,6]}:{bin:[1,2,3],star:[1,2,3],nono:[1,2,3],hex:[1,2,3],plus:[1,2,3],mur:[1,2,3]},LVL={1:"Makkelijk",2:"Normaal",3:"Moeilijk",4:"Makkelijk",5:"Normaal",6:"Moeilijk"};
const lvLabel=l=>LVL[l]+(l>3?" · telefoon":"");
const LVS={bin:{1:"10×8",2:"16×12",3:"18×14",4:"6×8",5:"8×10",6:"10×14"},star:{1:"8×8 · 1★",2:"9×9 · 2★",3:"10×10 · 2★",4:"7×7 · 1★",5:"8×8 · 2★",6:"9×9 · 2★"},nono:{1:"8×5",2:"15×10",3:"20×14",4:"5×8",5:"8×12",6:"10×15"},hex:{1:"klein",2:"middel",3:"pittig",4:"klein",5:"middel",6:"pittig"},plus:{1:"5×5",2:"6×6",3:"7×7 · vlakken",4:"5×5",5:"6×6",6:"6×7 · vlakken"},mur:{1:"6×6",2:"7×7",3:"8×8",4:"5×5",5:"6×6",6:"7×7"}};
let LV={};try{LV=JSON.parse(lsGet("pdlvl")||"{}")}catch(e){}
/* Voorkeursniveau voor vrije puzzels; dagpuzzels kiezen hun niveau op basis van dag en apparaat. */

const lvOf=t=>LVN[t]&&LVN[t].includes(LV[t])?LV[t]:(PHONE&&LVN[t]&&LVN[t].includes(5)?5:2),sfx=l=>l===2?"":"."+l;
/* Vanaf 22 oktober 2026: per soort één dagpuzzel, doordeweeks Normaal en in het weekend Moeilijk. Andere niveaus blijven bij Vrij puzzelen. */
const DAGVANAF="2026-10-21",dagVast=ds=>ds>=DAGVANAF;
const dagLv=(t,ds)=>{if(!dagVast(ds))return lvOf(t);const[y,m,d]=ds.split("-").map(Number),w=new Date(y,m-1,d).getDay(),wk=w===0||w===6;return PHONE?(wk?6:5):(wk?3:2)};
/* Nonogram-dagvariant: vanaf 23 oktober 2026 datum-gebaseerd willekeurig.
   Dezelfde datum geeft voor iedereen en op ieder apparaat dezelfde variant; nooit meer dan twee keer dezelfde achter elkaar.
   Oudere dagen behouden hun bestaande Klassiek/Kleur-keuze, zodat reeds gemaakte archiefpuzzels niet veranderen. */
const NONORANDOMVANAF="2026-10-23";
const nonoLegacyVariant=ds=>{const[y,m,d]=ds.split("-").map(Number),dt=new Date(y,m-1,d),w=dt.getDay();if(w>=1&&w<=5)return(w===2||w===4)?"color":"classic";const wn=Math.floor((Date.UTC(y,m-1,d)-Date.UTC(2026,0,5))/6048e5),even=((wn%2)+2)%2===0;return(w===6?even:!even)?"color":"classic"};
const nonoDayVariant=ds=>{if(ds<NONORANDOMVANAF)return nonoLegacyVariant(ds);const[y,m,d]=ds.split("-").map(Number),end=Date.UTC(y,m-1,d),start=Date.UTC(2026,9,23);let a=nonoLegacyVariant("2026-10-21"),b=nonoLegacyVariant("2026-10-22");
 for(let ms=start;ms<=end;ms+=864e5){const dt=new Date(ms),key=dt.toISOString().slice(0,10);let v=(hash("nono-day|"+key)&1)?"color":"classic";if(v===a&&v===b)v=v==="color"?"classic":"color";a=b;b=v}
 return b};

let TSHOW=lsGet("pdtime")==="1",lastT="0:00";
function setT(t){lastT=t;const e=$("#time");e.textContent=TSHOW?t:"⏱ tijd tonen";e.classList.toggle("hid",!TSHOW)}
const MAX_REASONABLE_SECS=6*3600,MAX_REASONABLE_MS=MAX_REASONABLE_SECS*1000;
const playMs=()=>!S||!S.start?0:Math.max(0,(S.pauseAt||Date.now())-S.start);
const playScreenActive=()=>!!(S&&S.start&&!S.done&&!document.hidden&&!document.body.classList.contains("home")&&!document.body.classList.contains("newpick"));
function pausePlay(){if(S&&S.start&&!S.done&&!S.pauseAt)S.pauseAt=Date.now()}
function resumePlay(){if(!playScreenActive()||!S.pauseAt)return;S.start+=Date.now()-S.pauseAt;S.pauseAt=0;setT(fmt(Math.round(playMs()/1000)))}
$("#time").onclick=()=>{TSHOW=!TSHOW;lsSet("pdtime",TSHOW?"1":"0");setT(lastT)};
const isFree=r=>/^v~/.test(r.type);
function freeLoc(){try{return JSON.parse(lsGet("pdfree")||"[]")}catch(e){return[]}}
/* Gemaakte puzzels bewaren (de laatste 16), zodat terugkomen op een puzzel meteen gaat. GV ophogen als een generator verandert. */
const GV="g17";
/* Kleurnonogram: gemengde kleuren voor nieuwe vrije puzzels (seed "q…") en voor dagpuzzels vanaf 24 oktober 2026. Oudere puzzels blijven precies hetzelfde. */
const nonoMixOn=seed=>{seed=String(seed);if(seed[0]==="q")return true;const m=seed.match(/^nono(\d{4}-\d{2}-\d{2})/);return!!m&&m[1]>="2026-10-24"};
function genCached(type,seed,lv,hard,nv){const cmix=type==="nono"&&nv==="color"&&nonoMixOn(seed),vk=(type==="nono"&&nv==="color"?"|color"+(cmix?"|m2":""):"")+(type==="mur"?"|cast"+hash(murCastSig()).toString(36):"");const k=GV+(type==="mur"?MGV:type==="plus"?PGV:"")+"|"+type+"|"+seed+"|"+lv+(hard?"|w":"")+vk;let all={};try{all=JSON.parse(lsGet("pdgen")||"{}")}catch(e){all={}}
 if(all[k])try{return JSON.parse(all[k])}catch(e){}
 const p=type==="nono"&&nv==="color"?genColorNono(rng(hash(seed+"|color")),lv,!!hard,cmix):GEN[type](rng(hash(seed)),lv,!!hard);try{all[k]=JSON.stringify(p);const ks=Object.keys(all);for(const x of ks.slice(0,Math.max(0,ks.length-16)))delete all[x];lsSet("pdgen",JSON.stringify(all))}catch(e){}
 return p}
/* Weekend (zaterdag en zondag): de dagpuzzel is wat pittiger. Het archief: dagpuzzels van de afgelopen week alsnog doen. */
const isWk=ds=>{const[y,m,d]=ds.split("-").map(Number),w=new Date(y,m-1,d).getDay();return w===0||w===6};
/* Willekeurig puzzelen: na elke vrije puzzel komt een andere, willekeurige soort. Stopt zodra je zelf een dagpuzzel kiest. */
let RANDOM=false;const rndType=not=>{const L=Object.keys(TYPES).filter(t=>t!==not);return L[Math.floor(Math.random()*L.length)]};
const rndLevel=t=>{const L=LVN[t]||[2];return L[Math.floor(Math.random()*L.length)]};
const randomPick=not=>{const t=rndType(not),l=rndLevel(t),nv=t==="nono"?(Math.random()<.5?"classic":"color"):"classic";return{t,l,nv}};
function startRandomPick(p){if(!p||!TYPES[p.t])return;RANDOM=true;const had=Object.prototype.hasOwnProperty.call(LV,p.t),oldL=LV[p.t],oldNv=nonoVariant;if(LVN[p.t])LV[p.t]=p.l;if(p.t==="nono")nonoVariant=p.nv;const m=$("#npm");if(m)m.hidden=true;document.body.classList.remove("home","newpick");load(p.t,true,true);if(LVN[p.t]){if(had)LV[p.t]=oldL;else delete LV[p.t];lsSet("pdlvl",JSON.stringify(LV))}if(p.t==="nono"){nonoVariant=oldNv;lsSet("pdnvar",oldNv)}}
function startRandomFree(not){startRandomPick(randomPick(not||""))}
function load(type,practice,fresh,date){clearHomeSkinAccent();document.documentElement.classList.remove("pagefit");document.body.classList.remove("pagefit");try{pauseAndPersistActive(true)}catch(e){console.warn("Vorige puzzel opslaan mislukt; nieuwe puzzel wordt toch geopend",e)}if(!practice)RANDOM=false;if(NIEUW&&HOMEREADY){if(document.body.classList.contains("home")||document.body.classList.contains("newpick"))window.scrollTo(0,0);document.body.classList.remove("home","newpick");const np=$("#npm");if(np)np.hidden=true}
 const dd=!practice&&date?date:dstr(),id=++loadId,lvl0=practice?lvOf(type):dagLv(type,dd),sf0=sfx(lvl0);lsSet("pdtab",type);{const fn=$("#fin");if(fn)fn.hidden=true}potlood=false;S={nt:{},type,practice,date:dd,hard:!practice&&isWk(dd)&&!dagVast(dd),arch:dd!==dstr(),start:0,done:false,secs:0,sel:-1,id,hist:[],redo:[],pen:0,mist:0,hints:0,flash:-1,hl:-1,lvl:lvl0,sf:sf0,nv:type==="nono"?(practice?nonoVariant:nonoDayVariant(dd)):"classic"};hideHint();ub();$("#next").classList.remove("pulse");
 const pk0=progKey(type,practice,S.date,sf0),sv0=fresh?null:progAll()[pk0];if(fresh)progDel(pk0);
 document.body.dataset.t=type;pageIn($("#stage"));document.querySelectorAll("#tabs button").forEach(b=>{b.classList.toggle("on",b.dataset.t===type);if(PHONE&&b.dataset.t===type)try{b.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"})}catch(e){}});updateArchiveVisibility();{const nb=$("#next");if(nb.closest("#more"))nb.innerHTML='<span class="ic">🎲</span><span>Nieuwe puzzel</span>';else nb.textContent=PHONE?"🎲 Nieuwe puzzel":"Nieuwe puzzel ➜"}if(PHONE)$("#next").style.display="";$("#next").title="Nieuwe puzzel";
 $("#help").textContent=helpOf(type);$("#grid").innerHTML="";$("#m24").innerHTML="";$("#mur").innerHTML="";$("#hexsvg").innerHTML="";$("#pad").style.display="none";$("#m24").style.display="none";
 $("#msg").textContent="Puzzel maken...";setT("0:00");$("#grid").classList.remove("nfin");
 setTimeout(()=>{if(id!==loadId)return;
  const seed=practice?(sv0&&sv0.seed?sv0.seed:"q"+Math.random()):type+S.date+sf0,ck=type+seed+(type==="nono"?"|"+S.nv:"");S.seed=seed;
  const p=cache[ck+(S.hard?"|w":"")]||(cache[ck+(S.hard?"|w":"")]=genCached(type,seed,lvl0,S.hard,S.nv));S.p=p;if(type==="star")STK=p.K||2;
  const N=p.N||0;
  if(type==="bin")S.cur=p.giv.slice();else if(type==="kak")S.cur=Array(p.W*p.H).fill(0);else if(type==="m24"){S.r=0;setRound()}else if(type==="hex"){S.hx={rev:new Set([...p.rev0,...(p.zs||[])])};S.cs={}}else if(type==="mur"){S.cur=Array(N*N).fill(-1);S.ms=0;S.mxm=false;S.str=new Set()}else if(type==="plus"){S.cur=Array(p.W*p.H).fill(0);S.str=new Set()}else S.cur=Array(type==="nono"||type==="plus"?p.W*p.H:N*N).fill(0);
  const key=S.date+type+sf0;
  if(!practice&&localDoneInGroup(key,$("#group").value)){S.done=true;S.secs=store[key];
   if(type==="bin")S.cur=p.sol.slice();else if(type==="star")S.cur=p.sol.map(v=>v?2:0);else if(type==="nono")S.cur=p.sol.slice();else if(type==="kak")S.cur=p.sol.slice();else if(type==="hex")p.sol.forEach((v,i)=>S.hx.rev.add(i));else if(type==="plus")S.cur=p.sol.map(v=>v?1:2);else if(type==="mur")S.cur=solCur(p)}
  if(!S.done&&sv0&&sv0.seed===seed&&((type!=="hex"&&type!=="plus"&&type!=="nono")||sv0.gv===GV)&&(type!=="mur"||sv0.mv===MGV)&&(type!=="plus"||sv0.pv===PGV)){try{
   if(sv0.cur&&S.cur&&sv0.cur.length===S.cur.length)S.cur=sv0.cur.slice();
   if(sv0.rev&&S.hx)S.hx.rev=new Set(sv0.rev);if(sv0.cs&&S.hx)S.cs=sv0.cs;
   if(type==="m24"&&sv0.r){S.r=sv0.r;setRound()}
   if(sv0.str&&S.str)S.str=new Set(sv0.str);if(sv0.nt)S.nt=Object.assign({},sv0.nt);if(type!=="m24"){S.hist=Array.isArray(sv0.hist)?sv0.hist.slice(-60):[];S.redo=Array.isArray(sv0.redo)?sv0.redo.slice(-30):[]}S.pen=0;S.mist=sv0.mist||0;S.hints=sv0.hints||0;restoreHintUsage(sv0);S._saveAt=sv0.at||0;{const oldEl=+sv0.el||0,safeEl=oldEl>=0&&oldEl<=MAX_REASONABLE_MS?oldEl:0;S.start=Date.now()-safeEl}S.pauseAt=0;S.resumed=true}catch(e){}}
  $("#msg").textContent=S.done?(S.arch?"Al klaar in ":"Vandaag al klaar in ")+fmt(S.secs):S.resumed?"Verder waar je was gebleven":(!practice&&type===featOf(S.date))?(PHONE?"⭐ Van de dag":"⭐ Puzzel van de dag"+(S.hard?" (weekend 💪)":"")):S.arch?"Dagpuzzel van "+dnl(S.date)+(S.hard?" 💪":""):S.hard?"Weekendpuzzel: wat pittiger 💪":"";setT(S.resumed?fmt(Math.round(playMs()/1000)):fmt(S.secs));
  try{updTabs()}catch(e){}render();ub();setTimeout(()=>pingOnline(true),0)},30)}

const LANDQ=matchMedia("(orientation:landscape) and (min-aspect-ratio:23/20)");
const availBot=()=>{const b=$("#pbot");if(b&&!PHONE&&document.body.classList.contains("tablet")&&LANDQ.matches)return innerHeight+(window.scrollY||0)-14-HINTPAD;return b?b.getBoundingClientRect().top+(window.scrollY||0)-(PHONE?8:18)-HINTPAD:innerHeight-14};
function sizeCs(cols,rows,extraH){const key=cols+"|"+rows+"|"+(extraH||0);if(S&&S._csFit&&S._csFit.key===key){CS=S._csFit.v;document.documentElement.style.setProperty("--cs",CS+"px");return}const top=$("#grid").getBoundingClientRect().top+(window.scrollY||0);CS=Math.max(24,Math.min(96,Math.floor((availBot()-top-(extraH||0))/rows),Math.floor(($("#stage").clientWidth-6)/cols)));if(S)S._csFit={key,v:CS};document.documentElement.style.setProperty("--cs",CS+"px")}
function popEl(d){d.classList.remove("pop");void d.offsetWidth;d.classList.add("pop")}
function celebrate(){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const cv=document.createElement("canvas");cv.className="cf";cv.width=innerWidth;cv.height=innerHeight;document.body.append(cv);const x=cv.getContext("2d"),cols=["#7a52d6","#f2a000","#12b5a2","#ee5d7a","#2b9be6","#3cb958"],ps=[];
 for(let i=0;i<140;i++){const a=-Math.PI/2+(Math.random()-.5)*1.6,v=9+Math.random()*11;ps.push({x:innerWidth/2,y:innerHeight*.45,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:4+Math.random()*5,c:cols[i%6],rot:Math.random()*6,vr:(Math.random()-.5)*.4})}
 const t0=performance.now();(function f(t){const k=t-t0;x.clearRect(0,0,cv.width,cv.height);ps.forEach(p=>{p.vy+=.32;p.vx*=.992;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.globalAlpha=Math.max(0,1-k/2600);x.fillStyle=p.c;x.fillRect(-p.r,-p.r/2,p.r*2,p.r);x.restore()});
  if(k<2600)requestAnimationFrame(f);else cv.remove()})(t0)}
/* Bij puzzels met twee standen moet een tik naast het veld meteen tellen, ook met de Pencil. Dan zeggen we tegen de browser
   dat aanrakingen op de pagina geen scrollen of zoomen zijn (net als in het Hexcells-veld). Alleen als de pagina niet hoeft te scrollen. */
function tapMode(){const de=document.documentElement,on=["nono","plus","hex","mur"].includes(S.type);de.classList.remove("tap");if(document.body.classList.contains("home"))return;if(on&&(PHONE||(de.scrollHeight<=innerHeight+60&&de.scrollWidth<=innerWidth+20)))de.classList.add("tap")}
addEventListener("resize",()=>{setTimeout(tapMode,60);setTimeout(fitHomePage,80)});
function render(){render0();paintNotes();updateAutoCross();if(NIEUW)updTop()}
function render0(){const t=S.type;ub();setTimeout(tapMode,0);if(!S.p)return;
 const pk=S.id+t,prev=S.pk===pk?[...document.querySelectorAll("#grid .c")].map(d=>d.classList.contains("gx")?"":d.textContent):null;S.pk=pk;
 $("#hexw").style.display=t==="hex"?"flex":"none";
 $("#mur").style.display=t==="mur"?"flex":"none";
 if(t==="mur"){$("#grid").style.display="none";$("#m24").style.display="none";$("#pad").style.display="none";$("#hexw").style.display="none";rMur();return}
 if(t==="hex"){$("#grid").style.display="none";$("#m24").style.display="none";$("#pad").style.display="none";rHex();return}
 if(t==="m24"){$("#grid").style.display="none";$("#pad").style.display="none";$("#m24").style.display="block";rM24();return}
 $("#grid").style.display="grid";$("#m24").style.display="none";$("#grid").innerHTML="";
 if(t==="kak")rKak();else if(t==="plus")rPlus();else rGrid();
 if(prev){const now=[...document.querySelectorAll("#grid .c")];if(now.length===prev.length)now.forEach((d,i)=>{if(!d.classList.contains("gx")&&d.textContent!==prev[i]&&!d.classList.contains("kb"))popEl(d)})}}

function rGrid(){const{type,p}=S,N=type==="bin"||type==="nono"?p.W:p.N,M=type==="bin"||type==="nono"?p.H:N,g=$("#grid"),nono=type==="nono";S.cells=[];S.rowc=[];S.colc=[];if(type==="star"&&!S.pal)S.pal=colorPerm(p);g.style.touchAction=type==="star"||type==="bin"||nono?"none":"";g.onpointerdown=type==="star"?starDown:type==="bin"?binDown:nono?nonoDown:null;g.onpointermove=type==="star"?starMove:type==="bin"?binMove:nono?nonoMove:null;
 let exW=nono?(p.color?4:3):type==="bin"?2:0,exH=exW;
 if(PHONE&&nono){if(p.color){exW=.8+Math.max(...p.rc.map(c=>Math.max(1,c.length)))*.55;exH=.8+Math.max(...p.cc.map(c=>Math.max(1,c.length)))*.52}else{exW=.45+Math.max(...p.rc.map(c=>(c.length?c:[0]).join(" ").length))*.24;exH=.45+Math.max(...p.cc.map(c=>Math.max(1,c.length)))*.42}}
 else if(type==="bin"){exW=PHONE?1.05:1.3;exH=exW}
 sizeCs(N+exW,M+exH);
 g.style.gridTemplateColumns=(nono||type==="bin"?"auto ":"")+`repeat(${N},${CS}px)`;
 if(nono){g.append(document.createElement("div"));p.cc.forEach((cl,ci)=>{const d=document.createElement("div");d.className="k";d.dataset.ln="c"+ci;if(p.color)d.innerHTML='<div class="ncv col">'+(cl.length?cl.map(q=>'<span class="ncl c'+q.c+'">'+q.n+"</span>").join(""):'<span class="mut">0</span>')+"</div>";else d.innerHTML="<div>"+(cl.length?cl:[0]).map(v=>"<span>"+v+"</span>").join("\n")+"</div>";g.append(d)})}
 const dark=isDark();
 for(let i=0;i<N*M;i++){
  if(type==="bin"&&i%N===0){const k=mkCnt();S.rowc[i/N|0]=k;g.append(k)}
  if(nono&&i%N===0){const d=document.createElement("div");d.className="k r";d.dataset.ln="r"+(i/N|0);const cl=p.rc[i/N|0];if(p.color)d.innerHTML='<div class="ncv">'+(cl.length?cl.map(q=>'<span class="ncl c'+q.c+'">'+q.n+"</span>").join(""):'<span class="mut">0</span>')+"</div>";else d.innerHTML="<div>"+(cl.length?cl:[0]).map(v=>"<span>"+v+"</span>").join("\u2002")+"</div>";g.append(d)}
  const d=document.createElement("div"),v=S.cur[i];d.className="c";
  if(type==="bin"){if(p.giv[i]>=0)d.classList.add("g");binSym(d,v)}
  else if(type==="star"){d.textContent=sym(disp(i));d.style.background=`hsl(${HUES[S.pal[p.reg[i]]]},${dark?"30%,40%":"48%,86%"})`;
   const r=i/N|0,c=i%N,t=(rr,cc)=>rr<0||cc<0||rr>=N||cc>=N||p.reg[rr*N+cc]!==p.reg[i]?"2.5px solid var(--fg)":"1px solid var(--line)";
   d.style.borderTop=t(r-1,c);d.style.borderBottom=t(r+1,c);d.style.borderLeft=t(r,c-1);d.style.borderRight=t(r,c+1);
   if(S.hint){if(S.hint.cells.includes(i))d.classList.add("ht");else if(S.hint.why.includes(i))d.classList.add("hr");if(S.hint.ghost&&S.hint.ghost.includes(i)&&!disp(i)){d.classList.add("gx");d.textContent="✕"}}}
  else{if(nono&&p.color){if(v>0)d.classList.add("nc"+v);d.textContent=v===-1?"✕":""}else{if(v===1)d.classList.add("f");d.textContent=v===2?"✕":""}d.style.color="var(--mut)";if(nono&&S.hint){if(S.hint.cells.includes(i))d.classList.add("ht");else if(S.hint.why.includes(i))d.classList.add("hr")}}
  if(type==="star"||type==="bin"||nono){d.dataset.i=i;S.cells[i]=d}else d.onclick=()=>tap(i);g.append(d)}
 if(nono){for(let k=0;k<Math.max(N,M);k++)nonoClue(Math.min(k,M-1)*N+Math.min(k,N-1))}
 if(type==="star")paintAll();
 if(type==="bin"){const cr=document.createElement("div");cr.className="corner";cr.innerHTML=`<b>${p.W/2}</b><i>${p.H/2}</i>`;g.append(cr);for(let c=0;c<N;c++){const k=mkCnt();S.colc[c]=k;g.append(k)}paintBin()}}

/* ---- Binair: slepen over rijen/kolommen = controleren op gelijke lijnen (vult niets in) ---- */
const SX='<svg viewBox="0 0 24 24"><path d="M5.5 5.5L18.5 18.5M18.5 5.5L5.5 18.5" stroke="var(--fg)" stroke-width="1.7" stroke-linecap="round" fill="none"/></svg>',SO='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.3" stroke="var(--one)" stroke-width="2" fill="none"/></svg>';
function binSym(d,v){const nv=v<0?"":""+v;if(d.dataset.v===nv)return false;d.dataset.v=nv;d.innerHTML=v===0?SX:v===1?SO:"";return true}
function mkCnt(){const d=document.createElement("div");d.className="cnt";const a=document.createElement("span"),b=document.createElement("span");b.className="one";d.append(a,b);d.a=a;d.b=b;return d}
function setCnt(k,z,o,h){k.a.textContent=z;k.b.textContent=o;k.a.className=z===h?"full":z>h?"over":"";k.b.className="one"+(o===h?" full":o>h?" over":"")}
function paintBin(){const W=S.p.W,H=S.p.H,rd=S.rd||[],cd=S.cd||[],pk=S.pick;S.pb=S.cells.length>0&&S.pbk===S.id;S.pbk=S.id;
 for(let r=0;r<H;r++){let z=0,o=0;for(let c=0;c<W;c++){const a=S.cur[r*W+c];if(a===0)z++;else if(a===1)o++}if(S.rowc[r])setCnt(S.rowc[r],z,o,W/2)}
 for(let c=0;c<W;c++){let z=0,o=0;for(let r=0;r<H;r++){const a=S.cur[r*W+c];if(a===0)z++;else if(a===1)o++}if(S.colc[c])setCnt(S.colc[c],z,o,H/2)}
 S.cells.forEach((d,i)=>{if(!d)return;const v=S.cur[i],r=i/W|0,c=i%W;if(binSym(d,v)&&S.pb)popEl(d);
  const gi=rd[r]>=0?rd[r]:cd[c]>=0?cd[c]:-1;for(let k=0;k<5;k++)d.classList.toggle("dg"+k,gi>=0&&gi%5===k);const h=S.hint;d.classList.toggle("ht",!!(h&&h.cells.includes(i)));d.classList.toggle("hr",!!(h&&!h.cells.includes(i)&&h.why.includes(i)));
  d.classList.toggle("pick",!!(pk&&(pk.t==="r"?r===pk.at:c===pk.at)))})}
function binCompare(){const W=S.p.W,H=S.p.H,pk=S.pick,rows=pk.t==="r",n=rows?H:W,lines=[];
 for(let x=0;x<n;x++){const l=[];if(rows)for(let c=0;c<W;c++)l.push(S.cur[x*W+c]);else for(let r=0;r<H;r++)l.push(S.cur[r*W+x]);lines.push(l)}
 /* Dubbele-lijnhint: precies één lijn is af en de andere heeft exact twee lege vakjes.
    Als alle al ingevulde vakjes overeenkomen, mag de onvolledige lijn niet hetzelfde eindigen; juist dan helpt de uniekheidsregel. */
 const dupHint=(a,b)=>{
  const af=a.every(v=>v>=0),bf=b.every(v=>v>=0);if(af===bf)return false;
  const inc=af?b:a;if(inc.reduce((n,v)=>n+(v<0),0)!==2)return false;
  for(let k=0;k<a.length;k++)if(a[k]>=0&&b[k]>=0&&a[k]!==b[k])return false;
  return true};
 const at=pk.at,vis=Array(n).fill(-1);
 for(let x=0;x<n;x++)if(x!==at&&dupHint(lines[at],lines[x])){vis[x]=0;vis[at]=0}
 S.rd=rows?vis:null;S.cd=rows?null:vis}
let drag2=null,binLastTap={t:0,i:-1,h:0,note:false};
let G2=null;
function binCell(x,y){const g=G2;if(!g)return -1;const c=Math.floor((x-g.x)/g.cs),r=Math.floor((y-g.y)/g.cs);return c<0||r<0||c>=g.W||r>=g.H?-1:r*g.W+c}
/* Terwijl de Pencil het scherm raakt, tellen aanrakingen van hand of duim op het speelveld niet mee. */
let penAct=null;addEventListener("pointerdown",e=>{if(e.pointerType==="pen")penAct={id:e.pointerId,t:performance.now()};else if(penAct&&performance.now()-penAct.t<4000&&e.target.closest&&e.target.closest("#grid,#hexsvg,#mgrid")){e.stopPropagation();e.preventDefault()}},true);
const penUp=e=>{if(e.pointerType==="pen"&&penAct&&penAct.id===e.pointerId)penAct=null};addEventListener("pointerup",penUp,true);addEventListener("pointercancel",penUp,true);
/* Gedeelde vakjes-geometrie: rekent met offsetLeft/offsetTop, dus een vakje dat net 'popt' (vergroot) verschuift de raakzone niet. */
function gridGeo(W){const g=$("#grid"),gr=g.getBoundingClientRect(),a=S.cells[0],b=S.cells[1]||a,d=S.cells[W]||a;
 return{x:gr.left+a.offsetLeft-g.offsetLeft,y:gr.top+a.offsetTop-g.offsetTop,pw:(b.offsetLeft-a.offsetLeft)||a.offsetWidth,ph:(d.offsetTop-a.offsetTop)||a.offsetHeight}}
function gridHit(G,x,y,W,H){if(!G)return -1;const c=Math.floor((x-G.x)/G.pw),r=Math.floor((y-G.y)/G.ph);return c<0||r<0||c>=W||r>=H?-1:r*W+c}
/* Binair: dubbelklik/dubbeltik is één logische zet. Ongedaan verwijdert dus ○ in één stap, ook bij potloodnotities. */
function binDown(e){const mb=mouseLR(e);if(S.done||S.type!=="bin"||e._closed||mb==="")return;if(drag2&&drag2.pid!==e.pointerId)binEnd();
 const g=gridGeo(S.p.W);G2={x:g.x,y:g.y,cs:g.pw,W:S.p.W,H:S.p.H};
 /* Op de tellers naast het veld drukken/slepen: die rij (of kolom) vergelijken met de andere, zonder iets in te vullen. */
 const k=e.target.closest&&e.target.closest(".cnt");
 if(k){if(mb==="r")return;const ri=S.rowc.indexOf(k),ci=S.colc.indexOf(k);if(ri<0&&ci<0)return;e.preventDefault();clearHint();
  drag2={line:ri>=0?"r":"c",pid:e.pointerId,moved:true};try{$("#grid").setPointerCapture(e.pointerId)}catch(x){}
  S.pick={t:drag2.line,at:ri>=0?ri:ci};binCompare();paintBin();return}
 const i=binCell(e.clientX,e.clientY);if(i<0)return;
 e.preventDefault();if(!S.start&&S.p.giv[i]<0)S.start=Date.now();clearHint();
 const N=S.p.W,r=i/N|0,c=i%N,dbl=mb!=="r"&&binLastTap.i===i&&binLastTap.note===!!potlood&&e.timeStamp-binLastTap.t<380;
 let dblBase=null;
 if(dbl&&binLastTap.h===S.hist.length&&S.hist.length){const h=S.hist[S.hist.length-1];
  if(potlood&&h&&h.note&&h.i===i){S.hist.pop();noteRaw(i,h.from);S.redo=[]}
  else if(!potlood&&Array.isArray(h)&&h.length===S.cur.length){dblBase=S.hist.pop();S.redo=[]}}
 if(dbl)binLastTap={t:0,i:-1,h:0,note:false};else if(mb==="r")binLastTap={t:0,i:-1,h:0,note:false};
 if(potlood){
  const old=noteVal(i),editable=S.p.giv[i]<0&&S.cur[i]<0,target=(mb==="r"||dbl)?2:mb==="l"?1:0,to=!editable?old:dbl?2:mb==null?(old===1?2:old===2?0:1):(old===target?0:target);
  drag2={note:true,start:i,minr:r,maxr:r,minc:c,maxc:c,moved:false,pid:e.pointerId,x:e.clientX,y:e.clientY,t:e.timeStamp,nchanges:new Map(),mouseDirect:mb!==null,dbl};S.rd=S.cd=S.pick=null;
  noteDragWrite(drag2,i,to);return}
 begin();if(dblBase)S.gs=dblBase;drag2={start:i,minr:r,maxr:r,minc:c,maxc:c,moved:false,old:S.cur[i],applied:false,pid:e.pointerId,x:e.clientX,y:e.clientY,t:e.timeStamp,mouseDirect:mb!==null,dbl};S.rd=S.cd=S.pick=null;
 if(S.p.giv[i]<0){const o=S.cur[i],target=(mb==="r"||dbl)?1:0;if(dbl)S.cur[i]=1;else S.cur[i]=o===target?-1:target;drag2.applied=true}
 paintBin();
 if(mb===null&&!dbl)lpStart(e,()=>{if(!drag2||drag2.moved||drag2.start!==i)return;if(S.gs)S.cur=S.gs.slice();drag2=null;S.gs=null;paintBin();lpNote(i)})}
function binMove(e){if(!drag2||S.type!=="bin"||e.pointerId!==drag2.pid)return;
 if(drag2.mouseDirect)return;
 if(drag2.line){const g=G2,rows=drag2.line==="r",n=rows?g.H:g.W,x=Math.max(0,Math.min(n-1,Math.floor(rows?(e.clientY-g.y)/g.cs:(e.clientX-g.x)/g.cs)));
  if(S.pick&&S.pick.at!==x){S.pick={t:drag2.line,at:x};binCompare();paintBin()}return}if(!drag2.moved&&Math.hypot(e.clientX-drag2.x,e.clientY-drag2.y)<Math.max(14,CS*.6))return;const i=binCell(e.clientX,e.clientY);if(i<0)return;
 const N=S.p.W,r=i/N|0,c=i%N,d=drag2;
 d.minr=Math.min(d.minr,r);d.maxr=Math.max(d.maxr,r);d.minc=Math.min(d.minc,c);d.maxc=Math.max(d.maxc,c);
 if(d.maxr===d.minr&&d.maxc===d.minc)return;d.moved=true;
 if(d.note){noteDragRestore(d,d.start);paintNotes()}else if(d.applied){S.cur[d.start]=d.old;d.applied=false}
 S.pick=(d.maxr-d.minr)>=(d.maxc-d.minc)?{t:"r",a:d.minr,b:d.maxr,at:r}:{t:"c",a:d.minc,b:d.maxc,at:c};
 binCompare();paintBin()}
function binUp(e){if(!drag2||(e&&e.pointerId!==drag2.pid))return;const d=drag2,acted=d.note?[...(d.nchanges||new Map()).values()].some(c=>c.from!==c.to):!!d.applied,remember=!d.line&&!d.moved&&!d.dbl&&acted&&e&&e.button!==2;binEnd();if(remember)binLastTap={t:e.timeStamp,i:d.start,h:S.hist.length,note:!!d.note};else if(d.dbl)binLastTap={t:0,i:-1,h:0,note:false}}
function binEnd(){const d=drag2;drag2=null;if(S.type!=="bin")return;
 if(d.note){if(d.moved){S.pick=null;paintBin();noteFinish(d,false);return}noteFinish(d,false);return}
 if(d.moved){S.gs=null;S.pick=null;paintBin();return}
 commit();check()}
$("#grid").addEventListener("touchstart",e=>{if(["bin","star","nono","plus"].includes(S.type))e.preventDefault()},{passive:false});
/* Murdoku: net als bij de andere puzzels iOS niet laten wachten op een mogelijk gebaar, zodat snelle (Pencil-)tikken allemaal meetellen.
   Op het bord, de namen en de knoppen altijd; in de lijst met kaartjes alleen voor de Pencil (met je vinger kun je die lijst dan nog scrollen). */
$("#mur").addEventListener("touchstart",e=>{const t=e.target;if(!t.closest)return;if(t.closest("#mgrid,#mpal,#macc button"))e.preventDefault();else if(t.closest("#mclues li")&&isStylus(e))e.preventDefault()},{passive:false});
addEventListener("pointerup",binUp);addEventListener("pointercancel",binUp);

/* ---- Star Battle: slepen ---- */
let drag=null,starLastTap={t:0,i:-1,h:0,note:false};
const sym=v=>v===2?"★":v===1?"✕":"";
function adjStar(i){const N=S.p.N,r=i/N|0,c=i%N;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc;if(rr>=0&&rr<N&&cc>=0&&cc<N&&S.cur[rr*N+cc]===2)return true}return false}
const disp=i=>S.cur[i]===2?2:(S.cur[i]===1||(autoCrossOn()&&adjStar(i)))?1:0;
/* Te veel sterren in een rij, kolom of gebied, of sterren die elkaar raken: al die sterren rood. */
function starBadSet(){const N=S.p.N,K=STK,bad=new Set(),rows={},cols={},regs={};
 S.cur.forEach((v,i)=>{if(v!==2)return;const r=i/N|0,c=i%N;(rows[r]=rows[r]||[]).push(i);(cols[c]=cols[c]||[]).push(i);(regs[S.p.reg[i]]=regs[S.p.reg[i]]||[]).push(i);
  for(const j of[i+1,i+N-1,i+N,i+N+1]){if(j<N*N&&S.cur[j]===2&&Math.abs(j%N-c)<=1){bad.add(i);bad.add(j)}}});
 for(const g of[rows,cols,regs])for(const k in g)if(g[k].length>K)g[k].forEach(i=>bad.add(i));return bad}
function paintAll(){const bad=starBadSet();S.cells.forEach((d,i)=>{if(d){d.textContent=sym(disp(i));d.classList.toggle("sv",S.cur[i]===2);d.classList.toggle("sbad",bad.has(i))}});paintNotes()}
function setCell(i,v){S.cur[i]=v;paintAll()}
function applyDrag(i){if(drag.mode==="add"){if(disp(i)===0)setCell(i,1)}else if(drag.mode==="del"){if(S.cur[i]===1)setCell(i,0)}}
function noteAdjStar(i){const N=S.p.N,r=i/N|0,c=i%N;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc,j=rr*N+cc;if(rr>=0&&rr<N&&cc>=0&&cc<N&&noteVal(j)===2&&disp(j)===0)return true}return false}
const noteDisp=i=>noteVal(i)===2?2:(noteVal(i)===1||(autoCrossOn()&&noteAdjStar(i)))?1:0;
function applyNoteDrag(i){if(disp(i)!==0)return;if(drag.mode==="add"){if(noteDisp(i)===0)noteDragWrite(drag,i,1)}else if(drag.mode==="del"){if(noteVal(i)===1)noteDragWrite(drag,i,0)}}
function starDown(e){const mb=mouseLR(e);if(S.done||S.type!=="star"||e._closed||mb==="")return;if(drag&&drag.pid!==e.pointerId)starEnd();
 const N=S.p.N;S.sg=gridGeo(N);const i=gridHit(S.sg,e.clientX,e.clientY,N,N);if(i<0)return;
 const dbl=mb!=="r"&&starLastTap.i===i&&starLastTap.note===!!potlood&&e.timeStamp-starLastTap.t<380;let dblBase=null;
 if(dbl&&starLastTap.h===S.hist.length&&S.hist.length){const h=S.hist[S.hist.length-1];
  if(potlood&&h&&h.note&&h.i===i){S.hist.pop();noteRaw(i,h.from);S.redo=[]}
  else if(!potlood&&Array.isArray(h)&&h.length===S.cur.length){dblBase=S.hist.pop();S.redo=[];S.cur=dblBase.slice();paintAll()}}
 if(dbl)starLastTap={t:0,i:-1,h:0,note:false};else if(mb==="r")starLastTap={t:0,i:-1,h:0,note:false};
 e.preventDefault();if(!S.start)S.start=Date.now();clearHint();
 if(potlood){if(disp(i)!==0)return;const raw=noteVal(i),target=(mb==="r"||dbl)?2:1,mode=dbl?"add":raw===target?"del":"add";
  drag={note:true,directNote:true,target,pid:e.pointerId,mode,start:i,last:i,moved:false,path:[i],prev:new Map(),nchanges:new Map(),dbl};
  noteDragWrite(drag,i,dbl?2:mode==="del"?0:target);return}
 begin();if(dblBase)S.gs=dblBase;
 const target=(mb==="r"||dbl)?2:1,old=S.cur[i],mode=dbl?"add":old===target?"del":"add";
 drag={direct:true,target,pid:e.pointerId,mode,start:i,last:i,moved:false,path:[i],prev:new Map(),dbl};drag.prev.set(i,old);
 setCell(i,dbl?2:mode==="del"?0:target);
 if(mb===null&&!dbl)lpStart(e,()=>{if(!drag||drag.moved||drag.start!==i)return;if(S.gs)S.cur=S.gs.slice();drag=null;S.gs=null;paintAll();lpNote(i)})}
function starEnter(j){const d=drag,k=d.path.indexOf(j);if(k>=0){while(d.path.length>k+1){const c=d.path.pop();if(d.prev.has(c)){if(d.note)noteDragWrite(d,c,d.prev.get(c));else S.cur[c]=d.prev.get(c);d.prev.delete(c)}}d.note?paintNotes():paintAll();return}
 d.path.push(j);if(d.note){const o=noteVal(j);if(d.directNote){if(disp(j)!==0)return;const nv=d.mode==="del"?(o===d.target?0:o):d.target;noteDragWrite(d,j,nv)}else applyNoteDrag(j);if(noteVal(j)!==o)d.prev.set(j,o);return}
 if(d.direct){const o=S.cur[j],nv=d.mode==="del"?(o===d.target?0:o):d.target;if(nv!==o){d.prev.set(j,o);S.cur[j]=nv;paintAll()}return}
 const o=S.cur[j];applyDrag(j);if(S.cur[j]!==o)d.prev.set(j,o)}
function starMove(e){if(!drag||S.type!=="star"||e.pointerId!==drag.pid)return;const N=S.p.N,i=gridHit(S.sg,e.clientX,e.clientY,N,N);if(i<0||i===drag.last)return;
 const r0=drag.last/N|0,c0=drag.last%N,r1=i/N|0,c1=i%N,n=Math.max(Math.abs(r1-r0),Math.abs(c1-c0));
 if(!drag.moved){drag.moved=true}
 for(let k=1;k<=n;k++)starEnter(Math.round(r0+(r1-r0)*k/n)*N+Math.round(c0+(c1-c0)*k/n));
 drag.last=i}
function starUp(e){if(!drag||(e&&e.pointerId!==drag.pid))return;const d=drag,acted=d.note?[...(d.nchanges||new Map()).values()].some(c=>c.from!==c.to):d.prev&&d.prev.size>0,remember=!d.moved&&!d.dbl&&acted&&e&&e.button!==2;starEnd();if(remember)starLastTap={t:e.timeStamp,i:d.start,h:S.hist.length,note:!!d.note};else if(d.dbl)starLastTap={t:0,i:-1,h:0,note:false}}
function starEnd(){const d=drag;drag=null;if(S.type!=="star")return;if(d.note){noteFinish(d,d.moved);return}commit();check()}
addEventListener("pointerup",starUp);addEventListener("pointercancel",starUp);

const mouseLR=e=>e.pointerType==="mouse"?(e.button===0?"l":e.button===2?"r":""):null;
let nd=null,lastTap={t:0,i:-1};
function nonoAt(x,y){if(!S.cells.length)return -1;if(!S.ng)S.ng=gridGeo(S.p.W);return gridHit(S.ng,x,y,S.p.W,S.p.H)}
function nonoPaint(i,v){S.cur[i]=v;const d=S.cells[i];if(d){if(S.p.color){d.classList.remove("nc1","nc2","nc3","nc4","f");if(v>0)d.classList.add("nc"+v);d.textContent=v===-1?"✕":""}else{d.classList.toggle("f",v===1);d.textContent=v===2?"✕":""}popEl(d)}nonoClue(i)}
/* Een rij- of kolomgetal wordt lichter als de gevulde vakjes er precies bij passen. */
function nonoClue(i){if(S.type!=="nono"||!S.p)return;const W=S.p.W,H=S.p.H,r=i/W|0,c=i%W,g=$("#grid");
 const rv=[],cv=[];for(let k=0;k<W;k++)rv.push(S.cur[r*W+k]);for(let k=0;k<H;k++)cv.push(S.cur[k*W+c]);
 const a=g.querySelector('[data-ln="r'+r+'"]'),b=g.querySelector('[data-ln="c'+c+'"]');
 const upd=(el,v,cl)=>{if(!el)return;if(S.p.color){el.classList.toggle("ok",cnEq(cnClue(v.map(x=>x>0?x:0)),cl));const dn=nonoColorDone(cl,v);el.querySelectorAll(".ncl").forEach((s,k)=>s.classList.toggle("dn",!!dn[k]))}else{el.classList.toggle("ok",lc(v.map(x=>x===1?1:0)).join()===cl.join());const dn=nonoDone(cl,v);el.querySelectorAll("span").forEach((s,k)=>s.classList.toggle("dn",!!dn[k]))}};
 upd(a,rv,S.p.rc[r]);upd(b,cv,S.p.cc[c])}
/* Een los getal wordt lichtgrijs als vaststaat welk blok erbij hoort (het kan nergens anders liggen) en dat blok helemaal gevuld is.
   Bij bijvoorbeeld 1 1 1 1 met één gevuld vakje is niet duidelijk welke 1 het is: dan blijft alles zwart. */
function nonoDone(cl,v){if(!cl.length)return[];const A=nonoArr(cl,v);if(!A.cnt||A.cnt>200000)return cl.map(()=>false);return cl.map((len,k)=>A.mn[k]===A.mx[k]&&v.slice(A.mn[k],A.mn[k]+len).every(x=>x===1))}
function nonoColorDone(cl,v){if(!cl.length)return[];const A=cnLine(cl,v);if(!A.cnt||A.overflow)return cl.map(()=>false);return cl.map((q,k)=>A.mn[k]===A.mx[k]&&v.slice(A.mn[k],A.mn[k]+q.n).every(x=>x===q.c))}
function nonoEnter(j){const k=nd.path.indexOf(j);if(k>=0){while(nd.path.length>k+1){const c=nd.path.pop();if(nd.prev.has(c)){nonoPaint(c,nd.prev.get(c));nd.prev.delete(c)}}return}
 nd.path.push(j);const o=S.cur[j];nonoApply(j);if(S.cur[j]!==o)nd.prev.set(j,o)}
function nonoApply(j){if(nd.mode==="add"){if(S.cur[j]===0)nonoPaint(j,nd.val)}else if(S.cur[j]===nd.val)nonoPaint(j,0)}
/* Is een rij of kolom precies volgens de getallen gevuld? Dan worden de lege vakjes daarin vanzelf kruisjes. */
function nonoAuto(changed){if(!autoCrossOn())return;const W=S.p.W,H=S.p.H,rows=new Set(),cols=new Set();changed.forEach(i=>{rows.add(i/W|0);cols.add(i%W)});
 const fix=(idx,cl)=>{const v=idx.map(i=>S.cur[i]);if(!v.includes(0))return;if(S.p.color){if(cnEq(cnClue(v.map(x=>x>0?x:0)),cl)){idx.forEach(i=>{if(S.cur[i]===0)nonoPaint(i,-1)});return}
   /* Kleur: hetzelfde principe als klassiek. Als een gekleurd blok aantoonbaar dit specifieke getal is
      en op een vaste plek ligt, kruis alleen buurvakjes die in geen enkele geldige plaatsing nog gekleurd kunnen zijn. */
   if(!cl.length)return;const A=cnLine(cl,v);if(!A.cnt||A.overflow)return;
   cl.forEach((q,k)=>{if(A.mn[k]!==A.mx[k])return;const st=A.mn[k];if(!v.slice(st,st+q.n).every(x=>x===q.c))return;
    for(const z of[st-1,st+q.n])if(z>=0&&z<idx.length&&S.cur[idx[z]]===0&&A.fix[z]===-1)nonoPaint(idx[z],-1)});
   return}
  if(lc(v.map(x=>x===1?1:0)).join()===cl.join()){idx.forEach(i=>{if(S.cur[i]===0)nonoPaint(i,2)});return}
  /* Een blok dat zeker af is (het getal wordt grijs): meteen kruisjes aan beide kanten. */
  if(!cl.length)return;const A=nonoArr(cl,v);if(!A.cnt||A.cnt>200000)return;
  cl.forEach((len,k)=>{if(A.mn[k]!==A.mx[k])return;const st=A.mn[k];if(!v.slice(st,st+len).every(x=>x===1))return;
   for(const q of[st-1,st+len])if(q>=0&&q<idx.length&&S.cur[idx[q]]===0)nonoPaint(idx[q],2)})};
 rows.forEach(r=>{const idx=[];for(let c=0;c<W;c++)idx.push(r*W+c);fix(idx,S.p.rc[r])});
 cols.forEach(c=>{const idx=[];for(let r=0;r<H;r++)idx.push(r*W+c);fix(idx,S.p.cc[c])})}
let nonoMode="f",nonoColorMode=1;
function setNonoMode(m){const ch=nonoMode!==m;nonoMode=m;ub();if(ch)setTimeout(flashMode,0)}
function setNonoColorMode(v){nonoColorMode=v;nonoMode="f";ub();setTimeout(flashMode,0)}
function nonoLine(id){const N=S.p.W,k=+id.slice(1),idx=[];for(let j=0;j<(id[0]==="r"?N:S.p.H);j++)idx.push(id[0]==="r"?k*N+j:j*N+k);
 const emp=idx.filter(i=>S.cur[i]===0);if(!emp.length)return;begin();if(!S.start)S.start=Date.now();emp.forEach(i=>nonoPaint(i,S.p.color?-1:2));commit()}
/* Nonogram: tik = de gekozen stand (vullen of kruisje), nog eens tikken = leeg. Slepen kleurt in dezelfde stand.
   Wisselen tussen vullen en kruisje: met de knoppen, of naast het veld tikken met vinger of Pencil (net als bij Hexcells). */
function nonoDown(e){const mb=mouseLR(e);if(mb===""||S.type!=="nono"||S.done||e._closed)return;e.preventDefault();if(nd&&nd.pid!==e.pointerId)nonoEnd();
 const ck=e.target.closest&&e.target.closest("[data-ln]");if(ck){if(mb==="r")return;nonoLine(ck.dataset.ln);return}
 S.ng=gridGeo(S.p.W);const i=nonoAt(e.clientX,e.clientY);if(i<0)return;e._nono=true;
 const dbl=mb!=="r"&&lastTap.i===i&&e.timeStamp-lastTap.t<380;if(dbl)lastTap={t:0,i:-1};else if(mb==="r")lastTap={t:0,i:-1};
 if(dbl&&S.hist&&S.hist.length){const pre=S.hist[S.hist.length-1];if(Array.isArray(pre)&&pre.length===S.cur.length){const was=S.cur.slice();S.cur=S.hist.pop().slice();S.redo=[];was.forEach((v,j)=>{if(v!==S.cur[j])nonoPaint(j,S.cur[j])});ub()}}
 if(!S.start)S.start=Date.now();clearHint();begin();const old=S.cur[i],cross=S.p.color?-1:2,fill=S.p.color?nonoColorMode:1,active=S.p.color?(nonoMode==="x"?cross:fill):(nonoMode==="x"?cross:fill),val=dbl?cross:mb==="r"?(active===cross?fill:cross):active;
 nd={i0:i,last:i,moved:false,pid:e.pointerId,path:[i],prev:new Map(),old,val,mode:old===val?"del":"add",dbl};
 const nv=dbl?val:(old===val?0:val);nonoPaint(i,nv);if(nv!==old)nd.prev.set(i,old)}
function nonoMove(e){if(!nd||S.type!=="nono"||e.pointerId!==nd.pid)return;const i=nonoAt(e.clientX,e.clientY);if(i<0||i===nd.last)return;const N=S.p.W;nd.moved=true;
 const r0=nd.last/N|0,c0=nd.last%N,r1=i/N|0,c1=i%N,n=Math.max(Math.abs(r1-r0),Math.abs(c1-c0));
 for(let k=1;k<=n;k++)nonoEnter(Math.round(r0+(r1-r0)*k/n)*N+Math.round(c0+(c1-c0)*k/n));
 nd.last=i}
function nonoUp(e){if(!nd||e.pointerId!==nd.pid)return;const d=nd;if(!d.moved&&!d.dbl&&e&&e.button!==2)lastTap={t:e.timeStamp,i:d.i0};else if(d.dbl)lastTap={t:0,i:-1};nonoEnd()}
function nonoEnd(){const d=nd;nd=null;if(S.type!=="nono")return;const ch=[];if(S.gs)S.cur.forEach((v,i)=>{if(v!==S.gs[i])ch.push(i)});const filled=ch.filter(i=>S.p.color?S.cur[i]>0:S.cur[i]===1);if(filled.length)nonoAuto(filled);commit();check()}
addEventListener("pointerup",nonoUp);addEventListener("pointercancel",nonoUp);
function tap(i){if(S.done)return;const{type,p}=S;begin();
 if(type==="bin"){if(p.giv[i]>=0)return;S.cur[i]=S.cur[i]<0?0:S.cur[i]===0?1:-1}
 else S.cur[i]=(S.cur[i]+1)%3;
 commit();if(!S.start)S.start=Date.now();
 if(type==="nono"&&S.cells[i]&&S.cells[i].isConnected){const d=S.cells[i],v=S.cur[i];d.classList.toggle("f",v===1);d.textContent=v===2?"✕":"";popEl(d)}else render();
 check()}

function rKak(){const{W,H,w,hr,vr,runs}=S.p,g=$("#grid");g.style.touchAction="none";sizeCs(W,H,70);
 g.style.gridTemplateColumns=`repeat(${W},${CS}px)`;
 for(let i=0;i<W*H;i++){const d=document.createElement("div"),r=i/W|0,c=i%W;
  if(!w[i]){d.className="c kb";const hs=c+1<W&&w[i+1]?runs[hr[i+1]].sum:"",vs=r+1<H&&w[i+W]?runs[vr[i+W]].sum:"";
   if(!hs&&!vs)d.style.background="var(--line)";
   d.innerHTML=`<span class="kh">${hs}</span><span class="kv">${vs}</span>`}
  else{d.className="c"+(i===S.sel?" sel":"");d.textContent=S.cur[i]||"";d.onpointerdown=e=>{e.preventDefault();if(S.done)return;const g=$("#grid"),o=S.sel;S.sel=i;if(g.children[o])g.children[o].classList.remove("sel");d.classList.add("sel")}}
  g.append(d)}
 const pad=$("#pad");pad.style.display=S.done?"none":"flex";pad.innerHTML="";
 for(let d=1;d<=9;d++){const b=document.createElement("button");b.textContent=d;b.onpointerdown=e=>{e.preventDefault();put(d)};pad.append(b)}
 const b=document.createElement("button");b.textContent="⌫";b.onpointerdown=e=>{e.preventDefault();put(0)};pad.append(b)}
function put(d){if(S.type!=="kak"||S.done||S.sel<0)return;begin();S.cur[S.sel]=d;commit();if(!S.start)S.start=Date.now();const el=$("#grid").children[S.sel];if(el&&!el.classList.contains("kb")){el.textContent=d||"";popEl(el)}else render();check()}
addEventListener("keydown",e=>{if(S.type!=="kak"||e.target.tagName==="INPUT")return;if(/^[1-9]$/.test(e.key))put(+e.key);else if(e.key==="Backspace"||e.key==="0")put(0)});

function check(){const{type,p,cur}=S;let ok;
 if(type==="bin")ok=cur.every((v,i)=>v===p.sol[i]);
 else if(type==="star"){const N=p.N,rc=Array(N).fill(0),cc=Array(N).fill(0),gc=Array(N).fill(0);let adj=false;
  cur.forEach((v,i)=>{if(v!==2)return;const r=i/N|0,c=i%N;rc[r]++;cc[c]++;gc[p.reg[i]]++;
   for(const j of[i+1,i+N,i+N-1,i+N+1]){if(j<N*N&&cur[j]===2&&Math.abs((j%N)-c)<=1&&(j/N|0)-r<=1)adj=true}});
  ok=!adj&&[...rc,...cc,...gc].every(x=>x===(p.K||2))}
 else if(type==="nono"){if(p.color)ok=cur.every((v,i)=>p.sol[i]?v===p.sol[i]:v<=0);else{const u=cur.map(v=>v===1?1:0);ok=JSON.stringify(rowsOf(u,p.W,p.H).map(lc))===JSON.stringify(p.rc)&&JSON.stringify(colsOf(u,p.W,p.H).map(lc))===JSON.stringify(p.cc)}}
 else if(type==="plus"){plusSetup();ok=S.pu.every(u=>u.cells.reduce((a,i)=>a+(cur[i]===1?p.num[i]:0),0)===u.t)}/* klaar zodra alle goede getallen omcirkeld zijn; de rest hoeft niet weggestreept */
 else if(type==="kak"){const{w,runs}=p;ok=cur.every((v,i)=>!w[i]||v>0)&&runs.every(r=>{const ds=r.cells.map(i=>cur[i]);return new Set(ds).size===ds.length&&ds.reduce((a,b)=>a+b,0)===r.sum})}
 if(ok)finish()}

function finish(){S.secs=Math.max(1,Math.round(playMs()/1000));S.done=true;clearOnline(true);if(S.type==="nono"){const g=$("#grid");if(g)g.classList.add("nfin")}if(S.practice)clearFreeProgressType(S.type,null,S.type==="nono"?S.nv:null);else progDel(progKey(S.type,false,S.date,S.sf));hideHint();if(S.type==="hex")S.p.sol.forEach((v,i)=>S.hx.rev.add(i));
 setT(fmt(S.secs));
 const bdg=badges({mist:S.mist||0,hints:S.hints||0},S.type);$("#msg").textContent=(S.practice?"Opgelost! 🎉":"Klaar! 🎉"+(TSHOW?" "+fmt(S.secs):""))+(bdg?" "+bdg:"");if(S.practice)$("#next").classList.add("pulse");
 if(S.type!=="m24")render();
 celebrate();
 if(S.practice){const sid=String(S.seed).replace(/\W/g,"").slice(-8),row={name:$("#name").value.trim()||"Speler",group:$("#group").value.trim(),date:S.date,type:"v~"+S.type+S.sf+"~"+sid,secs:S.secs,uid,mist:S.mist||0,hints:S.hints||0,hintSteps:hintTotals()};
  const fl=freeLoc();fl.push({date:row.date,type:row.type,secs:row.secs,group:row.group,mist:row.mist,hints:row.hints,hintSteps:row.hintSteps});lsSet("pdfree",JSON.stringify(fl.slice(-400)));
  lastRows=lastRows.filter(r=>!(r.uid===uid&&r.type===row.type));lastRows.push(row);renderStats();
  dbSave(row);setTimeout(()=>{if(S.done&&S.practice)showFinFree(S.type+S.sf)},900);return}
 {const sk=S.date+S.type+S.sf;store[sk]=S.secs;SG[sk]=$("#group").value.trim();save();saveSG();XS[sk]={mist:S.mist||0,hints:S.hints||0,hintSteps:hintTotals()}}xsSave();
 const row=myRow(S.date,S.type+S.sf);
 lastRows=lastRows.filter(r=>!(r.uid===uid&&r.date===row.date&&r.type===row.type));lastRows.push(row);board(lastRows);
 dbSave(row).catch(()=>{$("#msg").textContent+=" (scorebord niet bereikbaar)"});
 setTimeout(()=>{if(S.done&&!S.practice)showFin(S.date,S.type+S.sf)},900)}

setInterval(()=>{if(S.start&&!S.done)setT(fmt(Math.round(playMs()/1000)))},500);

/* ---- Hints ---- */
const RN=["rode","oranje","gele","lichtgroene","zeegroene","lichtblauwe","blauwe","violette","paarse","roze"];
const HUES=[0,28,54,95,150,190,220,262,295,335];
const colName=k=>RN[S.pal?S.pal[k]:k];
function colorPerm(p){const N=p.N,adj=[];for(let i=0;i<N*N;i++){const r=i/N|0,c=i%N;for(const j of[i+1,i+N]){if(j>=N*N||(j===i+1&&c===N-1))continue;if(p.reg[i]!==p.reg[j])adj.push([p.reg[i],p.reg[j]])}}
 const R=rng(hash(p.reg.join())),dh=(a,b)=>{const d=Math.abs(HUES[a]-HUES[b]);return Math.min(d,360-d)};
 const score=pm=>{let m=360;for(const[a,b]of adj)m=Math.min(m,dh(pm[a],pm[b]));return m};
 let best=null,bs=-1;for(let t=0;t<3000;t++){const pm=shuf([...Array(N).keys()],R),sc=score(pm);if(sc>bs){bs=sc;best=pm}}
 return best}
const lst=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" en "+a[a.length-1];
const cap=t=>t[0].toUpperCase()+t.slice(1);
const unitName=(kind,k)=>kind==="r"?"rij "+(k+1):kind==="c"?"kolom "+(k+1):"het "+colName(k)+" gebied";
const lineNames=(kind,ks)=>(kind==="r"?(ks.length===1?"rij ":"rijen "):(ks.length===1?"kolom ":"kolommen "))+lst(ks.map(k=>k+1));
const regNames=ks=>(ks.length===1?"het ":"de ")+lst(ks.map(k=>colName(k)))+(ks.length===1?" gebied":" gebieden");
const cmbMemo={};
function combos(N,k){const key=N+","+k;if(cmbMemo[key])return cmbMemo[key];const out=[];(function rec(st,a){if(a.length===k){out.push(a.slice());return}for(let i=st;i<N;i++){a.push(i);rec(i+1,a);a.pop()}})(0,[]);return cmbMemo[key]=out}
let STK=2;
function starUnits(p){const N=p.N,rows=[],cols=[],regs=[],regOf=p.reg;for(let k=0;k<N;k++){rows.push([]);cols.push([]);regs.push([])}
 for(let i=0;i<N*N;i++){rows[i/N|0].push(i);cols[i%N].push(i);regs[p.reg[i]].push(i)}return{rows,cols,regs,regOf}}
function crossAround(st,N,i){const r=i/N|0,c=i%N;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if((dr||dc)&&rr>=0&&rr<N&&cc>=0&&cc<N&&st[rr*N+cc]===0)st[rr*N+cc]=1}}
function starOK(st,N,U){const ks=["r","c","g"];let q=0;for(const set of[U.rows,U.cols,U.regs]){const kd=ks[q++];for(let k=0;k<set.length;k++){let a=0,u=0;for(const i of set[k]){if(st[i]===2)a++;else if(st[i]===0)u++}
  if(a>STK)return`komen er in ${unitName(kd,k)} meer dan ${STK} ${STK>1?"sterren":"ster"}`;if(a+u<STK)return`blijft er in ${unitName(kd,k)} te weinig plek over voor ${STK} ${STK>1?"sterren":"ster"}`}}
 for(let i=0;i<N*N;i++)if(st[i]===2){const r=i/N|0,c=i%N;for(const j of[i+1,i+N-1,i+N,i+N+1]){const rr=j/N|0,cc=j%N;if(j<N*N&&Math.abs(cc-c)<=1&&rr-r<=1&&st[j]===2)return"zouden twee sterren elkaar raken"}}
 return""}
const nw=n=>["geen","één","twee","drie","vier"][n]||String(n);
function starTech(st,N,U,maxK){const units=[];
 U.rows.forEach((c,k)=>units.push({kind:"r",k,cells:c}));U.cols.forEach((c,k)=>units.push({kind:"c",k,cells:c}));U.regs.forEach((c,k)=>units.push({kind:"g",k,cells:c}));
 const near=(a,b)=>Math.abs((a/N|0)-(b/N|0))<=1&&Math.abs(a%N-b%N)<=1;
 const room=(cs,need)=>{if(need<=0)return true;if(!cs.length)return false;if(need<2)return true;for(let x=0;x<cs.length;x++)for(let y=x+1;y<cs.length;y++)if(!near(cs[x],cs[y]))return true;return false};
 const SW=n=>n===1?"ster":"sterren";
 for(const u of units){const stars=u.cells.filter(i=>st[i]===2),unk=u.cells.filter(i=>st[i]===0);if(!unk.length)continue;const nm=unitName(u.kind,u.k);
  if(stars.length===STK)return{set:1,cells:unk,why:u.cells,kind:"tech",btn:"Zet de kruisjes voor me",text:`In ${nm} ${STK>1?"staan al "+STK+" sterren":"staat al een ster"}. Dan kunnen alle andere vakjes daarin geen ster meer zijn: zet er kruisjes.`};
  const need=STK-stars.length;
  if(unk.length===need)return{set:2,cells:unk,why:u.cells,kind:"tech",btn:"Zet de "+(need===1?"ster":"sterren")+" voor me",text:`In ${nm} ${need===1?"moet":"moeten"} nog ${need} ${SW(need)} komen en er ${unk.length===1?"is":"zijn"} nog maar ${unk.length} vakje${unk.length===1?"":"s"} over. ${need===1?"Dat vakje is":"Die vakjes zijn"} dus ${need===1?"een ster":"sterren"}.`}}
 for(const u of units){const stars=u.cells.filter(i=>st[i]===2),unk=u.cells.filter(i=>st[i]===0);if(STK-stars.length!==2||unk.length<3)continue;
  for(const x of unk)if(!room(unk.filter(j=>j!==x),2)){const nm=unitName(u.kind,u.k);
   return{set:2,cells:[x],why:u.cells,kind:"tech",btn:"Zet de ster voor me",text:`In ${nm} moeten nog twee sterren komen. Kijk naar de vrije vakjes zonder dit vakje: die raken elkaar allemaal, dus daar past maar één ster in. De tweede ster moet dus hier staan.`}}}
 function conf(k){for(const kind of["r","c"]){const lines=kind==="r"?U.rows:U.cols;
  for(const comb of combos(N,k)){const inL=new Set();comb.forEach(x=>lines[x].forEach(i=>inL.add(i)));
   const cand=[...inL].filter(i=>st[i]!==1),touched=new Set(cand.map(i=>U.regOf[i])),inside=[];
   for(let g=0;g<N;g++){const gc=U.regs[g].filter(i=>st[i]!==1);if(gc.length&&gc.every(i=>inL.has(i)))inside.push(g)}
   const ln=lineNames(kind,comb),per=kind==="r"?"rij":"kolom",why=[...inL];
   if(inside.length===k){const tg=cand.filter(i=>st[i]===0&&!inside.includes(U.regOf[i]));
    if(tg.length){const rn=regNames(inside),one=k===1,txt=one?(STK===1?`Alle vrije vakjes van ${rn} liggen in ${ln}. De ster van dat gebied komt dus in ${ln}, en dat is meteen de enige ster van ${ln}.`:`Alle vrije vakjes van ${rn} liggen in ${ln}. De twee sterren van dat gebied komen dus in ${ln}, en meer dan twee sterren mag ${ln} niet hebben.`):`Alle vrije vakjes van ${rn} liggen in ${ln}. Samen hebben die gebieden ${STK*k} sterren nodig, en ${ln} hebben er samen ook precies ${STK*k}.`;
     return{set:1,cells:tg,why,kind:"tech",btn:"Zet de kruisjes voor me",text:txt+` Alle andere vakjes in ${ln} worden dus kruisjes.`}}}
   if(touched.size===k){const tg=[];touched.forEach(g=>U.regs[g].forEach(i=>{if(st[i]===0&&!inL.has(i))tg.push(i)}));
    if(tg.length){const rn=regNames([...touched]),one=k===1,txt=one?(STK===1?`In ${ln} kan alleen nog een ster komen in ${rn}. De ster van ${ln} ligt dus in dat gebied, en dat is meteen de enige ster van dat gebied.`:`In ${ln} kunnen alleen nog sterren komen in ${rn}. De twee sterren van ${ln} liggen dus allebei in dat gebied, en meer dan twee sterren heeft dat gebied niet.`):`In ${ln} kunnen alleen nog sterren komen in ${rn}. Die ${kind==="r"?"rijen":"kolommen"} hebben samen ${STK*k} sterren nodig, en die gebieden hebben er samen ook precies ${STK*k}.`;
     return{set:1,cells:tg,why,kind:"tech",btn:"Zet de kruisjes voor me",text:txt+` De vakjes van ${one?"dat gebied":"die gebieden"} buiten ${ln} worden dus kruisjes.`}}}}}
  return null}
 function look(pass){for(let x=0;x<N*N;x++){if(st[x]!==0)continue;const t=st.slice();t[x]=2;crossAround(t,N,x);
   const own=units.filter(u=>u.cells.includes(x)),full=[];
   if(pass>=2)for(const u of own){if(u.cells.filter(i=>t[i]===2).length===STK){let any=false;u.cells.forEach(i=>{if(t[i]===0){t[i]=1;any=true}});if(any)full.push(u)}}
   if(pass>=2&&!full.length)continue;
   for(const u of units){const a=u.cells.filter(i=>t[i]===2).length,rest=u.cells.filter(i=>t[i]===0),need=STK-a;if(room(rest,need))continue;
    const nm=unitName(u.kind,u.k),isOwn=u.cells.includes(x);let why;
    if(rest.length)why=`Dan blijven er in ${nm} alleen vrije vakjes over die elkaar allemaal raken. Daar past maar één ster in, terwijl ${nm} er nog twee nodig heeft.`;
    else if(isOwn)why=pass===1?`${cap(nm)} heeft twee sterren nodig, maar alle andere vrije vakjes van ${nm} raken dit vakje. Voor de tweede ster is dan geen plek.`:`Dan is er in ${nm} geen plek meer voor de tweede ster.`;
    else why=`Maar ${nm} heeft nog ${nw(need)} ${SW(need)} nodig, en dan is daar geen enkel vrij vakje meer over.`;
    const fn=full.map(f=>unitName(f.kind,f.k)),ext=full.length?` Bovendien ${full.length>1?"hebben":"heeft"} ${lst(fn)} dan al ${STK} sterren, dus worden ook ${full.length>1?"hun":"de"} andere vakjes${full.length>1?"":" van "+fn[0]} kruisjes.`:"";
    const ghost=[];for(let j=0;j<N*N;j++)if(st[j]===0&&t[j]===1)ghost.push(j);
    return{set:1,cells:[x],why:u.cells,ghost,kind:"tech",btn:"Zet het kruisje voor me",text:`Stel dat hier een ster komt. Dan worden alle vakjes eromheen kruisjes (de lichte oranje kruisjes).${ext} ${why} Hier kan dus geen ster: zet een kruisje.`}}}
  return null}
 /* Tellen over 1, 2 of 3 rijen/kolommen gaat voor: dat is de mooiste stap. Daarna pas "stel dat hier een ster komt". */
 for(let k=1;k<=maxK;k++){const r=conf(k);if(r){r.k=k;return r}}
 return look(1)||look(2)||null}
function starProp(st,N,U,mk){const steps=[];for(let it=0;it<60;it++){const w=starOK(st,N,U);if(w)return{n:it,w,steps};const s=starTech(st,N,U,mk||3);if(!s)return null;steps.push(s.text);for(const i of s.cells){st[i]=s.set;if(s.set===2)crossAround(st,N,i)}}return null}
function starWhy(star,r){const intro=star?"Stel dat je op dit vakje een ster zet. Dan raakt die ster zijn buren niet, dus alle vakjes eromheen worden kruisjes.":"Stel dat dit vakje een kruisje zou zijn.";const st=r.steps,show=st.length>6?[...st.slice(0,3),"… (nog "+(st.length-5)+" stappen op dezelfde manier) …",...st.slice(-2)]:st;return{intro,steps:show,outro:"Maar dan "+r.w+". Dat kan niet"+(star?". Op dit vakje staat dus geen ster: zet er een kruisje.":". Dit vakje moet dus een ster zijn.")}}
function starSolveFrom(t,p){const N=p.N,K=p.K||2;const col=Array(N).fill(0),rowc=Array(N).fill(0),rc=Array(N).fill(0);
 const okAt=(i)=>true;let found=false;
 const sols=starSolve(p.reg,N,50,K);return sols.some(s=>{for(let r=0;r<N;r++)for(const c of s[r]){const i=r*N+c;if(t[i]===1)return false}
  for(let i=0;i<N*N;i++)if(t[i]===2){const r=i/N|0,c=i%N;if(!s[r].includes(c))return false}return true})}
function starHint(){const p=S.p,N=p.N;if(!S.U)S.U=starUnits(p);const U=S.U;
 for(let i=0;i<N*N;i++)if(S.cur[i]===2&&!p.sol[i])return{cells:[i],why:[],set:0,kind:"fix",btn:"Haal deze ster weg",text:"Let op: deze ster staat op een plek waar hij niet hoort. Met deze ster loopt de puzzel vast. Haal hem weg."};
 for(let i=0;i<N*N;i++)if(S.cur[i]===1&&p.sol[i])return{cells:[i],why:[],set:0,kind:"fix",btn:"Wis dit kruisje",text:"Let op: dit kruisje staat op een vakje waar eigenlijk een ster hoort. Wis het kruisje."};
 const st=Array.from({length:N*N},(_,i)=>disp(i));
 const s=starTech(st,N,U,3);if(s)return s;
 let best=null;
 for(let i=0;i<N*N&&!(best&&best.n<=2);i++){if(st[i]!==0)continue;
  for(const v of[2,1]){const t=st.slice();t[i]=v;if(v===2)crossAround(t,N,i);const r=starProp(t,N,U);if(r&&(!best||r.n<best.n))best={n:r.n,w:r.w,steps:r.steps,i,v}}}
 if(best){const star=best.v===1,wy=starWhy(!star,best);return{set:star?2:1,cells:[best.i],why:[],kind:"contra",btn:star?"Zet de ster voor me":"Zet het kruisje voor me",intro:wy.intro,steps:wy.steps,outro:wy.outro,text:wy.intro+" "+wy.steps.join(" ")+" "+wy.outro}}
 {const t0=Date.now();for(let i=0;i<N*N&&Date.now()-t0<1500;i++){if(st[i]!==0)continue;
   for(const v of[2,1]){const t=st.slice();t[i]=v;if(v===2)crossAround(t,N,i);const r=starProp(t,N,U,4);if(r){const star=v===1,wy=starWhy(!star,r);return{set:star?2:1,cells:[i],why:[],kind:"contra",btn:star?"Zet de ster voor me":"Zet het kruisje voor me",intro:wy.intro,steps:wy.steps,outro:wy.outro,text:wy.intro+" "+wy.steps.join(" ")+" "+wy.outro}}}}}
 {const pick=[];for(let i=0;i<N*N;i++)if(st[i]===0)pick.push(i);
  for(const i of pick){const isStar=p.sol[i]===1,bad=isStar?1:2;const t=st.slice();t[i]=bad;if(bad===2)crossAround(t,N,i);
   if(!starSolveFrom(t,p)){return{set:isStar?2:1,cells:[i],why:[],kind:"deep",btn:isStar?"Zet de ster voor me":"Zet het kruisje voor me",
    text:"Dit is een lastige stap die je niet met een korte redenering vindt. Stel dat dit vakje "+(isStar?"een kruisje":"een ster")+" zou zijn: dan kun je de puzzel nooit meer goed afmaken, hoe je ook verder zet. Dit vakje is dus "+(isStar?"een ster":"geen ster")+"."}}}}
 return null}

const BLc={};function BLof(n){return BLc[n]||(BLc[n]=binLines(n))}
const sy=v=>v?"○":"✕";
function binHint(){const W=S.p.W,H=S.p.H,cur=S.cur,sol=S.p.sol;
 for(let i=0;i<W*H;i++)if(cur[i]>=0&&cur[i]!==sol[i])return{cells:[i],why:[],set:-1,kind:"fix",btn:"Wis dit vakje",text:`Let op: dit vakje klopt niet. De ${sy(cur[i])} die hier staat zorgt ergens voor een tegenspraak. Wis hem en kijk opnieuw.`};
 const lines=[];for(let o=0;o<2;o++){const nl=o?W:H,len=o?H:W;for(let x=0;x<nl;x++){const ci=[];for(let k=0;k<len;k++)ci.push(o?k*W+x:x*W+k);lines.push({o,x,ci,len,v:ci.map(i=>cur[i])})}}
 const nm=l=>(l.o?"kolom ":"rij ")+(l.x+1),mk=(l,ks,val,text)=>({cells:ks.map(k=>l.ci[k]),why:l.ci,set:val,kind:"tech",btn:"Vul het voor me in",text});
 for(const l of lines)for(let k=0;k<l.len-1;k++){const a=l.v[k];if(a<0||l.v[k+1]!==a)continue;const t=[];if(k>0&&l.v[k-1]<0)t.push(k-1);if(k+2<l.len&&l.v[k+2]<0)t.push(k+2);
  if(t.length)return mk(l,t,1-a,`In ${nm(l)} staan twee keer ${sy(a)} naast elkaar. Een derde ${sy(a)} erbij mag niet, dus direct ${l.o?"boven of onder":"links of rechts van"} dit paar komt ${sy(1-a)}.`)} for(const l of lines)for(let k=0;k<l.len-2;k++){const a=l.v[k];if(a>=0&&l.v[k+2]===a&&l.v[k+1]<0)return mk(l,[k+1],1-a,`In ${nm(l)} staat twee keer ${sy(a)} met één vakje ertussen. Staat daar ook ${sy(a)}, dan zijn het er drie op een rij. Dat vakje wordt dus ${sy(1-a)}.`)}
 for(const l of lines)for(const a of[0,1]){const c=l.v.filter(x=>x===a).length,e=l.v.map((x,k)=>x<0?k:-1).filter(k=>k>=0);
  if(c===l.len/2&&e.length)return mk(l,e,1-a,`In ${nm(l)} staan al ${l.len/2} keer ${sy(a)}. Meer mogen het er niet zijn, dus alle lege vakjes in deze ${l.o?"kolom":"rij"} worden ${sy(1-a)}.`)}
 for(const l of lines){const h=l.len/2,w=l.o?"kolom":"rij";for(let e=0;e<l.len;e++){if(l.v[e]>=0)continue;for(const a of[0,1]){const c=l.v.filter(x=>x===a).length;if(c+1!==h)continue;const t=l.v.map((x,j)=>j===e?a:x<0?1-a:x);let k3=-1;for(let k=0;k+2<t.length;k++)if(t[k]===t[k+1]&&t[k]===t[k+2]){k3=k;break}
   if(k3>=0)return mk(l,[e],1-a,`In ${nm(l)} staan al ${c} keer ${sy(a)}. Er mogen er ${h} zijn, dus er kan nog maar één ${sy(a)} bij. Stel dat die hier komt: dan worden alle andere lege vakjes ${sy(1-a)}, en dan staan er drie keer ${sy(t[k3])} naast elkaar. Dat mag niet. Hier komt dus ${sy(1-a)}.`)}}}
 for(const l of lines){const E=[];l.v.forEach((x,j)=>{if(x<0)E.push(j)});if(E.length!==2)continue;
  for(const m of lines){if(m===l||m.o!==l.o||m.v.includes(-1))continue;if(l.v.every((x,j)=>x<0||x===m.v[j])&&m.v[E[0]]!==m.v[E[1]]){const w=l.o?"kolom":"rij";
   return{cells:[l.ci[E[0]]],why:[...l.ci,...m.ci],set:1-m.v[E[0]],kind:"tech",btn:"Vul het voor me in",text:`Vergelijk ${nm(l)} met ${nm(m)}: alle ingevulde vakjes zijn gelijk en ${nm(l)} heeft nog 2 lege vakjes. Twee ${l.o?"kolommen":"rijen"} mogen nooit precies hetzelfde zijn. Vul je de lege vakjes in zoals in ${nm(m)}, dan zijn ze gelijk. Daarom komt hier ${sy(1-m.v[E[0]])} (en in het andere lege vakje ${sy(1-m.v[E[1]])}).`}}}}
 let best=null;
 for(const l of lines){const BL=BLof(l.len),FULL=(1<<l.len)-1;let km=0,vm=0;l.v.forEach((x,k)=>{if(x>=0){km|=1<<k;if(x)vm|=1<<k}});if(km===FULL)continue;
  const full=new Set();lines.filter(m=>m.o===l.o&&m!==l&&!m.v.includes(-1)).forEach(m=>{let q=0;m.v.forEach((x,k)=>{if(x)q|=1<<k});full.add(q)});
  let and=FULL,or=0,n=0;for(let j=0;j<BL.length;j++){const q=BL[j];if((q&km)!==vm||full.has(q))continue;and&=q;or|=q;n++}
  if(!n)continue;
  for(let k=0;k<l.len;k++){if(km>>k&1)continue;const f=(and>>k&1)?1:!(or>>k&1)?0:-1;if(f<0)continue;if(!best||n<best.n)best={n,l,k,f}}}
 if(best){const{n,l,k,f}=best,w=l.o?"kolom":"rij";
  return mk(l,[k],f,`Kijk naar ${nm(l)}. ${n===1?"Er is nog maar 1 geldige manier":"Er zijn nog maar "+n+" geldige manieren"} om deze ${w} in te vullen (nooit drie dezelfde naast elkaar, evenveel ✕ als ○ en niet gelijk aan een andere volledige ${w}). ${n===1?"Daarin":"In alle "+n}${n===1?" staat":" staat"} op dit vakje ${sy(f)}.`)}
 const j=sol.findIndex((v,i)=>cur[i]<0);
 return j>=0?{cells:[j],why:[],set:sol[j],kind:"reveal",btn:"Vul het voor me in",text:"Hier kan ik geen korte redenering voor vinden. Dit vakje wordt een "+sy(sol[j])+"."}:null}

/* ---- Nonogram-hint: per rij of kolom, met 'schuiven' uitgelegd ---- */
function nonoArr(cl,cur){const n=cur.length,K=cl.length,mn=Array(K).fill(1e9),mx=Array(K).fill(-1),st=[];let cnt=0;
 (function rec(b,p){if(cnt>200000)return;if(b===K){for(let k=p;k<n;k++)if(cur[k]===1)return;cnt++;for(let j=0;j<K;j++){if(st[j]<mn[j])mn[j]=st[j];if(st[j]>mx[j])mx[j]=st[j]}return}
  let rest=0;for(let j=b+1;j<K;j++)rest+=cl[j]+1;
  for(let s=p;s+cl[b]+rest<=n;s++){if(s>p&&cur[s-1]===1)break;let ok=true;for(let k=s;k<s+cl[b];k++)if(cur[k]===2){ok=false;break}
   if(ok&&s+cl[b]<n&&cur[s+cl[b]]===1)ok=false;if(ok){st[b]=s;rec(b+1,s+cl[b]+1)}}})(0,0);
 return{cnt,mn,mx}}
const ORD=["eerste","tweede","derde","vierde","vijfde","zesde","zevende","achtste"];
function colorNonoHint(){const p=S.p,W=p.W,H=p.H,cur=S.cur,sol=p.sol;
 for(let i=0;i<W*H;i++){const v=cur[i];if((v>0&&v!==sol[i])||(v===-1&&sol[i]>0)){const tx=v===-1?"Dit kruisje klopt niet. Wis het en kijk opnieuw.":"Dit gekleurde vakje klopt niet. Wis het en kijk opnieuw.";return{cells:[i],why:[],set:0,kind:"fix",btn:"Wis dit vakje",text:tx}}}
 const lines=[];for(let r=0;r<H;r++)lines.push({nm:"rij "+(r+1),cl:p.rc[r],ci:Array.from({length:W},(_,x)=>r*W+x)});for(let x=0;x<W;x++)lines.push({nm:"kolom "+(x+1),cl:p.cc[x],ci:Array.from({length:H},(_,r)=>r*W+x)});
 let best=null;const take=h=>{if(!best||h.pr<best.pr||(h.pr===best.pr&&h.cells.length>best.cells.length))best=h};
 for(const l of lines){const v=l.ci.map(i=>cur[i]);if(!v.includes(0))continue;const A=cnLine(l.cl,v);if(!A.cnt||A.overflow)continue;const groups=new Map();A.fix.forEach((z,k)=>{if(v[k]===0&&z!==0){if(!groups.has(z))groups.set(z,[]);groups.get(z).push(k)}});
  for(const [set,ks] of groups){const cl=cnText(l.cl),one=ks.length===1;let text="",pr=A.cnt===1?0:set>0?3:4,cells=ks.map(k=>l.ci[k]);
   /* Overlap: markeer alleen vakjes die aantoonbaar door hetzelfde gekleurde blok bedekt worden. */
   if(set>0){for(let j=0;j<l.cl.length&&!text;j++){const q=l.cl[j];if(q.c!==set)continue;const lo=A.mx[j],hi=A.mn[j]+q.n-1,sub=ks.filter(k=>k>=lo&&k<=hi);if(!sub.length)continue;
     cells=sub.map(k=>l.ci[k]);const één=cells.length===1,ord=l.cl.length>1?(ORD[j]||(j+1)+"e")+" blok":"blok";
     text="Kijk naar "+l.nm+" ("+cl+"). Het "+ord+" ("+q.n+" "+NCN[set]+") kan beginnen tussen vak "+(A.mn[j]+1)+" en "+(A.mx[j]+1)+". Hoe je het ook schuift, "+(één?"dit vakje blijft":"deze vakjes blijven")+" binnen dat blok. "+(één?"Kleur het ":"Kleur ze ")+NCN[set]+".";pr=1}}
   else if(set===-1){const sub=ks.filter(k=>l.cl.every((q,j)=>k<A.mn[j]||k>A.mx[j]+q.n-1));if(sub.length){cells=sub.map(k=>l.ci[k]);const één=cells.length===1;text="Kijk naar "+l.nm+" ("+cl+"). Geen enkel gekleurd blok kan "+(één?"dit vakje":"deze vakjes")+" bereiken. "+(één?"Hier komt dus een kruisje.":"Hier komen dus kruisjes.");pr=2}}
   if(!text){if(A.cnt===1)text="Kijk naar "+l.nm+" ("+cl+"). Met wat er al staat, passen de gekleurde blokken nog maar op één manier. ";else text="Kijk naar "+l.nm+" ("+cl+"). Er zijn nog "+A.cnt+" geldige manieren om de blokken te plaatsen. In al die manieren ";
    if(set===-1)text+=(one?"blijft dit vakje leeg. Zet hier dus een kruisje.":"blijven deze vakjes leeg. Zet hier dus kruisjes.");else text+=(one?"is dit vakje altijd ":"zijn deze vakjes altijd ")+NCN[set]+". "+(one?"Kleur het ":"Kleur ze ")+NCN[set]+"."}
   take({pr,set,cells,why:l.ci,text})}}
 if(!best)return null;best.kind="tech";best.btn=best.set===-1?"Zet het kruisje voor me":"Kleur het "+NCN[best.set]+" voor me";return best}
function nonoHint(){if(S.p.color)return colorNonoHint();const p=S.p,W=p.W,H=p.H,cur=S.cur,sol=p.sol;
 for(let i=0;i<W*H;i++)if((cur[i]===1&&!sol[i])||(cur[i]===2&&sol[i]))return{cells:[i],why:[],set:0,kind:"fix",btn:"Wis dit vakje",text:`Let op: dit vakje klopt niet. ${cur[i]===1?"Het hoort leeg te blijven":"Hier hoort juist een gevuld vakje"}, dus hiermee loopt de puzzel vast. Wis het en kijk opnieuw.`};
 const lines=[];for(let r=0;r<H;r++){const ci=[];for(let c=0;c<W;c++)ci.push(r*W+c);lines.push({nm:"rij "+(r+1),w:"rij",cl:p.rc[r],ci})}
 for(let c=0;c<W;c++){const ci=[];for(let r=0;r<H;r++)ci.push(r*W+c);lines.push({nm:"kolom "+(c+1),w:"kolom",cl:p.cc[c],ci})}
 let best=null;const consider=h=>{if(!best||h.pr<best.pr||(h.pr===best.pr&&h.cells.length>best.cells.length))best=h};
 for(const l of lines){const v=l.ci.map(i=>cur[i]);if(!v.includes(0))continue;const res=ls(l.cl,v),nf=[],nx=[];res.forEach((x,k)=>{if(v[k]===0&&x===1)nf.push(k);if(v[k]===0&&x===2)nx.push(k)});if(!nf.length&&!nx.length)continue;
  const cs=l.cl.length?l.cl.join(" "):"0",nm=l.nm+" ("+cs+")";
  if(!l.cl.length){consider({pr:0,set:2,cells:nx.map(k=>l.ci[k]),why:l.ci,text:`${cap(l.nm)} heeft een 0: daar komt geen enkel gevuld vakje. Alles wordt een kruisje.`});continue}
  if(lc(v.map(x=>x===1?1:0)).join()===l.cl.join()&&nx.length){consider({pr:0,set:2,cells:nx.map(k=>l.ci[k]),why:l.ci,text:`In ${nm} staan alle blokken al compleet. De andere vakjes in deze ${l.w} worden dus kruisjes.`});continue}
  const A=nonoArr(l.cl,v),okA=A.cnt>0&&A.cnt<=200000;
  if(nf.length&&okA)for(let k=0;k<l.cl.length;k++){const L=A.mn[k],R=A.mx[k],len=l.cl[k],a=R,b=L+len-1;if(a>b)continue;const t=nf.filter(x=>x>=a&&x<=b);if(!t.length)continue;
   const span=[];for(let x=L;x<R+len;x++)span.push(l.ci[x]);const bn=l.cl.filter(x=>x===len).length>1?`het ${ORD[k]||(k+1)+"e"} blok (${len})`:`het blok van ${len}`,nt=b-a+1;
   consider({pr:1,set:1,cells:t.map(x=>l.ci[x]),why:span,text:L===R?`Kijk naar ${nm}. Gezien wat er al staat, past ${bn} maar op één plek: het blauw omrande stuk. Vul het helemaal.`
    :`Kijk naar ${nm}. ${cap(bn)} ligt ergens in het blauw omrande stuk van ${R-L+len} vakjes. Schuif je het helemaal naar het begin of helemaal naar het eind, dan bedekt het altijd ${nt===1?"dit vakje":"deze "+nt+" vakjes"}. ${t.length===nt?(nt===1?"Dat vakje is dus gevuld.":"Die zijn dus gevuld."):(t.length===1?"Het vakje daarvan dat nog leeg is, is dus gevuld.":"De vakjes daarvan die nog leeg zijn, zijn dus gevuld.")}`})}
  if(nx.length&&okA){const reach=new Set();for(let k=0;k<l.cl.length;k++)for(let x=A.mn[k];x<A.mx[k]+l.cl[k];x++)reach.add(x);const t=nx.filter(x=>!reach.has(x));
   if(t.length)consider({pr:2,set:2,cells:t.map(x=>l.ci[x]),why:l.ci,text:`Kijk naar ${nm}. Hoe ver je de blokken ook schuift (passend bij wat er al staat), ${t.length===1?"dit vakje bereikt":"deze vakjes bereikt"} geen enkel blok. ${t.length===1?"Het wordt een kruisje":"Ze worden kruisjes"}.`})}
  const set=nf.length?1:2,ks=nf.length?nf:nx;
  consider({pr:3,set,cells:[l.ci[ks[0]]],why:l.ci,text:`Kijk naar ${nm}. Probeer alle manieren om de blokken ${cs} in deze ${l.w} te leggen die passen bij wat er al staat${okA&&A.cnt<=30?` (dat zijn er ${A.cnt})`:""}. In elke manier is dit vakje ${set===1?"gevuld":"leeg"}.`})}
 if(!best)return null;return Object.assign({kind:"tech",btn:best.set===1?"Vul het voor me in":"Zet de kruisjes voor me"},best)}
function paintNonoHint(){const h=S.hint;S.cells.forEach((d,i)=>{if(!d)return;d.classList.toggle("ht",!!(h&&h.cells.includes(i)));d.classList.toggle("hr",!!(h&&!h.cells.includes(i)&&h.why.includes(i)))})}
function repaintHint(){if(S.type==="plus")paintPlusHint();else if(S.type==="bin")paintBin();else if(S.type==="star")render();else if(S.type==="hex")rHex();else if(S.type==="nono")paintNonoHint();else if(S.type==="mur")paintMur()}
/* Op de iPhone maakt de puzzel even plaats voor de hintkaart (hij wordt tijdelijk kleiner), zodat de kaart nooit iets bedekt. */
let HINTPAD=0;
let HINTSIDE=0;
let hintHideT=0;
/* iPad: verplaats/schaal alleen de buitenste speelcontainer. De puzzel zelf wordt niet opnieuw gerenderd. */
function layoutSideHint(on){const pb=$("#playbox");if(pb)pb.style.transform=""}

function hideHint(){S.hint=null;document.body.classList.remove("hintdock");const b=$("#hint");clearTimeout(hintHideT);const wasPad=HINTPAD,wasSide=HINTSIDE,visible=!!(b&&b.innerHTML.trim()&&getComputedStyle(b).display!=="none");
 if(wasSide){HINTSIDE=0;document.body.classList.remove("hintside");layoutSideHint(false);resetPuzzleFit();if(S.p)render()}
 const done=()=>{if(!b)return;b.classList.remove("closing");b.style.display="none";b.innerHTML="";if(wasPad){HINTPAD=0;resetPuzzleFit();if(S.p)render()}if(wasSide)b.classList.remove("side")};
 if(visible&&!matchMedia("(prefers-reduced-motion: reduce)").matches){b.classList.add("closing");hintHideT=setTimeout(done,135)}else done()}
function clearHint(){if(!S.hint)return;hideHint();repaintHint()}
document.addEventListener("pointerdown",e=>{if(S.hint&&!e.target.closest("#hint,#hintb"))clearHint()},true);
function hintGo(){if(S.hint){clearHint();return}if(S.done||!S.p||!HINTT.includes(S.type))return;
 const h=S.type==="star"?starHint():S.type==="bin"?binHint():S.type==="nono"?nonoHint():S.type==="plus"?plusHint():S.type==="mur"?murHint():hexHint();if(!h)return;S.hint=h;
 S.hint=prepareHint(h);showHintLevel(S.hint,1,false)}
/* Zet de hintkaart op de plek waar hij het minst bedekt van de vakjes waar de hint over gaat
   (het vakje van de stap telt het zwaarst, dan de lichte kruisjes, dan de blauw/paars omrande vakjes).
   We proberen 9 plekken (boven/midden/onder x links/midden/rechts) en meten de echte hoogte van de kaart. */
function placeHint(){const b=$("#hint"),h=S.hint;if(!h||b.style.display==="none"||b.classList.contains("side"))return;
 if(PHONE){const pb=$("#pbot").getBoundingClientRect();b.style.top=Math.round(pb.top-b.offsetHeight-6)+"px";return}
 const el=i=>S.type==="mur"?S.mcells&&S.mcells[i]:S.type==="hex"?$("#hexsvg").querySelector(`g[data-i="${i}"]`):((S.cells&&S.cells[i])||$("#grid").children[i]);
 const rs=(a,w)=>(a||[]).map(el).filter(Boolean).map(e=>{const r=e.getBoundingClientRect();return{l:r.left-4,t:r.top-4,r:r.right+4,b:r.bottom+4,w}}).filter(r=>r.r>r.l);
 const F=[...rs(h.cells,1000),...rs(h.ghost,30),...rs(h.why,10)];
 const vw=innerWidth,hd=$("header"),pb=PHONE&&$("#pbot"),vh=pb?pb.getBoundingClientRect().top:innerHeight,top0=(hd?hd.getBoundingClientRect().bottom:0)+6,M=PHONE?6:10;
 const ov=(c,r)=>Math.max(0,Math.min(c.r,r.r)-Math.max(c.l,r.l))*Math.max(0,Math.min(c.b,r.b)-Math.max(c.t,r.t));
 Object.assign(b.style,{transform:"none",bottom:"auto",right:"auto"});
 const W1=Math.min(560,vw-2*M),W2=PHONE?W1:Math.min(420,vw-2*M),cands=[];
 for(const W of[W1,W2]){b.style.width=W+"px";b.style.left="0px";b.style.top="0px";const H=Math.min(b.offsetHeight,vh*.7);
  const xs={c:(vw-W)/2,l:M,r:vw-W-M},ys={b:vh-H-M,t:top0,m:Math.max(top0,(vh-H)/2)};
  for(const[yk,y]of Object.entries(ys))for(const[xk,x]of Object.entries(xs)){const c={l:x,t:y,r:x+W,b:y+H};
   const sc=F.reduce((s,r)=>s+ov(c,r)*r.w,0),pref=["bc","tc","bl","br","tl","tr","ml","mr","mc"].indexOf(yk+xk)+(W===W1?0:0.5);
   cands.push({W,x,y,sc,pref})}}
 cands.sort((p,q)=>p.sc-q.sc||p.pref-q.pref);const c=cands[0];
 Object.assign(b.style,{width:c.W+"px",left:Math.round(c.x)+"px",top:Math.round(c.y)+"px"})}
addEventListener("resize",()=>{if(S&&S.hint)setTimeout(()=>{if(S.hint)showHintLevel(S.hint,S.hint.level,false)},50)});
function doStep(){const active=S.hint;if(!active||active.level!==3||S.done)return;const h=active.move;
 if(S.type==="hex"){h.cells.forEach(i=>S.hx.rev.add(i));if(!S.start)S.start=Date.now();hideHint();hexAfter();return}
 if(S.type==="mur"){if(h.kind==="kill"){hideHint();paintMur();return}begin();const i=h.cells[0];if(h.set>=0){const o=S.cur.indexOf(h.set);if(o>=0)S.cur[o]=-1}S.cur[i]=h.set;commit();if(!S.start)S.start=Date.now();hideHint();if(h.set>=0&&S.ms===h.set)S.ms=murNext(h.set);paintMur();persist();check();return}
 begin();h.cells.forEach(i=>{S.cur[i]=h.set});if(S.type==="nono")nonoAuto(h.cells);if(S.type==="plus"&&h.kind!=="fix")plusAuto(h.cells);commit();
 if(!S.start)S.start=Date.now();hideHint();S.rd=S.cd=S.pick=null;if(S.type==="bin")paintBin();else render();check()}
$("#hintb").onclick=hintGo;

/* ---- Hexcells ---- */
let hexMode="b";
const clueTxt=c=>c.type===1?"{"+c.cnt+"}":c.type===2?"-"+c.cnt+"-":String(c.cnt);
/* "?" = zwart vakje zonder getal. Blauwe vakjes met een getal: open vanaf het begin (zs) of pas zichtbaar als je ze vindt (zh). */
const hexQ=(P,i)=>{if(!P._qs)P._qs=new Set(P.qs||[]);return P._qs.has(i)},hexZn=(P,i)=>(P.zs||[]).includes(i)||(P.zh||[]).includes(i);
function hexMsg(){if(!S.done)persist();let n=0;S.p.sol.forEach((v,i)=>{if(v&&!S.hx.rev.has(i))n++});if(!S.done)$("#msg").textContent="";$("#hexstat").innerHTML=PHONE?`<div class="st"><span>NOG</span><b>${n}</b></div><div class="st"><span>FOUT</span><b>${S.mist}</b></div>`:`<div class="st"><span>NOG TE VINDEN</span><b>${n}</b></div><div class="st"><span>FOUTEN</span><b>${S.mist}</b></div>`}
function rHex(){if(!S.p||S.type!=="hex"||!S.hx)return;{const hs=$("#hexstat");if(hs)hs.classList.toggle("hl",!!(S.hint&&S.hint.rest))}const P=S.p,w=$("#hexsvg"),sz=30,sq=Math.sqrt(3),D=isDark(),K={hid:D?"#d6922a":"#f2ae3d",blu:D?"#2f8fdc":"#2f9fe8",blk:D?"#0c0e12":"#35363b",bd:D?"#1a1f29":"#fff",lab:D?"#aeb7c6":"#4a4f5a",arr:D?"#8b94a5":"#7d838f",lnk:D?"#3a4354":"#fff"},cs=S.cs||{};
 const TR=PHONE,px=(q,r)=>{const x=sz*1.5*q,y=sz*sq*(r+q/2);return TR?[y,x]:[x,y]},pts=P.cells.map(c=>px(c.q,c.r));P.lineShow.forEach(j=>{const l=P.lines[j];pts.push(px(l.vq,l.vr))});
 /* Plek van de getallen bij de lijnen eerst uitrekenen, zodat ze altijd binnen beeld vallen (ook als ze opzij moeten voor een ander getal). */
 const LP={},VC={};P.lineShow.forEach(j=>{const l=P.lines[j],k=l.vq+","+l.vr;VC[k]=(VC[k]||0)+1});const shared=j=>VC[P.lines[j].vq+","+P.lines[j].vr]>1;{const used=[];P.lineShow.forEach(j=>{const l=P.lines[j],[x,y]=px(l.vq,l.vr),ang0=l.d===0?-90:l.d===1?30:-30,ang=TR?90-ang0:ang0,sg=l.d!==1?1:-1,rad=ang*Math.PI/180,ux=Math.cos(rad)*sg,uy=Math.sin(rad)*sg;let k=shared(j)?1.2:.5,tp;for(let t=0;t<6;t++){tp=[x-ux*sz*k,y-uy*sz*k];if(!used.some(q=>Math.hypot(q[0]-tp[0],q[1]-tp[1])<sz*.9))break;k+=.45}used.push(tp);LP[j]=tp})}
 const ext=[...pts.map(p=>[p[0],p[1],sz*1.2]),...Object.values(LP).map(p=>[p[0],p[1],sz*.85])];
 const x0=Math.min(...ext.map(p=>p[0]-p[2])),x1=Math.max(...ext.map(p=>p[0]+p[2])),y0=Math.min(...ext.map(p=>p[1]-p[2])),y1=Math.max(...ext.map(p=>p[1]+p[2]));
 const asp=(x1-x0)/(y1-y0);let h,wd;if(S._hexFit){h=S._hexFit.h;wd=S._hexFit.wd}else{const top=w.getBoundingClientRect().top+(window.scrollY||0),fit=Math.min((availBot()-top)/(y1-y0),($("#stage").clientWidth-(PHONE?2:10))/(x1-x0));h=(y1-y0)*Math.max(.4,Math.min(2.45,fit));wd=h*asp;S._hexFit={h,wd}};
 window._hg={sz,cells:pts.slice(0,P.cells.length),lines:P.lineShow.map((j,k)=>shared(j)?[LP[j][0],LP[j][1],j,LP[j][0],LP[j][1]]:[LP[j][0],LP[j][1],j,pts[P.cells.length+k][0],pts[P.cells.length+k][1]])};
 const hp=(x,y,r)=>[0,1,2,3,4,5].map(k=>{const a=Math.PI/3*k+(TR?Math.PI/6:0);return(x+r*Math.cos(a)).toFixed(1)+","+(y+r*Math.sin(a)).toFixed(1)}).join(" ");
 let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${x1-x0} ${y1-y0}" width="${wd}" height="${h}" style="max-width:none;touch-action:none">`;const H=S.hint;
 P.lineShow.forEach(j=>{const l=P.lines[j],[x,y]=px(l.vq,l.vr),far=l.d===2?l.idx[l.idx.length-1]:l.idx[0],[fx,fy]=px(P.cells[far].q,P.cells[far].r);
  s+=`<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${fx.toFixed(1)}" y2="${fy.toFixed(1)}" stroke="${K.lnk}" stroke-width="2.5" stroke-linecap="round" opacity=".6" pointer-events="none"/>`});
 let tx="";const zcnt=new Map();Object.keys(cs).forEach(k=>{if(cs[k]===1&&k[0]==="z"){const zc=P.zone[+k.slice(1)];if(zc){zc.pos.forEach(j=>zcnt.set(j,(zcnt.get(j)||0)+1));zcnt.set(+k.slice(1),(zcnt.get(+k.slice(1))||0)+1)}}});
 P.cells.forEach((c,i)=>{const[x,y]=px(c.q,c.r),rv=S.hx.rev.has(i),bl=P.sol[i]===1,ts=zcnt.has(i)?` stroke="rgba(15,25,45,${zcnt.get(i)>1?.6:.42})" stroke-width="${(sz*.075).toFixed(1)}" paint-order="stroke" stroke-linejoin="round"`:"";
  let fill=rv?(bl?K.blu:K.blk):K.hid;if(S.flash===i)fill="#e5484d";
  let stroke=K.bd,sw=2.2,dash="";const target=H&&H.cells.includes(i);if(target){stroke=D?"#b9d9df":"#315b65";sw=3}else if(H&&H.why.includes(i)){stroke=D?"#e2d4b5":"#685637";sw=2.5;dash=' stroke-dasharray="3 3"'}
  s+=`<g data-i="${i}" class="${S.popH===i?"pop":S.flash===i?"shake":""}" style="cursor:${rv?"default":"pointer"}"><polygon points="${hp(x,y,sz*1.0)}" fill="transparent" stroke="none"/><polygon pointer-events="none" points="${hp(x,y,sz*.93)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash} stroke-linejoin="miter"/>${target?`<polygon pointer-events="none" points="${hp(x,y,sz*.80)}" fill="none" stroke="${stroke}" stroke-width="1.5"/>`:""}`;
  if(rv&&bl&&hexZn(P,i))tx+=`<text x="${x}" y="${y+sz*.26}" text-anchor="middle" font-size="${sz*.78}" font-weight="700" fill="#fff" fill-opacity="${cs["z"+i]===2?.4:1}"${ts} pointer-events="none">${P.zone[i].cnt}</text>`;
  if(rv&&!bl)tx+=`<text x="${x}" y="${y+sz*.26}" text-anchor="middle" font-size="${sz*.78}" font-weight="700" fill="#fff"${ts} pointer-events="none">${hexQ(P,i)?"?":clueTxt(P.ring[i])}</text>`;
  s+="</g>"});
 let ov="";Object.keys(cs).forEach(k=>{if(cs[k]!==1)return;const id=+k.slice(1);
  if(k[0]==="z")return;
  else{const l=P.lines[id];if(!l)return;const a=px(P.cells[l.idx[0]].q,P.cells[l.idx[0]].r),b=px(P.cells[l.idx[l.idx.length-1]].q,P.cells[l.idx[l.idx.length-1]].r);ov+=`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${D?"rgba(255,255,255,.28)":"rgba(255,255,255,.6)"}" stroke-width="${sz*.2}" stroke-linecap="round" pointer-events="none"/>`}});
 /* Zones zoals in het origineel: de hele zeshoek tot twee vakjes ver (ook buiten het veld) krijgt een wit waas.
    Waar zones overlappen wordt het vanzelf lichter. Om elke zone komt een witte rand (met een donker randje eronder,
    zodat hij ook op de lichte achtergrond te zien is). */
 let zv="",zp="";const zpos=new Map(),ck=new Set(P.cells.map(c=>c.q+","+c.r)),vx=(x,y)=>[0,1,2,3,4,5].map(k=>{const a=Math.PI/3*k+(TR?Math.PI/6:0);return[x+sz*Math.cos(a),y+sz*Math.sin(a)]});
 Object.keys(cs).forEach(k=>{if(cs[k]!==1||k[0]!=="z")return;const c0=P.cells[+k.slice(1)];if(!c0)return;const set=new Set();
  for(let dq=-2;dq<=2;dq++)for(let dr=-2;dr<=2;dr++)if(Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr)<=4)set.add((c0.q+dq)+","+(c0.r+dr));
  set.forEach(kk=>{const[q,r]=kk.split(",").map(Number),[x,y]=px(q,r);zpos.set(kk,(zpos.get(kk)||0)+1);
   const V=vx(x,y);for(const[dq,dr]of HD6){if(set.has((q+dq)+","+(r+dr)))continue;const[nx,ny]=px(q+dq,r+dr),mx=(x+nx)/2,my=(y+ny)/2;
    const two=V.map(v=>[Math.hypot(v[0]-mx,v[1]-my),v]).sort((a,b)=>a[0]-b[0]).slice(0,2);zp+=`M${two[0][1][0].toFixed(1)} ${two[0][1][1].toFixed(1)}L${two[1][1][0].toFixed(1)} ${two[1][1][1].toFixed(1)}`}})});
 /* Hoe vaker overlapt, hoe lichter, maar niet zo licht dat de getallen wegvallen. */
 zpos.forEach((m,kk)=>{const[q,r]=kk.split(",").map(Number),[x,y]=px(q,r),on=ck.has(kk),t=Math.min(m,3)-1;
  zv+=`<polygon points="${hp(x,y,sz)}" fill="${on?(D?"rgba(255,255,255,"+[.28,.42,.52][t]+")":"rgba(255,255,255,"+[.42,.6,.7][t]+")"):(D?"rgba(255,255,255,"+[.18,.28,.36][t]+")":"rgba(105,120,145,"+[.2,.3,.38][t]+")")}" pointer-events="none"/>`});
 if(zp)zv+=`<path d="${zp}" stroke="rgba(20,30,50,${D?.5:.28})" stroke-width="${(sz*.17).toFixed(1)}" stroke-linecap="round" fill="none" pointer-events="none"/><path d="${zp}" stroke="#fff" stroke-width="${(sz*.08).toFixed(1)}" stroke-linecap="round" fill="none" pointer-events="none"/>`;
 s+=`<g class="ovl">${zv}${ov}</g><g class="txl">${tx}</g>`;
 window._tp=[];P.lineShow.forEach(j=>{const l=P.lines[j],[x,y]=px(l.vq,l.vr),ang0=l.d===0?-90:l.d===1?30:-30,ang=TR?90-ang0:ang0,fwd=l.d!==1,sg=fwd?1:-1,rad=ang*Math.PI/180,ux=Math.cos(rad)*sg,uy=Math.sin(rad)*sg,a0=sz*.1*sg,a1=sz*.7*sg,hd=sz*.17;const tp=LP[j];window._tp.push(tp);
  s+=`<g data-l="${j}" style="cursor:pointer"><circle cx="${tp[0].toFixed(1)}" cy="${tp[1].toFixed(1)}" r="${sz*.6}" fill="transparent"/><text x="${tp[0].toFixed(1)}" y="${(tp[1]+sz*.22).toFixed(1)}" text-anchor="middle" font-size="${sz*.6}" font-weight="700" fill-opacity="${cs["l"+j]===2?.35:1}" style="fill:${K.lab}">${clueTxt(l.clue)}</text>${(()=>{const sh=shared(j),b0=sh?.5:.4,sx=tp[0]+ux*sz*b0,sy=tp[1]+uy*sz*b0,ex=x+ux*sz*.85,ey=y+uy*sz*.85,h=sz*.17,px2=-uy,py2=ux;return`<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)} M${(ex-ux*h+px2*h).toFixed(1)} ${(ey-uy*h+py2*h).toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)} L${(ex-ux*h-px2*h).toFixed(1)} ${(ey-uy*h-py2*h).toFixed(1)}" style="stroke:${K.arr};fill:none" stroke-width="2.5" stroke-opacity="${cs["l"+j]===2?.35:1}" stroke-linecap="round" stroke-linejoin="round"/>`})()}</g>`});
 const ph=S.popH;S.popH=-1;const tp2=document.createElement("template");tp2.innerHTML=s+`<rect class="hit" x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" fill="transparent"/></svg>`;const nw=tp2.content.firstElementChild,old=w.firstElementChild;
 if(old&&old.nodeName===nw.nodeName)hexSync(old,nw);else{w.textContent="";w.append(nw)}
 const oldSh=w.querySelector(".shards");if(oldSh)oldSh.remove();
 if(ph>=0){const c=P.cells[ph],[cx,cy]=px(c.q,c.r);let sh=`<svg class="shards" xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${x1-x0} ${y1-y0}" width="${wd}" height="${h}">`;
  for(let k=0;k<6;k++){const a1=Math.PI/3*k+(PHONE?Math.PI/6:0),a2=a1+Math.PI/3,am=a1+Math.PI/6,d=sz*(1.0+Math.random()*.9),pt=(a)=>(cx+sz*.93*Math.cos(a)).toFixed(1)+","+(cy+sz*.93*Math.sin(a)).toFixed(1);
   sh+=`<polygon points="${cx.toFixed(1)},${cy.toFixed(1)} ${pt(a1)} ${pt(a2)}" fill="#f2ae3d" stroke="#fff" stroke-width="1.5" style="--dx:${(Math.cos(am)*d).toFixed(1)}px;--dy:${(Math.sin(am)*d+sz*.9).toFixed(1)}px;--rot:${((Math.random()-.5)*220).toFixed(0)}deg"/>`}
  const t3=document.createElement("template");t3.innerHTML=sh+"</svg>";const el=t3.content.firstElementChild;w.append(el);setTimeout(()=>el.remove(),750)}
 hexMsg()}
function hexSync(a,b){if(a.nodeType!==b.nodeType||a.nodeName!==b.nodeName){a.replaceWith(b.cloneNode(true));return}
 if(a.nodeType===3){if(a.nodeValue!==b.nodeValue)a.nodeValue=b.nodeValue;return}
 if(a.nodeType!==1)return;
 for(const at of[...a.attributes])if(!b.hasAttribute(at.name))a.removeAttribute(at.name);
 for(const at of b.attributes)if(a.getAttribute(at.name)!==at.value)a.setAttribute(at.name,at.value);
 if(a.childNodes.length!==b.childNodes.length){a.replaceChildren(...[...b.childNodes].map(n=>n.cloneNode(true)));return}
 for(let i=0;i<a.childNodes.length;i++)hexSync(a.childNodes[i],b.childNodes[i])}
function hexAfter(){pingBusy();if(S.p.sol.every((v,i)=>!v||S.hx.rev.has(i))){finish();return}rHex()}
function hexClue(k,forcedMode){if(!S.cs)S.cs={};const c=S.cs[k]||0,mode=forcedMode||hexMode;if(mode==="b"){if(c===1)delete S.cs[k];else S.cs[k]=1}else{if(c===2)delete S.cs[k];else S.cs[k]=2}rHex()}
function hexTap(i,forcedMode){if(S.done)return;if(S.hx.rev.has(i)){if(hexZn(S.p,i))hexClue("z"+i,forcedMode);return}S.zh=-1;S.hl=-1;if(!S.start)S.start=Date.now();clearHint();const mode=forcedMode||hexMode;
 if(S.p.sol[i]===(mode==="b"?1:0)){S.hx.rev.add(i);S.popH=i;hexAfter()}
 else{S.mist++;S.flash=i;rHex();setTimeout(()=>{S.flash=-1;if(S.type==="hex"&&!S.done)rHex()},450)}}
function hexHint(){const P=S.p,rev=S.hx.rev,n=P.n,cons=[];
 rev.forEach(i=>{if(!P.sol[i]&&!hexQ(P,i))cons.push({c:P.ring[i],kind:"ring",id:i})});(P.zs||[]).concat((P.zh||[]).filter(i=>rev.has(i))).forEach(i=>cons.push({c:P.zone[i],kind:"zone",id:i}));const whyOf=o=>o.kind==="rest"?[]:o.kind==="line"?P.lines[o.id].idx:[o.id];P.lineShow.forEach(j=>cons.push({c:P.lines[j].clue,kind:"line",id:j}));
 /* De teller "nog te vinden" is ook een aanwijzing: hoeveel blauwe vakjes er in totaal nog zijn. Altijd als laatste proberen. */
 const GC={pos:P.sol.map((_,i)=>i),cyc:false,cnt:P.sol.reduce((x,y)=>x+y,0),type:0};cons.push({c:GC,kind:"rest",id:-1});
 for(const o of cons){const c=o.c,hid=[];let k=0;for(const p of c.pos){if(p<0)continue;if(rev.has(p)){if(P.sol[p])k++}else hid.push(p)}
  if(!hid.length||(k!==c.cnt&&k+hid.length!==c.cnt))continue;
  if(o.kind==="rest"){const r=c.cnt-k;return{cells:hid,why:[],rest:true,kind:"tech",btn:"Doe de stap voor me",text:`Kijk naar de teller "nog te vinden": er ${r===1?"moet nog 1 blauw vakje":"moeten nog "+r+" blauwe vakjes"} gevonden worden, en er ${hid.length===1?"is":"zijn"} nog precies ${hid.length} onbekend${hid.length===1?" vakje":"e vakjes"} over. ${hid.length===1?"Dat vakje is dus blauw.":"Ze zijn dus allemaal blauw."}`}}
  const black=k===c.cnt,t=clueTxt(c),ring=o.kind==="ring",many=hid.length>1,
   why=o.kind==="line"?P.lines[o.id].idx.filter(p=>rev.has(p)):[o.id],zn=o.kind==="zone",
   intro=zn?`Het getal ${t} bij dit blauwe vakje zegt hoeveel vakjes in het gebied eromheen (tot twee vakjes ver, het vakje zelf telt niet mee) blauw zijn.`:`Het getal ${t} bij ${ring?"dit zwarte vakje":"deze lijn"} zegt hoeveel ${ring?"van de buren":"vakjes in de lijn"} blauw zijn.`,
   body=black?` Daarvan ${k===1?"is er":"zijn er"} al ${k} gevonden, dus ${many?"de overige "+hid.length+" vakjes zijn":"het laatste onbekende vakje is"} zwart.`
    :` Er ${k===1?"is":"zijn"} al ${k} gevonden, er ${hid.length===1?"is":"zijn"} nog ${hid.length} onbekend${hid.length===1?" vakje":"e vakjes"} over en er moeten er nog ${hid.length} blauw zijn. ${many?"Ze zijn dus allemaal blauw.":"Dat vakje is dus blauw."}`;
  return{cells:hid,why,kind:"tech",btn:"Doe de stap voor me",text:intro+body}}
 /* Lokaal zoeken: eerst één aanwijzing, dan twee die vakjes delen, dan drie. Zo vinden we snel de kleinste uitleg. */
 const a=Array(n).fill(-1);rev.forEach(i=>{a[i]=P.sol[i]});
 const act=cons.filter(o=>o.c.pos.some(p=>p>=0&&a[p]<0)),cof=new Map();act.forEach(o=>o.c.pos.forEach(p=>{if(p>=0&&a[p]<0){if(!cof.has(p))cof.set(p,[]);if(!cof.get(p).includes(o))cof.get(p).push(o)}}));
 const zlk=o=>o.kind==="rest"?-5:o.kind==="ring"?0:1,ordK=arr=>arr.slice().sort((x,y)=>zlk(y)-zlk(x));
 const nbM=new Map(),nb=o=>{if(nbM.has(o))return nbM.get(o);const st=new Set();o.c.pos.forEach(p=>{if(p>=0&&a[p]<0)(cof.get(p)||[]).forEach(x=>{if(x!==o)st.add(x)})});const r=ordK([...st]);nbM.set(o,r);return r};
 const bad=(i,set)=>{const t=a.slice();t[i]=1-P.sol[i];return!hexSatS(t,set.map(o=>o.c))};
 let best=null;
 for(const[i,cs0]of cof){for(const o of cs0)if(bad(i,[o])){best={i,f:P.sol[i],keep:[o]};break}if(best)break}
 if(!best){let sc=-1e9;for(const[i,cs0]of cof){for(const o1 of ordK(cs0)){for(const o2 of nb(o1))if(bad(i,[o1,o2])){const v=zlk(o1)+zlk(o2);if(v>sc){sc=v;best={i,f:P.sol[i],keep:[o1,o2]}}break}}if(sc>=2)break}}
 if(!best)outer:for(const[i,cs0]of cof)for(const o1 of ordK(cs0)){const n1=nb(o1);for(let x=0;x<n1.length;x++){const o2=n1[x],n3=new Set(n1.slice(x+1));nb(o2).forEach(o=>{if(o!==o1)n3.add(o)});for(const o3 of n3)if(bad(i,[o1,o2,o3])){best={i,f:P.sol[i],keep:[o1,o2,o3]};break outer}}}
 if(!best){const cs=cons.map(o=>o.c);for(let i=0;i<n&&!best;i++){if(rev.has(i))continue;const t=a.slice();t[i]=1-P.sol[i];if(!hexSat(t,cs))best={i,f:P.sol[i],keep:cons.slice(0,4)}}}
 if(best){const{i,f,keep}=best;
  const why=[...new Set(keep.flatMap(whyOf))].filter(p=>p!==i),col=v=>v?"blauw":"zwart",Col=v=>v?"Blauw":"Zwart";
  const nmC=o=>{const t=clueTxt(o.c);if(o.kind==="rest")return'de teller "nog te vinden"';return o.kind==="line"?`de lijn met ${t}`:o.kind==="zone"?`het getal ${t} op het blauwe vakje`:`het getal ${t} op het zwarte vakje`};
  const unk=o=>o.c.pos.filter(p=>p>=0&&!rev.has(p)),need=o=>o.c.cnt-o.c.pos.filter(p=>p>=0&&rev.has(p)&&P.sol[p]).length;
  const res=(cells,text,ex)=>({cells,f,nk:keep.length,rest:keep.some(o=>o.kind==="rest"),why:[...new Set([...why,...(ex||[])])].filter(p=>!cells.includes(p)),kind:"deduce",btn:"Doe de stap voor me",text:text+` Kies ${Col(f)} en tik erop.`});
  if(keep.length===1){const o=keep[0],t=clueTxt(o.c),nm=nmC(o),where=o.kind==="line"?"in de lijn":o.kind==="zone"?"in het gebied eromheen":"rondom";
   if(o.c.type===1)return res([i],`Kijk naar ${nm}. De haakjes in ${t} betekenen: de ${o.c.cnt} blauwe vakjes ${where} liggen aan elkaar, als één groepje. Als dit vakje ${col(1-f)} zou zijn, kan dat groepje niet meer aaneengesloten liggen. Dit vakje is dus ${col(f)}.`);
   if(o.c.type===2)return res([i],`Kijk naar ${nm}. De streepjes in ${t} betekenen: de ${o.c.cnt} blauwe vakjes ${where} liggen níet allemaal aan elkaar, er zijn minstens twee groepjes. Als dit vakje ${col(1-f)} zou zijn, zouden ze wél één groepje vormen. Dit vakje is dus ${col(f)}.`)}
  if(keep.length===2&&keep.some(o=>o.kind==="rest")){const o=keep.find(x=>x.kind!=="rest"),Uo=unk(o),uS=new Set(Uo),out=[];for(let p=0;p<n;p++)if(!rev.has(p)&&!uS.has(p))out.push(p);
   const R=need(keep.find(x=>x.kind==="rest")),m=need(o),nm=nmC(o),bv=n=>n+" "+(n===1?"blauw vakje":"blauwe vakjes");
   if(!o.c.type&&out.includes(i)){
    if(R===m&&!f)return res(out,`Kijk naar de teller "nog te vinden": er ${R===1?"moet":"moeten"} nog maar ${bv(R)} gevonden worden. ${cap(nm)} heeft er zelf ook nog ${m} nodig, in de paars omrande vakjes. Alle blauwe vakjes die nog over zijn, zitten dus daar. Alle andere onbekende vakjes zijn zwart.`,Uo);
    if(R-m===out.length&&f)return res(out,`Kijk naar de teller "nog te vinden": er ${R===1?"moet":"moeten"} nog ${bv(R)} gevonden worden. ${cap(nm)} heeft daarvan precies ${m} nodig in de paars omrande vakjes. Daarbuiten ${R-m===1?"moet":"moeten"} er dus nog ${R-m} blauw zijn, en daar ${out.length===1?"is":"zijn"} ook precies ${out.length} onbekend${out.length===1?" vakje":"e vakjes"} over. ${out.length===1?"Dat vakje is":"Die zijn"} dus blauw.`,Uo)}
   return res([i],`Hier heb je de teller "nog te vinden" nodig: er ${R===1?"moet":"moeten"} nog ${bv(R)} gevonden worden. Bekijk dat samen met ${nm} (paars omrand). Als dit vakje ${col(1-f)} zou zijn, klopt het totaal niet meer met wat ${nm} nodig heeft. Dit vakje is dus ${col(f)}.`,Uo)}
  if(keep.length===2){for(const[A,B]of[[keep[0],keep[1]],[keep[1],keep[0]]]){const UA=unk(A),UB=unk(B),Sh=UA.filter(p=>UB.includes(p)),oA=UA.filter(p=>!Sh.includes(p)),oB=UB.filter(p=>!Sh.includes(p)),nA=need(A),nB=need(B);
    if(!Sh.length||!oB.includes(i))continue;const nA_=nmC(A),nB_=nmC(B),pl=(n,w1,w2)=>n===1?w1:w2;
    const minS=Math.max(0,nA-oA.length),maxS=Math.min(Sh.length,nA);
    const bv=n=>n+" "+pl(n,"blauw vakje","blauwe vakjes"),uv=n=>n?`maar ${n} onbekende ${pl(n,"vakje","vakjes")}`:"geen onbekende vakjes meer";
    if(!f&&minS===nB&&minS>0)return res(oB,`Kijk naar ${nA_} en ${nB_} samen. Ze delen ${Sh.length} onbekende ${pl(Sh.length,"vakje","vakjes")} (paars omrand). ${cap(nA_)} heeft nog ${bv(nA)} nodig en heeft buiten die gedeelde vakjes ${uv(oA.length)}. In de gedeelde vakjes ${minS===1?"zit":"zitten"} dus minstens ${bv(minS)}. ${cap(nB_)} heeft er nog maar ${nB} nodig, en die zitten dus allemaal in de gedeelde vakjes. De andere vakjes van ${nB_} zijn zwart.`,Sh);
    if(f&&maxS===nA&&nB-maxS===oB.length&&oB.length>0)return res(oB,`Kijk naar ${nA_} en ${nB_} samen. Ze delen ${Sh.length} onbekende ${pl(Sh.length,"vakje","vakjes")} (paars omrand). ${cap(nA_)} heeft nog maar ${bv(nA)} nodig, dus in de gedeelde vakjes zitten er hooguit ${nA}. ${cap(nB_)} heeft er nog ${nB} nodig, dus ${oB.length===1?"het andere vakje van "+nB_+" is":"de andere "+oB.length+" vakjes van "+nB_+" zijn"} blauw.`,Sh)}}
  /* Twee aanwijzingen samen: leg het uit met "stel dat". Neem de ene aanwijzing (X), bekijk alle manieren waarop die nog kan kloppen
     als dit vakje de andere kleur heeft, en laat zien waarom de andere aanwijzing (Y) dan in elk geval misgaat. */
  if(keep.length===2&&!keep.some(o=>o.kind==="rest")){let pick=null;
   const t0=a.slice();t0[i]=1-f;const val=(p,m)=>p<0?0:t0[p]>=0?t0[p]:m.has(p)?m.get(p):-1;
   const fits=(c,v)=>{let k=0;for(const x of v)k+=x;return k===c.cnt&&(!c.type||hexType2(v,c))};
   for(const[X,Y]of[[keep[0],keep[1]],[keep[1],keep[0]]]){const ux=X.c.pos.filter(p=>p>=0&&t0[p]<0);if(ux.length>10)continue;
    const inX=new Set(ux),uy=Y.c.pos.filter(p=>p>=0&&t0[p]<0&&!inX.has(p));if(uy.length>10)continue;let ways=0,ok=true,lo=99,hi=-1;let one1=-1;const why=new Set();
    for(let m=0;m<1<<ux.length&&ok;m++){const mp=new Map();ux.forEach((p,b)=>mp.set(p,m>>b&1));if(!fits(X.c,X.c.pos.map(p=>val(p,mp))))continue;ways++;one1=m===0?0:m===(1<<ux.length)-1?1:-1;
     let k=0;for(const p of Y.c.pos){const v=val(p,mp);if(v>0)k++}const u=uy.length;lo=Math.min(lo,k);hi=Math.max(hi,k+u);
     if(k>Y.c.cnt)why.add("veel");else if(k+u<Y.c.cnt)why.add("weinig");
     else{let any=false;for(let q=0;q<1<<u&&!any;q++){const m2=new Map(mp);uy.forEach((p,b)=>m2.set(p,q>>b&1));if(fits(Y.c,Y.c.pos.map(p=>val(p,m2))))any=true}if(any)ok=false;else why.add("vorm")}}
    if(!ok||!ways)continue;const sc=(why.size===1?0:10)+Math.min(ways,9);if(!pick||sc<pick.sc)pick={sc,X,Y,ways,why:[...why],lo,hi,ux,one1}}
   if(pick){const{X,Y,ways,why:wy,lo,hi,ux,one1}=pick,nX=nmC(X),nY=nmC(Y),one=ways===1;
    const kx=X.c.pos.filter(p=>p>=0&&t0[p]===1).length,rest=X.c.cnt-kx,fixY=Y.c.pos.every(p=>p<0||t0[p]>=0||ux.includes(p));
    let tx=`Stel dat dit vakje ${col(1-f)} is.`;
    if(one&&(one1===0||one1===1))tx+=` Dan moet${ux.length===1?" het laatste onbekende vakje":"en de andere "+ux.length+" onbekende vakjes"} van ${nX} ${col(one1)} zijn, anders klopt ${X.kind==="line"?"die lijn":"dat getal"} niet.`;
    else if(ways<=4)tx+=` Dan kan ${nX} nog maar op ${one?"één manier":nw(ways)+" manieren"} kloppen.`;
    else tx+=` Dan moet ${nX} nog ${rest} blauw${rest===1?" vakje":"e vakjes"} kwijt in ${ux.length} onbekende vakjes.`;
    const C=one?"Maar dan":ways<=4?"Maar in elk van die gevallen":"Maar bij elke manier waarop dat kan";
    const V=wy.length>1?`klopt ${nY} niet meer (${wy.map(w=>w==="veel"?"te veel blauwe vakjes":w==="weinig"?"te weinig blauwe vakjes":"de blauwe vakjes liggen niet goed").join(" of ")}).`
     :wy[0]==="veel"?`krijgt ${nY} te veel blauwe vakjes: het moeten er ${Y.c.cnt} zijn, en het worden er ${fixY?"":"minstens "}${lo}.`
     :wy[0]==="weinig"?`kan ${nY} niet meer aan ${Y.c.cnt} blauwe vakjes komen: het worden er ${fixY?"":"hooguit "}${hi}.`
     :Y.c.type===1?`kunnen de blauwe vakjes van ${nY} niet meer aan elkaar liggen, terwijl de haakjes in ${clueTxt(Y.c)} dat vragen.`
     :`liggen de blauwe vakjes van ${nY} juist allemaal aan elkaar, terwijl de streepjes in ${clueTxt(Y.c)} zeggen dat dat niet mag.`;
    tx+=" "+C+" "+V;
    return res([i],tx+` Dit vakje kan dus niet ${col(1-f)} zijn: het is ${col(f)}.`,ux)}}
  const names=keep.map(nmC);
  return res([i],`Hier moet je ${keep.length===2?"twee":"drie"} aanwijzingen samen bekijken: ${lst(names)} (paars omrand). Elk los kan nog op meer manieren, maar samen niet: als dit vakje ${col(1-f)} zou zijn, kunnen ze niet allemaal tegelijk kloppen. Probeer het maar: vul in gedachten de vakjes eromheen in. Dit vakje is dus ${col(f)}.`)}
 return null}
let hexLast={t:0,x:-1,y:-1};
function hexPress(cx,cy,pt0,forcedMode,mouseButton){if(S.type!=="hex"||!S.p)return;const sv=$("#hexsvg").firstElementChild,g=window._hg;if(!sv||!g)return;
 const m=sv.getScreenCTM();if(!m)return;const pt=sv.createSVGPoint();pt.x=cx;pt.y=cy;const p=pt.matrixTransform(m.inverse());
 let bi=-1,bd=1e9;g.cells.forEach((c,i)=>{const d=Math.hypot(c[0]-p.x,c[1]-p.y);if(d<bd){bd=d;bi=i}});
 /* Een lijn kies je met zijn getal. Twee lijnen kunnen bij hetzelfde punt beginnen (bijvoorbeeld recht omhoog en schuin);
    hun getallen staan wel op verschillende plekken, dus het dichtstbijzijnde getal beslist. */
 let bl=-1,ld=1e9;g.lines.forEach(l=>{const d=Math.min(Math.hypot(l[0]-p.x,l[1]-p.y),Math.hypot(l[3]-p.x,l[4]-p.y)+g.sz*.35);if(d<ld){ld=d;bl=l[2]}});
 if(bl>=0&&ld<g.sz*1.05&&ld<bd){hexClue("l"+bl,forcedMode);return}
 if(bi>=0&&bd<g.sz*1.12){hexTap(bi,forcedMode);return}
 if(mouseButton!=="r"&&!S.done)setHexMode(hexMode==="b"?"z":"b")}
/* Alleen pointer-events: vroeger reageerde ook touchstart, waardoor één tik soms twee keer telde (een lijn aan en meteen weer uit). */
$("#hexsvg").addEventListener("pointerdown",e=>{e._hx=true;const mb=mouseLR(e);if(mb==="")return;e.preventDefault();const forced=mb==="r"?(hexMode==="b"?"z":"b"):null;hexPress(e.clientX,e.clientY,e.pointerType,forced,mb)});
$("#hexsvg").addEventListener("touchstart",e=>e.preventDefault(),{passive:false});
$("#sbtn").onclick=()=>$("#side").classList.toggle("open");
document.addEventListener("pointerdown",e=>{const sd=$("#side");if(sd.classList.contains("open")&&!e.target.closest("#side,#sbtn")){sd.classList.remove("open");e._closed=true}},true);
/* Naast het veld tikken (vinger of Pencil) wisselt de stand. Alles wat zelf iets doet (knoppen, menu's, scorebord, hint) telt niet mee;
   de lege ruimte in de kolommen links en rechts wel. */
const BGX="#topbar,#more,#home,#archp,#grid,#mgrid,#mclues,#mpal,#macc,#hexsvg,button,input,label,select,a,#side,header,nav,#pick,#hint,#fin,#hm,#cm,#npm,#pbot,#prow,#pmp,#time,#streak,#hexstat,#sbtn";
const twoMode=()=>["nono","plus","hex","mur"].includes(S.type)&&S.p&&!S.done;
function pulseEl(el){if(!el)return;el.classList.remove("modeflash");void el.offsetWidth;el.classList.add("modeflash");setTimeout(()=>el.classList.remove("modeflash"),260)}
function flashMode(){const el=S.type==="plus"?(plusMode==="x"?$("#pxb"):$("#pob")):S.type==="nono"?(nonoMode==="x"?$("#nx"):S.nv==="color"?$("#nc"+nonoColorMode):$("#nf")):S.type==="hex"?(hexMode==="b"?$("#mb"):$("#mz")):S.type==="mur"?$("#mgrid"):null;pulseEl(el)}
function toggleTwoMode(){if(!twoMode())return false;if(S.type==="plus")setPlusMode(plusMode==="x"?"o":"x");else if(S.type==="nono"){if(S.nv==="color"){if(nonoMode==="x")setNonoColorMode(nonoColorMode);else setNonoMode("x")}else setNonoMode(nonoMode==="f"?"x":"f")}else if(S.type==="mur"){S.mxm=!S.mxm;paintMur();flashMode()}else setHexMode(hexMode==="b"?"z":"b");return true}
document.addEventListener("pointerdown",e=>{if(e._closed||e._hx||!twoMode()||e.button>0||(e.target.closest&&e.target.closest(BGX)))return;e.preventDefault();tdAdd("→ wissel");toggleTwoMode()});
/* Zoals in het Hexcells-veld: iOS niet laten wachten op een mogelijk gebaar (scrollen, dubbeltik-zoom) bij een tik naast het veld.
   Alleen als de pagina niet hoeft te scrollen (anders kun je niet meer scrollen). */
/* Een aanraking van de Apple Pencil (touchType "stylus") naast het veld houden we altijd tegen, ook als de pagina kan scrollen:
   anders wacht iOS bij snelle Pencil-tikken eerst op een mogelijk gebaar en mist hij tikken. Een vinger kan dan nog gewoon scrollen. */
const isStylus=e=>[...(e.changedTouches||[])].some(t=>t.touchType==="stylus");
const bgTouch=e=>{if(!twoMode())return;const t=e.target;if(t.closest&&t.closest(BGX))return;if(document.documentElement.classList.contains("tap")||isStylus(e))e.preventDefault()};
document.addEventListener("touchstart",bgTouch,{passive:false,capture:true});document.addEventListener("touchend",e=>{if(isStylus(e))bgTouch(e)},{passive:false,capture:true});
document.addEventListener("dblclick",e=>{if(twoMode()||S&&S.type==="star")e.preventDefault()},{capture:true});
document.addEventListener("contextmenu",e=>{if(!(twoMode()||S&&["star","bin"].includes(S.type)))return;const t=e.target;if(t&&t.closest&&t.closest("#grid,#hexsvg,#mgrid"))e.preventDefault()},{capture:true});
/* Verborgen tik-meter (5 keer snel op het logo tikken): laat zien welke aanrakingen de iPad doorgeeft, met de tijd ertussen. */
let TD=null,tdTaps=[];const tdLog=[];let tdLast=0;
function tdAdd(s){if(!TD)return;const n=performance.now();tdLog.unshift(String(Math.round(n-tdLast)).padStart(5)+" ms  "+s);tdLast=n;tdLog.length=Math.min(tdLog.length,16);TD.textContent="Tik-meter (5x op logo = uit)\n"+tdLog.join("\n")}
$("header h1").addEventListener("pointerdown",()=>{const n=performance.now();tdTaps=tdTaps.filter(t=>n-t<3000);tdTaps.push(n);if(tdTaps.length>=5){tdTaps=[];if(TD){TD.remove();TD=null}else{TD=document.createElement("div");TD.id="tikdbg";document.body.append(TD);tdLog.length=0;tdAdd("aan")}}});
["pointerdown","pointerup","pointercancel","touchstart","touchend","touchcancel","click","dblclick"].forEach(t=>document.addEventListener(t,e=>{if(!TD)return;const tt=e.changedTouches?[...e.changedTouches].map(x=>x.touchType||"?").join(","):"";const tg=e.target||{};tdAdd(t+" "+(e.pointerType||tt)+" "+(tg.id||(typeof tg.className==="string"?tg.className:"")||tg.tagName||""))},true));
$("#nf").onpointerdown=e=>{e.preventDefault();setNonoMode("f")};$("#nx").onpointerdown=e=>{e.preventDefault();setNonoMode("x")};[1,2,3,4].forEach(q=>$("#nc"+q).onpointerdown=e=>{e.preventDefault();setNonoColorMode(q)});
$("#pxb").onpointerdown=e=>{e.preventDefault();setPlusMode("x")};$("#pob").onpointerdown=e=>{e.preventDefault();setPlusMode("o")};
function setHexMode(m){const ch=hexMode!==m;hexMode=m;ub();if(ch)setTimeout(flashMode,0)}
$("#mb").onpointerdown=e=>{e.preventDefault();setHexMode("b")};$("#mz").onpointerdown=e=>{e.preventDefault();setHexMode("z")};

/* ---- Pluszle ---- */
/* S.cur per vakje: 0 = open, 1 = omcirkeld (blijft zeker staan), 2 = weggestreept.
   Tik = de gekozen stand (✕ wegstrepen of ○ omcirkelen), nog eens tikken = weer open. Slepen werkt in dezelfde stand. */
let plusMode="x",pd=null;
function setPlusMode(m){const ch=plusMode!==m;plusMode=m;ub();if(ch)setTimeout(flashMode,0)}
/* Kleur per vlak: buren krijgen een andere kleur. */
const PHUE=[54,220,350,150,28,280,190],PNAME=["gele","blauwe","roze","groene","oranje","paarse","turquoise"];
function plusPal(p){const pal=[],W=p.W,used=PHUE.map(()=>0);p.rg.forEach((g,k)=>{const nb=new Set();g.cells.forEach(i=>{const r=i/W|0,c=i%W;[[r-1,c],[r+1,c],[r,c-1],[r,c+1],[r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]].forEach(([y,x])=>{if(y<0||x<0||y>=p.H||x>=W)return;const o=p.reg[y*W+x];if(o>=0&&o!==k&&pal[o]!==undefined)nb.add(pal[o])})});
  let h=-1;for(let t=0;t<PHUE.length;t++){const c=(k+t)%PHUE.length;if(nb.has(c))continue;if(h<0||used[c]<used[h])h=c}if(h<0)h=k%PHUE.length;pal[k]=h;used[h]++});return pal}
function plusSetup(){const p=S.p;if(S.pu)return;S.pu=plusUnits(p);S.ppal=plusPal(p);S.pof=Array.from({length:p.W*p.H},()=>[]);S.pu.forEach((u,k)=>u.cells.forEach(i=>S.pof[i].push(k)))}
const plusName=u=>u.kind==="r"?"rij "+(u.k+1):u.kind==="c"?"kolom "+(u.k+1):"het "+PNAME[S.ppal[u.k]]+" vlak";
function rPlus(){const p=S.p,W=p.W,H=p.H,g=$("#grid"),dark=isDark();plusSetup();S.cells=[];S.plab=[];
 g.style.touchAction="none";g.onpointerdown=plusDown;g.onpointermove=plusMove;
 sizeCs(W+1,H+1);g.style.gridTemplateColumns=`repeat(${W+1},${CS}px)`;g.classList.toggle("pdone",!!S.done);
 const tint=k=>`hsl(${PHUE[S.ppal[k]]},${dark?"36%,29%":"70%,88%"})`,edge="3px solid color-mix(in srgb,var(--fg) "+(dark?"50%":"70%")+",transparent)";
 const first=p.rg.map(x=>x.cells[0]);
 for(let r=0;r<=H;r++){for(let c=0;c<W;c++){
   if(r===H){const d=document.createElement("div");d.className="pt pc";d.dataset.ln="c"+c;d.innerHTML="<b>"+p.cs[c]+"</b>";S.plab[H+c]=d;g.append(d);continue}
   const i=r*W+c,k=p.reg[i],d=document.createElement("div");d.className="c pl";d.dataset.i=i;
   d.innerHTML='<span class="pn">'+p.num[i]+"</span>";
   if(k>=0){d.style.background=tint(k);const bd=(y,x)=>y<0||x<0||y>=H||x>=W||p.reg[y*W+x]!==k?edge:"";
    const t=bd(r-1,c),b=bd(r+1,c),l=bd(r,c-1),rt=bd(r,c+1);if(t)d.style.borderTop=t;if(b)d.style.borderBottom=b;if(l)d.style.borderLeft=l;if(rt)d.style.borderRight=rt;
    if(first[k]===i){const e=document.createElement("i");e.className="prb";e.textContent=p.rg[k].t;d.append(e);S.plab[H+W+k]=e}}
   S.cells[i]=d;g.append(d)}
  if(r<H){const d=document.createElement("div");d.className="pt pr";d.dataset.ln="r"+r;d.innerHTML="<b>"+p.rs[r]+"</b>";S.plab[r]=d;g.append(d)}}
 {const cn=document.createElement("div");cn.id="psum";cn.className="pt";cn.innerHTML="<b>Σ</b>";cn.title="Ingedrukt houden: de huidige totalen";g.append(cn)}
 S.cells.forEach((d,i)=>plusCls(d,i));S.pu.forEach((u,k)=>plusLab(k));paintPlusHint()}
function plusCls(d,i){const v=S.cur[i];d.classList.toggle("po",v===1);d.classList.toggle("px",v===2)}
/* De app rekent niet mee: een som krijgt alleen een streep als jij erop tikt. */
/* Een som krijgt vanzelf een streep als alle getallen in die rij/kolom/vlak omcirkeld of weggestreept zijn,
   en wordt rood als de omcirkelde getallen samen al méér zijn dan de som. Alles volgt de vakjes, dus ↶ werkt ook voor de streep. */
function plusLab(k){const e=S.plab[k];if(!e||!S.pu||!S.pu[k])return;const u=S.pu[k],p=S.p;let open=0,o=0;u.cells.forEach(i=>{const v=S.cur[i];if(v===0)open++;else if(v===1)o+=p.num[i]});
 e.classList.toggle("mk",!open);e.classList.toggle("over",o>u.t)}
function plusPaint(i,v){S.cur[i]=v;const d=S.cells[i];if(d){plusCls(d,i);popEl(d)}S.pof[i].forEach(plusLab)}
function plusEnter(j){const k=pd.path.indexOf(j);if(k>=0){while(pd.path.length>k+1){const c=pd.path.pop();if(pd.prev.has(c)){plusPaint(c,pd.prev.get(c));pd.prev.delete(c)}}return}
 pd.path.push(j);const o=S.cur[j];if(pd.mode==="add"){if(o===0)plusPaint(j,pd.val)}else if(o===pd.val)plusPaint(j,0);if(S.cur[j]!==o)pd.prev.set(j,o)}
function plusDown(e){const mb=mouseLR(e);if(mb===""||S.type!=="plus"||S.done||e._closed)return;e.preventDefault();if(pd&&pd.pid!==e.pointerId)plusEnd();
 if(e.target.closest&&e.target.closest("#psum")){if(mb==="r")return;plusPeek(true);return}
 const ck=e.target.closest&&e.target.closest("[data-ln]");if(ck){if(mb==="r")return;plusLine(ck.dataset.ln);return}
 S.ng=gridGeo(S.p.W);const i=gridHit(S.ng,e.clientX,e.clientY,S.p.W,S.p.H);if(i<0)return;e._nono=true;
 if(!S.start)S.start=Date.now();clearHint();begin();const old=S.cur[i],active=plusMode==="o"?1:2,val=mb==="r"?(active===1?2:1):active;
 pd={last:i,pid:e.pointerId,path:[i],prev:new Map(),val,mode:old===val?"del":"add"};
 const nv=old===val?0:val;plusPaint(i,nv);if(nv!==old)pd.prev.set(i,old)}
function plusMove(e){if(!pd||S.type!=="plus"||e.pointerId!==pd.pid)return;const W=S.p.W,i=gridHit(S.ng,e.clientX,e.clientY,W,S.p.H);if(i<0||i===pd.last)return;
 const r0=pd.last/W|0,c0=pd.last%W,r1=i/W|0,c1=i%W,n=Math.max(Math.abs(r1-r0),Math.abs(c1-c0));
 for(let k=1;k<=n;k++)plusEnter(Math.round(r0+(r1-r0)*k/n)*W+Math.round(c0+(c1-c0)*k/n));pd.last=i}
function plusUp(e){if(!pd||e.pointerId!==pd.pid)return;plusEnd()}
function plusEnd(){pd=null;if(S.type!=="plus")return;const ch=[];if(S.gs)S.cur.forEach((v,i)=>{if(v!==S.gs[i])ch.push(i)});plusAuto(ch);commit();check()}
addEventListener("pointerup",plusUp);addEventListener("pointercancel",plusUp);
/* Na een zet, alleen in de rijen, kolommen en vlakken van de vakjes die je net veranderde: klopt wat er nog staat precies
   (de som wordt lichter), dan worden de open getallen daar omcirkeld. Wegstrepen doet de app nooit voor je: dat rekenwerk is aan jou. */
function plusFix(k){const u=S.pu[k],p=S.p;let ns=0;const U=[];u.cells.forEach(i=>{const v=S.cur[i];if(v!==2)ns+=p.num[i];if(v===0)U.push(i)});
 if(!U.length||ns!==u.t)return false;U.forEach(i=>plusPaint(i,1));return true}
/* Pluszle vult niets vanzelf in: alles doe je met de hand. (plusFix wordt alleen nog niet gebruikt.) */
function plusAuto(ch){}
/* Tik op een som: er komt een schuine streep door (zelf bijhouden welke rij of kolom klaar is). Nog eens tikken haalt hem weg. */
/* Tik op een som: er komt een schuine streep door, en alle open getallen in die rij of kolom worden weggestreept
   (omcirkelde getallen blijven staan). Nog eens tikken haalt alleen de streep weg; ↶ zet de weggestreepte getallen terug. */
function plusLine(id){const p=S.p,W=p.W,H=p.H,k=id[0]==="r"?+id.slice(1):H+ +id.slice(1);clearHint();if(!S.start)S.start=Date.now();
 const cells=k<H?Array.from({length:W},(_,c)=>k*W+c):Array.from({length:H},(_,r)=>r*W+(k-H));
 if(!cells.some(i=>S.cur[i]===0))return;
 begin();cells.forEach(i=>{if(S.cur[i]===0)plusPaint(i,2)});commit();plusLab(k);persist();check()}
/* Σ ingedrukt houden: bij elke som staat dan wat er nu nog niet is weggestreept bij elkaar opgeteld. */
let plusPeekOn=false;
function plusPeek(on){if(S.type!=="plus"||!S.plab)return;if(on===plusPeekOn)return;plusPeekOn=on;const p=S.p,W=p.W,H=p.H;
 const cur=(cells)=>cells.reduce((a,i)=>a+(S.cur[i]===2?0:p.num[i]),0);
 S.plab.forEach((e,k)=>{if(!e)return;const b=k<H+W?e.querySelector("b"):e;if(!b)return;
  const t=k<H?p.rs[k]:k<H+W?p.cs[k-H]:p.rg[k-H-W].t,cells=k<H?Array.from({length:W},(_,c)=>k*W+c):k<H+W?Array.from({length:H},(_,r)=>r*W+(k-H)):p.rg[k-H-W].cells;
  if(on){const v=cur(cells);b.textContent=v;e.classList.add("live");e.classList.toggle("lok",v===t)}else{b.textContent=t;e.classList.remove("live","lok")}});
 const ps=$("#psum");if(ps)ps.classList.toggle("on",on)}
addEventListener("pointerup",()=>plusPeek(false));addEventListener("pointercancel",()=>plusPeek(false));
function paintPlusHint(){const h=S.hint;S.cells.forEach((d,i)=>{if(!d)return;d.classList.toggle("ht",!!(h&&h.cells.includes(i)));d.classList.toggle("hr",!!(h&&!h.cells.includes(i)&&h.why.includes(i)))});
 (S.plab||[]).forEach((e,k)=>{if(e)e.classList.toggle("hk",!!(h&&h.unit===k))})}
/* ---- Pluszle-hint: eerst fouten, dan de makkelijkste stap met uitleg waarom ---- */
const nwS=n=>["geen","één","twee","drie"][n]||String(n);
function plusWhyNot(vals,x){if(!vals.length)return x?` (er zijn geen andere open getallen meer)`:"";
 if(x>0&&vals.every(v=>v%2===0)&&x%2)return" (ze zijn allemaal even, dus samen ook altijd even)";
 if(x>0&&Math.min(...vals)>x)return` (ze zijn allemaal groter dan ${x})`;
 const sums=new Set([0]);vals.forEach(v=>[...sums].forEach(s=>sums.add(s+v)));let lo=-1,hi=1e9;sums.forEach(s=>{if(s<x&&s>lo)lo=s;if(s>x&&s<hi)hi=s});
 return lo>0&&hi<1e9?` (je komt wel op ${lo} of op ${hi}, maar nooit op ${x})`:""}
function plusHint(){plusSetup();const p=S.p,cur=S.cur,num=p.num;
 for(let i=0;i<cur.length;i++){
  if(cur[i]===1&&!p.sol[i])return{cells:[i],why:[],set:0,kind:"fix",btn:"Haal het rondje weg",text:`Let op: deze ${num[i]} is omcirkeld, maar hij moet juist weg. Hiermee loopt de puzzel vast. Haal het rondje weg en kijk opnieuw.`};
  if(cur[i]===2&&p.sol[i])return{cells:[i],why:[],set:0,kind:"fix",btn:"Zet hem terug",text:`Let op: deze ${num[i]} is weggestreept, maar hij moet blijven staan. Hiermee loopt de puzzel vast. Zet hem terug en kijk opnieuw.`}}
 let best=null;const consider=h=>{if(!best||h.sc<best.sc)best=h};
 const de=is=>lst(is.map(i=>"de "+num[i]));
 S.pu.forEach((u,k)=>{const L=plusLook(u,cur,num);if(!L.U.length||!L.n)return;
  const keep=[],rem=[];L.U.forEach((i,b)=>{if(L.and>>b&1)keep.push(i);else if(!(L.or>>b&1))rem.push(i)});if(!keep.length&&!rem.length)return;
  const nm=plusName(u),T=u.t,hasO=u.cells.some(i=>cur[i]===1),hasX=u.cells.some(i=>cur[i]===2),need=L.need,m=L.U.length;
  const og=hasO?"open getallen":hasX?"getallen die er nog staan":"getallen";
  const intro=hasO?`${cap(nm)} moet samen ${T} zijn. De omcirkelde getallen zijn samen al ${L.K}, dus de open getallen moeten samen nog ${need} maken.`:`${cap(nm)} moet samen ${T} zijn.`;
  const H={unit:k,why:u.cells};
  if(need===0){consider(Object.assign({sc:m/100,set:2,cells:L.U,btn:"Streep ze weg voor me",text:`De omcirkelde getallen in ${nm} zijn samen al ${T}: precies genoeg. Alle andere getallen in ${nm} moeten dus weg.`},H));return}
  if(need===L.s0){consider(Object.assign({sc:m/100,set:1,cells:L.U,btn:"Omcirkel ze voor me",text:hasO?`${intro} De open getallen zijn samen ook precies ${need}. Ze moeten dus allemaal blijven staan.`:`${cap(nm)} moet samen ${T} zijn, en de ${og} zijn samen precies ${T}. Ze moeten dus allemaal blijven staan.`},H));return}
  const big=L.U.filter(i=>num[i]>need);
  if(big.length){consider(Object.assign({sc:1+m/100,set:2,cells:big,btn:"Streep "+(big.length===1?"hem":"ze")+" weg voor me",text:`${intro} ${cap(de(big))} ${big.length===1?"is":"zijn"} groter dan ${need}, dus ${big.length===1?"die past":"die passen"} er niet meer in. Wegstrepen.`},H));return}
  const mk=keep.filter(i=>L.s0-num[i]<need).sort((a,b)=>num[b]-num[a]);
  if(mk.length){const i=mk[0];consider(Object.assign({sc:2+m/100,set:1,cells:[i],btn:"Omcirkel hem voor me",text:`${intro} Zonder de ${num[i]} zijn de andere ${og} samen maar ${L.s0-num[i]}, en dat is minder dan ${need}. De ${num[i]} moet dus blijven staan.`},H));return}
  /* Combinaties: bij weinig manieren noemen we ze allemaal, anders "stel dat ..." voor één getal. */
  const ways=new Map();for(let x=0;x<1<<m;x++)if(L.S[x]===need){const vs=[];L.U.forEach((i,b)=>{if(x>>b&1)vs.push(num[i])});vs.sort((a,b)=>b-a);ways.set(vs.length===1?"alleen de "+vs[0]:vs.join(" + "),1)}
  const vals=L.U.map(i=>num[i]).join(", "),wl=[...ways.keys()],nW=wl.length;
  if(nW<=3){const pre=`${intro} Met de ${og} (${vals}) kun je ${need} maar op ${nW===1?"één manier":nwS(nW)+" manieren"} maken: ${lst(wl)}.`;
   if(rem.length)consider(Object.assign({sc:3+m/100+nW/1000,set:2,cells:rem,btn:"Streep "+(rem.length===1?"hem":"ze")+" weg voor me",text:`${pre} ${cap(de(rem))} ${rem.length===1?"zit":"zitten"} ${nW===1?"daar niet in":nW===2?"in geen van beide":"in geen van de drie"}, dus ${rem.length===1?"die moet":"die moeten"} weg.`},H));
   else consider(Object.assign({sc:3+m/100+nW/1000,set:1,cells:keep,btn:"Omcirkel "+(keep.length===1?"hem":"ze")+" voor me",text:`${pre} ${cap(de(keep))} ${keep.length===1?"zit":"zitten"} ${nW===1?"daarin":nW===2?"in allebei":"in alle drie"}, dus ${keep.length===1?"die blijft":"die blijven"} staan.`},H));return}
  const i=rem.length?rem[0]:keep[0],v=num[i],oth=L.U.filter(j=>j!==i).map(j=>num[j]),ov=oth.join(", ");
  if(rem.length)consider(Object.assign({sc:3.5+m/100,set:2,cells:[i],btn:"Streep hem weg voor me",text:`${intro} Stel dat de ${v} blijft staan. Dan moeten de andere ${og} (${ov}) samen nog ${need-v} maken. Dat lukt met geen enkele combinatie${plusWhyNot(oth,need-v)}. De ${v} moet dus weg.`},H));
  else consider(Object.assign({sc:3.5+m/100,set:1,cells:[i],btn:"Omcirkel hem voor me",text:`${intro} Stel dat de ${v} weg zou gaan. Dan moeten de andere ${og} (${ov}) samen ${need} maken. Dat lukt met geen enkele combinatie${plusWhyNot(oth,need)}. De ${v} moet dus blijven staan.`},H))});
 if(!best){const j=p.sol.findIndex((v,i)=>cur[i]===0&&!v);if(j<0)return null;return{cells:[j],why:[],set:2,kind:"reveal",btn:"Streep hem weg voor me",text:`Hier kan ik geen korte redenering voor vinden. Deze ${num[j]} moet weg.`}}
 return Object.assign({kind:"tech"},best)}

/* ---- Ongedaan maken / opnieuw / reset ---- */
function ub(){setTimeout(()=>{try{syncA11y()}catch(e){}},0);ub0()}
function ub0(){const set=(id,v)=>{$(id).disabled=!!v};const off=!S.p||S.done;{const pb=$("#potb"),nw=$("#notewipe"),hasNotes=!!(S.nt&&Object.keys(S.nt).some(k=>S.nt[k]));if(pb){pb.style.display=NOTET.includes(S.type)?"":"none";pb.disabled=off;if(off&&potlood)setPotlood(false);pb.classList.toggle("on",potlood)}if(nw){nw.style.display=NOTET.includes(S.type)&&hasNotes?"":"none";nw.disabled=off}}
 const hx=S.type==="hex";$("#chk").style.display=["bin","star","nono","kak","mur","plus"].includes(S.type)?"":"none";set("#chk",off);$("#hintb").style.display=HINTT.includes(S.type)?"":"none";set("#hintb",off);for(const k of["#undo","#redo","#reset"])$(k).style.display=hx?"none":"";$("#tools").style.display=hx?"none":"";$("#mb").style.display=$("#mz").style.display=hx?"":"none";$("#hexbtns").style.display=hx?"":"none";$("#hexstat").style.display=hx?"":"none";$("#hexbtns").classList.toggle("mz",hexMode==="z");$("#hexstat").classList.toggle("mz",hexMode==="z");$("#nmode").style.display=S.type==="nono"?"":"none";const ncol=S.type==="nono"&&S.nv==="color";$("#nmode").classList.toggle("ncolor",ncol);$("#nf").style.display=ncol?"none":"";$("#nf").classList.toggle("on",!ncol&&nonoMode==="f");$("#nx").classList.toggle("on",nonoMode==="x");for(let q=1;q<=4;q++){const b=$("#nc"+q);b.style.display=ncol&&S.p&&q<=S.p.K?"flex":"none";b.classList.toggle("on",ncol&&nonoMode==="f"&&nonoColorMode===q)}$("#grid").classList.toggle("ncolor",ncol);$("#grid").classList.toggle("nx",S.type==="nono"&&nonoMode==="x");$("#grid").classList.toggle("nf",S.type==="nono"&&!ncol&&nonoMode==="f"&&!S.done);$("#pmode").style.display=S.type==="plus"?"":"none";$("#pxb").classList.toggle("on",plusMode==="x");$("#pob").classList.toggle("on",plusMode==="o");$("#grid").classList.toggle("pom",S.type==="plus"&&plusMode==="o"&&!S.done);$("#grid").classList.toggle("pxm",S.type==="plus"&&plusMode==="x"&&!S.done);$("#mb").classList.toggle("on",hexMode==="b");$("#mz").classList.toggle("on",hexMode==="z");$("#hexsvg").classList.toggle("mb",hexMode==="b");$("#hexw").classList.toggle("mz",hexMode==="z");$("#hexsvg").classList.toggle("mz",hexMode==="z");set("#undo",off||!S.hist||!S.hist.length);set("#redo",off||!S.redo||!S.redo.length);set("#reset",off)}
function begin(){S.gs=S.cur.slice()}
function commit(){if(S.gs&&S.gs.join()!==S.cur.join()){S.hist.push(S.gs);S.redo=[];pingBusy()}S.gs=null;ub();paintNotes()}
function initCur(){const p=S.p;return S.type==="bin"?p.giv.slice():Array(S.type==="kak"||S.type==="nono"||S.type==="plus"?p.W*p.H:p.N*p.N).fill(S.type==="mur"?-1:0)}
function undo(){if(S.done||!S.p||!S.hist.length)return;clearHint();
 if(S.type==="m24"){S.redo.push(S.tiles);S.tiles=S.hist.pop();S.a=-1;S.op="";rM24();return}
 const h=S.hist.pop();
 if(h&&h.notes){S.redo.push(h);noteApplyChanges(h.changes,false);paintNotes();persist();ub();return}
 if(h&&h.note){S.redo.push(h);noteApplyChanges([h],false);paintNotes();persist();ub();return}
 S.redo.push(S.cur.slice());S.cur=h;S.rd=S.cd=S.pick=null;render();persist()}
function redo(){if(S.done||!S.p||!S.redo.length)return;clearHint();
 if(S.type==="m24"){S.hist.push(S.tiles);S.tiles=S.redo.pop();S.a=-1;S.op="";rM24();return}
 const h=S.redo.pop();
 if(h&&h.notes){S.hist.push(h);noteApplyChanges(h.changes,true);paintNotes();persist();ub();return}
 if(h&&h.note){S.hist.push(h);noteApplyChanges([h],true);paintNotes();persist();ub();return}
 S.hist.push(S.cur.slice());S.cur=h;S.rd=S.cd=S.pick=null;render();check();persist()}
function reset(){if(S.done||!S.p)return;clearHint();
 if(S.type==="m24"){setRound();rM24();return}
 const z=initCur();if(z.join()===S.cur.join())return;
 S.hist.push(S.cur.slice());S.redo=[];S.cur=z;S.nt={};S.rd=S.cd=S.pick=null;S.sel=-1;render()}
$("#potb").onclick=()=>setPotlood(!potlood);$("#notewipe").onclick=clearAllNotes;$("#undo").onclick=undo;$("#redo").onclick=redo;$("#reset").onclick=reset;
/* Reset is op touchscreens makkelijk per ongeluk te raken. Bij echte voortgang moet je daarom twee keer tikken. */
let resetArm=0;
function disarmReset(){if(resetArm){clearTimeout(resetArm);resetArm=0}const b=$("#reset");if(!b)return;b.classList.remove("arm");const sp=b.querySelector("span");if(sp)sp.textContent="Reset"}
function safeReset(){if(S.done||!S.p)return;let changed=false;
 if(S.type!=="m24"&&S.cur){const z=initCur();changed=z.length===S.cur.length&&z.some((v,i)=>v!==S.cur[i])}
 changed=changed||!!(S.nt&&Object.keys(S.nt).length)||(S.type==="m24"&&!!(S.hist&&S.hist.length));
 if(!changed){reset();return}
 if(resetArm){disarmReset();reset();const m=$("#msg");m.classList.remove("good","warn");m.textContent="Bord opnieuw begonnen";setTimeout(()=>{if(m.textContent==="Bord opnieuw begonnen")m.textContent=""},1800);return}
 const b=$("#reset");b.classList.add("arm");const sp=b.querySelector("span");if(sp)sp.textContent="Nogmaals";const m=$("#msg");m.classList.remove("good");m.classList.add("warn");m.textContent="Nogmaals op Reset tikken om het bord te wissen";
 resetArm=setTimeout(()=>{resetArm=0;b.classList.remove("arm");if(sp)sp.textContent="Reset";if(m.textContent.includes("Nogmaals op Reset")){m.textContent="";m.classList.remove("warn")}},2600)}
$("#reset").onclick=safeReset;

/* ---- Maak 24 ---- */
function setRound(){S.tiles=S.p.rounds[S.r].map(v=>[v,1]);S.a=-1;S.op="";S.hist=[];S.redo=[]}
const tx=f=>f[1]===1?String(f[0]):f[0]+"/"+f[1];
function rM24(){const m=$("#m24");m.innerHTML="";ub();
 const h=document.createElement("div");h.className="mut";h.textContent=S.done?"Alle 5 rondes klaar!":"Ronde "+(S.r+1)+" van 5";m.append(h);
 if(S.done)return;
 const tl=document.createElement("div");tl.id="tl";
 S.tiles.forEach((f,i)=>{const b=document.createElement("button");b.textContent=tx(f);if(i===S.a)b.classList.add("on");b.onpointerdown=e=>{e.preventDefault();tileTap(i)};tl.append(b)});
 const ops=document.createElement("div");ops.id="ops";
 [["+","+"],["-","−"],["*","×"],["/","÷"]].forEach(([o,l])=>{const b=document.createElement("button");b.textContent=l;if(S.op===o)b.classList.add("on");b.onpointerdown=e=>{e.preventDefault();if(S.a>=0){S.op=S.op===o?"":o;rM24()}};ops.append(b)});
 m.append(tl,ops)}
function tileTap(i){if(S.done)return;if(!S.start)S.start=Date.now();
 if(S.a<0||!S.op){S.a=i;rM24();return}
 if(i===S.a){S.a=-1;S.op="";rM24();return}
 const z=ap(S.tiles[S.a],S.tiles[i],S.op);
 if(!z){$("#msg").textContent="Delen door 0 kan niet";return}
 $("#msg").textContent="";
 S.hist.push(S.tiles);S.redo=[];const a=S.a;S.tiles=S.tiles.filter((_,k)=>k!==a&&k!==i).concat([z]);S.a=-1;S.op="";
 if(S.tiles.length===1){
  if(z[0]===24&&z[1]===1){S.r++;if(S.r>=5){finish();rM24();return}setRound();$("#msg").textContent="Goed! Volgende ronde"}
  else{S.mist=(S.mist||0)+1;$("#msg").textContent="Dat is "+tx(z)+", geen 24. Probeer opnieuw.";S.tiles=S.hist[0];S.hist=[]}}
 rM24()}


/* ---- Potlood: kleine aantekeningen (Binair, Star Battle, Nonogram, Murdoku). Ze tellen niet mee en de app kijkt er niet naar. ---- */
let potlood=false;const MNX=1<<20;const NOTET=["bin","star","mur"];
function noteVal(i){return S.nt&&S.nt[i]||0}
function noteRaw(i,v){if(!S.nt)S.nt={};const old=noteVal(i);if(old===v)return null;if(v)S.nt[i]=v;else delete S.nt[i];return{i,from:old,to:v}}
function noteApplyChanges(changes,to){if(!S.nt)S.nt={};for(const c of changes){const v=to?c.to:c.from;if(v)S.nt[c.i]=v;else delete S.nt[c.i]}}
function noteSet(i,v){const c=noteRaw(i,v);if(!c)return;
 /* Eén tik blijft één undo-stap; een nieuwe sleepactie wordt hieronder als één groep bewaard. */
 S.hist.push({note:1,...c});S.redo=[];pingBusy();if(!S.start)S.start=Date.now();clearHint();paintNotes();persist();ub()}
function noteDragWrite(d,i,v){if(!d.nchanges)d.nchanges=new Map();const old=noteVal(i);if(old===v)return;let c=d.nchanges.get(i);if(!c){c={i,from:old,to:v};d.nchanges.set(i,c)}else c.to=v;noteRaw(i,v);paintNotes()}
function noteDragRestore(d,i){const c=d.nchanges&&d.nchanges.get(i);if(c){noteRaw(i,c.from);c.to=c.from}}
function noteFinish(d,group){const ch=d&&d.nchanges?[...d.nchanges.values()].filter(c=>c.from!==c.to):[];if(!ch.length){paintNotes();persist();ub();return}
 S.hist.push(group?{notes:1,changes:ch}:{note:1,...ch[0]});S.redo=[];pingBusy();if(!S.start)S.start=Date.now();clearHint();paintNotes();persist();ub()}
function clearAllNotes(){if(S.done||!S.p||!S.nt)return;const ch=Object.keys(S.nt).filter(k=>S.nt[k]).map(k=>({i:+k,from:S.nt[k],to:0}));if(!ch.length)return;S.hist.push({notes:1,changes:ch});S.redo=[];S.nt={};clearHint();paintNotes();persist();ub()}
function paintNotes(){if(!S.p||!S.nt)return;const t=S.type;
 if(t==="mur"){if(!S.mcells)return;const dark=isDark(),N=S.p.N,rc=Array(N).fill(0),cc=Array(N).fill(0);S.cur.forEach((v,i)=>{if(v>=0){rc[i/N|0]++;cc[i%N]++}});
  /* Aantekeningen in vakjes die vanzelf zijn afgekruist (rij of kolom van een geplaatst persoon) even verbergen; haal je die persoon weg, dan komen ze terug. */
  S.mcells.forEach((d,i)=>{let e=d.querySelector(".mnt");const v=noteVal(i),show=v&&S.cur[i]===-1&&(!autoCrossOn()||(!rc[i/N|0]&&!cc[i%N]));
   if(!show){if(e)e.remove();return}if(!e){e=document.createElement("span");e.className="mnt";d.append(e)}
   e.classList.toggle("nxo",v===MNX);const h=(v&MNX?'<i class="mnx">×</i>':"")+S.p.ppl.map((nm,s)=>v&(1<<s)?`<b style="color:${s===S.p.V?"var(--fg)":`hsl(${MHUE[s]},62%,${dark?"62%":"40%"})`}">${nm[0]}</b>`:"").join("");if(e.innerHTML!==h)e.innerHTML=h});return}
 if(!["bin","star","nono"].includes(t)||!S.cells)return;
 S.cells.forEach((d,i)=>{if(!d)return;let e=d.querySelector(".nt");const raw=noteVal(i),v=t==="star"?noteDisp(i):raw;
  const empty=t==="bin"?S.cur[i]<0&&S.p.giv[i]<0:t==="star"?disp(i)===0:S.cur[i]===0;
  if(!v||!empty||S.done){if(e)e.remove();return}
  if(!e){e=document.createElement("span");e.className="nt";d.append(e)}
  const h=t==="bin"?(v===1?SX:SO):"";if(e.dataset.v!==String(v)||e.dataset.raw!==String(raw)){e.dataset.v=v;e.dataset.raw=raw;e.innerHTML=h;e.classList.toggle("dot",t==="nono");e.classList.toggle("nx",t==="star"&&v===1);e.classList.toggle("ns",t==="star"&&v===2)}})}
/* Lang indrukken (ca. 0,4 s, zonder te bewegen) op een vakje: de gewone zet wordt teruggedraaid en er komt een aantekening. */
let LP=null;
function lpStart(e,fire){lpCancel();LP={pid:e.pointerId,x:e.clientX,y:e.clientY,t:setTimeout(()=>{const l=LP;LP=null;if(l&&!S.done)fire()},400)}}
function lpCancel(){if(LP){clearTimeout(LP.t);LP=null}}
addEventListener("pointermove",e=>{if(LP&&e.pointerId===LP.pid&&Math.hypot(e.clientX-LP.x,e.clientY-LP.y)>10)lpCancel()},true);
addEventListener("pointerup",e=>{if(LP&&e.pointerId===LP.pid)lpCancel()},true);addEventListener("pointercancel",()=>lpCancel(),true);
function lpNote(i){const t=S.type;
 if(t==="bin"){if(S.p.giv[i]<0&&S.cur[i]<0)noteSet(i,S.nt[i]===1?2:S.nt[i]===2?0:1)}
 else if(t==="star"){if(disp(i)===0){const v=noteDisp(i);noteSet(i,v===0?1:v===1?2:0)}}
 else if(t==="nono"){if(S.cur[i]===0)noteSet(i,S.nt[i]?0:1)}
 else if(t==="mur"){paintMur();if(S.cur[i]!==-1||murBlocked(S.p,i))return;if(!(S.ms>=0)){const m=$("#msg");m.textContent="Kies eerst iemand onderaan voor een aantekening.";setTimeout(()=>{if(m.textContent.startsWith("Kies eerst"))m.textContent=""},2000);return}noteSet(i,(S.nt[i]||0)^(1<<S.ms))}
 const d=t==="mur"?S.mcells&&S.mcells[i]:S.cells&&S.cells[i];if(d)popEl(d)}
function setPotlood(on){potlood=!!on;setTimeout(()=>{try{syncA11y()}catch(e){}},0);const b=$("#potb");if(b)b.classList.toggle("on",potlood);document.body.classList.toggle("potlood",potlood)}
/* ---- Murdoku ---- */const MHUE=[350,28,140,205,265,48,175];
const solCur=p=>{const c=Array(p.N*p.N).fill(-1);p.sol.forEach((cell,s)=>{c[cell]=s});return c};
const murM=p=>({N:p.N,V:p.V,reg:p.reg,obj:p.obj.map(t=>t?{t}:null)});
const murTok=(p,s,dark)=>s===p.V?`<span class="tok vt">${murTag(p,s)}</span>`:`<span class="tok" style="background:hsl(${MHUE[s]},62%,${dark?"50%":"45%"})">${murTag(p,s)}</span>`;
const murBlocked=(p,i)=>!!p.obj[i]&&!MOBJ[p.obj[i]].seat;
let MURFIX=0,MURMS=0;
function rMur(){if(S._murMS){MURFIX=0;MURMS=S._murMS;rMur0();return}MURFIX=0;MURMS=0;rMur0();if(!PHONE&&$("#stage").clientWidth>=640){const ov=$("#mur").getBoundingClientRect().bottom-(innerHeight-12);if(ov>2){MURFIX=Math.ceil(ov/S.p.N)+1;MURMS=0;rMur0()}}S._murMS=MURMS}
function rMur0(){const p=S.p,N=p.N,m=$("#mur");m.innerHTML="";S.mcells=[];const dark=isDark();
 const top=m.getBoundingClientRect().top+(window.scrollY||0),sw=$("#stage").clientWidth,wide=sw>=640;
 const pbh=$("#pbot")?$("#pbot").offsetHeight:0,availH=innerHeight-(m.getBoundingClientRect().top)-pbh-HINTPAD;
 const ms=MURMS|| (PHONE?Math.max(HINTPAD?20:30,Math.min(Math.floor((sw-8)/N),Math.floor(HINTPAD?(availH-14)/N:availH*.55/N))):Math.max(40,Math.min(100,wide?Math.min(Math.floor((availBot()+14-top-(NIEUW?165:150))/N)-MURFIX,Math.floor((sw-330)/N)):Math.floor((sw-8)/N))));MURMS=ms;
 const main=document.createElement("div");main.id="mmain";const g=document.createElement("div");g.id="mgrid";g.style.gridTemplateColumns=`repeat(${N},${ms}px)`;g.style.setProperty("--ms",ms+"px");
 const first=[];{/* Naam van de ruimte op een plek waar hij past: het eerste vakje met genoeg ruimte naar rechts (anders het breedste stuk). */
  const fs=Math.max(8,ms*.14),runOf=i=>{let n=1;while(i%N+n<N&&p.reg[i+n]===p.reg[i])n++;return n},best=[];
  p.reg.forEach((k,i)=>{const need=Math.ceil((p.rooms[k].length*fs*.75+10)/ms),run=runOf(i),sc=Math.min(run,need);if(best[k]===undefined||sc>best[k]){best[k]=sc;first[k]=i}})}
 const thick="2.5px solid var(--fg)",thin="1px solid color-mix(in srgb,var(--fg) 16%,transparent)",edge=(i,j)=>p.reg[j]!==p.reg[i]?thick:thin;
 for(let i=0;i<N*N;i++){const k=p.reg[i],r=i/N|0,c=i%N,d=document.createElement("div");d.className="mc";d.dataset.i=i;
  d.style.background=`hsl(${HUES[k]},${dark?"30%,30%":"50%,87%"})`;
  d.style.borderTop=r===0?thick:edge(i,i-N);d.style.borderBottom=r===N-1?thick:edge(i,i+N);d.style.borderLeft=c===0?thick:edge(i,i-1);d.style.borderRight=c===N-1?thick:edge(i,i+1);
  if(first[k]===i){const l=document.createElement("span");l.className="rl";l.textContent=p.rooms[k];let run=1;while(c+run<N&&p.reg[i+run]===k)run++;l.style.maxWidth=(run*ms-8)+"px";l.style.overflow="hidden";d.append(l)}
  const t=p.obj[i];if(t){const e=document.createElement("span");e.className="ob"+(MOBJ[t].seat?" seat":" blk");e.textContent=MOBJ[t].e;e.title=MOBJ[t].n;d.append(e);if(!MOBJ[t].seat)d.classList.add("blk")}
  const x=document.createElement("span");x.className="mx";x.textContent="×";d.append(x);
  const sl=document.createElement("span");sl.className="slot";d.append(sl);S.mcells[i]=d;g.append(d)}
 main.append(g);const pal=document.createElement("div");pal.id="mpal";
 p.ppl.forEach((nm,s)=>{const b=document.createElement("button");b.className="pb";b.dataset.s=s;b.innerHTML=`${murTok(p,s,dark)}<b>${nm}</b>${s===p.V?" 💀":""}`;pal.append(b)});
 {const b=document.createElement("button");b.className="pb pbx";b.dataset.s="x";b.innerHTML=`<span class="tok xt">✕</span><b>Kruisje</b>`;pal.append(b)}
 pal.style.maxWidth=Math.max(ms*N,300)+"px";main.append(pal);
 const used=[...new Set(p.obj.filter(Boolean))],st=used.filter(t=>MOBJ[t].seat),bl=used.filter(t=>!MOBJ[t].seat);
 const lg=document.createElement("div");lg.id="mleg";lg.style.maxWidth=Math.max(ms*N,300)+"px";
 lg.innerHTML=(st.length?`Op ${st.map(t=>MOBJ[t].e).join(" ")} kun je zitten. `:"")+(bl.length?`Op ${bl.map(t=>MOBJ[t].e).join(" ")} kan niemand staan. `:"")+(PHONE?"":"<b>Naast</b> = recht ernaast in dezelfde ruimte (niet schuin, niet door een muur).");
 main.append(lg);m.append(main);
 const cl=document.createElement("div");cl.id="mclues";cl.innerHTML="<h2>Wie was waar?</h2>";const ol=document.createElement("ul");
 p.ppl.forEach((nm,s)=>{const li=document.createElement("li");li.dataset.c=s;const txt=s===p.V?"<b>Het slachtoffer.</b> Was alleen met de moordenaar.":p.cardTxt[s];
  li.innerHTML=`${murTok(p,s,dark)}<span><b>${nm}:</b> ${txt}</span>`;ol.append(li)});cl.append(ol);
 const acc=document.createElement("div");acc.id="macc";cl.append(acc);m.append(cl);
 g.onpointerdown=e=>{const d=e.target.closest&&e.target.closest("[data-i]");if(!d)return;const mb=mouseLR(e);if(mb==="")return;e.preventDefault();const i=+d.dataset.i,oldMode=S.mxm;
  if(mb==="r")S.mxm=!oldMode;
  const snap={cur:S.cur.slice(),ms:S.ms,h:S.hist.length,r:S.redo.slice()};murTap(i);
  if(mb!==null){S.mxm=oldMode;paintMur();return}
  if(!potlood&&!S.mxm&&!S.done)lpStart(e,()=>{if(S.done)return;S.cur=snap.cur;S.ms=snap.ms;S.hist.length=snap.h;S.redo=snap.r;ub();lpNote(i)})};
 pal.onpointerdown=e=>{const b=e.target.closest&&e.target.closest("[data-s]");if(!b||S.done)return;e.preventDefault();if(b.dataset.s==="x"){S.mxm=!S.mxm}else{const s=+b.dataset.s;S.mxm=false;S.ms=S.ms===s&&!S.mxm?-1:s}paintMur()};
 ol.onpointerdown=e=>{const li=e.target.closest&&e.target.closest("[data-c]");if(!li)return;e.preventDefault();const c=+li.dataset.c;if(S.str.has(c))S.str.delete(c);else S.str.add(c);paintMur();persist()};
 const fit=()=>{const t=cl.getBoundingClientRect().top;if(PHONE)cl.style.maxHeight=Math.max(120,innerHeight-t-pbh-HINTPAD-8)+"px";else if(wide)cl.style.maxHeight=Math.max(260,availBot()+14-t-14)+"px"};fit();
 paintMur()}
function murNext(from){const N=S.p.N,pl=new Set(S.cur.filter(v=>v>=0));for(let k=1;k<=N;k++){const s=(from+k)%N;if(!pl.has(s))return s}return -1}
function murTap(i){if(S.done||!S.mcells)return;const v=S.cur[i];
 /* Potlood: kleine letter van de gekozen persoon in het vakje (nog eens tikken haalt hem weg). */
 if(potlood){if(S.mxm){if(v===-1&&!murBlocked(S.p,i))noteSet(i,(S.nt[i]||0)^MNX);return}
  if(v!==-1||murBlocked(S.p,i)||!(S.ms>=0)){const m=$("#msg");if(!(S.ms>=0)||S.mxm){m.textContent="Kies eerst iemand of ✕ onderaan voor een aantekening.";setTimeout(()=>{if(m.textContent.startsWith("Kies eerst"))m.textContent=""},2000)}return}
  noteSet(i,(S.nt[i]||0)^(1<<S.ms));return}
 if(murBlocked(S.p,i)&&v<0&&!S.mxm){const m=$("#msg");m.textContent=`Op een ${MOBJ[S.p.obj[i]].n} kan niemand staan.`;setTimeout(()=>{if(!S.done&&m.textContent.startsWith("Op een"))m.textContent=""},2000);return}
 /* Kruisjesstand: een kruisje zetten of weghalen (niet op iemand). */
 if(S.mxm){if(v>=0||murBlocked(S.p,i))return;begin();S.cur[i]=v===-2?-1:-2;if(!S.start)S.start=Date.now();commit();paintMur();persist();return}
 /* Tik op iemand op het bord: weghalen, en die persoon is meteen gekozen om ergens anders neer te zetten. */
 if(v>=0){begin();S.cur[i]=-1;S.ms=v;commit();paintMur();persist();return}
 if(S.ms<0||S.ms===undefined)return;
 begin();
 {const old=S.cur.indexOf(S.ms);if(old>=0)S.cur[old]=-1;S.cur[i]=S.ms;if(!S.start)S.start=Date.now();S.ms=murNext(S.ms)}
 commit();paintMur();persist()}
function paintMur(){const p=S.p,N=p.N,dark=isDark();if(!S.mcells||!S.mcells.length)return;
 const rc=Array(N).fill(0),cc=Array(N).fill(0),placed=new Set();S.cur.forEach((v,i)=>{if(v>=0){rc[i/N|0]++;cc[i%N]++;placed.add(v)}});
 const H=S.hint&&S.type==="mur"?S.hint:null;
 S.cur.forEach((v,i)=>{const d=S.mcells[i],sl=d.querySelector(".slot"),was=d.dataset.v||"",nv=v>=0?""+v:"";
  if(was!==nv){d.dataset.v=nv;sl.innerHTML=v>=0?murTok(p,v,dark):"";if(v>=0)popEl(sl)}
  d.classList.toggle("on",v>=0);d.classList.toggle("xm",v===-2);d.classList.toggle("xx",v<0&&!murBlocked(p,i)&&(v===-2||(autoCrossOn()&&(rc[i/N|0]>0||cc[i%N]>0))));
  d.classList.toggle("conf",v>=0&&(rc[i/N|0]>1||cc[i%N]>1));d.classList.toggle("hr",!!H&&H.why.includes(i));d.classList.toggle("ht",!!H&&H.cells.includes(i))});
 document.querySelectorAll("#mpal .pb").forEach(b=>{if(b.dataset.s==="x"){b.classList.toggle("on",!!S.mxm&&!S.done);return}const s=+b.dataset.s;b.classList.toggle("on",S.ms===s&&!S.mxm&&!S.done);b.classList.toggle("placed",placed.has(s))});
 const mg=$("#mgrid");if(mg){mg.classList.toggle("mxmode",!!S.mxm&&!S.done);mg.classList.toggle("pmode",!S.mxm&&!S.done)}
 document.querySelectorAll("#mclues li").forEach(li=>{const c=+li.dataset.c;li.classList.toggle("str",S.str.has(c));li.classList.toggle("hr",!!H&&!!H.cards&&H.cards.includes(c))});
 paintNotes();const acc=$("#macc"),allOk=p.sol.every((cell,s)=>S.cur[cell]===s);
 if(S.done){acc.innerHTML=`<div class="mkill">Opgelost! De moordenaar was <b>${p.ppl[p.killer]}</b>: alleen met ${p.ppl[p.V]} ${p.arts[p.reg[p.sol[p.V]]]}.</div>`;return}
 if(allOk){if(!acc.dataset.on){acc.dataset.on="1";acc.innerHTML=`<div class="mq"><b>Iedereen staat op de goede plek.</b><br>Wie is de moordenaar?</div><div class="mbtns"></div>`;
   p.ppl.forEach((nm,s)=>{if(s===p.V)return;const b=document.createElement("button");b.innerHTML=`${murTok(p,s,dark)}${nm}`;
    b.onpointerdown=e=>{e.preventDefault();murAccuse(s)};acc.querySelector(".mbtns").append(b)});if(PHONE)setTimeout(()=>{try{acc.scrollIntoView({block:"nearest"})}catch(e){}},50)}}
 else{delete acc.dataset.on;acc.innerHTML=""}}
function murAccuse(s){if(S.done)return;const p=S.p;if(s===p.killer){finish();return}
 S.mist++;const m=$("#msg");m.textContent=p.ppl[s]+" was het niet!";setTimeout(()=>{if(!S.done)m.textContent=""},2500)}
/* Murdoku-hint: eerst foute plaatsingen, dan met dezelfde oplosser als de generator (eerst de makkelijkste regels)
   de eerste persoon die nog maar op één plek kan staan, met de redenen erbij. */
function murHint(){const p=S.p,N=p.N,V=p.V,M=murM(p),nm=s=>p.ppl[s],cell=i=>`rij ${(i/N|0)+1}, kolom ${i%N+1}`,LN=["rij","kolom"],room=k=>p.arts[k];
 for(let i=0;i<N*N;i++){const v=S.cur[i];if(v===-2&&p.sol.includes(i)){const w=p.sol.indexOf(i);return{kind:"fix",cells:[i],cards:[w],set:-1,text:`Hier staat een kruisje, maar hier ${w===V?"lag":"stond"} wel iemand. Kijk nog eens waarom je dit vakje had weggestreept.`,btn:"Haal het kruisje weg"}}if(v>=0&&p.sol[v]!==i)return{kind:"fix",cells:[i],cards:[v],set:-1,text:`${nm(v)} staat hier niet goed. Kijk nog eens naar ${v===V?"het slachtoffer":"het kaartje van "+nm(v)}.`,btn:`Haal ${nm(v)} hier weg`}}
 const fix=Array(N).fill(-1);S.cur.forEach((v,i)=>{if(v>=0)fix[v]=i});
 if(fix.every(x=>x>=0)){const k=p.reg[p.sol[V]];return{kind:"kill",cells:[p.sol[V]],cards:[V],set:null,text:`Iedereen staat goed. ${nm(V)} (het slachtoffer) lag ${room(k)}. Wie stond daar als enige bij? Dat is de moordenaar.`,btn:"Oké"}}
 const list=a=>a.length>1?a.slice(0,-1).join(", ")+" en "+a[a.length-1]:a[0];
 for(const st of[1,2,3,4]){const r=murSolve(M,p.cd,{st,fix,why:true});if(!r)break;
  const hit=r.ord.find(s=>fix[s]<0&&r.D[s].length===1&&r.D[s][0]===p.sol[s]);if(hit==null)continue;
  const at=p.sol[hit],used=[...r.U[hit]],cards=[...new Set([hit,...used.map(j=>p.cd[j].p)])];
  const byCl=(...q)=>{const j=new Set();q.forEach(o=>r.U[o].forEach(x=>j.add(x)));const a=[...new Set([...j].map(x=>nm(p.cd[x].p)))];return a.length?` (zie ${a.length>1?"de kaartjes van ":"het kaartje van "}${list(a)})`:""};
  const occ=[],steps=[];
  for(const w of r.W[hit]){const f=w.split("|");const c=f[0];
   if(c[0]==="@")occ.push(+c.slice(1));
   else if(c[0]==="#"){const cd=p.cd[+c.slice(1)];let t=`${nm(cd.p)}: "${cd.text}"`;if(f[1]!=null){const v=+f[1],cs=f[2].split(",").map(Number);t+=` (${nm(v)} kan alleen nog op ${cs.map(cell).join(" of ")} staan)`}steps.push(t)}
   else if(c==="V2")steps.push(`De moordenaar was alleen met het slachtoffer. Dus het slachtoffer lag niet in een ruimte waar al twee anderen moeten staan.`);
   else if(c==="V0")steps.push(`De moordenaar was alleen met het slachtoffer. Dus het slachtoffer lag niet in een ruimte waar niemand anders kan staan.`);
   else if(c==="V1")steps.push(`Het slachtoffer lag ${room(+f[1])}, en ${nm(hit)} is de enige die daar nog kan staan. Iemand moet daar met het slachtoffer zijn geweest.`);
   else if(c==="V3")steps.push(`Het slachtoffer lag ${room(+f[1])}, samen met ${nm(+f[2])}. De moordenaar was daar alleen met het slachtoffer, dus verder stond daar niemand.`);
   else if(c==="H")steps.push(`In ${LN[+f[1]]} ${+f[2]+1} moet iemand staan, en alleen ${nm(hit)} kan daar nog.`);
   else if(c==="P"){const a=+f[4],b=+f[5];steps.push(`${nm(a)} en ${nm(b)} kunnen samen alleen in ${LN[+f[1]]} ${+f[2]+1} en ${+f[3]+1} staan${byCl(a,b)}. Daar is dus geen plek meer voor anderen.`)}
   else if(c==="L"){steps.push(`In ${LN[+f[1]]} ${+f[2]+1} en ${+f[3]+1} moeten twee mensen staan, en alleen ${nm(+f[4])} en ${nm(+f[5])} kunnen daar nog komen.`)}}
  if(occ.length){const t=occ.map(o=>{const x=fix[o]>=0?fix[o]:r.D[o][0];return`${nm(o)} (rij ${(x/N|0)+1}, kolom ${x%N+1}${fix[o]>=0?"":", dat volgt uit de aanwijzingen"})`});steps.unshift(`Deze rijen en kolommen zijn al bezet: ${list(t)}. Daar kan ${nm(hit)} niet meer staan.`)}
  const bk=[...Array(N*N).keys()].filter(i=>!murFree(i,M)&&((i/N|0)===(at/N|0)||i%N===at%N||p.reg[i]===p.reg[at]));if(bk.length&&steps.length<7)steps.push(`Op ${[...new Set(bk.map(i=>p.obj[i]))].map(t=>MOBJ[t].e).join(" ")} kan niemand staan.`);
  return{kind:"set",cells:[at],set:hit,cards,proof:{W:r.W,fix},intro:`${nm(hit)} kan nog maar op één plek staan. Zo kom je daarop:`,steps:steps.slice(0,7),outro:`Dus ${nm(hit)} ${hit===V?"lag":"stond"} op ${cell(at)}.`,text:`${nm(hit)} staat op ${cell(at)}.`,btn:`Zet ${nm(hit)} hier voor me`}}
 const s=fix.findIndex(x=>x<0);return{kind:"set",cells:[p.sol[s]],cards:[s],set:s,text:`Dit is een lastige stap. ${nm(s)} staat op ${cell(p.sol[s])}.`,btn:`Zet ${nm(s)} hier voor me`}}
/* ---- Foutloos en zonder hint; elkaars voortgang ---- */
const MGV="m4",PGV="p2";const HINTT=["star","bin","nono","hex","plus","mur"],BASEF=["name","group","date","type","secs","uid"];
let XS={};try{XS=JSON.parse(lsGet("pdx")||"{}")}catch(e){XS={}}
const xsSave=()=>lsSet("pdx",JSON.stringify(XS));
let OLDRULES=false;
let PROFILE_NAMES={},GROUP_NAME=(window.PD_SETUP&&window.PD_SETUP.groupName)||"Puzzelsukkels",GROUP_MEMBERS=[],GROUP_INFO={};
const uidOf=p=>{const v=String(p||"");if(GROUP_MEMBERS.some(x=>x&&x.playerId===v))return v;const m=GROUP_MEMBERS.find(x=>x&&x.displayName===v&&x.playerId);if(m)return m.playerId;if(/^u-[a-z0-9-]+$/i.test(v))return v;return"u-"+v.toLowerCase().replace(/[^a-z0-9]/g,"")};
const memberByUid=u=>GROUP_MEMBERS.find(x=>x&&x.playerId===u)||null;
const playerName=p=>{const u=uidOf(p),m=memberByUid(u);return PROFILE_NAMES[u]||(m&&m.displayName)||SET.players.find(x=>uidOf(x)===u)||String(p||"Speler")};
const playerNameUid=(u,fallback)=>PROFILE_NAMES[u]||(memberByUid(u)&&memberByUid(u).displayName)||fallback||SET.players.find(p=>uidOf(p)===u)||"Speler";
const groupPlayers=()=>{const gid=($("#group")&&$("#group").value)||legacyGroup(),members=GROUP_MEMBERS.filter(x=>x&&x.playerId&&(!gid||!x.groupId||x.groupId===gid));if(members.length)return[...new Set(members.map(x=>x.playerId))];return SET.players.map(uidOf)};
const pIdx=r=>{const a=groupPlayers(),k=a.indexOf(r.uid);return k<0?99:k};
const othersTxt=()=>{const o=groupPlayers().filter(p=>uidOf(p)!==uid).map(playerName);return o.length===1?o[0]:"de anderen"};
const badges=(r,t)=>{t=String(t).split(".")[0];const a=[];if(r.mist===0)a.push("🎯");if(HINTT.includes(t)&&r.hints===0)a.push("💡");return a.join(" ")};
const badgeLong=(r,t)=>{t=String(t).split(".")[0];const a=[];if(r.mist===0)a.push("🎯 foutloos");else if(r.mist>0)a.push(r.mist===1?"1 fout gezien":r.mist+" fouten gezien");
 if(HINTT.includes(t)){if(r.hints===0)a.push("💡 zonder hint");else if(r.hints>0)a.push(hintSummary(r))}return a.join(" · ")};
const quickBadges=(r,t)=>{if(!r)return"";t=String(t).split(".")[0];const a=[];if(r.mist!=null)a.push(r.mist===0?'<span class="rq good" title="Foutloos">🎯</span>':'<span class="rq" title="'+r.mist+(r.mist===1?" fout":" fouten")+'">❌ '+r.mist+'</span>');if(HINTT.includes(t)&&r.hints!=null)a.push(r.hints===0?'<span class="rq good" title="Zonder hint">💡</span>':'<span class="rq" title="'+hintSummary(r)+'">💡 '+r.hints+'</span>');return a.join("")};
function ownDayResult(date,t){const ty=t+sfx(dagLv(t,date)),g=($("#group").value||"").trim().toLowerCase(),sync=lastRows.find(x=>x.uid===uid&&x.date===date&&x.type===ty&&(x.group||"").toLowerCase()===g);let r=localDoneInGroup(date+ty,g)?myRow(date,ty):sync?Object.assign({},sync):null;if(r&&sync){if(r.mist==null&&sync.mist!=null)r.mist=sync.mist;if(r.hints==null&&sync.hints!=null)r.hints=sync.hints;if(!r.hintSteps&&sync.hintSteps)r.hintSteps=sync.hintSteps;if(!r.secs&&sync.secs)r.secs=sync.secs}if(r){r.type=ty;r.secs=r.secs||store[date+ty]||0}return r}
function myRow(date,type){const x=XS[date+type]||{},r={name:$("#name").value.trim()||"Speler",group:$("#group").value.trim(),date,type,secs:store[date+type]||1,uid};
 if(x.mist!=null)r.mist=x.mist;if(x.hints!=null)r.hints=x.hints;if(x.hintSteps)r.hintSteps=x.hintSteps;return r}
function dbSave(row){if(!window.PD_DB)return Promise.resolve();
 return window.PD_DB.save(row).catch(e=>{const compatible=Object.assign({},row);delete compatible.hintSteps;
 return window.PD_DB.save(compatible).catch(()=>{const b={};BASEF.forEach(k=>b[k]=row[k]);OLDRULES=true;board(lastRows);return window.PD_DB.save(b)})})}
function resRow(r,td){if(r.uid===uid&&XS[r.date+r.type]){const x=XS[r.date+r.type];r=Object.assign({},r,{mist:x.mist!=null?x.mist:r.mist,hints:x.hints!=null?x.hints:r.hints})}
 const d=document.createElement("div");d.className="row";const a=document.createElement("span"),b=document.createElement("span");a.textContent=playerNameUid(r.uid,r.name)+" ✓ "+badges(r,r.type);b.className="mut";b.textContent=TSHOW?fmt(r.secs):"";d.append(a,b);return d}
/* Puzzel van de dag: elke dag één vaste soort, voor iedereen dezelfde. De andere dagpuzzels kunnen, maar hoeven niet. */
const FEATORD=["star","bin","mur","nono","plus","hex"];
function featOf(ds){const L=FEATORD.filter(t=>TYPES[t]);const[y,m,d]=ds.split("-").map(Number),n=Math.round((Date.UTC(y,m-1,d)-Date.UTC(2026,0,5))/864e5);return L[((n%L.length)+L.length)%L.length]}
function updTabs(){const td=dstr(),ft=featOf(td);
 document.querySelectorAll("#tabs button").forEach(b=>{const t=b.dataset.t,ty=t+sfx(lvOf(t));
  let st=b.querySelector(".tfeat");if(!st){st=document.createElement("i");st.className="tfeat";st.textContent="⭐";st.title="Puzzel van de dag";b.append(st)}st.hidden=t!==ft;
  let ok=b.querySelector(".tdone");if(!ok){ok=document.createElement("span");ok.className="tdone";ok.textContent="✓";b.append(ok)}ok.hidden=!myDone(td,t)})}
function toggleSide(on){const sd=$("#side");if(sd)sd.classList.toggle("open",on)}
/* Korte opgelost-kaart: hoe het ging en wat de ander van deze puzzel heeft. Verdwijnt vanzelf of met een tik. */
let finT=0;
function showFin(date,type){const f=$("#fin"),me=XS[date+type]||{},t=type.split(".")[0],lv=+(type.split(".")[1]||2),ot=othersTxt(),g=$("#group").value.trim().toLowerCase();
 f.innerHTML="";const x=document.createElement("button");x.className="hx";x.textContent="✕";x.setAttribute("aria-label","Sluiten");x.onclick=()=>{f.hidden=true};f.append(x);
 const h=document.createElement("div");h.className="ft";h.textContent="Opgelost! 🎉";f.append(h);
 const sub=document.createElement("div");sub.className="mut";sub.textContent=TYPES[t]+(LVN[t]?" · "+lvLabel(lv):"")+" · "+dnl(date)+(isWk(date)?" · weekend 💪":"");f.append(sub);picLine(f);
 const bl=badgeLong(me,t);if(bl){const b=document.createElement("div");b.className="fb";b.textContent=bl;f.append(b)}
 const oth=lastRows.filter(r=>r.uid!==uid&&(r.group||"").toLowerCase()===g&&r.date===date&&r.type===type),o=document.createElement("div");o.className="fo";
 if(oth.length)o.textContent=oth.map(r=>r.name+" had hem ook af "+badges(r,type)).join(", ");
 else{const ol=lastRows.filter(r=>r.uid!==uid&&(r.group||"").toLowerCase()===g&&r.date===date&&r.type!==type&&r.type.split(".")[0]===t);
  o.textContent=ol.length?ol.map(r=>r.name+" deed vandaag "+lvLabel(+(r.type.split(".")[1]||2))).join(", ")+".":ot+" heeft deze puzzel nog niet af."}
 f.append(o);
 if(OLDRULES){const w=document.createElement("div");w.className="mut sm";w.style.marginTop="6px";w.textContent="Let op: 🎯/💡 worden nog niet gedeeld. Werk in Firebase de regels bij (stappenplan, stap 3).";f.append(w)}
 finActs(f,false,date,t);finShow(f)}
function showDayResult(date,t){const r=ownDayResult(date,t);if(!r)return;const f=$("#fin"),ty=r.type||t+sfx(dagLv(t,date)),lv=+(ty.split(".")[1]||dagLv(t,date));f.innerHTML="";const x=document.createElement("button");x.className="hx";x.textContent="✕";x.setAttribute("aria-label","Sluiten");x.onclick=()=>{f.hidden=true};f.append(x);const h=document.createElement("div");h.className="ft";h.textContent="Klaar ✓";f.append(h);const sub=document.createElement("div");sub.className="mut";sub.textContent=TYPES[t]+(t==="nono"?" · "+(nonoDayVariant(date)==="color"?"Kleur":"Klassiek"):"")+(LVN[t]?" · "+lvLabel(lv):"")+" · "+dnl(date);f.append(sub);const rs=document.createElement("div");rs.className="fb fres";rs.innerHTML="<b>⏱ "+fmt(r.secs||0)+"</b>"+quickBadges(r,t);f.append(rs);const bl=badgeLong(r,t);if(bl){const b=document.createElement("div");b.className="mut";b.style.marginTop="6px";b.textContent=bl;f.append(b)}const a=document.createElement("div");a.className="fa fnext";const b=document.createElement("button");b.className="pr";b.textContent="Puzzel bekijken";b.onclick=()=>{f.hidden=true;load(t,false,false,date)};a.append(b);f.append(a);finShow(f)}
function picLine(f){if(S.type==="nono"&&S.p&&S.p.pic){const d=document.createElement("div");d.className="fb";d.textContent="🖼️ Het plaatje: "+S.p.pic;f.append(d)}}
function finShow(f){f.hidden=false;if(PHONE&&!document.body.classList.contains("home")){const pb=$("#pbot");f.style.bottom=(innerHeight-pb.getBoundingClientRect().top+6)+"px"}else f.style.bottom="12px";clearTimeout(finT)}
/* Na het oplossen: meteen door naar de volgende puzzel (of terug naar Vandaag). */
function finActs(f,free,date,t){const td=dstr();date=free?td:date;
 const btn=(par,txt,cls,fn)=>{const b=document.createElement("button");b.innerHTML=txt;if(cls)b.className=cls;b.onclick=()=>{f.hidden=true;fn()};par.append(b);return b};
 const ft=featOf(date),open=Object.keys(TYPES).filter(x=>!myDone(date,x));
 const q=document.createElement("div");q.className="fq2";
 q.textContent=!open.length?(date===td?"Alle dagpuzzels van vandaag zijn af! 🔥":"Alles van "+dnl(date)+" is af."):(date===td?(open.length===1?"Nog 1 dagpuzzel te gaan":"Nog "+open.length+" dagpuzzels te gaan"):"Nog "+open.length+" van "+dnl(date)+" open")+(open.length?".":"");f.append(q);
 const a=document.createElement("div");a.className="fa fnext";
 const curNv=t==="nono"&&S&&S.nv?S.nv:null,curName=FREE_NAME(t,curNv);
 if(free&&RANDOM){const rp=randomPick(t),rn=FREE_NAME(rp.t,rp.nv),rl=LVN[rp.t]?LVL[rp.l]:"";btn(a,"🎲 Volgende: "+rn+(rl?" · "+rl:""),"pr",()=>startRandomPick(rp));btn(a,"Stop random · "+curName,"",()=>{RANDOM=false;showNewFree(t,false,false,curNv)})}
 else btn(a,"🎲 Nog een "+curName,"pr",()=>showNewFree(t,false,false,curNv));if(NIEUW)btn(a,"🏠 Naar Vandaag","",showHome);f.append(a);
 const h=document.createElement("div");h.className="fsub";h.textContent="Of kies een andere puzzel:";f.append(h);
 const g=document.createElement("div");g.className="fother";
 [ft,...Object.keys(TYPES).filter(x=>x!==ft)].filter(x=>x!==t).forEach(x=>{const day=!myDone(date,x);
  btn(g,tIcon(x)+`<span>${TYPES[x]}</span><small>${day?(x===ft&&date===td?"⭐ dagpuzzel":"dagpuzzel"):"✓ · vrij"}</small>`+(day?'<i class="fdot"></i>':""),day?"day":"",()=>day?load(x,false,false,date===td?undefined:date):showNewFree(x,false))});
 f.append(g)}
function showFinFree(type){const f=$("#fin"),t=type.split(".")[0],lv=+(type.split(".")[1]||2);f.innerHTML="";const x=document.createElement("button");x.className="hx";x.textContent="✕";x.setAttribute("aria-label","Sluiten");x.onclick=()=>{f.hidden=true};f.append(x);
 const h=document.createElement("div");h.className="ft";h.textContent="Opgelost! 🎉";f.append(h);
 const sub=document.createElement("div");sub.className="mut";sub.textContent="Vrij puzzelen · "+FREE_NAME(t,S&&S.nv?S.nv:"classic")+(LVN[t]?" · "+lvLabel(lv):"");f.append(sub);picLine(f);
 const bl=badgeLong(XS_FREE(),t);if(bl){const b=document.createElement("div");b.className="fb";b.textContent=bl;f.append(b)}
 finActs(f,true,S.date,t);finShow(f)}
const XS_FREE=()=>({mist:S.mist||0,hints:S.hints||0,hintSteps:hintTotals()});
document.addEventListener("pointerdown",e=>{const f=$("#fin");if(f&&!f.hidden&&!e.target.closest("#fin")){f.hidden=true}},true);
/* ---- Reeksen en weekstand ---- */
const addDays=(ds,n)=>{const[y,m,d]=ds.split("-").map(Number);return new Date(y,m-1,d+n).toLocaleDateString("sv")};
const dnl=ds=>{const[y,m,d]=ds.split("-").map(Number);return new Date(y,m-1,d).toLocaleDateString("nl-NL",{weekday:"short",day:"numeric",month:"short"}).replace(".","")};
function allRows(){const g=$("#group").value.trim().toLowerCase(),seen=new Set(),out=[];
 const add=r=>{if(!TYPES[baseT(r)])return;const k=r.uid+"|"+r.date+"|"+r.type;if(seen.has(k))return;seen.add(k);out.push(r)};
 lastRows.filter(r=>(r.group||"").toLowerCase()===g).forEach(add);
 freeLoc().filter(r=>String(r.group||legacyGroup()).toLowerCase()===g).forEach(r=>add({...r,name:$("#name").value||"Speler",group:g,uid}));
 for(const k in store){const m=/^(\d{4}-\d\d-\d\d)(.+)$/.exec(k);if(m&&scoreGroup(k).toLowerCase()===g)add({name:$("#name").value||"Speler",group:g,date:m[1],type:m[2],secs:store[k],uid})}
 return out}
function streakOf(rows,u){const ds=new Set(rows.filter(r=>r.uid===u).map(r=>r.date));let d=dstr();if(!ds.has(d))d=addDays(d,-1);let n=0;while(ds.has(d)){n++;d=addDays(d,-1)}return n}
function renderStats(){const raw=allRows(),all=statsRows(raw),rows=all.filter(r=>!isFree(r)),frs=all.filter(isFree),today=dstr(),dow=(new Date().getDay()+6)%7,mon=addDays(today,-dow),sun=addDays(mon,6);
 const pl=new Map();groupPlayers().forEach(p=>pl.set(uidOf(p),playerName(p)));rows.forEach(r=>{if(!pl.has(r.uid))pl.set(r.uid,r.name)});
 const sc=new Map([...pl.keys()].map(u=>[u,{pts:0,n:0,w:0,fw:0,ft:0}])),grp=new Map();
 rows.filter(r=>r.date>=mon&&r.date<=sun).forEach(r=>{const k=r.date+"|"+r.type;if(!grp.has(k))grp.set(k,[]);grp.get(k).push(r)});
 grp.forEach(a=>a.forEach(r=>{const x=sc.get(r.uid);if(!x)return;x.n++;x.pts++;const q=r.uid===uid&&XS[r.date+r.type]?XS[r.date+r.type]:r;if(q.mist===0)x.fl=(x.fl||0)+1;if(HINTT.includes(baseT(r))&&q.hints===0)x.nh=(x.nh||0)+1}));
 frs.forEach(r=>{const x=sc.get(r.uid);if(!x)return;if(r.date>=mon&&r.date<=sun)x.fw++;if(r.date===today)x.ft++});
 const list=[...sc.entries()];
 const el=$("#week");el.innerHTML="";
 const h=document.createElement("h2");h.textContent="Weekstand";el.append(h);
 const sub=document.createElement("div");sub.className="mut";sub.textContent=dnl(mon)+" t/m "+dnl(sun);el.append(sub);
 list.forEach(([u,x],i)=>{const d=document.createElement("div");d.className="row";const a=document.createElement("span"),b=document.createElement("span");
  a.textContent=pl.get(u);b.textContent=x.n+(x.n===1?" dagpuzzel":" dagpuzzels")+(x.fl?" · 🎯 "+x.fl:"")+(x.nh?" · 💡 "+x.nh:"");d.append(a,b);el.append(d);
  const m=document.createElement("div");m.className="mut sm";m.textContent="🧩 "+x.fw+" vrij gepuzzeld ("+x.ft+" vandaag)";el.append(m)});
 const h2=document.createElement("h2");h2.textContent="Reeks";el.append(h2);
 [...pl.entries()].forEach(([u,nm])=>{const n=streakOf(rows,u),d=document.createElement("div");d.className="row";const a=document.createElement("span"),b=document.createElement("span");a.textContent=nm;b.textContent=(n?"🔥 ":"")+n+(n===1?" dag":" dagen");d.append(a,b);el.append(d)});
 const note=document.createElement("div");note.className="mut sm";note.style.marginTop="6px";note.textContent="Geen wedstrijd: gewoon kijken hoeveel we samen oplossen. 🎯 = foutloos, 💡 = zonder hint. Reeks: dagen achter elkaar minstens één dagpuzzel.";el.append(note);
$("#streak b").textContent=streakOf(rows,uid);renderOver(all,pl)}
const TCOL={bin:"#7a52d6",star:"#c97a00",nono:"#0f9d8c",kak:"#e0486b",hex:"#e8590c",plus:"#2b7bd6",mur:"#b5483a",m24:"#2f9e44"};
let OPER=lsGet("pdper")||"maand",ODAYS=21,SVIEW="today";
const baseT=r=>isFree(r)?r.type.split("~")[1].split(".")[0]:r.type.split(".")[0];
const dayForm=r=>{const l=+(String(r.type).split(".")[1]||2);return l>3?"phone":"large"};
function collapseDaily(rows){const m=new Map();rows.forEach(r=>{const k=r.uid+"|"+r.date+"|"+baseT(r),old=m.get(k);/* Groot scherm is de vaste primaire statistiek als beide varianten zijn gemaakt. */if(!old||dayForm(old)==="phone"&&dayForm(r)==="large")m.set(k,r)});return[...m.values()]}
const statsRows=all=>[...collapseDaily(all.filter(r=>!isFree(r))),...all.filter(isFree)];
const freeLvl=r=>{if(!isFree(r))return 0;const p=(r.type.split("~")[1]||"").split("."),l=+(p[1]||2);return l};
const diffGroup=l=>l===1||l===4?1:l===2||l===5?2:l===3||l===6?3:0;
function renderOver(all,pl){const el=$("#sv-over");if(!el||el.hidden)return;el.innerHTML="";
 const today=dstr(),dow=(new Date().getDay()+6)%7,mon=addDays(today,-dow);
 const inP=d=>OPER==="week"?d>=mon&&d<=addDays(mon,6):OPER==="maand"?d.slice(0,7)===today.slice(0,7):OPER==="jaar"?d.slice(0,4)===today.slice(0,4):true;
 const pw=document.createElement("div");pw.className="pp";[["week","Week"],["maand","Maand"],["jaar","Jaar"],["alles","Alles"]].forEach(([k,t])=>{const b=document.createElement("button");b.textContent=t;b.className=k===OPER?"on":"";b.onclick=()=>{OPER=k;lsSet("pdper",k);renderOver(all,pl)};pw.append(b)});el.append(pw);
 const us=[...pl.keys()],cnt={};us.forEach(u=>{cnt[u]={}});
 all.forEach(r=>{if(!cnt[r.uid]||!TYPES[baseT(r)]||!inP(r.date))return;const c=cnt[r.uid],t=baseT(r);c[t]=c[t]||{d:0,v:0};if(isFree(r))c[t].v++;else c[t].d++});
 const tb=document.createElement("table");tb.className="ot";let hd="<tr><th>Puzzel</th>";us.forEach(u=>hd+="<th>"+pl.get(u)+"</th>");tb.innerHTML=hd+"</tr>";
 const tot={};us.forEach(u=>tot[u]={d:0,v:0});
 Object.keys(TYPES).forEach(t=>{const tr=document.createElement("tr");let x='<td><i style="background:'+TCOL[t]+'"></i>'+TYPES[t]+"</td>";
  us.forEach(u=>{const c=cnt[u][t]||{d:0,v:0};tot[u].d+=c.d;tot[u].v+=c.v;x+="<td>"+(c.d+c.v)+(c.v||c.d?"<small>"+c.d+" dag · "+c.v+" vrij</small>":"")+"</td>"});tr.innerHTML=x;tb.append(tr)});
 const tr=document.createElement("tr");tr.className="tot";let x="<td>Totaal</td>";us.forEach(u=>x+="<td>"+(tot[u].d+tot[u].v)+"<small>"+tot[u].d+" dag · "+tot[u].v+" vrij</small></td>");tr.innerHTML=x;tb.append(tr);el.append(tb);
 /* Hoe ging het? Per puzzel hoe vaak foutloos (🎯) en zonder hint (💡), plus langste reeks en favoriete puzzel. */
 {const h3=document.createElement("h2");h3.textContent="Hoe ging het";el.append(h3);
  const st={};us.forEach(u=>{st[u]={}});
  all.forEach(r=>{if(!st[r.uid]||!TYPES[baseT(r)]||!inP(r.date))return;const t=baseT(r),q=r.uid===uid&&XS[r.date+r.type]?XS[r.date+r.type]:r,o=st[r.uid][t]=st[r.uid][t]||{n:0,km:0,fl:0,kh:0,nh:0};o.n++;
   if(q.mist!=null){o.km++;if(q.mist===0)o.fl++}if(HINTT.includes(t)&&q.hints!=null){o.kh++;if(q.hints===0)o.nh++}});
  const t2=document.createElement("table");t2.className="ot";let hh="<tr><th>Puzzel</th>";us.forEach(u=>hh+="<th>"+pl.get(u)+"</th>");t2.innerHTML=hh+"</tr>";
  const pc=(a,b)=>b?Math.round(100*a/b)+"%":"–";
  Object.keys(TYPES).forEach(t=>{const tr=document.createElement("tr");let x='<td><i style="background:'+TCOL[t]+'"></i>'+TYPES[t]+"</td>";
   us.forEach(u=>{const o=st[u][t];x+="<td>"+(o&&o.km?"🎯 "+pc(o.fl,o.km):"–")+(o&&o.kh?"<small>💡 "+pc(o.nh,o.kh)+" zonder hint</small>":"")+"</td>"});tr.innerHTML=x;t2.append(tr)});
  el.append(t2);
  const rows=all.filter(r=>!isFree(r));
  us.forEach(u=>{const ds=[...new Set(rows.filter(r=>r.uid===u).map(r=>r.date))].sort();let best=0,cur=0,prev=null;ds.forEach(d=>{cur=prev&&addDays(prev,1)===d?cur+1:1;best=Math.max(best,cur);prev=d});
   const per={};all.forEach(r=>{if(r.uid===u&&TYPES[baseT(r)]&&inP(r.date))per[baseT(r)]=(per[baseT(r)]||0)+1});const fav=Object.entries(per).sort((a,b)=>b[1]-a[1])[0];
   const d=document.createElement("div");d.className="row";d.innerHTML="<span>"+pl.get(u)+"</span><span>🔥 langste reeks "+best+(best===1?" dag":" dagen")+(fav?" · ❤️ "+TYPES[fav[0]]:"")+"</span>";el.append(d)});
  const k2=document.createElement("div");k2.className="mut sm";k2.style.marginTop="4px";k2.textContent="🎯 = foutloos, 💡 = zonder hint (van de puzzels in deze periode). ❤️ = vaakst gespeeld in deze periode.";el.append(k2)}
 const h=document.createElement("h2");h.textContent="Per dag";el.append(h);
 const byD=new Map();all.forEach(r=>{if(!TYPES[baseT(r)])return;if(!byD.has(r.date))byD.set(r.date,{});const m=byD.get(r.date);(m[r.uid]=m[r.uid]||{d:new Set(),v:0});if(isFree(r))m[r.uid].v++;else m[r.uid].d.add(baseT(r))});
 const first=[...byD.keys()].sort()[0]||today;let d=today,shown=0,any=false;
 while(d>=first&&shown<ODAYS){const m=byD.get(d);if(m){any=true;shown++;const row=document.createElement("div");row.className="dr";const dl=document.createElement("div");dl.textContent=dnl(d);row.append(dl);
  const pc=document.createElement("div");us.forEach(u=>{const e=m[u]||{d:new Set(),v:0},pl2=document.createElement("div");pl2.className="pl";let hh="<b>"+pl.get(u)[0]+"</b>";Object.keys(TYPES).forEach(t=>{hh+='<span class="dd'+(e.d.has(t)?" on":"")+'" style="'+(e.d.has(t)?"background:"+TCOL[t]:"")+'"></span>'});if(e.v)hh+="<em>+"+e.v+" vrij</em>";pl2.innerHTML=hh;pc.append(pl2)});row.append(pc);el.append(row)}
  d=addDays(d,-1)}
 if(!any){const n=document.createElement("div");n.className="mut";n.textContent="Nog geen puzzels opgelost.";el.append(n)}
 if(d>=first){const mb=document.createElement("button");mb.textContent="Toon meer";mb.style.marginTop="8px";mb.onclick=()=>{ODAYS+=21;renderOver(all,pl)};el.append(mb)}
 const k=document.createElement("div");k.className="mut sm";k.style.marginTop="8px";k.textContent="Gekleurde bolletjes = dagpuzzel opgelost (in de volgorde van de tabbladen). \"vrij\" = los gepuzzeld.";el.append(k)}
document.querySelectorAll("#stabs button").forEach(b=>b.onclick=()=>{SVIEW=b.dataset.s;document.querySelectorAll("#stabs button").forEach(x=>x.classList.toggle("on",x===b));$("#sv-today").hidden=SVIEW!=="today";$("#sv-over").hidden=SVIEW!=="over";renderStats()});
/* ---- Scorebord ---- */
function board(rows){try{localStorage.setItem("pdrows",JSON.stringify(lastRows))}catch(e){}if(NIEUW&&document.body.classList.contains("home"))try{renderHome()}catch(e){}const el=$("#board");el.classList.remove("mut");el.innerHTML="";
 const g=$("#group").value.trim().toLowerCase(),td=dstr();rows=rows.filter(r=>(r.group||"").toLowerCase()===g&&r.date===td);
 const ft=featOf(td);for(const t of [ft,...Object.keys(TYPES).filter(x=>x!==ft)]){const h=document.createElement("h2");h.textContent=(t===ft?"⭐ Puzzel van de dag: ":"")+TYPES[t];if(t===ft)h.className="feat";el.append(h);let any=false;
  for(const l of[2,1,3,5,4,6]){const l2=rows.filter(r=>r.type===t+sfx(l)).sort((a,b)=>pIdx(a)-pIdx(b));if(!l2.length)continue;any=true;
   if(LVN[t]){const sh=document.createElement("div");sh.className="mut lv";sh.textContent=lvLabel(l);el.append(sh)}
   l2.forEach(r=>el.append(resRow(r,td)))}
  STAT.forEach(st=>{if(st.uid===uid||(st.group||"").toLowerCase()!==g||st.date!==td||String(st.type).split(".")[0]!==t)return;if(rows.some(r=>r.uid===st.uid&&r.type===st.type))return;
   const b=busyOf(st.uid,td,st.type);if(!b)return;const lv=+(String(st.type).split(".")[1]||2),d=document.createElement("div");d.className="row busy";
   d.textContent=(st.name||"Iemand")+(b===2?" is nu bezig":" is begonnen")+(LVN[t]?" ("+LVL[lv]+")":"")+" ✏️";el.append(d);any=true});
  if(!any){const d=document.createElement("div");d.className="mut";d.textContent="Nog niemand klaar";el.append(d)}}
 updTabs();renderStats()}
let unsub=null,listenDate="";
/* "Bezig": als iemand een dagpuzzel heeft aangeraakt, ziet de ander dat (alleen de soort, geen zetten). */
let STAT=[],unsubS=null,lastPing={k:"",t:0},lastOnline=0;
function liveOf(u){const g=($("#group").value||"").trim().toLowerCase(),st=STAT.find(x=>x.uid===u&&(x.group||"").toLowerCase()===g);if(!st||!st.onlineAt||Date.now()-st.onlineAt>=75000)return null;
 /* Een afgeronde dagpuzzel wint altijd van een eventueel nog geldige laatste online-ping. */
 if(!st.onlinePractice&&st.onlineType&&lastRows.some(r=>{if(r.uid!==u||r.date!==dstr()||(r.group||"").toLowerCase()!==g||!(r.secs>0)||String(r.type).startsWith("v~"))return false;return st.onlineLvl?r.type===st.onlineType+sfx(st.onlineLvl):String(r.type).split(".")[0]===st.onlineType}))return null;
 return st}
function liveTitle(st){if(!st)return"";const t=st.onlineType&&TYPES[st.onlineType]?TYPES[st.onlineType]:"puzzel",bits=[(st.name||"Iemand")+" is online",t];if(st.onlinePractice)bits.push("Vrij puzzelen");else bits.push("Dagpuzzel");if(st.onlineLvl&&LVL[st.onlineLvl])bits.push(LVL[st.onlineLvl]);if(st.onlineType==="nono"&&st.onlineNono)bits.push(st.onlineNono==="color"?"Kleur":"Klassiek");return bits.join(" · ")}
function updatePeerLive(){const el=$("#peerLive");if(!el)return;const o=SET&&SET.players?groupPlayers().map(p=>({p,u:uidOf(p)})).filter(x=>x.u!==uid).map(x=>({p:x.p,st:liveOf(x.u)})).find(x=>x.st):null;el.hidden=!o;if(!o)return;const sp=el.querySelector("span");if(sp)sp.textContent=playerName(o.p);el.title=liveTitle(o.st)}
function pingOnline(force){try{if(ADMIN_READONLY)return;if(!window.PD_DB||!window.PD_DB.setStatus||!uid||uid==="x"||document.hidden||document.body.classList.contains("home")||!S.p||S.done)return;const now=Date.now();if(!force&&now-lastOnline<30000)return;lastOnline=now;window.PD_DB.setStatus({uid,group:$("#group").value.trim(),name:$("#name").value.trim()||"Speler",onlineAt:now,onlineType:S.type,onlinePractice:!!S.practice,onlineLvl:S.lvl||0,onlineNono:S.type==="nono"?S.nv:""}).catch(()=>{})}catch(e){}}
function clearOnline(solved){try{if(ADMIN_READONLY)return;lastOnline=0;const p={uid,group:$("#group").value.trim(),name:$("#name").value.trim()||"Speler",onlineAt:0};if(solved){lastPing={k:"",t:0};p.date="";p.type="";p.at=0}if(window.PD_DB&&window.PD_DB.setStatus&&uid&&uid!=="x")window.PD_DB.setStatus(p).catch(()=>{})}catch(e){}}
function pingBusy(){if(ADMIN_READONLY)return;pingOnline();try{if(!window.PD_DB||!window.PD_DB.setStatus||!S.p||S.practice||S.done||S.date!==dstr())return;const k=S.date+S.type+S.sf,now=Date.now();if(lastPing.k===k&&now-lastPing.t<90000)return;lastPing={k,t:now};
 window.PD_DB.setStatus({uid,group:$("#group").value.trim(),name:$("#name").value.trim()||"Speler",date:S.date,type:S.type+S.sf,at:now}).catch(()=>{})}catch(e){}}
function busyOf(u,date,ty){const g=($("#group").value||"").trim().toLowerCase(),st=STAT.find(x=>x.uid===u&&(x.group||"").toLowerCase()===g);if(!st||st.date!==date||st.type!==ty)return 0;return Date.now()-st.at<10*60000?2:1}
function startStatus(){if(!window.PD_DB||!window.PD_PROFILE_LINKED||!window.PD_DB.listenStatus)return;if(unsubS)unsubS();try{unsubS=window.PD_DB.listenStatus($("#group").value.trim(),r=>{STAT=r;try{updatePeerLive();board(lastRows);if(document.body.classList.contains("home")&&typeof renderHome==="function"&&HVIEW==="")renderHome()}catch(e){}},()=>{clearTimeout(startStatus.t);startStatus.t=setTimeout(startStatus,30000)})}catch(e){}}
setInterval(()=>{try{updatePeerLive();/* De Home-balk is statische HTML; zolang hij zichtbaar is opnieuw renderen zodat een verlopen online-status vanzelf verdwijnt. */if(document.body.classList.contains("home")&&typeof renderHome==="function"&&HVIEW===""&&document.querySelector("#home .hlivebar"))renderHome()}catch(e){}},15000);
setInterval(()=>pingOnline(false),30000);
document.addEventListener("visibilitychange",()=>{if(document.hidden)clearOnline();else setTimeout(()=>pingOnline(true),300)});
addEventListener("pagehide",clearOnline);
function startBoard(){if(ADMIN_READONLY||!window.PD_DB||!window.PD_PROFILE_LINKED)return;if(unsub)unsub();listenDate=dstr();startStatus();
 unsub=window.PD_DB.listenFrom(addDays(listenDate,-800),rows=>{lastRows=mergeRows(lastRows,rows);pullMine(lastRows);board(lastRows);resync(rows)},()=>{$("#board").textContent="Scorebord niet bereikbaar";clearTimeout(startBoard.t);startBoard.t=setTimeout(startBoard,30000)})}
/* Scores worden nooit weggehaald: een (gedeeltelijke) momentopname uit de cache mag dus nooit regels laten verdwijnen. */
function mergeRows(oud,nieuw){const m=new Map();const k=r=>(r.group||"")+"|"+r.uid+"|"+r.date+"|"+r.type;oud.forEach(r=>m.set(k(r),r));nieuw.forEach(r=>m.set(k(r),r));return[...m.values()]}
/* Andersom: dagpuzzels die volgens het scorebord al af zijn, maar die dit apparaat niet (meer) kent
   (bijv. andere browser, beginscherm-app tegenover Safari, gewiste gegevens), ook hier als klaar markeren. */
function pullMine(rows){let ch=false,g=$("#group").value.trim().toLowerCase();
 rows.forEach(r=>{if(r.uid!==uid||(r.group||"").toLowerCase()!==g||!r.date||!r.type||String(r.type).startsWith("v~")||!(r.secs>0))return;const k=r.date+r.type;
  if(!store[k]||scoreGroup(k)!==(r.group||legacyGroup())){store[k]=r.secs;SG[k]=r.group||legacyGroup();ch=true;if(!XS[k]&&(r.mist!=null||r.hints!=null)){XS[k]={};if(r.mist!=null)XS[k].mist=r.mist;if(r.hints!=null)XS[k].hints=r.hints;if(r.hintSteps)XS[k].hintSteps=r.hintSteps}}});
 if(!ch)return;save();saveSG();try{xsSave()}catch(e){}
 if(S.p&&!S.practice&&!S.done&&localDoneInGroup(S.date+S.type+S.sf,g)){progDel(progKey(S.type,false,S.date,S.sf));load(S.type,false,false,S.date)}}
/* Tijden die nog niet op het scorebord staan (bijv. offline gespeeld) alsnog versturen. */
function resync(rows){if(!window.PD_DB||resync.done)return;resync.done=true;const from=addDays(dstr(),-14);
 Object.keys(store).forEach(k=>{const d=k.slice(0,10),t=k.slice(10);if(d<from||!/^\d{4}-\d\d-\d\d$/.test(d)||!t||scoreGroup(k)!==$("#group").value.trim())return;
  if(!rows.some(r=>r.uid===uid&&r.date===d&&r.type===t&&(r.group||"")===scoreGroup(k)))dbSave(myRow(d,t)).catch(()=>{})})}
addEventListener("pdready",startBoard);addEventListener("pdready",()=>setTimeout(()=>pullCloudProgress(true),300));
if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost")){
 /* iOS kan een beginscherm-app lang in het geheugen houden. Controleer daarom ook bij terugkeer naar de app op een nieuwe worker. */
 const swHadController=!!navigator.serviceWorker.controller;let swPending=false,swReloading=false;
 /* Een nieuwe versie wordt NIET toegepast terwijl je de app gebruikt (dan gaan tikken verloren tijdens het herladen).
    De worker serveert per versie precies de juiste bestanden, dus de huidige pagina blijft gewoon goed werken.
    We herladen pas als je de app verlaat terwijl je op Home staat; als je terugkomt draait de nieuwe versie. */
 const swApply=()=>{if(!swPending||swReloading||!document.body.classList.contains("home"))return false;swReloading=true;try{pauseAndPersistActive(true)}catch(e){}location.reload();return true};
 window.PD_APPLY_SW_UPDATE=()=>false;
 navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!swHadController)return;swPending=true});
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")swApply()});
 const swCheck=()=>navigator.serviceWorker.getRegistration().then(r=>r&&r.update()).catch(()=>{});
 addEventListener("load",async()=>{try{let r;try{r=await navigator.serviceWorker.register("sw.js",{updateViaCache:"none"})}catch(e){r=await navigator.serviceWorker.register("sw.js")}r.update().catch(()=>{})}catch(e){}});
 addEventListener("pageshow",swCheck);
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")swCheck()});
}
addEventListener("online",()=>{const m=$("#board");if(window.PD_DB&&m&&/niet bereikbaar/.test(m.textContent))startBoard();pullCloudProgress(true)});
addEventListener("pdnodb",e=>{$("#board").textContent=e.detail||"Scorebord nog niet ingesteld (zie stappenplan)."});
if(window.PD_DB)startBoard();
/* Vangnet naast de live verbinding: elke 45 seconden (en bij terugkomen in de app) de nieuwste scores en "bezig" rechtstreeks ophalen. */
function pollNu(){if(ADMIN_READONLY||!window.PD_DB||!window.PD_PROFILE_LINKED||!window.PD_DB.pollRecent||document.hidden)return;window.PD_DB.pollRecent(addDays(dstr(),-1),$("#group").value.trim()).then(o=>{
 const n0=lastRows.length,j0=JSON.stringify(STAT);lastRows=mergeRows(lastRows,o.rows);if(o.stat)STAT=o.stat;if(lastRows.length!==n0||JSON.stringify(STAT)!==j0){pullMine(lastRows);board(lastRows)}}).catch(()=>{})}
setInterval(pollNu,45000);addEventListener("pdready",()=>setTimeout(pollNu,3000));
/* Terug in de app (bijv. na de iPad op slot): verbindingen opnieuw opzetten, zodat "bezig" en scores direct kloppen. */
let lastVis=0;document.addEventListener("visibilitychange",()=>{if(document.hidden||!window.PD_DB)return;setTimeout(pollNu,800);if(listenDate!==dstr()||Date.now()-lastVis>20000){lastVis=Date.now();startBoard()}});addEventListener("pageshow",e=>{if(e.persisted&&window.PD_DB)startBoard()});

const SET=window.PD_SETUP||{players:["Speler"],group:"lokaal",groupName:"Groep"};$("#group").value=SET.group;
function setMe(p,displayName){uid=uidOf(p);const nm=(displayName||playerName(p)||p).trim()||p;$("#name").value=nm;board(lastRows);setTimeout(()=>pullCloudProgress(true),0)}
addEventListener("pdprofile",e=>{if(ADMIN_READONLY)return;const d=e.detail||{},pr=d.profile||{};PROFILE_NAMES={};GROUP_MEMBERS=d.members||[];GROUP_INFO=d.group||{};(d.members||[]).forEach(x=>{if(x&&x.playerId&&x.displayName)PROFILE_NAMES[x.playerId]=x.displayName});if(pr.playerId&&pr.displayName)PROFILE_NAMES[pr.playerId]=pr.displayName;GROUP_NAME=d.groupName||SET.groupName||"Puzzelsukkels";{const fb=legacyPlayerStyle(pr.playerId);PROFILE_STYLE=cleanStyle(pr,fb.theme,fb.accent);GROUP_STYLE=cleanStyle(d.group||{},"shared","orange")}if(pr.groupId&&$("#group").value!==pr.groupId){try{clearOnline(true)}catch(e){}$("#group").value=pr.groupId;STAT=[];resync.done=false}if(pr.playerId){window.PD_PROFILE_LINKED=true;setMe(pr.playerId,pr.displayName);if(window.PD_DB)startBoard();if(document.body.classList.contains("home")&&typeof renderHome==="function")renderHome()}});
addEventListener("pdauthout",()=>{window.PD_PROFILE_LINKED=false;uid="x";$("#name").value="";PROFILE_NAMES={};GROUP_MEMBERS=[];GROUP_INFO={};PROFILE_STYLE={theme:"shared",accent:"blue"};GROUP_STYLE={theme:"shared",accent:"orange"};GROUP_NAME=SET.groupName||"Puzzelsukkels";$("#group").value=SET.group});
addEventListener("pdadminview",e=>{const d=e.detail||{};ADMIN_READONLY=true;window.PD_ADMIN_READONLY=true;window.PD_PROFILE_LINKED=false;try{if(unsub){unsub();unsub=null}if(unsubS){unsubS();unsubS=null}}catch(x){}PROFILE_NAMES={};GROUP_MEMBERS=d.members||[];GROUP_INFO=d.group||{};(GROUP_MEMBERS||[]).forEach(x=>{if(x&&x.playerId&&x.displayName)PROFILE_NAMES[x.playerId]=x.displayName});GROUP_NAME=d.groupName||"Groep";GROUP_STYLE=cleanStyle(d.group||{},"shared","orange");$("#group").value=d.groupId||"";lastRows=d.rows||[];STAT=d.status||[];HVIEW="score";SCOREWHO=d.personId&&GROUP_MEMBERS.some(x=>x.playerId===d.personId)?d.personId:"all";SWK=0;document.body.classList.remove("newpick");document.body.classList.add("home","adminreadonly");const np=$("#npm");if(np)np.hidden=true;renderHome();pageIn($("#home"));window.scrollTo(0,0)});
for(const t in TYPES){const b=document.createElement("button");b.dataset.t=t;const sp=document.createElement("span");sp.textContent=TYPES[t];b.append(sp);b.onclick=()=>openType(t);$("#tabs").append(b)}
function updateArchiveVisibility(){const a=$("#arch");if(a){a.style.display=S.practice?"none":"";a.classList.toggle("on",!!S.arch)}}
/* Archief: de dagpuzzels van de afgelopen 7 dagen (met ✓ als jij hem al hebt, en de letter van wie hem nog meer heeft). */
{const ab=document.createElement("button");ab.id="arch";ab.title="Dagpuzzels van de afgelopen week";ab.textContent=PHONE?"📅":"📅 Eerder";$("#next").before(ab);
 const pop=document.createElement("div");pop.id="archp";document.body.append(pop);
 ab.onclick=e=>{e.stopPropagation();if(pop.classList.contains("open")){pop.classList.remove("open");return}pop.innerHTML="";const td=dstr(),g=($("#group").value||"").trim().toLowerCase(),t=S.type;
  const h=document.createElement("div");h.className="mut sm";h.textContent=TYPES[t];pop.append(h);
  for(let k=0;k<=7;k++){const d=addDays(td,-k),ty=t+sfx(dagLv(t,d)),b=document.createElement("button");b.className=d===S.date?"on":"";
   const who=groupPlayers().filter(pl=>{const u=uidOf(pl);return(u===uid&&store[d+ty])||lastRows.some(r=>r.uid===u&&r.date===d&&r.type===ty&&(r.group||"").toLowerCase()===g)}).map(pl=>'<i class="pw'+(uidOf(pl)===uid?" me":"")+'">'+playerName(pl)[0]+"</i>").join("");
   b.innerHTML="<span>"+(k===0?"Vandaag":k===1?"Gisteren":dnl(d))+(isWk(d)?" 💪":"")+(featOf(d)===t?" ⭐":"")+"</span>"+(who?'<span class="lw">'+who+"</span>":"");
   b.onclick=ev=>{ev.stopPropagation();pop.classList.remove("open");load(S.type,false,false,d)};pop.append(b)}
  const r=ab.getBoundingClientRect();pop.style.top=Math.round(r.bottom+6)+"px";pop.style.left=Math.round(Math.max(6,Math.min(innerWidth-236,r.left+r.width/2-115)))+"px";pop.classList.add("open")};
 document.addEventListener("pointerdown",e=>{if(pop.classList.contains("open")&&!e.target.closest("#archp,#arch")){pop.classList.remove("open");e._closed=true}},true)}$("#next").onclick=()=>RANDOM?startRandomFree(S.type):showNewFree(S.type,false,true);
let LAYW=innerWidth,LAYH=innerHeight,LAYRT=0;
function resetPuzzleFit(){if(!S)return;delete S._csFit;delete S._hexFit;delete S._murMS;MURMS=0}
addEventListener("resize",()=>{clearTimeout(LAYRT);LAYRT=setTimeout(()=>{const w=innerWidth,h=innerHeight,dw=Math.abs(w-LAYW),dh=Math.abs(h-LAYH),turn=(w>h)!==(LAYW>LAYH);if(!turn&&dw<24&&dh<100)return;LAYW=w;LAYH=h;resetPuzzleFit();if(S.p)render()},140)});
/* ---- Opslaan ---- */
const PKEY="pdprog4";
function progAll(){try{return JSON.parse(lsGet(PKEY)||"{}")}catch(e){return{}}}
function progKey(t,pr,d,sf){const nv=t==="nono"&&S&&S.type==="nono"&&S.nv==="color"?"c":"";return pr?"p:"+t+sf+nv:"d:"+d+":"+t+sf}
const cloudProgKey=k=>encodeURIComponent(k).replace(/\./g,"%2E");
const cloudProgOk=()=>!PHONE&&uid&&uid!=="x"&&window.PD_DB&&window.PD_DB.saveProgress;
let cloudProgLast={},cloudProgPullAt=0,cloudProgPulling=false;
function progressRelevant(k){return !k.startsWith("d:")||k.split(":")[1]>=addDays(dstr(),-8)}
function progressSolved(k,e){const g=String(e&&e.group||legacyGroup()).toLowerCase();if(k.startsWith("d:")){const a=k.split(":"),sk=a[1]+a.slice(2).join(":");return localDoneInGroup(sk,g)}if(k.startsWith("p:")&&e&&e.seed){const sid=String(e.seed).replace(/\W/g,"").slice(-8);return freeLoc().some(r=>String(r.group||legacyGroup()).toLowerCase()===g&&String(r.type).endsWith("~"+sid))}return false}
function progressPct(){if(!S||!S.p)return 0;const p=S.p,cur=S.cur,ratio=(a,b)=>b?Math.max(0,Math.min(99,Math.round(100*a/b))):0;
 if(S.type==="bin"&&cur){let a=0,b=0;for(let i=0;i<cur.length;i++)if(!p.giv||p.giv[i]<0){b++;if(cur[i]>=0)a++}return ratio(a,b)}
 if(["star","nono","plus"].includes(S.type)&&cur)return ratio(cur.filter(v=>v!==0).length,cur.length);
 if(S.type==="kak"&&cur){let a=0,b=0;for(let i=0;i<cur.length;i++)if(p.w&&p.w[i]){b++;if(cur[i]>0)a++}return ratio(a,b)}
 if(S.type==="hex"&&S.hx){const base=new Set([...(p.rev0||[]),...(p.zs||[])]),a=[...S.hx.rev].filter(i=>!base.has(i)).length,b=Math.max(0,(p.cells||[]).length-base.size);return ratio(a,b)}
 if(S.type==="mur"&&cur)return ratio(cur.filter(v=>v!==-1).length,cur.length);
 if(S.type==="m24")return ratio(S.r||0,5);return 0}
function cloudPushProgress(k,e,force){if(!cloudProgOk()||!e||progressSolved(k,e))return;const now=Date.now();if(!force&&now-(cloudProgLast[k]||0)<60000)return;cloudProgLast[k]=now;
 const entry=Object.assign({},e,{k});window.PD_DB.saveProgress({uid,group:$("#group").value.trim(),name:$("#name").value.trim()||"Speler",ck:cloudProgKey(k),entry}).catch(()=>{cloudProgLast[k]=0})}
function cloudClearProgress(k){if(!cloudProgOk()||!window.PD_DB.clearProgress)return;window.PD_DB.clearProgress({uid,group:$("#group").value.trim(),ck:cloudProgKey(k)}).catch(()=>{})}
function progDel(k){const a=progAll();if(k in a){delete a[k];lsSet(PKEY,JSON.stringify(a))}cloudClearProgress(k)}
function mergeCloudProgress(mp){if(PHONE||!mp)return false;const a=progAll(),remote={};let ch=false,reload=false,curk=S&&S.p?progKey(S.type,S.practice,S.date,S.sf):"";
 Object.values(mp).forEach(e=>{if(!e||!e.k)return;remote[e.k]=e;const k=e.k;if(!progressRelevant(k)||progressSolved(k,e)){cloudClearProgress(k);return}const l=a[k];if(!l||(e.at||0)>(l.at||0)){const z=Object.assign({},e);delete z.k;a[k]=z;ch=true;if(k===curk&&!document.body.classList.contains("home")&&(e.at||0)>(S._saveAt||0))reload=true}});
 const now=Date.now();for(const[k,e0]of Object.entries(a)){if(!progressRelevant(k)||progressSolved(k,e0))continue;let e=e0;if(!e.at&&!remote[k]){e=Object.assign({},e,{at:now});a[k]=e;ch=true}const r=remote[k];if(!r||(e.at||0)>(r.at||0))cloudPushProgress(k,e,true)}
 if(ch)lsSet(PKEY,JSON.stringify(a));if(reload&&S&&S.p&&!S.done){const t=S.type,pr=S.practice,d=S.date;S.start=0;load(t,pr,false,d)}else if(document.body.classList.contains("home"))try{renderHome()}catch(e){}return ch}
function pullCloudProgress(force){if(PHONE||!uid||uid==="x"||!window.PD_DB||!window.PD_DB.getProgress||cloudProgPulling)return Promise.resolve(false);const now=Date.now();if(!force&&now-cloudProgPullAt<15000)return Promise.resolve(false);cloudProgPullAt=now;cloudProgPulling=true;
 return window.PD_DB.getProgress($("#group").value.trim(),uid).then(mergeCloudProgress).catch(()=>false).finally(()=>{cloudProgPulling=false})}
function persist(forceCloud){if(!S.p||S.done||!S.start||!S.seed)return;const a=progAll(),today=dstr();let pruned=false;
 for(const k in a)if(k.startsWith("d:")&&k.split(":")[1]<addDays(today,-8)){delete a[k];pruned=true}
 const k=progKey(S.type,S.practice,S.date,S.sf),pc=progressPct();
 /* Een onaangeraakte of weer volledig leeggemaakte puzzel is geen lopende puzzel. */
 if(pc<=0&&!(S.hints>0)&&!(S.mist>0)){if(k in a){delete a[k];pruned=true;cloudClearProgress(k)}if(pruned)lsSet(PKEY,JSON.stringify(a));S._saveAt=0;return}
 const e={seed:S.seed,gv:GV,mv:MGV,pv:PGV,el:playMs(),pen:0,mist:S.mist||0,hints:S.hints||0,hintLedger:S.hintLedger||{},hintLegacy:S.hintLegacy||0,seenErrors:S.seenErrors||{},pc,group:$("#group").value.trim()};
 if(S.hx){e.rev=[...S.hx.rev];e.cs=S.cs||{}}else if(S.type==="m24")e.r=S.r;else if(S.cur)e.cur=S.cur;if(S.str)e.str=[...S.str];if(S.nt&&Object.keys(S.nt).length)e.nt=S.nt;
 /* Hervatten moet ook echt hervatten: bewaar een begrensde undo/redo-geschiedenis.
    Maak 24 heeft een eigen ronde-state en laten we hier bewust buiten. */
 if(S.type!=="m24"){if(S.hist&&S.hist.length)e.hist=S.hist.slice(-60);if(S.redo&&S.redo.length)e.redo=S.redo.slice(-30)}
 const prev=a[k],plain=x=>{if(!x)return"";const q=Object.assign({},x);delete q.at;return JSON.stringify(q)},changed=!prev||plain(prev)!==plain(e);
 e.at=changed?Date.now():(prev.at||Date.now());a[k]=e;S._saveAt=e.at;lsSet(PKEY,JSON.stringify(a));if(changed||forceCloud)cloudPushProgress(k,e,!!forceCloud)}
setInterval(persist,3000);
document.addEventListener("visibilitychange",()=>{if(document.hidden){pausePlay();persist(true)}else pullCloudProgress(true).finally(()=>resumePlay())});
addEventListener("blur",()=>{pausePlay();persist(true)});
addEventListener("focus",()=>{if(!document.hidden&&playScreenActive())pullCloudProgress(true).finally(()=>resumePlay())});
addEventListener("pagehide",()=>{pausePlay();persist(true)});
addEventListener("pageshow",()=>{pullCloudProgress(true).finally(()=>resumePlay())});
/* ---- Controleren ---- */
function wrongCells(){const{type,p,cur}=S,o=[];if(!cur)return o;cur.forEach((v,i)=>{
 if(type==="bin"){if(v>=0&&v!==p.sol[i])o.push(i)}
 else if(type==="star"){if((v===2&&!p.sol[i])||(v===1&&p.sol[i]))o.push(i)}
 else if(type==="nono"){if(p.color){if((v>0&&v!==p.sol[i])||(v===-1&&p.sol[i]>0))o.push(i)}else if((v===1&&!p.sol[i])||(v===2&&p.sol[i]))o.push(i)}
 else if(type==="plus"){if((v===1&&!p.sol[i])||(v===2&&p.sol[i]))o.push(i)}
 else if(type==="kak"){if(v>0&&v!==p.sol[i])o.push(i)}
 else if(type==="mur"){if(v>=0&&p.sol[v]!==i||v===-2&&p.sol.includes(i))o.push(i)}});return o}
function doCheck(){if(S.done||!S.p||!["bin","star","nono","kak","mur","plus"].includes(S.type))return;const bad=wrongCells(),m=$("#msg");
 const els=bad.map(i=>S.type==="kak"?$("#grid").children[i]:S.type==="mur"?S.mcells[i]:S.cells[i]).filter(Boolean);els.forEach(d=>d.classList.add("bad"));
 if(bad.length)registerErrors(bad);persist();
 const t=bad.length?(bad.length===1?"1 vakje klopt niet":bad.length+" vakjes kloppen niet"):"Alles wat je hebt ingevuld klopt";
 m.classList.remove("good","warn");m.classList.add(bad.length?"warn":"good");m.textContent=t;setTimeout(()=>{els.forEach(d=>d.classList.remove("bad"));if(m.textContent===t){m.textContent="";m.classList.remove("good","warn")}},2800)}
$("#chk").onclick=doCheck;
/* ---- Weergave: systeem, licht of donker ---- */
const themeMode=()=>{const t=lsGet("pdtheme");return t==="light"||t==="dark"?t:"system"};
function updTheme(redraw){const mode=themeMode(),root=document.documentElement;if(mode==="system")root.removeAttribute("data-theme");else root.dataset.theme=mode;
 const dark=isDark(),meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=dark?"#15171c":"#f6f4ef";
 const th=$("#theme"),ico=mode==="system"?"◐":mode==="dark"?"🌙":"☀️",lbl=mode==="system"?"Systeem":mode==="dark"?"Donker":"Licht";
 if(th){if(th.closest&&th.closest("#more"))th.innerHTML='<span class="ic">'+ico+'</span><span>Weergave: '+lbl+'</span>';else th.textContent=ico+(PHONE?" "+lbl:"");th.title="Weergave: "+lbl+" · tik om te wisselen"}
 document.querySelectorAll(".htheme [data-theme-mode],.themeMenu [data-theme-mode]").forEach(b=>{const on=b.dataset.themeMode===mode;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on?"true":"false")});
 if(redraw&&typeof S!=="undefined"&&S&&S.p&&!document.body.classList.contains("home")){if(S.type==="hex")setTimeout(rHex,0);else render()}}
function setThemeMode(mode){if(!["system","light","dark"].includes(mode))mode="system";if(mode==="system")document.documentElement.removeAttribute("data-theme");else document.documentElement.dataset.theme=mode;lsSet("pdtheme",mode);updTheme(true)}
function makeThemeSeg(){const d=document.createElement("div");d.className="themeMenu";d.setAttribute("role","group");d.setAttribute("aria-label","Weergave");[["light","☀️","Licht"],["dark","🌙","Donker"],["system","◐","Systeem"]].forEach(([m,ic,tx])=>{const b=document.createElement("button");b.type="button";b.dataset.themeMode=m;b.innerHTML=`<span>${ic}</span><b>${tx}</b>`;b.onclick=()=>setThemeMode(m);d.append(b)});return d}
$("#theme").onclick=()=>{const m=themeMode(),next=m==="system"?"light":m==="light"?"dark":"system";setThemeMode(next)};
updTheme(false);{const mq=matchMedia("(prefers-color-scheme: dark)"),fn=()=>{if(themeMode()==="system")updTheme(true)};if(mq.addEventListener)mq.addEventListener("change",fn);else if(mq.addListener)mq.addListener(fn)}
/* ---- iPhone-indeling: bovenbalk, compact menu en knoppenbalk onderaan ---- */
function phoneLayout(){document.body.classList.add("phone");const hd=$("header"),main=$("main");
 const pm=document.createElement("button");pm.id="pm";pm.textContent="⋯";pm.title="Menu";
 const pmp=document.createElement("div");pmp.id="pmp";document.body.append(pmp);
 const prow=document.createElement("div");prow.id="prow";main.insertBefore(prow,main.firstChild);const plive=document.createElement("div");plive.id="peerLive";plive.className="peerlive";plive.hidden=true;plive.innerHTML="<i></i><span></span>";prow.append(plive,pm);
 const pbot=document.createElement("div");pbot.id="pbot";document.body.append(pbot);
 prow.append($("#arch"),$("#hexstat"),$("#msg"));
 pbot.append($("#undo"),$("#redo"),$("#nmode"),$("#pmode"),$("#mb"),$("#mz"),$("#potb"),$("#notewipe"),$("#hintb"),$("#chk"));$("#potb").innerHTML="✏️";$("#notewipe").innerHTML="🧹";$("#pxb").textContent="✕";$("#pob").textContent="○";$("#nf").textContent="■";$("#nx").textContent="✕";
 pmp.append($("#next"),$("#autocross"),$("#sbtn"),$("#helpb"),$("#ctrlb"),$("#reset"),$("#time"),$("#streak"),makeThemeSeg(),$("#authbtn"));$("#theme").hidden=true;
 $("#chk").innerHTML="✓<span> Klopt?</span>";$("#hintb").innerHTML="💡<span> Hint</span>";
 pm.onclick=()=>pmp.classList.toggle("open");pmp.addEventListener("click",e=>{if(e.target.closest("button"))setTimeout(()=>pmp.classList.remove("open"),80)});
 document.addEventListener("pointerdown",e=>{if(pmp.classList.contains("open")&&!e.target.closest("#pmp,#pm")){pmp.classList.remove("open");e._closed=true}},true);
 const SH={bin:"Binair",star:"Star",nono:"Nono",hex:"Hex",plus:"Plus",mur:"Moord"};document.querySelectorAll("#tabs button").forEach(b=>{const sp=b.querySelector("span");if(sp&&SH[b.dataset.t])sp.textContent=SH[b.dataset.t]});
 updTheme()}
if(PHONE)phoneLayout();
/* ===== Vandaag-scherm, rustige speelweergave en hintpaneel ===== */
let HOMEREADY=false;
const TGLYPH={bin:"01",star:"★",nono:"▦",hex:"⬢",plus:"+",mur:"?"};
const FREE_NAME=(t,nv)=>t==="nono"&&nv==="color"?"Kleurnonogram":TYPES[t]||t;
const tIcon=(t,big,nv)=>{const bg=t==="nono"&&nv==="color"?"linear-gradient(135deg,#e84d5b 0 25%,#f2c94c 25% 50%,#27ae60 50% 75%,#2f80ed 75% 100%)":TCOL[t]||"#888";return `<span class="ticon${big?" big":""}" style="background:${bg}">${TGLYPH[t]||"•"}</span>`};
function nieuwLayout(){const B=document.body;B.classList.add("nieuw");
 /* Terug naar Vandaag */
 if(PHONE){const bk=document.createElement("button");bk.id="tbHome";bk.textContent="←";bk.title="Terug naar Vandaag";$("#prow").prepend(bk);bk.onclick=showHome}
 else{B.classList.add("tablet");
  const tb=document.createElement("div");tb.id="topbar";
  tb.innerHTML='<button id="tbHome" title="Terug naar Vandaag" aria-label="Terug naar Vandaag">←</button><div id="tbTitle"></div><div id="tbMid"></div><div id="peerLive" class="peerlive" hidden><i></i><span></span></div><button id="tbMore" title="Meer" aria-label="Meer">⋯</button>';
  $("main").before(tb);$("#tbMid").append($("#msg"),$("#hexstat"),$("#time"));
  const pbot=document.createElement("div");pbot.id="pbot";document.body.append(pbot);
  const g1=document.createElement("div");g1.className="pgrp g1";g1.append($("#undo"),$("#redo"));
  const g2=document.createElement("div");g2.className="pgrp modes";g2.append($("#nmode"),$("#pmode"),$("#mb"),$("#mz"));
  const g3=document.createElement("div");g3.className="pgrp";g3.append($("#potb"),$("#notewipe"),$("#hintb"),$("#chk"));
  pbot.append(g1,g2,g3);
  const more=document.createElement("div");more.id="more";document.body.append(more);
  const sec=(t)=>{const h=document.createElement("div");h.className="mh";h.textContent=t;more.append(h)};
  const lst=(...ids)=>{const d=document.createElement("div");d.className="mlist";ids.forEach(i=>d.append($(i)));more.append(d)};
  const ic=(b,i,t)=>{b.innerHTML='<span class="ic">'+i+'</span><span>'+t+'</span>'};
  sec("Puzzel");lst("#arch","#next","#autocross");sec("Weergave");more.append(makeThemeSeg());sec("Overig");lst("#sbtn","#helpb","#ctrlb","#reset","#authbtn");more.append($("#streak"));$("#theme").hidden=true;
  ic($("#arch"),"📅","Eerdere dagpuzzels");ic($("#next"),"🎲","Nog een puzzel");ic($("#sbtn"),"📊","Overzicht en statistieken");ic($("#helpb"),"❓","Uitleg van deze puzzel");ic($("#ctrlb"),"⌨️","Bediening");
  {const r=$("#reset");r.innerHTML='<b class="ic">⟲</b><span>Reset</span>'}updTheme();
  $("#tbHome").onclick=showHome;$("#tbMore").onclick=e=>{e.stopPropagation();more.classList.toggle("open")};
  /* Het menu blijft open; alleen bij "Nog een puzzel" gaat het dicht. */
  more.addEventListener("click",e=>{const b=e.target.closest("button");if(b&&b.id==="next")setTimeout(()=>more.classList.remove("open"),80)});
  document.addEventListener("pointerdown",e=>{if(more.classList.contains("open")&&!e.target.closest("#more,#tbMore,#archp")){more.classList.remove("open");e._closed=true}},true)}
 document.body.append($("#side"));{const x=document.createElement("button");x.id="sideX";x.textContent="✕";x.title="Sluiten";x.setAttribute("aria-label","Sluiten");x.onclick=()=>toggleSide(false);$("#side").prepend(x)}
 const home=document.createElement("section");home.id="home";$("main").before(home)}
function updTop(){if(!S||!S.p)return;document.querySelectorAll("#pbot .pgrp").forEach(mg=>mg.classList.toggle("leeg",![...mg.children].some(x=>getComputedStyle(x).display!=="none")));const t=S.type,ti=$("#tbTitle");document.documentElement.style.setProperty("--tc",TCOL[t]);
 const fnv=t==="nono"&&S.practice?S.nv:"",ttl=FREE_NAME(t,fnv),sub=(S.practice?"Vrij puzzelen":S.arch?"Dagpuzzel van "+dnl(S.date):"Dagpuzzel")+(t==="nono"&&!S.practice?" · "+(S.nv==="color"?"Kleur":"Klassiek"):"")+(LVN[t]?" · "+LVL[S.lvl]:"")+(!S.practice&&featOf(S.date)===t?" · ⭐":"");
 if(ti)ti.innerHTML=tIcon(t,false,fnv)+`<div><b>${ttl}</b><small>${sub}</small></div>`;updatePeerLive()}
function showHome(){RANDOM=false;if(HOMEREADY)pauseAndPersistActive(true);clearOnline();HVIEW="";HDOPEN="";clearHint();const m=$("#more");if(m)m.classList.remove("open");toggleSide(false);document.body.classList.remove("newpick");document.body.classList.add("home");if(window.PD_APPLY_SW_UPDATE&&window.PD_APPLY_SW_UPDATE())return;const np=$("#npm");if(np)np.hidden=true;tapMode();renderHome();if(HOMEREADY)pageIn($("#home"));window.scrollTo(0,0)}
const dayLvDevice=(t,ds,phone)=>{if(!dagVast(ds))return null;const[y,m,d]=ds.split("-").map(Number),w=new Date(y,m-1,d).getDay(),wk=w===0||w===6;return phone?(wk?6:5):(wk?3:2)};
const dayTypeDevice=(t,ds,phone)=>{const l=dayLvDevice(t,ds,phone);return t+sfx(l||dagLv(t,ds))};
function myDone(td,t){if(!dagVast(td)){const re=new RegExp("^"+td+t+"(\\.\\d)?$");return Object.keys(store).find(k=>re.test(k))||""}const ty=dayTypeDevice(t,td,PHONE),k=td+ty,g=($("#group").value||"").trim().toLowerCase();return localDoneInGroup(k,g)||lastRows.some(r=>r.uid===uid&&r.date===td&&r.type===ty&&(r.group||"").toLowerCase()===g)?k:""}
function myDoneOther(td,t){if(!dagVast(td))return"";const ty=dayTypeDevice(t,td,!PHONE),k=td+ty,g=($("#group").value||"").trim().toLowerCase();return localDoneInGroup(k,g)||lastRows.some(r=>r.uid===uid&&r.date===td&&r.type===ty&&(r.group||"").toLowerCase()===g)?k:""}
function progressMeta(k,e){let m;if((m=/^d:(\\d{4}-\\d\\d-\\d\\d):([a-z0-9]+)(?:\\.(\\d))?$/.exec(k))){const t=m[2],d=m[1];return{k,e,practice:false,date:d,type:t,lvl:+(m[3]||2),color:t==="nono"&&nonoDayVariant(d)==="color"}};
 if((m=/^p:([a-z0-9]+?)(?:\\.(\\d))?(c)?$/.exec(k)))return{k,e,practice:true,date:dstr(),type:m[1],lvl:+(m[2]||2),color:!!m[3]};return null}
const nonoMetaVariant=m=>m&&m.type==="nono"?(m.color?"color":"classic"):"";
function currentSessionMeta(){return S&&S.p?{type:S.type,practice:!!S.practice,date:S.date,nv:S.nv,lvl:S.lvl,done:!!S.done,pc:progressPct(),key:S.practice?progKey(S.type,S.practice,S.date,S.sf):""}:null}
function pauseAndPersistActive(forceCloud){if(!S||!S.p||S.done||!S.start)return false;pausePlay();persist(!!forceCloud);return true}
function setFreePreferences(t,l,nv){if(LVN[t]&&l){LV[t]=l;lsSet("pdlvl",JSON.stringify(LV))}if(t==="nono"&&nv){nonoVariant=nv;lsSet("pdnvar",nv)}}
function progressList(filter={},source){const{practice=null,type="",date="",variant=""}=filter,g=$("#group").value.trim().toLowerCase();return Object.entries(source||progAll()).map(([k,e])=>progressMeta(k,e)).filter(m=>m&&String(m.e.group||legacyGroup()).toLowerCase()===g&&progressRelevant(m.k)&&!progressSolved(m.k,m.e)&&(practice===null||m.practice===practice)&&(!type||m.type===type)&&(!date||m.date===date)&&(!variant||m.type!=="nono"||nonoMetaVariant(m)===variant)).sort((a,b)=>(b.e.at||0)-(a.e.at||0))}
function freeProgressList(t,nv){return progressList({practice:true,type:t||"",variant:nv||""})}
function clearFreeProgressType(t,keep,nv){let target=nv||"";if(t==="nono"&&!target&&keep){const e=progAll()[keep],m=progressMeta(keep,e);target=nonoMetaVariant(m)}freeProgressList(t).forEach(m=>{if(m.k!==keep&&(t!=="nono"||!target||nonoMetaVariant(m)===target))progDel(m.k)})}
function latestFreeProgress(t,nv){if(t==="nono"&&!nv){for(const v of["classic","color"]){const a=freeProgressList(t,v);a.slice(1).forEach(m=>progDel(m.k))}return freeProgressList(t)[0]||null}const a=freeProgressList(t,nv),m=a[0]||null;a.slice(1).forEach(x=>progDel(x.k));return m}
function resumeProgress(k){const e=progAll()[k],m=progressMeta(k,e);if(!m)return;if(!m.practice){load(m.type,false,false,m.date);return}clearFreeProgressType(m.type,k,m.type==="nono"?nonoMetaVariant(m):null);RANDOM=false;setFreePreferences(m.type,m.lvl,nonoMetaVariant(m));load(m.type,true,false)}
function startChosenFree(t,l,nv,random,replace){if(replace)clearFreeProgressType(t,null,t==="nono"?nv:null);setFreePreferences(t,l,nv);RANDOM=!!random;$("#npm").hidden=true;document.body.classList.remove("newpick");load(t,true,true)}
/* Nieuwe vrije puzzel: één flow voor alle puzzeltypes.
   De Nonogramvariant komt van de gekozen Home-tegel of de huidige puzzel; nooit wisselen tijdens het spelen.
   Een lopende huidige puzzel krijgt één bevestiging; opgeslagen voortgang krijgt expliciet Verdergaan of Nieuwe puzzel. */
function showNewFree(t,random,fromCurrent,nvForced){if(!TYPES[t])return;
 clearHomeSkinAccent();const origin=currentSessionMeta();
 pauseAndPersistActive(true)
 clearOnline();document.body.classList.remove("home");document.body.classList.add("newpick");toggleSide(false);
 const m=$("#npm"),lvBox=$("#nplv"),sub=$("#npsub");let nv=t==="nono"?(nvForced||(random?(Math.random()<.5?"classic":"color"):(origin&&origin.type==="nono"&&origin.nv?origin.nv:nonoVariant))):"classic";
 const titleName=()=>FREE_NAME(t,nv);document.body.dataset.t=t;document.documentElement.style.setProperty("--tc",TCOL[t]||"var(--pc)");document.querySelectorAll("#tabs button").forEach(b=>b.classList.toggle("on",b.dataset.t===t));const ti=$("#tbTitle");if(ti)ti.innerHTML=tIcon(t,false,t==="nono"?nv:"")+`<div><b>${titleName()}</b><small>Vrij puzzelen · Nieuwe puzzel</small></div>`;m.hidden=false;pageIn(m.querySelector(".npcard"));window.scrollTo(0,0);
 const meta=old=>[old&&LVN[old.type]?LVL[old.lvl]:"",old&&old.e.pc!=null?old.e.pc+"% klaar":""].filter(Boolean).join(" · ");
 const sameOrigin=old=>!!(fromCurrent&&origin&&origin.practice&&old&&old.k===origin.key);
 const backToOrigin=()=>{if(!origin){showHome();return}if(origin.practice)setFreePreferences(origin.type,origin.lvl,origin.nv);else if(origin.type==="nono"&&origin.nv){nonoVariant=origin.nv;lsSet("pdnvar",nonoVariant)}document.body.classList.remove("newpick");m.hidden=true;load(origin.type,origin.practice,false,origin.date)};
 const levelScreen=()=>{$("#npmt").textContent="Nieuwe "+titleName();sub.textContent=LVN[t]?"Kies de moeilijkheid.":"Klaar voor een nieuwe puzzel?";lvBox.innerHTML="";const old=latestFreeProgress(t,t==="nono"?nv:undefined),levels=LVN[t]||[2];levels.forEach(l=>{const b=document.createElement("button");b.className="nplvb";const desc=t==="nono"&&nv==="color"?(LVS[t][l]||"")+" · "+nonoColorCount(l)+" kleuren":LVS[t]&&LVS[t][l]?LVS[t][l]:"";b.innerHTML="<b>"+(LVN[t]?LVL[l]:"Starten")+"</b><small>"+desc+"</small><span>›</span>";b.onclick=()=>startChosenFree(t,l,nv,random,!!old);lvBox.append(b)})};
 const existing=old=>{$("#npmt").textContent=titleName();sub.textContent="Je hebt nog een onafgemaakte vrije puzzel.";lvBox.innerHTML='<div class="npwarn"><b>Wat wil je doen?</b><p>'+meta(old)+'</p><div class="npactions"><button id="npcontinue">Verder puzzelen</button><button id="npreplace" class="secondary">Nieuwe puzzel</button></div></div>';$("#npcontinue").onclick=()=>resumeProgress(old.k);$("#npreplace").onclick=levelScreen};
 const picker=()=>{const old=latestFreeProgress(t,t==="nono"?nv:undefined);if(old&&!sameOrigin(old))existing(old);else levelScreen()};
 const confirmNew=()=>{$("#npmt").textContent="Nieuwe puzzel?";sub.textContent="Je huidige puzzel is nog niet af.";const p=origin&&origin.pc!=null?origin.pc:0;lvBox.innerHTML='<div class="npwarn"><b>Weet je het zeker?</b><p>Je bent nog bezig met deze puzzel'+(p>0?" ("+p+"% klaar)":"")+'. Je voortgang blijft bewaard totdat je echt een nieuwe puzzel start.</p><div class="npactions"><button id="npstay" class="secondary">Blijven puzzelen</button><button id="npgo">Ja, nieuwe puzzel</button></div></div>';$("#npstay").onclick=backToOrigin;$("#npgo").onclick=picker};
 if(fromCurrent&&origin&&!origin.done&&origin.pc>0)confirmNew();else picker()}
$("#npmx").onclick=showHome;

/* Puzzelsoort openen: hervat eerst de meest recente onafgemaakte sessie van dit type. Een bewust nieuwe vrije puzzel loopt via showNewFree(). */
function latestProgressForType(t){const f=latestFreeProgress(t),d=progressList({practice:false,type:t})[0]||null;return !d?f:!f?d:(f.e.at||0)>(d.e.at||0)?f:d}
function withFreshProgress(fn){if(!cloudProgOk()||navigator.onLine===false)return fn();return Promise.race([pullCloudProgress(true),new Promise(r=>setTimeout(r,700))]).then(fn,fn)}
function openType(t){return withFreshProgress(()=>{const m=latestProgressForType(t);if(m)return resumeProgress(m.k);return myDone(dstr(),t)?(HOMEREADY?showNewFree(t,false):load(t,true,true)):load(t,false)})}
let HVIEW="",SWK=0,SCOREWHO="all",HDOPEN="",ADMIN_READONLY=false;
const STYLE_THEMES=["shared","peter","aart","stars","nature","retro","animals","sea","travel","music","party","coffee","season","minimal"],STYLE_ACCENTS={blue:"#2f6fed",purple:"#7a52d6",teal:"#0f9d8c",green:"#2f9e44",orange:"#d98200",pink:"#d84b73",red:"#b5483a"};
let PROFILE_STYLE={theme:"shared",accent:"blue"},GROUP_STYLE={theme:"shared",accent:"orange"};
const cleanStyle=(x,fbTheme="shared",fbAccent="blue")=>({theme:STYLE_THEMES.includes(x&&x.theme)?x.theme:fbTheme,accent:STYLE_ACCENTS[x&&x.accent]?x.accent:fbAccent});
const legacyPlayerStyle=u=>u===uidOf("Aart")?{theme:"aart",accent:"orange"}:u===uidOf("Peter")?{theme:"peter",accent:"blue"}:{theme:"shared",accent:"blue"};
function styleForPlayer(u){const m=GROUP_MEMBERS.find(x=>x&&x.playerId===u),fb=legacyPlayerStyle(u);return cleanStyle(m||{},fb.theme,fb.accent)}
/* Thema "Seizoen": herfst, Sinterklaas (14 nov t/m 5 dec), kerst (6 t/m 26 dec), winter, lente en zomer, vanzelf op datum. */
function seasonNow(d){d=d||new Date();const m=d.getMonth()+1,day=d.getDate(),md=m*100+day;if(md>=1114&&md<=1205)return"sint";if(md>=1206&&md<=1226)return"xmas";if(md>=1227||m<=2)return"winter";if(m<=5)return"spring";if(m<=8)return"summer";return"autumn"}
function setHomeSkin(style){const x=typeof style==="string"?cleanStyle({theme:style},style==="aart"?"aart":style==="peter"?"peter":"shared",style==="aart"?"orange":"blue"):cleanStyle(style);document.body.classList.remove(...STYLE_THEMES.map(t=>"skin-"+t));document.body.classList.add("skin-"+x.theme);document.body.classList.remove("season-autumn","season-sint","season-xmas","season-winter","season-spring","season-summer");if(x.theme==="season")document.body.classList.add("season-"+seasonNow());document.body.style.setProperty("--home-accent",STYLE_ACCENTS[x.accent]);document.body.style.setProperty("--pc",STYLE_ACCENTS[x.accent])}
function clearHomeSkinAccent(){document.body.style.removeProperty("--home-accent");document.body.style.removeProperty("--pc")}
function applyCurrentHomeStyle(){if(!document.body.classList.contains("home"))return;if(HVIEW==="score")setHomeSkin(SCOREWHO==="all"?GROUP_STYLE:styleForPlayer(SCOREWHO));else setHomeSkin(PROFILE_STYLE)}
addEventListener("pdpreviewstyle",e=>{const d=e.detail||{};if(document.body.classList.contains("home"))setHomeSkin(cleanStyle(d,d.kind==="group"?"shared":PROFILE_STYLE.theme,d.kind==="group"?"orange":PROFILE_STYLE.accent))});
addEventListener("pdrestorestyle",applyCurrentHomeStyle);
function pageIn(el){if(!el||matchMedia("(prefers-reduced-motion: reduce)").matches)return;el.classList.remove("pagein");void el.offsetWidth;el.classList.add("pagein");setTimeout(()=>el.classList.remove("pagein"),260)}
function fitHomePage(){document.documentElement.classList.remove("pagefit");document.body.classList.remove("pagefit");requestAnimationFrame(()=>{if(!document.body.classList.contains("home")||HVIEW==="score"||innerWidth<761)return;const h=$("#home");if(h&&h.scrollHeight<=innerHeight+2){document.documentElement.classList.add("pagefit");document.body.classList.add("pagefit")}})}
function showScore(who="all"){HVIEW="score";SCOREWHO=who||"all";SWK=0;renderHome();pageIn($("#home"));window.scrollTo(0,0)}
function renderScore(h){const raw=allRows(),all=statsRows(raw),rows=all.filter(r=>!isFree(r)),today=dstr(),dow=(new Date().getDay()+6)%7,mon0=addDays(today,-dow),TS=Object.keys(TYPES);
 const pl=new Map();groupPlayers().forEach(p=>pl.set(uidOf(p),playerName(p)));rows.forEach(r=>{if(!pl.has(r.uid))pl.set(r.uid,r.name)});const us=[...pl.keys()];
 if(SCOREWHO!=="all"&&!pl.has(SCOREWHO))SCOREWHO="all";
 setHomeSkin(SCOREWHO==="all"?GROUP_STYLE:styleForPlayer(SCOREWHO));
 const inP=d=>OPER==="week"?d>=mon0&&d<=addDays(mon0,6):OPER==="maand"?d.slice(0,7)===today.slice(0,7):OPER==="jaar"?d.slice(0,4)===today.slice(0,4):true;
 const PN={week:"deze week",maand:"deze maand",jaar:"dit jaar",alles:"in totaal"}[OPER]||"";
 const q=r=>r.uid===uid&&XS[r.date+r.type]?Object.assign({},r,XS[r.date+r.type]):r,pc=(a,b)=>b?Math.round(100*a/b)+"%":"–";
 const variantNote=r=>{if(isFree(r))return"";const f=new Set(raw.filter(x=>!isFree(x)&&x.uid===r.uid&&x.date===r.date&&baseT(x)===baseT(r)).map(dayForm)),a=[];if(f.has("large"))a.push("🖥️ Groot scherm ✓");if(f.has("phone"))a.push("📱 Telefoon ✓");return a.join(" · ")};
 const st=us.map((u,i)=>{const mine=all.filter(r=>r.uid===u&&TYPES[baseT(r)]&&inP(r.date)),d=mine.filter(r=>!isFree(r));let km=0,fl=0,kh=0,nh=0;
  d.forEach(r=>{const x=q(r);if(x.mist!=null){km++;if(x.mist===0)fl++}if(HINTT.includes(baseT(r))&&x.hints!=null){kh++;if(x.hints===0)nh++}});
  const ds=[...new Set(rows.filter(r=>r.uid===u).map(r=>r.date))].sort();let best=0,cur=0,prev=null;ds.forEach(x=>{cur=prev&&addDays(prev,1)===x?cur+1:1;best=Math.max(best,cur);prev=x});
  const per={},perD={};mine.forEach(r=>{const t=baseT(r);per[t]=(per[t]||0)+1;if(!isFree(r))perD[t]=(perD[t]||0)+1});const fav=Object.entries(per).sort((a,b)=>b[1]-a[1])[0];
  return{u,i,nm:pl.get(u),d:d.length,v:mine.length-d.length,fl,km,nh,kh,streak:streakOf(rows,u),best,fav:fav&&fav[0],per,perD,mine}});
 const together=st.reduce((a,x)=>a+x.d+x.v,0);
 const views=`<div class="sviews">${[["all","Overzicht"],...groupPlayers().map(p=>[uidOf(p),playerName(p)])].map(([k,t])=>`<button data-who="${k}" class="${k===SCOREWHO?"on":""}">${k==="all"?"▦":"👤"} ${t}</button>`).join("")}</div>`;
 const period=`<div class="sper">${[["week","Week"],["maand","Maand"],["jaar","Jaar"],["alles","Alles"]].map(([k,t])=>`<button data-p="${k}" class="${k===OPER?"on":""}">${t}</button>`).join("")}</div>`;
 const head=(title,sub)=>`<div class="stop"><button id="sBack" aria-label="Terug">←</button><div><h2>${title}</h2><div class="mut">${sub}</div></div></div>`;
 if(SCOREWHO!=="all"){
  const x=st.find(v=>v.u===SCOREWHO),mine=x?x.mine:[],daily=mine.filter(r=>!isFree(r)),statSecs=r=>{const n=+r.secs||0;return n>0&&n<=MAX_REASONABLE_SECS?n:0},badTimes=mine.filter(r=>(+r.secs||0)>MAX_REASONABLE_SECS).length,total=mine.reduce((n,r)=>n+statSecs(r),0);
  const metric=(ic,ttl,val,sub,cls="")=>`<div class="hcard smetric ${cls}"><span class="smic">${ic}</span><div><small>${ttl}</small><b>${val}</b><span>${sub||""}</span></div></div>`;
  const recent=mine.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);
  const recentHtml=recent.length?recent.map(r=>{const t=baseT(r),z=q(r),sec=statSecs(r);return`<div class="srecent">${tIcon(t,false)}<div><b>${TYPES[t]}</b><small>${isFree(r)?"Vrij puzzelen":"Dagpuzzel"} · ${dnl(r.date)}${!isFree(r)&&variantNote(r)?" · "+variantNote(r):""}</small></div><span>${sec?"⏱ "+fmt(sec):"⏱ —"} ${quickBadges(z,t)}</span></div>`}).join(""):`<div class="mut">Nog geen puzzels in deze periode.</div>`;
  const perMax=Math.max(1,...TS.map(t=>x&&x.per[t]||0));
  const diffStats=(rr,t)=>[1,2,3].map(d=>{const a=rr.filter(r=>isFree(r)&&diffGroup(freeLvl(r))===d),times=a.map(statSecs).filter(Boolean);let km=0,fl=0,kh=0,nh=0;a.forEach(r=>{const z=q(r);if(z.mist!=null){km++;if(z.mist===0)fl++}if(HINTT.includes(t)&&z.hints!=null){kh++;if(z.hints===0)nh++}});return{d,n:a.length,avg:times.length?Math.round(times.reduce((x,y)=>x+y,0)/times.length):0,best:times.length?Math.min(...times):0,km,fl,kh,nh}});
  const puzzleHtml=TS.map(t=>{const rr=mine.filter(r=>baseT(r)===t),n=rr.length,times=rr.map(statSecs).filter(Boolean);let km=0,fl=0,kh=0,nh=0;rr.forEach(r=>{const z=q(r);if(z.mist!=null){km++;if(z.mist===0)fl++}if(HINTT.includes(t)&&z.hints!=null){kh++;if(z.hints===0)nh++}});const avg=times.length?Math.round(times.reduce((a,b)=>a+b,0)/times.length):0,best=times.length?Math.min(...times):0,ds=diffStats(rr,t),freeN=ds.reduce((a,z)=>a+z.n,0);const detail=freeN?`<div class="spdetail" hidden><div class="spdlab">Vrij puzzelen per moeilijkheid</div>${ds.map(z=>`<div class="spdrow"><b>${LVL[z.d]}</b><span>${z.n}×</span><span>${z.avg?"⏱ "+fmt(z.avg):"⏱ —"}</span><span>${z.best?"🏆 "+fmt(z.best):"🏆 —"}</span><span>${z.km?"🎯 "+pc(z.fl,z.km):"🎯 —"}</span>${HINTT.includes(t)?`<span>${z.kh?"💡 "+pc(z.nh,z.kh):"💡 —"}</span>`:""}</div>`).join("")}</div>`:`<div class="spdetail" hidden><div class="spempty">Nog geen vrije ${TYPES[t]}-puzzels in deze periode.</div></div>`;return`<div class="spuzzle"><button class="spmain" data-sp-t="${t}" aria-expanded="false"><div class="sphead"><span>${tIcon(t,false)}<b>${TYPES[t]}</b></span><strong>${n}× <i>⌄</i></strong></div><div class="spbar"><i style="width:${100*n/perMax}%;background:${TCOL[t]}"></i></div><div class="spmeta">${avg?`<span>⏱ gem. ${fmt(avg)}</span>`:""}${best?`<span>🏆 ${fmt(best)}</span>`:""}${km?`<span>🎯 ${pc(fl,km)}</span>`:""}${kh?`<span>💡 ${pc(nh,kh)}</span>`:""}${!n?`<span class="mut">Nog niet gespeeld</span>`:""}${freeN?`<span class="spfree">🧩 ${freeN} vrij</span>`:""}</div></button>${detail}</div>`}).join("");
  h.innerHTML=`<div class="hwrap sco personview">${head(x.nm,"Puzzels en prestaties · "+PN)}<div class="scontrols">${views}${period}</div>
   <div class="smetrics">${metric("🧩","Totaal opgelost",x.d+x.v,x.d+" dag · "+x.v+" vrij","green")}${metric("🎯","Foutloos",x.km?pc(x.fl,x.km):"–",x.km?x.fl+" van "+x.km:"Nog geen meting","pink")}${metric("💡","Zonder hint",x.kh?pc(x.nh,x.kh):"–",x.kh?x.nh+" van "+x.kh:"Nog geen meting","yellow")}${metric("⏱","Totale speeltijd",fmtDuration(total),mine.length?(mine.length+" puzzels"+(badTimes?` · ${badTimes} oude ${badTimes===1?"tijd":"tijden"} genegeerd`:"")):"Nog geen puzzels","blue")}${metric("🔥","Huidige reeks",x.streak+" "+(x.streak===1?"dag":"dagen"),"Langste reeks: "+x.best,"peach")}${metric("★","Favoriete puzzel",x.fav?TYPES[x.fav]:"–",x.fav?(x.per[x.fav]||0)+" keer gespeeld":"Nog geen favoriet","purple")}</div>
   <div class="hgrid2 sh2"><div class="hcard"><div class="shd1"><b>Per puzzel</b><span class="mut">${PN}</span></div>${puzzleHtml}</div><div class="hcard"><div class="shd1"><b>Recente puzzels</b><span class="mut">${PN}</span></div><div class="srecentlist">${recentHtml}</div></div></div></div>`;
 }else{
  const hero=st.map(x=>`<div class="hcard shero p${x.i%2}"><div class="snm">${x.nm}${x.u===uid?' <span class="mut">(jij)</span>':""}</div><div class="sbig">${x.d}<span>${x.d===1?"dagpuzzel":"dagpuzzels"} ${PN}</span></div><div class="schips"><span>🧩 ${x.v} vrij</span><span>🔥 ${x.streak} ${x.streak===1?"dag":"dagen"} op rij</span><span>🏆 langste reeks ${x.best}</span>${x.km?`<span>🎯 ${pc(x.fl,x.km)} foutloos</span>`:""}${x.kh?`<span>💡 ${pc(x.nh,x.kh)} zonder hint</span>`:""}${x.fav?`<span>❤️ ${TYPES[x.fav]}</span>`:""}</div></div>`).join("");
  const mon=addDays(mon0,7*SWK),wd=[0,1,2,3,4,5,6].map(i=>addDays(mon,i)),DN=["ma","di","wo","do","vr","za","zo"],dset=(u,d)=>new Set(rows.filter(r=>r.uid===u&&r.date===d).map(baseT));
  const cal=`<div class="hcard"><div class="shd"><button class="snav" data-w="-1" aria-label="Vorige week">‹</button><div><b>${SWK===0?"Deze week":SWK===-1?"Vorige week":"Week van "+dnl(mon)}</b><div class="mut">${dnl(mon)} t/m ${dnl(addDays(mon,6))}</div></div><button class="snav" data-w="1" aria-label="Volgende week" ${SWK>=0?"disabled":""}>›</button></div><div class="scal" style="--n:${us.length}"><div></div>${wd.map((d,i)=>`<div class="sdh${d===today?" td":""}">${DN[i]}<small>${+d.slice(8)}</small></div>`).join("")}<div></div>${st.map(x=>{let n=0;return`<div class="srn">${x.nm}</div>`+wd.map(d=>{const s=dset(x.u,d);n+=s.size;return`<div class="scell${d===today?" td":""}${d>today?" fut":""}${s.size===TS.length?" all":""}">${TS.map(t=>`<i style="${s.has(t)?"background:"+TCOL[t]:""}"></i>`).join("")}</div>`}).join("")+`<div class="scnt">${n}</div>`}).join("")}</div><div class="slg">${TS.map(t=>`<span><i style="background:${TCOL[t]}"></i>${TYPES[t]}</span>`).join("")}</div></div>`;
  const mx=Math.max(1,...st.flatMap(x=>TS.map(t=>x.per[t]||0)));
  const bars=`<div class="hcard"><div class="shd1"><b>Per puzzel</b><span class="mut">${PN}</span></div>${TS.map(t=>`<div class="sbr"><div class="sbt"><i style="background:${TCOL[t]}"></i>${TYPES[t]}</div><div class="sbb">${st.map(x=>{const n=x.per[t]||0;return`<div class="sbl p${x.i%2}"><span class="si">${x.nm[0]}</span><div class="strk"><div style="width:${Math.max(n?3:0,100*n/mx)}%;background:${TCOL[t]}"></div></div><span class="sn">${n}</span></div>`}).join("")}</div></div>`).join("")}</div>`;
  const W=16,start=addDays(mon0,-7*(W-1));
  const heat=`<div class="hcard"><div class="shd1"><b>Laatste ${W} weken</b><span class="mut">dagpuzzels per dag</span></div><div class="shm">${st.map(x=>{const cnt={};rows.forEach(r=>{if(r.uid===x.u&&r.date>=start)cnt[r.date]=(cnt[r.date]||0)+1});let o=`<div class="shp"><div class="srn">${x.nm}</div><div class="shg">`;for(let w=0;w<W;w++)for(let i=0;i<7;i++){const d=addDays(start,7*w+i),n=Math.min(TS.length,cnt[d]||0);o+=`<i class="${d>today?"fut":""}${d===today?" td":""}" style="${n?"background:color-mix(in srgb,var(--pc) "+Math.round(25+75*n/TS.length)+"%,transparent)":""}" title="${dnl(d)}: ${n}"></i>`}return o+"</div></div>"}).join("")}</div><div class="slg2 mut sm">minder <i></i><i style="background:color-mix(in srgb,var(--pc) 40%,transparent)"></i><i style="background:color-mix(in srgb,var(--pc) 70%,transparent)"></i><i style="background:var(--pc)"></i> meer</div></div>`;
  h.innerHTML=`<div class="hwrap sco">${head(GROUP_NAME+' <button id="scoreGroupEdit" class="scoregroupedit" title="Groep beheren" aria-label="Groep beheren">✎</button>',"Samen "+together+" "+(together===1?"puzzel":"puzzels")+" opgelost "+PN)}<div class="scontrols">${views}${period}</div><div class="sovermain"><div class="soverheroes">${hero}</div>${cal}</div><div class="hgrid2 sh2">${bars}${heat}</div><div class="mut sm">Geen wedstrijd: gewoon kijken hoeveel jullie samen oplossen. Een telefoon- en groot-schermvariant van dezelfde dagpuzzel telt hier samen als één. 🎯 = foutloos, 💡 = zonder hint.</div></div>`;
 }
 $("#sBack").onclick=ADMIN_READONLY?()=>{location.href="admin.html"}:showHome;
 {const ge=$("#scoreGroupEdit");if(ge){if(ADMIN_READONLY)ge.remove();else ge.onclick=()=>window.dispatchEvent(new Event("pdopengroup"))}}
 if(ADMIN_READONLY){const wrap=h.querySelector(".hwrap.sco");if(wrap&&!wrap.querySelector(".adminviewbar"))wrap.insertAdjacentHTML("afterbegin",'<div class="adminviewbar">👁 Beheerweergave <span>Alleen-lezen · terug met ← naar Beheer</span></div>')}
 h.querySelectorAll(".sviews button").forEach(b=>b.onclick=()=>{SCOREWHO=b.dataset.who;SWK=0;renderHome();pageIn($("#home"))});
 h.querySelectorAll(".sper button").forEach(b=>b.onclick=()=>{OPER=b.dataset.p;lsSet("pdper",OPER);renderHome()});
 h.querySelectorAll(".snav").forEach(b=>b.onclick=()=>{SWK=Math.min(0,SWK+ +b.dataset.w);renderHome()});h.querySelectorAll(".spmain").forEach(b=>b.onclick=()=>{const d=b.parentElement.querySelector(".spdetail"),open=!d.hidden;h.querySelectorAll(".spdetail").forEach(x=>x.hidden=true);h.querySelectorAll(".spmain").forEach(x=>{x.classList.remove("open");x.setAttribute("aria-expanded","false")});if(!open){d.hidden=false;b.classList.add("open");b.setAttribute("aria-expanded","true")}fitHomePage()});fitHomePage()}
function renderHome(){const h=$("#home");if(!h)return;if(HVIEW==="score")return renderScore(h);setHomeSkin(PROFILE_STYLE);Object.keys(TYPES).forEach(latestFreeProgress);const td=dstr(),ft=featOf(td),now=new Date(),hr=now.getHours();
 const groet=hr<6?"Goedenacht":hr<12?"Goedemorgen":hr<18?"Goedemiddag":"Goedenavond",me=($("#name").value||"").trim()||"puzzelaar";
 const datum=now.toLocaleDateString("nl-NL",{weekday:"long",day:"numeric",month:"long"}),g=($("#group").value||"").trim().toLowerCase(),others=groupPlayers().filter(p=>uidOf(p)!==uid),types=Object.keys(TYPES),raadselsOK=g==="peter-aart-jk4hv92t"||String(GROUP_NAME||"").trim().toLowerCase()==="rekensukkels";
 const pa=progAll(),busyMeta=t=>progressList({practice:false,type:t,date:td},pa)[0]||null;
 const progRing=(p,t)=>p==null?"":`<span class="pdonut" style="--p:${p};--ring:${TCOL[t]||"var(--pc)"}"><b>${p}%</b></span>`;
 const active=progressList({},pa),dayActive=active.filter(m=>!m.practice),freeActive=active.filter(m=>m.practice),olderDay=dayActive.filter(m=>m.date!==td),homeRaw=allRows();
 const resumeCard=m=>{const nv=m.type==="nono"?(m.color?"color":"classic"):"",name=m.practice?FREE_NAME(m.type,nv):(TYPES[m.type]||m.type),badge=!m.practice&&nv?`<span class="nvbadge ${nv}">${nv==="color"?"Kleur":"Klassiek"}</span>`:"",sub=[m.practice?"Vrij puzzelen":m.date===td?"Vandaag":dnl(m.date),LVN[m.type]?LVL[m.lvl]:""].filter(Boolean).join(" · ");return`<button class="hcont${nv?" nono-"+nv:""}" data-pk="${m.k}" title="Ga verder met ${name}">${tIcon(m.type,false,m.practice?nv:"")}<span class="ctxt"><b>${name}${badge}</b><small>${sub}</small></span>${progRing(m.e.pc==null?0:m.e.pc,m.type)}<span class="hgo2">›</span></button>`};
 const otherLabel=PHONE?"Groot scherm":"Telefoon",otherIcon=PHONE?"🖥️":"📱";
 const dayExact=(name,t,phone)=>{const u=uidOf(name),ty=dayTypeDevice(t,td,phone),sync=homeRaw.find(x=>!isFree(x)&&x.uid===u&&x.date===td&&x.type===ty);if(u!==uid)return sync||null;const loc=store[td+ty]?myRow(td,ty):null;return loc?Object.assign({},sync||{},loc):sync||null};
 const dayResultFor=(name,t)=>dayExact(name,t,PHONE),dayOtherResultFor=(name,t)=>dagVast(td)?dayExact(name,t,!PHONE):null;
 const dayPeopleDetail=t=>`<div class="ddpeople">${groupPlayers().map(name=>{const r=dayResultFor(name,t),o=dayOtherResultFor(name,t);return`<span class="ddperson ${r?"done":o?"otherdone":""}"><b>${playerName(name)}</b>${r?`<i>✓</i><span>⏱ ${fmt(r.secs||0)}</span>${quickBadges(r,t)}`:"<span>Deze variant nog niet</span>"}${o?`<span class="ddother">${otherIcon} ${otherLabel} ✓</span>`:""}</span>`}).join("")}</div>`;
 const dayPeerCompact=t=>{const peers=groupPlayers().filter(name=>uidOf(name)!==uid);return peers.length?`<span class="daypeer">${peers.map(name=>{const u=uidOf(name),r=dayResultFor(name,t),o=dayOtherResultFor(name,t),ty=dayTypeDevice(t,td,PHONE),busy=!r&&!!busyOf(u,td,ty),cls=r?"done":busy?"busy":o?"otherdone":"";return`<span class="${cls}" title="${playerName(name)}: ${r?"deze variant klaar":busy?"bezig met deze variant":o?otherLabel+"-variant klaar":"nog niet klaar"}${r&&o?" · "+otherLabel+" ook klaar":""}"><b>${playerName(name)}</b> ${r?`✓${r.mist===0?' <i class="peerico">🎯</i>':""}${HINTT.includes(t)&&r.hints===0?' <i class="peerico">💡</i>':""}`:busy?"…":o?`<i class="peerdev">${otherIcon}✓</i>`:"—"}</span>`}).join("")}</span>`:""};
 const dayMistBadge=r=>!r||r.mist==null?"":r.mist===0?`<span class="rq good" title="Foutloos">🎯</span>`:`<span class="rq" title="${r.mist} ${r.mist===1?"fout":"fouten"}">❌ ${r.mist}</span>`;
 const dayHintBadge=(r,t)=>!r||!HINTT.includes(t)||r.hints==null?"":r.hints===0?`<span class="rq good" title="Zonder hint">💡</span>`:`<span class="rq" title="${hintSummary(r)}">💡 ${r.hints}</span>`;
 const detailMetric=(ic,lab,val,good)=>`<div class="ddmetric ${good?"good":""}"><span>${ic}</span><b>${val}</b><small>${lab}</small></div>`;
 const dayDetail=(t,r)=>{const err=r&&r.mist!=null?r.mist:null,hi=r&&HINTT.includes(t)&&r.hints!=null?r.hints:null;return`<div class="daydetail"><div class="ddmain"><div class="ddstatus"><span class="ddcheck">✓</span><div><b>Opgelost</b><small>${dnl(td)}${t==="nono"?" · "+(nonoDayVariant(td)==="color"?"Kleur":"Klassiek"):""}</small></div></div><div class="ddmetrics">${detailMetric("⏱","Tijd",fmt(r&&r.secs||0),false)}${detailMetric(err===0?"🎯":"❌","Fouten",err==null?"–":err,err===0)}${HINTT.includes(t)?detailMetric("💡","Hulp",hi==null?"–":hintSummary(r),hi===0):""}</div><button class="dayview" data-view-t="${t}">Puzzel bekijken ›</button></div>${dayPeopleDetail(t)}</div>`};
 const doneToday=t=>myDone(td,t),dayRow=t=>{const k=doneToday(t),m=busyMeta(t),pc=m&&m.e.pc!=null?m.e.pc:null,r=k?ownDayResult(td,t):null,o=dayOtherResultFor(me,t),sub=t==="nono"?(nonoDayVariant(td)==="color"?"Kleur":"Klassiek"):"",other=o?`<small class="otherday">${otherIcon} ${otherLabel} ✓</small>`:"";
  return`<div class="dayitem ${t===ft?"featured ":""}${HDOPEN===t?"open":""}" style="--dayc:${TCOL[t]||"var(--pc)"}"><button class="hdrow ${k?"ok":m?"busy":""}" data-day-t="${t}"${m?` data-pk="${m.k}"`:""}><span class="dot"></span>${tIcon(t,false)}<span class="dname">${TYPES[t]}${t===ft?`<small class="featlabel">⭐ Puzzel van de dag${sub?" · "+sub:""}</small>`:sub?`<small>${sub}</small>`:""}${other}</span>${dayPeerCompact(t)}<span class="dstate ${k?"done":"pending"}">${k?`<span class="dtime">⏱ ${fmt((r&&r.secs)||store[k]||0)}</span><span class="dmist">${dayMistBadge(r)}</span><span class="dhint">${dayHintBadge(r,t)}</span>`:`<span class="dpending">${pc!=null?progRing(pc,t):""}<b>${m?"Verder":"Start"}${pc!=null?" · "+pc+"%":""}</b></span>`}<span class="darrow">${k&&HDOPEN===t?"⌃":"›"}</span></span></button>${k&&HDOPEN===t?dayDetail(t,r):""}</div>`};
 const freeTiles=types.flatMap(t=>t==="nono"?[{t,nv:"classic",name:"Nonogram"},{t,nv:"color",name:"Kleurnonogram"}]:[{t,nv:"",name:TYPES[t]}]),freeTile=x=>{const t=x.t,nv=x.nv,sub=LVN[t]?"Kies niveau":"Nieuwe puzzel";return`<button class="tile free" data-free-t="${t}" data-free-nv="${nv}" style="--tc:${TCOL[t]}">${tIcon(t,1,nv)}<span>${x.name}</span><small class="tcount">${sub}</small></button>`};
 const homeRows=statsRows(homeRaw),countOf=(who,period)=>homeRows.filter(r=>r.uid===who&&TYPES[baseT(r)]&&(period==="today"?r.date===td:r.date.slice(0,7)===td.slice(0,7))).length,livePeers=others.map(name=>({name,st:liveOf(uidOf(name))})).filter(x=>x.st),liveTop=livePeers.map(x=>{const st=x.st,bits=[TYPES[st.onlineType]||"Puzzel",st.onlinePractice?"Vrij puzzelen":"Dagpuzzel",st.onlineType==="nono"&&st.onlineNono?(st.onlineNono==="color"?"Kleur":"Klassiek"):"",st.onlineLvl&&LVL[st.onlineLvl]?LVL[st.onlineLvl]:""].filter(Boolean);return `<div class="hlivebar" title="${liveTitle(st)}"><i></i><b>${playerName(x.name)} is online</b><span>${bits.join(" · ")}</span></div>`}).join("");
 const personCard=(name,who)=>{const mc=countOf(who,"month"),tc=countOf(who,"today");return`<button data-home-who="${who}"><span class="hvicon">👤</span><b>${playerName(name)}${who===uid?' <i>(jij)</i>':""}</b><small>🧩 ${mc} deze maand · ${tc} vandaag</small></button>`};
 const monthTogether=groupPlayers().reduce((n,p)=>n+countOf(uidOf(p),"month"),0),todayTogether=groupPlayers().reduce((n,p)=>n+countOf(uidOf(p),"today"),0);
 const allRowsN=homeRows.filter(r=>!isFree(r)),strk=streakOf(allRowsN,uid);
 h.innerHTML=`<div class="hwrap"><div class="hbrand"><span class="logo" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>Gepuzzellig</span></div><div class="htop"><div><h2>${groet} ${me}</h2><div class="mut">${datum[0].toUpperCase()+datum.slice(1)} · ${GROUP_NAME}</div></div><div class="hactions"><div class="htheme" role="group" aria-label="Weergave"><button data-theme-mode="system" title="Volg systeem"><span class="thi">◐</span><span class="thtxt">Systeem</span></button><button data-theme-mode="light" title="Lichte weergave"><span class="thi">☀️</span><span class="thtxt">Licht</span></button><button data-theme-mode="dark" title="Donkere weergave"><span class="thi">🌙</span><span class="thtxt">Donker</span></button></div><button id="hProfile" class="hprofile" title="Profiel" aria-label="Profiel">${(me[0]||"P").toUpperCase()}</button></div></div>${liveTop}

 <section class="hsection hdaily"><div class="hsecthead"><div><h3>📅 Dagelijkse puzzels</h3><span class="mut">Vandaag · ${types.filter(doneToday).length} van ${types.length} klaar</span></div><span class="hstreak">🔥 ${strk} ${strk===1?"dag":"dagen"}</span></div>
  <div class="hcard hdlist">${[ft,...types.filter(t=>t!==ft)].map(dayRow).join("")}</div>
  ${olderDay.length?`<div class="hsub"><div class="hsubhead"><b>Eerdere dagpuzzels</b><span class="mut">${olderDay.length} bezig</span></div><div class="hcontlist">${olderDay.map(resumeCard).join("")}</div></div>`:""}
  ${raadselsOK?'<a class="hcard hraad" href="raadsels.html"><span class="ticon big" style="background:#c2255c">÷</span><div><b>Rekenraadsel van vandaag</b> <span class="hpill">proefversie</span><div class="mut">Eén 3F-rekenraadsel per dag, met kladpapier en rekenmachine.</div></div><span class="hgo">›</span></a>':""}
 </section>

 <section class="hsection hfree"><div class="hsecthead"><div><h3>🎲 Vrij puzzelen</h3><span class="mut">Kies zelf wat je wilt maken</span></div><button id="hFree" class="hshuffle">🎲 Willekeurig</button></div>
  ${freeActive.length?`<div class="hsub hactive"><div class="hsubhead"><b>Verder puzzelen</b><span class="mut">${freeActive.length} ${freeActive.length===1?"puzzel":"puzzels"} bezig</span></div><div class="hcontlist">${freeActive.map(resumeCard).join("")}</div></div>`:""}
  <div class="tiles freegrid">${freeTiles.map(freeTile).join("")}</div>
 </section>

 <section class="hsection htogether"><div class="hsecthead"><div><h3>👥 ${GROUP_NAME}</h3><span class="mut">Samen of per persoon bekijken</span></div></div><div class="hhomeviews"><button data-home-who="all"><span class="hvicon">▦</span><b>Overzicht</b><small>🧩 ${monthTogether} samen deze maand · ${todayTogether} vandaag</small></button>${groupPlayers().map(p=>personCard(p,uidOf(p))).join("")}</div></section></div>`;
 h.querySelectorAll(".hdrow[data-day-t]").forEach(b=>b.onclick=()=>{const t=b.dataset.dayT;if(myDone(td,t)){HDOPEN=HDOPEN===t?"":t;renderHome()}else if(b.dataset.pk)resumeProgress(b.dataset.pk);else load(t,false)});
 h.querySelectorAll(".dayview[data-view-t]").forEach(b=>b.onclick=()=>load(b.dataset.viewT,false,false,td));
 h.querySelectorAll(".hcont[data-pk]").forEach(b=>b.onclick=()=>withFreshProgress(()=>resumeProgress(b.dataset.pk)));
 h.querySelectorAll(".tile.free[data-free-t]").forEach(b=>b.onclick=()=>showNewFree(b.dataset.freeT,false,false,b.dataset.freeNv||null));
 h.querySelectorAll(".hhomeviews [data-home-who]").forEach(b=>b.onclick=()=>showScore(b.dataset.homeWho));
 {const hp=$("#hProfile");if(hp)hp.onclick=()=>window.dispatchEvent(new Event("pdopenprofile"))}
 h.querySelectorAll(".htheme [data-theme-mode]").forEach(b=>b.onclick=()=>setThemeMode(b.dataset.themeMode));updTheme(false);
 $("#hFree").onclick=()=>startRandomFree("");fitHomePage()}
if(NIEUW)nieuwLayout();
{const td=dstr(),ft=featOf(td),first=lsGet("pdfeat")!==td;lsSet("pdfeat",td);
 const t=first&&!myDone(td,ft)?ft:TYPES[lsGet("pdtab")]?lsGet("pdtab"):ft;first&&!myDone(td,ft)?load(t,false):openType(t)}
if(NIEUW){showHome();HOMEREADY=true}
/* Laat de uiteindelijke layout eerst volledig berekenen en schilder hem daarna in één keer. */
requestAnimationFrame(()=>document.documentElement.removeAttribute("data-ui-pending"));

/* ---- Bediening per puzzel ---- */
function controlsOf(t){const common=[],rows=[];
 if(t==="nono"){rows.push(["Tik / linksklik","Gebruik de actieve vul-, kleur- of kruisstand"],["Rechtermuisknop","Gebruik de andere stand: kruisje ↔ vullen/laatst gekozen kleur"],["Dubbeltik / dubbelklik","Zet altijd een kruisje zonder je actieve stand of kleur te veranderen"],["Slepen","Vul of kruis meerdere vakjes in dezelfde stand"],["Naast het bord","Wissel tussen vullen/kleur en kruisjes"]);common.push(["Spatie","wissel stand"])}
 else if(t==="bin"){rows.push(["Tik / linksklik","Plaats ✕"],["Dubbeltik / dubbelklik","Plaats ○"],["Rechtermuisknop","Plaats direct ○"],["Potlood","Zelfde bediening als normaal, maar met kleine ✕ en ○"],["Teller slepen","Vergelijk die rij of kolom met de andere"])}
 else if(t==="star"){rows.push(["Tik / linksklik","Plaats een kruisje"],["Dubbeltik / dubbelklik","Plaats een ster"],["Rechtermuisknop","Plaats direct een ster"],["Potlood","Zelfde bediening als normaal, maar met dunne kleine ☆ en ×"],["Slepen","Plaats dezelfde markering in meerdere vakjes"])}
 else if(t==="plus"){rows.push(["Tik / linksklik","Gebruik de actieve stand: omcirkelen of wegstrepen"],["Rechtermuisknop","Gebruik de andere stand: omcirkelen ↔ wegstrepen"],["Slepen","Markeer meerdere getallen in dezelfde stand"],["Naast het bord","Wissel stand"]);common.push(["Spatie","wissel stand"])}
 else if(t==="hex"){rows.push(["Tik / linksklik","Gebruik de actieve stand: blauw of zwart"],["Rechtermuisknop","Gebruik de andere stand: blauw ↔ zwart"],["Blauw/grijs vlak","Wissel tussen blauw en zwart"],["Rand- of blauw cijfer","Links gebruikt de actieve stand; rechts de andere stand"]);common.push(["Spatie","wissel blauw/zwart"])}
 else if(t==="mur"){rows.push(["Tik / linksklik","Gebruik de actieve plaats- of kruisstand"],["Rechtermuisknop","Gebruik de andere stand: plaatsen ↔ wegkruisen"],["Naast het bord","Wissel tussen plaatsen en wegkruisen"]);common.push(["Spatie","wissel stand"])}
 else if(t==="kak"){rows.push(["Tik / klik","Selecteer een wit vakje"],["Cijferknoppen","Vul het geselecteerde vakje in"],["Toetsen 1–9","Vul het cijfer direct in"],["Backspace / 0","Wis het geselecteerde vakje"])}
 else if(t==="m24"){rows.push(["Tik / klik","Kies een getal en daarna een bewerking"],["Ongedaan","Ga één rekenstap terug"])}
 else rows.push(["Tik / klik","Gebruik het gekozen vakje of de actieve actie"]);
 if(NOTET.includes(t))common.push(["A","aantekeningen aan/uit"]);
 if(HINTT.includes(t))common.push(["H","hint"]);
 if(["bin","star","nono","kak","mur","plus"].includes(t))common.push(["C","controleer"]);
 if(t!=="hex")common.push(["⌘/Ctrl Z","ongedaan"],["⇧⌘/Ctrl Z","opnieuw"]);
 common.push(["?","uitleg"],["Esc","sluiten"]);
 return{rows,keys:common}}
function showControls(){if(!S||!S.type)return;const t=S.type,m=$("#cm"),d=controlsOf(t);$("#cmt").textContent="Bediening · "+TYPES[t];
 $("#cmp").innerHTML='<div class="csec"><h3>Touch en muis</h3><div class="clist">'+d.rows.map(x=>'<div class="crow"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join("")+'</div></div><div class="csec"><h3>Sneltoetsen</h3><div class="ckeys">'+d.keys.map(x=>'<span><kbd>'+x[0]+'</kbd> '+x[1]+'</span>').join("")+'</div></div>';m.hidden=false}
$("#autocross").onclick=toggleAutoCross;
$("#ctrlb").onclick=showControls;$("#cmx").onclick=()=>{$("#cm").hidden=true};
$("#cm").addEventListener("pointerdown",e=>{if(e.target===$("#cm"))$("#cm").hidden=true});

/* ---- Uitleg per puzzel ---- */
function showHelp(){const t=S.type,m=$("#hm");$("#hmt").textContent="Zo werkt "+TYPES[t];const ul=$("#hmp");ul.innerHTML="";
 helpOf(t).split(/(?<=[.!?])\s+/).filter(Boolean).forEach(x=>{const li=document.createElement("li");li.textContent=x;ul.append(li)});
 const tp=$("#hmtips");tp.innerHTML="";const tl=tipsOf(t);$("#hmth").hidden=!tl.length;tl.forEach(x=>{const li=document.createElement("li");li.textContent=x;tp.append(li)});m.hidden=false}
$("#helpb").onclick=showHelp;$("#hmx").onclick=()=>{$("#hm").hidden=true};
$("#hm").addEventListener("pointerdown",e=>{if(e.target===$("#hm"))$("#hm").hidden=true});
addEventListener("keydown",e=>{if(e.key==="Escape"){if(document.body.classList.contains("newpick")){showHome();return}$("#hm").hidden=true;$("#cm").hidden=true}});

/* Sneltoetsen: handig op desktop en op een iPad met toetsenbord. */
function closeOverlays(){clearHint();const f=$("#fin");if(f)f.hidden=true;const sd=$("#side");if(sd)sd.classList.remove("open");const ap=$("#archp");if(ap)ap.classList.remove("open");const pm=$("#pmp");if(pm)pm.classList.remove("open");$("#hm").hidden=true;$("#cm").hidden=true}
function overlayOpen(){const f=$("#fin"),h=$("#hint");return document.body.classList.contains("newpick")||!$("#hm").hidden||!$("#cm").hidden||(f&&!f.hidden)||(h&&getComputedStyle(h).display!=="none")||$("#side").classList.contains("open")||($("#archp")&&$("#archp").classList.contains("open"))||($("#pmp")&&$("#pmp").classList.contains("open"))}
addEventListener("keydown",e=>{const a=document.activeElement,tag=(a&&a.tagName)||"",typing=/INPUT|TEXTAREA|SELECT/.test(tag)||(a&&a.isContentEditable);if(typing)return;if(document.body.classList.contains("newpick")){if(e.key==="Escape"){e.preventDefault();showHome()}return}const k=e.key.toLowerCase();
 if((e.ctrlKey||e.metaKey)&&k==="z"){e.preventDefault();e.shiftKey?redo():undo();return}
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.key==="Escape"){closeOverlays();return}
 /* Spatie doet precies hetzelfde als tikken naast het bord. In dialogen blijft spatie zijn normale functie houden. */
 if((e.code==="Space"||e.key===" ")&&twoMode()&&!overlayOpen()){e.preventDefault();toggleTwoMode();return}
 if(k==="h"&&$("#hintb").style.display!=="none"&&!$("#hintb").disabled){e.preventDefault();hintGo();return}
 if(k==="c"&&$("#chk").style.display!=="none"&&!$("#chk").disabled){e.preventDefault();doCheck();return}
 /* A = aantekening. P blijft bewust als stille alias werken voor wie eraan gewend is. */
 if((k==="a"||k==="p")&&NOTET.includes(S.type)&&!S.done){e.preventDefault();setPotlood(!potlood);pulseEl($("#potb"));return}
 if(e.key==="?"){e.preventDefault();showHelp();return}
 if((e.key==="Enter"||e.key===" ")&&e.target===$("#time")){e.preventDefault();$("#time").click()}
});

/* Houd aria-statussen synchroon met de bestaande visuele .on-statussen. */
const A11Y_IDS=["nf","nc1","nc2","nc3","nc4","nx","pxb","pob","mb","mz","potb","today","prac"];
function syncA11y(){A11Y_IDS.forEach(id=>{const b=$("#"+id);if(b)b.setAttribute("aria-pressed",b.classList.contains("on")?"true":"false")});document.querySelectorAll("#tabs button").forEach(b=>{if(b.classList.contains("on"))b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});const pb=$("#potb");if(pb)pb.setAttribute("aria-keyshortcuts","A");for(const id of["nf","nc1","nc2","nc3","nc4","nx","pxb","pob","mb","mz"]){const b=$("#"+id);if(b)b.setAttribute("aria-keyshortcuts","Space")}}
syncA11y();
