#!/usr/bin/env node
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
const PROJECT="gepuzzellig-test"; // Test-only fixture seed; productie is hier bewust uitgesloten.
if(process.env.GOOGLE_CLOUD_PROJECT!==PROJECT)throw new Error("Alleen toegestaan voor gepuzzellig-test");
initializeApp({projectId:PROJECT});
const db=getFirestore(),authUid="fVY1NyHBkMgrSd21AlVcBYzN7Td2",playerId="p_fVY1NyHBkMgrSd21AlVcBYzN7Td2",now=Date.now();
const profile=(await db.doc("profiles/"+authUid).get()).data();
if(!profile||profile.playerId!==playerId)throw new Error("Verwacht testprofiel niet gevonden");
const peterName=profile.displayName||"Peter",fmt=d=>new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Amsterdam",year:"numeric",month:"2-digit",day:"2-digit"}).format(d),today=fmt(new Date()),day=n=>fmt(new Date(Date.now()-n*86400000));
const groups=[{id:"g_testduo",name:"Testduo",accent:"teal",members:[[playerId,peterName],["test-noor","Noor"]]},{id:"g_testzes",name:"Testgroep 6",accent:"purple",members:[[playerId,peterName],["test-sam","Sam"],["test-finn","Finn"],["test-mila","Mila"],["test-daan","Daan"],["test-zoe","Zoë"]]},{id:"g_testrekensukkels",name:"Rekensukkels",accent:"orange",members:[[playerId,peterName],["test-aart","Aart"]]}];
const batch=db.batch(),put=(path,data)=>batch.set(db.doc(path),data);
put("players/"+playerId,{playerId,authUid,displayName:peterName,createdAt:Number(profile.createdAt)||now,updatedAt:now});
for(const [pid,name] of [["test-noor","Noor"],["test-sam","Sam"],["test-finn","Finn"],["test-mila","Mila"],["test-daan","Daan"],["test-zoe","Zoë"],["test-aart","Aart"]])put("players/"+pid,{playerId:pid,authUid:"fixture_"+pid,displayName:name,createdAt:now,updatedAt:now});
const plans={
 [playerId]:{favoritePuzzleTypes:["bin","star","plus","hex"],difficulties:{bin:"normal",star:"hard",plus:"easy",hex:"normal"}},
 "test-noor":{favoritePuzzleTypes:["bin","plus"],difficulties:{bin:"easy",plus:"hard"}},
 "test-sam":{favoritePuzzleTypes:["bin","star","hex","plus","nono","mur","kak","m24"],difficulties:{bin:"hard",star:"normal",hex:"easy",plus:"normal",nono:"hard",mur:"easy",kak:"normal",m24:"hard"}},
 "test-finn":{favoritePuzzleTypes:["star","plus","nono","bin","hex","mur","kak","m24","krop","slither"],difficulties:{star:"easy",plus:"normal",nono:"hard",bin:"normal",hex:"easy",mur:"hard",kak:"normal",m24:"easy",krop:"hard",slither:"normal"}},
 "test-mila":{favoritePuzzleTypes:["bin","hex","plus","mur"],difficulties:{bin:"normal",hex:"hard",plus:"easy",mur:"normal"}},
 "test-daan":{favoritePuzzleTypes:["bin","star"],difficulties:{bin:"easy",star:"hard"}},
 "test-zoe":{favoritePuzzleTypes:["plus","hex","nono","bin","star","mur","kak","m24","krop","slither","sudoku","tents"],difficulties:{plus:"hard",hex:"normal",nono:"easy",bin:"normal",star:"hard",mur:"easy",kak:"normal",m24:"hard",krop:"easy",slither:"normal",sudoku:"hard",tents:"easy"}},
 "test-aart":{favoritePuzzleTypes:["bin","plus","nono","mur"],difficulties:{bin:"normal",plus:"hard",nono:"normal",mur:"normal"}}
};
for(const g of groups){const inviteCode=g.id==="g_testduo"?"TESTDUO2":g.id==="g_testzes"?"TESTZES6":"REKENSUK";put("groups/"+g.id,{name:g.name,ownerAuthUid:authUid,inviteCode,theme:"shared",accent:g.accent,murdokuNames:[],createdAt:now,updatedAt:now});
 for(const [pid,name] of g.members){const joinedAt=now-10*86400000,role=pid===playerId?"admin":"member",plan=plans[pid];put("groups/"+g.id+"/members/"+pid,{playerId:pid,displayName:name,role,status:"approved",requestedAt:joinedAt,approvedAt:joinedAt,joinedAt,approvedByPlayerId:playerId,updatedAt:now});put("playerMemberships/"+pid+"/groups/"+g.id,{groupId:g.id,role,status:"approved",joinedAt,updatedAt:now});put("groupDailyPlans/"+g.id+"/items/"+today+"_"+pid,{schemaVersion:1,groupId:g.id,playerId:pid,displayName:name,date:today,...plan,createdAt:now-3600000,sharedAt:now})}}
