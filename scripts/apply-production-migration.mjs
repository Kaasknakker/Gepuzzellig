#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";

const args=process.argv.slice(2),has=x=>args.includes(x),value=x=>{const i=args.indexOf(x);return i>=0?args[i+1]:""};
const input=args.find(x=>x.endsWith(".json")),project=value("--project"),confirm=value("--confirm-project");
if(!input){console.error("Gebruik: node scripts/apply-production-migration.mjs <fase11-kandidaat.json> --project gepuzzelig [--apply --confirm-project gepuzzelig]");process.exit(2)}
if(project!=="gepuzzelig"){console.error("BLOKKEREND: alleen expliciet productieproject gepuzzelig is toegestaan.");process.exit(3)}
const raw=fs.readFileSync(input,"utf8"),candidate=JSON.parse(raw),sha=x=>crypto.createHash("sha256").update(x).digest("hex");
const docs=[];
const add=(path,data)=>docs.push({path,data});
for(const [authUid,p] of Object.entries(candidate.profiles||{})){
 add(`profiles/${authUid}`,p);
 if(!p.playerId)throw new Error(`Profiel ${authUid} mist playerId`);
 add(`players/${p.playerId}`,{playerId:p.playerId,authUid,displayName:String(p.displayName||"Speler").slice(0,30),createdAt:Number(p.createdAt)||1,updatedAt:Math.max(Number(p.updatedAt)||0,Number(p.createdAt)||1)});
}
for(const [groupId,members] of Object.entries(candidate.memberships||{}))for(const [playerId,data] of Object.entries(members||{}))add(`groups/${groupId}/members/${playerId}`,data);
for(const [playerId,groups] of Object.entries(candidate.playerMemberships||{}))for(const [groupId,data] of Object.entries(groups||{}))add(`playerMemberships/${playerId}/groups/${groupId}`,data);
for(const name of ["playerResults","progress"])for(const [playerId,items] of Object.entries(candidate[name]||{}))for(const [id,data] of Object.entries(items||{}))add(`${name}/${playerId}/items/${id}`,data);
for(const name of ["groupActivity","groupDailyPlans"])for(const [groupId,items] of Object.entries(candidate[name]||{}))for(const [id,data] of Object.entries(items||{}))add(`${name}/${groupId}/items/${id}`,data);
const counts={};for(const d of docs){const root=d.path.split("/")[0];counts[root]=(counts[root]||0)+1}
const report={project,candidateSha256:sha(raw),documents:docs.length,collections:counts,paths:docs.map(d=>d.path),legacyDeletes:0,mode:has("--apply")?"apply":"dry-run"};
if(!has("--apply")){console.log(JSON.stringify(report,null,2));console.log("Dry-run: geen Firebase-verbinding en geen writes.");process.exit(0)}
if(confirm!=="gepuzzelig"){console.error("BLOKKEREND: --apply vereist --confirm-project gepuzzelig.");process.exit(4)}
const {initializeApp,applicationDefault}=await import("firebase-admin/app");const {getFirestore}=await import("firebase-admin/firestore");
const app=initializeApp({credential:applicationDefault(),projectId:"gepuzzelig"});const db=getFirestore(app);
if(app.options.projectId!=="gepuzzelig")throw new Error("Project guard faalde");
for(let i=0;i<docs.length;i+=400){const batch=db.batch();for(const d of docs.slice(i,i+400))batch.set(db.doc(d.path),d.data,{merge:true});await batch.commit()}
console.log(JSON.stringify({...report,written:docs.length},null,2));
console.log("Apply voltooid: alleen additieve/compatibele merge-upserts; legacydata niet verwijderd.");
