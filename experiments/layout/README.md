# Layoutproef en definitieve indeling

De goedgekeurde indeling staat in de gewone app. `js/layout.js` en `css/layout.css` bevatten de gedeelde presentatie: gecentreerde borden, bediening dichtbij, begrensde celmaten en hints met een vaste tekstplek en vrijgehouden kijkgebieden. De gewone app gebruikt eigen accountopslag en toont geen proefbalk.

`proef-layout.html` blijft beschikbaar voor toekomstige experimenten. De pagina wordt opgebouwd uit de actuele app en bevat dezelfde puzzels, bediening en hints. `preview.js` en `preview.css` voegen alleen de proefbalk, formaatkeuze en vergelijking met de vorige indeling toe. Alle proefopslag zit in het geheugen; herladen wist de voortgang. Firebase wordt niet geladen en de proef registreert geen service worker.

Via **Vorige** bekijk je dezelfde puzzel met de eerdere indeling; **Nieuwe** keert terug naar de goedgekeurde presentatie. De proefbalk neemt in beide standen dezelfde ruimte in.

## Bouwen en controleren

Vanuit de repositoryroot:

```sh
node experiments/layout/build.mjs
node experiments/layout/build.mjs --check
node experiments/layout/check.mjs
node experiments/layout/check.mjs --app
```

De browsercontrole vereist Playwright. Met `PLAYWRIGHT_CHROMIUM_EXECUTABLE` kan een bestaande Chromium worden gekozen. Een optionele URL vervangt de lokale pagina. De appcontrole blokkeert de Firebase-module en gebruikt een lege, tijdelijke browsersessie; echte accountgegevens worden niet gewijzigd.

Beide pagina's zijn gecontroleerd op 320×667 en 390×844 (telefoon), 820×1180 en 1180×820 (tablet), 3840×2160 (desktop): per pagina 30 borden en 90 hintstappen. Controlepunten zijn passen binnen het scherm, centrering, bediening zonder overlap, vaste bord- en hintgeometrie, volledige hintgebieden, Murdoku inclusief personen en legenda, en rustig wisselen van stand.

Home houdt minimaal 32 px onderruimte, inclusief de veilige schermrand. Als die marge niet past, wordt de pagina niet vastgezet. Scrollen en onderruimte zijn met en zonder openstaande puzzels op vijf schermformaten gecontroleerd. Knijpgebaren op Home worden afgevangen; gewoon scrollen blijft mogelijk.

Fysieke Safari-, Pencil- en iOS-schermrandcontrole blijft gebruikersacceptatie op de apparaten zelf. Chromium met gesimuleerde formaten is geen fysieke apparaattest.
