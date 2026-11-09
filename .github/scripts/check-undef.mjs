import fs from 'node:fs';import path from 'node:path';
import {ESLint} from 'eslint';import globals from 'globals';
/* Vangnet tegen verwijzingen naar niet-bestaande variabelen (bijv. SCOREORIGIN in #103, `h` in #106): de app start dan gewoon en de
   fout komt pas bij gebruik van één knop. De scripts delen één globale scope; daarom worden ze in de laadvolgorde van index.html
   samengevoegd en samen gecontroleerd. js/firebase.js (module) wordt apart gecontroleerd met de globals van de gewone scripts. */
const html=fs.readFileSync('index.html','utf8');
const files=[...html.matchAll(/<script[^>]*\ssrc="(js\/[^"?]+)/g)].map(m=>m[1]).filter(f=>f!=='js/firebase.js');
if(files.length<10){console.error('FAIL: te weinig scripts gevonden in index.html ('+files.length+')');process.exit(1)}
const out=path.resolve('.tmp-undef');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
const all=path.join(out,'all.js');
fs.writeFileSync(all,files.map(f=>fs.readFileSync(f,'utf8')).join('\n;\n'));
const fb=path.join(out,'firebase.mjs');fs.copyFileSync('js/firebase.js',fb);
/* PDPERF wordt altijd met window.PDPERF afgeschermd gebruikt (meetlogger ?perf=1). */
const extra={PDPERF:'readonly'};
const rules={'no-undef':'error','no-const-assign':'error','no-dupe-keys':'error','no-redeclare':'error'};
const decl=[...fs.readFileSync(all,'utf8').matchAll(/^(?:function\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*))/gm)].map(m=>m[1]||m[2]);
const gl=Object.fromEntries(decl.map(n=>[n,'readonly']));
const eslint=new ESLint({overrideConfigFile:true,overrideConfig:[
 {files:['**/all.js'],languageOptions:{ecmaVersion:2022,sourceType:'script',globals:{...globals.browser,...extra}},rules},
 {files:['**/firebase.mjs'],languageOptions:{ecmaVersion:2022,sourceType:'module',globals:{...globals.browser,...extra,...gl}},rules}]});
const res=await eslint.lintFiles([all,fb]);
let bad=0;for(const r of res)for(const m of r.messages){bad++;const src=fs.readFileSync(r.filePath,'utf8').split('\n')[m.line-1]||'';console.error(`${path.basename(r.filePath)}:${m.line}:${m.column} ${m.ruleId}: ${m.message}\n   ${src.slice(Math.max(0,m.column-50),m.column+60)}`)}
fs.rmSync(out,{recursive:true,force:true});
if(bad){console.error(`FAIL: ${bad} verwijzing(en) naar niet-gedefinieerde variabelen`);process.exit(1)}
console.log(`OK: geen niet-gedefinieerde variabelen in ${files.length} scripts + firebase.js`);
