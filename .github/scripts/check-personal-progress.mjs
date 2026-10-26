import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const core=fs.readFileSync('js/core.js','utf8'),fb=fs.readFileSync('js/firebase.js','utf8'),line=(s,a)=>s.split('\n').find(x=>x.trim().startsWith(a)).trim(),section=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
const key='d:2026-10-25:bin.3',ck=encodeURIComponent(key).replace(/\./g,'%2E'),docs=new Map(),snap=data=>({exists:()=>!!data,data:()=>structuredClone(data)}),profile={playerId:'me',groupId:'old'};let group='other';
docs.set('status/old_me',{progress:{[ck]:{k:key,at:100,pc:50,seed:'legacy-board',group:'old'}}});
const f={doc:(_, ...p)=>p.join('/'),collection:(_, ...p)=>p.join('/'),getDocFromServer:async p=>snap(docs.get(p)),getDocsFromServer:async p=>({docs:[...docs].filter(([k])=>k.startsWith(p+'/')&&!k.slice(p.length+1).includes('/')).map(([k,d])=>({id:k.split('/').at(-1),data:()=>structuredClone(d)}))}),runTransaction:async(_,fn)=>fn({get:async p=>snap(docs.get(p)),set:(p,d)=>docs.set(p,structuredClone(d))}),query:(_,q)=>q,where:()=>''};
const c=vm.createContext({f,db:{},currentProfile:profile,activeGroupId:()=>group,window:{},console});
vm.runInContext('window.PD_DB={'+['saveProgress:','clearProgress:','getProgress:'].map(n=>line(fb,n).replace(/,$/,'')).join(',')+'}',c);const api=c.window.PD_DB;
const batch=()=>({set:(p,d)=>docs.set(p,structuredClone(d)),commit:async()=>{}});f.writeBatch=batch;
c.currentMemberships=[{groupId:'old',status:'approved',joinedAt:1},{groupId:'other',status:'approved',joinedAt:1}];c.socialResultId=(p,k)=>p+'|'+k;
vm.runInContext('window.PD_DB.save='+line(fb,'save:').slice('save:'.length).replace(/,$/,''),c);
await api.save({uid:'me',date:'2026-10-25',type:'bin.3',secs:42,personalOnly:true});assert.equal([...docs.keys()].some(k=>k.startsWith('groupActivity/')),false,'offline replay does not retroactively share in current groups');
await api.save({uid:'me',date:'2026-10-26',type:'bin.3',secs:42});assert.equal([...docs.keys()].filter(k=>k.startsWith('groupActivity/')).length,2,'new completion still shares with approved groups');
vm.runInContext(line(fb,'const shareDailyPlan='),c);await vm.runInContext('shareDailyPlan({date:"2026-10-26",favoritePuzzleTypes:["bin"],difficulties:{bin:"normal"},createdAt:1})',c);assert.equal([...docs.keys()].filter(k=>k.startsWith('groupDailyPlans/')).length,2);
assert.equal((await api.getProgress(group,'me'))[ck].seed,'legacy-board','legacy progress follows person, not selected group');
await api.clearProgress({uid:'me',ck,at:200});
let p=await api.getProgress(group,'me');assert.equal(p[ck].deleted,true,'canonical marker shadows legacy');assert.equal(p[ck].seed,undefined,'marker does not retain deleted board');
await api.saveProgress({uid:'me',ck,entry:{k:key,at:150,pc:60,seed:'stale'}});assert.equal((await api.getProgress(group,'me'))[ck].deleted,true,'late old save cannot undo delete');
await api.saveProgress({uid:'me',ck,entry:{k:key,at:300,pc:10,seed:'new-board'}});await api.clearProgress({uid:'me',ck,at:200});
p=await api.getProgress(group,'me');assert.equal(p[ck].seed,'new-board');assert.equal(p[ck].deleted,undefined,'new puzzle replaces marker completely');
assert.equal(Object.keys(await api.getProgress(group,'someone-else')).length,0);
const storage={};let pending=[],clears=[],source={};
function frontend(){
 const clock=class extends Date{static now(){return 200}};const x=vm.createContext({console,Date:clock,uid:'me',PHONE:false,store:{},SG:{},XS:{},lastRows:[],S:{},TYPES:{bin:'Binair',star:'Star',nono:'Nonogram'},window:{PD_DB:{}},document:{body:{classList:{contains:()=>false}}},$:id=>({value:id==='#group'?group:'Me'}),lsGet:k=>storage[k]||'',lsSet:(k,v)=>{storage[k]=v;return true},progAll:()=>structuredClone(source),PKEY:'pdprog4',legacyGroup:()=> 'old',scoreGroup:k=>x.SG[k]||'old',sfx:l=>l===2?'':'.'+l,dagLv:()=>3,dayTypeDevice:()=> 'bin.3',dagVast:()=>true,dstr:()=> '2026-10-26',nonoDayVariant:()=> 'classic',freeLoc:()=>[],save(){},saveSG(){},xsSave(){},progKey:()=>key,load(){},renderHome(){},cloudProgressHistory:e=>e,cloudPushProgress:(...a)=>pending.push(a),cloudClearProgress:k=>clears.push(k),UX:{storage(){}}});
 
 vm.runInContext('const localDone=k=>!!store[k];',x);
 for(const code of [section(core,'function progressDeletions(','function progressRelevant('),line(core,'function progressRelevant('),line(core,'function progressSolved('),section(core,'function progressMeta(','const nonoMetaVariant'),line(core,'const nonoMetaVariant='),line(core,'function progressList('),line(core,'function myDone('),line(core,'function myDoneOther('),section(core,'function ownDayResult(','function dbSave('),section(core,'function pullMine(','/* Tijden die nog niet'),section(core,'function resync(','addEventListener("pdready",startBoard)'),section(core,'function progDel(','function pullCloudProgress(')])vm.runInContext(code,x);
 // Use the actual local storage writer while keeping source in sync for isolated tests.
 x.lsSet=(k,v)=>{storage[k]=v;if(k==='pdprog4')source=JSON.parse(v);return true};return x;
}
let x=frontend();source={[key]:{k:key,at:100,pc:50,seed:'legacy-board',group:'old'},'p:star.3':{at:90,pc:20,seed:'qabc',group:'old'}};
for(group of ['old','other','']){assert.equal(x.progressList().length,2);assert.equal(x.progressList({practice:false})[0].k,key)}
// Persisted deletion survives a new frontend context and a stale legacy read.
x.progDel(key);assert.equal(source[key],undefined);assert.equal(x.progressDeletedAt(key),200);x=frontend();x.mergeCloudProgress({[ck]:{k:key,at:100,pc:50,seed:'legacy-board'}});assert.equal(source[key],undefined);assert(clears.includes(key));
// Canonical remote delete removes an old local board; a genuinely newer board survives.
source={[key]:{at:100,pc:50}};x.mergeCloudProgress({[ck]:{k:key,at:200,deleted:true}});assert.equal(source[key],undefined);
source={[key]:{at:300,pc:20,seed:'new-board'}};x.mergeCloudProgress({[ck]:{k:key,at:200,deleted:true}});assert.equal(source[key].seed,'new-board');
source={};x.mergeCloudProgress({[ck]:{k:key,at:300,pc:20,seed:'new-board'}});assert.equal(source[key].seed,'new-board');
x.uid='another-player';assert.equal(x.progressDeletedAt(key),0,'deletion bookkeeping belongs to player');x.uid='me';
// Deleting on another session cannot be undone by the active board's autosave.
source={[key]:{at:100,pc:50}};x.S={p:{},start:1,done:false,_saveAt:100};x.mergeCloudProgress({[ck]:{k:key,at:200,deleted:true}});assert.equal(x.S.discarded,true);
vm.runInContext(section(core,'function persist(','setInterval(persist'),x);x.persist(true);assert.equal(source[key],undefined);x.S={};
// Canonical own completions from another group are pulled once, recognized everywhere, and never shown as open.
x.lastRows=[{uid:'me',date:'2026-10-25',type:'bin.3',secs:42,group:'old',completedOn:'2026-10-26',hints:1},{uid:'someone-else',date:'2026-10-25',type:'bin.3',secs:7,group:'other'}];x.pullMine(x.lastRows);
for(group of ['old','other','']){assert.equal(x.myDone('2026-10-25','bin'),'2026-10-25bin.3');assert.equal(x.ownDayResult('2026-10-25','bin').secs,42);assert.equal(x.progressSolved(key,{}),true);source={[key]:{at:100,pc:50,group:'old'}};assert.equal(x.progressList().length,0)}
// Missing own offline results sync across groups without retroactive social sharing.
let sent=[];x.dbSave=r=>{sent.push(r);return Promise.resolve()};x.addDays=()=> '2026-10-12';x.resync([]);assert.equal(sent.length,1);assert.equal(sent[0].personalOnly,true);x.resync.done=false;x.resync(x.lastRows);assert.equal(sent.length,1,'existing logical completion does not duplicate after switch');
x.freeLoc=()=>[{date:'2026-10-26',type:'v~star.3~qsample',secs:18,group:'old'}];x.resync.done=false;x.resync(x.lastRows);assert.equal(sent.length,2);assert.equal(sent[1].type,'v~star.3~qsample');assert.equal(sent[1].personalOnly,true);
x.resync.done=false;x.resync([...x.lastRows,sent[1]]);assert.equal(sent.length,2);
x.lastRows.push(sent[1]);assert.equal(x.progressSolved('p:star.3',{seed:'qsample'}),true);assert.equal(x.progressSolved('p:bin.3',{seed:'qsample'}),false);
// Personal view includes own history; social view retains current-group boundary.
x.baseT=r=>r.type.split('.')[0];vm.runInContext(section(core,'function allRows(','function streakOf('),x);group='other';assert.equal(x.allRows(true).some(r=>r.uid==='me'),true);assert.equal(x.allRows().some(r=>r.uid==='me'),false);
console.log('OK: deletion/reload/legacy, stale save, newer restart, offline retry, account-scoped markers, group/solo progress and completion, result deduplication and bounded social view.');
