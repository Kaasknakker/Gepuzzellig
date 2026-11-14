import fs from 'node:fs';import assert from 'node:assert/strict';
/* S34 (reads): aanwezigheid schrijft per 60 s en alleen voor een apparaat dat in de laatste 5 min is aangeraakt; online geldt tot 150 s. */
const s=fs.readFileSync('js/core.js','utf8');
assert.match(s,/const ONLINE_BEAT_MS=60000,ONLINE_STALE_MS=150000,ONLINE_IDLE_MS=300000/,'constanten ontbreken');
assert.match(s,/setInterval\(\(\)=>pingOnline\(false\),ONLINE_BEAT_MS\)/,'hartslaginterval moet ONLINE_BEAT_MS gebruiken');
assert.match(s,/now-lastActive>ONLINE_IDLE_MS\)\{if\(lastOnline\)clearOnline\(\);return\}/,'een apparaat zonder gebruik moet zich afmelden en stoppen met schrijven');
assert.match(s,/Date\.now\(\)-st\.onlineAt>=ONLINE_STALE_MS/,'online-drempel moet groter zijn dan de hartslag');
const n=x=>+x.match(/(\d+)/)[1];
assert.ok(n('x'+s.match(/ONLINE_STALE_MS=(\d+)/)[1])>=2*n('x'+s.match(/ONLINE_BEAT_MS=(\d+)/)[1]),'drempel moet minstens twee hartslagen zijn');
assert.match(s,/setInterval\(pollNu,90000\)/,'poll hoort per 90 s');
console.log('OK: aanwezigheid en poll schrijven/lezen zuinig');
