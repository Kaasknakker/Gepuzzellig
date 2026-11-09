# Operatie Bezemwagen — verbeterplan Gepuzzellig

> **Operatie Bezemwagen**: de bezemwagen rijdt achteraan en veegt op wat is blijven liggen. Geen nieuwe functies, wel alles nalopen, opruimen en afmaken wat in de haast van de afgelopen weken is achtergebleven. Gebruik deze naam in branches, PR's en commits van dit plan, bijvoorbeeld `chatgpt/bezemwagen-D1-lettergroottes` of “Bezemwagen D1: vaste lettergroottes”.

Status: plan, opgesteld 27 oktober 2026 op basis van `develop` v228.
Eigenaar: Peter. Uitvoering: ChatGPT, Claude of allebei, stap voor stap.
Eerst de app goed maken; pas daarna de App Store of nieuwe puzzels overwegen (hoofdstuk 13).

Dit plan (Operatie Bezemwagen) bundelt alle bevindingen uit de review van 26–27 oktober: opmaak, kleur, iconen, bediening, Murdoku, hints, teksten, toegankelijkheid, snelheid en privacy. Voor het opruimen van de CSS verwijst het naar `docs/OPRUIMPLAN-VORMGEVING.md`; dat document blijft de gedetailleerde werkwijze voor die stappen.

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

1. **Eén stap per pull request.** Branchnaam: `<wie>/bezemwagen-<stap-id>-<korte-naam>`, bijvoorbeeld `chatgpt/bezemwagen-D1-lettergroottes` of `claude/bezemwagen-S4-murdoku-bord`. PR-titel begint met “Bezemwagen 〈ID〉:”.
2. **Altijd vanaf de actuele `develop`.** Nooit rechtstreeks naar `develop` of `main` pushen.
3. **De checks moeten groen zijn** voordat Peter samenvoegt: *Check Gepuzzellig* en *Visuele controle*.
4. **Visuele verschillen alleen waar de stap dat zegt.** Elke stap noemt onder *Vangnet* welke schermen mogen veranderen. Verandert er een ander scherm, dan is de stap niet klaar. Bewuste verschillen: de baselinebestanden van precies die schermen verwijderen in dezelfde PR (zie `test/visual/README.md`).
5. **Geen bijvangst.** Iets anders gezien? Dan als nieuwe regel onder *Gevonden tijdens het werk* in de statustabel, niet stiekem meenemen.
6. **Gouden regels van het opruimplan** (hoofdstuk 2 van `OPRUIMPLAN-VORMGEVING.md`) gelden voor alle CSS-werk: niets achteraan toevoegen, geen nieuwe `!important`, één onderdeel per keer.
7. **Statustabel bijwerken** in dezelfde PR: zet de stap op *in review* met de PR-link. Peter zet hem op *klaar* na samenvoegen en zijn eigen test.
8. **Geen productie-acties.** Niets aan `main`, het Firebase-project `gepuzzelig`, secrets of de migratie zonder expliciete opdracht van Peter.

### Standaardopdracht (kopiëren en de stap invullen)

