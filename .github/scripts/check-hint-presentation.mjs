import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Small DOM surface for testing the actual hint controls without a browser or account.
class Element {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.className='';this.events={};this.isConnected=true;this.open=false;this.classList={remove(){}}}
 append(e){this.children.push(e)}
 replaceChildren(){this.children=[]}
 setAttribute(){}
 contains(e){return this.children.includes(e)||this.children.some(c=>c.contains(e))}
 querySelector(sel){return this.children.find(c=>sel[0]==='.'?c.className.split(' ').includes(sel.slice(1)):c.tagName===sel)||this.children.map(c=>c.querySelector(sel)).find(Boolean)||null}
 addEventListener(name,fn){this.events[name]=fn}
 focus(){this.focused=true}
 toggle(){this.open=!this.open;this.events.toggle()}
}
const box=new Element();
const context=vm.createContext({assert,console,clearTimeout,document:{createElement:tag=>new Element(tag)},$:()=>box,box});
vm.runInContext(fs.readFileSync('js/hints.js','utf8'),context);
vm.runInContext(`
let S={type:'bin',p:{W:2},cur:[-1,-1],hints:0},PHONE=true,innerWidth=390,hintHideT;
let layouts=0,saves=0,actions=0;
layoutHintCard=()=>layouts++;const persist=()=>saves++,doStep=()=>actions++,clearHint=()=>{S.hint=null},hintGo=()=>{},sy=n=>String(n);
const h={key:'proof',move:{cells:[1],set:1,kind:'tech',text:'Langere afleiding.',btn:'Vul in'},shortDirection:'Bekijk de rij.',reasonSteps:['Tel de tekens.','Vergelijk met het maximum.'],reason:'De volledige afleiding.',scope:[0],reasonScope:[0],lookHexLines:[],reasonHexLines:[]};S.hint=h;
showHintLevel(h,1,false);
const next=box.querySelector('.hintnext');
assert.equal(box.querySelector('.hintbody').textContent,h.shortDirection);
assert.equal(box.querySelector('details'),null);assert.equal(h.cells.length,0);assert.equal(S.hints,1);
next.onclick();
assert.equal(h.level,2);assert.equal(box.querySelector('.hintnext'),next);assert.equal(next.focused,true);
assert.equal(box.querySelector('ol').children.length,2);assert.equal(h.cells.length,0);
const details=box.querySelector('details'),ledger=JSON.stringify(S.hintLedger),saved=saves,layout=layouts;
assert.equal(details.open,false);details.toggle();
assert.equal(h.level,2);assert.equal(S.hints,1);assert.equal(JSON.stringify(S.hintLedger),ledger);assert.equal(saves,saved);assert.equal(layouts,layout+1);assert.equal(S.cur.join(),'-1,-1');
next.onclick();
assert.equal(h.level,3);assert.equal(box.querySelector('.hintnext'),next);assert.equal(box.querySelector('details').open,false);
assert.equal(h.cells.join(),'1');assert.equal(box.querySelector('.hintbody').textContent,'Vul het dubbel omrande vakje met 1.');
assert.equal(actions,0);next.onclick();assert.equal(actions,1);
box.querySelector('.hintback').onclick();assert.equal(h.level,2);assert.equal(box.querySelector('details').open,true);
const oldDetails=box.querySelector('details');S.hint=null;const prior=layouts;oldDetails.toggle();assert.equal(layouts,prior,'Late toggle must not repaint a closed hint');
S.hint=h;h.stale=true;showHintLevel(h,2,false);assert.equal(box.querySelector('.hintback'),null);assert.equal(box.querySelector('.hintnext').textContent,'Vernieuw hint voor dit bord');assert.equal(actions,1);assert.equal(S.hints,1);
`,context);
console.log('Hintpresentatie: drie niveaus, inklappen, hinttelling, verborgen zet, knopidentiteit en verouderde hint gecontroleerd.');
