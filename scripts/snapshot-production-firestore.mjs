#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";

const args=process.argv.slice(2),value=x=>{const i=args.indexOf(x);return i>=0?args[i+1]:""};
const project=value("--project"),output=value("--output");
if(project!=="gepuzzelig"){console.error("BLOKKEREND: snapshot mag alleen expliciet uit productieproject gepuzzelig lezen.");process.exit(3)}
if(!output||!output.endsWith(".json")){console.error("Gebruik: node scripts/snapshot-production-firestore.mjs --project gepuzzelig --output <snapshot.json>");process.exit(2)}
if(fs.existsSync(output)){console.error("BLOKKEREND: outputbestand bestaat al; overschrijven is niet toegestaan.");process.exit(4)}
const {initializeApp,applicationDefault}=await import("firebase-admin/app");const {getFirestore}=await import("firebase-admin/firestore");
const app=initializeApp({credential:applicationDefault(),projectId:"gepuzzelig"}),db=getFirestore(app);
if(app.options.projectId!=="gepuzzelig")throw new Error("Project guard faalde");
const names=["profiles","groups","results","status","accessInvites","groupInvites","profileClaims"];
const out={};
for(const name of names){const snap=await db.collection(name).get();out[name]={};for(const doc of snap.docs)out[name][doc.id]=doc.data()}
const raw=JSON.stringify(out,null,2)+"\n";fs.writeFileSync(output,raw,{flag:"wx"});
const sha=crypto.createHash("sha256").update(raw).digest("hex");
console.log(JSON.stringify({project,database:"(default)",output,sha256:sha,counts:Object.fromEntries(names.map(n=>[n,Object.keys(out[n]).length]))},null,2));
console.log("Read-only snapshot voltooid; Firestore is uitsluitend gelezen.");
