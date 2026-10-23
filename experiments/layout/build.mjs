// Bouw een zelfstandige proef naast de gewone app; productiebronnen blijven intact.
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const source=read('index.html');
const safeScript=s=>s.replace(/<\/script/gi,'<\\/script');
let html=source.replace(' data-auth-pending','').replace('<title>Gepuzzellig</title>','<title>Gepuzzellig · layoutproef</title>');
html=html.replace(/<link[^>]+rel="manifest"[^>]*>/,'');
html=html.replace('<head>','<head>');
const bootstrap=`window.LAYOUT_STORAGE=(()=>{const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)}})();window.LAYOUT_ORIGINAL=false;window.PD_SETUP={players:['Testspeler'],group:'layoutproef',groupName:'Proefgroep'};`;
html=html.replace(/(<head[^>]*>)/,'$1<script>'+bootstrap+'</script>');
html=html.replace(/<link rel="stylesheet" href="([^"?]+)[^"]*">/g,(_,p)=>'<style>'+read(p)+'</style>');
html=html.replace(/<script([^>]*)src="([^"?]+)[^"]*"[^>]*><\/script>/g,(_,attrs,p)=>{
 if(p==='js/firebase.js'||p==='js/config.js')return '';
 let code=read(p).replace(/\blocalStorage\b/g,'window.LAYOUT_STORAGE');
 if(p==='js/core.js'){
  code=code.replace('if("serviceWorker"in navigator&&','if(false&&"serviceWorker"in navigator&&');
  // Houd de bruikbare celgrootte begrensd, ook op een 4K-scherm.
  code=code.replace('Math.min(96,Math.floor((availBot()', 'Math.min(window.LAYOUT_ORIGINAL?96:S.type==="plus"?56:S.type==="nono"?40:S.type==="bin"?48:64,Math.floor((availBot()');
  code=code.replace('CS=Math.max(24,','CS=Math.max(window.LAYOUT_ORIGINAL?24:PHONE?18:24,');
  code=code.replace('(availBot()-top-(S.hint?10:0))','(availBot()-top-(window.LAYOUT_ORIGINAL?(S.hint?10:0):22))');
  code=code.replace('Math.max(.4,Math.min','Math.max(window.LAYOUT_ORIGINAL?.4:.1,Math.min');
  code=code.replace('Math.min(2.45,fit)','Math.min(window.LAYOUT_ORIGINAL?2.45:1.15,fit)');
  code=code.replace('availH*.55/N','availH*.46/N');
  code=code.replace('Math.min(100,wide?', 'Math.min(window.LAYOUT_ORIGINAL?100:76,wide?');
  const from='ol.onpointerdown=e=>{const li=e.target.closest&&e.target.closest("[data-c]");if(!li)return;e.preventDefault();';
  code=code.replace(from,'ol.onclick=e=>{const li=e.target.closest&&e.target.closest("[data-c]");if(!li)return;');
 }
 new vm.Script(code,{filename:p});
 return '<script>'+safeScript(code)+'</script>';
});
// De eerste themakeuze gebruikt dezelfde tijdelijke testopslag.
html=html.replace('var t=localStorage.getItem','var t=window.LAYOUT_STORAGE.getItem');
html=html.replace('</head>','<style>'+read('experiments/layout/preview.css')+'</style></head>');
html=html.replace('</body>','<script>'+safeScript(read('experiments/layout/preview.js'))+'</script></body>');
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
if(/src="js\/|navigator.serviceWorker.register\("sw.js"/.test(html)&&!html.includes('if(false&&"serviceWorker"'))throw Error('Proef mag geen eigen service worker starten');
if(process.argv.includes('--check')){if(read('proef-layout.html')!==html)throw Error('Bouw de proef opnieuw met node experiments/layout/build.mjs');}
else fs.writeFileSync('proef-layout.html',html);
console.log('proef-layout.html gebouwd; tijdelijke opslag, geen Firebase of service worker.');
