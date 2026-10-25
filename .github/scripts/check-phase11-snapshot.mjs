#!/usr/bin/env node
import fs from "node:fs";import {spawnSync} from "node:child_process";
const src=fs.readFileSync("scripts/snapshot-production-firestore.mjs","utf8");
for(const bad of [".set(", ".update(", ".delete(", ".create(", ".add(", ".commit(", "db.batch(", "runTransaction("])if(src.includes(bad))throw new Error("snapshottool bevat verboden Firestore-write API: "+bad);
for(const required of ['project!=="gepuzzelig"','collection(name).get()','flag:"wx"','"profiles","groups","results","status"'])if(!src.includes(required))throw new Error("snapshotveiligheidscontract ontbreekt: "+required);
const wrong=spawnSync(process.execPath,["scripts/snapshot-production-firestore.mjs","--project","gepuzzellig-test","--output","/tmp/no.json"],{encoding:"utf8"});if(wrong.status===0)throw new Error("verkeerd project werd toegestaan");
console.log("Fase 11 snapshottool: read-only API-contract, productieprojectguard en no-overwrite contract geslaagd.");
