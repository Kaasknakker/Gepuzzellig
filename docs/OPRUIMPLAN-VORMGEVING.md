# Opruimplan vormgeving Gepuzzellig

Status: plan, nog niet uitvoeren vóór de productiemigratie (Fase 11) live en stabiel is.
Doelbranch: `develop`. Productie (`main`) pas na expliciet akkoord van Peter.
Opgesteld: 26 oktober 2026, op basis van `develop` v228.

## 1. Waarom dit nodig is

De puzzels, hints en het datamodel zijn sterk. De opmaaklaag niet: die is in korte tijd opgebouwd uit honderden kleine correcties die steeds **achteraan** werden toegevoegd. Daardoor overschrijft iedere nieuwe correctie een eerdere, en raakt een kleine wijziging op de ene plek ongemerkt een andere plek. Dat is de reden dat er steeds opnieuw kleine visuele bijsturingen nodig waren.

Gemeten op `develop` v228:

| Meting | Waarde |
| --- | --- |
| `css/app.css` | 349 KB, 2431 regels, regels tot 24.000 tekens lang |
| `!important` | 317× in `app.css`, 49× in `layout.css`, 8× in `ux.css` |
| Selectors die meerdere keren worden gedefinieerd | 379 (bijv. `.daygroup summary` 12×, `.dayitem` 9×) |
| Verschillende lettergroottes | 88, waarvan 107 declaraties onder 12 px |
| Verschillende kleurcodes | 195, tegenover 45 CSS-variabelen |
| `@media`-blokken | 97 |
| CSS-regels waarvan een klasse nergens in JS/HTML voorkomt (vermoedelijk dood) | ±197 regels, ±13 KB (7%) |
| Commits op `develop` 23–26 oktober | 395 |

De opbouw van `app.css` laat het patroon zien: na de oorspronkelijke secties volgen lagen als *Verfijningslaag*, *Verfijningslaag 2*, *Laatste consistente paginapolish*, *v199*, *v202: laatste samenhangende pre-live UX-polish* en *Canonieke pre-live uitlijning*. Iedere laag corrigeert de vorige.

Het grootste deel van de omvang is dus geen dode code, maar code die door latere code wordt overschreven.

Doel van dit plan: **zelfde uiterlijk, veel minder code, en daarna één vast systeem voor maten en kleuren**, zodat een wijziging op één plek gebeurt en ook alleen daar effect heeft.

## 2. Gouden regels (ook voor iedere AI die hieraan werkt)

1. **Eerst het vangnet, dan pas opruimen.** Geen opruimwijziging zonder visuele controle (hoofdstuk 3).
2. **Opruimen verandert niets zichtbaars.** In Fase 1 en 2 moet de visuele controle *0 pixels verschil* geven. Is er verschil, dan is de wijziging fout, ook als het verschil “beter” lijkt.
3. **Eén onderdeel per wijziging.** Bijvoorbeeld alleen de dagregels, of alleen het groepsoverzicht. Nooit meerdere onderdelen in één commit.
4. **Nooit meer achteraan toevoegen.** Een correctie gaat in de bestaande regel van dat onderdeel. Nieuwe secties als “verfijning”, “polish”, “laatste”, “canoniek” of met een versienummer zijn niet toegestaan.
5. **Geen nieuwe `!important`**, behalve in de visuele testmodus zelf.
6. **Geen functionele wijzigingen** (JavaScript, Firestore, regels, migratie) in dezelfde commit als opruimwerk.
7. **Bij twijfel terugdraaien.** Een verschil dat niet binnen een kwartier verklaard is: commit terugdraaien en kleiner opnieuw proberen.
8. **Peter test op het echte apparaat per afgeronde fase**, niet per commit.

## 3. Fase 0 — Het vangnet: visuele controle

Bestanden in `test/visual/`:

