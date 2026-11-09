import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
/* Regressie (melding 6 nov): de profielcache bewaart ook de groepslidmaatschappen, zodat de homepage bij het openen
   niet eerst "Je speelt nu solo" toont. Mislukt het laden van lidmaatschappen, dan blijft de bewaarde lijst staan. */
const src=fs.readFileSync('js/firebase.js','utf8'),line=n=>src.split('\n').find(l=>l.trimStart().startsWith(n));
const L={mr:line('const membershipRow='),cm:line('const chooseMembership='),ag:line('const activeGroupId='),rc:line('const readProfileCache='),wc:line('const writeProfileCache='),ap:line('const applyCachedProfile='),lm:line('const loadMemberships=')};
for(const k in L)assert.ok(L[k],'regel ontbreekt: '+k);
const store={};
const ctx=vm.createContext({console:{warn(){}},JSON,Date,Array,String,Number,Object,
 localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)}},
 PROFILE_CACHE_KEY:'pc',auth:{currentUser:{uid:'u'}},
 currentProfile:null,currentMembers:[],currentMemberships:[],currentMembership:null,currentGroup:{},currentGroupName:'x',baseGroupName:()=>'Basis',
 plainProfile:p=>p&&p.playerId?Object.assign({},p):null,effectiveRole:()=>'user',dispatchProfile:()=>{},
 db:{},f:{collection:()=>0,doc:()=>0,getDocsFromServer:async()=>{throw Object.assign(new Error('x'),{code:'unavailable'})},getDocFromServer:async()=>{throw new Error('x')}}});
vm.runInContext([L.mr,L.cm,L.ag,L.rc,L.wc,L.ap,L.lm].join('\n'),ctx);
const run=c=>vm.runInContext(c,ctx);
// 1. schrijven + lezen bewaart goedgekeurde en wachtende lidmaatschappen
run(`currentProfile={authUid:'u',playerId:'p',groupId:'g1',displayName:'P'};currentMembers=[currentProfile];currentMemberships=[{groupId:'g1',groupName:'Testduo',role:'member',status:'approved',joinedAt:5,updatedAt:6},{groupId:'g2',groupName:'',role:'member',status:'pending',joinedAt:0,updatedAt:0}];writeProfileCache()`);
const c=run(`readProfileCache('u')`);
assert.equal(c.memberships.length,2);assert.equal(c.memberships[0].groupName,'Testduo');assert.equal(c.memberships[1].status,'pending');
// 2. cache zonder lidmaatschappen (oude cache) leest als lege lijst, geen fout
store.pc=JSON.stringify({u:{profile:{authUid:'u',playerId:'p',groupId:'g1',displayName:'P'},members:[],savedAt:1}});
assert.deepEqual(JSON.parse(JSON.stringify(run(`readProfileCache('u').memberships`))),[]);
// 3. toepassen zet lidmaatschappen en kiest de actieve groep direct
store.pc=JSON.stringify({u:{profile:{authUid:'u',playerId:'p',groupId:'g1',displayName:'P'},members:[],memberships:c.memberships,savedAt:1}});
run(`currentMemberships=[];currentMembership=null;applyCachedProfile(readProfileCache('u'))`);
assert.equal(run(`currentMemberships.length`),2);assert.equal(run(`activeGroupId()`),'g1','actieve groep direct bekend, niet solo');
// 4. laden mislukt: bewaarde lijst blijft
await run(`loadMemberships(currentProfile)`);
assert.equal(run(`currentMemberships.length`),2);assert.equal(run(`activeGroupId()`),'g1');
console.log('OK: profielcache bewaart groepslidmaatschappen en houdt ze bij een mislukte laadronde');
