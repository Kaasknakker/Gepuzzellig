#!/usr/bin/env node
import fs from "node:fs";
const [,,input,...args]=process.argv;
if(!input)throw new Error("Gebruik: node scripts/migrate-phase9.mjs <firestore-export.json> [--apply]");
const src=JSON.parse(fs.readFileSync(input,"utf8")),out=structuredClone(src);
const isArray=Array.isArray(src.profiles),entries=isArray?(src.profiles||[]).map((p,i)=>[String(i),p]):Object.entries(src.profiles||{});
let changed=0;
const migrate=p=>{const x=structuredClone(p),prefs=x.preferences&&typeof x.preferences==="object"?x.preferences:{},tutorials=prefs.tutorials&&typeof prefs.tutorials==="object"?{...prefs.tutorials}:{};if(!tutorials.bin){tutorials.bin="skipped";changed++}x.preferences={...prefs,tutorials};return x};
if(isArray)out.profiles=entries.map(([,p])=>migrate(p));else out.profiles=Object.fromEntries(entries.map(([k,p])=>[k,migrate(p)]));
const report={profiles:entries.length,changed,unchanged:entries.length-changed,default:"bin=skipped"};
console.log(JSON.stringify(report,null,2));
if(args.includes("--apply")){const output=input.replace(/\.json$/,"")+"-phase9.json";fs.writeFileSync(output,JSON.stringify(out,null,2)+"\n");console.log("Geschreven:",output)}