> Operatie Bezemwagen: voer stap **〈ID〉** uit volgens `docs/VERBETERPLAN.md` op de actuele `develop`. Lees eerst `docs/AI-WERKWIJZE.md`, `docs/TESTOMGEVING.md`, `docs/VERBETERPLAN.md` (hoofdstuk 2 en stap 〈ID〉), `docs/BESLUITEN.md` (zodra die bestaat) en bij CSS-werk `docs/OPRUIMPLAN-VORMGEVING.md`. Werk in een eigen branch en open een pull request naar `develop`. Voer alleen deze stap uit. De checks *Check Gepuzzellig* en *Visuele controle* moeten groen zijn; alleen de schermen die bij de stap onder *Vangnet* staan mogen veranderen. Werk de statustabel bij. Meld in de PR: wat er veranderd is, welke schermen veranderd zijn, en wat ik op iPad en iPhone moet testen.

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
| V1 | App-naam “Gepuzzellig Test” alleen op testsite | techniek | – | samengevoegd 27 okt, test Peter | #22 |
| V2 | Jargon “puzzleKey” uit het groepsoverzicht | tekst | – | samengevoegd 27 okt, test Peter | #22 |
| V3 | Werkregels in `AI-WERKWIJZE.md`, overdracht livegang | documenten | – | klaar (27 okt) | #23 |
| G1 | Oude branches controleren en opruimen | GitHub | – | open | |
| G2 | Screenshots van het vangnet uit de hoofdgeschiedenis (eigen branch) | GitHub | – | open | |
| S0 | Twee weken stabiliseren en verzamelen | proces | livegang | open | |
| F0 | CSS-ratchet in Check Gepuzzellig: `!important`, herhaalde selectors, lettergroottes en kleuren kunnen alleen omlaag (eerste stap na de livegang, samen met #24) | techniek | livegang | gebouwd, live in v257, praktijkcontrole open | #28 |
| F1 | Vangnet samenvoegen (PR #21, na G2) | techniek | S0, G2 | open | #21 |
| F2 | Seed-script: typeformaat dagresultaten | techniek | F1 | open | |
| F3 | Vóór de livegang: Klaar-icoon, hint-lampje iPhone, “Reeks: 1 dag”, terugknop hint “← Stap 2”, groepsteksten (v229) | zichtbaar | – | samengevoegd 27 okt, test Peter | #22 |
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
| D6 | Sneltoetsen kleurennonogram: cijfers 1 t/m 4 kiezen de kleur (volgorde van de knoppen), zichtbaar op de knoppen; eerst nakijken welke toetsen al in gebruik zijn (Spatie wisselt stand, Kakuro 0–9). Vooral voor toetsenbord/muis; laag in de rij | nieuw (klein) | D4 | open (Peter 3 nov) | |
| S1 | Home | zichtbaar | D1–D4 | open | |
| S2 | Groepspagina (iPhone eerst) ★ | zichtbaar | D1–D4, B5 | open | |
| S3 | Klaar-kaart | zichtbaar | D1–D4 | open | |
| S4 | Murdoku-bord | zichtbaar | D1–D4 | open | |
| S5 | Puzzelen-pagina | zichtbaar | D1–D4 | deels: eigen “← Home”-knop weg, kop gelijk aan Home | #67 |
| S6 | Hexcells-bediening en tellers | zichtbaar | D4 | open | |
| S7 | Puzzelmenu en hintpaneel | zichtbaar | D4 | open | |
| S8 | Navigatie (B2 = onderaan op iPhone) ★ **uitgebreid (Peter 4 nov):** de navigatiebalk blijft altijd zichtbaar op de hoofdschermen Home, Groepen en Profiel (nu verdwijnt hij bij Groepen en Profiel; vermoedelijk omdat die als scherm over de rest heen openen, eerst nakijken). iPhone onderaan, iPad bijvoorbeeld in de zijbalk (bestaat al in de breed-indeling). Samen met een **vaste paginastijl** (kop, marges, kaarten) zodat Groepen, Profiel en Home constanter ogen. Tijdens het puzzelen mag de balk weg (keuze Peter, nog open). Eerst schets | zichtbaar | D1–D4 | open (na stabiliseren) | |
| S9 | Foutmarkering: de rode vulling van een fout vakje lijkt op de rode kleur in het kleurennonogram en overschrijft wat je had ingevuld. Nu: de eigen kleur blijft, met arcering, rode rand en “!” (Peter 3 nov: eerder een ontwerpprobleem dan een bug) | ux | – | gebouwd, live in v257, praktijkcontrole open | #63 |
| S10 | Murdoku: kaartje markeren als “nog nodig” volgens **B8** (27 okt): vlaggetje rechts op elk kaartje zet “nog nodig” aan of uit; tikken blijft afstrepen; afgestreept en nog nodig sluiten elkaar uit. Aanleiding (Peter 3 nov): een kaartje waarmee je al een persoon hebt geplaatst, maar dat je nog nodig hebt voor een andere (vlag in plaats van wegkruizen). Open bij het ontwerp: of Peter ook **deels afstrepen per aanwijzing** wil (dat is méér dan B8). Alleen op het eigen apparaat per puzzel bewaard, geen Firestore-wijziging. Eerst meten of een tik op een kaartje al iets doet. Samen met T3 | nieuw (klein) | D3, T3 | open (na de livegang) | |
| S11 | Pencil in profiel- en groepsmenu: tik op Terug genegeerd, scrollen stroef (bug, ook in main) | bug | – (na de livegang) | gebouwd, live in v257, praktijkcontrole open | #25 |
| S12 | iPhone-hint in de onderbalk te klein: kaart krijgt alleen de hoogte van de knoppenbalk (`js/layout.js`, `tray`), tekst past er nauwelijks in (ook in main) | bug | – (eerste na de livegang) | gebouwd, live in v257, praktijkcontrole open (Murdoku #45; iPhone alle puzzels #50; knoppen en kruisje #51; iPad #52) | #45, #50, #51, #52 |
| S13 | iPhone-web-app: bovenrand Home (en volgens Peter 2 nov ook alle menupagina's) vervaagt (in Safari goed, als web-app niet; main wel goed). #29 (statusbalk-regel weg) loste het in de web-app níet op. Volgende verdachte: `#home` als eigen scrollcontainer van `100dvh` bovenop de veilige marge, waardoor de pagina zelf net te hoog wordt en iOS zijn vervaging toont | bug | – (na de livegang) | open | #29 (deel) |
| S14 | Binair slepen: een sleep over een rij met groene (afgeronde) vakjes selecteert nu alleen de open vakjes; de hele rij moet geselecteerd worden en groen worden | bug/aanpassing | – | gebouwd, live in v257, praktijkcontrole open | #47 |
| S15 | Opslagstatus (“Op dit apparaat bewaard”, “nog niet gedeeld”, “Opnieuw proberen”): niet meer als vaste regel in de kop; knop veroorzaakt een te hoge kop die over de puzzel valt. Besluit B9 | ux (besluit Peter) | B9 | gebouwd, live in v257, praktijkcontrole open (B9 = b) | #62 |
| S16 | Profiel: vreemde balk over de volle breedte bovenaan (ook op iPad) | bug | – | open | |
| S17 | Online-status tijdens het puzzelen: bij 1 persoon online de naam en de puzzelsoort, vanaf 2 personen “2 online” | nieuw (klein) | Q2 | gebouwd, live in v257, praktijkcontrole open | #68 |
| S19 | Controleer: oordeel niet meer als banner over het bord; duidelijke groene of rode rand om het bord (±1,5 s), kleine melding met aantal (“Geen fouten tot nu toe ✓” / “3 fouten”), foute vakjes herkenbaar (S9) | ux | S9 | gebouwd, live in v257 en v258 (pil en rand), praktijkcontrole open (iPad staand: pil valt terug op over de titel) | #64 |
| S18 | Binair: tekens schuiven een halve punt bij elke handeling in Safari (opgemeten in opname 2 nov); pop nu alleen op het teken (#49). Bevestigen op iPad; zo niet: kleur-overgang op alle vakjes | bug | – | #49 hielp niet: Peter ziet op iPad bij elke tik nog bewegende tekens (5 nov). Plan B gebouwd: geen schaal-pop meer in Binair, alleen doorzichtigheid; praktijkcontrole op iPad open | #49, PR 5 nov |
| S20 | Terug-swipe vanaf de linkerrand: elk hoofdscherm een eigen geschiedenisstap (History API); in een puzzel is terug = naar Home met opslaan; eerst open dialoog of hintkaart sluiten; wisselen tussen hoofdschermen vervangt de stap, alleen een puzzel openen voegt er een toe; herladen en openen vanaf het beginscherm netjes afhandelen. Eerst meten hoe schermwissel nu werkt. Alleen testbaar op iPhone en iPad van Peter (hier geen WebKit) | nieuw | – (na de livegang) | open | |
| S21 | Undo/Opnieuw met Pencil maakte twee stappen tegelijk (snelle-Pencil-bediening en eigen knop voerden beide uit). Opname 3 nov; nagebootst: Pencil-tik 5→3 stappen, vinger 5→4; Star Battle en Binair gemeten. Open: de opname toont ook een hele puzzel die in één keer verdwijnt, nog niet verklaard | bug | – | gebouwd, live in v257, praktijkcontrole open (Pencil-tik op Undo = één stap) | #71 |
| S24 | Haperingen van ~1 s op iPad waarbij tikken niet registreren: nog niet gemeten (Chromium toont niets). Opt-in meetlogger `?perf=1` (eventloop/beeld, pointer-events, Pencil-onderdrukking, duur persist/board/ophalen/localStorage), zonder persoons- of puzzelgegevens | onderzoek | – | gebouwd, meting op iPad open | – |
| S23 | Murdoku-herstelhint wees de verkeerde persoon aan (eerste foute plek in rasterrichting, ook als diens kaartje klopte). Nu: eerst wie zijn eigen kaartje schendt, dan de slachtofferregel (precies één andere persoon in de ruimte), anders neutrale tekst. Melding Peter 5 nov | bug | – | gebouwd (PR 5 nov), praktijkcontrole open | – |
| S25 | Murdoku-hint: kaart was te smal naast het bord (viel terug op de smalle knoppenkolom) en de stappen van een herstelhint waren algemeen. Nu: kaart krijgt een iets kleinere maar leesbare plek naast het bord, en de stappen noemen de concrete reden (slachtofferregel met namen, of dat het kaartje wel klopt maar de rest niet). | Klaar, te testen op iPad |
| S18b | Binair-iconen bewegen nog op iPad na #87. Isolatietest 2: alleen de SVG-afmeting op hele pixels (`round(74%,1px)`); bord en cellen ongewijzigd. Volgorde bij uitblijven effect: bord op fysieke pixels (devicePixelRatio), dan opacity-animatie en tellergewicht. Eerst schermopname gevraagd. | Open, iPad-test |
| S18c | Iconen bewegen nog op iPad na #91 (hele-pixel SVG), niet op iPhone. Isolatietest 3: kleurovergang (`background-color .12s`) van Binair-cellen uit. Volgende bij uitblijven effect: bord op fysieke pixels, opacity-animatie, tellergewicht, `pick`-markering zelf. | Open, iPad-test |
| S18d | Schermopname 5 nov (iPad, vinger én Pencil): bij het plaatsen of wisselen van een teken schuift het hele bord ~1 px in één frame en 150 ms later terug (frames 156/165, 60 fps); bij wissen niet. Past bij de `binIn`-animatie (opacity) op één SVG. Isolatietest 4: `binIn` uit. Daarna eventueel `innerHTML`-vervanging van de SVG onderzoeken. Bord- en cellafmetingen ongewijzigd. | Open, iPad-test |
| S26 | Homepage bleef op "Je speelt nu solo" na een start zonder verbinding, ook na terugkomen van internet (melding 6 nov). Oorzaak: `getProfile` faalt offline, daarna start `watchProfile` nooit en er was geen herstel bij `online`. Gereproduceerd in testharnas (offline start → online), nu hersteld zonder herstart; regressiecontrole `check-group-online`. Deel 2: de profielcache bewaart nu de lidmaatschappen (ook bij trage start was er ~1,5 s "solo" bij 400 ms per verzoek; nu direct "Groepen laden…"), regressiecontrole `check-group-cache`. Nog open: "info pas goed na bezoek groepspagina" tijdens een trage start (niet apart gemeten). | Deel 1 klaar, te testen op iPad |
| S27 | Wazige bovenrand op iPad/iPhone na iOS-update. Bronnen (Reddit, Modern Web Weekly): iOS 26/27 tekent PWA-inhoud onder de statusbalk en blurt de bovenrand; `theme-color` en `status-bar-style` werken niet; alleen een vast element (>=6 px hoog, >=80% breed, binnen 4 px van de bovenkant) met achtergrondkleur geeft een egale balk. Wij hebben dat al (`#statusfill`), maar het helpt niet. Stap 1: meetpaneel `?statusdebug=1` (ux.js) om op de iPad te zien wat het element en de veilige zone doen. Geen meta-wijziging (vergt opnieuw toevoegen aan beginscherm, risico op verlies van lokale opslag). | Gemeten op iPad (9 nov, ?statusdebug=1): veilige zone 0 px, `#statusfill` hoogte 0 → geen vast element, dus blur. Stap 2: minimale hoogte 6 px (`max(env(safe-area-inset-top),6px)`). iPhone nog te meten. | Opgelost op iPad, bevestigd 9 nov (statusfill 6 px, bovenrand schoon). iPhone nog te meten |
| S13b | Extra 40 px ruimte bovenaan op de iPhone (noodoplossing S13) mogelijk te groot nu het vaste vlak (S27) bestaat. Proef: `?safetop=0..60` zet de extra ruimte per apparaat (bewaard in localStorage), `?safetop=x` zet terug; paneel `?statusdebug=1` toont de waarde en heeft knoppen (−5, −1, +1, +5, 0, Standaard 6) om live te proberen zonder opnieuw te installeren. Gemeten op iPhone (iOS 27, 9 nov): 0 px snijdt de kaartrand af achter #statusfill (6 px), 3 px net niet; gekozen standaard 6 px (was 40 px). Nog te bekijken op andere toestellen. | Open, iPhone-proef |
| S28 | Firestore-reads ver boven de gratis limiet (182K/dag, piek 233K). Oorzaak 1 (gemeten): elke profielmelding startte het scorebord opnieuw en las de hele geschiedenis opnieuw: 7x per koude start. Fix (PR A): startBoard() slaat herstarts over zolang speler, groep, lidmaatschapsdatum en dag gelijk zijn. Meting testomgeving (prod-achtige data, 952+384 docs): koude start 13.155 → 2.467 reads. Daarna PR B: delta-start (alleen nieuwe resultaten ophalen). | Open (PR A klaar) |
| S28b | Delta-start (reads): het scorebord bewaart de laatst gelezen resultaten lokaal (per speler+groep+lidmaatschap, versie 1) en vraagt bij een herstart alleen resultaten van de laatste 7 dagen vóór de laatste geslaagde sync op. Volledige lezing bij: geen/kapotte/andere cache, cache ouder dan 7 dagen, klok teruggezet; daarnaast elke 7 dagen als veiligheidsnet. Bekende beperkingen: resultaten die >7 dagen te laat synchroniseren verschijnen pas bij de volgende volledige lezing; verwijderingen op de server worden niet doorgegeven, ook niet door een volledige lezing, want mergeRows (core.js, ook in pdrows) verwijdert nooit rijen (was al zo; apart onderwerp als verwijderen ooit nodig is). Nog te doen: echte reads in Firebase controleren, twee-apparaten-test. | Open (PR B klaar) |
| S30 | iPhone: terugknop op de persoonlijke pagina deed niets als de pagina niet via de groepspagina was geopend. Oorzaak (gereproduceerd): variabele SCOREORIGIN nergens gedeclareerd, dus ReferenceError bij de eerste klik. Nu gedeclareerd en door showScore op "home" gezet. | Open (PR klaar) |
| S29 | iPhone: de uitslag van Controleren ("Tot nu toe goed") liep over de Home-knop als er iemand online was, omdat de bovenbalk dan te weinig ruimte had (minimumbreedte 80 px). Nu kiest placeCheckMsg de langste tekstvariant die past (volledig, "✓ Goed" of alleen "✓"/"⚠ n"). Gecontroleerd op iPhone-breedtes in de testomgeving; echte iPhone nog door Peter te bekijken. | Open (PR klaar) |
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
| G6 | Versienummer niet meer per PR ophogen: testdeploy stempelt `vN-bBOUW`, `scripts/bump-version.mjs` verhoogt het bronnummer bij een release | GitHub | – | gebouwd, live in v257, praktijkcontrole open | #66 |
| Q1 | Privacyverklaring | tekst | – | open | |
| Q2 | Online-status uit te zetten | zichtbaar | D4 | gebouwd, live in v257, praktijkcontrole open (per apparaat bewaard) | #68 |
| Q3 | Namen en merken op een rij | besluit | – | open | |
| R1 | Rekenraadsels: kilometerteller gevarieerder (nu bijna altijd 100 km; vaker een 9 in het midden of zes cijfers) | rekenraadsels | – (na de livegang, los van Bezemwagen: alleen `raadsels.html`) | open | |
| R2 | Rekenraadsels: meer variatie in soorten sommen (Peters bronlijsten opnieuw aanleveren in `docs/rekenraadsels-bron/`) | rekenraadsels | R1 | open | |
| R3 | Rekenraadsels: uitwerking op 1–3 manieren (proberen · formule · slim redeneren), eerst proef met 10 sommen | rekenraadsels | R1 | open | |
| E1 | Eindcontrole en twee weken spelen | proces | alles | open | |

**Gevonden tijdens het werk** (nieuwe punten hier toevoegen, met datum en wie):

| Datum | Wie | Punt | Voorstel |
| --- | --- | --- | --- |
| 27 okt | Claude | Vangnet: de opslagmelding (“bewaard en gesynchroniseerd” / “bewaard”) hangt af van timing in de nagebootste database en gaf één keer een vals verschil (`ipad-light-bin-controleer`). | In `snapshot.mjs` wachten tot de opslagmelding stabiel is, of die melding in de controle verbergen. Meenemen bij P3. |
| 27 okt | Peter/Claude | v231 (#27) loste de iPhone-hint niet op: de wijziging zat in `placeHint` in `core.js`, maar de hint wordt op alle schermen door `js/layout.js` geplaatst (met `!important`), dus de nieuwe code doet niets. | Dode tak opruimen bij S12; de echte fix in `testChooseCard` (layout.js): de kaart mag op iPhone met de inhoud meegroeien tot ca. 40 % van het scherm, het bord schuift mee omhoog. Testen met het vangnet. |
| 2 nov | Peter | Binair slepen: bij een rij met groene vakjes worden alleen de open vakjes geselecteerd. Gewenst: de hele rij, ook de groene vakjes, wordt groen gemarkeerd. | S14. Oorzaak: de CSS-regel voor vaste vakjes (`body[data-t=bin] #grid .c.g`) won van de groene kleurklassen `.c.dg0`–`.c.dg5`. |
| 2 nov | Peter | Geen verbinding: de knop “Opnieuw proberen” maakt de kop erg hoog, soms over de puzzel heen. Peter twijfelt ook of de status (“gesynchroniseerd”, “op dit apparaat bewaard”, “nog niet gedeeld”) wel zo zichtbaar moet zijn. | Besluit B9. Voorstel: alleen tonen als er iets mis is (offline, opslaan mislukt), als compact icoon in de kop; de uitleg en “Opnieuw proberen” in het menu (⋯). Past bij S1 (“automatisch bewaard” weg). |
| 2 nov | Peter | Home: bij opgeloste puzzels staan nog emoji (⏱ 🎯 💡 📱 🖥️). Hexcells: 🔵 ⚫ bij Blauw en Zwart. Home: persoonlijke kleur mag meer aanwezig zijn, bijvoorbeeld in de achtergrond. | Emoji meenemen in de emojilijst van D3 (🖥️ en 🔵 ⚫ stonden er al, ⏱ 📱 💡 erbij). Persoonlijke kleur in de achtergrond: zit al in D2 en S1. |
| 2 nov | Peter | Profiel: een brede balk bovenaan over de volle breedte, met een eigen achtergrond en een blauwe lijn eronder. | S16. Vermoedelijk de vaste kop van de pagina; eerst meten op iPad en iPhone, ook in de web-app. |
| 2 nov | Peter | iPhone-web-app: de bovenrand vervaagt in alle menupagina's (in Safari niet). | Valt onder S13; bij die stap alle menupagina's meenemen. |
| 2 nov | Peter | Tijdens het puzzelen wil Peter meer info als één persoon online is: in ieder geval de puzzelsoort. Vanaf twee personen te veel; dan “2 online”. | S17. Nu staat er alleen de naam met een groene stip. Koppelen aan Q2 (uitzetten) en aan de bestaande aanwezigheidsgegevens; geen extra Firestore-reads. |
| 2 nov | Peter | Groepspagina's anders indelen en ontwerpen. | Staat al in S2 (en B5). Peter geeft aan wat hij precies anders wil zodra S2 aan de beurt is. |
| 3 nov | Peter | Controleer: de banner met “goed” of “fouten” staat over het bord heen. Nu is er al een korte rand (`checkgood`/`checkbad` in `app.css`, 0,72 s, 4 pt), te kort en te subtiel. Peter wil ook het aantal fouten zien en een korte groene of rode rand om het bord. | S19. Rand ±6 pt plus lichte gloed, ±1,5 s (bij rood langer, tot de volgende aanraking); melding klein onderaan, nooit over het bord; met Beweging verminderen een rand zonder animatie. Vereist S9 (foutmarkering die de kleur laat staan). |
| 3 nov | Peter | Murdoku: kaartjes kunnen markeren (kaartje nog nodig voor een andere persoon, of al gebruikt), alleen eigen apparaat, per persoon. Daarnaast: terug swipen vanaf de linkerrand zoals in andere apps. | S10 samen met T3; nieuw punt S20 (browsergeschiedenis). Beide na de livegang; S20 heeft nadelen (terug kan de app verlaten, stapels geschiedenis, samenspel met dialogen) en wordt eerst gemeten. |
| 3 nov | Peter | Sneltoetsen voor het kleurennonogram (idee b/g/r voor blauw/geel/rood). | D6: cijfers 1 t/m 4, zichtbaar op de knoppen, omdat de kleuren per puzzel verschillen. |
| 4 nov | Peter | Groeps- en profielpagina's anders ontwerpen: de navigatiebalk verdwijnt nu bij Groepen en Profiel; hij moet altijd blijven staan, op de iPhone onderaan, en de pagina's moeten constanter ogen. | S8 uitgebreid (zie die regel); daarna S1, S2 en S16 in die vaste stijl. |
| 1 nov | Peter/Claude | In `js/puzzles/nonogram.js` staat een plaatjesgenerator (`nonoPic`, 20 plaatjes) die nergens wordt aangeroepen. Peter heeft plaatjes geprobeerd en bewust uitgezet: de puzzels werden te simpel (grote, symmetrische vlakken lossen zich bijna vanzelf op). | Dode code: bij het opruimen weghalen. Mocht het idee ooit terugkomen, dan staat het in de geschiedenis van git. Plaatjes als beloning passen beter bij de ColorSweeper-variant van Minesweeper. |
| 1 nov | Peter | Nieuwe puzzel (later): **Schaakpuzzel van de dag** (bijv. “wit geeft mat in twee”, “win een stuk”). Geen volledig schaakspel in de app; leren en samen spelen kan via Lichess. | Puzzels uit de vrij beschikbare Lichess-puzzelverzameling, niveau per dag zoals bij de andere puzzels; zelfde puzzel voor iedereen, met foutloos/zonder hint. Hints in mensentaal (“welk stuk staat onbeschermd?”). Pas later beslissen of samen spelen in de app nog nodig is. |
| 1 nov | Peter | Nieuwe puzzel (later): **Nurikabe** (eilanden met getallen in een zee die één geheel moet zijn, zonder 2×2-blokken water). | Goed te genereren met unieke oplossing; hints in mensentaal (“dit eiland is al vol”, “deze zee raakt anders afgesloten”). Rustige, eigen stijl naast Binair/Star Battle. |
| 1 nov | Peter | Nieuwe puzzel (later): **Liquidum**, liefst in een trein-versie. | Liquidum zelf draait om zwaartekracht in vaten; dat past niet goed bij treinen. Alternatief met hetzelfde “tellen per rij en kolom”-gevoel: **Treinsporen / Tracks** (bekend genre: één spoorlijn van A naar B, getallen langs rand = aantal spoorstukken per rij/kolom). Peter kiest later tussen Liquidum en Tracks. |
| 29 okt | Peter | Nieuwe puzzel (later, ná het verbeteren van de app): **gokvrije Minesweeper** met eigen retro-uitstraling (Windows 95-gevoel, maar eigen smiley, vlag en kleuren). Borden worden door de app zelf met logica opgelost; vastgelopen borden worden aangepast of opnieuw gemaakt. Dagpuzzel met vast open startgebied, zodat iedereen hetzelfde bord heeft. | Oplosser grotendeels hergebruiken van de Hexcells-generator. Moeilijkheid sturen op soort redenering (enkel getal, combinaties, mijnen tellen). Hints zoals bij de andere puzzels. Variant geïnspireerd door ColorSweeper (1 nov): aan het eind ontstaat een plaatje (zoals bij Nonogram) en per dag wisselende regels (bijv. tellers per kleur). Alleen de spelregels als inspiratie; eigen naam, vormgeving en puzzels. |
| 2 nov | Claude | S12: de afgekapte hint zat alleen bij Murdoku op de iPhone (daar is de hint altijd een strook onderaan). Bij Binair, Star Battle, Nonogram en Hexcells zweeft de kaart vrij en past de tekst. De strook onder de vrije kaart (`testChooseCard`, tweede `tray`-tak, als er geen vrije plek is) heeft dezelfde beperking, maar kwam in de vangnetschermen op de iPhone niet voor. | Alleen Murdoku aangepast in de S12-PR. Strook bij andere puzzels nagaan bij kleinere schermen (iPhone SE) voordat daar iets verandert: een hogere strook dekt daar het bord af. De dode tak in `placeHint` (core.js) is nog niet opgeruimd. |
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
| **B8** | Hoe markeer je een Murdoku-aanwijzing als “nog nodig”? (S10) | a) tik wisselt drie standen: open → nog nodig → afgehandeld · b) tik = afstrepen zoals nu, lang indrukken = nog nodig · c) tik = afstrepen zoals nu, plus een klein vlagknopje rechts op elk kaartje | **c)** zichtbaar en zonder nieuw gebaar; bestaande gewoonte (tikken = afstrepen) blijft. |
| **B9** | Hoe zichtbaar is de opslagstatus? (S15) | a) zoals nu, vaste regel in de kop · b) alleen bij een probleem, als compact icoon, uitleg en “Opnieuw proberen” in het menu · c) helemaal geen status | **b)**: rustiger kop, en je ziet het wanneer het ertoe doet. Peter beslist. |
| **B10** | Moet er een penalty of puntensysteem komen voor het aantal gebruikte controles (Controleer)? (Peter 3 nov) | a) zoals nu: onbeperkt en vrij controleren, niets bijhouden · b) vrij controleren, maar het aantal controles stil bijhouden en tonen op de Klaar-kaart (“2 keer gecontroleerd”), eventueel een eigen badge “Zonder controle opgelost”, zonder straf · c) penalty (tijd of punten) | **Nu a), voorstel b) later.** Jullie spelen samen; een straf werkt controleren tegen en vraagt nieuwe regels (per puzzel of per dag, in de tijd of reeks). Een teller op het eigen apparaat kan zonder aanpassing in productie; opslaan in de resultaten kan de Firestore-regels raken (dan eerst Peters akkoord). Opnieuw beoordelen na een paar weken spelen met Aart. **Status: nog niet besloten.** |
| **B11** | Indeling van Puzzel van de dag, dagelijkse puzzels en vrij puzzelen, en wat wordt gedeeld (Peter 4 nov). Aanleiding: Peter ziet bij Hexcells geen vinkje voor Aart omdat die een ander niveau heeft; telefoon en groot scherm hebben andere puzzels. | **Twee onderdelen.** 1) **Vandaag:** per soort één dagpuzzel op het niveau dat je zelf kiest (wordt onthouden); één soort per dag is de **⭐ Puzzel van de dag**, voor iedereen dezelfde en op een vast niveau (zit dus in de lijst, geen apart derde onderdeel). 2) **Vrij puzzelen:** extra puzzels, telt niet voor dag of reeks. **Zien en vergelijken:** het vinkje betekent “deze soort gedaan vandaag”, los van niveau en apparaat; je kunt van elkaar altijd de resultaten zien (tijd, fouten, niveau), van dagpuzzels en van vrije puzzels (lijst Activiteit); tijden worden alleen naast elkaar gezet bij dezelfde soort, hetzelfde niveau en dezelfde bordmaat. **Reeks:** telt voor elke dagpuzzel, niet alleen de ⭐ puzzel. **Niveau (Peter 4 nov):** één vaste instelling per persoon voor de eigen dagpuzzels (Makkelijk, Normaal, Moeilijk), geen aanpassing per dag of per puzzel. De ⭐ Puzzel van de dag heeft voor iedereen één vast niveau (Normaal). **Weekritme** (doordeweeks normaal, weekend moeilijk, eventueel als keuze “Volg de week”) bewust nog niet: eerst zo proberen en later beoordelen. **Apparaat:** telefoon en groot scherm houden eigen bordmaten (het speelplezier op groot scherm blijft); ze tellen wel als dezelfde dagpuzzel. | **Besloten** wat hier staat (Peter 4 nov); uitwerken in S1/S2 en B1-O. **Aanvullingen na meedenken met ChatGPT (4 nov):** (a) drie standen van vergelijken: andere moeilijkheid = beiden klaar met niveau erbij; zelfde niveau maar ander bord = beiden klaar met eigen tijden; exact hetzelfde bord = tijden en fouten rechtstreeks naast elkaar (vereist dezelfde puzzelinhoud, niet alleen dezelfde afmetingen: nakijken bij B1-O). (b) Een onafgemaakte telefoonpuzzel kan niet op de iPad worden hervat als daar een ander bord hoort: de app moet dat duidelijk zeggen. (c) De niveau-instelling is later altijd te wijzigen (niet “definitief”). (d) De ⭐ puzzel heeft één vaste bordgrootte die op iPhone én iPad werkt (iPad toont hem groter, inhoud gelijk); of Normaal een prettige uitdaging is voor beiden: testen. (e) Home: Vandaag (met 🔥 reeks en ⭐), Jouw dagpuzzels (favorieten, rest via “Alle dagpuzzels”), Vrij puzzelen compact; geen uitgebreide vergelijking in de lijst. (f) Groepspagina: één hoofdscherm met per persoon “n/6 dagpuzzels gemaakt” en laatste activiteit; overzicht per soort en uitgebreid vergelijken een niveau dieper (Statistieken). (g) Reeks, bevestigd door Peter (4 nov): één reeks voor de hele app, geen reeks per puzzel; één afgeronde dagpuzzel op een dag = die dag telt voor de reeks; vrij puzzelen telt niet; geen strafpunten of verplichte ⭐ puzzel. (h) Ideeën voor later: een deelbaar resultaat zoals Wordle, zonder de oplossing te verraden; geen ranglijsten of XP. (i) Reads: groepsinformatie zoveel mogelijk uit al opgehaalde resultaten samenstellen, niet per Home-regel apart ophalen. **Besloten 4 nov:** namen blijven **Puzzel van de dag**, **Dagelijkse puzzels** en **Vrij puzzelen**. De ⭐ puzzel is op **Normaal** en krijgt per soort een (bijna) vierkante bordmaat die op iPhone (staand) en iPad (liggend) past, met dezelfde inhoud; de iPad toont hem groter. Voorbeelden om uit te proberen: Binair 12×12, Nonogram 10×10, Hexcells kleinste niveau (op de telefoon al gedraaid getekend); Star Battle, Pluszle en Murdoku zijn al vierkant. **De moeilijkheid moet daarbij ongeveer gelijk blijven aan het huidige Normaal:** meten met de oplosser (welke technieken zijn nodig, hoe lang duurt het) voordat een maat wordt gekozen. **Langere termijn (Peter 4 nov):** formaat en moeilijkheid los van elkaar kiezen, bij elke puzzel; nu hangen ze samen in de niveaus 1 t/m 6. Vereist moeilijkheid die de oplosser meet (techniek) in plaats van bordgrootte; eigen stap na de livegang-periode. **Delen van vrije puzzels:** voorlopig altijd zichtbaar voor de groep; later mogelijk een keuze “niet tonen” (raakt de Firestore-regels: dan eerst Peters akkoord). **Nog open:** de precieze maten van de ⭐ puzzel per soort. |

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


