# Verbeterplan Gepuzzellig

Status: plan, opgesteld 27 oktober 2026 op basis van `develop` v228.
Eigenaar: Peter. Uitvoering: ChatGPT, Claude of allebei, stap voor stap.
Eerst de app goed maken; pas daarna de App Store of nieuwe puzzels overwegen (hoofdstuk 13).

Dit plan bundelt alle bevindingen uit de review van 26–27 oktober: opmaak, kleur, iconen, bediening, Murdoku, hints, teksten, toegankelijkheid, snelheid en privacy. Voor het opruimen van de CSS verwijst het naar `docs/OPRUIMPLAN-VORMGEVING.md`; dat document blijft de gedetailleerde werkwijze voor die stappen.

---

## 1. Doel en eindpunt

**Doel:** een app die rustig, vrolijk en duidelijk is, overal hetzelfde werkt, goed leesbaar is voor iedereen (ook met grotere tekst), en waarin een wijziging op één plek ook alleen daar effect heeft.

**De app is “goed” wanneer alle punten hieronder kloppen.** Pas dan volgt hoofdstuk 13.

- [ ] Alle stappen in dit plan staan op *klaar* of zijn bewust geschrapt (met reden in de statustabel).
- [ ] De workflow *Visuele controle* en *Check Gepuzzellig* zijn groen op `develop`, met dekking ≥ 85 % van wat met een screenshot vast te leggen is.
- [ ] Peter en Aart hebben twee weken gespeeld op iPad en iPhone zonder nieuwe ergernissen op het lijstje.
- [ ] Grotere tekst (iOS-instelling) werkt op Home, puzzels, groepen en profiel zonder overlap.
- [ ] Geen emoji meer in bediening en koppen; één icoonset.
- [ ] Teksten volgen de woordenlijst; geen Engels of programmeerjargon in beeld.
- [ ] Er is een privacyverklaring en de online-status is uit te zetten.

---

## 2. Werkwijze per stap

### Rollen

| Wie | Doet |
| --- | --- |
| **Peter** | Neemt de besluiten (hoofdstuk 5), test elke afgeronde stap op iPad en iPhone, en voegt PR's samen. |
| **Bouwer** (ChatGPT of Claude) | Voert één stap uit in een eigen branch en opent een pull request naar `develop`. |
| **Reviewer** (de ander) | Leest de PR en controleert of alleen deze stap is uitgevoerd en of de checks kloppen. Optioneel, maar aanbevolen bij stappen met ★. |

Bouwer en reviewer mogen per stap wisselen. Een vaste rolverdeling is niet nodig: het plan, de statustabel en de PR's zijn het geheugen, niet de chatgeschiedenis.

### Vaste regels (gelden voor iedere stap)

1. **Eén stap per pull request.** Branchnaam: `<wie>/<stap-id>-<korte-naam>`, bijvoorbeeld `chatgpt/D1-lettergroottes` of `claude/S4-murdoku-bord`.
2. **Altijd vanaf de actuele `develop`.** Nooit rechtstreeks naar `develop` of `main` pushen.
3. **De checks moeten groen zijn** voordat Peter samenvoegt: *Check Gepuzzellig* en *Visuele controle*.
4. **Visuele verschillen alleen waar de stap dat zegt.** Elke stap noemt onder *Vangnet* welke schermen mogen veranderen. Verandert er een ander scherm, dan is de stap niet klaar. Bewuste verschillen: de baselinebestanden van precies die schermen verwijderen in dezelfde PR (zie `test/visual/README.md`).
5. **Geen bijvangst.** Iets anders gezien? Dan als nieuwe regel onder *Gevonden tijdens het werk* in de statustabel, niet stiekem meenemen.
6. **Gouden regels van het opruimplan** (hoofdstuk 2 van `OPRUIMPLAN-VORMGEVING.md`) gelden voor alle CSS-werk: niets achteraan toevoegen, geen nieuwe `!important`, één onderdeel per keer.
7. **Statustabel bijwerken** in dezelfde PR: zet de stap op *in review* met de PR-link. Peter zet hem op *klaar* na samenvoegen en zijn eigen test.
8. **Geen productie-acties.** Niets aan `main`, het Firebase-project `gepuzzelig`, secrets of de migratie zonder expliciete opdracht van Peter.

### Standaardopdracht (kopiëren en de stap invullen)

> Voer stap **〈ID〉** uit volgens `docs/VERBETERPLAN.md` op de actuele `develop`. Lees eerst `docs/AI-WERKWIJZE.md`, `docs/TESTOMGEVING.md`, `docs/VERBETERPLAN.md` (hoofdstuk 2 en stap 〈ID〉), `docs/BESLUITEN.md` (zodra die bestaat) en bij CSS-werk `docs/OPRUIMPLAN-VORMGEVING.md`. Werk in een eigen branch en open een pull request naar `develop`. Voer alleen deze stap uit. De checks *Check Gepuzzellig* en *Visuele controle* moeten groen zijn; alleen de schermen die bij de stap onder *Vangnet* staan mogen veranderen. Werk de statustabel bij. Meld in de PR: wat er veranderd is, welke schermen veranderd zijn, en wat ik op iPad en iPhone moet testen.

### Reviewopdracht

> Review pull request 〈link〉 tegen stap 〈ID〉 van `docs/VERBETERPLAN.md`. Controleer: is alleen deze stap uitgevoerd, kloppen de veranderde schermen met *Vangnet*, zijn de gouden regels gevolgd, en klopt *Klaar wanneer*? Noem concreet wat moet veranderen, of meld dat de PR klaar is om samen te voegen.

