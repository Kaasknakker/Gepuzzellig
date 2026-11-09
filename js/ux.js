/* Gerichte gebruiksverbeteringen; puzzelregels en opgeslagen bordvormen blijven gelijk. */
const UX={
 saves:new Map(),lastBoard:'',focusIndex:0,
 esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 largeGroup(){const names=groupPlayers().map(playerName),longest=Math.max(8,...names.map(n=>n.length));return names.length>Math.max(2,Math.min(6,Math.floor((innerWidth-180)/(Math.min(longest,20)*7+36))))},
 dialog(title,build){
  let cover=document.getElementById('uxDialog');if(!cover){cover=document.createElement('div');cover.id='uxDialog';cover.className='uxcover';cover.hidden=true;cover.setAttribute('role','dialog');cover.setAttribute('aria-modal','true');cover.setAttribute('aria-labelledby','uxTitle');document.body.append(cover)}
  cover.replaceChildren();const card=document.createElement('div');card.className='hc uxcard';const head=document.createElement('h2');head.id='uxTitle';head.textContent=title;const close=document.createElement('button');close.id='uxClose';close.textContent='Sluiten';close.onclick=()=>cover.hidden=true;card.append(head);build(card,()=>cover.hidden=true);card.append(close);cover.append(card);cover.hidden=false;cover.onpointerdown=e=>{if(e.target===cover)cover.hidden=true};return cover;
 },
 text(parent,text,tag='p'){const el=document.createElement(tag);el.textContent=text;parent.append(el);return el},
 members(title='Groepsleden',status,select,filter,variant=true){
  this.dialog(title,card=>{if(status)this.text(card,variant?(PHONE?'Status voor de telefoonvariant.':'Status voor de groot-schermvariant.'):'Actieve groepsleden op alle apparaten.');else if(select)this.text(card,'Kies een naam voor het persoonlijke overzicht.');const label=document.createElement('label');label.textContent='Zoek een groepslid';const search=document.createElement('input');search.type='search';search.placeholder='Naam';label.append(search);const list=document.createElement('div');list.className='uxmembers';const empty=this.text(card,'Geen leden gevonden.');empty.hidden=true;card.append(label,list,empty);
   const draw=()=>{list.replaceChildren();groupPlayers().filter(p=>!filter||filter(p)).filter(p=>playerName(p).toLocaleLowerCase().includes(search.value.toLocaleLowerCase())).forEach((p,index)=>{const row=document.createElement(select?'button':'div');row.className='uxmember';const same=groupPlayers().filter(x=>playerName(x).toLocaleLowerCase()===playerName(p).toLocaleLowerCase()).length>1;this.text(row,playerName(p)+(same?' · lid '+(groupPlayers().indexOf(p)+1):'')+(uidOf(p)===uid?' (jij)':''),'b');this.text(row,status?status(p):'Groepslid','span');if(select)row.onclick=()=>{document.getElementById('uxDialog').hidden=true;select(uidOf(p))};row.dataset.member=uidOf(p);list.append(row)});empty.hidden=!!list.children.length};search.oninput=draw;draw();
  });
 },
 storage(k,patch){const old=this.saves.get(k)||{};if(patch.at&&old.at&&patch.at<old.at)return;this.saves.set(k,{...old,...patch});this.paintStorage()},
 saveInfo(){
  const k=S&&S.p?progKey(S.type,S.practice,S.date,S.sf):'',state=this.saves.get(k)||(k?undefined:[...this.saves.values()].find(v=>v.local===false||v.remote==='failed')),exists=k&&progAll()[k];
  const text=!exists&&!state?'Je voortgang wordt tijdens het puzzelen automatisch bewaard.':state&&state.local===false?'Bewaren op dit apparaat lukt niet. Houd deze pagina open en probeer opnieuw.':state&&state.remote==='saving'?'Op dit apparaat bewaard · synchroniseren…':state&&state.remote==='failed'?'Op dit apparaat bewaard · nog niet gedeeld.':state&&state.remote==='saved'?'Op dit apparaat bewaard en gesynchroniseerd.':PHONE?'Op dit apparaat bewaard · telefoonvoortgang blijft op dit apparaat.':'Op dit apparaat bewaard.';
  return{text,warning:!!(state&&(state.local===false||state.remote==='failed'))};
 },
 /* De opslagstatus staat alleen nog in het menu. Gaat er iets mis, dan verschijnt er een klein icoon naast het menu (of naast het profiel op Home); een tik erop opent een venstertje met uitleg en "Opnieuw proberen". */
 paintStorage(){
  const{text,warning}=this.saveInfo();
  document.querySelectorAll('[data-save-status]').forEach(el=>{el.hidden=!el.closest('#more,#pmp');const span=el.querySelector('span');if(span.textContent!==text)span.textContent=text;const retry=el.querySelector('button');retry.hidden=!warning;retry.onclick=()=>{persist(true);pullCloudProgress(true)}});
  this.placeSaveIcon(warning);
 },
 placeSaveIcon(warning){
  const b=this.saveBtn,pop=document.getElementById('savePop');if(!b)return;
   const home=document.body.classList.contains('home'),anchor=home?document.querySelector('#home .hprofile'):(document.getElementById('tbMore')||document.getElementById('pm'));
  /* In de puzzelkop houdt het icoon zijn plek ook zonder probleem (onzichtbaar), zodat de tijd en de rest van de balk niet verschuiven. */
  if(!warning){if(pop)pop.hidden=true;if(home||!anchor){b.hidden=true;return}b.hidden=false;b.classList.add('idle');if(b.nextElementSibling!==anchor)anchor.before(b);return}
  b.classList.remove('idle');
  if(anchor&&b.nextElementSibling!==anchor)anchor.before(b);
  b.hidden=!anchor;if(pop&&!pop.hidden)this.fillSavePop();
 },
 fillSavePop(){
  const pop=document.getElementById('savePop'),b=this.saveBtn;if(!pop||!b)return;
  pop.querySelector('p').textContent=this.saveInfo().text;const r=b.getBoundingClientRect();pop.style.top=Math.round(r.bottom+6)+'px';
 },
 savePop(){
  let pop=document.getElementById('savePop');if(pop&&!pop.hidden){pop.hidden=true;return}
  if(!pop){pop=document.createElement('div');pop.id='savePop';pop.className='savepop';pop.setAttribute('role','status');pop.innerHTML='<p></p><button type="button">Opnieuw proberen</button>';document.body.append(pop);pop.querySelector('button').onclick=()=>{persist(true);pullCloudProgress(true);pop.hidden=true};document.addEventListener('pointerdown',e=>{if(!pop.hidden&&!e.target.closest('#savePop,#saveWarn'))pop.hidden=true},true)}
  pop.hidden=false;this.fillSavePop();
 },
 storageMarkup(){return '<div class="uxsave" data-save-status role="status" aria-live="polite"><span></span><button type="button" hidden>Opnieuw proberen</button></div>'},
 randomSettings(not){
  let prefs;try{prefs=JSON.parse(lsGet('pdrandom')||'{}')}catch{prefs={}}
  this.dialog('Willekeurig puzzelen',(card,close)=>{
   this.text(card,'Kies welke soorten en niveaus je wilt. Je keuze blijft op dit apparaat bewaard.');const label=document.createElement('label');label.textContent='Moeilijkheid';const level=document.createElement('select');for(const [v,t]of [['current','Mijn ingestelde niveaus'],['all','Elk niveau']]){const o=document.createElement('option');o.value=v;o.textContent=t;level.append(o)}level.value=prefs.level||'current';label.append(level);card.append(label);
   const checks=[];for(const t of Object.keys(TYPES)){const l=document.createElement('label');l.className='uxcheck';const c=document.createElement('input');c.type='checkbox';c.value=t;c.checked=!prefs.types||prefs.types.includes(t);checks.push(c);l.append(c,document.createTextNode(TYPES[t]));card.append(l)}
   const error=this.text(card,'');error.setAttribute('role','status');const start=document.createElement('button');start.textContent='Start willekeurig';start.onclick=()=>{const types=checks.filter(c=>c.checked).map(c=>c.value);if(!types.length){error.textContent='Kies minstens één puzzelsoort.';return}lsSet('pdrandom',JSON.stringify({level:level.value,types}));close();startRandomFree(not||'')};card.append(start);
  });
 },
 chooseRandom(not){let prefs;try{prefs=JSON.parse(lsGet('pdrandom')||'{}')}catch{prefs={}}const valid=(prefs.types||Object.keys(TYPES)).filter(t=>TYPES[t]),others=valid.filter(t=>t!==not),types=others.length?others:valid.length?valid:Object.keys(TYPES),t=types[Math.floor(Math.random()*types.length)],l=prefs.level==='all'?rndLevel(t):lvOf(t);return{t,l,nv:t==='nono'?nonoVariant:'classic'}},
 board(){
  if(!S||!S.p)return;this.paintStorage();
  const key=S.id+':'+S.type,fresh=key!==this.lastBoard;if(fresh)this.focusIndex=0;
  const nodes=S.type==='hex'?[...document.querySelectorAll('#hexsvg g[data-i]')]:S.type==='mur'?S.mcells||[]:S.cells||[];
  if(['nono','plus'].includes(S.type))document.querySelectorAll('#grid [data-ln]').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.dataset.uxClue=el.dataset.ln;el.setAttribute('aria-label',(el.dataset.ln.startsWith('r')?'Rij ':'Kolom ')+(+el.dataset.ln.slice(1)+1)+': '+el.textContent+', eigen markering wijzigen')});if(S.type==='hex')document.querySelectorAll('#hexsvg g[data-l]').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.dataset.uxLine=el.dataset.l;el.setAttribute('aria-label','Lijnaanwijzing '+(+el.dataset.l+1)+', eigen markering wijzigen')});const width=S.p.W||S.p.N||1;nodes.forEach((el,i)=>{if(!el)return;el.setAttribute('role','button');el.tabIndex=i===Math.min(this.focusIndex,nodes.length-1)?0:-1;el.dataset.uxCell=i;let value=S.type==='hex'?(S.hx.rev.has(i)?'onthuld':'dicht'):S.type==='mur'?(S.cur[i]>=0?S.p.ppl[S.cur[i]]:S.cur[i]===-2?'kruis':'leeg'):(S.type==='bin'?S.cur[i]<0?'leeg':S.cur[i]===0?'kruis':'cirkel':S.type==='star'?S.cur[i]===2?'ster':S.cur[i]===1?'kruis':'leeg':S.type==='plus'?S.cur[i]===1?'omcirkeld':S.cur[i]===2?'weggestreept':'open':String((S.cur&&S.cur[i])??''));el.setAttribute('aria-label',(S.type==='hex'?'Vak '+(i+1):'Rij '+(Math.floor(i/width)+1)+', kolom '+(i%width+1))+': '+value+(noteVal(i)?', potloodnotitie'+(S.type==='mur'?': '+S.p.ppl.filter((name,j)=>noteVal(i)&(1<<j)).join(', '):''):''));});
  if(fresh)this.lastBoard=key;
 },
 home(){this.paintStorage();const h=document.getElementById('home');if(!h)return;
  h.querySelectorAll('[data-ux-people]').forEach(b=>b.onclick=()=>{const t=b.dataset.uxPeople,td=dstr(),raw=allRows();this.members(TYPES[t]+' · groepsstatus',p=>{const u=uidOf(p),ty=dayTypeDevice(t,td,PHONE),other=dayTypeDevice(t,td,!PHONE),done=raw.some(r=>!isFree(r)&&r.uid===u&&r.date===td&&r.type===ty)||u===uid&&!!myDone(td,t),o=raw.some(r=>!isFree(r)&&r.uid===u&&r.date===td&&r.type===other);return(done?'Klaar':busyOf(u,td,ty)?'Bezig':'Nog niet klaar')+(o?' · '+(PHONE?'Groot scherm':'Telefoon')+' ook klaar':'')})});
  h.querySelectorAll('[data-ux-members]').forEach(b=>b.onclick=()=>this.members('Alle groepsleden',null,u=>showScore(u)));
  h.querySelectorAll('[data-ux-live]').forEach(b=>b.onclick=()=>this.members('Wie puzzelt er nu?',p=>{const st=liveOf(uidOf(p));return st?liveTitle(st)+' · '+(st.onlineLvl>3?'telefoon':'groot scherm'):'Nu niet online'},null,p=>!!liveOf(uidOf(p)),false));
  const button=document.getElementById('hFree');if(button)button.onclick=()=>this.randomSettings('');
  const score=h.querySelector('.sviews');if(score&&this.largeGroup()){const selected=score.querySelector('.on')?.textContent||'Overzicht';score.innerHTML='<button data-ux-overview>▦ Overzicht</button><button data-ux-select>'+this.esc(selected==='Overzicht'?'Kies groepslid':selected)+'</button>';score.querySelector('[data-ux-overview]').onclick=()=>showScore('all');score.querySelector('[data-ux-select]').onclick=()=>this.members('Kies een groepslid',null,u=>showScore(u));const heroes=SCOREWHO==='all'?h.querySelector('.soverheroes'):null;if(heroes){const details=document.createElement('details');details.className='uxcharts';const summary=document.createElement('summary');summary.textContent='Resultaten van alle '+groupPlayers().length+' leden';heroes.before(details);details.append(summary,heroes)}const charts=SCOREWHO==='all'?h.querySelector('.sh2'):null;if(charts){const details=document.createElement('details');details.className='uxcharts';const summary=document.createElement('summary');summary.textContent='Grafieken van alle '+groupPlayers().length+' leden';charts.before(details);details.append(summary,charts)}}
 },
 init(){
  const menu=document.getElementById('more');if(menu)menu.insertAdjacentHTML('beforeend',this.storageMarkup()+'<p class="uxexplain">Telefoonpuzzels blijven op dit apparaat. Groot-schermpuzzels worden tussen grote schermen gedeeld zodra je online bent. Opgeloste resultaten worden wel gedeeld.</p>');
  const pmp=document.getElementById('pmp');if(pmp)pmp.insertAdjacentHTML('beforeend',this.storageMarkup());
  const so=document.getElementById('pshowonline');if(so){so.checked=showOnlineOn();so.onchange=()=>{lsSet('pdshowonline',so.checked?'1':'0');if(so.checked)pingOnline(true);else clearOnline(true)}}
  const sb=document.createElement('button');sb.type='button';sb.id='saveWarn';sb.className='savewarn';sb.hidden=true;sb.title='Opslag';sb.setAttribute('aria-label','Opslag: aandacht nodig');sb.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.2v.3"/></svg>';sb.onclick=e=>{e.stopPropagation();this.savePop()};this.saveBtn=sb;
  document.addEventListener('pointerup',e=>{if(!e.target.closest('#grid,#hexsvg,#mgrid,#mpal,#mclues'))return;requestAnimationFrame(()=>{if(!document.body.classList.contains('home'))this.board()})});
  window.addEventListener('online',()=>{persist(true);pullCloudProgress(true)});

  document.addEventListener('keydown',e=>{const palette=e.target.closest('#mpal [data-s]'),line=e.target.closest('[data-ux-line]'),clue=e.target.closest('[data-ux-clue]');if((palette||line||clue)&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopImmediatePropagation();if(line)hexClue('l'+line.dataset.uxLine);else if(clue){S.type==='nono'?nonoLine(clue.dataset.uxClue):plusLine(clue.dataset.uxClue);this.board()}else{const rect=palette.getBoundingClientRect();palette.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerType:'mouse',pointerId:99,clientX:rect.x+rect.width/2,clientY:rect.y+rect.height/2,button:0,buttons:1}))}return}const target=e.target.closest('[data-ux-cell]');if(!target||!S||S.done)return;const i=+target.dataset.uxCell,nodes=S.type==='hex'?[...document.querySelectorAll('#hexsvg g[data-i]')]:S.type==='mur'?S.mcells:S.cells,w=S.p.W||S.p.N||1;let to=i;
   if(e.key==='ArrowRight')to=Math.min(nodes.length-1,i+1);else if(e.key==='ArrowLeft')to=Math.max(0,i-1);else if(e.key==='ArrowDown')to=Math.min(nodes.length-1,i+w);else if(e.key==='ArrowUp')to=Math.max(0,i-w);else if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopImmediatePropagation();this.focusIndex=i;
    if(S.type==='mur'){const old=S.mxm;if(e.shiftKey)S.mxm=!old;murTap(i);S.mxm=old;paintMur()}else if(S.type==='hex')hexTap(i,e.shiftKey?(hexMode==='b'?'z':'b'):hexMode);else{const rect=target.getBoundingClientRect(),opts={bubbles:true,cancelable:true,pointerType:'mouse',pointerId:99,clientX:rect.x+rect.width/2,clientY:rect.y+rect.height/2,button:e.shiftKey?2:0,buttons:1};opts.buttons=opts.button===2?2:1;const down=new PointerEvent('pointerdown',opts);down._uxDirect=true;target.dispatchEvent(down);target.dispatchEvent(new PointerEvent('pointerup',{...opts,buttons:0}))}
    this.board();const node=S.type==='hex'?document.querySelector('#hexsvg g[data-i="'+i+'"]'):S.type==='mur'?S.mcells[i]:S.cells[i];node?.focus();return;
   }else return;if(S.type==='hex'){const rect=target.getBoundingClientRect(),x=rect.x+rect.width/2,y=rect.y+rect.height/2,dx=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0,dy=e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0;let best=Infinity;nodes.forEach((el,j)=>{if(j===i)return;const r=el.getBoundingClientRect(),vx=r.x+r.width/2-x,vy=r.y+r.height/2-y,forward=vx*dx+vy*dy,side=Math.abs(vx*dy-vy*dx);if(forward>1&&side<forward*1.8){const score=forward+side*2;if(score<best){best=score;to=j}}})}e.preventDefault();e.stopImmediatePropagation();this.focusIndex=to;nodes.forEach((el,j)=>el.tabIndex=j===to?0:-1);nodes[to]?.focus();
  },true);
  this.home();this.board();
 }
};

