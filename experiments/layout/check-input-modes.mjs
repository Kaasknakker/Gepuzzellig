// Browserregressies voor standwissels, Murdoku-dubbeltik en groepsdetails.
// Geen accountverbinding: Firebase wordt geblokkeerd en opslag is tijdelijk.
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
try{
 for(const [width,height,phone] of [[320,667,true],[390,844,true],[820,1180,false],[1180,820,false],[1440,1000,false]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,userAgent:phone?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)':'Mozilla/5.0'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/js/firebase.js*',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await page.route(/^https:\/\//,r=>r.abort());
  await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.evaluate(()=>{document.documentElement.removeAttribute('data-auth-pending');document.querySelectorAll('.authcover').forEach(e=>e.hidden=true);setMe('mode-tester','Testspeler')});
  for(const type of ['bin','star','mur']){
   await page.evaluate(t=>{setFreePreferences(t,1);load(t,true,true)},type);
   await page.waitForFunction(t=>S.type===t&&!!S.p,type);await page.waitForTimeout(120);
   assert.equal(await page.locator('#inputmode button').count(),2);
   await page.locator('#inputmode button').last().click();
   assert(await page.evaluate(()=>S.type==='mur'?S.mxm:S.inputAlt),`${width}/${type}: tweede modus geselecteerd`);
   await page.waitForTimeout(300);await page.screenshot({path:`/tmp/gepuzzellig-${type}-alt-${width}.png`});
   await page.evaluate(()=>toggleTwoMode());
   assert.equal(await page.evaluate(()=>S.type==='mur'?!!S.mxm:!!S.inputAlt),false);
   const overlaps=await page.locator('#pbot').evaluate(e=>{const boxes=[...e.querySelectorAll('button')].filter(b=>b.offsetWidth&&b.offsetHeight).map(b=>b.getBoundingClientRect());return boxes.some((a,i)=>boxes.slice(i+1).some(b=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1))});assert.equal(overlaps,false,`${width}/${type}: bedieningsknoppen overlappen`);
   const rect=await page.locator('#inputmode').boundingBox();assert(rect&&rect.x>=0&&rect.y>=0&&rect.x+rect.width<=width+1&&rect.y+rect.height<=height+1,'standknoppen binnen scherm');
  }
  // Klikken op een naam in kruismodus moet die naam onmiddellijk kiezen.
  await page.evaluate(()=>{S.ms=0;S.mxm=true;paintMur()});
  await page.locator('#mpal [data-s="0"]').dispatchEvent('pointerdown',{pointerType:'touch',pointerId:1,button:0});
  assert.deepEqual(await page.evaluate(()=>[S.ms,S.mxm]),[0,false]);
  // Echte bordhandler: dubbeltik vervangt de eerste plaatsing en bewaart één undo.
  const i=await page.evaluate(()=>{S.cur.fill(-1);S.hist=[];S.redo=[];S.ms=1;S.mxm=false;murLastTap=null;paintMur();return S.p.obj.findIndex((_,i)=>!murBlocked(S.p,i))});
  for(let n=0;n<2;n++)await page.locator(`#mgrid [data-i="${i}"]`).dispatchEvent('pointerdown',{pointerType:'touch',pointerId:1,button:0});
  assert.deepEqual(await page.evaluate(i=>[S.cur[i],S.hist.length,S.ms,S.mxm],i),[-2,1,1,false]);
  assert.equal(await page.locator('#mpal [data-s="x"]').count(),0);
  await page.evaluate(()=>{S.cur=S.hist.pop();paintMur()});
  assert.equal(await page.evaluate(i=>S.cur[i],i),-1);
  // Namen worden volledig uitgeschreven, inclusief bij meerdere groepsleden.
  await page.evaluate(()=>{GROUP_MEMBERS=[{playerId:uid,displayName:'Testspeler'},{playerId:'aart',displayName:'Aart'},{playerId:'long',displayName:'Een lange groepsnaam'}];PROFILE_NAMES.aart='Aart';PROFILE_NAMES.long='Een lange groepsnaam';showHome()});
  await page.locator('.daygroup summary').first().click();
  assert(await page.locator('.daygroup').first().evaluate(e=>e.open));
  assert((await page.locator('.daygroup').first().innerText()).includes('Een lange groepsnaam'));
  await page.screenshot({path:`/tmp/gepuzzellig-home-${width}.png`,fullPage:true});
  await page.evaluate(()=>{setFreePreferences('bin',1);load('bin',true,true)});
  await page.waitForFunction(()=>S.type==='bin'&&!!S.p);await page.evaluate(()=>doCheck());
  assert(await page.locator('#checkfeedback.good').isVisible());
  await page.screenshot({path:`/tmp/gepuzzellig-bin-${width}.png`});
  assert.deepEqual(errors,[],'geen browserfouten');
  await context.close();console.log(`OK: ${width}×${height}, modi, Murdoku, groepsdetails en controlefeedback`);
 }
}finally{await browser.close()}
