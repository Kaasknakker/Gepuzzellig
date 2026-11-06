import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
/* Regressie (melding 6 nov): zonder verbinding gestart blijft de homepage op "Je speelt nu solo" staan.
   Bij het terugkomen van de verbinding moet het profiel alsnog worden gestart, maar niet dubbel en niet in beheerdersweergave. */
const src=fs.readFileSync('js/firebase.js','utf8'),line=src.split('\n').find(l=>l.includes('let profileRetry=false;'));
assert.ok(line,'online-herstel ontbreekt in firebase.js');
function run({user=true,watching=false,admin=false,profile={playerId:'p'}}={}){
 const calls={watch:0,get:0};let online=null;const u={uid:'u'};
 const ctx=vm.createContext({auth:{currentUser:user?u:null},unsubProfile:watching?()=>{}:null,adminGroupCode:()=>admin?'g':'',
  getProfile:()=>{calls.get++;return Promise.resolve(profile)},watchProfile:()=>{calls.watch++},addEventListener:(t,f)=>{if(t==='online')online=f}});
 vm.runInContext(line,ctx);return{fire:()=>{online();return new Promise(r=>setTimeout(r,5))},calls}}
let t=run();await t.fire();assert.deepEqual([t.calls.get,t.calls.watch],[1,1],'profiel start alsnog bij terugkomende verbinding');
t=run({watching:true});await t.fire();assert.deepEqual([t.calls.get,t.calls.watch],[0,0],'geen dubbele start als het profiel al luistert');
t=run({admin:true});await t.fire();assert.deepEqual([t.calls.get,t.calls.watch],[0,0],'niet in beheerdersweergave');
t=run({user:false});await t.fire();assert.deepEqual([t.calls.get,t.calls.watch],[0,0],'niet zonder ingelogde gebruiker');
t=run({profile:null});await t.fire();assert.deepEqual([t.calls.get,t.calls.watch],[1,0],'geen profiel: niets starten');
console.log('OK: zonder verbinding gestart herstelt de groepsinfo zodra de verbinding terug is');
