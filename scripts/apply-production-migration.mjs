#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";

const args=process.argv.slice(2), has=x=>args.includes(x), value=x=>{const i=args.indexOf(x);return i>=0?args[i+1]:""};
const input=args.find(x=>x.endsWith(".json")), project=value("--project"), confirm=value("--confirm-project");
if(!input){console.error("Gebruik: node scripts/apply-production-migration.mjs <phase10-kandidaat.json> --project gepuzzelig [--apply --confirm-project gepuzzelig]");process.exit(2)}
if(project!=="gepuzzelig"){console.error("BLOKKEREND: alleen expliciet productieproject gepuzzelig is toegestaan.");process.exit(3)}
const candidate=JSON.parse(fs.readFileSync(input,"utf8")), sha=x=>crypto.createHash("sha256").update(x).digest("hex");
const collections=["profiles","memberships","playerMemberships","playerResults","progress","groupActivity","groupDailyPlans"];
const flatten=(name,value)=>{const docs=[];if(name==="profiles"){for(const [id,data] of Object.entries(value||{}))docs.push({path:`profiles/${id}`,data});return docs}
 for(const [parent,children] of Object.entries(value||{}))for(const [id,data] of Object.entries(children||{}))docs.push({path:`${name}/${parent}/items/${id}`,data});return docs};
const docs=collections.flatMap(name=>flatten(name,candidate[name]));
const report={project,candidateSha256:sha(fs.readFileSync(input,"utf8")),documents:docs.length,collections:Object.fromEntries(collections.map(n=>[n,flatten(n,candidate[n]).length])),legacyDeletes:0,mode:has("--apply")?"apply":"dry-run"};
if(!has("--apply")){console.log(JSON.stringify(report,null,2));console.log("Dry-run: geen Firebase-verbinding en geen writes.");process.exit(0)}
if(confirm!=="gepuzzelig"){console.error("BLOKKEREND: --apply vereist --confirm-project gepuzzelig.");process.exit(4)}
const {initializeApp,applicationDefault}=await import("firebase-admin/app");const {getFirestore}=await import("firebase-admin/firestore");
const app=initializeApp({credential:applicationDefault(),projectId:"gepuzzelig"});const db=getFirestore(app);
if(app.options.projectId!=="gepuzzelig"){throw new Error("Project guard faalde")}
for(let i=0;i<docs.length;i+=400){const batch=db.batch();for(const d of docs.slice(i,i+400))batch.set(db.doc(d.path),d.data,{merge:true});await batch.commit()}
console.log(JSON.stringify({...report,written:docs.length},null,2));
console.log("Apply voltooid: alleen nieuwe/compatibele documenten geupsert; legacydata niet verwijderd.");
