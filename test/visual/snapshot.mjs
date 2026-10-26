#!/usr/bin/env node
// Visuele controle van Gepuzzellig: vaste screenshots van de echte app met nagebootste Firebase.
//
//   node test/visual/snapshot.mjs --update      baseline (opnieuw) vastleggen
//   node test/visual/snapshot.mjs               vergelijken met de baseline (exit 1 bij verschil)
//   opties: --only=home,groep   --device=ipad   --theme=light   --tolerance=4   --max-pixels=10   --parallel=4
//
// Er wordt geen echt Firebase-project aangeroepen: de gstatic-modules worden vervangen door
// fake-firebase.js en de data komt uit fixture.json (zie make-fixture.mjs).
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // net als experiments/layout/check.mjs
import { FIXED_TIME, AUTH_UID, DEVICES, THEMES } from "./config.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = normalize(join(HERE, "../.."));
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
// Tolerantie per kleurkanaal (0–255). Chromium tekent schaduwen en anti-aliasing soms 1–2 waarden anders;
// 4 vangt die ruis op, terwijl een echte opmaakwijziging (1 px verschuiving, andere kleur) ruim daarboven ligt.
// Tolerantie per kleurkanaal (0–255) en maximaal aantal losse afwijkende pixels per screenshot.
// Chromium tekent schaduwen en afgeronde randen soms net anders (gemeten: enkele losse pixels).
// Een echte opmaakwijziging, zoals 1 px verschuiving of een andere kleur, raakt honderden pixels.
const UPDATE = !!args.update, TOL = Number(args.tolerance ?? 4), MAXPX = Number(args["max-pixels"] ?? 10);
const pick = (all, key) => args[key] ? String(args[key]).split(",") : all;

