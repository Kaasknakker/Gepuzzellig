#!/usr/bin/env node
import fs from "node:fs";
const args=new Set(process.argv.slice(2)),apply=args.has("--apply"),input=[...args].find(x=>x.endsWith(".json"));
if(!input){console.error("Gebruik: node scripts/migrate-phase8.mjs <firestore-export.json> [--apply]\nZonder --apply is dit altijd een dry-run.");process.exit(2)}
const src=JSON.parse(fs.readFileSync(input,"utf8")),memberships=src.memberships||{},playerResults=src.playerResults||{},dailyPlans=src.dailyPlans||{};
const out={schemaVersion:5,groupActivity:{},groupDailyPlans:{},stats:{resultsSeen:0,activityProjected:0,plansSeen:0,plansProjected:0,skippedBeforeJoinedAt:0}};
const safe=s=>encodeURIComponent(String(s)).replace(/\./g,"%2E");
for(const [gid,ms] of Object.entries(memberships))for(const [playerId,m] of Object.entries(ms||{})){if(m.status!=="approved")continue;const joined=Number(m.joinedAt)||0;
 for(const r of Object.values(playerResults[playerId]||{})){out.stats.resultsSeen++;const completed=Number(r.completedAt)||Number(r.createdAt)||0;if(!completed||completed<joined){out.stats.skippedBeforeJoinedAt++;continue}const id=safe(playerId+"|"+r.puzzleKey);(out.groupActivity[gid]??={})[id]={schemaVersion:1,groupId:gid,playerId,name:r.name||m.displayName||"Speler",puzzleDate:r.puzzleDate,completedOn:r.completedOn||"",puzzleType:r.puzzleType,resultType:r.resultType,mode:r.mode,difficulty:r.difficulty,variant:r.variant||"",deviceVariant:r.deviceVariant||"",puzzleKey:r.puzzleKey,secs:r.secs,mist:r.mist||0,hints:r.hints||0,hintSteps:r.hintSteps||{},completedAt:completed};out.stats.activityProjected++}
 for(const [date,p] of Object.entries(dailyPlans[playerId]||{})){out.stats.plansSeen++;const created=Number(p.createdAt)||0;if(!created||created<joined){out.stats.skippedBeforeJoinedAt++;continue}(out.groupDailyPlans[gid]??={})[date+"_"+playerId]={schemaVersion:1,groupId:gid,playerId,displayName:m.displayName||"Speler",date,favoritePuzzleTypes:p.favoritePuzzleTypes||[],difficulties:p.difficulties||{},createdAt:created,sharedAt:created};out.stats.plansProjected++}}
console.log(JSON.stringify(out.stats,null,2));
if(apply){const target=input.replace(/\.json$/,"-phase8.json");fs.writeFileSync(target,JSON.stringify(out,null,2)+"\n");console.log("Geschreven:",target)}else console.log("Dry-run: niets geschreven. Voeg --apply toe om een deterministisch Fase-8 readmodel te maken.");
