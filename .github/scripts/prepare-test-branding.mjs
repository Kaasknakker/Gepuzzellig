import fs from "node:fs";

const file=process.argv[2];
if(!file) throw new Error("Gebruik: node .github/scripts/prepare-test-branding.mjs <index.html>");

const TEST_SVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#f6d86b"/><rect x="17" y="17" width="31" height="31" rx="8" fill="#7a52d6"/><rect x="52" y="17" width="31" height="31" rx="8" fill="#f2a000"/><rect x="17" y="52" width="31" height="31" rx="8" fill="#12a6ae"/><rect x="52" y="52" width="31" height="31" rx="8" fill="#ee3e6d"/><path fill="white" d="m32.5 23.5 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.6 3 1.1-6.2-4.6-4.4 6.3-.9z"/><path stroke="white" stroke-width="5.5" stroke-linecap="round" d="m24 59 17 17m0-17L24 76"/><circle cx="67.5" cy="67.5" r="6.8" fill="white"/><circle cx="80" cy="80" r="15" fill="#27220f" stroke="#f6d86b" stroke-width="3"/><path d="M72 73.5a6.3 6.3 0 0 0 7.6 7.7l6.1 6.1a2.2 2.2 0 0 0 3.1-3.1l-6.1-6.1a6.3 6.3 0 0 0-7.7-7.6l3.8 3.8-2.6 2.6-4.2-3.4z" fill="white"/></svg>';
const svgData=svg=>"data:image/svg+xml,"+encodeURIComponent(svg);

let html=fs.readFileSync(file,"utf8");
if(/Gepuzzellig(?: |%20)Test/.test(html))throw new Error("Bron voor testbranding bevat al testnaam");
if(/%2327220f|#27220f/.test(html))throw new Error("Bron voor testbranding bevat al het testicoon");

const replaceHref=(rel,href)=>{
  const re=new RegExp('(<link rel="'+rel+'"[^>]*href=")[^"]+("[^>]*>)');
  if(!re.test(html))throw new Error("Ontbrekende link rel="+rel);
  html=html.replace(re,"$1"+href+"$2");
};
replaceHref("apple-touch-icon",svgData(TEST_SVG));
replaceHref("icon",svgData(TEST_SVG));

const manifestRe=/(<link rel="manifest" href="data:application\/manifest\+json,)([^"]+)(">)/;
const mm=html.match(manifestRe);
if(!mm)throw new Error("Manifest-data-URI ontbreekt");
const manifest=JSON.parse(decodeURIComponent(mm[2]));
manifest.name="Gepuzzellig Test";
manifest.short_name="Gepuzzellig Test";
manifest.background_color="#f6d86b";
manifest.theme_color="#f6d86b";
if(!Array.isArray(manifest.icons)||!manifest.icons.length)throw new Error("Manifest heeft geen icoon");
manifest.icons[0].src=svgData(TEST_SVG);
html=html.replace(manifestRe,"$1"+encodeURIComponent(JSON.stringify(manifest))+"$3");

const titleRe=/(apple-mobile-web-app-title" content=")Gepuzzellig(")/;
if(!titleRe.test(html))throw new Error("Productienaam voor iOS ontbreekt");
html=html.replace(titleRe,"$1Gepuzzellig Test$2");

fs.writeFileSync(file,html);
console.log("OK: testnaam en testicoon alleen in "+file);
