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
  await page.evaluate(()=>{STAT=[{uid:'aart',group:$('#group').value,date:dstr(),type:dayTypeDevice('star',dstr(),PHONE),at:Date.now()}];renderHome()});
  const summary=page.locator('[data-day-group="star"] summary');assert.equal(await summary.getAttribute('title'),'0 klaar · 1 bezig');
  assert(await summary.locator('.daystatus').evaluate(e=>{const s=getComputedStyle(e);return s.whiteSpace==='nowrap'&&e.scrollWidth<=e.clientWidth+1}),'groepsstatus past op één regel');
  assert(await summary.evaluate(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.width>=150}),'ruim infovlak');
  await page.locator('.daygroup summary').first().click();
  assert(await page.locator('.daygroup').first().evaluate(e=>e.open));
  assert((await page.locator('.daygroup').first().innerText()).includes('Een lange groepsnaam'));
  await page.locator('.daygroup summary').nth(1).click();
  assert.equal(await page.locator('.daygroup[open]').count(),1,'maar één dagpuzzel uitgeklapt');
  assert(await page.locator('.daygroup').nth(1).evaluate(e=>e.open));
  await page.evaluate(()=>renderHome());
  assert.equal(await page.locator('.daygroup[open]').count(),1,'geopende regel blijft behouden bij statusupdate');
  await page.locator('.daygroup summary').nth(1).focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('.daygroup[open]'));
  assert.equal(await page.locator('.daygroup[open]').count(),0,'infovlak sluit met toetsenbord');
  await page.screenshot({path:`/tmp/gepuzzellig-home-info-${width}.png`,fullPage:true});
  const dayOverlap=await page.locator('.dayitem').evaluateAll(items=>items.some(e=>{const a=e.getBoundingClientRect(),b=e.querySelector('.dayaction').getBoundingClientRect(),arrow=e.querySelector('summary>i').getBoundingClientRect();return b.left<arrow.right||b.right>a.right+1||e.scrollWidth>e.clientWidth+1}));assert.equal(dayOverlap,false,'info en speelknop passen naast elkaar');
  await page.screenshot({path:`/tmp/gepuzzellig-home-${width}.png`,fullPage:true});
  await page.locator('.dayaction[data-day-t="star"]').click();await page.waitForFunction(()=>S.type==='star'&&!!S.p&&!document.body.classList.contains('home'));
  await page.evaluate(()=>showHome());
  // Een afgeronde puzzel houdt resultaatinformatie en een aparte Bekijk-knop.
  await page.evaluate(()=>{const k=dstr()+dayTypeDevice('bin',dstr(),PHONE);store[k]=123;SG[k]=$('#group').value;XS[k]={mist:0,hints:0};renderHome()});
  await page.locator('[data-day-group="bin"] summary').tap();
  assert((await page.locator('[data-day-group="bin"] .daydetail').innerText()).includes('2:03'));
  await page.locator('.dayaction[data-day-t="bin"]').tap();await page.waitForFunction(()=>S.type==='bin'&&!!S.p&&S.done);
  await page.evaluate(()=>{const k=dstr()+dayTypeDevice('bin',dstr(),PHONE);delete store[k];delete SG[k];delete XS[k];showHome()});
  await page.evaluate(()=>{const g=$('#group').value;STAT=[{uid:'aart',group:g,name:'Aart',onlineAt:Date.now(),onlineType:'star',onlinePractice:true,onlineLvl:2},{uid:'long',group:g,name:'Een lange groepsnaam',onlineAt:Date.now(),onlineType:'nono',onlinePractice:true,onlineLvl:1}];updatePeerLive()});
  const badge=page.locator('#home [data-live-badge]');assert.equal(await badge.innerText(),'2 online');
  await page.evaluate(()=>{window._testStatuses=STAT;STAT=STAT.slice(0,1);updatePeerLive()});assert((await badge.innerText()).includes('Aart is online'));assert((await badge.innerText()).includes('Star Battle · Vrij puzzelen · Normaal'));
  assert(await badge.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'online-activiteit past');
  await page.screenshot({path:`/tmp/gepuzzellig-online-single-${width}.png`});
  await page.evaluate(()=>{STAT=window._testStatuses;updatePeerLive()});await badge.click();
  assert(await page.locator('#peerLivePop').isVisible());await page.screenshot({path:`/tmp/gepuzzellig-online-pop-${width}.png`});assert((await page.locator('#peerLivePop').innerText()).includes('Star Battle'));assert((await page.locator('#peerLivePop').innerText()).includes('Nonogram'));
  await page.keyboard.press('Escape');assert.equal(await page.locator('#peerLivePop').isVisible(),false);
  await page.evaluate(()=>showScore('all'));assert.equal(await page.locator('#home [data-live-badge]').innerText(),'2 online');
  await page.evaluate(()=>{setFreePreferences('bin',1);load('bin',true,true)});
  await page.waitForFunction(()=>S.type==='bin'&&!!S.p);await page.evaluate(()=>doCheck());
  assert(await page.locator('#checkfeedback.good').isVisible());
  assert.equal(await page.locator('#peerLive').innerText(),'2 online');assert((await page.locator('#tbHome').innerText()).includes('Home'));
  await page.locator('#peerLive').click();assert(await page.locator('#peerLivePop').isVisible());await page.keyboard.press('Escape');
  assert.equal(await page.locator('#stage').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)','geen gekleurd deelvlak achter het bord');
  await page.evaluate(()=>showNewFree('bin',false));
  assert.equal(await page.locator('#stage').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)','ook geen deelvlak bij puzzelkeuze');
  await page.waitForTimeout(300);await page.screenshot({path:`/tmp/gepuzzellig-chooser-${width}.png`});
  await page.evaluate(()=>load('bin',true,false));await page.waitForFunction(()=>S.type==='bin'&&!!S.p);await page.evaluate(()=>doCheck());
  await page.screenshot({path:`/tmp/gepuzzellig-bin-${width}.png`});
  // Wis notities mag na het verdwijnen van de knop geen compatibiliteitsklik op Hint doorlaten.
  await page.evaluate(()=>{clearHint();S.nt={0:1};paintNotes();ub()});
  assert(await page.locator('#pbot').evaluate(e=>{const boxes=[...e.querySelectorAll('button')].filter(b=>b.offsetWidth&&b.offsetHeight).map(b=>b.getBoundingClientRect());return !boxes.some((a,i)=>boxes.slice(i+1).some(b=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1))}),'knoppen passen ook met notities');
  const wipe=page.locator('#notewipe'),wr=await wipe.boundingBox();assert(wr);assert(await wipe.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'wislabel past');
  await page.mouse.move(wr.x+wr.width/2,wr.y+wr.height/2);
  await wipe.dispatchEvent('pointerdown',{pointerType:'pen',pointerId:17,button:0,clientX:wr.x+wr.width/2,clientY:wr.y+wr.height/2});
  await page.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);e?.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'pen',pointerId:17,button:0,clientX:x,clientY:y}));e?.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,detail:1,clientX:x,clientY:y}))},[wr.x+wr.width/2,wr.y+wr.height/2]);
  assert.equal(await page.evaluate(()=>!!S.hint),false);assert.equal(await page.evaluate(()=>Object.keys(S.nt).length),0);
  for(const t of ['bin','star','nono','hex','plus','mur']){
   await page.evaluate(t=>{setFreePreferences(t,1);load(t,true,true)},t);await page.waitForFunction(t=>S.type===t&&!!S.p,t);await page.waitForTimeout(150);
   const top=await page.locator(phone?'#prow':'#topbar').evaluate(e=>[...e.querySelectorAll('button,.peerlive,#hexstat')].filter(b=>b.getClientRects().length&&getComputedStyle(b).display!=='none').map(b=>{const r=b.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}}));
   assert(top.every(r=>r.left>=-1&&r.right<=width+1),`${width}/${t}: bovenbalk past met onlineknop`);
   assert(await page.locator('#peerLive span').evaluate(e=>e.scrollWidth<=e.clientWidth+1),`${width}/${t}: online-aantal past`);
   if(width===1180&&t==='star'){
    await page.evaluate(()=>hintGo());await page.evaluate(()=>showHintLevel(S.hint,2,false));await page.screenshot({path:'/tmp/gepuzzellig-aha-second.png'});
    assert((await page.locator('#hint').innerText()).includes('?'));assert.equal(await page.locator('#hint .hintdetails').count(),0);
    await page.evaluate(()=>showHintLevel(S.hint,3,false));await page.screenshot({path:'/tmp/gepuzzellig-aha-full.png'});await page.evaluate(()=>clearHint());
   }
   if(phone&&t==='hex')await page.screenshot({path:`/tmp/gepuzzellig-hex-online-${width}.png`});
  }
  assert.deepEqual(errors,[],'geen browserfouten');
  await context.close();console.log(`OK: ${width}×${height}, modi, Murdoku, groepsdetails en controlefeedback`);
 }
}finally{await browser.close()}