| Bestand | Doel |
| --- | --- |
| `config.mjs` | Vaste klok (`FIXED_TIME`), apparaten en thema's |
| `make-fixture.mjs` | Maakt `fixture.json` uit het bestaande `scripts/seed-test-groups.mjs`, zonder Firebase aan te roepen |
| `fake-firebase.js` | Nagebootste Firebase in de browser (Firestore, Auth, Functions), alleen in het geheugen |
| `snapshot.mjs` | Opent de echte app, maakt screenshots en vergelijkt ze met de baseline |
| `admin-shim/` | Laat het seed-script lokaal draaien zonder `firebase-admin` |

Wat het doet:

- draait de **echte** `index.html`, CSS en JavaScript van de repository;
- vervangt alleen de Firebase-modules door `fake-firebase.js` en blokkeert al het overige internetverkeer;
- logt in als het testprofiel “Peter” met de groepen *Testduo* (2 leden) en *Testgroep 6* (6 leden), inclusief resultaten, dagplannen en online-status;
- past de testdata op drie punten aan (in `make-fixture.mjs`, het seed-script zelf blijft ongewijzigd): dagresultaten krijgen het typeformaat van de app (zie hieronder), Peter heeft de Pluszle van vandaag opgelost, en Peters Binair van vandaag is weggehaald zodat Binair speelbaar blijft;
- zet de klok vast op maandag 26 oktober 2026 15:00 (Amsterdam), en maakt `Math.random` voorspelbaar, zodat dagpuzzels en datums elke keer gelijk zijn;
- zet animaties en overgangen uit;
- maakt screenshots op vier formaten — iPad liggend (1180×820), iPad staand (820×1180), iPhone (390×844) en kleine iPhone (320×667) — in licht en donker: **406 screenshots** van 46 schermen. Onder meer Home (ook met Verder puzzelen en daginfo), Puzzelen, Groepen, Profiel en groepsbeheer, beide groepsoverzichten (overzicht, week, persoon, jezelf), niveaukeuze, kalender met eerdere dagpuzzels, alle zes dagpuzzels, alle hintstappen, potlood en notities, controleren met fout, Murdoku met geplaatste personen, puzzelmenu, uitleg en bediening, een opgeloste dagpuzzel en de “Klaar!”-kaart (een makkelijke Pluszle wordt daarvoor via de volledige hint opgelost). Zware schermen (hints, menu's, opgelost) alleen op iPad liggend en iPhone. Lange pagina's worden per schermhoogte vastgelegd.

Gebruik vanuit de repositoryroot:

```sh
node test/visual/make-fixture.mjs              # eenmalig, of na wijziging van het seed-script
node test/visual/snapshot.mjs --update         # baseline vastleggen (alleen bij bewuste wijziging)
node test/visual/snapshot.mjs                  # vergelijken; exit 1 bij verschil
node test/visual/snapshot.mjs --device=iphone --only=home,groep   # snel deel controleren
```

Uitkomst: `test/visual/out/` (nieuw), `test/visual/baseline/` (vastgelegd), `test/visual/diff/` (rood = verschil), `test/visual/rapport.json` en `test/visual/dekking.json`.

**Dekking.** Een screenshot bewaakt alleen wat in beeld komt. `dekking.json` somt alle CSS-regels op die op géén enkel vastgelegd scherm een element raken. Die regels worden door de controle **niet** bewaakt. Voorbeeld: alle regels voor `.uxpeople` (5 regels in `ux.css`) raken niets, omdat geen enkel script dat element nog aanmaakt.

**Tolerantie.** Per kleurkanaal 4 (op 0–255) en maximaal 10 losse afwijkende pixels per screenshot. Gemeten: zonder codewijziging tekent Chromium hooguit enkele losse pixels 1–15 waarden anders (schaduwen, afgeronde randen). Ter controle: 1 px extra `padding-top` op `.dayitem` gaf 24.000–60.000 afwijkende pixels, en alleen op de schermen met dagregels.

Belangrijk:

- **De baseline moet worden gemaakt in dezelfde omgeving als waarin wordt vergeleken.** Lettertypen verschillen per machine. Daarom maakt de GitHub-workflow `Visuele controle` (`.github/workflows/visual-check.yml`) de baseline zelf: staat er nog geen `test/visual/baseline/` in de branch, dan legt de workflow die vast en commit hem één keer in die branch (nooit op `main`). Bewust bijwerken na een goedgekeurde visuele wijziging: verwijder de betrokken bestanden uit `baseline/`, of de hele map, en laat de workflow opnieuw draaien. De uitkomst staat als melding (annotation) bij de run.
- Commit `out/`, `diff/` en `rapport.json` niet.
- Wijzig `fixture.json`, `FIXED_TIME` en `scripts/seed-test-groups.mjs` niet tijdens het opruimen; dan verandert iedere screenshot.
- Dit is Chromium, geen Safari. De controle bewijst dat de opmaak gelijk blijft, niet dat alles op een echte iPad werkt. Daarom blijft regel 8 gelden.
- Draai niet meerdere `snapshot.mjs`-processen tegelijk; ze delen de mappen `out/` en `diff/`.

**Klaar wanneer:** twee opeenvolgende runs zonder codewijziging zijn volledig gelijk, in GitHub Actions.

Getest op `develop` v228 (Chromium 1.63, lokaal): zie de stand onderaan dit hoofdstuk.

### Fase 0b — Dekking

Stand na Fase 0: **1385 van 1924 CSS-regels geraakt (72%)**. Van de 539 niet-geraakte regels zijn er 39 hover/focus-regels (niet met een screenshot vast te leggen) en 166 met een klasse die nergens in JS/HTML voorkomt (vermoedelijk dood, zie 4a). Van wat wél te fotograferen valt is de dekking **81%**.

Nog niet bewaakt, onder meer: rekenraadsel-onderdelen op Home (alleen in de groep Rekensukkels), live-activiteitsbalk, archief, Hexcells-varianten, de onderbalk-indeling (`layout-bottom`) en hintdock/hintside. Gebruik `dekking.json` per onderdeel: voor ieder onderdeel dat je in Fase 1 opruimt moeten de regels van dat onderdeel geraakt worden; voeg zo nodig eerst een scherm toe.

### Bevindingen tijdens het bouwen van het vangnet

- **Seed-script en app gebruiken een ander typeformaat.** `scripts/seed-test-groups.mjs` schrijft dagresultaten als `bin.normal`; de app schrijft `bin` (Normaal), `bin.1` (Makkelijk), `bin.3` (Moeilijk) — zie `sfx` in `core.js` en `dailyLevels` in de registry. Daardoor telde de testomgeving testresultaten anders dan echte resultaten (bijvoorbeeld “0/6 gekozen · 0%” in het groepsoverzicht). `make-fixture.mjs` corrigeert dit; het seed-script zelf moet nog worden aangepast.
- **Icoon op de “Klaar!”-kaart is veel te groot.** Het foutloos-icoon (`.stat-icon`) krijgt alleen een maat binnen `.sco` en `.personview`. Op de opgelost-kaart heeft het geen maat en vult het de halve kaart (iPad en iPhone, licht en donker). Oplossing in Fase 3: één basisregel `.stat-icon{width:1em;height:1em}`.
- **Hintstap 3:** de knop “Denk eens verder” staat in een smal vak en breekt over drie regels.

## 4. Fase 1 — Dode regels weg en dubbele regels samenvoegen (0 pixels verschil)

Doel: iedere selector komt nog maar één keer voor, en regels die niets meer doen verdwijnen. Het uiterlijk verandert niet.

### 4a. Dode regels

Een regel mag pas weg als **beide** gelden:

- hij staat in `dekking.json` bij `nietGeraakt`, en
- de klasse of id komt nergens voor in `js/`, `index.html` of de andere html-bestanden, **ook niet als opgebouwde naam** (bijvoorbeeld `"dg"+n` maakt `dg0`…`dg5`, en `"nono-"+variant` maakt `nono-color`).

Bij twijfel laten staan. Beginnen met `.uxpeople` in `ux.css` (alle regels).

### 4b. Samenvoegen

Werkwijze per onderdeel:

1. Kies één onderdeel uit de lijst hieronder. **Controleer eerst in `dekking.json` dat de regels van dat onderdeel geraakt worden.** Zo niet: eerst een scherm aan `SCREENS` in `snapshot.mjs` toevoegen waarop het onderdeel zichtbaar is (en de baseline voor alleen dat scherm vastleggen), anders bewijst 0 px verschil niets.
2. Zoek in `app.css`, `ux.css` en `layout.css` alle regels die bij dat onderdeel horen, ook binnen `@media`-blokken.
3. Bereken per selector de uiteindelijke waarde: de laatste declaratie wint, tenzij een eerdere `!important` heeft. Let op de volgorde **tussen** gewone regels en `@media`-blokken: een gewone regel ná een `@media`-blok wint ook op dat scherm. Voorbeeld: `@media(max-width:600px){.uxpeople{padding:6px 10px}}` heeft nooit effect, omdat een latere gewone `.uxpeople`-regel `padding` opnieuw zet.
4. Vervang al die regels door **één** blok, geplaatst op de positie van de **laatste** oorspronkelijke regel. Zo blijft de volgorde ten opzichte van andere onderdelen gelijk.
5. Haal overbodige declaraties weg (waarden die toch overschreven werden).
6. Draai `node test/visual/snapshot.mjs`. Vereist: alles gelijk.
7. Commitbericht: `Opruimen: <onderdeel> samengevoegd (n → m regels, 0 px verschil)`.

Volgorde (van laag naar hoog risico):

1. Opgelost-kaart, archief, Murdoku-cast
2. Profiel- en groepsbeheer (menu's)
3. Puzzelcatalogus en Vrij puzzelen
4. Dagregels (`.daygroup`, `.dayitem`, `.dayaction`) — hier zitten de meeste dubbelingen
5. Home-kop en hoofdnavigatie
6. Groepsoverzicht en persoonlijke statistieken
7. Hints (`#hint`, `layout-tray`)
8. Puzzelbord en bediening, per puzzelsoort
9. Telefoon-specifieke regels (`@media` voor smalle schermen)

**Klaar wanneer:** de vermoedelijk dode regels zijn beoordeeld, het aantal dubbele selectors is van 379 naar onder de 20, er is 0 px verschil en Peter heeft op iPad en iPhone een normale dag gespeeld zonder opvallende verschillen.

## 5. Fase 2 — Splitsen per onderdeel (0 pixels verschil)

Pas na Fase 1. Verplaats de samengevoegde blokken naar aparte bestanden, **in dezelfde volgorde** waarin ze nu in `app.css` staan:

```text
css/00-tokens.css        variabelen (in Fase 3 gevuld)
css/10-basis.css         reset, typografie, knoppen, thema's
css/20-home.css          Home-kop, navigatie, dagregels, Samen puzzelen
css/30-puzzelen.css      catalogus, Vrij puzzelen, niveaukeuze
css/40-bord.css          gedeeld puzzelbord, bediening, potlood
css/41-binair.css … 46-murdoku.css   per puzzelsoort
css/50-hints.css         hintpaneel en kijkgebieden
css/60-groep.css         groepsoverzicht, statistieken
css/70-menu.css          profiel, groepsbeheer, modals, tutorials
```

- Laad ze in `index.html` in deze volgorde; verhoog de assetversie en de servicewerker-cache zoals gebruikelijk.
- `layout.css` en `ux.css` gaan op in de bijbehorende bestanden.
- Media queries blijven bij hun onderdeel (dus geen apart “iPhone-bestand”).
- `proef-layout.html` opnieuw bouwen met `experiments/layout/build.mjs`.

**Klaar wanneer:** `app.css` bestaat niet meer, 0 px verschil, en alle bestaande controles in `check-app.yml` slagen.

## 6. Fase 3 — Vaste maten en kleuren (bewuste, kleine verschillen)

Dit is de enige fase die het uiterlijk bewust verandert. Voer haar per onderdeel uit en laat Peter na elk onderdeel kijken.

In `css/00-tokens.css`:

```css
:root{
  /* Tekst: zes maten, niets kleiner dan 12px */
  --fs-xs:12px; --fs-s:14px; --fs-m:16px; --fs-l:19px; --fs-xl:24px; --fs-xxl:32px;
  /* Ruimte */
  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:24px; --sp-6:32px;
  /* Rondingen */
  --r-s:8px; --r-m:12px; --r-l:18px;
  /* Kleuren: per thema één set; puzzelkleuren uit de puzzle registry */
  --tekst:…; --tekst-zacht:…; --vlak:…; --rand:…; --accent:…;
}
```

- Vervang per onderdeel losse waarden door deze variabelen. Kies de dichtstbijzijnde maat.
- Hulpteksten die nu 9–11 px zijn worden minimaal `--fs-xs`; op de iPhone liefst `--fs-s`.
- Grijze tekst op beige: controleer contrast minimaal 4,5:1 (WCAG AA).
- Na akkoord van Peter op het apparaat: `snapshot.mjs --update` voor dat onderdeel en de baseline committen.

**Klaar wanneer:** minder dan 10 losse lettergroottes en minder dan 40 losse kleurcodes buiten `00-tokens.css` en de puzzelregistry.

## 7. Fase 4 — `!important` afbouwen (0 pixels verschil)

Per onderdeel: haal `!important` weg waar de regel ook zonder wint. Alleen houden waar het om een bewuste uitzondering gaat (bijvoorbeeld toegankelijkheid of `[hidden]`), met een korte opmerking waarom.

**Klaar wanneer:** minder dan 20 keer `!important` in alle CSS samen.

## 8. Buiten dit plan

- `core.js` (322 KB) niet in één keer herschrijven. Volg `PRODUCT-UX.md` §13: een onderdeel pas losmaken wanneer het toch substantieel wordt gewijzigd.
- Het herontwerp van het groepsoverzicht (`PRODUCT-UX.md` §16) combineren met Fase 1 stap 6: eerst samenvoegen met 0 px verschil, daarna als aparte stap herontwerpen. Het lege groepsoverzicht op de iPhone heeft daarbij voorrang.
- Geen nieuwe puzzelsoorten of grote functies tijdens Fase 1 en 2.

## 9. Werkafspraak na het opruimen

- Visuele wensen verzamelt Peter een week in één lijst en levert ze in één keer aan.
- Iedere visuele wijziging noemt het onderdeel en het bestand. De visuele controle laat zien welke schermen veranderen; alleen die mogen veranderen.
- Bij een verschil op een scherm dat níet bedoeld was: eerst oplossen, dan pas publiceren.

## 10. Opdracht voor ChatGPT (kopiëren en plakken)

Fase 0 is uitgevoerd in branch `claude/visuele-controle` (draft-PR naar `develop`). Na het samenvoegen:

> Lees `docs/AI-WERKWIJZE.md`, `docs/TESTOMGEVING.md` en `docs/OPRUIMPLAN-VORMGEVING.md` op de actuele `develop`. De visuele controle uit `test/visual/` en de workflow `Visuele controle` zijn aanwezig. Wijzig vanaf nu geen CSS zonder dat die workflow groen is, en volg de gouden regels uit hoofdstuk 2. Begin pas aan Fase 1 als ik daar expliciet om vraag, en dan steeds één onderdeel per keer volgens hoofdstuk 4.

Vervolgopdracht per onderdeel:

> Voer Fase 1 uit voor onderdeel *<naam>* volgens hoofdstuk 4 van `docs/OPRUIMPLAN-VORMGEVING.md`. Controleer eerst in `dekking.json` dat dit onderdeel bewaakt wordt. Vereist: de workflow Visuele controle blijft groen. Meld het aantal regels voor en na. Wijzig niets buiten dit onderdeel.

Losse fixes die buiten het opruimen om mogen (eigen commit, daarna baseline van alleen de betrokken schermen bijwerken):

> Pas `scripts/seed-test-groups.mjs` aan zodat dagresultaten hetzelfde typeformaat krijgen als de app (`bin`, `bin.1`, `bin.3` in plaats van `bin.normal`), zie de correctie in `test/visual/make-fixture.mjs`.

> Geef `.stat-icon` een basismaat (`width:1em;height:1em;display:inline-block;vertical-align:-0.15em`) zodat het foutloos-icoon op de “Klaar!”-kaart klein naast de tekst staat. Controleer met de visuele controle dat alleen de schermen `opgelost-kaart` veranderen.
