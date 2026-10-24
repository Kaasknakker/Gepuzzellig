#!/usr/bin/env node
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {execFileSync} from 'node:child_process';
const src='test/fixtures/firestore-phase5.json',dir=fs.mkdtempSync(path.join(os.tmpdir(),'gepuzzellig-phase5-')),copy=path.join(dir,'fixture.json');fs.copyFileSync(src,copy);
const run=(apply=false)=>execFileSync(process.execPath,['scripts/migrate-phase5.mjs',copy,...(apply?['--apply']:[])],{encoding:'utf8'});
const dry=run();if(!dry.includes('Dry-run: niets geschreven'))throw new Error('Dry-run schreef of meldde onjuist');const outPath=copy.replace(/\.json$/,'-phase5.json');if(fs.existsSync(outPath))throw new Error('Dry-run schreef output');
run(true);const first=fs.readFileSync(outPath,'utf8'),out=JSON.parse(first);if(!out.stats.countsMatch||out.stats.orphans.length||out.stats.groupsWithoutAdmin.length)throw new Error('Fase 5 mapping/invarianten kloppen niet');
if(out.memberships['legacy-a']['u-special'].role!=='admin'||out.memberships['legacy-a']['p_member'].status!=='approved')throw new Error('Legacy groep niet correct gemapt');
if(out.playerMemberships['p_solo'])throw new Error('Solo speler kreeg onterecht membership');if(out.memberships['legacy-a']['u-special'].playerId!=='u-special')throw new Error('Bestaande playerId gewijzigd');
run(true);if(fs.readFileSync(outPath,'utf8')!==first)throw new Error('Tweede run is niet idempotent');
if(!out.stats || out.stats.mappedMemberships!==2 || out.stats.soloProfiles!==1)throw new Error('Onverwachte aantallen');
console.log('Fase 5 migratie: dry-run, legacy memberships, solo, playerId-behoud en idempotentie geslaagd.');
