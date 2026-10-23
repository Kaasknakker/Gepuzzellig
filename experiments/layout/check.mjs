// Handmatige browsercontrole: node experiments/layout/check.mjs [url]
// Vereist Playwright; PLAYWRIGHT_CHROMIUM_EXECUTABLE kan een bestaande browser aanwijzen.
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const url=process.argv[2]||pathToFileURL(path.resolve('proef-layout.html')).href;
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
let boards=0,hints=0;
try{
 for(const [name,width,height,phone]of [['iphone-small',320,667,true],['iphone',390,844,true],['ipad-portrait',820,1180,false],['ipad-landscape',1180,820,false],['desktop-4k',3840,2160,false]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:phone,userAgent:phone?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)':'Mozilla/5.0'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack));
  // Proef mag echte opslag niet lezen of wijzigen, ook niet op hetzelfde domein.
  await page.addInitScript(()=>{localStorage.setItem('pdprog4','{"sentinel":true}');localStorage.setItem('pd2','{"sentinel":true}')});
  await page.goto(url);await page.waitForFunction(()=>S.type==='bin'&&S.p&&S.cells?.length);await page.waitForTimeout(120);
  for(const t of ['bin','star','nono','hex','plus','mur']){
   await page.evaluate(([t,l])=>{setFreePreferences(t,l);load(t,true,true)},[t,phone?6:3]);
   await page.waitForFunction(t=>S.type===t&&!!S.p,t);await page.waitForTimeout(120);
   const geometry=await page.evaluate(()=>{
    const board=$(['hex','mur'].includes(S.type)?S.type==='hex'?'#hexsvg':'#mgrid':'#grid'),r=board.getBoundingClientRect(),area=$('#stage').getBoundingClientRect();
    return {type:S.type,left:r.left,right:r.right,top:r.top,bottom:r.bottom,stage:area.toJSON(),cs:CS,murOverflow:S.type==='mur'&&!PHONE?getComputedStyle($('#mclues')).overflow:null};
   });
   assert(geometry.left>=-1&&geometry.right<=width+1,`${name}/${t}: bord buiten breedte: ${JSON.stringify(geometry)}`);
   if(t!=='mur')assert(geometry.bottom<=geometry.stage.bottom+2,`${name}/${t}: bord buiten speelruimte: ${JSON.stringify(geometry)}`);
   if(t==='plus'&&!phone)assert(geometry.cs<=56,'Pluszle onnodig vergroot');
   if(t==='mur'&&!phone)assert.equal(geometry.murOverflow,'visible','Murdoku scrollt op groot scherm');
   boards++;
   await page.locator('#hintb').click();await page.waitForTimeout(60);
   if(await page.evaluate(()=>!!S.hint)){
    const stable=await page.evaluate(()=>({card:$('#hint').getBoundingClientRect().toJSON(),board:$(S.type==='hex'?'#hexsvg':S.type==='mur'?'#mgrid':'#grid').getBoundingClientRect().toJSON(),cur:JSON.stringify(S.cur)}));
    for(let level=1;level<=3;level++){
     if(level>1)await page.locator('#hint .hintnext').click();
     const state=await page.evaluate(()=>({level:S.hint.level,card:$('#hint').getBoundingClientRect().toJSON(),board:$(S.type==='hex'?'#hexsvg':S.type==='mur'?'#mgrid':'#grid').getBoundingClientRect().toJSON(),cur:JSON.stringify(S.cur),overlaps:testHintElements(S.hint,true).filter(r=>testOverlap($('#hint').getBoundingClientRect(),r,0)).length,shade:!$('#layoutShade').hasAttribute('hidden')}));
     assert.equal(state.level,level);assert.deepEqual(state.card,stable.card,`${name}/${t}: hint verspringt`);assert.deepEqual(state.board,stable.board,`${name}/${t}: bord verschuift`);assert.equal(state.cur,stable.cur,'Hint voert voortijdig zet uit');assert.equal(state.overlaps,0,`${name}/${t}: tekst bedekt benodigd gebied`);assert(state.shade,`${name}/${t}/${level}: overlay ontbreekt`);
     assert(state.card.left>=-1&&state.card.right<=width+1&&state.card.top>=0&&state.card.bottom<=height+1,`${name}/${t}: hint buiten beeld`);
     hints++;
    }
    // Meer uitleg blijft binnen dezelfde kaart; sluiten geeft bediening terug.
    await page.locator('#hint summary').click();await page.waitForTimeout(40);
    assert.deepEqual(await page.locator('#hint').boundingBox(),{x:stable.card.x,y:stable.card.y,width:stable.card.width,height:stable.card.height});
    if(['iphone','ipad-landscape','desktop-4k'].includes(name)&&['bin','hex','mur','plus'].includes(t))await page.screenshot({path:'/tmp/layout-'+name+'-'+t+'.png'});
    await page.locator('#hint .hx').click();await page.waitForTimeout(160);
    assert(await page.locator('#layoutShade').evaluate(el=>el.hasAttribute('hidden')));
   }
  }
  assert.deepEqual(errors,[],`${name}: browserfouten`);
  assert.equal(await page.evaluate(()=>localStorage.getItem('pdprog4')),'{"sentinel":true}');assert.equal(await page.evaluate(()=>localStorage.getItem('pd2')),'{"sentinel":true}');
  console.log('OK',name);await context.close();
 }
 console.log(`OK ${boards} borden, ${hints} hintstappen, vaste geometrie, geen overlap, tijdelijke opslag.`);
}finally{await browser.close()}
