import fs from 'node:fs';import assert from 'node:assert/strict';
/* S28 (Firestore-reads): het scorebord las bij elke profielmelding de hele geschiedenis opnieuw (7x per koude start).
   startBoard() moet daarom alleen opnieuw opstarten bij andere speler/groep/lidmaatschap of nieuwe dag, of bij force===true. */
const core=fs.readFileSync('js/core.js','utf8'),fb=fs.readFileSync('js/firebase.js','utf8');
const fn=core.split('\n').find(l=>l.startsWith('function startBoard('));
assert.ok(fn,'startBoard ontbreekt');
assert.match(fn,/function startBoard\(force\)/,'startBoard moet een force-parameter hebben');
assert.match(fn,/force!==true&&unsub&&key&&key===boardKeyNow&&listenDate===dstr\(\)\)return/,'guard ontbreekt: herstart zonder wijziging moet overgeslagen worden');
assert.match(fb,/boardKey:\(\)=>/,'PD_DB.boardKey ontbreekt');
// event-listeners geven een Event door: dat mag nooit als force tellen (alleen === true)
assert.ok(!/force==/.test(fn.replace(/force!==true/,'')),'force mag alleen strikt met === true vergeleken worden');
// bewust geforceerde herstarts blijven bestaan
const forced=(core.match(/startBoard\(true\)/g)||[]).length;
assert.ok(forced>=4,'geforceerde herstarts (fout, online, >30 min, pageshow) ontbreken: '+forced);
console.log('OK: scorebord start alleen opnieuw bij echte wijziging ('+forced+' geforceerde paden)');
