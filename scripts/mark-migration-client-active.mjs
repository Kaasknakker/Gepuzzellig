#!/usr/bin/env node
import fs from 'node:fs';import {atomicWrite} from './migration-io.mjs';
const [file,flag,release]=process.argv.slice(2);if(!file||flag!=='--confirm-release'||!release)throw Error('Gebruik: node scripts/mark-migration-client-active.mjs <journal.json> --confirm-release <sha>');
const journal=JSON.parse(fs.readFileSync(file,'utf8'));if(journal.phase!=='applied'||journal.releaseCommit!==release)throw Error('BLOKKEREND: geen afgeronde migratie voor deze release');journal.clientActivated=true;journal.activatedAt=new Date().toISOString();atomicWrite(file,journal);console.log('Clientactivatie geregistreerd: automatische pre-clientrollback is nu geblokkeerd.');
