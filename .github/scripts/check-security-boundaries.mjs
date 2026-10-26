import fs from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, deleteDoc, getDocs, collection, query, where, setDoc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
const env=await initializeTestEnvironment({projectId:'gepuzzellig-rules-test',firestore:{rules:fs.readFileSync('firestore.rules','utf8'),host:'127.0.0.1',port:8080}});
const gid='g_security01',owner={authUid:'sec-owner',playerId:'special-owner'},admin={authUid:'sec-admin',playerId:'p_sec-admin'},other={authUid:'sec-member',playerId:'p_sec-member'},pending={authUid:'sec-pending',playerId:'p_sec-pending'};
const profile=p=>({authUid:p.authUid,playerId:p.playerId,displayName:p.authUid,groupId:gid,role:'user',createdAt:1,updatedAt:1,inviteCode:'',invitedByAuthUid:'',groupJoinCode:'',theme:'shared',accent:'blue'});
const player=p=>({playerId:p.playerId,authUid:p.authUid,displayName:p.authUid,createdAt:1,updatedAt:1});
const membership=(p,role='member',status='approved')=>({playerId:p.playerId,displayName:p.authUid,role,status,requestedAt:1,approvedAt:status==='approved'?10:0,joinedAt:status==='approved'?10:0,approvedByPlayerId:status==='approved'?admin.playerId:'',updatedAt:10});
const index=(g,m)=>({groupId:g,role:m.role,status:m.status,joinedAt:m.joinedAt,updatedAt:m.updatedAt});
const ctx=p=>env.authenticatedContext(p.authUid).firestore();
const group=(g,p,code)=>({name:g,ownerAuthUid:p.authUid,inviteCode:code,theme:'shared',accent:'blue',murdokuNames:[],createdAt:1,updatedAt:1});
const change=async(db,p,m)=>{const b=writeBatch(db);b.set(doc(db,'groups',gid,'members',p.playerId),m);b.set(doc(db,'playerMemberships',p.playerId,'groups',gid),index(gid,m));return b.commit()};
try{
 await env.clearFirestore();
 await env.withSecurityRulesDisabled(async c=>{const db=c.firestore();for(const p of [owner,admin,other,pending]){await setDoc(doc(db,'profiles',p.authUid),profile(p));await setDoc(doc(db,'players',p.playerId),player(p))}await setDoc(doc(db,'groups',gid),group(gid,owner,'SECURITY'));for(const p of [owner,admin,other,pending]){const m=membership(p,p===owner||p===admin?'admin':'member',p===pending?'pending':'approved');await setDoc(doc(db,'groups',gid,'members',p.playerId),m);await setDoc(doc(db,'playerMemberships',p.playerId,'groups',gid),index(gid,m))}for(const p of [owner,other]){await setDoc(doc(db,'status',gid+'_'+p.playerId),{uid:p.playerId,group:gid,progress:{privateBoard:{seed:'private'}}});await setDoc(doc(db,'presence',gid+'_'+p.playerId),{uid:p.playerId,group:gid,onlineAt:20})};await setDoc(doc(db,'groupActivity',gid,'items','sample'),{playerId:other.playerId});await setDoc(doc(db,'groupDailyPlans',gid,'items','sample'),{playerId:other.playerId})});
 const attacker=env.authenticatedContext('sec-attacker').firestore();
 // Neither no-profile users nor normal players can reserve an arbitrary/reserved identity.
 for(const id of ['u-peter','unclaimed-legacy','p_sec-other'])await assertFails(setDoc(doc(attacker,'players',id),player({authUid:'sec-attacker',playerId:id})));
 await assertFails(setDoc(doc(ctx(other),'players','extra-identity'),player({authUid:other.authUid,playerId:'extra-identity'})));
 // Existing legacy identity can bootstrap its own registry, but nobody else's.
 const legacy={authUid:'sec-legacy',playerId:'special-legacy'};await env.withSecurityRulesDisabled(c=>setDoc(doc(c.firestore(),'profiles',legacy.authUid),profile(legacy)));
 await assertFails(setDoc(doc(attacker,'players',legacy.playerId),player({authUid:'sec-attacker',playerId:legacy.playerId})));
 await assertSucceeds(setDoc(doc(ctx(legacy),'players',legacy.playerId),player(legacy)));
 // New anonymous profile and registry are valid in one atomic batch.
 const uid='sec-new-anon',newDb=env.authenticatedContext(uid,{firebase:{sign_in_provider:'anonymous'}}).firestore(),newPlayer={authUid:uid,playerId:'p_'+uid};
 const np={...profile(newPlayer),groupId:'',accountState:'anonymous',preferences:{favoritePuzzleTypes:['bin'],dailyDifficulty:{bin:'normal'}}};const nb=writeBatch(newDb);nb.set(doc(newDb,'profiles',uid),np);nb.set(doc(newDb,'players',newPlayer.playerId),player(newPlayer));await assertSucceeds(nb.commit());
 await assertFails(updateDoc(doc(newDb,'players',newPlayer.playerId),{authUid:'sec-attacker'}));await assertFails(updateDoc(doc(newDb,'profiles',uid),{playerId:'u-peter'}));
 // A malformed registry alone is never sufficient to own another player.
 await env.withSecurityRulesDisabled(async c=>{await setDoc(doc(c.firestore(),'players','corrupt-registry'),player({authUid:other.authUid,playerId:'corrupt-registry'}));await setDoc(doc(c.firestore(),'progress','corrupt-registry','items','secret'),{state:{seed:'secret'}})});
 await assertFails(getDoc(doc(ctx(other),'progress','corrupt-registry','items','secret')));
 const odb=ctx(owner),adb=ctx(admin),pdb=ctx(pending);
 await assertSucceeds(getDoc(doc(odb,'groups',gid)));await assertSucceeds(getDocs(query(collection(odb,'presence'),where('group','==',gid))));await assertFails(getDoc(doc(odb,'status',gid+'_'+other.playerId)));await assertFails(setDoc(doc(odb,'presence',gid+'_'+owner.playerId),{uid:owner.playerId,group:gid,progress:{board:'private'}}));
 await assertFails(getDoc(doc(pdb,'groups',gid)));await assertFails(getDoc(doc(pdb,'presence',gid+'_'+other.playerId)));await assertFails(getDoc(doc(pdb,'status',gid+'_'+other.playerId)));await assertFails(getDocs(query(collection(pdb,'profiles'),where('groupId','==',gid))));
 await assertFails(getDoc(doc(ctx(other),'profiles',owner.authUid)));
 // Joining via an old code/profile field cannot bypass pending approval.
 await env.withSecurityRulesDisabled(c=>setDoc(doc(c.firestore(),'groupInvites','SECURITY'),{groupId:gid,ownerAuthUid:owner.authUid,createdAt:1}));
 await assertFails(updateDoc(doc(newDb,'profiles',uid),{groupId:gid,groupJoinCode:'SECURITY',updatedAt:20}));
 // Another canonical admin may demote the original owner; ownerAuthUid grants no fallback.
 const demoted={...membership(owner,'admin'),role:'member',updatedAt:20};await assertSucceeds(change(adb,owner,demoted));
 await assertSucceeds(getDoc(doc(odb,'groups',gid)));await assertFails(updateDoc(doc(odb,'groups',gid),{name:'Unauthorized',updatedAt:21}));
 await assertFails(change(odb,owner,{...demoted,role:'admin',updatedAt:22}));
 await assertFails(change(adb,other,{...membership(other),joinedAt:1,updatedAt:22}));
 // Removal revokes all shared data and management even though legacy profile.groupId remains.
 {const b=writeBatch(adb);b.delete(doc(adb,'groups',gid,'members',owner.playerId));b.delete(doc(adb,'playerMemberships',owner.playerId,'groups',gid));await assertSucceeds(b.commit())}
 await assertFails(getDoc(doc(odb,'groups',gid)));await assertFails(getDoc(doc(odb,'presence',gid+'_'+other.playerId)));await assertFails(getDoc(doc(odb,'status',gid+'_'+other.playerId)));await assertFails(getDocs(query(collection(odb,'status'),where('group','==',gid))));
 await assertFails(getDoc(doc(odb,'groupActivity',gid,'items','sample')));await assertFails(getDoc(doc(odb,'groupDailyPlans',gid,'items','sample')));await assertFails(getDocs(collection(odb,'groups',gid,'members')));
 // The former member's own legacy progress remains private and recoverable.
 await assertSucceeds(getDoc(doc(odb,'status',gid+'_'+owner.playerId)));
 await assertFails(setDoc(doc(odb,'status',gid+'_'+owner.playerId),{uid:owner.playerId,group:gid,onlineAt:30}));
 await assertFails(change(odb,owner,{...membership(owner,'admin'),updatedAt:30}));
 await assertFails(updateDoc(doc(odb,'groups',gid),{name:'Still owner?',updatedAt:30}));
 const invite={code:'SECINV01',email:'test@example.test',createdByAuthUid:owner.authUid,createdByPlayerId:owner.playerId,createdByName:'Former owner',suggestedGroupId:gid,suggestedGroupName:'Group',createdAt:30,expiresAt:Timestamp.fromMillis(Date.now()+60000),usedByAuthUid:'',usedAt:0,revoked:false};
 await assertFails(setDoc(doc(odb,'accessInvites','SECINV01'),invite));
 await env.withSecurityRulesDisabled(c=>deleteDoc(doc(c.firestore(),'groupInvites','SECURITY')));
 await assertFails(setDoc(doc(odb,'groupInvites','SECURITY'),{groupId:gid,ownerAuthUid:owner.authUid,createdAt:40}));
 // Bootstrap is allowed only for a genuinely new group, with canonical/index writes in the same batch.
 const fresh='g_security02',g=group(fresh,newPlayer,'NEWGROUP');await assertFails(setDoc(doc(newDb,'groups',fresh),g));
 const nm={...membership(newPlayer,'admin'),approvedByPlayerId:newPlayer.playerId};const b=writeBatch(newDb);b.set(doc(newDb,'groups',fresh),g);b.set(doc(newDb,'groups',fresh,'members',newPlayer.playerId),nm);b.set(doc(newDb,'playerMemberships',newPlayer.playerId,'groups',fresh),index(fresh,nm));await assertSucceeds(b.commit());
 await assertSucceeds(setDoc(doc(newDb,'groupInvites','NEWGROUP'),{groupId:fresh,ownerAuthUid:uid,createdAt:40}));
 // A last canonical admin cannot demote itself or delete its own membership/index atomically.
 await assertFails(change(adb,admin,{...membership(admin,'admin'),role:'member',updatedAt:40}));
 {const b=writeBatch(adb);b.delete(doc(adb,'groups',gid,'members',admin.playerId));b.delete(doc(adb,'playerMemberships',admin.playerId,'groups',gid));await assertFails(b.commit())}
 console.log('OK: identity reservation, atomic solo bootstrap, legacy identity, corrupted registry, pending/revoked/demoted membership, private legacy progress, historical joinedAt, group bootstrap and last admin.');
}finally{await env.cleanup()}
