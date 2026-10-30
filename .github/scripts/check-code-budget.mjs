// Code-ratchet voor Gepuzzellig (Operatie Bezemwagen, stap F0).
//
// Meet technische schuld en vergelijkt met .github/code-budget.json:
// - CSS (css/*.css): !important, herhaalde selectorblokken, lettergroottes, kleurcodes;
// - JavaScript (js/**/*.js): stil ingeslikte fouten (lege catch-blokken, .catch(()=>{}));
// - zichtbare teksten (index.html en tekst in js/): woorden uit .github/woordenlijst.json.
// - Hoger dan het budget  → FOUT: de wijziging voegt schuld toe. Pas bestaande regels aan in plaats van te stapelen.
// - Lager dan het budget  → FOUT met instructie: leg de verbetering vast met --update, in dezelfde PR.
//   Zo kan het budget alleen omlaag.
//
//   node .github/scripts/check-code-budget.mjs            controleren (CI)
//   node .github/scripts/check-code-budget.mjs --report   alleen de tabel tonen
//   node .github/scripts/check-code-budget.mjs --update   budget gelijkzetten aan de huidige stand (alleen als die lager of gelijk is)
import fs from "node:fs";
import path from "node:path";

const BUDGET_FILE = ".github/code-budget.json";
const WORDS_FILE = ".github/woordenlijst.json";
const args = new Set(process.argv.slice(2));

const LABELS = {
  important: "`!important`",
  repeatedSelectors: "herhaalde selectorblokken (zelfde selector opnieuw gedefinieerd)",
  fontSizes: "verschillende lettergroottes",
  fontSizesBelow12px: "lettergroottes onder 12px",
  hexColors: "verschillende kleurcodes (#…)",
  silentCatches: "stil ingeslikte fouten in JS (lege catch, .catch(()=>{}))",
  forbiddenWords: "verboden woorden in zichtbare tekst (woordenlijst)",
};

function measure() {
  const files = fs.readdirSync("css").filter(f => f.endsWith(".css")).sort().map(f => path.join("css", f));
  let important = 0, repeatedSelectors = 0, below12 = 0;
  const fontSizes = new Set(), colors = new Set();
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const css = raw.replace(/\/\*[\s\S]*?\*\//g, "");
    important += (css.match(/!important/g) || []).length;
    // Herhaalde selectorblokken per bestand: elke keer dat dezelfde selector (in dezelfde @media-context)
    // opnieuw een blok krijgt, telt als één. Een extra pleister op een al herhaalde selector telt dus ook mee.
    const seen = new Map(), stack = [];
    let start = 0;
    for (let i = 0; i < css.length; i++) {
      const ch = css[i];
      if (ch === "{") {
        const head = css.slice(start, i).trim().replace(/\s+/g, " ");
        if (head.startsWith("@")) stack.push(head);
        else {
          stack.push(null);
          if (head && !/^(from|to|\d+(\.\d+)?%)(\s*,\s*(from|to|\d+(\.\d+)?%))*$/.test(head)) {
            const key = stack.filter(Boolean).join(" | ") + " :: " + head;
            seen.set(key, (seen.get(key) || 0) + 1);
          }
        }
        start = i + 1;
      } else if (ch === "}") { stack.pop(); start = i + 1; }
      else if (ch === ";" && stack.length === 0) start = i + 1;
    }
    for (const n of seen.values()) repeatedSelectors += n - 1;
    for (const m of css.matchAll(/font-size\s*:\s*([^;}!]+)/g)) {
      const v = m[1].trim(); fontSizes.add(v);
      const px = v.match(/^(\d+(?:\.\d+)?)px$/); if (px && parseFloat(px[1]) < 12) below12++;
    }
    for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) colors.add(m[0].toLowerCase());
  }
  const js = jsFiles().map(f => fs.readFileSync(f, "utf8")).join("\n");
  const silentCatches = (js.match(/catch\s*\(\s*\w*\s*\)\s*\{\s*\}/g) || []).length
    + (js.match(/\.catch\(\s*\(\s*\w*\s*\)\s*=>\s*(\{\s*\}|null|undefined|0)\s*\)/g) || []).length;
  const words = countWords();
  return { important, repeatedSelectors, fontSizes: fontSizes.size, fontSizesBelow12px: below12, hexColors: colors.size, silentCatches, forbiddenWords: words.total, _words: words.per };
}

function jsFiles(dir = "js") {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return jsFiles(p);
    return e.name.endsWith(".js") && !/^config/.test(e.name) ? [p] : [];
  }).sort();
}

/* Zichtbare tekst: tekst tussen tags en title/aria-label/placeholder/alt in index.html, en in
   JavaScript alleen tekenreeksen die op zinnen lijken (minstens twee woorden), zonder HTML-tags en
   attributen erin. Waarden als "admin" (rol) of data-daily-open tellen daardoor niet mee. */
