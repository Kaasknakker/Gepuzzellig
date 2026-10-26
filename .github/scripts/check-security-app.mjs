import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const fb=fs.readFileSync('js/firebase.js','utf8'),line=a=>fb.split('\n').find(l=>l.trim().startsWith(a)).trim();
let listener,stopped=0,bound=[],events=[];
const c=vm.createContext({currentProfile:{playerId:'p_me',groupId:'legacy'},currentMembership:{groupId:'legacy',role:'admin',status:'approved'},currentMemberships:[],currentMembers:[],currentGroup:{ownerAuthUid:'auth-me'},currentGroupName:'Legacy',currentDailyPlan:null,unsubMemberships:null,db:{},localStorage:{getItem:()=> 'legacy'},f:{collection:(_, ...p)=>p.join('/'),onSnapshot:(p,cb,err)=>{assert.equal(p,'playerMemberships/p_me/groups');listener=cb;return()=>stopped++}},bindGroup:g=>bound.push(g),stopGroupWatches:()=>stopped++,dispatchProfile:()=>events.push(c.currentGroupName),emitHomeGroups:async()=>{},shareDailyPlan:async()=>{}});
for(const n of ['const activeGroupId=','const membershipRow=','const chooseMembership=','const canManageGroup=','const watchMyMemberships='])vm.runInContext(line(n),c);
assert.equal(vm.runInContext('canManageGroup()',c),true);vm.runInContext('watchMyMemberships()',c);
const snap=rows=>({docs:rows.map(([id,data])=>({id,data:()=>data}))});
listener(snap([['legacy',{role:'member',status:'approved'}]]));assert.equal(vm.runInContext('canManageGroup()',c),false,'ownerAuthUid cannot undo demotion');assert.equal(vm.runInContext('activeGroupId()',c),'legacy');
listener(snap([]));assert.equal(vm.runInContext('activeGroupId()',c),'','legacy profile never restores removed group');assert.equal(vm.runInContext('canManageGroup()',c),false);assert.equal(c.currentGroupName,'Solo');
listener(snap([['other',{role:'admin',status:'approved'}],['legacy',{role:'admin',status:'pending'}]]));assert.equal(vm.runInContext('activeGroupId()',c),'other');assert.equal(vm.runInContext('canManageGroup()',c),true);assert(bound.includes('other'));
// Execute the real callable with mocked storage boundaries and sink-only environment.
const data=new Map();let writes=0;class HttpsError extends Error{constructor(code,message){super(message);this.code=code}}
const db={doc:path=>({get:async()=>({exists:data.has(path),data:()=>data.get(path),ref:{update:async()=>writes++}})})};
const server=vm.createContext({exports:{},console:{info(){},error(){}},process:{env:{GCLOUD_PROJECT:'gepuzzellig-test',APP_URL:'https://gepuzzellig-test.web.app/',MAIL_MODE:'sink'}},Date,Set,fetch:()=>{throw Error('sink must not send mail')},require:name=>{if(name==='firebase-functions/v2/https')return{onCall:(_,fn)=>fn,HttpsError};if(name==='firebase-functions/params')return{defineSecret:()=>{throw Error('sink must not bind secrets')}};if(name==='firebase-admin/app')return{initializeApp(){}};if(name==='firebase-admin/firestore')return{getFirestore:()=>db,FieldValue:{serverTimestamp:()=>0}};throw Error(name)}});
vm.runInContext(fs.readFileSync('functions/index.js','utf8'),server);const send=server.exports.sendInviteEmail,uid='auth-me',pid='p_me',code='SECINV01',path='groups/g_test/members/'+pid;
data.set('profiles/'+uid,{playerId:pid,displayName:'Me'});const invite={createdByAuthUid:uid,createdByPlayerId:pid,suggestedGroupId:'g_test',email:'test@example.test',expiresAt:{toMillis:()=>Date.now()+60000},revoked:false,usedByAuthUid:''};data.set('accessInvites/'+code,invite);
const request={auth:{uid},data:{code}};
for(const state of [null,'pending','left','rejected']){if(state)data.set(path,{status:state});else data.delete(path);await assert.rejects(send(request),e=>e.code==='permission-denied')}
assert.equal(writes,0);data.set(path,{status:'approved',role:'member'});assert.equal((await send(request)).delivered,false);assert.equal(writes,1);
data.delete(path);data.set('accessInvites/'+code,{...invite,mailSentAt:1});await assert.rejects(send(request),e=>e.code==='permission-denied','alreadySent cannot bypass current membership');
data.set('accessInvites/'+code,{...invite,suggestedGroupId:''});assert.equal((await send(request)).mode,'sink','solo invitation remains valid');
await assert.rejects(send({data:{code}}),e=>e.code==='unauthenticated');await assert.rejects(send({auth:{uid:'other'},data:{code}}),e=>e.code==='permission-denied');
console.log('OK: live membership demotion/removal/switch, no legacy-owner fallback, invitation callable denies removed/pending users before mail and preserves approved/solo sink behavior.');
