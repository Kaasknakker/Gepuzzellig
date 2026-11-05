import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
/* Regressie: openen van een puzzel gebruikt online de nieuwste voortgang (wacht op profiel en lopende ophaalronde), offline niet. */
const core=fs.readFileSync('js/core.js','utf8'),section=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
function make(over={}){const handlers={};let resolvePull,pulls=0;
 const x=vm.createContext(Object.assign({console,setTimeout,Date,PHONE:false,uid:'x',cloudProgPromise:null,cloudProgPulling:false,cloudProgPullAt:0,
  navigator:{onLine:true},window:{PD_DB:{saveProgress(){},getProgress:()=>{pulls++;return new Promise(r=>{resolvePull=r})}}},
  addEventListener:(n,f,o)=>{(handlers[n]=handlers[n]||[]).push({f,once:o&&o.once})},
  $:()=>({value:'g'}),S:{},progKey:()=>'k',UX:{storage(){}},mergeCloudProgress:v=>v,
  cloudProgOk:()=>x.uid!=='x'&&!x.PHONE&&!!x.window.PD_DB.saveProgress},over));
 vm.runInContext(section(core,'function pullCloudProgress(','function persist(').split('\n').filter(l=>!l.startsWith('function persist')).join('\n').replace(/function persist[\s\S]*/,''),x);
 vm.runInContext(section(core,'let pdWaited=','function openType('),x);
 const fire=n=>{(handlers[n]||[]).slice().forEach(h=>h.f());handlers[n]=(handlers[n]||[]).filter(h=>!h.once)};
 return{x,fire,resolve:v=>resolvePull(v),pulls:()=>pulls}}
const tick=()=>new Promise(r=>setTimeout(r,5));
// 1. Profiel nog niet geladen: openen wacht op het profiel en daarna op de ophaalronde.
{const t=make();let opened=0;const p=t.x.withFreshProgress(()=>{opened++});await tick();assert.equal(opened,0,'wacht op profiel');
 t.x.uid='me';t.fire('pdprofile');await tick();assert.equal(opened,0,'wacht op ophaalronde');assert.equal(t.pulls(),1);t.resolve({});await p;assert.equal(opened,1,'opent na verse voortgang')}
// 2. Lopende ophaalronde wordt hergebruikt in plaats van overgeslagen.
{const t=make({uid:'me'});const first=t.x.pullCloudProgress(true);const second=t.x.pullCloudProgress(true);await tick();assert.equal(t.pulls(),1,'geen tweede aanvraag naast de lopende');
 let opened=0;const p=t.x.withFreshProgress(()=>{opened++});await tick();assert.equal(opened,0,'opent niet voordat de lopende ronde klaar is');t.resolve({});await Promise.all([first,second,p]);assert.equal(opened,1)}
// 3. Offline, telefoon of zonder database: direct de lokale stand.
for(const over of[{navigator:{onLine:false}},{PHONE:true}]){const t=make(over);let opened=0;await t.x.withFreshProgress(()=>{opened++});assert.equal(opened,1);assert.equal(t.pulls(),0)}
{const t=make({uid:'me'});t.x.window.PD_DB=undefined;let opened=0;await t.x.withFreshProgress(()=>{opened++});assert.equal(opened,1)}
// 4. Uitgelogd: geen wachttijd.
{const t=make();t.fire('pdauthout');let opened=0;await t.x.withFreshProgress(()=>{opened++});assert.equal(opened,1)}
console.log('OK: openen wacht online op profiel en lopende ophaalronde, hergebruikt een lopende aanvraag, en opent offline/zonder cloud direct.');
process.exit(0);
