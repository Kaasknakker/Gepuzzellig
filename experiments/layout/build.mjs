// Bouw een zelfstandige proef naast de gewone app; productiebronnen blijven intact.
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const source=read('index.html');
const safeScript=s=>s.replace(/<\/script/gi,'<\\/script');
let html=source.replace(' data-auth-pending','').replace('<title>Gepuzzellig</title>','<title>Gepuzzellig · layoutproef</title>');
html=html.replace(/<link[^>]+rel="manifest"[^>]*>/,'');
html=html.replace('<head>','<head>');
const bootstrap=`window.LAYOUT_STORAGE=(()=>{const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)}})();window.LAYOUT_ORIGINAL=false;window.LAYOUT_BOTTOM=false;window.PD_SETUP={players:['Testspeler'],group:'layoutproef',groupName:'Proefgroep'};`;
html=html.replace(/(<head[^>]*>)/,'$1<script>'+bootstrap+'</script>');
html=html.replace(/<link rel="stylesheet" href="([^"?]+)[^"]*">/g,(_,p)=>'<style>'+read(p)+'</style>');
html=html.replace(/<script([^>]*)src="([^"?]+)[^"]*"[^>]*><\/script>/g,(_,attrs,p)=>{
 if(p==='js/firebase.js'||p==='js/config.js')return '';
 let code=read(p).replace(/\blocalStorage\b/g,'window.LAYOUT_STORAGE');
 if(p==='js/core.js'){
  code=code.replace('if("serviceWorker"in navigator&&','if(false&&"serviceWorker"in navigator&&');
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