### S9 — Nonogram kleur: foutmarkering die de kleur laat staan

- **Waarom (bug):** bij controleren krijgt een fout vakje een rode achtergrond (`.c.bad{background:#e5484d!important}`). In een kleurnonogram is rood een puzzelkleur: een fout rood vakje blijft even rood, en een fout blauw vakje wordt rood geverfd. Je ziet dus niet wát er fout is, en de markering verandert de ingevulde kleur.
- **Wat:** de foutmarkering vervangt nooit de ingevulde kleur. Voorstel (proef 27 oktober): de eigen kleur blijft, met een donkere arcering, een dikke donkere rand en een klein “!”-rondje in de hoek. Dezelfde stijl voor alle puzzels (Binair, Star Battle, Pluszle, klassieke nonogram), zodat “fout” overal hetzelfde eruitziet; Murdoku gebruikt al een rand.
- Werkt voor kleurenblinden doordat het patroon en het “!” de betekenis dragen, niet de kleur.
- **Vangnet:** `bin-controleer`, `mur-geplaatst`, plus een nieuw scherm met een gecontroleerde kleurnonogram met fouten (toevoegen aan `SCREENS`).
- **Klaar wanneer:** op een kleurnonogram is na controleren elk fout vakje herkenbaar, in elke kleur, in licht en donker; de ingevulde kleur blijft zichtbaar.
- Mag als losse bugfix direct na de stabilisatieperiode, vóór het ontwerpsysteem; in D2 gaat de kleur dan mee in de variabelen.

