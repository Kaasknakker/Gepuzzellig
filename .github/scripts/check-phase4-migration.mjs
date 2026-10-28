#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const src='test/fixtures/firestore-phase4.json',dir=fs.mkdtempSync(path.join(os.tmpdir(),'gepuzzellig-phase4-')),copy=path.join(dir,'fixture.json');
fs.copyFileSync(src,copy);
const run=(apply=false)=>execFileSync(process.execPath,['scripts/migrate-phase4.mjs',copy,...(apply?['--apply']:[])],{encoding:'utf8'});
const dry=run(false);if(!dry.includes('Dry-run: niets geschreven'))throw new Error('Dry-run meldt niet dat niets geschreven is');
if(fs.existsSync(copy.replace(/\.json$/,'-phase4.json')))throw new Error('Dry-run schreef toch output');
run(true);const outPath=copy.replace(/\.json$/,'-phase4.json'),first=fs.readFileSync(outPath,'utf8'),out=JSON.parse(first);
if(!out.stats.resultCountsMatch||!out.stats.progressCountsMatch||out.stats.orphans.length)throw new Error('Migratie-aantallen/orphans kloppen niet');
if(out.stats.legacyResults!==2||out.stats.mappedResults!==2||out.stats.legacyProgress!==3||out.stats.mappedProgress!==3)throw new Error('Onverwachte migratie-aantallen');
const a=Object.values(out.playerResults['u-special'])[0],b=Object.values(out.playerResults['p_auth-b'])[0];
if(a.playerId!=='u-special'||a.puzzleType!=='bin'||a.difficulty!=='2'||a.hintSteps.rule!==1)throw new Error('Dagresultaat/speciale playerId niet exact gemapt');
if(b.mode!=='free'||b.puzzleType!=='nono'||b.variant!=='color'||b.deviceVariant!=='phone')throw new Error('Vrij resultaat/variant/device niet exact gemapt');
const legacyColor=out.progress['p_auth-b']['p%3Anonoc'];if(!legacyColor||legacyColor.mode!=='free'||legacyColor.puzzleType!=='nono'||legacyColor.variant!=='color'||legacyColor.difficulty!=='normal')throw new Error('Legacy p:nonoc is niet als vrije kleur-Nonogram gemapt');
run(true);if(fs.readFileSync(outPath,'utf8')!==first)throw new Error('Tweede migratierun is niet idempotent');
console.log('Fase 4 migratie: dry-run, mapping, aantallen en idempotentie geslaagd.');
