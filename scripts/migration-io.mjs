import crypto from 'node:crypto';
import fs from 'node:fs';
export const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export const hash=x=>crypto.createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)||x instanceof Uint8Array?x:stable(x)).digest('hex');
export const same=(a,b)=>stable(a)===stable(b);
export function id(x){if(typeof x!=='string'||!x||x.includes('/')||['.','..','__proto__','constructor','prototype'].includes(x)||Buffer.byteLength(x)>1500)throw Error('Ongeldige documentidentiteit');return x}
export const epoch=x=>x?.__gpFirestore==='timestamp'?x.seconds*1000+Math.floor(x.nanoseconds/1e6):Number(x)||0;
export function encode(x){
 if(x===null||typeof x==='string'||typeof x==='boolean')return x;
 if(typeof x==='number'&&Number.isInteger(x)&&!Number.isSafeInteger(x))throw Error('Onveilige integer kan niet exact worden geback-upt');
 if(typeof x==='number'&&Object.is(x,-0))return{__gpFirestore:'number',value:'-0'};
 if(typeof x==='number')return Number.isFinite(x)?x:{__gpFirestore:'number',value:String(x)};
 if(Buffer.isBuffer(x)||x instanceof Uint8Array)return{__gpFirestore:'bytes',value:Buffer.from(x).toString('base64')};
 if(x instanceof Date)return{__gpFirestore:'date',value:x.toISOString()};
 if(Array.isArray(x))return x.map(encode);
 if(x&&typeof x.toMillis==='function'&&Number.isInteger(x.seconds))return{__gpFirestore:'timestamp',seconds:x.seconds,nanoseconds:x.nanoseconds};
 if(x&&typeof x.path==='string'&&x.firestore)return{__gpFirestore:'reference',path:x.path,projectId:x.firestore.projectId||null,databaseId:x.firestore.databaseId||'(default)'};
 if(x&&x.constructor?.name==='GeoPoint')return{__gpFirestore:'geopoint',latitude:x.latitude,longitude:x.longitude};
 if(x&&typeof x==='object'&&(Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null)){if('__gpFirestore'in x)throw Error('Gereserveerd backupveld in brondata');return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,encode(v)]))}
 throw Error('Niet ondersteund Firestore-datatype in backup');
}
export function decode(x,types={}){
 if(Array.isArray(x))return x.map(v=>decode(v,types));if(!x||typeof x!=='object')return x;
 if(x.__gpFirestore){switch(x.__gpFirestore){case'timestamp':return new types.Timestamp(x.seconds,x.nanoseconds);case'bytes':return Buffer.from(x.value,'base64');case'date':return new Date(x.value);case'number':return Number(x.value);case'reference':if((x.projectId&&types.db.projectId&&x.projectId!==types.db.projectId)||(x.databaseId&&types.db.databaseId&&x.databaseId!==types.db.databaseId))throw Error('Cross-projectreference vereist aparte herstelprocedure');return types.db.doc(x.path);case'geopoint':return new types.GeoPoint(x.latitude,x.longitude);default:throw Error('Onbekend backuptype')}}
 return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,decode(v,types)]));
}
export async function readDocuments(db){const out={};async function walk(collection){for(const ref of await collection.listDocuments()){const snap=await ref.get();if(snap.exists)out[ref.path]=encode(snap.data());for(const child of await ref.listCollections())await walk(child)}}for(const c of await db.listCollections())await walk(c);return Object.fromEntries(Object.entries(out).sort(([a],[b])=>a<b?-1:a>b?1:0))}
export function sourceFromDocuments(documents){const source={profiles:{},groups:{},results:{},status:{}};for(const [path,data]of Object.entries(documents)){const p=path.split('/');if(p.length===2){(source[p[0]]??={})[p[1]]=data;continue}let root;if(p.length===4){if(p[0]==='groups'&&p[2]==='members')root='memberships';else if(p[0]==='playerMemberships'&&p[2]==='groups')root=p[0];else if(['playerResults','progress','groupActivity','groupDailyPlans'].includes(p[0])&&p[2]==='items')root=p[0];else if(p[0]==='dailyPlans'&&p[2]==='days')root=p[0];if(root)((source[root]??={})[p[1]]??={})[p[3]]=data}}return source}
export async function captureSnapshot(db,auth,project){const documents=await readDocuments(db),authUsers=[];let token;do{const page=await auth.listUsers(1000,token);authUsers.push(...page.users.map(u=>u.toJSON()));token=page.pageToken}while(token);return{snapshotVersion:2,project,capturedAt:new Date().toISOString(),documents,authUsers,source:sourceFromDocuments(documents)}}
export function atomicWrite(file,data,exclusive=false){const raw=JSON.stringify(data,null,2)+'\n',destination=exclusive?file:file+'.tmp';const fd=fs.openSync(destination,exclusive?'wx':'w');try{fs.writeFileSync(fd,raw);fs.fsyncSync(fd)}finally{fs.closeSync(fd)}if(!exclusive)fs.renameSync(destination,file)}

export function sourceData(snapshot){return snapshot.snapshotVersion===2?snapshot.source:snapshot}

export const authFingerprint=users=>hash(users.map(u=>({uid:u.uid,email:u.email||'',emailVerified:!!u.emailVerified,disabled:!!u.disabled,providerData:(u.providerData||[]).map(p=>({providerId:p.providerId,uid:p.uid,email:p.email||''})).sort((a,b)=>a.providerId.localeCompare(b.providerId))})).sort((a,b)=>a.uid.localeCompare(b.uid)));
export async function assertAuthUnchanged(auth,users){const current=[];let token;do{const page=await auth.listUsers(1000,token);current.push(...page.users.map(u=>u.toJSON()));token=page.pageToken}while(token);if(authFingerprint(current)!==authFingerprint(users))throw Error('BLOKKEREND: Auth-identiteiten/providers gewijzigd sinds snapshot')}
