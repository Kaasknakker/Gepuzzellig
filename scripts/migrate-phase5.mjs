#!/usr/bin/env node
import fs from 'node:fs';
const args=new Set(process.argv.slice(2)),apply=args.has('--apply'),input=[...args].find(x=>x.endsWith('.json'));
if(!input){console.error('Gebruik: node scripts/migrate-phase5.mjs <firestore-export.json> [--apply]\nZonder --apply is dit altijd een dry-run.');process.exit(2)}
const src=JSON.parse(fs.readFileSync(input,'utf8')),profiles=src.profiles||{},groups=src.groups||{};
const out={schemaVersion:4,memberships:{},playerMemberships:{},stats:{profiles:Object.keys(profiles).length,groups:Object.keys(groups).length,legacyGroupedProfiles:0,mappedMemberships:0,soloProfiles:0,groupsWithoutAdmin:[],orphans:[]}};
const membersByGroup=new Map();
for(const [authUid,p] of Object.entries(profiles)){const gid=String(p.groupId||'');if(!gid){out.stats.soloProfiles++;continue}out.stats.legacyGroupedProfiles++;if(!groups[gid]){out.stats.orphans.push({kind:'profile-group',authUid,playerId:p.playerId,groupId:gid});continue}const arr=membersByGroup.get(gid)||[];arr.push({authUid,...p});membersByGroup.set(gid,arr)}
for(const [gid,g] of Object.entries(groups)){const members=membersByGroup.get(gid)||[];let admin=members.find(p=>p.authUid===g.ownerAuthUid);if(!admin&&members.length)admin=members[0];if(!admin){out.stats.groupsWithoutAdmin.push(gid);continue}
 for(const p of members){const role=p.playerId===admin.playerId?'admin':'member',joinedAt=Number(p.createdAt)||Number(g.createdAt)||1,row={playerId:p.playerId,displayName:String(p.displayName||'Speler').slice(0,30),role,status:'approved',requestedAt:joinedAt,approvedAt:joinedAt,joinedAt,approvedByPlayerId:admin.playerId,updatedAt:Math.max(joinedAt,Number(p.updatedAt)||0)};(out.memberships[gid]??={})[p.playerId]=row;(out.playerMemberships[p.playerId]??={})[gid]={groupId:gid,role,status:'approved',joinedAt,updatedAt:row.updatedAt};out.stats.mappedMemberships++}}
out.stats.countsMatch=out.stats.legacyGroupedProfiles===out.stats.mappedMemberships+out.stats.orphans.length;
console.log(JSON.stringify(out.stats,null,2));
if(apply){const target=input.replace(/\.json$/,'-phase5.json');fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n');console.log('Geschreven:',target)}else console.log('Dry-run: niets geschreven. Voeg --apply toe om een deterministisch migratiebestand te maken.');
