import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {captureSnapshot,decode,encode,same,atomicWrite} from '../../scripts/migration-io.mjs';
const records={'profiles/user':{playerId:'special'},'groups/g':{name:'Group'},'groups/g/members/special':{status:'approved'},'unrelated/doc/deep/nested':{value:1}};
const coll=name=>({listDocuments:async()=>{const ids=[...new Set(Object.keys(records).filter(k=>k.startsWith(name+'/')).map(k=>k.slice(name.length+1).split('/')[0]))];return ids.map(k=>ref(name+'/'+k))}}),ref=p=>({path:p,get:async()=>({exists:!!records[p],data:()=>records[p]}),listCollections:async()=>[...new Set(Object.keys(records).filter(k=>k.startsWith(p+'/')).map(k=>k.slice(p.length+1).split('/')[0]))].map(k=>coll(p+'/'+k))});
const db={listCollections:async()=>[...new Set(Object.keys(records).map(p=>p.split('/')[0]))].map(coll)},auth={listUsers:async()=>({users:[{toJSON:()=>({uid:'user',providerData:[]})}]})};
const snapshot=await captureSnapshot(db,auth,'gepuzzelig');assert(same(snapshot.documents,records));assert.equal(snapshot.source.memberships.g.special.status,'approved');assert.equal(snapshot.authUsers[0].uid,'user');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gp-backup-')),file=path.join(dir,'snapshot.json');atomicWrite(file,snapshot,true);assert.throws(()=>atomicWrite(file,{},true));
for(const args of [['--project','gepuzzellig-test','--output',path.join(dir,'bad.json')],['--project','gepuzzelig','--output',file]])assert.notEqual(spawnSync(process.execPath,['scripts/snapshot-production-firestore.mjs',...args],{encoding:'utf8'}).status,0);
// Firestore-specific values survive a backup round trip without confusing crypto.update with a database write.
class Timestamp{constructor(seconds,nanoseconds){this.seconds=seconds;this.nanoseconds=nanoseconds}toMillis(){return this.seconds*1000+this.nanoseconds/1e6}}
class GeoPoint{constructor(latitude,longitude){this.latitude=latitude;this.longitude=longitude}}
const value={t:new Timestamp(10,123456789),geo:new GeoPoint(52,4),bytes:Buffer.from('abc'),ref:{path:'profiles/user',firestore:{}},when:new Date('2026-10-26T00:00:00Z'),nan:NaN,list:[1,'a',null]},encoded=encode(value),restored=decode(encoded,{Timestamp,GeoPoint,db:{doc:p=>({path:p,firestore:{}})}});assert(same(encode(restored),encoded));
console.log('Fase 11 snapshot: uitsluitend read-interfaces, alle subcollecties, Auth-inventaris, exacte types, projectguard en no-overwrite geslaagd.');