### Hoe Peter test

Na elke samengevoegde stap op de testsite (`https://gepuzzellig-test.web.app`):

1. iPad liggend én iPhone, licht en donker: de schermen uit *Vangnet* bekijken.
2. Eén puzzel spelen die bij de stap hoort.
3. Klopt iets niet: terugmelden in de PR of als nieuwe regel in de statustabel.

---

## 3. Volgorde en afhankelijkheden

```text
V, G1, G2  Vóór de livegang ──────► (migratie live)
                                        │
S0 Stabiliseren (2 weken) ◄─────────────┘
F  Fundament ──► B Besluiten ──► O Opruimen (onzichtbaar)
                       │                 │
                       └──────► D Ontwerpsysteem ──► S Schermen ──► T Teksten & hints
                                                                        │
P Techniek (kan parallel aan S/T) ── Q Privacy (vóór nieuwe families) ──┴─► E Afronding
```

Waarom deze volgorde:

- **Besluiten vóór bouwen:** veel stappen hangen af van keuzes over kleur, navigatie en apparaatvarianten. Eerst kiezen voorkomt dubbel werk.
- **Opruimen vóór ontwerpen:** ontwerpwijzigingen in opgeruimde CSS raken alleen het bedoelde onderdeel.
- **Ontwerpsysteem vóór schermen:** schermen worden opgebouwd uit vaste maten, kleuren en iconen in plaats van eigen uitzonderingen.
- **Teksten na schermen:** dan passen de teksten in de nieuwe vakken en knoppen.

---

## 4. Statustabel

Status: *open* · *bezig* · *in review* · *klaar* · *geschrapt (reden)*

| ID | Stap | Type | Afhankelijk van | Status | PR |
| --- | --- | --- | --- | --- | --- |
| V1 | App-naam “Gepuzzellig Test” alleen op testsite | techniek | – | open | |
| V2 | Jargon “puzzleKey” uit het groepsoverzicht | tekst | – | open | |
| G1 | Oude branches controleren en opruimen | GitHub | – | open | |
| G2 | Screenshots van het vangnet uit de hoofdgeschiedenis (eigen branch) | GitHub | – | open | |
| S0 | Twee weken stabiliseren en verzamelen | proces | livegang | open | |
| F1 | Vangnet samenvoegen (PR #21) | techniek | S0, G2 | open | #21 |
| F2 | Seed-script: typeformaat dagresultaten | techniek | F1 | open | |
| F3 | Vóór de livegang: Klaar-icoon, hint-lampje iPhone, “Reeks: 1 dag”, terugknop hint “← Stap 2”, groepsteksten (v229) | zichtbaar | – | in review | #22 |
| B1–B7 | Productbesluiten — zie `docs/BESLUITEN.md` | besluit (Peter) | – | klaar (27 okt) | |
| B1-O | Onderzoek: één dagpuzzel voor telefoon en groot scherm? | onderzoek | B1 | open | |
| O1 | Dode CSS-regels weg | onzichtbaar | F1 | open | |
| O2 | Dubbele CSS-regels samenvoegen, per onderdeel | onzichtbaar | O1 | open | |
| O3 | CSS splitsen per onderdeel | onzichtbaar | O2 | open | |
| D1 | Vaste lettergroottes, werkt goed bij zoomen ★ | zichtbaar | O3 | open | |
| D2 | Kleuren en persoonlijke kleur ★ | zichtbaar | O3, B4 | open | |
| D3 | Eén icoonset, emoji vervangen | zichtbaar | D2, B3 | open | |
| D4 | Knoppen en bediening gelijktrekken | zichtbaar | D1, D2 | open | |
| D5 | `!important` afbouwen | onzichtbaar | D4 | open | |
| S1 | Home | zichtbaar | D1–D4 | open | |
| S2 | Groepspagina (iPhone eerst) ★ | zichtbaar | D1–D4, B5 | open | |
| S3 | Klaar-kaart | zichtbaar | D1–D4 | open | |
| S4 | Murdoku-bord | zichtbaar | D1–D4 | open | |
| S5 | Puzzelen-pagina | zichtbaar | D1–D4 | open | |
| S6 | Hexcells-bediening en tellers | zichtbaar | D4 | open | |
| S7 | Puzzelmenu en hintpaneel | zichtbaar | D4 | open | |
| S8 | iPhone-navigatie onderaan (B2) ★ | zichtbaar | S1 | open | |
| T1 | Woordenlijst doorvoeren, jargon weg | tekst | B1-O, S1–S7 | open | |
| T2 | Uitleg per puzzel inkorten | tekst | T1 | open | |
| T3 | Hints Murdoku herschrijven ★ | tekst | T1 | open | |
| T4 | Hints Hexcells herschrijven | tekst | T3 | open | |
| T5 | Hints overige puzzels en herhaling korter | tekst | T3 | open | |
| P1 | Alleen actieve puzzels laden | techniek | O3 | open | |
| P2 | Snelheid op trage telefoon | techniek | P1 | open | |
| P3 | Visuele controle sneller in GitHub | techniek | F1 | open | |
| P4 | `core.js` opsplitsen bij aanraking | techniek | doorlopend | open | |
| G3 | `proef-layout.html` niet meer committen | GitHub | F1 | open | |
| G4 | Documentatie: archief, overzicht en README | GitHub | F1 | open | |
| G5 | Workflows bijwerken (Node 24-acties, vaste Ubuntu-versie) | GitHub | F1 | open | |
| G6 | Versienummer en cache automatisch ophogen | GitHub | O3 | open | |
| Q1 | Privacyverklaring | tekst | – | open | |
| Q2 | Online-status uit te zetten | zichtbaar | D4 | open | |
| Q3 | Namen en merken op een rij | besluit | – | open | |
| E1 | Eindcontrole en twee weken spelen | proces | alles | open | |

**Gevonden tijdens het werk** (nieuwe punten hier toevoegen, met datum en wie):

| Datum | Wie | Punt | Voorstel |
| --- | --- | --- | --- |
| 27 okt | Claude | Vangnet: de opslagmelding (“bewaard en gesynchroniseerd” / “bewaard”) hangt af van timing in de nagebootste database en gaf één keer een vals verschil (`ipad-light-bin-controleer`). | In `snapshot.mjs` wachten tot de opslagmelding stabiel is, of die melding in de controle verbergen. Meenemen bij P3. |
| 27 okt | Claude | Puzzelkop bij zoom 130 %: “Puzzel van de dag” afgekapt, “tijd tonen” over twee regels. | Meenemen in D1. |

---

## 5. B — Productbesluiten (Peter)

**Genomen op 27 oktober 2026; zie `docs/BESLUITEN.md`.** Peter koos bij alle zeven de aanbeveling. B1 leidt tot een onderzoeksstap (B1-O) voordat er gekozen wordt. De tabel hieronder laat de afweging zien.

| ID | Vraag | Opties | Aanbeveling |
| --- | --- | --- | --- |
| **B1** | Aparte dagpuzzels voor telefoon en groot scherm? Nu moet dit op drie plekken met lange tekst worden uitgelegd, en telefoonvoortgang wordt niet gedeeld. | a) zo laten en beter uitleggen · b) één dagpuzzel per dag, met een bordvorm die zich aanpast · c) één dagpuzzel, telefoon krijgt een kleinere variant maar telt als dezelfde | **Onderzoeken of b) of c) haalbaar is**; als dat te veel raakt aan generators en resultaten: a) met één korte, vaste zin. Eigen stap na dit besluit. |
| **B2** | Navigatie op de iPhone bovenin of onderin? | a) bovenin laten · b) onderaan, zoals de meeste iPhone-apps | **b) onderaan** (stap S8). Duimvriendelijk en meer ruimte voor de kop. |
| **B3** | Emoji? | a) zoals nu · b) geen emoji in bediening en koppen, hooguit in de inhoud · c) nergens emoji | **b)**, met per plek een besluit in de emojilijst van stap D3. |
| **B4** | Kleur van de startknoppen en de persoonlijke kleur. | a) groen = spelen, overal · b) startknop in de persoonlijke kleur · c) startknop in de puzzelkleur | **b)** op Home, **c)** op Puzzelen mag ook; in ieder geval overal dezelfde regel. Persoonlijke kleur ook in achtergrondtint, welkomstvak en navigatie (zie D2). |
| **B5** | Opzet groepspagina. | Zoals in `PRODUCT-UX.md` §16: Overzicht · Activiteit · Statistieken | **Overnemen**, met op de iPhone als eerste een compacte ledenlijst met de week. |
| **B6** | Woordenlijst. | Zie tabel hieronder | **Overnemen of aanpassen.** |
| **B7** | Welke grotere-tekstinstelling moet minimaal werken? | iOS-tekstgrootte tot “groot” / tot de grootste toegankelijkheidsmaat | **Tot één stap boven standaard zonder enig probleem**, en de grootste toegankelijkheidsmaat zonder overlap (scrollen mag). |