### S10 — Murdoku: aanwijzing markeren als “nog nodig”

- **Waarom:** nu kun je een aanwijzingskaartje alleen afstrepen (tik). Soms heb je een aanwijzing deels gebruikt maar heb je hem later nog nodig; dat wil je kunnen aangeven zonder hem af te strepen.
- **Wat (besluit B8 = c):** tikken op het kaartje blijft afstrepen zoals nu. Rechts op elk kaartje komt een klein vlaggetje (icoonset D3); dat zet de stand *nog nodig* aan of uit. Een kaartje dat nog nodig is krijgt een gekleurde rand links en een lichte achtergrond. Afgestreept en nog nodig sluiten elkaar uit: afstrepen haalt het vlaggetje weg, en andersom.
- Wordt bewaard en gesynchroniseerd zoals het afstrepen (`S.str`), telt niet als fout of hint, en werkt met touch, Pencil, muis en toetsenbord. Aanraakvlak ≥ 44 px.
- **Vangnet:** `dag-mur`, `hint-mur-*`, `mur-geplaatst`.
- Eventueel later dezelfde stand voor andere aanwijzingen (Nonogram-, Pluszle-, Hexcells-lijnen); niet in deze stap.

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

## 13b. Bekende schuld (pleisters die later echt opgelost moeten worden)

