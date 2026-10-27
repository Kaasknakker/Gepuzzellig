# Overdracht vóór de livegang

Opgesteld 27 oktober 2026 door Claude, voor ChatGPT (of wie de productiemigratie uitvoert).
Doel: precies weten wat er sinds `develop` 362c65f (v228) is veranderd, wat nog openstaat vóór de livegang, en wat bewust ná de livegang komt.

**Leidend blijft `docs/FASE11-LIVEGANG.md`.** Dit document voegt daar niets aan toe behalve de punten hieronder; het vervangt geen enkele stap uit het draaiboek.

---

## 1. Open pull requests

| PR | Inhoud | Wanneer samenvoegen | Raakt runtime? |
| --- | --- | --- | --- |
| **#22** | Kleine fixes vóór de livegang (v229): Klaar-icoon op maat (ook iconen in daginfo zichtbaar), hint-lampje op iPhone, “Reeks: 1 dag”, terugknop hint “← Stap 2”, groepsteksten (“Groepen waar je lid van bent”, “beheerder”), **V1** app-naam “Gepuzzellig” in de bron (testnaam alleen via `deploy-test.yml`, bewaakt door `check-app.mjs`), **V2** geen “puzzleKey” meer in beeld. | **Vóór** de livegang | Ja: `index.html`, `sw.js`, `css/app.css`, `js/core.js`, `js/hints.js`, `js/firebase.js`, `.github/workflows/deploy-test.yml`, `.github/scripts/check-app.mjs` |
| **#23** | Alleen documenten: werkregels in `AI-WERKWIJZE.md` (branches, PR's, één bouwer tegelijk), `VERBETERPLAN.md`, `BESLUITEN.md`, `OPRUIMPLAN-VORMGEVING.md`, dit document. | **Vóór** de livegang (geen runtime) | Nee (`docs/` gaat niet mee naar Hosting) |
| **#21** | Visuele controle (`test/visual/`, workflow *Visuele controle*), uitsluiting `test/` in de testdeploy. | **Pas ná** de livegang, en pas na stap G2 (screenshots naar een eigen branch) | Nee, maar ±33 MB PNG's; niet samenvoegen vóór G2 |

#22 en #23 raken geen gemeenschappelijke bestanden en kunnen in willekeurige volgorde.

## 2. Wat gecontroleerd is (en wat niet)

**Gecontroleerd door Claude:**

- *Check Gepuzzellig* op #22: groen (commit 05bb725; de laatste commit 4648634 opnieuw controleren).
- Lokaal alle `.github/scripts/check-*.mjs` die zonder Firebase-emulator draaien: geslaagd, ook na V1/V2.
- Lokaal met de visuele controle uit #21 (406 screenshots, iPad liggend/staand, iPhone, kleine iPhone, licht/donker, nagebootste Firebase met de testgroepen uit `seed-test-groups.mjs`): alleen de verwachte schermen veranderen.
- Testdeploystap voor de app-naam lokaal nagebootst: bron “Gepuzzellig”, testsite “Gepuzzellig Test”.

**Niet gecontroleerd:**

- `check-security-boundaries.mjs` en de Firestore-rules-tests (vereisen de emulator; draaien in GitHub Actions mee).
- De echte testsite na deploy, echte Google-login, Safari/PWA op echte iPad/iPhone en Mac.
- Geen enkele productieactie.

## 3. Beslispunten vóór de livegang (Peter)

### 3a. “Start solo” en anoniem inloggen in productie

- De nieuwe client toont op het inlogscherm de knop **Start solo** (`#authsolo` → `signInAnonymously`). Iedereen kan daarmee zonder uitnodiging een solo-profiel maken (“solo is de standaard”, `ARCHITECTUUR-MIGRATIEPLAN.md` §2).
- `deploy-test.yml` schakelt Anonymous Authentication **alleen in `gepuzzellig-test`** in. In `FASE11-LIVEGANG.md` staat geen stap om dit in `gepuzzelig` te doen.
- Gevolg als niets gebeurt: in productie geeft de knop “Solo starten lukt niet: auth/…”.
- **Keuze voor Peter:**
  1. Anoniem inloggen in productie inschakelen (de app wordt dan open voor solo-spelers zonder uitnodiging; groepen blijven op uitnodiging/aanvraag), en dit als expliciete stap met controle toevoegen aan het draaiboek; of
  2. de knop in productie verbergen tot later (kleine codewijziging + nieuwe versie), zodat de app zoals nu alleen op uitnodiging werkt.
- Tot Peter kiest: **niet live gaan**.

### 3b. `PD_SETUP.dailyPreferencesFrom`

- Staat in het draaiboek: vóór clientactivatie bewust de eerste volledige nieuwe puzzeldag na de cutover vastleggen in `js/config.js`; nooit de testdatum (`2026-10-25`) overnemen. Ter herinnering, geen nieuw punt.

## 4. Volgorde vanaf nu

1. Peter voegt **#22** en **#23** samen in `develop`.
2. Controleer voor de **exacte nieuwe `develop`-HEAD**: *Check Gepuzzellig* en *Deploy Gepuzzellig Test* groen; testsite toont v229 en heet “Gepuzzellig Test” als app op het beginscherm.
3. Peter test op de testsite (iPad, iPhone, Mac): de testpunten uit #22, plus de kernpaden uit `RELEASECONTROLE-2026-10-26.md`.
4. Beslispunt **3a** nemen en zo nodig verwerken (eigen PR naar `develop`, daarna stap 2 en 3 opnieuw).
5. Gebruik deze `develop`-HEAD als release-SHA en volg `FASE11-LIVEGANG.md` vanaf het begin (freeze, back-ups, snapshot, dry-run, apply, postchecks, clientactivatie, `main`, Functions, smoke-test). De oude release-SHA uit `RELEASECONTROLE-2026-10-26.md` is niet meer de releasekandidaat.
6. Na de livegang: de statustabel in `VERBETERPLAN.md` bijwerken (V1–V3 op *klaar*), en verder met stap **S0** (twee weken stabiliseren). PR #21 blijft tot stap G2/F1 openstaan.

## 5. Werkregels (sinds 27 oktober)

Zie `docs/AI-WERKWIJZE.md`, hoofdstuk *Branches, pull requests en samenwerking*. Kort: nooit rechtstreeks naar `main` of `develop` pushen (behalve stappen die Peter expliciet opdraagt, zoals de release volgens het draaiboek), één bouwer tegelijk per bestand, de repository is het gedeelde geheugen, één versienummer per PR-ronde.

## 6. Opdracht om in ChatGPT te plakken

> Gepuzzellig start. Lees `docs/AI-WERKWIJZE.md`, `docs/TESTOMGEVING.md`, `docs/OVERDRACHT-LIVEGANG.md` en `docs/FASE11-LIVEGANG.md` op de actuele `develop`. Controleer eerst of PR #22 en #23 zijn samengevoegd en of *Check Gepuzzellig* en *Deploy Gepuzzellig Test* groen zijn voor de exacte `develop`-HEAD; meld de commit en de uitkomst. Leg mij daarna beslispunt 3a (Start solo / anoniem inloggen in productie) voor met jouw advies, en wacht op mijn keuze. Voer geen enkele productieactie uit zonder dat ik daar in deze chat per stap akkoord op geef. Volg daarna het draaiboek vanaf het begin met de nieuwe release-SHA, en stop bij elk punt waar het draaiboek om akkoord of menselijke controle vraagt.
