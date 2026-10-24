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


// De twee uitlegpunten mogen verschillende gebieden op het bord aanwijzen.
vm.runInContext(`
S={type:'star',p:{N:3,K:1,reg:[0,0,1,0,2,1,2,2,1]}};
const focused={move:{proof:{rule:'regionsInLines',kind:'r',regions:[0],lines:[1]}},reasonSteps:['De gebieden hebben samen één ster nodig.','De lijnen hebben samen één ster nodig.']};
assert.equal(hintStepScope(focused,0).cells.join(), '0,1,3');
assert.equal(hintStepScope(focused,1).cells.join(), '3,4,5');
S={type:'hex',p:{n:6}};
const hexFocus={move:{proof:{clues:[{kind:'zone',id:0,c:{pos:[1,2]}},{kind:'line',id:4,c:{pos:[2,3,4]}}]}},reasonSteps:['Kijk naar het blauwe getal.','Kijk naar de lijn.']};
assert.equal(hintStepScope(hexFocus,0).cells.join(),'1,2,0');
assert.equal(hintStepScope(hexFocus,1).cells.join(),'2,3,4');
assert.equal(hintStepScope(hexFocus,1).lines.join(),'4');
`,context);
console.log('OK: aparte kijkgebieden voor gebieden, rijen en Hexcells-lijnen');

// De denkvraag verschijnt vóór de volledige uitleg; geen voortijdige zet.
vm.runInContext(`
const aha={key:'aha',move:{cells:[1],set:1,kind:'tech',text:'Uitgebreide afleiding',btn:'Vul in'},shortDirection:'Kijk naar deze rij.',reasonSteps:['Hier hoort het antwoord.'],explanationSteps:['Hier hoort het antwoord.'],thinkSteps:['Wat gebeurt er als je hier hetzelfde teken zet?'],thinkScope:[0,1],scope:[0,1,2],reasonScope:[0,1,2]};
S={type:'bin',p:{W:3},cur:[-1,-1,-1],hints:0,hint:aha};
showHintLevel(aha,2,false);
assert.equal(box.querySelector('ol').children[0].textContent,aha.thinkSteps[0]);assert.equal(box.querySelector('details'),null);assert.equal(aha.cells.length,0);assert.equal(aha.why.join(),'0,1');
showHintLevel(aha,3,false);assert.equal(box.querySelector('ol').children[0].textContent,aha.explanationSteps[0]);assert.equal(aha.cells.join(),'1');
`,context);
console.log('OK: eerst kijkgebied, dan denkvraag en vakjes, pas daarna volledige uitleg en zet');
