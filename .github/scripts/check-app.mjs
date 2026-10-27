// Gepuzzellig CI-integriteitscontrole
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import {execFileSync} from "node:child_process";

const read=p=>fs.readFileSync(p,"utf8");
const bad=m=>{console.error("FAIL: "+m);process.exitCode=1};
const good=m=>console.log("OK: "+m);
const strip=s=>s.split("?")[0].split("#")[0];
const local=s=>!/^([a-z]+:)?\/\//i.test(s)&&!s.startsWith("data:");

const html=read("index.html");
// De bron draagt de productienaam; alleen de testdeploy zet "Gepuzzellig Test" in de testsite.
if(/Gepuzzellig( |%20)Test/.test(html))bad("index.html bevat de testnaam 'Gepuzzellig Test'; die hoort alleen in de testdeploy");else good("app-naam in index.html is Gepuzzellig");
const scripts=[...html.matchAll(/<script\b([^>]*)\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)]
  .map(m=>({attrs:m[1]||"",src:m[2],module:/\btype=["']module["']/i.test(m[1]||"")}))
  .filter(x=>local(x.src));

const classic=[];
for(const s of scripts){
  const file=strip(s.src);
  if(!fs.existsSync(file)){bad("ontbrekend script: "+file);continue}
  const code=read(file);
  if(s.module){
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),"gepuzzellig-"));
    const tmp=path.join(dir,path.basename(file).replace(/\.js$/i,"")+".mjs");
    try{fs.writeFileSync(tmp,code);execFileSync(process.execPath,["--check",tmp],{stdio:"pipe"});good(file)}
    catch(e){bad(file+": "+String(e.stderr||e.message))}
    finally{fs.rmSync(dir,{recursive:true,force:true})}
  }else{
    try{new vm.Script(code,{filename:file});classic.push({file,code});good(file)}
    catch(e){bad(file+": "+e.message)}
  }
}
try{
  new vm.Script(classic.map(x=>"\n/* "+x.file+" */\n"+x.code).join("\n"),{filename:"index-load-order.js"});
  good("klassieke scripts samen in index-volgorde");
}catch(e){bad("globale naam/splitsconflict: "+e.message)}

try{new vm.Script(read("sw.js"),{filename:"sw.js"});good("sw.js")}
catch(e){bad("sw.js: "+e.message)}

const versions=[...html.matchAll(/(?:src|href)=["'][^"']+\?v=([^"'&#]+)["']/gi)].map(m=>m[1]);
const unique=[...new Set(versions)];
if(!versions.length)bad("geen ?v= versies gevonden in index.html");
else if(unique.length!==1)bad("index.html mixt versies: "+unique.join(", "));
else good("alle "+versions.length+" versiebestanden gebruiken v"+unique[0]);

if(process.exitCode)process.exit(process.exitCode);
console.log("Gepuzzellig-controle geslaagd.");
