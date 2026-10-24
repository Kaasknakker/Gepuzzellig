import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const registry=fs.readFileSync("js/puzzle-registry.js","utf8");
const context={};vm.createContext(context);vm.runInContext(registry+"\nglobalThis.REG=PUZZLE_REGISTRY;",context);
const reg=context.REG,active=Object.entries(reg).filter(([,p])=>p.active).map(([t])=>t);
assert.deepEqual(active,["bin","star","nono","hex","plus","mur"],"actieve puzzels mogen door registratie-opruiming niet veranderen");

for(const t of active){
 const p=reg[t];
 assert.ok(p.name&&p.color, t+": naam/kleur ontbreekt");
 assert.equal((p.levels?.wide||[]).join(","),"1,2,3",t+": groot-schermniveaus");
 assert.equal((p.levels?.phone||[]).join(","),"4,5,6",t+": telefoonniveaus");
 for(const lv of [1,2,3,4,5,6])assert.ok(p.sizes?.[lv],t+": formaat niveau "+lv+" ontbreekt");
}

const core=fs.readFileSync("js/core.js","utf8"),rules=fs.readFileSync("firestore.rules","utf8"),css=fs.readFileSync("css/app.css","utf8");
for(const t of active){
 assert.match(core,new RegExp("\\b"+t+":gen[A-Z]"),t+": generator ontbreekt in GEN");
 assert.ok(core.includes(t+':"')||core.includes(t+":'")||core.includes(" "+t+":"),t+": puzzelspecifieke metadata ontbreekt in core");
 assert.match(rules,new RegExp("['\"]"+t+"['\"]"),t+": ontbreekt in Firestore onlineType-allowlist");
 assert.match(css,new RegExp("nav button\\[data-t="+t+"\\]"),t+": navigatiekleur ontbreekt in CSS");
}
console.log("OK: centrale puzzelregistratie compleet voor "+active.length+" actieve puzzels");
