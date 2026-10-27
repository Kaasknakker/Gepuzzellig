#!/usr/bin/env node
// Maakt test/visual/fixture.json uit scripts/seed-test-groups.mjs, met een vaste klok.
// Er wordt geen Firebase-project aangeroepen: firebase-admin wordt vervangen door admin-shim/.
import { register } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { FIXED_TIME, AUTH_UID } from "./config.mjs";

register("./admin-shim/hooks.mjs", import.meta.url);
const fixed = Date.parse(FIXED_TIME), RealDate = Date;
globalThis.Date = class extends RealDate {
  constructor(...a) { super(...(a.length ? a : [fixed])); }
  static now() { return fixed; }
};
const { store } = await import("./admin-shim/firestore.mjs");
store["profiles/" + AUTH_UID] = { authUid: AUTH_UID, playerId: "p_" + AUTH_UID, displayName: "Peter", groupId: "g_testzes", role: "admin", createdAt: fixed - 30 * 864e5, theme: "", accent: "" };
process.env.GOOGLE_CLOUD_PROJECT = "gepuzzellig-test"; // vereist door het seed-script; er wordt niets verstuurd
await import(pathToFileURL(fileURLToPath(new URL("../../scripts/seed-test-groups.mjs", import.meta.url))).href);
// Correctie: scripts/seed-test-groups.mjs schrijft dagresultaten als "bin.normal", maar de app schrijft
// "bin" (Normaal), "bin.1" (Makkelijk) en "bin.3" (Moeilijk); zie sfx/dailyLevels. Zet ze hier om, zodat
// Home en het groepsoverzicht de testresultaten net zo tellen als echte resultaten.
const LVL = { easy: 1, normal: 2, hard: 3 };
let omgezet = 0;
for (const [k, v] of Object.entries(store)) {
  if (!k.startsWith("groupActivity/") || v.mode !== "daily" || !/\.(easy|normal|hard)$/.test(v.resultType || "")) continue;
  const lvl = LVL[v.difficulty] || 2, type = v.puzzleType + (lvl === 2 ? "" : "." + lvl);
  v.resultType = type; v.puzzleKey = v.puzzleDate + ":" + type; omgezet++;
}
console.log("dagresultaten omgezet naar app-formaat:", omgezet);

// Aanvulling voor de visuele controle: Peter heeft de Pluszle van vandaag opgelost.
// Zo zijn de opgelost-kaart en de "klaar"-status op Home ook te zien. Het seed-script zelf blijft ongewijzigd.
const pid = "p_" + AUTH_UID;
const peterPlus = Object.entries(store).find(([k, v]) => k.startsWith("groupActivity/g_testzes/items/") && v.playerId === pid && v.puzzleType === "bin" && v.mode === "daily");
if (!peterPlus) throw new Error("Verwacht Binair-resultaat van Peter niet gevonden in de seed");
// Typecode zoals de app die schrijft (zie sfx in core.js): groot scherm Normaal = niveau 2 = geen achtervoegsel → "plus".
// Alleen de groot-schermvariant: op de iPhone toont Home dan "andere variant opgelost".
for (const lvl of [2]) {
  const v = peterPlus[1], type = "plus" + (lvl === 2 ? "" : "." + lvl), key = v.puzzleDate + ":" + type;
  const doc = { ...v, puzzleType: "plus", resultType: type, difficulty: "normal", deviceVariant: "", puzzleKey: key, secs: 143, mist: 0, hints: 0, groupId: "g_testzes" };
  const id = encodeURIComponent(pid + "|" + key).replace(/\./g, "%2E");
  store["playerResults/" + pid + "/items/" + id] = doc;
  store["groupActivity/g_testzes/items/" + id] = doc;
}
// Binair van vandaag moet speelbaar blijven (hints, potlood en controleren worden daarop getest):
// verwijder Peters Binair-resultaat van vandaag uit de groepsactiviteit.
for (const [k, v] of Object.entries(store))
  if (k.startsWith("groupActivity/") && v.playerId === pid && v.mode === "daily" && v.puzzleType === "bin" && v.puzzleDate === peterPlus[1].puzzleDate) delete store[k];

const out = fileURLToPath(new URL("./fixture.json", import.meta.url));
const sorted = Object.fromEntries(Object.keys(store).sort().map(k => [k, store[k]]));
writeFileSync(out, JSON.stringify(sorted, null, 1) + "\n");
console.log("fixture.json:", Object.keys(store).length, "documenten");