const fake=[["test-noor","Noor"],["test-sam","Sam"],["test-finn","Finn"],["test-mila","Mila"],["test-daan","Daan"],["test-zoe","Zoë"],["test-aart","Aart"]],memberGroups=pid=>groups.filter(g=>g.members.some(([id])=>id===pid));
// Rijke aanwezigheid voor UI-tests: online op Home, bezig met puzzelen en recent offline.
const statusRows=[["test-sam","Sam",now-12000,"home","",false,0],["test-finn","Finn",now-26000,"puzzle","plus",false,2],["test-mila","Mila",now-52000,"puzzle","hex",false,3],["test-daan","Daan",now-3*60000,"home","",false,0],["test-zoe","Zoë",now-18000,"puzzle","nono",true,1]];
for(const [pid,name,onlineAt,onlineView,onlineType,onlinePractice,onlineLvl] of statusRows)put("status/"+pid,{uid:pid,playerId:pid,name,group:"g_testzes",onlineAt,onlineView,onlineType,onlinePractice,onlineLvl,onlineNono:onlineType==="nono"?"color":"",date:today,type:onlineType,at:onlineAt});
const result=(pid,name,g,type,date,secs,difficulty="normal")=>{const key=date+":"+type+"."+difficulty,id=encodeURIComponent(pid+"|"+key).replace(/\./g,"%2E");put("groupActivity/"+g.id+"/items/"+id,{schemaVersion:1,groupId:g.id,playerId:pid,name,puzzleDate:date,completedOn:date,puzzleType:type,resultType:type+"."+difficulty,mode:"daily",difficulty,variant:"",deviceVariant:"default",puzzleKey:key,secs,mist:secs%3===0?1:0,hints:secs%5===0?1:0,hintSteps:{},completedAt:now-(date===today?900000:86400000)})};
const todayDone={"test-noor":[["bin",132,"easy"]],"test-sam":[["bin",318,"hard"],["star",242,"normal"],["hex",355,"easy"]],"test-finn":[["star",116,"easy"],["plus",189,"normal"]],"test-mila":[["bin",198,"normal"],["hex",481,"hard"]],"test-daan":[],"test-zoe":[["plus",274,"hard"],["hex",229,"normal"],["nono",390,"easy"]],"test-aart":[["bin",176,"normal"],["plus",248,"hard"]]};
for(const [pid,name] of fake)for(const g of memberGroups(pid)){for(const [type,secs,diff] of todayDone[pid])result(pid,name,g,type,today,secs,diff);for(let back=1;back<=42;back++){const p=plans[pid],type=p.favoritePuzzleTypes[(back+pid.length)%p.favoritePuzzleTypes.length],diff=p.difficulties[type]||"normal";if((back+pid.length)%4!==0)result(pid,name,g,type,day(back),120+((back*37+pid.length*19)%420),diff)}}
// Vrije puzzels voor persoonlijke/groepsstatistieken met verschillende niveaus en recente tijden.
const freeResult=(pid,name,g,type,back,secs,difficulty,variant="")=>{const date=day(back),stamp=now-back*86400000-(pid.length*17%360)*60000,key="v~"+type+"~fixture-"+back+"-"+difficulty,id=encodeURIComponent(pid+"|"+key+"|"+date).replace(/\\./g,"%2E");put("groupActivity/"+g.id+"/items/"+id,{schemaVersion:1,groupId:g.id,playerId:pid,name,puzzleDate:date,completedOn:date,puzzleType:type,resultType:key,mode:"free",difficulty,variant,deviceVariant:"default",puzzleKey:key,secs,mist:(back+pid.length)%5===0?2:(back%3===0?1:0),hints:(back+type.length)%4===0?1:0,hintSteps:{},completedAt:stamp})};
const freeSets={"test-sam":[["bin",0,205,"easy"],["hex",2,410,"hard"],["star",5,178,"normal"]],"test-finn":[["plus",0,155,"hard"],["nono",1,522,"normal"],["bin",6,142,"easy"]],"test-mila":[["mur",1,337,"easy"],["hex",3,448,"hard"]],"test-daan":[["star",2,201,"normal"],["bin",8,169,"easy"]],"test-zoe":[["nono",0,461,"hard","color"],["plus",4,219,"normal"],["hex",9,301,"easy"]],"test-aart":[["nono",1,438,"normal"],["mur",5,329,"normal"]]};
for(const [pid,name] of fake)for(const g of memberGroups(pid))for(const [type,back,secs,diff,variant] of freeSets[pid]||[])freeResult(pid,name,g,type,back,secs,diff,variant||"");
for(const g of groups){result(playerId,peterName,g,"bin",today,198,"normal");result(playerId,peterName,g,"star",today,264,"hard")}
await batch.commit();
console.log("TESTDATA_OK",groups.map(g=>g.name+":"+g.members.length).join(", "));