Dit zijn oplossingen die werken en gemeten zijn, maar de oorzaak niet helemaal wegnemen. Ze mogen niet vergeten worden. **Regel:** komt er bij een fix een pleister bij, dan komt hij hier met de stap waarin hij echt opgelost wordt (Peter 3 nov).

| Wat | Waar | Waarom een pleister | Echt oplossen bij |
| --- | --- | --- | --- |
| Tijdvenster bij Undo/Opnieuw met Pencil (`clickAt`/`fastAt`, S21, #71) | `bindFastHistoryButton`, `fastPenUI` in `js/core.js` | Twee mechanismen voeren dezelfde tik uit; de fix houdt ze uit elkaar met een tijdvenster. | D4: één mechanisme voor snelle Pencil-bediening van vaste knoppen |
| Extra 40 px bovenmarge op iPhone-web-app (`--safe-top`, S13, #56/#59) | `css/app.css`, `html[data-standalone]` | Gemeten tegen het iOS-gedrag (vervaging ±95 pt), geen vaste regel. 28 pt-proef staat open. | S1/S5 (kop en schermen), met meting op echt toestel |
| Plek van de Controleer-melding uitrekenen met JavaScript (`placeCheckMsg`, S19c, #69) | `js/core.js` | Meet de balk en valt op smalle iPad terug op over de titel; eigenlijk een ontwerpkwestie. | S5 en D4 (puzzelkop met vaste plek voor meldingen) |
| Ring en foutmarkering omzeilen `!important` (outline i.p.v. box-shadow; hatch met `!important`) | `css/app.css` (`.c.bad`, ring-keyframes) | Bestaande `!important`-regels vergen een omweg. | D5 (`!important` afbouwen) |
| Open vraag, geen pleister: hele Star Battle-puzzel verdwijnt in één keer na undo (opname 3 nov) | – | Niet nagebootst; mogelijk dezelfde oorzaak als S21, niet bewezen. | Opname + meting op een toestel, daarna beslissen |
| Onderzoeksvraag uit onafhankelijke review (4 nov), nog niet aangetoond: `persist()` (elke 3 s) bewaart ook de speeltijd (`el`), waardoor de stand steeds als gewijzigd telt en een nieuwere opslagtijd krijgt, ook zonder zet. Bij dezelfde puzzel op twee apparaten kan een stil apparaat mogelijk voortgang van het spelende apparaat overschrijven | `persist`, `cloudPushProgress` in `js/core.js` | Gerichte test op twee apparaten in de testomgeving (alleen meten, productiegegevens ongemoeid); pas bij een aangetoond probleem een reparatie-PR: een echte bordwijziging onderscheiden van het verstrijken van de speeltijd | Eerste test na v258, vóór nieuwe functies |
| Reads groeien mee met de geschiedenis: luisteraars voor persoonlijke en groepsresultaten zonder beperking tot recent; `loadGroupPlans` haalt alle gedeelde dagplannen op; `pollNu` elke 45 s | `js/firebase.js`, `js/core.js` | Eerst meten (v258 over meerdere dagen, automatische leestest: opstarten, tien minuten niets doen, wisselen tussen apparaten, groeiende historie); dan beslissen over reads stap 2 | Na meting; bij Home/Groepen-ontwerp (S1/S2) rond recente resultaten ontwerpen |

---

## Bijlage — Herkomst van de bevindingen

| Bron | Datum |
| --- | --- |
| Review main en develop, persona's, CSS-metingen | 26 okt 2026 |
| Visuele controle en dekking (PR #21) | 26 okt 2026 |
| Bediening en knopmaten per puzzel | 26 okt 2026 |
| Vergelijking main/develop, kleurmeting, proef persoonlijke kleur | 26 okt 2026 |
| Murdoku-bord, hints (58 hints), teksten (446 regels), snelheid, toegankelijkheid | 27 okt 2026 |
