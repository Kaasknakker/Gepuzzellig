import fs from 'node:fs';import {decode,encode} from '../../scripts/migration-io.mjs';
import {Timestamp,GeoPoint} from 'firebase-admin/firestore';
export {Timestamp,GeoPoint};export const types={Timestamp,GeoPoint,encode};
export function fixtureSnapshot(){const src=JSON.parse(fs.readFileSync('test/fixtures/firestore-phase10.json','utf8')),documents={};for(const root of ['profiles','groups','results','status'])for(const [id,data]of Object.entries(src[root]))documents[root+'/'+id]=data;return{snapshotVersion:2,project:'gepuzzelig',capturedAt:new Date().toISOString(),documents,source:src,authUsers:Object.keys(src.profiles).map(uid=>({uid,providerData:[{providerId:'google.com',uid}]}))}}
export class MemoryFirestore{
 constructor(documents){this.projectId='memory';this.values=new Map();for(const [p,v]of Object.entries(documents))this.values.set(p,decode(v,{...types,db:this}));this.commits=0}
 doc(path){const db=this;return{path,firestore:db,get:async()=>({exists:db.values.has(path),data:()=>db.values.get(path)}),listCollections:async()=>db.children(path)}}
 collection(path){const db=this;return{path,listDocuments:async()=>[...new Set([...db.values.keys()].filter(p=>p.startsWith(path+'/')).map(p=>p.slice(path.length+1).split('/')[0]))].map(id=>db.doc(path+'/'+id))}}
 async children(parent=''){const prefix=parent?parent+'/':'';return[...new Set([...this.values.keys()].filter(p=>p.startsWith(prefix)).map(p=>p.slice(prefix.length).split('/')[0]))].map(id=>this.collection(prefix+id))}
 async listCollections(){return this.children()}
 async runTransaction(fn){const writes=[];await fn({getAll:async(...refs)=>Promise.all(refs.map(r=>r.get())),set:(ref,data)=>writes.push([ref.path,data]),delete:ref=>writes.push([ref.path,null])});for(const[p,v]of writes)if(v===null)this.values.delete(p);else this.values.set(p,decode(encode(v),{...types,db:this}));this.commits++}
}
