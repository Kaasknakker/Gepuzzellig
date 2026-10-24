#!/usr/bin/env node
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
const PROJECT="gepuzzellig-test";
if(process.env.GOOGLE_CLOUD_PROJECT!==PROJECT)throw new Error("Alleen toegestaan voor gepuzzellig-test");
initializeApp({projectId:PROJECT});
const db=getFirestore(),authUid="fVY1NyHBkMgrSd21AlVcBYzN7Td2",playerId="p_fVY1NyHBkMgrSd21AlVcBYzN7Td2",now=Date.now();
const profile=(await db.doc("profiles/"+authUid).get()).data();
if(!profile||profile.playerId!==playerId)throw new Error("Verwacht testprofiel niet gevonden");
const peterName=profile.displayName||"Peter",fmt=d=>new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Amsterdam",year:"numeric",month:"2-digit",day:"2-digit"}).format(d),today=fmt(new Date()),day=n=>fmt(new Date(Date.now()-n*86400000));
const groups=[{id:"g_testduo",name:"Testduo",accent:"teal",members:[[playerId,peterName],["test-noor","Noor"]]},{id:"g_testzes",name:"Testgroep 6",accent:"purple",members:[[playerId,peterName],["test-sam","Sam"],["test-finn","Finn"],["test-mila","Mila"],["test-daan","Daan"],["test-zoe","Zoë"]]}];
const batch=db.batch(),put=(path,data)=>batch.set(db.doc(path),data),plan={favoritePuzzleTypes:["bin","star","plus"],difficulties:{bin:"normal",star:"normal",plus:"normal"}};
for(const g of groups){put("groups/"+g.id,{name:g.name,ownerAuthUid:authUid,inviteCode:g.id==="g_testduo"?"TESTDUO2":"TESTZES6",theme:"shared",accent:g.accent,murdokuNames:[],createdAt:now,updatedAt:now});
 for(const [pid,name] of g.members){const joinedAt=now-10*86400000,role=pid===playerId?"admin":"member";put("groups/"+g.id+"/members/"+pid,{playerId:pid,displayName:name,role,status:"approved",requestedAt:joinedAt,approvedAt:joinedAt,joinedAt,approvedByPlayerId:playerId,updatedAt:now});put("playerMemberships/"+pid+"/groups/"+g.id,{groupId:g.id,role,status:"approved",joinedAt,updatedAt:now});put("groupDailyPlans/"+g.id+"/items/"+today+"_"+pid,{schemaVersion:1,groupId:g.id,playerId:pid,displayName:name,date:today,...plan,createdAt:now-3600000,sharedAt:now})}}
const fake=[["test-noor","Noor"],["test-sam","Sam"],["test-finn","Finn"],["test-mila","Mila"],["test-daan","Daan"],["test-zoe","Zoë"]],memberGroups=pid=>groups.filter(g=>g.members.some(([id])=>id===pid));
const result=(pid,name,g,type,date,secs)=>{const key=type+date+".2",id=encodeURIComponent(pid+"|"+key).replace(/\./g,"%2E");put("groupActivity/"+g.id+"/items/"+id,{schemaVersion:1,groupId:g.id,playerId:pid,name,puzzleDate:date,completedOn:date,puzzleType:type,resultType:"daily",mode:"daily",difficulty:"normal",variant:"classic",deviceVariant:"default",puzzleKey:key,secs,mist:0,hints:0,hintSteps:{},completedAt:now-(date===today?900000:86400000)})};
for(const [i,[pid,name]] of fake.entries())for(const g of memberGroups(pid)){result(pid,name,g,"bin",today,150+i*24);if(i%3!==1)result(pid,name,g,"star",today,205+i*31);if(i%2===0)result(pid,name,g,"plus",today,120+i*19);for(let back=1;back<=Math.min(7,2+i);back++)result(pid,name,g,back%2?"bin":"star",day(back),180+i*17+back*9)}
for(const g of groups)result(playerId,peterName,g,"bin",today,198);
await batch.commit();
console.log("TESTDATA_OK",groups.map(g=>g.name+":"+g.members.length).join(", "));
