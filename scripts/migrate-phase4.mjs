#!/usr/bin/env node
import fs from 'node:fs';
import {epoch} from './migration-io.mjs';

const args=new Set(process.argv.slice(2));
const apply=args.has('--apply'), input=[...args].find(x=>x.endsWith('.json'));
if(!input){console.error('Gebruik: node scripts/migrate-phase4.mjs <firestore-export.json> [--apply]\nZonder --apply is dit altijd een dry-run.');process.exit(2)}
const src=JSON.parse(fs.readFileSync(input,'utf8'));
const profiles=src.profiles||{},results=src.results||{},status=src.status||{};
const byPlayer=new Map(Object.entries(profiles).map(([authUid,p])=>[p.playerId,{authUid,...p}]));
const out={schemaVersion:3,playerResults:{},progress:{},stats:{legacyResults:0,mappedResults:0,legacyProgress:0,mappedProgress:0,orphans:[]}};
const safe=s=>encodeURIComponent(String(s)).replace(/\./g,'%2E');
for(const [legacyId,r] of Object.entries(results)){out.stats.legacyResults++;if(!byPlayer.has(r.uid)){out.stats.orphans.push({kind:'result',id:legacyId,playerId:r.uid});continue}
 const type=String(r.type||''),free=type.startsWith('v~'),token=free?type.slice(2).split('~')[0]:type,base=token.split('.')[0],puzzleDate=r.puzzleDate||r.date,puzzleKey=free?type:`${puzzleDate}:${type}`,id=safe(puzzleKey);
 (out.playerResults[r.uid]??={})[id]??={schemaVersion:3,playerId:r.uid,name:r.name||byPlayer.get(r.uid).displayName||'Speler',groupId:r.group||'',puzzleDate,completedOn:r.completedOn||'',puzzleType:base,resultType:type,mode:free?'free':'daily',difficulty:String(token.split('.')[1]||r.lvl||'normal'),variant:r.nv||'',deviceVariant:r.deviceVariant||'',puzzleKey,secs:r.secs,mist:r.mist||0,hints:r.hints||0,hintSteps:r.hintSteps||{},emo:r.emo||'',note:r.note||'',legacyResultId:legacyId,...(epoch(r.completedAt)?{completedAt:epoch(r.completedAt)}:{}),createdAt:epoch(r.createdAt)||1,updatedAt:Math.max(epoch(r.updatedAt),epoch(r.createdAt)||1)};out.stats.mappedResults++}
for(const [legacyId,st] of Object.entries(status)){for(const [ck,e] of Object.entries(st.progress||{})){out.stats.legacyProgress++;if(!byPlayer.has(st.uid)){out.stats.orphans.push({kind:'progress',id:legacyId,key:ck,playerId:st.uid});continue}
 const k=e.k||decodeURIComponent(ck),parts=k.split(':'),daily=k.startsWith('d:'),type=daily?(parts[2]||''):(parts[1]||''),base=type.split('.')[0],now=Number(e.at)||1;
 (out.progress[st.uid]??={})[ck]={schemaVersion:3,legacyKey:k,playerId:st.uid,puzzleType:base,mode:daily?'daily':'free',puzzleKey:k,difficulty:String(type.split('.')[1]||'normal'),variant:base==='nono'&&type.endsWith('c')?'color':'',deviceVariant:'',state:e,progressPercent:Number(e.pc)||0,startedAt:now,updatedAt:now};out.stats.mappedProgress++}}
out.stats.resultCountsMatch=out.stats.legacyResults===out.stats.mappedResults+out.stats.orphans.filter(x=>x.kind==='result').length;
out.stats.progressCountsMatch=out.stats.legacyProgress===out.stats.mappedProgress+out.stats.orphans.filter(x=>x.kind==='progress').length;
console.log(JSON.stringify(out.stats,null,2));
if(apply){const target=input.replace(/\.json$/,'-phase4.json');fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n');console.log('Geschreven:',target)}else console.log('Dry-run: niets geschreven. Voeg --apply toe om een deterministisch migratiebestand te maken.');