**Voorstel woordenlijst (B6)**

| Gebruik | Niet gebruiken | Opmerking |
| --- | --- | --- |
| Home | Vandaag (als plaatsnaam) | “Naar Home”, niet “Naar Vandaag” |
| Dagpuzzel | dagelijkse puzzel, daily | |
| Vrij puzzelen | oefenpuzzel | |
| Reeks: 1 dag / 3 dagen | dagen reeks | |
| Gebied (Star Battle) | vlak | |
| Leeg vakje | vrij vakje | |
| Groep, groepslid, beheerder | membership, admin | |
| Personen (Murdoku) | cast, personages | “Personen opslaan” |
| Op de telefoon / op een groot scherm | telefoonvariant, apparaatvariant | alleen als B1 dat nog nodig maakt |
| Fout | foutmoment | |
| Hint, klein duwtje, volledige hint | zetje | |

### B1-O — Onderzoek: één dagpuzzel voor telefoon en groot scherm?

- **Waarom:** nu krijgt de telefoon een eigen dagpuzzel; telefoonvoortgang wordt niet gedeeld en het verschil moet op drie plekken met lange tekst worden uitgelegd.
- **Wat:** alleen onderzoek, geen code. Voor beide opties (a: één puzzel met een bordvorm die zich aanpast; b: kleinere telefoonvariant die als dezelfde dagpuzzel telt) beschrijven wat er verandert aan generators, dagpuzzelidentiteit, resultaten, voortgang en synchronisatie, statistieken en de bestaande gegevens na de migratie. Met een inschatting van de omvang en een advies.
- **Uitkomst:** `docs/ONDERZOEK-B1-VARIANTEN.md`; Peter kiest daarna en legt het vast in `BESLUITEN.md`.

---

## 6. V — Vóór de livegang

Deze twee stappen gaan **vóór** de productiemigratie, op `develop`. Ze veranderen de releasekandidaat: volg daarna het draaiboek (`FASE11-LIVEGANG.md`) opnieuw met de nieuwe `develop`-HEAD.

