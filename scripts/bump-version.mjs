#!/usr/bin/env node
// Verhoogt het versienummer van de app in één keer: ?v=N in index.html en de cachenaam in sw.js.
// Gebruik: node scripts/bump-version.mjs            (volgende nummer)
//          node scripts/bump-version.mjs 300        (vast nummer)
// Normaal alleen bij een release (zie docs/AI-WERKWIJZE.md); gewone PR's hoeven het nummer niet te verhogen.
import fs from "node:fs";

const root = new URL("../", import.meta.url).pathname;
// Alleen index.html: admin.html en de proefpagina hebben een eigen, losse versie.
const pages = ["index.html"];
if (!/\?v=\d+/.test(fs.readFileSync(root + "index.html", "utf8"))) throw new Error("index.html met ?v= niet gevonden");

const current = +fs.readFileSync(root + "index.html", "utf8").match(/\?v=(\d+)/)[1];
const next = process.argv[2] ? +process.argv[2] : current + 1;
if (!Number.isInteger(next) || next <= current) throw new Error("Nieuw nummer (" + next + ") moet hoger zijn dan " + current);

for (const f of pages) {
  const s = fs.readFileSync(root + f, "utf8");
  fs.writeFileSync(root + f, s.replace(/\?v=\d+/g, "?v=" + next));
}
const sw = fs.readFileSync(root + "sw.js", "utf8");
const re = /(const C=PREFIX\+")v\d+(")/;
if (!re.test(sw)) throw new Error("Cachenaam in sw.js niet gevonden");
fs.writeFileSync(root + "sw.js", sw.replace(re, "$1v" + next + "$2"));
console.log("Versie v" + current + " -> v" + next + " in " + pages.join(", ") + " en sw.js. Draai daarna: node .github/scripts/check-app.mjs");
