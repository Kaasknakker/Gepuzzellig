/* Proefpresentatie: dezelfde puzzels/afleidingen, uitsluitend tijdelijke proefdata. */
document.body.classList.add('layout-proef');
document.documentElement.removeAttribute('data-auth-pending');
const testBar=document.createElement('div');testBar.id='layoutBar';
testBar.innerHTML='<strong>Layoutproef 3</strong><select id="testSize" aria-label="Proefformaat"><option value="1">Klein</option><option value="2" selected>Normaal</option><option value="3">Groot</option></select><button id="testNew">Andere</button><button id="testCompare" aria-pressed="false">Origineel</button><a href="./">App</a>';
document.body.prepend(testBar);
let testOriginal=false,testRenderPass=false,testFrameId=0;
const testRect=el=>el&&el.getBoundingClientRect();
// De bestaande DOM/CSS bepaalt de ruimte. Geen vaste speelbreedte of extra footerhoogte.
function testAvailableRect(){
 const r=testRect($('#stage')),pb=testRect($('#pbot'));
 const side=!PHONE&&!testOriginal?document.body.classList.contains('layout-rail'):pb&&pb.width<innerWidth*.45&&pb.height>pb.width;
 const left=Math.max(4,r.left),right=Math.min(innerWidth-4,r.right),top=Math.max(r.top,testRect($('#layoutBar')).bottom);
 const bottom=side?innerHeight-8:pb?.top-4||innerHeight-8;
 return {left,right,top,bottom,width:Math.max(0,right-left),height:Math.max(0,bottom-top)};
}
function testFrame(){
 const active=!PHONE&&!testOriginal&&!document.body.classList.contains('home')&&!document.body.classList.contains('newpick');
 document.body.classList.toggle('layout-wide',active);
 if(!active){document.body.classList.remove('layout-rail','layout-bottom');window.LAYOUT_BOTTOM=false;return}
 const key=innerWidth+'x'+innerHeight;
 if(S._testModeKey!==key){S._testModeKey=key;S._testMode=innerWidth/innerHeight>=1.15?'rail':'bottom'}
 document.body.classList.toggle('layout-rail',S._testMode==='rail');document.body.classList.toggle('layout-bottom',S._testMode==='bottom');window.LAYOUT_BOTTOM=S._testMode==='bottom';
 const top=Math.max(testRect($('#layoutBar')).bottom,testRect($('#topbar'))?.bottom||0)+8;
 const pb=testRect($('#pbot')),bottom=window.LAYOUT_BOTTOM?pb.top-8:innerHeight-8;
 document.documentElement.style.setProperty('--layout-top',top+'px');document.documentElement.style.setProperty('--layout-height',Math.max(100,bottom-top)+'px');
 $('#playbox').style.setProperty('--test-y','0px');
 document.documentElement.style.setProperty('--bottom-shift','0px');
}
function testArrange(){
 if(!document.body.classList.contains('layout-wide')||!S.p)return;
 let area=testAvailableRect(),anchor=testRect($(S.type==='mur'?'#mgrid':'#playbox')),pb=testRect($('#pbot'));
 if(S._testMode==='rail'&&anchor.left<pb.width+20){
  S._testMode='bottom';testFrame();resetPuzzleFit();testBaseRender();testRefit();area=testAvailableRect();anchor=testRect($(S.type==='mur'?'#mgrid':'#playbox'));pb=testRect($('#pbot'));
 }
 const play=testRect($('#playbox')),y=Math.max(0,(area.height-play.height)/2);$('#playbox').style.setProperty('--test-y',y+'px');
 if(S._testMode==='bottom'){const r=testRect($('#playbox'));document.documentElement.style.setProperty('--bottom-shift',Math.min(0,r.bottom+12-pb.top)+'px')}
 if(S._testMode==='rail'){
  anchor=testRect($(S.type==='mur'?'#mgrid':'#playbox'));
  document.documentElement.style.setProperty('--rail-x',Math.max(8,anchor.left-pb.width-12)+'px');
  document.documentElement.style.setProperty('--rail-y',Math.max(area.top,Math.min(area.bottom-pb.height,anchor.top+(anchor.height-pb.height)/2))+'px');
 }
}
const testBaseRMur=rMur;
rMur=function(){
 if(!PHONE&&!testOriginal&&innerWidth>=740){
  const area=testAvailableRect(),clue=innerWidth<1000?220:300;
  S._murMS=Math.max(28,Math.min(88,Math.floor((innerWidth-2*(clue+20))/S.p.N),Math.floor((area.height-130)/S.p.N)));
 }
 testBaseRMur();
};
const testBaseRender=render;
render=function(){
 testFrame();testBaseRender();testRefit();testArrange();if(S.p)$('#testSize').value=String((S.lvl-1)%3+1);
 if(!testOriginal&&!testRenderPass&&S.p&&testFrameId!==S.id){testFrameId=S.id;requestAnimationFrame(()=>{testRenderPass=true;testFrame();resetPuzzleFit();testBaseRender();testRefit();testArrange();testRenderPass=false;if(S.hint)testHintPosition(S.hint)})}
};
function testRefit(){
 if(testOriginal||!S.p||document.body.classList.contains('home')||document.body.classList.contains('newpick'))return;
 const area=testAvailableRect();
 if(PHONE&&S.type==='mur'){const cl=$('#mclues');if(cl)cl.style.maxHeight=Math.max(60,area.bottom-testRect(cl).top)+'px';return}
 if(S.type==='hex'&&S._hexFit){
  const r=testRect($('#hexsvg')),ratio=Math.min((area.width-2)/r.width,(area.height-2)/r.height);
  if(ratio<1){S._hexFit.h=Math.max(20,(S._hexFit.h)*ratio-2);S._hexFit.wd=Math.max(20,S._hexFit.wd*ratio-2);rHex()}
  return;
 }
 if(!['bin','star','nono','plus'].includes(S.type)||!S._csFit)return;
 for(let n=0;n<4;n++){
  const r=testRect($('#grid')),ratio=Math.min((area.width-2)/r.width,(area.height-2)/r.height);
  if(ratio>=1)break;
  const v=Math.max(12,Math.floor(CS*ratio));if(v>=CS)break;S._csFit.v=v;testBaseRender();
 }
}
// Gebruik dezelfde aanwijzingen als de hint; alleen het kijkgebied wordt ruimer.
function testHexClues(h,all=false){
 const clues=h.move.proof?.clues||[];
 if(all||h.level>1||clues.length>2)return clues;
 const anchors=new Set(h.why||[]),lines=new Set(h.hexLines||[]);
 return clues.filter(o=>o.kind==='line'?lines.has(o.id):o.kind==='rest'?h.rest:anchors.has(o.id));
}
function testHexCells(h,all=false){
 const m=h.move,ids=new Set(all?[...(h.scope||[]),...(h.reasonScope||[]),...(m.cells||[]),...(m.why||[]),...(m.ghost||[])]:[...(h.why||[]),...(h.cells||[]),...(h.ghost||[])]);
 for(const o of testHexClues(h,all)){
  const positions=o.kind==='line'?S.p.lines[o.id]?.idx:o.c?.pos;
  for(const i of positions||[])if(i>=0&&i<S.p.n)ids.add(i);
  if((o.kind==='zone'||o.kind==='ring')&&o.id>=0)ids.add(o.id);
 }
 return [...ids];
}
function testContextCells(h,all=false){
 if(S.type==='hex')return testHexCells(h,all);
 const m=h.move,base=all?[...(h.scope||[]),...(h.reasonScope||[]),...(m.cells||[]),...(m.why||[]),...(m.ghost||[])]:[...(h.level>1?h.reasonScope||[]:h.scope||[]),...(h.why||[]),...(h.cells||[]),...(h.ghost||[])],ids=new Set(base);
 const p=S.p,N=p.N||p.W,H=p.H||N,addRoom=k=>p.reg?.forEach((v,i)=>{if(v===k)ids.add(i)}),row=k=>{for(let c=0;c<N;c++)ids.add(k*N+c)},col=k=>{for(let r=0;r<H;r++)ids.add(r*N+k)},placed=s=>S.cur.indexOf(s);
 if(S.type==='bin')for(const l of [m.proof?.line,m.proof?.other])for(const i of l?.ci||[])ids.add(i);
 if(S.type==='plus')for(const unit of [h.unit,m.unit])for(const i of S.pu?.[unit]?.cells||[])ids.add(i);
 if(S.type==='star'&&!m.proof&&m.cells?.length)addRoom(p.reg[m.cells[0]]);
 if(S.type==='mur'){
  const cards=new Set(all?[...(h.lookCards||[]),...(h.reasonCards||[]),...(m.cards||[])]:h.cards||[]),proof=m.proof,used=new Set();
  for(const subject of cards)for(const code of proof?.W?.[subject]||[])if(code[0]==='#')used.add(+code.split('|')[0].slice(1));
  let clues=(p.cd||[]).filter((c,j)=>cards.has(c.p)&&(!used.size||used.has(j)));
  if(!clues.length)clues=(p.cd||[]).filter(c=>cards.has(c.p));
  for(const c of clues){
   if(c.t==='room'||c.t==='notroom')addRoom(c.k);
   if(c.t==='row')row(c.k);if(c.t==='col')col(c.k);
   if(c.t==='tb'){row(0);row(N-1)}if(c.t==='lr'){col(0);col(N-1)}
   if(c.t==='corner')for(const i of [0,N-1,(N-1)*N,N*N-1])ids.add(i);
   if(['sit','nobj','lobj'].includes(c.t))p.obj.forEach((v,i)=>{if(v===c.T){ids.add(i);if(c.t!=='sit')addRoom(p.reg[i])}});
   if(['same','nsame','np','alone','nalone'].includes(c.t))for(const person of [c.p,c.x]){if(person==null)continue;const i=placed(person);if(i>=0)addRoom(p.reg[i])}
   if(['hi','lo','le','ri'].includes(c.t)&&c.x!=null){const i=placed(c.x);if(i>=0){if(c.t==='hi'||c.t==='lo')row(i/N|0);else col(i%N)}}
  }
  if(m.kind==='kill'){const i=placed(p.V);if(i>=0)addRoom(p.reg[i])}
  if(all||h.level>1)for(const person of cards)for(const code of proof?.W?.[person]||[]){
   const f=code.split('|');if(f[0][0]==='@'){const i=placed(+f[0].slice(1));if(i>=0){row(i/N|0);col(i%N)}}
   if(f[0]==='H')(+f[1]===0?row:col)(+f[2]);
   if(f[0]==='P'||f[0]==='L')for(const k of [+f[2],+f[3]])(+f[1]===0?row:col)(k);
   if(f[0]==='V1'||f[0]==='V3')addRoom(+f[1]);
  }
 }
 return [...ids].filter(i=>Number.isInteger(i)&&i>=0&&i<N*H);
}
function testHintElements(h,all=false){
 const m=h.move,ids=testContextCells(h,all),els=new Set();
 for(const i of ids){const e=S.type==='mur'?S.mcells?.[i]:S.type==='hex'?$('#hexsvg').querySelector('g[data-i="'+i+'"]'):S.cells?.[i];if(e){els.add(e);if(S.type==='hex')for(const txt of $('#hexsvg').querySelectorAll('text')){const er=e.getBBox();const x=+txt.getAttribute('x'),y=+txt.getAttribute('y');if(x>=er.x&&x<=er.x+er.width&&y>=er.y&&y<=er.y+er.height)els.add(txt)}}}
 if(S.type==='mur')for(const c of all?[...(h.lookCards||[]),...(h.reasonCards||[]),...(m.cards||[])]:h.cards||[]){const e=$('#mclues').querySelector('[data-c="'+c+'"]');if(e)els.add(e)}
 if(S.type==='bin'||S.type==='nono'){
  const W=S.p.W,H=S.p.H,selected=new Set(ids),rows=new Set(),cols=new Set();
  for(let r=0;r<H;r++)if(Array.from({length:W},(_,c)=>r*W+c).every(i=>selected.has(i)))rows.add(r);
  for(let c=0;c<W;c++)if(Array.from({length:H},(_,r)=>r*W+c).every(i=>selected.has(i)))cols.add(c);
  if(S.type==='bin'){for(const r of rows)if(S.rowc?.[r])els.add(S.rowc[r]);for(const c of cols)if(S.colc?.[c])els.add(S.colc[c])}
  else for(const el of $('#grid').querySelectorAll('.k[data-ln]')){const ln=el.dataset.ln;if((ln[0]==='r'&&rows.has(+ln.slice(1)))||(ln[0]==='c'&&cols.has(+ln.slice(1))))els.add(el)}
 }
 if(S.type==='plus')for(const u of all?[h.unit,m.unit]:[h.unit])if(u!=null&&S.plab?.[u])els.add(S.plab[u]);
 if(S.type==='hex')for(const j of testHexClues(h,all).filter(o=>o.kind==='line').map(o=>o.id)){const e=$('#hexsvg').querySelector('[data-line="'+j+'"],[data-l="'+j+'"]');if(e)els.add(e)}
 return [...els].map(el=>{
  const r=testRect(el),area=testAvailableRect(),cl=PHONE&&el.closest('#mclues'),c=cl?testRect(cl):area;
  const left=Math.max(area.left,c.left,r.left),top=Math.max(area.top,c.top,r.top),right=Math.min(area.right,c.right,r.right),bottom=Math.min(area.bottom,c.bottom,r.bottom);
  return {left,top,right,bottom,width:Math.max(0,right-left),height:Math.max(0,bottom-top)};
 }).filter(r=>r&&r.width&&r.height);
}
const testOverlap=(a,b,gap=8)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
function testChooseCard(h){
 const area=testAvailableRect(),needed=testHintElements(h,true),w=Math.min(PHONE?270:330,area.width-12),height=Math.min(PHONE?248:320,area.height-12);
 if(PHONE&&S.type==='mur'){const pb=testRect($('#pbot'));return {left:4,top:pb.top,width:innerWidth-8,height:innerHeight-pb.top,tray:true}}
 const make=(left,top)=>({left,top,width:w,height,right:left+w,bottom:top+height,tray:false});
 const board=testRect($('#playbox'));
 if(!PHONE)for(const c of [make(board.right+14,board.top+5),make(board.left,board.bottom+14)])if(c.left>=area.left&&c.right<=innerWidth-6&&c.bottom<=innerHeight-10&&!needed.some(r=>testOverlap(c,r)))return c;
 const xs=[area.right-w-5,area.left+5,area.left+(area.width-w)/2],ys=[area.bottom-height-5,area.top+5,area.top+(area.height-height)/2];
 for(const top of ys)for(const left of xs){const c=make(left,top);if(height>=200&&!needed.some(r=>testOverlap(c,r)))return c}
 if(PHONE){const pb=testRect($('#pbot'));return {left:4,top:pb.top,width:innerWidth-8,height:innerHeight-pb.top,tray:true}}
 for(const c of [make(board.right+14,area.top+5),make(area.left+5,board.bottom+14)])if(c.right<=innerWidth-6&&c.bottom<=innerHeight-10&&!needed.some(r=>testOverlap(c,r)))return c;
 const pb=testRect($('#pbot'));
 if(pb.height>pb.width)return {left:pb.left,top:pb.top,width:pb.width,height:Math.min(innerHeight-pb.top-8,480),tray:false,replaceControls:true};
 return {left:pb.left,top:pb.top,width:pb.width,height:pb.height,tray:true};
}
const testNS='http://www.w3.org/2000/svg',testShade=document.createElementNS(testNS,'svg');testShade.id='layoutShade';testShade.setAttribute('aria-hidden','true');testShade.setAttribute('hidden','');document.body.append(testShade);
function testPaintShade(h){
 testShade.replaceChildren();testShade.toggleAttribute('hidden',!h||!!h.stale);if(!h||h.stale)return;
 const area=testRect($('#playbox')),defs=document.createElementNS(testNS,'defs'),mask=document.createElementNS(testNS,'mask');mask.id='layoutMask';mask.setAttribute('maskUnits','userSpaceOnUse');mask.setAttribute('x','0');mask.setAttribute('y','0');mask.setAttribute('width',innerWidth);mask.setAttribute('height',innerHeight);
 const rect=(r,color)=>{const el=document.createElementNS(testNS,'rect');for(const [k,v]of Object.entries({x:r.left,y:r.top,width:r.width,height:r.height,fill:color}))el.setAttribute(k,v);return el};
 mask.append(rect(area,'white'));
 const hole=r=>{const left=Math.max(area.left,r.left-2),top=Math.max(area.top,r.top-2),right=Math.min(area.right,r.right+2),bottom=Math.min(area.bottom,r.bottom+2);if(right>left&&bottom>top)mask.append(rect({left,top,width:right-left,height:bottom-top},'black'))};
 if(S.type==='hex'){
  // Volg de echte zeshoeken: rechthoekige gaten zouden halve buurvakjes onthullen.
  for(const i of testHexCells(h)){
   const polygon=$('#hexsvg').querySelector('g[data-i="'+i+'"] polygon');if(!polygon)continue;
   const matrix=polygon.getScreenCTM(),points=[...polygon.points].map(p=>new DOMPoint(p.x,p.y).matrixTransform(matrix));
   const cutout=document.createElementNS(testNS,'polygon');cutout.setAttribute('points',points.map(p=>p.x+','+p.y).join(' '));cutout.setAttribute('fill','black');mask.append(cutout);
  }
  for(const o of testHexClues(h).filter(o=>o.kind==='line')){const label=$('#hexsvg').querySelector('[data-l="'+o.id+'"]');if(label)hole(testRect(label))}
 }else for(const r of testHintElements(h))hole(r);
 defs.append(mask);testShade.append(defs);const shade=rect(area,getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());shade.setAttribute('fill-opacity','.78');shade.setAttribute('mask','url(#layoutMask)');testShade.append(shade);
}
function testHintPosition(h){
 if(!h)return;
 if(PHONE&&S.type==='mur'&&h.cards?.length){const cl=$('#mclues'),el=cl.querySelector('[data-c="'+h.cards[0]+'"]');if(el){const c=testRect(cl),r=testRect(el);if(r.top<c.top)cl.scrollTop-=c.top-r.top+6;else if(r.bottom>c.bottom)cl.scrollTop+=r.bottom-c.bottom+6}}
 const b=$('#hint');b.classList.remove('side');document.body.classList.remove('hintdock','hintside');HINTPAD=0;HINTSIDE=0;
 const key=[innerWidth,innerHeight].join('x');if(!h.testCard||h.testCardKey!==key){h.testCard=testChooseCard(h);h.testCardKey=key}
 const c=h.testCard;b.classList.add('layout-hint');b.classList.toggle('layout-tray',c.tray);document.body.classList.toggle('layout-tray-open',c.tray||!!c.replaceControls);
 for(const [k,v]of Object.entries({left:c.left,top:c.top,width:c.width,height:c.height}))b.style.setProperty('--card-'+k,Math.round(v)+'px');
 b.style.display='block';
 if(!b.querySelector('.layout-copy')){
  const copy=document.createElement('div');copy.className='layout-copy';const actions=document.createElement('div');actions.className='layout-actions';
  for(const e of [...b.children])if(e.matches('.hintnext,.hintback')){if(c.tray&&e.matches('.hintback')){e.setAttribute('aria-label',e.textContent);e.textContent='←'}actions.append(e)}else if(!e.matches('.hx,.hht'))copy.append(e);
  b.append(copy,actions);
 }
 testClueEmphasis(h);testPaintShade(h);
}
function testClueEmphasis(h){
 document.querySelectorAll('.layout-clue-focus').forEach(e=>e.classList.remove('layout-clue-focus'));
 const block=h?.move.proof?.block,line=h?.move.proof?.line;if(!h||S.type!=='nono'||h.stale||h.level<2||!Number.isInteger(block)||!line?.ci?.length)return;
 const W=S.p.W,rows=new Set(line.ci.map(i=>i/W|0)),ln=rows.size===1?'r'+(line.ci[0]/W|0):'c'+(line.ci[0]%W),clue=$('#grid').querySelector('[data-ln="'+ln+'"]');
 const spans=clue?[...clue.querySelectorAll('.ncl')]:[];if(!spans.length&&clue)spans.push(...clue.querySelectorAll(':scope > div > span'));spans[block]?.classList.add('layout-clue-focus');
}
const testBaseLayoutHint=layoutHintCard;
layoutHintCard=function(h){if(testOriginal)return testBaseLayoutHint(h);repaintHint();testHintPosition(h)};
const testBaseHide=hideHint;
hideHint=function(){document.querySelectorAll('.layout-clue-focus').forEach(e=>e.classList.remove('layout-clue-focus'));testShade.setAttribute('hidden','');document.body.classList.remove('layout-tray-open');$('#hint').classList.remove('layout-hint','layout-tray');testBaseHide()};
const testBaseInvalidate=invalidateHint;
invalidateHint=function(){testBaseInvalidate();if(!testOriginal){testClueEmphasis(S.hint);testPaintShade(S.hint)}};
document.addEventListener('scroll',()=>{if(S.hint&&!testOriginal)testPaintShade(S.hint)},{passive:true,capture:true});
addEventListener('resize',()=>{requestAnimationFrame(()=>{testFrame();if(S.p){resetPuzzleFit();render()}if(S.hint&&!testOriginal){delete S.hint.testCard;testHintPosition(S.hint)}})});
$('#testSize').onchange=()=>{if(S.p){setFreePreferences(S.type,+$('#testSize').value+(PHONE?3:0),S.nv);load(S.type,true,true)}};
$('#testNew').onclick=()=>{const t=S.type||'bin';setFreePreferences(t,+$('#testSize').value+(PHONE?3:0),S.nv);load(t,true,true)};
$('#testCompare').onclick=()=>{clearHint();testOriginal=!testOriginal;window.LAYOUT_ORIGINAL=testOriginal;document.body.classList.toggle('layout-proef',!testOriginal);testFrame();$('#testCompare').setAttribute('aria-pressed',String(testOriginal));$('#testCompare').textContent=testOriginal?'Proefversie':'Origineel';resetPuzzleFit();if(S.p)render()};
const intro=document.createElement('p');intro.id='layoutIntro';intro.textContent='Proefversie: probeer de verschillende puzzels en de drie hintstappen. “Origineel” toont de bestaande indeling van hetzelfde bord. Je echte scores en voortgang worden hier niet gebruikt.';
const testHomeObserver=new MutationObserver(()=>{const wrap=$('#home .hwrap');if(wrap&&!wrap.querySelector('#layoutIntro'))wrap.prepend(intro)});testHomeObserver.observe($('#home'),{childList:true,subtree:true});
const testBaseHome=showHome;showHome=function(){document.body.classList.remove('layout-wide','layout-rail','layout-bottom');window.LAYOUT_BOTTOM=false;testBaseHome()};
setMe('layout-tester','Testspeler');testFrame();setFreePreferences('bin',PHONE?5:2);load('bin',true,true);