### V1 — App-naam alleen op de testsite

- **Waarom:** in `index.html` op `develop` staat de app-naam in de manifest en `apple-mobile-web-app-title` als “Gepuzzellig Test” (sinds commit 11f58ef). Op `main` is het “Gepuzzellig”. Gaat dit live, dan heet de app op een nieuw geïnstalleerd beginscherm “Gepuzzellig Test”.
- **Wat:** in de bron weer “Gepuzzellig”. De testdeploy (`.github/workflows/deploy-test.yml`) zet de naam “Gepuzzellig Test” alleen in `.test-dist/index.html`, op dezelfde manier als de config wordt vervangen, met een controle dat de bron “Gepuzzellig” bevat.
- **Vangnet:** geen visuele verschillen.
- **Klaar wanneer:** bron = “Gepuzzellig”; testsite = “Gepuzzellig Test”; checks groen.
- **Peter test:** testsite toevoegen aan beginscherm → naam “Gepuzzellig Test”.

### V2 — Jargon uit het groepsoverzicht

- **Waarom:** in beeld staat “Tijden worden alleen naast elkaar gezet als **puzzleKey**, moeilijkheid, variant en apparaatvariant gelijk zijn.”
- **Wat:** vervangen door bijvoorbeeld “Alleen tijden van dezelfde puzzel op hetzelfde niveau staan naast elkaar.”
- **Vangnet:** alleen de schermen `groep`, `groep-week`, `duo` (de regel onder *Vergelijkbare tijden*).
- **Klaar wanneer:** geen code- of Engelse termen meer in dit blok.

---

## 7. S0 en F — Stabiliseren en fundament

### S0 — Twee weken stabiliseren

- Alleen spelen. Peter en Aart houden een lijstje bij (bijvoorbeeld in Notities).
- Problemen met de migratie of verloren voortgang gaan voor alles; die worden als losse fix opgelost.
- **Klaar wanneer:** twee weken zonder migratieproblemen; het lijstje staat onder *Gevonden tijdens het werk*.

### F1 — Vangnet samenvoegen

- PR #21 van *draft* naar *ready* en samenvoegen in `develop`.
- Daarna controleren hoe GitHub Pages voor `main` publiceert: komt `test/` mee op de livesite, dan uitsluiten (bijvoorbeeld via de Pages-bron of een build die alleen de app-bestanden publiceert).
- **Klaar wanneer:** *Visuele controle* draait groen op `develop`; `test/` staat niet op de livesite.

### F2 — Seed-script

- `scripts/seed-test-groups.mjs` schrijft dagresultaten als `bin.normal`; de app gebruikt `bin` (Normaal), `bin.1` (Makkelijk), `bin.3` (Moeilijk) — zie `sfx` in `core.js` en `dailyLevels` in de registry.
- **Wat:** seed-script aanpassen; de correctie in `test/visual/make-fixture.mjs` mag blijven (wordt dan een no-op) of weg.
- **Vangnet:** geen verschillen (de fixture corrigeerde dit al).
- **Klaar wanneer:** na opnieuw seeden in `gepuzzellig-test` tellen testresultaten in het groepsoverzicht net als echte (geen “0/6 gekozen” bij leden die wel gespeeld hebben).

### F3 — Klaar-kaart icoon (oefenstap)

