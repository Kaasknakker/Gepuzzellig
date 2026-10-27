# Visuele controle

Vangnet voor het opruimen van de vormgeving (zie `docs/OPRUIMPLAN-VORMGEVING.md`).
Maakt vaste screenshots van de echte app en vergelijkt ze met een vastgelegde baseline.

```sh
node test/visual/make-fixture.mjs          # testdata uit scripts/seed-test-groups.mjs (geen Firebase-verbinding)
node test/visual/snapshot.mjs --update     # baseline vastleggen
node test/visual/snapshot.mjs              # vergelijken; exit 1 bij verschil
```

Opties: `--device=ipad,ipadstaand,iphone,iphoneklein`, `--theme=light,dark`, `--only=home,groep,dag-bin,…`, `--tolerance=4`, `--max-pixels=10`.
Schermnamen staan bovenaan `snapshot.mjs` (`SCREENS`).

- Playwright moet vindbaar zijn (bijv. `NODE_PATH=…/node_modules`), net als bij `experiments/layout/check.mjs`.
- Firebase wordt volledig nagebootst door `fake-firebase.js`; ieder ander netwerkverzoek wordt geblokkeerd.
- Klok, `Math.random`, tijdzone en taal liggen vast in `config.mjs` en `snapshot.mjs`. Animaties staan uit.
- Tolerantie 4 per kleurkanaal en maximaal 10 losse afwijkende pixels vangen Chromium-renderruis op; een echte opmaakwijziging raakt honderden pixels.
- Maak en vergelijk de baseline in dezelfde omgeving; lettertypen verschillen per machine.
  Gebruik daarvoor de workflow **Visuele controle** in GitHub Actions.
- Dit is Chromium, geen Safari: een echte iPad/iPhone-controle blijft nodig per afgeronde fase.
- Niet meerdere runs tegelijk starten; ze delen `out/` en `diff/`. Binnen één run lopen standaard 4 schermen tegelijk (`--parallel=4`).
- `dekking.json` laat zien welke CSS-regels op geen enkel vastgelegd scherm iets raken; die worden niet bewaakt.
- `make-fixture.mjs` past de seed-data op drie gedocumenteerde punten aan (typeformaat, opgeloste Pluszle, speelbare Binair).
- Een volledige run (406 screenshots) duurt lokaal ±6 minuten met 2 processorkernen.

## In GitHub Actions

- De workflow **Visuele controle** draait bij pull requests en pushes naar `develop` die de app of deze map raken.
- Ontbreken er bestanden in `baseline/` (eerste keer, nieuw scherm of bewust verwijderd), dan legt de workflow die vast en commit ze in de branch (nooit op `main`). Echte verschillen worden nooit automatisch overgenomen: die maken de run rood.
- Bewust bijwerken na een goedgekeurde wijziging: verwijder precies de betrokken bestanden in `baseline/` (bijvoorbeeld `git rm test/visual/baseline/*opgelost-kaart*`) in dezelfde commit als de wijziging.
- De uitkomst staat als melding bij de run (aantal gelijk, dekking, verschillen); de screenshots en verschilbeelden staan in het artifact `visuele-controle`.
- Duur: ±20 minuten, waarvan ±12 voor het installeren van Playwright.