/* Opt-in meetlogger voor haperingen (iPad). Alleen actief met ?perf=1 (uit met ?perf=0). Registreert uitsluitend tijdstippen, duur en soort invoer;
   geen namen, puzzelinhoud of Firebase-gegevens. Paneel "perf" linksonder: Kopieer / Wis. */
(function(){
 let on=false;if(typeof window==="undefined")return;
 try{const q=location.search;if(/[?&]perf=1/.test(q))localStorage.setItem("pdperf","1");if(/[?&]perf=0/.test(q))localStorage.removeItem("pdperf");on=localStorage.getItem("pdperf")==="1"}catch(e){on=false}
 window.PDPERF=null;if(!on)return;
 const log=[],T0=performance.now(),MAX=500,t=()=>Math.round((performance.now()-T0)/100)/10;
 let saveT=0,penLast=-1e9,down=null;
 const store=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem("pdperflog",JSON.stringify(log.slice(-200)))}catch(e){log.push([t(),"opslag-logboek mislukt",""])}},4000)};
 const note=(kind,detail)=>{log.push([t(),kind,detail==null?"":String(detail)]);if(log.length>MAX)log.splice(0,log.length-MAX);store()};
 const dump=()=>"perf-log ("+navigator.userAgent.replace(/\s+/g," ").slice(0,90)+")\n"+log.map(l=>l[0]+"s  "+l[1]+(l[2]?"  "+l[2]:"")).join("\n");
 window.PDPERF={note,dump,log};
 /* Hoofdthread: vertraging van de eventloop en van beeldvernieuwing (Safari kent geen longtask). */
 let last=performance.now();setInterval(()=>{const n=performance.now(),d=n-last-100;last=n;if(d>120)note("eventloop-vertraging",Math.round(d)+" ms")},100);
 let raf=performance.now();const rl=()=>{const n=performance.now();if(n-raf>150&&!document.hidden)note("beeld-hapering",Math.round(n-raf)+" ms");raf=n;requestAnimationFrame(rl)};requestAnimationFrame(rl);
 /* Invoer: soort aanwijzer, doel en of een tik tijdens het bord vervangen werd. */
 const cont=e=>e.target&&e.target.closest?e.target.closest("#grid,#hexsvg,#mgrid"):null,tgt=e=>cont(e)?"speelvlak":(e.target&&e.target.closest&&e.target.closest("button,.btn,[role=button]")?"knop":"anders");
 addEventListener("pointerdown",e=>{if(e.pointerType==="pen")penLast=performance.now();down={c:cont(e),t:performance.now(),ty:e.pointerType};note("pointerdown",e.pointerType+" "+tgt(e)+(e.pointerType!=="pen"&&performance.now()-penLast<1500?" (pen "+Math.round(performance.now()-penLast)+" ms eerder)":""))},true);
 addEventListener("pointerup",e=>{const d=down;down=null;note("pointerup",e.pointerType+(d?" "+Math.round(performance.now()-d.t)+" ms na down":" zonder down")+(d&&d.c&&!document.contains(d.c)?" BORD VERVANGEN tijdens tik":""))},true);
 addEventListener("pointercancel",e=>note("pointercancel",e.pointerType),true);
 for(const ev of["visibilitychange","online","offline","pageshow","focus","blur"])addEventListener(ev,()=>note("gebeurtenis",ev+(ev==="visibilitychange"?" "+document.visibilityState:"")),true);
 /* Duur van opslaan, synchronisatie en opbouw (na het laden van core.js). */
 addEventListener("load",()=>{
  for(const f of["persist","board","mergeCloudProgress","renderHome","load","pollNu","resync","pullMine"]){const o=window[f];if(typeof o!=="function")continue;
   window[f]=function(){const s=performance.now(),r=o.apply(this,arguments),d=performance.now()-s;if(d>20||f==="load")note("duur "+f,Math.round(d)+" ms");return r}}
  const pc=window.pullCloudProgress;if(typeof pc==="function")window.pullCloudProgress=function(){const s=performance.now(),r=pc.apply(this,arguments);if(r&&r.then)r.then(v=>{if(performance.now()-s>300)note("ophalen voortgang traag",Math.round(performance.now()-s)+" ms (incl. netwerk)")},()=>note("ophalen voortgang mislukt",Math.round(performance.now()-s)+" ms"));return r};
  const lc=window.localStorage&&Storage.prototype.setItem;if(lc&&!Storage.prototype.__pdperf){Storage.prototype.__pdperf=1;Storage.prototype.setItem=function(k,v){const s=performance.now();lc.apply(this,arguments);const d=performance.now()-s;if(d>8&&k!=="pdperflog")note("localStorage schrijven",(String(k).startsWith("pd")?k:"sleutel")+" "+Math.round(String(v).length/1024)+" KB, "+Math.round(d)+" ms")}}
 });
 /* Paneel */
 addEventListener("DOMContentLoaded",()=>{
  const b=document.createElement("button"),p=document.createElement("div"),pre=document.createElement("pre"),row=document.createElement("div");
  b.textContent="perf";b.setAttribute("aria-label","Meetlogboek");Object.assign(b.style,{position:"fixed",left:"6px",bottom:"6px",zIndex:99999,opacity:.55,padding:"4px 8px",borderRadius:"8px"});
  Object.assign(p.style,{position:"fixed",left:"6px",bottom:"40px",right:"6px",maxHeight:"55vh",overflow:"auto",zIndex:99999,display:"none",padding:"8px",borderRadius:"10px",background:"var(--card,#222)",color:"var(--ink,#eee)",border:"1px solid var(--line,#555)"});
  pre.style.cssText="white-space:pre-wrap;margin:6px 0 0;font:12px/1.35 ui-monospace,monospace";
  const mk=(txt,fn)=>{const x=document.createElement("button");x.textContent=txt;x.onclick=fn;x.style.marginRight="8px";row.append(x)};
  mk("Kopieer",()=>{const s=dump();(navigator.clipboard?navigator.clipboard.writeText(s):Promise.reject()).then(()=>note("gekopieerd",""),()=>{pre.textContent=s;const r=document.createRange();r.selectNodeContents(pre);getSelection().removeAllRanges();getSelection().addRange(r)})});
  mk("Vernieuw",()=>{pre.textContent=dump()});mk("Wis",()=>{log.length=0;pre.textContent=""});mk("Uit",()=>{try{localStorage.removeItem("pdperf");localStorage.removeItem("pdperflog")}catch(e){note("uitzetten mislukt","")}location.search="?perf=0"});
  p.append(row,pre);b.onclick=()=>{p.style.display=p.style.display==="none"?"block":"none";pre.textContent=dump()};
  document.body.append(b,p);
 });
})();
/* Opt-in meting (?statusdebug=1) voor de wazige bovenrand in iOS: toont wat #statusfill en de veilige zone echt doen. */
(()=>{if(typeof window==="undefined"||!/[?&]statusdebug=1/.test(location.search))return;
 addEventListener("load",()=>{const p=document.createElement("pre");p.style.cssText="position:fixed;left:6px;right:6px;bottom:6px;z-index:2147483647;margin:0;padding:8px;font:11px/1.35 monospace;background:#000c;color:#fff;border-radius:8px;white-space:pre-wrap;pointer-events:none";
  const probe=document.createElement("div");probe.style.cssText="position:fixed;top:0;left:0;height:env(safe-area-inset-top);width:1px;visibility:hidden";document.body.append(probe);
  const show=()=>{const s=document.getElementById("statusfill"),r=s&&s.getBoundingClientRect(),c=s&&getComputedStyle(s),v=window.visualViewport;
   p.textContent=["standalone attr: "+("standalone" in document.documentElement.dataset),"navigator.standalone: "+navigator.standalone,"display-mode standalone: "+matchMedia("(display-mode: standalone)").matches,"safe-area-top (px): "+probe.getBoundingClientRect().height,"statusfill: "+(r?[r.top,r.left,r.width,r.height].map(x=>Math.round(x*10)/10).join(" / ")+" (boven/links/breed/hoog)":"ontbreekt"),"display/position/z: "+(c?[c.display,c.position,c.zIndex].join(" / "):"-"),"achtergrond: "+(c?c.backgroundColor:"-"),"viewport: "+innerWidth+"x"+innerHeight+(v?" vv "+Math.round(v.width)+"x"+Math.round(v.height)+" offTop "+v.offsetTop:""),"scrollY: "+Math.round(scrollY),"extra ruimte boven (--safe-extra): "+(document.documentElement.style.getPropertyValue("--safe-extra")||"standaard 6px"),"dpr: "+devicePixelRatio,"UA: "+navigator.userAgent.replace(/^Mozilla\/5.0 /,"").slice(0,70)].join("\n")};
  /* Knoppen om de extra ruimte bovenaan (iPhone) live te proberen, zonder opnieuw te installeren. */
  const bar=document.createElement("div");bar.style.cssText="position:fixed;left:6px;right:6px;bottom:calc(6px + var(--sdh,150px));z-index:2147483647;display:flex;gap:6px;flex-wrap:wrap";
  const cur=()=>{const v=parseInt(document.documentElement.style.getPropertyValue("--safe-extra"),10);return isNaN(v)?6:v};
  const set=v=>{v=Math.max(0,Math.min(60,v));document.documentElement.style.setProperty("--safe-extra",v+"px");try{localStorage.setItem("pdsafetop",String(v))}catch(e){console.warn("safetop niet bewaard",e&&e.message)}show()};
  [["−5",()=>set(cur()-5)],["−1",()=>set(cur()-1)],["+1",()=>set(cur()+1)],["+5",()=>set(cur()+5)],["0",()=>set(0)],["Standaard 6",()=>{document.documentElement.style.removeProperty("--safe-extra");try{localStorage.removeItem("pdsafetop")}catch(e){console.warn("safetop niet gewist",e&&e.message)}show()}]].forEach(([t,fn])=>{const b=document.createElement("button");b.textContent=t;b.style.cssText="font:600 14px system-ui;padding:10px 14px;border-radius:10px;border:1px solid #fff6;background:#000d;color:#fff";b.onclick=fn;bar.append(b)});
  show();setInterval(show,1000);document.body.append(p,bar);const fit=()=>bar.style.setProperty("--sdh",p.offsetHeight+6+"px");fit();setInterval(fit,1000)})})();