// Schermen. Ieder scherm start in een verse browsercontext, zodat het ene scherm het andere niet beïnvloedt.
// Hulpfuncties: tik() klikt het eerste zichtbare element; misser = fout, zodat een verdwenen knop opvalt.
const tik = async (p, sel, wacht = 700) => { await p.locator(sel).locator("visible=true").first().click({ timeout: 8000 }); await p.waitForTimeout(wacht); };
const tikTekst = async (p, re, wacht = 700) => { await p.getByText(re).locator("visible=true").first().click({ timeout: 8000 }); await p.waitForTimeout(wacht); };
const start = (t, extra) => async p => { await tik(p, `[data-day-group="${t}"] .daygo`, 1200); if (extra) await extra(p); };
// Groepslid openen: via de ledenlijst (groot scherm) of via "Kies groepslid" (iPhone).
const groepslid = async (p, id, naam) => {
  await tik(p, '[data-open-home-group="g_testzes"]', 1200);
  const lijst = p.locator(`[data-group-person^="${id}"]`).locator("visible=true");
  if (await lijst.count()) return tik(p, `[data-group-person^="${id}"]`, 1200);
  await tikTekst(p, /^Kies groepslid$/, 900);
  await p.getByRole("button", { name: new RegExp("^" + naam) }).locator("visible=true").first().click(); await p.waitForTimeout(1200);
};
const DAY = ["bin", "star", "nono", "hex", "plus", "mur"];
const SCREENS = {
  // Home en hoofdnavigatie
  home: { pages: 3 },
  "home-info": { pages: 1, go: p => tik(p, '[data-day-t="bin"]') },
  puzzelen: { pages: 3, go: p => tik(p, '[data-home-nav="puzzles"]') },
  groepen: { pages: 2, go: p => tik(p, '[data-home-nav="groups"]') },
  profiel: { pages: 3, go: p => tik(p, "#hProfile", 1200) },
  "profiel-groepbeheer": { pages: 3, go: async p => { await tik(p, "#hProfile", 1200); await tik(p, "#profgroupmanage", 1200); } },
  // Groepen en statistieken
  groep: { pages: 4, go: p => tik(p, '[data-open-home-group="g_testzes"]') },
  "groep-week": { pages: 2, go: async p => { await tik(p, '[data-open-home-group="g_testzes"]'); await tik(p, '[data-p="week"]'); } },
  "groep-persoon": { pages: 3, go: p => groepslid(p, "test-sam", "Sam") },
  "groep-zelf": { pages: 3, go: p => groepslid(p, "p_", "Peter") },
  duo: { pages: 2, go: p => tik(p, '[data-open-home-group="g_testduo"]') },
  // Vrij puzzelen: niveaukeuze
  "vrij-niveau": { pages: 1, go: p => tik(p, '[data-free-t="star"]', 1000) },
  "vrij-nono-klassiek": { pages: 1, go: async p => { await tik(p, '[data-free-t="nono"][data-free-nv="classic"]', 1000); await tikTekst(p, /^Normaal/, 1500); } },
  // Dagpuzzels
  ...Object.fromEntries(DAY.map(t => [`dag-${t}`, { pages: 1, go: start(t) }])),
  // Hints: alle drie de stappen voor iedere soort
  ...Object.fromEntries(DAY.filter(t => t !== "plus").flatMap(t => [1, 2, 3].map(n => [`hint-${t}-${n}`, { pages: 1, devices: ["ipad", "iphone"], go: start(t, async p => {
    await tik(p, "#hintb", 900);
    for (let i = 1; i < n; i++) await tik(p, "#hint .hintnext", 900);
  }) }]))),
  // Verder puzzelen: een begonnen puzzel staat open
  "home-verder": { pages: 3, go: async p => { await tik(p, '[data-day-group="bin"] .daygo', 1200); for (const c of (await p.locator("#playbox div.c:not(.g)").all()).slice(0, 4)) await c.click(); await p.waitForTimeout(900); await tikTekst(p, /^Home$/, 1500); } },
  "vrij-kalender": { pages: 2, go: async p => { await tik(p, '[data-free-t="star"]', 1000); await tikTekst(p, /Vorige dagelijkse puzzels/, 1200); } },
  // Opgeloste puzzel (zie aanvulling in make-fixture.mjs)
  "plus-opgelost": { pages: 1, go: start("plus") },
  // Opgelost-kaart: een makkelijke vrije Pluszle laten oplossen via "Volledige hint" (±16 zetten, ±50 s)
  "opgelost-kaart": { pages: 1, devices: ["ipad", "iphone"], go: async p => {
    await tik(p, '[data-free-t="plus"]', 900); await tikTekst(p, /^Makkelijk/, 1500);
    for (let n = 0; n < 60 && !(await p.locator("#fin").locator("visible=true").count()); n++) {
      await p.locator("#hintb").locator("visible=true").first().click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250);
      for (let i = 0; i < 2; i++) { const nx = p.locator("#hint .hintnext").locator("visible=true"); if (await nx.count()) { await nx.first().click(); await p.waitForTimeout(200); } }
      const zet = p.locator("#hint button").filter({ hasText: /voor me/ }).locator("visible=true");
      if (!(await zet.count())) break;
      await zet.first().click(); await p.waitForTimeout(300);
    }
    if (!(await p.locator("#fin").locator("visible=true").count())) throw new Error("puzzel niet opgelost via hints");
    await p.waitForTimeout(600);
  } },
  // Notities, plaatsen en fouten
  "bin-notities": { pages: 1, devices: ["ipad", "iphone"], go: start("bin", async p => { await tik(p, "#potb"); for (const c of (await p.locator("#playbox div.c:not(.g)").all()).slice(0, 6)) await c.click(); await p.waitForTimeout(600); }) },
  "mur-geplaatst": { pages: 1, devices: ["ipad", "iphone"], go: start("mur", async p => {
    const cellen = await p.locator("#playbox .mc:not(.blk)").all();
    for (let i = 0; i < 3; i++) { await p.locator(`.pb[data-s="${i}"]`).locator("visible=true").first().click(); await p.waitForTimeout(250); await cellen[i * 7].click(); await p.waitForTimeout(300); }
    await tik(p, "#chk", 1000);
  }) },
  "hint-details": { pages: 1, devices: ["ipad", "iphone"], go: start("star", async p => { await tik(p, "#hintb", 900); await tik(p, "#hint .hintnext", 900); await tik(p, "#hint .hintnext", 900); const d = p.locator("#hint summary, #hint .hintdetails summary").locator("visible=true"); if (await d.count()) { await d.first().click(); await p.waitForTimeout(500); } }) },
  // Bediening en menu's in een puzzel
  "bin-potlood": { pages: 1, devices: ["ipad", "iphone"], go: start("bin", p => tik(p, "#potb")) },
  "bin-controleer": { pages: 1, devices: ["ipad", "iphone"], go: start("bin", async p => { for (const c of await p.locator("#playbox div.c:not(.g)").all().then(a => a.slice(0, 6))) await c.click(); await tik(p, "#chk", 1000); }) },
  "bin-menu": { pages: 1, devices: ["ipad", "iphone"], go: start("bin", p => tikTekst(p, /^⋯$/, 900)) },
  "bin-uitleg": { pages: 1, devices: ["ipad", "iphone"], go: start("bin", async p => { await tikTekst(p, /^⋯$/, 700); await tik(p, "#helpb", 900); }) },
  "bin-bediening": { pages: 1, devices: ["ipad", "iphone"], go: start("bin", async p => { await tikTekst(p, /^⋯$/, 700); await tik(p, "#ctrlb", 900); }) },
};

