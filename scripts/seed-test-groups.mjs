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
const batch=db.batch(),put=(path,data)=>batch.set(db.doc(path),data);
put("players/"+playerId,{playerId,authUid,displayName:peterName,createdAt:Number(profile.createdAt)||now,updatedAt:now});
for(const [pid,name] of [["test-noor","Noor"],["test-sam","Sam"],["test-finn","Finn"],["test-mila","Mila"],["test-daan","Daan"],["test-zoe","Zoë"]])put("players/"+pid,{playerId:pid,authUid:"fixture_"+pid,displayName:name,createdAt:now,updatedAt:now});
const plans={
 [playerId]:{favoritePuzzleTypes:["bin","star","plus","hex"],difficulties:{bin:"normal",star:"hard",plus:"easy",hex:"normal"}},
 "test-noor":{favoritePuzzleTypes:["bin","plus"],difficulties:{bin:"easy",plus:"hard"}},
 "test-sam":{favoritePuzzleTypes:["bin","star","hex"],difficulties:{bin:"hard",star:"normal",hex:"easy"}},
 "test-finn":{favoritePuzzleTypes:["star","plus","nono"],difficulties:{star:"easy",plus:"normal",nono:"hard"}},
 "test-mila":{favoritePuzzleTypes:["bin","hex","plus","mur"],difficulties:{bin:"normal",hex:"hard",plus:"easy",mur:"normal"}},
 "test-daan":{favoritePuzzleTypes:["bin","star"],difficulties:{bin:"easy",star:"hard"}},
 "test-zoe":{favoritePuzzleTypes:["plus","hex","nono"],difficulties:{plus:"hard",hex:"normal",nono:"easy"}}
};
for(const g of groups){put("groups/"+g.id,{name:g.name,ownerAuthUid:authUid,inviteCode:g.id==="g_testduo"?"TESTDUO2":"TESTZES6",theme:"shared",accent:g.accent,murdokuNames:[],createdAt:now,updatedAt:now});
 for(const [pid,name] of g.members){const joinedAt=now-10*86400000,role=pid===playerId?"admin":"member",plan=plans[pid];put("groups/"+g.id+"/members/"+pid,{playerId:pid,displayName:name,role,status:"approved",requestedAt:joinedAt,approvedAt:joinedAt,joinedAt,approvedByPlayerId:playerId,updatedAt:now});put("playerMemberships/"+pid+"/groups/"+g.id,{groupId:g.id,role,status:"approved",joinedAt,updatedAt:now});put("groupDailyPlans/"+g.id+"/items/"+today+"_"+pid,{schemaVersion:1,groupId:g.id,playerId:pid,displayName:name,date:today,...plan,createdAt:now-3600000,sharedAt:now})}}
const fake=[["test-noor","Noor"],["test-sam","Sam"],["test-finn","Finn"],["test-mila","Mila"],["test-daan","Daan"],["test-zoe","Zoë"]],memberGroups=pid=>groups.filter(g=>g.members.some(([id])=>id===pid));
const result=(pid,name,g,type,date,secs,difficulty="normal")=>{const key=date+":"+type+"."+difficulty,id=encodeURIComponent(pid+"|"+key).replace(/\./g,"%2E");put("groupActivity/"+g.id+"/items/"+id,{schemaVersion:1,groupId:g.id,playerId:pid,name,puzzleDate:date,completedOn:date,puzzleType:type,resultType:type+"."+difficulty,mode:"daily",difficulty,variant:"",deviceVariant:"default",puzzleKey:key,secs,mist:secs%3===0?1:0,hints:secs%5===0?1:0,hintSteps:{},completedAt:now-(date===today?900000:86400000)})};
const todayDone={"test-noor":[["bin",132,"easy"]],"test-sam":[["bin",318,"hard"],["star",242,"normal"],["hex",355,"easy"]],"test-finn":[["star",116,"easy"],["plus",189,"normal"]],"test-mila":[["bin",198,"normal"],["hex",481,"hard"]],"test-daan":[],"test-zoe":[["plus",274,"hard"],["hex",229,"normal"],["nono",390,"easy"]]};
for(const [pid,name] of fake)for(const g of memberGroups(pid)){for(const [type,secs,diff] of todayDone[pid])result(pid,name,g,type,today,secs,diff);for(let back=1;back<=21;back++){const p=plans[pid],type=p.favoritePuzzleTypes[(back+pid.length)%p.favoritePuzzleTypes.length],diff=p.difficulties[type]||"normal";if((back+pid.length)%4!==0)result(pid,name,g,type,day(back),120+((back*37+pid.length*19)%420),diff)}}
for(const g of groups){result(playerId,peterName,g,"bin",today,198,"normal");result(playerId,peterName,g,"star",today,264,"hard")}
await batch.commit();
console.log("TESTDATA_OK",groups.map(g=>g.name+":"+g.members.length).join(", "));
