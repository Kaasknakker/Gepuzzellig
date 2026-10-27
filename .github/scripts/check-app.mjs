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

const PROD_SVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="white"/><rect x="17" y="17" width="31" height="31" rx="8" fill="#7a52d6"/><rect x="52" y="17" width="31" height="31" rx="8" fill="#f2a000"/><rect x="17" y="52" width="31" height="31" rx="8" fill="#12a6ae"/><rect x="52" y="52" width="31" height="31" rx="8" fill="#ee3e6d"/><path fill="white" d="m32.5 23.5 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.6 3 1.1-6.2-4.6-4.4 6.3-.9z"/><path stroke="white" stroke-width="5.5" stroke-linecap="round" d="m24 59 17 17m0-17L24 76"/><circle cx="67.5" cy="67.5" r="6.8" fill="white"/></svg>';
const PROD_ICON="data:image/svg+xml,"+encodeURIComponent(PROD_SVG);
const linkHref=rel=>html.match(new RegExp('<link rel="'+rel+'"[^>]*href="([^"]+)"'))?.[1]||"";
const appleIcon=linkHref("apple-touch-icon"),favIcon=linkHref("icon");
if(appleIcon!==PROD_ICON)bad("apple-touch-icon is niet het productie-icoon");else good("apple-touch-icon is productiebranding");
if(favIcon!==PROD_ICON)bad("favicon is niet het productie-icoon");else good("favicon is productiebranding");
try{
  const raw=linkHref("manifest").replace(/^data:application\/manifest\+json,/,"");
  const manifest=JSON.parse(decodeURIComponent(raw));
  if(manifest.name!=="Gepuzzellig"||manifest.short_name!=="Gepuzzellig")bad("manifest bevat niet de productienaam");
  else if(manifest.icons?.[0]?.src!==PROD_ICON)bad("manifest bevat niet het productie-icoon");
  else good("manifest gebruikt productiebranding");
}catch(e){bad("manifest-branding kon niet worden gecontroleerd: "+e.message)}

try{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"gepuzzellig-branding-")),tmp=path.join(dir,"index.html");
  try{
    fs.writeFileSync(tmp,html);
    execFileSync(process.execPath,[".github/scripts/prepare-test-branding.mjs",tmp],{stdio:"pipe"});
    const testHtml=read(tmp);
    if(!/Gepuzzellig(?: |%20)Test/.test(testHtml)||!/%2327220f/.test(testHtml))bad("testbranding-transform levert geen testnaam + testicoon op");
    else good("testbranding-transform blijft geïsoleerd van productiebron");
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
}catch(e){bad("testbranding-transform mislukt: "+String(e.stderr||e.message))}
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
