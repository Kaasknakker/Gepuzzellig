// Handmatige browsercontrole: node experiments/layout/check.mjs [url]
// Vereist Playwright; PLAYWRIGHT_CHROMIUM_EXECUTABLE kan een bestaande browser aanwijzen.
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const isApp=process.argv.includes('--app');
const url=process.argv.slice(2).find(x=>!x.startsWith('--'))||pathToFileURL(path.resolve(isApp?'index.html':'proef-layout.html')).href;
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
let boards=0,hints=0;
try{
 for(const [name,width,height,phone]of [['iphone-small',320,667,true],['iphone',390,844,true],['ipad-portrait',820,1180,false],['ipad-landscape',1180,820,false],['desktop-4k',3840,2160,false]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:phone,userAgent:phone?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)':'Mozilla/5.0'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack));
  // Controle van de echte app gebruikt een lege lokale browsersessie zonder accountverbinding.
  if(isApp)await page.route('**/js/firebase.js*',r=>r.fulfill({contentType:'text/javascript',body:''}));
  // Proef mag echte opslag niet lezen of wijzigen, ook niet op hetzelfde domein.
  await page.addInitScript(()=>{localStorage.setItem('pdprog4','{"sentinel":true}');localStorage.setItem('pd2','{"sentinel":true}')});
  await page.goto(url);
  if(isApp)await page.evaluate(()=>{document.documentElement.removeAttribute('data-auth-pending');document.querySelectorAll('.authcover').forEach(e=>e.hidden=true);setMe('layout-tester','Testspeler');setFreePreferences('bin',PHONE?5:2);load('bin',true,true)});
  await page.waitForFunction(()=>S.type==='bin'&&S.p&&S.cells?.length);await page.waitForTimeout(120);
  for(const t of ['bin','star','nono','hex','plus','mur']){
   await page.evaluate(([t,l])=>{setFreePreferences(t,l);load(t,true,true)},[t,phone?6:3]);
   await page.waitForFunction(t=>S.type===t&&!!S.p,t);await page.waitForTimeout(120);
   const geometry=await page.evaluate(()=>{
    const board=$(['hex','mur'].includes(S.type)?S.type==='hex'?'#hexsvg':'#mgrid':'#grid'),r=board.getBoundingClientRect(),area=testAvailableRect();
    return {type:S.type,left:r.left,right:r.right,top:r.top,bottom:r.bottom,stage:area,cs:CS,murOverflow:S.type==='mur'&&!PHONE?getComputedStyle($('#mclues')).overflow:null};
   });
   assert(geometry.left>=-1&&geometry.right<=width+1,`${name}/${t}: bord buiten breedte: ${JSON.stringify(geometry)}`);
   if(phone)assert(await page.evaluate(()=>{const p=$('#prow').getBoundingClientRect(),b=$('#playbox').getBoundingClientRect();return b.top-p.bottom>=12}),`${name}/${t}: onvoldoende ruimte boven bord`);
   if(phone)assert(await page.evaluate(()=>{const a=testAvailableRect(),b=$('#playbox').getBoundingClientRect();return b.height>a.height||Math.abs((b.top+b.bottom)/2-(a.top+a.bottom)/2)<1}),`${name}/${t}: niet verticaal gecentreerd`);
   if(t!=='mur')assert(geometry.bottom<=geometry.stage.bottom+2,`${name}/${t}: bord buiten speelruimte: ${JSON.stringify(geometry)}`);
   if(t==='plus'&&!phone)assert(geometry.cs>56&&geometry.cs<=96,'Pluszle passend en groter: '+JSON.stringify(geometry));
   if(!phone)assert(Math.abs((geometry.left+geometry.right)/2-(geometry.stage.left+geometry.stage.right)/2)<2,`${name}/${t}: bord niet gecentreerd`);
   if(t==='mur'&&!phone)assert.equal(geometry.murOverflow,'visible','Murdoku scrollt op groot scherm');
   if(t==='mur'&&!phone)assert(await page.evaluate(()=>{const a=testAvailableRect(),g=$('#mgrid').getBoundingClientRect(),p=$('#playbox').getBoundingClientRect();return g.top-6>=a.top&&p.bottom+6<=a.bottom}),`${name}: Murdoku-rand/personen/uitleg buiten beeld`);
   if(t==='mur'){
    const before=await page.locator('#mgrid').boundingBox();
    await page.evaluate(()=>toggleTwoMode());await page.waitForTimeout(100);
    assert.deepEqual(await page.locator('#mgrid').boundingBox(),before,`${name}: Murdoku groeit bij standwissel`);
    await page.evaluate(()=>toggleTwoMode());
   }
   // Vergelijk dezelfde puzzel: de proef mag geen ruimte voor een lege footer reserveren.
   if(!isApp){
   await page.locator('#testCompare').click();await page.waitForTimeout(80);
   const original=await page.evaluate(()=>{const r=$(S.type==='hex'?'#hexsvg':S.type==='mur'?'#mgrid':'#grid').getBoundingClientRect(),p=$('#pbot').getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,right:r.right,bottom:r.bottom,footer:p.height,footerTop:p.top,side:p.height>p.width}});
   await page.locator('#testCompare').click();await page.waitForTimeout(80);
   const restored=await page.evaluate(()=>({footer:$('#pbot').getBoundingClientRect().height,board:$(S.type==='hex'?'#hexsvg':S.type==='mur'?'#mgrid':'#grid').getBoundingClientRect().toJSON()}));
   if(phone)assert(Math.abs(restored.footer-original.footer)<1,`${name}/${t}: verhoogde lege knoppenstrook`);
   const originalFits=original.left>=0&&original.right<=width&&original.bottom<=(original.side?height:original.footerTop)+1;
   // Alleen de nieuwe tussenruimte (12 px) en afronding mogen maat kosten.
   const fitRatio=Math.max(0,1-12/original.height)*.97;
   if(phone&&t!=='mur'&&originalFits){assert(restored.board.width>=original.width*fitRatio,`${name}/${t}: kleiner dan passend origineel`);assert(restored.board.height>=original.height*fitRatio,`${name}/${t}: onnodig lagere puzzel`)}
   }
   if(!phone)assert(await page.evaluate(()=>{const b=$(S.type==='mur'&&document.body.classList.contains('layout-rail')?'#mgrid':'#playbox').getBoundingClientRect(),p=$('#pbot').getBoundingClientRect();return !testOverlap(b,p,0)&&(document.body.classList.contains('layout-rail')?Math.abs(b.left-p.right-12)<2:p.top>=b.bottom&&p.top-b.bottom<16)}),`${name}/${t}: bediening niet naast/onder bord`);
   assert(await page.evaluate(()=>{
    const make=(extra={})=>({level:1,scope:[],why:[],cells:[],cards:[],move:{cells:[]},...extra});
    if(S.type==='mur'){const c=S.p.cd.find(c=>c.t==='room');if(c){const ids=testContextCells(make({cards:[c.p]}));return S.p.reg.every((k,i)=>k!==c.k||ids.includes(i))}}
    if(S.type==='bin'){const W=S.p.W,a=Array.from({length:W},(_,i)=>i),b=a.map(i=>i+W);return [...a,...b].every(i=>testContextCells(make({move:{proof:{line:{ci:a},other:{ci:b}}}})).includes(i))}
    if(S.type==='plus')return S.pu[0].cells.every(i=>testContextCells(make({unit:0})).includes(i));
    if(S.type==='star'){const ids=testContextCells(make({move:{cells:[0]}}));return S.p.reg.every((k,i)=>k!==S.p.reg[0]||ids.includes(i))}
    return true;
   }),`${name}/${t}: volledig hintgebied ontbreekt`);
   boards++;
   if(t==='hex')assert(await page.evaluate(()=>{
    const p=S.p,j=p.lineShow[0],z=(p.zs||[])[0]??(p.zh||[])[0];
    const make=(clues,scope=[],lines=[])=>({level:1,scope,reasonScope:scope,why:scope,cells:[],hexLines:lines,move:{cells:[],proof:{clues}}});
    const line={kind:'line',id:j,c:p.lines[j].clue},lh=make([line],[],[j]);
    if(!p.lines[j].idx.every(i=>testHexCells(lh).includes(i)))return false;
    if(z!=null){const zone={kind:'zone',id:z,c:p.zone[z]},zh=make([zone],[z]);if(![z,...zone.c.pos.filter(i=>i>=0)].every(i=>testHexCells(zh).includes(i)))return false;
     const combined=make([line,zone],[],[j]),first=testHexCells(combined),later=testHexCells(combined,true);if(!zone.c.pos.filter(i=>i>=0).every(i=>later.includes(i)))return false;
     if(first.some(i=>!p.lines[j].idx.includes(i)))return false;
     const three=make([line,zone,line],[],[j]);if(!zone.c.pos.filter(i=>i>=0).every(i=>testHexCells(three).includes(i)))return false;
    }return true;
   }),`${name}: Hexcells moet volledige lijn/zone vrijhouden zonder volgende stap te verklappen`);
   await page.locator('#hintb').click();await page.waitForTimeout(60);
   if(await page.evaluate(()=>!!S.hint)){
    const stable=await page.evaluate(()=>({card:$('#hint').getBoundingClientRect().toJSON(),board:$(S.type==='hex'?'#hexsvg':S.type==='mur'?'#mgrid':'#grid').getBoundingClientRect().toJSON(),cur:JSON.stringify(S.cur)}));
    for(let level=1;level<=3;level++){
     if(level>1)await page.locator('#hint .hintnext').click();
     const state=await page.evaluate(()=>({level:S.hint.level,card:$('#hint').getBoundingClientRect().toJSON(),board:$(S.type==='hex'?'#hexsvg':S.type==='mur'?'#mgrid':'#grid').getBoundingClientRect().toJSON(),cur:JSON.stringify(S.cur),overlaps:testHintElements(S.hint,true).filter(r=>testOverlap($('#hint').getBoundingClientRect(),r,0)).length,shade:!$('#layoutShade').hasAttribute('hidden'),hexCuts:S.type==='hex'?$('#layoutMask').querySelectorAll('polygon').length:0,hexNeeded:S.type==='hex'?testHexCells(S.hint).length:0}));
     assert.equal(state.level,level);assert.deepEqual(state.card,stable.card,`${name}/${t}: hint verspringt`);assert.deepEqual(state.board,stable.board,`${name}/${t}: bord verschuift`);assert.equal(state.cur,stable.cur,'Hint voert voortijdig zet uit');assert.equal(state.overlaps,0,`${name}/${t}: tekst bedekt benodigd gebied`);assert(state.shade,`${name}/${t}/${level}: overlay ontbreekt`);if(t==='hex')assert.equal(state.hexCuts,state.hexNeeded,'Elk betrokken Hexcells-vakje heeft een volledig zeshoekig gat');
     assert(state.card.left>=-1&&state.card.right<=width+1&&state.card.top>=0&&state.card.bottom<=height+1,`${name}/${t}: hint buiten beeld`);
     hints++;
    }
    // Meer uitleg blijft binnen dezelfde kaart; sluiten geeft bediening terug.
    if(await page.locator('#hint summary').count())await page.locator('#hint summary').click();await page.waitForTimeout(40);
    assert.deepEqual(await page.locator('#hint').boundingBox(),{x:stable.card.x,y:stable.card.y,width:stable.card.width,height:stable.card.height});
    if(['iphone','ipad-landscape','desktop-4k'].includes(name)&&['bin','hex','mur','plus'].includes(t))await page.screenshot({path:'/tmp/layout-'+name+'-'+t+'.png'});
    await page.locator('#hint .hx').click();await page.waitForTimeout(160);
    assert(await page.locator('#layoutShade').evaluate(el=>el.hasAttribute('hidden')));
   }
  }
  assert.deepEqual(errors,[],`${name}: browserfouten`);
  if(!isApp){assert.equal(await page.evaluate(()=>localStorage.getItem('pdprog4')),'{"sentinel":true}');assert.equal(await page.evaluate(()=>localStorage.getItem('pd2')),'{"sentinel":true}')}
  console.log('OK',name);await context.close();
 }
 console.log(`OK ${boards} borden, ${hints} hintstappen, vaste geometrie, geen overlap, tijdelijke opslag.`);
}finally{await browser.close()}
