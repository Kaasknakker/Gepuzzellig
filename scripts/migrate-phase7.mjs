#!/usr/bin/env node
import fs from 'node:fs';
const args=new Set(process.argv.slice(2)),apply=args.has('--apply'),input=[...args].find(x=>x.endsWith('.json'));
if(!input){console.error('Gebruik: node scripts/migrate-phase7.mjs <firestore-export.json> [--apply]\nZonder --apply is dit altijd een dry-run.');process.exit(2)}
const src=JSON.parse(fs.readFileSync(input,'utf8')),profiles=src.profiles||{},active=['bin','star','nono','hex','plus','mur'];
const clean=p=>{const x=p&&typeof p==='object'?p:{},dd=x.dailyDifficulty&&typeof x.dailyDifficulty==='object'?x.dailyDifficulty:{};return{...x,favoritePuzzleTypes:Array.isArray(x.favoritePuzzleTypes)?x.favoritePuzzleTypes.slice():active.slice(),dailyDifficulty:{...Object.fromEntries(active.map(t=>[t,'normal'])),...dd}}};
const out={schemaVersion:4,profiles:{},stats:{profiles:Object.keys(profiles).length,backfilled:0,preserved:0,playerIdsChanged:0}};
for(const [uid,p] of Object.entries(profiles)){const had=!!p.preferences,prefs=clean(p.preferences);out.profiles[uid]={...p,preferences:prefs};had?out.stats.preserved++:out.stats.backfilled++;if(out.profiles[uid].playerId!==p.playerId)out.stats.playerIdsChanged++}
console.log(JSON.stringify(out.stats,null,2));
if(apply){const target=input.replace(/\.json$/,'-phase7.json');fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n');console.log('Geschreven:',target)}else console.log('Dry-run: niets geschreven. Voeg --apply toe om een deterministisch migratiebestand te maken.');
