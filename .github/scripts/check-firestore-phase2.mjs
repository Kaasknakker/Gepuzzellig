import fs from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
const projectId='gepuzzellig-rules-test',rules=fs.readFileSync('firestore.rules','utf8'),fx=JSON.parse(fs.readFileSync('test/fixtures/firestore-phase2.json','utf8'));
const env=await initializeTestEnvironment({projectId,firestore:{rules,host:'127.0.0.1',port:8080}});
const playerDoc=p=>({playerId:p.playerId,authUid:p.authUid,displayName:p.displayName,createdAt:1,updatedAt:1});
const profileDoc=p=>({authUid:p.authUid,playerId:p.playerId,displayName:p.displayName,groupId:'',role:'user',createdAt:1,updatedAt:1,inviteCode:'fixture000',invitedByAuthUid:'fixture',groupJoinCode:'',theme:'shared',accent:'blue'});
const indexOf=(m,gid)=>({groupId:gid,role:m.role,status:m.status,joinedAt:m.joinedAt||0,updatedAt:m.updatedAt});
try{
 await env.withSecurityRulesDisabled(async c=>{const db=c.firestore();
  for(const p of Object.values(fx.players)){await setDoc(doc(db,'players',p.playerId),playerDoc(p));await setDoc(doc(db,'profiles',p.authUid),profileDoc(p));}
  await setDoc(doc(db,'groups',fx.group.id),{name:fx.group.name,ownerAuthUid:'auth-admin',inviteCode:'rules01',theme:'shared',accent:'blue',murdokuNames:[],createdAt:1,updatedAt:1});
  for(const m of Object.values(fx.memberships)){await setDoc(doc(db,'groups',fx.group.id,'members',m.playerId),m);await setDoc(doc(db,'playerMemberships',m.playerId,'groups',fx.group.id),indexOf(m,fx.group.id));}
  await setDoc(doc(db,'progress','p_solo','items','daily-bin'),{playerId:'p_solo',puzzleType:'bin',mode:'daily',puzzleKey:'bin:fixture',difficulty:'normal',state:{cells:[]},progressPercent:20,startedAt:10,updatedAt:20});
 });
 const db=p=>env.authenticatedContext(p.authUid).firestore(),{solo,pending,member,admin,outsider}=fx.players;
 const anonUid='auth-new-anon',anonPlayer='p_'+anonUid,anonDb=env.authenticatedContext(anonUid,{firebase:{sign_in_provider:'anonymous'}}).firestore();
 const anonProfile={authUid:anonUid,playerId:anonPlayer,displayName:'Solo tester',groupId:'',role:'user',accountState:'anonymous',createdAt:300,updatedAt:300,inviteCode:'',invitedByAuthUid:'',groupJoinCode:'',theme:'shared',accent:'blue',preferences:{favoritePuzzleTypes:['bin','star','nono'],dailyDifficulty:{bin:'normal',star:'normal',nono:'normal',hex:'normal',plus:'normal',mur:'normal'}}};
 await assertSucceeds(setDoc(doc(anonDb,'profiles',anonUid),anonProfile));await assertSucceeds(setDoc(doc(anonDb,'players',anonPlayer),{playerId:anonPlayer,authUid:anonUid,displayName:'Solo tester',createdAt:300,updatedAt:300}));
 await assertFails(updateDoc(doc(anonDb,'profiles',anonUid),{playerId:'p_second_identity',updatedAt:301}));
 await assertSucceeds(setDoc(doc(anonDb,'dailyPlans',anonPlayer,'days','2026-10-24'),{schemaVersion:4,playerId:anonPlayer,date:'2026-10-24',favoritePuzzleTypes:['bin','star','nono'],difficulties:{bin:'normal',star:'hard',nono:'easy'},createdAt:305}));
 await assertSucceeds(getDoc(doc(anonDb,'dailyPlans',anonPlayer,'days','2026-10-24')));
 await assertFails(updateDoc(doc(anonDb,'dailyPlans',anonPlayer,'days','2026-10-24'),{favoritePuzzleTypes:['bin']}));
 await assertFails(getDoc(doc(db(outsider),'dailyPlans',anonPlayer,'days','2026-10-24')));
 const linkedDb=env.authenticatedContext(anonUid,{email:'solo@example.test',email_verified:true,firebase:{sign_in_provider:'google.com'}}).firestore();
 await assertSucceeds(updateDoc(doc(linkedDb,'profiles',anonUid),{accountState:'linked',updatedAt:302}));await assertFails(updateDoc(doc(linkedDb,'profiles',anonUid),{playerId:'p_second_identity',updatedAt:303}));
 await assertSucceeds(getDoc(doc(db(solo),'players',solo.playerId)));await assertFails(getDoc(doc(db(outsider),'players',solo.playerId)));
 await assertSucceeds(getDoc(doc(db(solo),'progress',solo.playerId,'items','daily-bin')));
 const personalResult={schemaVersion:3,playerId:solo.playerId,name:'Solo',groupId:'',puzzleDate:'2026-10-24',completedOn:'2026-10-24',puzzleType:'bin',resultType:'bin.2',mode:'daily',difficulty:'2',variant:'',deviceVariant:'ipad',puzzleKey:'2026-10-24:bin.2',secs:120,mist:0,hints:0,emo:'',note:'',legacyResultId:'',createdAt:400,updatedAt:400};
 await assertSucceeds(setDoc(doc(db(solo),'playerResults',solo.playerId,'items','daily-bin'),personalResult));await assertFails(setDoc(doc(db(outsider),'playerResults',solo.playerId,'items','bad'),{...personalResult,playerId:solo.playerId,puzzleKey:'bad'}));
 await assertSucceeds(setDoc(doc(db(solo),'progress',solo.playerId,'items','phase4-free'),{schemaVersion:3,legacyKey:'p:star.3',playerId:solo.playerId,puzzleType:'star',mode:'free',puzzleKey:'p:star.3',difficulty:'3',variant:'',deviceVariant:'ipad',state:{k:'p:star.3',pc:25},progressPercent:25,startedAt:410,updatedAt:411}));await assertFails(getDoc(doc(db(outsider),'progress',solo.playerId,'items','daily-bin')));
 // Solo -> pending: canonical membership en inverse index moeten in dezelfde batch worden geschreven.
 const request={playerId:solo.playerId,displayName:'Solo',role:'member',status:'pending',requestedAt:500,approvedAt:0,joinedAt:0,approvedByPlayerId:'',updatedAt:500};
 {const x=db(solo),b=writeBatch(x);b.set(doc(x,'groups',fx.group.id,'members',solo.playerId),request);b.set(doc(x,'playerMemberships',solo.playerId,'groups',fx.group.id),indexOf(request,fx.group.id));await assertSucceeds(b.commit())}
 await assertFails(setDoc(doc(db(solo),'groups',fx.group.id,'members','p_fake'),{...request,playerId:'p_fake'}));
 // Pending -> approved door groepsadmin, eveneens atomair met inverse index.
 const approved={...fx.memberships.pending,status:'approved',approvedAt:510,joinedAt:510,approvedByPlayerId:admin.playerId,updatedAt:510};
 {const x=db(admin),b=writeBatch(x);b.set(doc(x,'groups',fx.group.id,'members',pending.playerId),approved);b.set(doc(x,'playerMemberships',pending.playerId,'groups',fx.group.id),indexOf(approved,fx.group.id));await assertSucceeds(b.commit())}
 await assertFails(updateDoc(doc(db(member),'groups',fx.group.id,'members',pending.playerId),{role:'admin',updatedAt:520}));
 // Meerdere admins: admin kan een ander approved lid promoveren en later weer degraderen.
 const promoted={...fx.memberships.member,role:'admin',updatedAt:530};
 {const x=db(admin),b=writeBatch(x);b.set(doc(x,'groups',fx.group.id,'members',member.playerId),promoted);b.set(doc(x,'playerMemberships',member.playerId,'groups',fx.group.id),indexOf(promoted,fx.group.id));await assertSucceeds(b.commit())}
 // De zojuist gepromoveerde membership-admin kan zelf een andere pending aanvraag goedkeuren.
 const soloApproved={...request,status:'approved',approvedAt:535,joinedAt:535,approvedByPlayerId:member.playerId,updatedAt:535};
 {const x=db(member),b=writeBatch(x);b.set(doc(x,'groups',fx.group.id,'members',solo.playerId),soloApproved);b.set(doc(x,'playerMemberships',solo.playerId,'groups',fx.group.id),indexOf(soloApproved,fx.group.id));await assertSucceeds(b.commit())}
 const demoted={...promoted,role:'member',updatedAt:540};
 {const x=db(admin),b=writeBatch(x);b.set(doc(x,'groups',fx.group.id,'members',member.playerId),demoted);b.set(doc(x,'playerMemberships',member.playerId,'groups',fx.group.id),indexOf(demoted,fx.group.id));await assertSucceeds(b.commit())}
 // Laatste-adminbescherming: een admin kan zichzelf nooit degraderen/verwijderen.
 await assertFails(updateDoc(doc(db(admin),'groups',fx.group.id,'members',admin.playerId),{role:'member',updatedAt:550}));await assertFails(deleteDoc(doc(db(admin),'groups',fx.group.id,'members',admin.playerId)));
 // Eén speler kan naast de eerste groep een tweede approved membership hebben.
 const gid2='g_rules02',now=600,admin2={playerId:admin.playerId,displayName:'Admin',role:'admin',status:'approved',requestedAt:now,approvedAt:now,joinedAt:now,approvedByPlayerId:admin.playerId,updatedAt:now};
 {const x=db(admin),b=writeBatch(x);b.set(doc(x,'groups',gid2),{name:'Tweede groep',ownerAuthUid:admin.authUid,inviteCode:'rules02',theme:'shared',accent:'blue',murdokuNames:[],createdAt:now,updatedAt:now});b.set(doc(x,'groups',gid2,'members',admin.playerId),admin2);b.set(doc(x,'playerMemberships',admin.playerId,'groups',gid2),indexOf(admin2,gid2));await assertSucceeds(b.commit())}
 await assertSucceeds(getDoc(doc(db(admin),'playerMemberships',admin.playerId,'groups',fx.group.id)));await assertSucceeds(getDoc(doc(db(admin),'playerMemberships',admin.playerId,'groups',gid2)));
 await assertFails(getDoc(doc(db(outsider),'playerMemberships',member.playerId,'groups',fx.group.id)));
 // Fase 8: sociale projecties zijn alleen zichtbaar binnen approved memberships en pas vanaf joinedAt.
 const joined=Number(fx.memberships.member.joinedAt)||1,social={schemaVersion:1,groupId:fx.group.id,playerId:member.playerId,name:'Member',puzzleDate:'2026-10-24',completedOn:'2026-10-24',puzzleType:'bin',resultType:'bin.2',mode:'daily',difficulty:'2',variant:'',deviceVariant:'ipad',puzzleKey:'2026-10-24:bin.2',secs:111,mist:0,hints:0,hintSteps:{},completedAt:joined+10};
 await assertSucceeds(setDoc(doc(db(member),'groupActivity',fx.group.id,'items','member-bin'),social));
 await assertSucceeds(getDoc(doc(db(admin),'groupActivity',fx.group.id,'items','member-bin')));
 await assertFails(getDoc(doc(db(outsider),'groupActivity',fx.group.id,'items','member-bin')));
 await assertFails(setDoc(doc(db(member),'groupActivity',fx.group.id,'items','too-old'),{...social,puzzleKey:'old',completedAt:Math.max(1,joined-1)}));
 const sharedPlan={schemaVersion:1,groupId:fx.group.id,playerId:member.playerId,displayName:'Member',date:'2026-10-24',favoritePuzzleTypes:['bin','star'],difficulties:{bin:'normal',star:'hard'},createdAt:joined+20};
 await assertSucceeds(setDoc(doc(db(member),'groupDailyPlans',fx.group.id,'items','2026-10-24_'+member.playerId),sharedPlan));
 await assertSucceeds(getDoc(doc(db(admin),'groupDailyPlans',fx.group.id,'items','2026-10-24_'+member.playerId)));
 await assertFails(getDoc(doc(db(outsider),'groupDailyPlans',fx.group.id,'items','2026-10-24_'+member.playerId)));
 console.log('Fase 2-8 Firestore-rules: solo, persoonlijke data, memberships, joinedAt-sociale projecties en laatste-adminbescherming geslaagd.');
}finally{await env.cleanup()}
