import fs from 'node:fs';import assert from 'node:assert/strict';
/* S31: iOS zoomt in bij focus op een invoerveld met tekst kleiner dan 16 px (bijv. naam/e-mail bij de eerste keer openen) en zoomt niet vanzelf terug. */
const css=fs.readFileSync('css/app.css','utf8'),html=fs.readFileSync('index.html','utf8');
assert.match(css,/@media\(pointer:coarse\)\{input:not\(\[type=checkbox\]\)[^}]*font-size:16px!important\}\}/,'aanraakschermen: invoervelden minimaal 16 px');
assert.match(html,/name="viewport"[^>]*initial-scale=1/,'viewport moet initial-scale=1 houden');
assert.ok(!/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?!\d)/.test(html),'zoomen moet mogelijk blijven (toegankelijkheid): geen user-scalable=no/maximum-scale=1');
console.log('OK: invoervelden zoomen niet in op iOS en pinch-zoomen blijft mogelijk');
