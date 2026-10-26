#!/usr/bin/env node
import fs from 'node:fs';import {captureSnapshot,hash,atomicWrite} from './migration-io.mjs';
const args=process.argv.slice(2),value=x=>args[args.indexOf(x)+1],project=value('--project'),output=value('--output');
if(project!=='gepuzzelig'){console.error('BLOKKEREND: snapshot mag alleen expliciet uit productieproject gepuzzelig lezen.');process.exit(3)}
if(!output?.endsWith('.json')){console.error('Gebruik: node scripts/snapshot-production-firestore.mjs --project gepuzzelig --output <nieuw-snapshot.json>');process.exit(2)}
if(fs.existsSync(output)){console.error('BLOKKEREND: output bestaat al.');process.exit(4)}
if(process.env.FIRESTORE_EMULATOR_HOST||process.env.FIREBASE_AUTH_EMULATOR_HOST){console.error('BLOKKEREND: een emulator is geen productiebron.');process.exit(5)}
const {initializeApp,applicationDefault}=await import('firebase-admin/app'),{getFirestore}=await import('firebase-admin/firestore'),{getAuth}=await import('firebase-admin/auth');
const app=initializeApp({credential:applicationDefault(),projectId:'gepuzzelig'});const snapshot=await captureSnapshot(getFirestore(app),getAuth(app),'gepuzzelig');atomicWrite(output,snapshot,true);
console.log(JSON.stringify({project,output,sha256:hash(fs.readFileSync(output,'utf8')),documents:Object.keys(snapshot.documents).length,authUsers:snapshot.authUsers.length},null,2));
console.log('Read-only snapshot voltooid, inclusief subcollecties en Auth-inventaris. Geen Firebase-writes.');
