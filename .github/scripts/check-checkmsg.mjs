import fs from 'node:fs';import assert from 'node:assert/strict';
/* S29: de uitslag van "Controleren" kwam op de iPhone over de Home-knop als er iemand online was (te weinig ruimte in de bovenbalk).
   placeCheckMsg probeert daarom de volledige tekst, dan een korte en dan alleen het symbool, en neemt de eerste die past. */
const s=fs.readFileSync('js/core.js','utf8');
assert.match(s,/m\._lv=\[/,'doCheck moet drie tekstvarianten bewaren');
const fn=s.slice(s.indexOf('function placeCheckMsg('),s.indexOf('$("#chk").onclick=doCheck'));
assert.match(fn,/for\(let i=0;i<lv\.length;i\+\+\)/,'placeCheckMsg moet de varianten langs lopen');
assert.match(fn,/to-from>=w\|\|i===lv\.length-1/,'de eerste variant die past moet gekozen worden');
assert.ok(!/Math\.max\(80,/.test(fn),'minimumbreedte 80 liet de uitslag over de knop lopen');
console.log('OK: uitslag van Controleren kiest een tekst die in de bovenbalk past');
