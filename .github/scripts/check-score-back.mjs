import fs from 'node:fs';import assert from 'node:assert/strict';
/* S30: SCOREORIGIN was nergens gedeclareerd. De terugknop van een persoonlijke pagina las hem en gaf een ReferenceError zolang hij nog nooit gezet was
   (bijv. persoonlijke pagina geopend vanaf het overzicht): de knop deed dan niets. */
const s=fs.readFileSync('js/core.js','utf8');
assert.match(s,/let SCOREORIGIN="home"/,'SCOREORIGIN moet gedeclareerd worden met beginwaarde "home"');
assert.match(s,/function showScore\([^)]*\)\{SCOREORIGIN="home";/,'showScore moet de herkomst op "home" zetten');
console.log('OK: terugknop van de persoonlijke pagina heeft een gedeclareerde herkomst');