- Het foutloos-icoon (`.stat-icon`) heeft alleen een maat binnen `.sco` en `.personview`; op de Klaar-kaart vult het de halve kaart.
- **Wat:** een basisregel `.stat-icon{width:1em;height:1em;display:inline-block;vertical-align:-0.15em}`, op de plek waar `.stat-icon` voor het eerst voorkomt.
- **Vangnet:** alleen `opgelost-kaart` (alle apparaten en thema's). Die baselinebestanden verwijderen in de PR.
- **Klaar wanneer:** icoon staat klein naast “foutloos”; alle andere schermen gelijk.
- Dit is de eerste stap met een bewuste visuele wijziging: zo leer je de werkwijze met het vangnet kennen.

---

## 8. O — Opruimen (onzichtbaar)

Volledig beschreven in `docs/OPRUIMPLAN-VORMGEVING.md`, hoofdstuk 4 en 5. Samengevat:

| ID | Wat | Vangnet |
| --- | --- | --- |
| **O1** | Dode regels weg (eerst `.uxpeople`), alleen als ze in `dekking.json` ongeraakt zijn én de klasse nergens in JS/HTML voorkomt, ook niet als opgebouwde naam. | 0 px verschil |
| **O2** | Dubbele regels samenvoegen, één onderdeel per PR, in de volgorde van het opruimplan (opgelost-kaart … telefoonregels). Eerst controleren dat het onderdeel bewaakt wordt. | 0 px verschil |
| **O3** | `app.css`, `ux.css` en `layout.css` splitsen in bestanden per onderdeel, in dezelfde volgorde. | 0 px verschil |

**Klaar wanneer:** minder dan 20 dubbele selectors, `app.css` bestaat niet meer, 0 px verschil, en Peter heeft na O3 een dag normaal gespeeld.

---

## 9. D — Ontwerpsysteem (zichtbaar)

Vanaf hier verandert het uiterlijk. Per stap: eerst op de testsite laten zien, Peter keurt goed, dan pas de baseline bijwerken.

### D1 — Vaste lettergroottes ★

- **Waarom:** 88 verschillende lettergroottes, 107 keer kleiner dan 12 px, “Start” is 9,5 px.
- **Hoe grotere tekst werkt bij een web-app** (gemeten 27 oktober): de iOS-instelling voor tekstgrootte geldt níet voor websites en web-apps. Mensen vergroten met **zoomen**: de aA-knop in Safari op iPhone/iPad, ⌘+ of de standaard paginazoom op de Mac. Getest met zoom 125 % en 150 % (Mac) en 115 % en 130 % (iPad): niets loopt in elkaar, geen horizontaal scrollen. Alleen in de puzzelkop wordt “Puzzel van de dag” afgekapt en breekt “tijd tonen” over twee regels. Zoomen vergroot echter alles even veel, dus wie inzoomt omdat de kleinste tekst onleesbaar is, krijgt een minder handige indeling. Daarom: de kleinste tekst groter, niet de structuur.
- **Wat:** zes maten als variabelen (in `rem`), minimum 12 px, op de iPhone hulptekst minimaal 14 px. Alle tekst omzetten, per onderdeel. Puzzelkop: label en knoppen passen bij 130 % zoom.
- **Vangnet:** alle schermen veranderen; per onderdeel een PR. Een zoomtest (Mac 150 %, iPad 130 %, iPhone 115 %) toevoegen aan `test/visual/` als extra schermen.
- **Klaar wanneer:** < 10 losse lettergroottes buiten de variabelen; niets onder 12 px; bij de zoomtest geen overlap, afkapping of horizontaal scrollen (B7).

### D2 — Kleuren en persoonlijke kleur ★

- **Waarom:** 195 losse kleurcodes; crème kaarten op crème achtergrond waardoor accenten wegvallen; de persoonlijke kleur (`--home-accent`) wordt op Home bijna niet gebruikt. De proef van 26 oktober (witte kaarten, tint van de persoonlijke kleur in achtergrond, welkomstvak en navigatie) werd als prettiger ervaren.
- **Wat:**
  - Kleurvariabelen per thema (licht/donker): tekst, zachte tekst, achtergrond, kaart, rand, accent, succes, fout.
  - Persoonlijke kleur: zachte tint in de achtergrond, kleurverloop in het welkomstvak, actieve navigatie, reeks-label en sectie-iconen. In donker: donkere achtergrond met een gloed van de persoonlijke kleur.
  - Kaarten lichter dan de achtergrond (wit of bijna wit), met een rand in een vleugje van de persoonlijke kleur.
  - Puzzelkleuren uit de registry als enige bron, ook voor een smal streepje per dagpuzzel op Home.
  - Rood als persoonlijke kleur: zachtere tint, zodat het niet als “fout” leest.
  - Contrast minimaal 4,5:1 voor tekst (nu 4,2:1 voor grijze hulptekst).
- **Vangnet:** alle schermen; per onderdeel.
- **Klaar wanneer:** < 40 losse kleurcodes buiten variabelen en registry; contrast gehaald; alle zeven persoonlijke kleuren bekeken in licht en donker.

### D3 — Eén icoonset, emoji vervangen

- **Waarom:** drie soorten iconen door elkaar (emoji, teksttekens als ✕ ○ ✎ ✓ ▦ ⬢, lijniconen). Emoji zien er per apparaat anders uit en ogen goedkoop. Besluit B3.
- **Wat:**
  1. Eerst een **emojilijst** maken: elke emoji en elk tekstteken in de interface, met plek en voorstel (*vervangen door icoon* / *laten staan*). Peter loopt de lijst na. Bekende plekken: 💡 hint, ✏️ potlood, ⭐ puzzel van de dag, 🔥 reeks, 📅 🎲 koppen, 🔵 ⚫ Hexcells, 💀 slachtoffer Murdoku, 🖥️ groot scherm, 🎯 foutloos.
  2. Eén icoonset in één stijl: lijn in `currentColor` met optionele zachte vulling (zoals de proef: kalender, dobbelsteen, personen, vlam, ster). Als SVG-symbolen op één plek, niet per scherm gekopieerd.
  3. Vervangen volgens de goedgekeurde lijst.
- **Murdoku-objecten** (bed, bank, plant, …) zijn spelinhoud en blijven in hun eigen stickerstijl (zie S4).
- **Vangnet:** alle schermen met iconen; per groep plekken een PR.
- **Klaar wanneer:** geen emoji meer in bediening en koppen, behalve wat in de lijst bewust *laten staan* is.

### D4 — Knoppen en bediening gelijktrekken

- **Geselecteerde stand overal hetzelfde:** nu beige (Binair, Star Battle), blauw (Pluszle, Hexcells) of rood (Murdoku). Voorstel: de puzzelkleur.
- **Hintknop op de iPhone:** lampje in plaats van “?” (op main stond er wel een lampje; “?” leest als “uitleg”).
- **Aanraakvlak minimaal 44×44 px** op de iPhone: Hint en Controleer (nu 38 px breed), Nonogram-kleuren (32 px), Murdoku-namen (30 px hoog).
- **Dubbeltik zichtbaar maken:** de modusknop toont dat dubbeltik het andere teken zet (bijvoorbeeld een klein ✕↔○-icoon), en de eerste uitleg noemt het.
- **Startknoppen** volgens besluit B4, overal dezelfde regel (nu groen op Home, puzzelkleur op Puzzelen, oranje bij “Verder”).
- **Vangnet:** puzzelschermen (`dag-*`, `bin-*`, `hint-*`) en Home.
- **Klaar wanneer:** gemeten op iPhone geen interactief element < 44 px (deze meting als controle toevoegen aan `test/visual/`); één regel voor geselecteerde stand en startknoppen.

### D5 — `!important` afbouwen

- Zie `OPRUIMPLAN-VORMGEVING.md` hoofdstuk 7. **Vangnet:** 0 px verschil. **Klaar wanneer:** < 20 keer `!important`.

---

## 10. S — Schermen herzien (zichtbaar)

### S1 — Home

- Persoonlijke kleur, witte kaarten, puzzelstreepjes en sectie-iconen volgens D2/D3 toepassen.
- “Je voortgang wordt tijdens het puzzelen automatisch bewaard.” weg; alleen tonen als opslaan mislukt.
- Themakeuze (Systeem/Licht/Donker) van de kop naar Profiel; de kop krijgt rust.
- Afgeronde dagpuzzel herkenbaar aan een gekleurd vinkje of gekleurde tegel, niet alleen tekst.
- **Vangnet:** `home*` op alle apparaten.

### S2 — Groepspagina ★ (iPhone eerst)

- **Waarom:** op de iPhone toont de groepspagina alleen periodeknoppen, een dichtgeklapte regel “Grafieken van alle 6 leden” en een voetnoot; ledenlijst en weekmatrix ontbreken. Op de iPad staat juist te veel tegelijk.
- **Wat:** volgens B5 en `PRODUCT-UX.md` §16: Overzicht · Activiteit · Statistieken. iPhone begint met een compacte ledenlijst met de week. Per-puzzelgrafiek met namen in plaats van alleen voorletters (P S F M D Z). Kolom “gekozen” krijgt een begrijpelijke naam en past binnen de kaart. Groepen groter dan zes: eigen gebruiker en actieve leden eerst, “Alle leden” als route.
- **Vangnet:** `groep*`, `duo`, `groepen`.
- **Klaar wanneer:** op de iPhone zie je zonder uitklappen wie deze week wat gedaan heeft; op de iPad past het overzicht zonder lang scrollen.

### S3 — Klaar-kaart

- Kop in de puzzelkleur, foutloos/zonder hint als gekleurde badges (iconen uit D3), klein feestelijk moment (geen geluid).
- “foutloos · 21 volledige hints” is tegenstrijdig: bij veel hints niet als prestatie presenteren.
- “Naar Vandaag” → “Naar Home” (woordenlijst).
- **Vangnet:** `opgelost-kaart`.

### S4 — Murdoku-bord

- **Bezette vakken zichtbaar:** vakken waar niemand kan staan (kast, tafel, plant, cadeau, tv) krijgen een lichte arcering of grijswaas.
- **Objectkleuren gedempt** (hout, beige, zacht groen, grijsblauw), zodat de personen de enige felle kleuren zijn. Nu botsen ze: Emma oranje / bank oranje, Gwen en Olivia blauw / bed blauw, Timo paars / cadeau paars, Hugo rood / stoel rood. Dit lijkt ook meer op de Murdoku-boekjes.
- **Objecten kleiner** (±65 % van het vak in plaats van ±83 %), zodat een geplaatste persoon het object niet afdekt; persoon bijvoorbeeld iets naar rechtsonder.
- **Legenda met namen:** *Zitten: stoel, bank, bed* · *Bezet: kast, tafel, plant, cadeau, tv* — met icoon én woord, want de aanwijzingen gebruiken de woorden. Nu alleen ±12 px-icoontjes in een zin.
- **Donker:** randen meekleuren met het thema; kamerkleuren iets helderder (nu olijf/bruin).
- 💀 volgens de emojilijst (D3).
- **Vangnet:** `dag-mur`, `hint-mur-*`, `mur-geplaatst`.

### S5 — Puzzelen-pagina

- Dubbele navigatie weg (eigen “← Home”-knop naast de navigatiebalk).
- Startknoppen volgens B4.
- Hexcells-omschrijving klopt niet (“veilige en gekleurde vakken”): aanpassen aan blauw/zwart.
- **Vangnet:** `puzzelen`.

### S6 — Hexcells-bediening en tellers

- iPad: bedieningsbalk naast het bord in plaats van tegen de schermrand.
- “NOG TE VINDEN / FOUTEN”: kleiner, in de stijl van de andere statuslabels (de knipoog naar het origineel mag blijven).
- **Vangnet:** `dag-hex`, `hint-hex-*`.

### S7 — Puzzelmenu en hintpaneel

- Puzzelmenu iPhone: grafiek-icoon zonder tekst krijgt een label (“Overzicht”); “1 dagen reeks” → “Reeks: 1 dag”.
- Hintpaneel:
  - knop “← Denk eens verder” in stap 3 heet anders (hij gaat terug): “← Terug naar stap 2”;
  - de knop “Denk eens verder” (stap 3, smal vak) breekt nu over drie regels;
  - uitleg “┄ Gestippeld … / ═ Dubbele rand …” alleen de eerste keer per sessie;
  - de teller (“1 klein zetje · 3 volledige hints”) uit het hintpaneel; die hoort op de Klaar-kaart.
- **Vangnet:** `bin-menu`, `hint-*`.

### S8 — iPhone-navigatie onderaan ★ (besluit B2)

- Home · Puzzelen · Groepen · Profiel als balk onderaan, met veilige schermrand. Kop op Home wordt compacter.
- **Vangnet:** alle iPhone-schermen buiten de puzzels.

---

## 11. T — Teksten en hints

### T1 — Woordenlijst doorvoeren, jargon weg

- Alle zichtbare teksten volgens B6. Bekende plekken: “Mijn memberships”, “Cast opslaan”, “admin”, “groot-schermvariant”, “telefoonvariant”, “apparaatvariant”, “foutmoment”, “Testduo · adminTestgroep 6 · admin” (ontbrekend scheidingsteken), “1 dagen reeks”, gebied/vlak, vrij/leeg.
- Lange uitleg met apparaatvarianten (puzzelmenu, groepsvoetnoot, Home) terugbrengen tot één korte zin, of laten vervallen als B1 dat mogelijk maakt.
- **Vangnet:** schermen met de betreffende teksten.

### T2 — Uitleg per puzzel inkorten

- Spelregels in maximaal drie korte punten; bediening apart. Voorbeeld: de sleepuitleg bij Binair is één zin van ruim 50 woorden.
- **Vangnet:** `bin-uitleg` en de andere uitlegschermen.

### Vaste zinsopbouw voor hints (T3–T5)

| Stap | Inhoud | Lengte |
| --- | --- | --- |
| 1 — Klein duwtje | Waar je kijkt en wat opvalt, zonder de regel. | 1 zin |
| 2 — Denk eens verder | De regel kort in eigen woorden + één vraag over déze plek. | 2 zinnen |
| 3 — Volledige hint | “Omdat …, kan hier alleen … . Dus …” Eerst de reden, dan de zet. Alleen getallen noemen die iets zeggen. | max. 3 zinnen |

Algemene regels:

- Geen sjabloonzinnen die niet bij de situatie passen (“in deze rij, kolom of dit vlak”, “bij allebei de aanwijzingen” bij één aanwijzing).
- Geen nulzinnen: niet “Je hebt al 0 omcirkeld”, “nog 0 blauw”, “nog 7 nodig om op 7 uit te komen”.
- Komt dezelfde techniek terug, dan wordt de tekst korter (de derde keer “twee kruisjes naast elkaar” is één zin).
- Hexcells-notatie in tekst uitschrijven: “het getal 2 met streepjes” in plaats van “-2-”.
- Bestaande hintcontroles (`check-hint-*`, `check-hints`) blijven slagen; nieuwe controles toevoegen voor de regels hierboven.

### T3 — Hints Murdoku ★

Bekende problemen (uit 8 opeenvolgende hints):

- Hint begint bij “de kaartjes rond Bas” en laat daarna Daan plaatsen.
- “Kijk welke plekken bij allebei de aanwijzingen passen” bij één aanwijzing.
- “Welke plekken passen nog bij deze aanwijzingen?” terwijl er geen aanwijzingen getoond worden.
- Volledige hint eindigt met “Controleer wie nog in kolom 3 past.” — geen uitleg. Beter: “Olivia was in de slaapkamer en links van Wanda. In de slaapkamer is alleen kolom 3 nog vrij links van Wanda.”
- “Op het kaartje van Olivia staat:” twee keer onder elkaar; één keer met beide aanwijzingen.
- **Vangnet:** `hint-mur-*`.

### T4 — Hints Hexcells

- Stap 2 is bij elke lijnhint dezelfde lange zin over haakjes en streepjes; stap 3 blijft algemeen (“Vakjes die bij elke mogelijkheid dezelfde kleur krijgen, kun je openen”). Situatie benoemen: “Als dit vakje blauw is, vormen de twee blauwe één groepje, en het getal met streepjes wil juist losse groepjes. Dus zwart.”
- **Vangnet:** `hint-hex-*`.

### T5 — Hints overige puzzels

- Binair, Star Battle, Nonogram, Pluszle volgens de zinsopbouw; volgorde reden → zet; herhaling korter.
- **Vangnet:** `hint-bin-*`, `hint-star-*`, `hint-nono-*`, `hint-details`.

---

## 12. P en Q — Techniek en privacy

### P1 — Alleen actieve puzzels laden

- `index.html` laadt ook `kakuro.js` en `maak24.js`, die niet meer actief zijn. Laden via de puzzelregistry, alleen wat actief is.
- **Vangnet:** 0 px verschil. **Klaar wanneer:** inactieve puzzels worden niet geladen; alle checks groen.

### P2 — Snelheid op trage telefoon

- Gemeten met 4× tragere processor: Home 2,2 s, Binair/Star Battle openen ±1,3 s, vrije moeilijke Hexcells 3,1 s. Normaal: Home 0,6 s, puzzels 0,15–0,6 s.
- **Wat:** meten op een echte oudere iPhone; als iets langer dan 1 s duurt een zichtbare “puzzel wordt gemaakt”-melding, en waar mogelijk zware generatie verplaatsen (bijvoorbeeld vooraf of in een worker).
- **Klaar wanneer:** niets langer dan 1 s zonder zichtbare melding.

### P3 — Visuele controle sneller in GitHub

- Een run duurt 9–20 minuten, grotendeels het installeren van Playwright. Het officiële Playwright-image gebruiken, daarna eenmalig de baseline opnieuw laten maken (alle baselinebestanden verwijderen in dezelfde PR).
- **Klaar wanneer:** run < 10 minuten, twee runs zonder wijziging gelijk.

### P4 — `core.js` opsplitsen bij aanraking

- Geen grote herschrijving. Volgens `PRODUCT-UX.md` §13: een onderdeel (Home, groep, profiel, statistieken) wordt een eigen bestand wanneer een stap het toch substantieel wijzigt.

### Q1 — Privacyverklaring

- Korte, eerlijke pagina: welke gegevens (naam, Google-e-mail, puzzelresultaten, online-status), waarvoor, wie ze ziet (eigen groepen), waar ze staan (Firebase), hoe je ze laat verwijderen. Bereikbaar vanuit Profiel en bij het eerste inloggen. Nodig vóór meer families en voor de App Store.
- Dit is geen juridisch advies; laat de tekst bij twijfel nalezen.

### Q2 — Online-status uit te zetten

- Instelling in Profiel: “Laat zien wanneer ik online ben”, standaard aan. Uit = geen `presence`-updates.
- **Vangnet:** `profiel`.

### Q3 — Namen en merken

- Lijst van puzzelnamen die van een ander zijn (Hexcells, Murdoku, Pluszle; Star Battle, Binair en Nonogram zijn algemene namen voor een puzzelsoort) met per naam: houden voor privégebruik / vervangen bij publicatie. Brainstormnamen staan in `PRODUCT-UX.md` §11.

---

## 12b. G — GitHub opruimen

### G1 — Oude branches

- 14 branches van 23 oktober (`codex/…`, `proef/…`, `fix/…`, `feature/…`, `release/…`) lopen 557–594 commits achter op `develop`; een paar hebben 1–3 eigen commits.
- **Wat:** per branch controleren of de inhoud van die eigen commits al in `develop` zit (bijvoorbeeld met `git cherry` of door de wijziging in `develop` op te zoeken). Zo ja: branch verwijderen. Zo nee: in de statustabel melden; Peter beslist. Overzicht van wat verwijderd is in de PR of in een commentaar.
- Mag vóór de livegang (verandert niets aan `develop` of `main`).
- **Klaar wanneer:** alleen `main`, `develop` en branches van open PR's bestaan nog.

### G2 — Screenshots uit de hoofdgeschiedenis ★

- De baseline van de visuele controle is ±33 MB aan PNG's; samengevoegd in `develop` komt dat voorgoed in de geschiedenis van `develop` en `main`, en iedere vernieuwing voegt meer toe.
- **Wat:** de baseline in een aparte branch `visuele-baseline` (zonder app-code). De workflow haalt die branch op in `test/visual/baseline/`, vergelijkt, en commit nieuwe of bewust verwijderde baselinebestanden naar `visuele-baseline` in plaats van naar de PR-branch. Baselinebestanden uit PR #21 verwijderen vóór het samenvoegen (squash-merge, zodat ook de tussentijdse PNG-commits niet in `develop` komen).
- **Klaar wanneer:** `develop` bevat geen PNG's onder `test/visual/`; twee workflowruns zonder wijziging volledig gelijk; een bewust verwijderd baselinebestand wordt opnieuw vastgelegd in `visuele-baseline`.

### G3 — `proef-layout.html`

- Dit gegenereerde bestand (720 KB) wordt bij elke wijziging opnieuw gecommit. **Wat:** laten bouwen in de workflow (of alleen op verzoek) en uit de repo halen; `experiments/layout/build.mjs --check` blijft in de controle.

### G4 — Documentatie

- 19 documenten in `docs/`, veel van afgeronde fases. **Wat:** afgeronde fasedocumenten naar `docs/archief/`; één `docs/README.md` als inhoudsopgave (wat is actueel, wat is historie); een korte `README.md` in de hoofdmap: wat Gepuzzellig is, hoe je lokaal test, waar plan en besluiten staan.
- `AI-WERKWIJZE.md` en `TESTOMGEVING.md` blijven op hun plek (worden door opdrachten genoemd).

### G5 — Workflows

- GitHub waarschuwt dat de gebruikte acties op Node 20 draaien (wordt uitgefaseerd) en dat `ubuntu-latest` overgaat naar Ubuntu 26. **Wat:** acties naar versies op Node 24; een vaste runner-versie, zodat een update van GitHub de visuele controle niet onverwacht verandert. Na een runnerwissel eenmalig de baseline vernieuwen.

### G6 — Versienummer automatisch

- Commits als “Verhoog frontendversie naar v205” en “Ververs frontendcache naar v205” komen steeds in paren. **Wat:** één script of workflowstap die `?v=` in `index.html` en de cacheversie in `sw.js` samen ophoogt; `check-app.mjs` blijft controleren dat alles dezelfde versie heeft.

---

## 13. E — Afronding en daarna

### E1 — Eindcontrole

1. Alle punten uit hoofdstuk 1 aflopen.
2. Twee weken spelen met Peter en Aart; nieuwe punten in de statustabel.
3. Een reviewer loopt de app nog één keer volledig door (alle schermen, iPad en iPhone, licht en donker, grotere tekst) en vergelijkt met deze lijst.

### Daarna (bewust buiten dit plan)

- **Nieuwe puzzels:** na het ontwerpsysteem kost een nieuwe puzzel minder werk, omdat bediening, kleuren, hints en uitleg vastliggen. Aansluiten op de puzzelregistry; interne code los van de zichtbare naam.
- **App Store:** vereist onder meer privacyverklaring (Q1), opgeloste namen (Q3), een stabiele app, en een besluit over een eigen app versus de huidige webapp. Eigen plan, op dat moment.

---

## Bijlage — Herkomst van de bevindingen

| Bron | Datum |
| --- | --- |
| Review main en develop, persona's, CSS-metingen | 26 okt 2026 |
| Visuele controle en dekking (PR #21) | 26 okt 2026 |
| Bediening en knopmaten per puzzel | 26 okt 2026 |
| Vergelijking main/develop, kleurmeting, proef persoonlijke kleur | 26 okt 2026 |
| Murdoku-bord, hints (58 hints), teksten (446 regels), snelheid, toegankelijkheid | 27 okt 2026 |
