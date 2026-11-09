import fs from 'node:fs';import assert from 'node:assert/strict';
/* S32: de afhandeling van "favoriet opgeslagen" gebruikte een niet-bestaande variabele h (ReferenceError). */
const s=fs.readFileSync('js/core.js','utf8'),l=s.split('\n').find(x=>x.startsWith('addEventListener("pdfavoritesaved"'));
assert.ok(l,'handler ontbreekt');assert.ok(!/[^\w$.#"]h\.querySelector/.test(l),'h is hier niet gedefinieerd');assert.ok(l.includes('$("#home")'),'knop moet in #home gezocht worden');
console.log('OK: favoriet-afhandeling zoekt de knop in #home');
