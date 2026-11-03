// Geeft een testdeploy een eigen versienummer: ?v=256 wordt ?v=256-b1234 (en de cachenaam in sw.js idem).
// Zo haalt de testsite bij elke deploy verse bestanden, ook als een PR het bronnummer niet ophoogt.
// Alleen op de geïsoleerde testbuild; het bronnummer en productie blijven ongemoeid.
import fs from "node:fs";
import path from "node:path";

const [dir, build] = process.argv.slice(2);
if (!dir || !/^\d+$/.test(build || "")) throw new Error("Gebruik: node .github/scripts/stamp-test-version.mjs <map> <bouwnummer>");

// Alleen index.html: admin.html en de proefpagina hebben een eigen, losse versie.
const htmlFiles = ["index.html"];
let base = "", count = 0;
for (const f of htmlFiles) {
  const file = path.join(dir, f);
  let html = fs.readFileSync(file, "utf8");
  const found = [...html.matchAll(/\?v=([^"'&#]+)/g)].map(m => m[1]);
  if (!found.length) continue;
  for (const v of found) {
    if (!/^\d+$/.test(v)) throw new Error(f + ": onverwacht versienummer " + v);
    if (base && v !== base) throw new Error("Versies verschillen tussen bestanden: " + base + " en " + v);
    base = v;
  }
  html = html.replace(/\?v=(\d+)(?=["'&#])/g, "?v=$1-b" + build);
  fs.writeFileSync(file, html);
  count += found.length;
}
if (!base) throw new Error("Geen ?v= gevonden in " + dir);

const swFile = path.join(dir, "sw.js");
let sw = fs.readFileSync(swFile, "utf8");
const re = /(const C=PREFIX\+")v(\d+)(")/;
const m = sw.match(re);
if (!m || m[2] !== base) throw new Error("sw.js (v" + (m && m[2]) + ") past niet bij index.html (v" + base + ")");
sw = sw.replace(re, "$1v$2-b" + build + "$3");
fs.writeFileSync(swFile, sw);
console.log("OK: testversie v" + base + "-b" + build + " (" + count + " verwijzingen + sw.js) in " + dir);
