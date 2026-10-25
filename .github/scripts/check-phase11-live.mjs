#!/usr/bin/env node
import fs from "node:fs";import os from "node:os";import path from "node:path";import {execFileSync,spawnSync} from "node:child_process";
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"gp11-")),p=path.join(dir,"candidate.json");
const candidate={profiles:{a:{playerId:"p1"}},memberships:{g1:{p1:{status:"approved"}}},playerMemberships:{p1:{g1:{status:"approved"}}},playerResults:{p1:{r1:{secs:12}}},progress:{p1:{x:{progressPercent:50}}},groupActivity:{g1:{a1:{playerId:"p1"}}},groupDailyPlans:{g1:{d1:{playerId:"p1"}}}};
fs.writeFileSync(p,JSON.stringify(candidate));
const dry=execFileSync(process.execPath,["scripts/apply-production-migration.mjs",p,"--project","gepuzzelig"],{encoding:"utf8"});
if(!dry.includes("Dry-run: geen Firebase-verbinding en geen writes."))throw new Error("dry-run guard ontbreekt");
const bad=spawnSync(process.execPath,["scripts/apply-production-migration.mjs",p,"--project","gepuzzellig-test","--apply","--confirm-project","gepuzzellig-test"],{encoding:"utf8"});
if(bad.status===0)throw new Error("niet-productieproject werd toegestaan");
const unconfirmed=spawnSync(process.execPath,["scripts/apply-production-migration.mjs",p,"--project","gepuzzelig","--apply"],{encoding:"utf8"});
if(unconfirmed.status===0)throw new Error("apply zonder expliciete bevestiging werd toegestaan");
const src=fs.readFileSync("scripts/apply-production-migration.mjs","utf8");if(/delete\(|\.delete\(/.test(src))throw new Error("live writer mag geen delete bevatten");
console.log("Fase 11 live-writer: offline dry-run, projectguard, expliciete apply-bevestiging en no-delete contract geslaagd.");