// Kleine statische server op de repository.
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path === "/") path = "/index.html";
  if (path === "/js/config.js") path = "/js/config.test.js"; // testgroepen; Firebase is toch nagebootst
  const file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const fake = readFileSync(join(HERE, "fake-firebase.js"), "utf8");
const fixturePath = join(HERE, "fixture.json");
if (!existsSync(fixturePath)) { console.error("fixture.json ontbreekt: draai eerst node test/visual/make-fixture.mjs"); process.exit(2); }
const seed = readFileSync(fixturePath, "utf8");
const STILL = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}`;
const init = `
  window.__SEED=${seed};
  window.__USER={uid:${JSON.stringify(AUTH_UID)},isAnonymous:false,email:"peter@voorbeeld.nl",displayName:"Peter",providerData:[{providerId:"google.com",email:"peter@voorbeeld.nl"}],getIdToken:async()=>"x",reload:async()=>{}};
  (()=>{let s=20261026;Math.random=()=>((s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0)>>>0)/4294967296})();
  document.addEventListener("DOMContentLoaded",()=>{const st=document.createElement("style");st.textContent=${JSON.stringify(STILL)};document.head.append(st)});`;

const dirs = { out: join(HERE, "out"), base: join(HERE, "baseline"), diff: join(HERE, "diff") };
rmSync(dirs.out, { recursive: true, force: true }); rmSync(dirs.diff, { recursive: true, force: true });
for (const d of Object.values(dirs)) mkdirSync(d, { recursive: true });

const browser = await chromium.launch();
const errors = [], made = [], covered = new Set(), allSelectors = new Set();

async function capture(device, theme, name, screen) {
  const dev = DEVICES[device];
  const ctx = await browser.newContext({ ...dev, hasTouch: true, deviceScaleFactor: 1, locale: "nl-NL", timezoneId: "Europe/Amsterdam", serviceWorkers: "block", colorScheme: theme });
  await ctx.route(/gstatic\.com\/firebasejs\//, r => r.fulfill({ contentType: "text/javascript", body: fake }));
  await ctx.route(url => !url.href.startsWith(BASE) && !/gstatic\.com\/firebasejs\//.test(url.href), r => r.abort()); // nooit het internet op
  await ctx.addInitScript(init);
  const p = await ctx.newPage();
  await p.clock.setFixedTime(new Date(FIXED_TIME));
  p.on("pageerror", e => errors.push(`${device}/${theme}/${name}: ${e.message}`));
  await p.goto(BASE + "/index.html"); await p.waitForTimeout(1800);
  await p.locator(`[data-theme-mode="${theme}"]`).locator("visible=true").first().click().catch(() => {});
  await p.waitForTimeout(300);
  if (screen.go) { await screen.go(p); await p.waitForTimeout(1500); }
  // De app scrolt in een eigen container: neem die per schermhoogte op.
  const sc = await p.evaluateHandle(() => [document.scrollingElement, ...document.querySelectorAll("*")]
    .filter(e => e && e.scrollHeight > e.clientHeight + 20 && !["hidden", "visible"].includes(getComputedStyle(e).overflowY) && e.clientHeight > 300)
    .sort((a, b) => b.clientHeight - a.clientHeight)[0] || document.scrollingElement);
  const [H, V] = await sc.evaluate(e => [e.scrollHeight, e.clientHeight]);
  for (let i = 0, y = 0; i < screen.pages && (i === 0 || y < H); i++, y += V - 60) {
    await sc.evaluate((e, y) => e.scrollTo(0, y), y); await p.waitForTimeout(200);
    const file = `${device}-${theme}-${name}-${i + 1}.png`;
    await p.screenshot({ path: join(dirs.out, file) }); made.push(file);
    // Dekking: welke CSS-regels raken op dit scherm minstens één element?
    const cov = await p.evaluate(() => {
      const all = [], hit = [];
      const walk = rules => { for (const r of rules) { if (r.cssRules && !r.selectorText) walk(r.cssRules); else if (r.selectorText) {
        const href = (r.parentStyleSheet && r.parentStyleSheet.href || "").split("/").pop().split("?")[0];
        if (!href.endsWith(".css")) continue; const key = href + " | " + r.selectorText; all.push(key);
        try { if (r.selectorText.split(",").some(sel => document.querySelector(sel.replace(/::?(before|after|placeholder|selection|-webkit-[\w-]+)/g, "")))) hit.push(key); } catch {} } } };
      for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch {} }
      return { all, hit };
    });
    cov.all.forEach(k => allSelectors.add(k)); cov.hit.forEach(k => covered.add(k));
  }
  await ctx.close();
}

// Taken maken en met een paar tegelijk uitvoeren (iedere taak heeft een eigen browsercontext).
const jobs = [];
for (const device of pick(Object.keys(DEVICES), "device"))
  for (const theme of pick(THEMES, "theme"))
    for (const name of pick(Object.keys(SCREENS), "only")) {
      if (!SCREENS[name]) { console.error("Onbekend scherm:", name); continue; }
      if (SCREENS[name].devices && !SCREENS[name].devices.includes(device)) continue;
      jobs.push([device, theme, name]);
    }
const PARALLEL = Number(args.parallel ?? 4);
let next = 0;
await Promise.all(Array.from({ length: PARALLEL }, async () => {
  while (next < jobs.length) {
    const [device, theme, name] = jobs[next++];
    try { await capture(device, theme, name, SCREENS[name]); process.stdout.write("."); }
    catch (e) { errors.push(`${device}/${theme}/${name}: kon scherm niet openen (${e.message.split("\n")[0]})`); process.stdout.write("x"); }
  }
}));
made.sort(); errors.sort();
console.log("");

// Vergelijken in de browser zelf (geen extra npm-pakketten nodig).
const cmp = await (await browser.newContext()).newPage();
const results = [];
for (const file of made) {
  const outB64 = readFileSync(join(dirs.out, file)).toString("base64");
  const basePath = join(dirs.base, file);
  if (UPDATE) { writeFileSync(basePath, Buffer.from(outB64, "base64")); continue; }
  if (!existsSync(basePath)) { results.push({ file, status: "nieuw" }); continue; }
  const baseB64 = readFileSync(basePath).toString("base64");
  const r = await cmp.evaluate(async ([a, b, tol]) => {
    const load = s => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = "data:image/png;base64," + s; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { pixels: -1 };
    const c = document.createElement("canvas"); c.width = ia.width; c.height = ia.height;
    const x = c.getContext("2d"); x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, c.width, c.height);
    x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, c.width, c.height);
    const out = x.createImageData(c.width, c.height); let n = 0;
    for (let i = 0; i < da.data.length; i += 4) {
      const d = Math.max(Math.abs(da.data[i] - db.data[i]), Math.abs(da.data[i + 1] - db.data[i + 1]), Math.abs(da.data[i + 2] - db.data[i + 2]));
      const g = (db.data[i] + db.data[i + 1] + db.data[i + 2]) / 3;
      if (d > tol) { n++; out.data.set([230, 30, 60, 255], i); } else out.data.set([g, g, g, 60], i);
    }
    x.putImageData(out, 0, 0);
    return { pixels: n, png: n ? c.toDataURL("image/png").split(",")[1] : null };
  }, [outB64, baseB64, TOL]);
  if (r.png) writeFileSync(join(dirs.diff, file), Buffer.from(r.png, "base64"));
  results.push({ file, status: r.pixels >= 0 && r.pixels <= MAXPX ? "gelijk" : r.pixels < 0 ? "andere afmeting" : `${r.pixels} px anders` });
}
await browser.close(); server.close();

// Dekkingsrapport: regels die op geen enkel vastgelegd scherm iets raken, worden door deze controle NIET bewaakt.
const uncovered = [...allSelectors].filter(k => !covered.has(k)).sort();
writeFileSync(join(HERE, "dekking.json"), JSON.stringify({ regels: allSelectors.size, geraakt: covered.size, nietGeraakt: uncovered }, null, 1));
console.log(`Dekking: ${covered.size}/${allSelectors.size} CSS-regels raken een element op de vastgelegde schermen (details: test/visual/dekking.json).`);

if (UPDATE) console.log(`Baseline vastgelegd: ${made.length} screenshots in test/visual/baseline/`);
else {
  const bad = results.filter(r => r.status !== "gelijk");
  for (const r of bad) console.log(`  ${r.status.padEnd(18)} ${r.file}`);
  console.log(`${results.length - bad.length}/${results.length} gelijk aan de baseline.${bad.length ? " Verschillen staan in test/visual/diff/." : ""}`);
  writeFileSync(join(HERE, "rapport.json"), JSON.stringify({ at: new Date().toISOString(), results }, null, 1));
  if (bad.length) process.exitCode = 1;
}
if (errors.length) { console.log("Fouten in de app tijdens de controle:"); for (const e of errors) console.log("  " + e); process.exitCode = 1; }

// In GitHub Actions ook als meldingen (annotations), zodat de uitkomst zonder log zichtbaar is.
if (process.env.GITHUB_ACTIONS) {
  const esc = t => String(t).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  const bad = results.filter(r => r.status !== "gelijk");
  const kop = UPDATE ? `Baseline vastgelegd: ${made.length} screenshots` : `${results.length - bad.length}/${results.length} gelijk aan de baseline`;
  console.log(`::notice title=Visuele controle::${esc(`${kop}. Dekking ${covered.size}/${allSelectors.size} CSS-regels. Fouten: ${errors.length}.`)}`);
  if (bad.length) console.log(`::error title=Visuele verschillen::${esc(bad.slice(0, 40).map(r => `${r.status} ${r.file}`).join("\n"))}`);
  if (errors.length) console.log(`::error title=Schermen niet geopend::${esc(errors.slice(0, 40).join("\n"))}`);
}
