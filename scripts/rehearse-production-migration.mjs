#!/usr/bin/env node
import fs from "node:fs";import os from "node:os";import path from "node:path";import crypto from "node:crypto";import {execFileSync} from "node:child_process";
const args=new Set(process.argv.slice(2)),apply=args.has("--apply"),input=[...args].find(x=>x.endsWith(".json"));
if(!input){console.error("Gebruik: node scripts/rehearse-production-migration.mjs <productie-snapshot.json> [--apply]\nZonder --apply is dit uitsluitend een dry-run.");process.exit(2)}
const raw=fs.readFileSync(input,"utf8"),src=JSON.parse(raw),sha=x=>crypto.createHash("sha256").update(x).digest("hex"),stable=x=>JSON.stringify(x,Object.keys(x).sort());
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"gepuzzellig-phase10-"));
const run=(script,data,suffix)=>{const p=path.join(dir,suffix+".json");fs.writeFileSync(p,JSON.stringify(data));execFileSync(process.execPath,[script,p,"--apply"],{stdio:"pipe"});return JSON.parse(fs.readFileSync(p.replace(/\.json$/,"-"+suffix.replace("input","phase")+".json"),"utf8"))};
const p4=run("scripts/migrate-phase4.mjs",src,"input4"),p5=run("scripts/migrate-phase5.mjs",src,"input5"),p7=run("scripts/migrate-phase7.mjs",src,"input7");
let merged={...structuredClone(src),profiles:p7.profiles,playerResults:p4.playerResults,progress:p4.progress,memberships:p5.memberships,playerMemberships:p5.playerMemberships};
const p8=run("scripts/migrate-phase8.mjs",merged,"input8");merged={...merged,groupActivity:p8.groupActivity,groupDailyPlans:p8.groupDailyPlans};
const p9=run("scripts/migrate-phase9.mjs",merged,"input9");const target=p9;
const profiles=src.profiles||{},results=src.results||{},status=src.status||{},groups=src.groups||{};
const legacyProgress=Object.values(status).reduce((n,s)=>n+Object.keys(s?.progress||{}).length,0);
const migratedResults=Object.values(target.playerResults||{}).reduce((n,x)=>n+Object.keys(x||{}).length,0),migratedProgress=Object.values(target.progress||{}).reduce((n,x)=>n+Object.keys(x||{}).length,0);
const resultDates=o=>Object.values(o||{}).map(r=>String(r.completedOn||r.puzzleDate||r.date||"")).filter(Boolean).sort();
const logicalKey=r=>String(r.uid||"")+"|"+String(r.puzzleDate||r.date||"")+"|"+String(r.type||"");
const resultFingerprint=r=>JSON.stringify({uid:r.uid||"",group:r.group||"",date:r.puzzleDate||r.date||"",type:r.type||"",secs:Number(r.secs)||0,mist:Number(r.mist)||0,hints:Number(r.hints)||0,hintSteps:r.hintSteps||{},emo:r.emo||"",note:r.note||"",nv:r.nv||"",deviceVariant:r.deviceVariant||""});
const uniqueLegacy={},deduplications=[],duplicateConflicts=[];
for(const [legacyId,r] of Object.entries(results)){const key=logicalKey(r),prev=uniqueLegacy[key];if(!prev){uniqueLegacy[key]={legacyId,result:r};continue}if(resultFingerprint(prev.result)===resultFingerprint(r)){deduplications.push({logicalKey:key,keptLegacyId:prev.legacyId,deduplicatedLegacyId:legacyId})}else duplicateConflicts.push({logicalKey:key,legacyIds:[prev.legacyId,legacyId]})}
const legacyByPlayer={};for(const {result:r} of Object.values(uniqueLegacy)){(legacyByPlayer[r.uid]??=[]).push(r)}
const migratedByPlayer=target.playerResults||{};const players=[...new Set([...Object.keys(legacyByPlayer),...Object.keys(migratedByPlayer)])].sort();
const playerAggregates=players.map(playerId=>{const a=Object.values(legacyByPlayer[playerId]||{}),b=Object.values(migratedByPlayer[playerId]||{});return{playerId,uniqueLegacyResults:a.length,migratedResults:b.length,uniqueLegacySeconds:a.reduce((n,r)=>n+(Number(r.secs)||0),0),migratedSeconds:b.reduce((n,r)=>n+(Number(r.secs)||0),0),legacyDatesHash:sha(JSON.stringify(resultDates(Object.fromEntries(a.map((r,i)=>[i,r]))))),migratedDatesHash:sha(JSON.stringify(resultDates(Object.fromEntries(b.map((r,i)=>[i,r])))))}}); 
const blockers=[...p4.stats.orphans.map(x=>"phase4:"+x.kind+":"+x.id),...p5.stats.orphans.map(x=>"phase5:"+x.kind+":"+x.authUid),...p5.stats.groupsWithoutAdmin.map(x=>"phase5:group-without-admin:"+x)];
if(!p4.stats.resultCountsMatch)blockers.push("phase4:result-count-mismatch");if(!p4.stats.progressCountsMatch)blockers.push("phase4:progress-count-mismatch");if(!p5.stats.countsMatch)blockers.push("phase5:membership-count-mismatch");
for(const c of duplicateConflicts)blockers.push("duplicate-conflict:"+c.logicalKey);
for(const a of playerAggregates)if(a.uniqueLegacyResults!==a.migratedResults||a.uniqueLegacySeconds!==a.migratedSeconds||a.legacyDatesHash!==a.migratedDatesHash)blockers.push("aggregate:"+a.playerId);
const uniqueLegacyResults=Object.keys(uniqueLegacy).length;
const report={phase:10,source:{sha256:sha(raw),profiles:Object.keys(profiles).length,groups:Object.keys(groups).length,results:Object.keys(results).length,uniqueResults:uniqueLegacyResults,deduplicatedResults:deduplications.length,progress:legacyProgress},target:{sha256:sha(JSON.stringify(target)),profiles:Object.keys(target.profiles||{}).length,memberships:Object.values(target.memberships||{}).reduce((n,x)=>n+Object.keys(x||{}).length,0),results:migratedResults,progress:migratedProgress},checks:{sourceUnmodified:sha(fs.readFileSync(input,"utf8"))===sha(raw),resultCountsMatch:uniqueLegacyResults===migratedResults,progressCountsMatch:legacyProgress===migratedProgress,blockers,deduplications,duplicateConflicts,playerAggregates},sampleAccounts:Object.entries(target.profiles||{}).sort((a,b)=>a[0].localeCompare(b[0])).slice(0,5).map(([authUid,p])=>({authUid,playerId:p.playerId,groupId:p.groupId||"",memberships:Object.keys(target.playerMemberships?.[p.playerId]||{}),tutorial:p.preferences?.tutorials?.bin||""})),rollback:{sourceSha256:sha(raw),strategy:"Herstel de ongewijzigde bron-snapshot; deze repetitie schrijft nooit naar Firestore en verwijdert geen legacydata."}};
console.log(JSON.stringify(report,null,2));
if(blockers.length){console.error("BLOKKEREND: migratie-invarianten zijn niet groen.");process.exitCode=3}
if(apply&&!blockers.length){const base=input.replace(/\.json$/,""),out=base+"-phase10.json",rep=base+"-phase10-report.json";fs.writeFileSync(out,JSON.stringify(target,null,2)+"\n");fs.writeFileSync(rep,JSON.stringify(report,null,2)+"\n");console.log("Geschreven:",out,rep)}else if(!apply)console.log("Dry-run: bron en Firestore zijn niet gewijzigd.");