function visibleTexts() {
  const out = [];
  const html = fs.readFileSync("index.html", "utf8").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "");
  for (const m of html.matchAll(/>([^<]+)</g)) out.push(m[1]);
  for (const m of html.matchAll(/\b(?:title|aria-label|placeholder|alt)="([^"]+)"/g)) out.push(m[1]);
  const lit = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
  for (const f of jsFiles()) {
    const src = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const m of src.matchAll(lit)) {
      let t = m[1] ?? m[2] ?? m[3] ?? "";
      t = t.replace(/<[^>]*>/g, " ").replace(/\$\{[^}]*\}/g, " ");
      if (/[A-Za-zÀ-ÿ]{2,}\s+[A-Za-zÀ-ÿ]/.test(t)) out.push(t);
    }
  }
  return out;
}

function countWords() {
  if (!fs.existsSync(WORDS_FILE)) return { total: 0, per: {} };
  const list = JSON.parse(fs.readFileSync(WORDS_FILE, "utf8")).verboden || [];
  const texts = visibleTexts(), per = {};
  let total = 0;
  for (const { woord } of list) {
    const re = new RegExp("(^|[^A-Za-zÀ-ÿ-])(" + woord + ")(?![A-Za-zÀ-ÿ])", "gi");
    const n = texts.reduce((a, t) => a + [...t.matchAll(re)].length, 0);
    if (n) per[woord] = n;
    total += n;
  }
  return { total, per };
}

const measured = measure();
const wordDetail = measured._words; delete measured._words;
const now = measured;
const budget = fs.existsSync(BUDGET_FILE) ? JSON.parse(fs.readFileSync(BUDGET_FILE, "utf8")) : null;

const rows = Object.keys(LABELS).map(k => {
  const b = budget?.limits?.[k], n = now[k];
  const status = b === undefined ? "nieuw" : n > b ? "TE HOOG" : n < b ? "lager" : "gelijk";
  return { k, b, n, status };
});
const table = ["| Meting | Budget | Nu | Verschil |", "| --- | --- | --- | --- |",
  ...rows.map(r => `| ${LABELS[r.k]} | ${r.b ?? "–"} | ${r.n} | ${r.b === undefined ? "–" : (r.n - r.b > 0 ? "+" : "") + (r.n - r.b)} |`)].join("\n");

if (args.has("--report")) { console.log(table); process.exit(0); }

if (args.has("--update")) {
  const worse = rows.filter(r => r.b !== undefined && r.n > r.b);
  if (worse.length) {
    console.error("Budget niet bijgewerkt: deze metingen zijn hoger dan het budget. Een hoger budget mag alleen met een bewust besluit van Peter (pas het bestand dan handmatig aan en noem de reden in de PR).");
    console.error(table); process.exit(1);
  }
  const out = { note: "Code-budget (Operatie Bezemwagen F0). Mag alleen omlaag. Bijwerken: node .github/scripts/check-code-budget.mjs --update", updated: new Date().toISOString().slice(0, 10), limits: now };
  fs.writeFileSync(BUDGET_FILE, JSON.stringify(out, null, 2) + "\n");
  console.log("Budget vastgelegd:\n" + table); process.exit(0);
}

if (!budget) { console.error(`FAIL: ${BUDGET_FILE} ontbreekt. Maak het met --update.`); process.exit(1); }

const tooHigh = rows.filter(r => r.status === "TE HOOG"), lower = rows.filter(r => r.status === "lager");
console.log(table);
if (process.env.GITHUB_ACTIONS) {
  const esc = t => t.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  const level = tooHigh.length || lower.length ? "error" : "notice";
  console.log(`::${level} title=Code-budget::${esc(rows.map(r => `${LABELS[r.k]}: ${r.n} (budget ${r.b ?? "–"})`).join("\n"))}`);
}
if (tooHigh.length) {
  console.error(`\nFAIL: de code bevat meer technische schuld dan toegestaan (${tooHigh.map(r => LABELS[r.k]).join(", ")}).`);
  if (tooHigh.some(r => r.k === "forbiddenWords")) console.error("Verboden woorden per woord: " + JSON.stringify(wordDetail) + ". Gebruik de woorden uit docs/BESLUITEN.md (woordenlijst).");
  if (tooHigh.some(r => r.k === "silentCatches")) console.error("Vang een fout niet stil af: meld hem (bijvoorbeeld console.warn met context) of laat hem zichtbaar worden voor de gebruiker.");
  if (tooHigh.some(r => ["important","repeatedSelectors","fontSizes","fontSizesBelow12px","hexColors"].includes(r.k))) console.error("CSS: pas de bestaande regel van dit onderdeel aan in plaats van een nieuwe regel, uitzondering of !important toe te voegen (docs/AI-WERKWIJZE.md, docs/OPRUIMPLAN-VORMGEVING.md).");
  process.exit(1);
}
if (lower.length) {
  console.error(`\nFAIL (goed nieuws): ${lower.map(r => LABELS[r.k]).join(", ")} ${lower.length === 1 ? "is" : "zijn"} omlaag gegaan. Leg dat vast in deze PR met:\n  node .github/scripts/check-code-budget.mjs --update`);
  process.exit(1);
}
console.log("OK: code binnen budget.");
