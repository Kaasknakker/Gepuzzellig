# Controle stapsgewijze hints

Datum: 23 oktober 2026. Uitgangspunt: nieuwste main `26b5852acfd0e1401fadb5b72cc6a042553aab44`. Wijzigingen op branch `codex/stapsgewijze-hints`.

## Huidige hintbediening — 24 oktober 2026

Deze afspraken vervangen de eerdere presentatiebeschrijvingen hieronder:

1. **Klein duwtje:** markeer een rij, kolom, gekleurd vlak of aanwijzing. Stel een korte kijkvraag.
2. **Denk eens verder:** markeer relevante vakjes en stel een concrete denkvraag, bijvoorbeeld wat er gebeurt als de speler daar een ster probeert. Dit is nog geen uitleg van de volledige zet. Bij telstappen mag een gerichte telvraag de hypothese vervangen.
3. **Volledige hint:** toon de hele afleiding in gewone zinnen, markeer de doelvakjes en bied aan de zet uit te voeren.

Doel: de speler krijgt zelf een AHA-moment. Schrijf waar de speler kijkt, wat al bekend is en waarom daaruit iets volgt. Gebruik rij/kolom/vlak in plaats van abstracte aantallen ‘lijnen en gebieden’. Let op enkelvoud en meervoud. Baseer de tekst en markering op dezelfde bewezen afleiding; verzin geen verklaring en lees bij Hexcells geen verborgen kleuren. Vakjes om over na te denken mogen bij stap 2 gemarkeerd zijn, maar de concrete oplossing en uitvoerknop horen bij stap 3.

## Automatische controles

- `node .github/scripts/check-app.mjs`: geslaagd; scripts, gezamenlijke laadvolgorde, serviceworker-syntax en consistente bestandsversie 89.
- `node .github/scripts/check-autocross.mjs`: geslaagd; bestaande automatische kruisjes, handmatige markeringen en voorkeuren behouden.
- `node .github/scripts/check-hints.mjs`: geslaagd; diepste geopende niveau, één hint bij doorstappen, heropenen, hervatten, oude aantallen, samenvatting en correcties zonder dubbeltelling. Controle op verborgen doelcellen bij Murdoku en Hexcells.
- De nieuwe hintcontrole is toegevoegd aan de bestaande GitHub-check.

## Lokale browsercontrole

Uitgevoerd met een afzonderlijk lokaal browserprofiel in Chrome, zonder Firebase-account of externe gegevens te wijzigen. iPhone en iPad zijn gesimuleerd met hun browserinstellingen; dit is geen test op fysieke Apple-apparaten of Safari.

| Configuratie | Bediening | Weergave | Puzzels |
| --- | --- | --- | --- |
| Desktop 1366 × 900 | Muis | Licht en donker | Alle zes actieve soorten + kleurnonogram |
| iPad staand 820 × 1180 | Gesimuleerde touch | Licht en donker | Alle zes actieve soorten + kleurnonogram |
| iPad liggend 1180 × 820 | Gesimuleerde touch | Licht en donker | Alle zes actieve soorten + kleurnonogram |
| iPhone 390 × 844 | Gesimuleerde touch | Licht en donker | Alle zes actieve soorten + kleurnonogram |

In deze 56 combinaties zijn openen, beide vervolgstappen, registratie als één volledige hint, sluiten/heropenen en uitvoeren van de bestaande zet doorlopen. De resulterende invulling of geopende Hexcells-vakjes is gecontroleerd. De kaart valt binnen het scherm en overlapt het zichtbare speelgebied niet. Schermafbeeldingen zijn lokaal bekeken, waaronder de lichte iPhone, lichte iPad en donkere desktop met Hexcells.

Per configuratie zijn daarnaast een foutieve invoer, Controleer, de correctiehint, opslaan/herladen en opnieuw openen doorlopen. Hetzelfde foutmoment en dezelfde hint blijven eenmaal geteld. Een gesimuleerde pen-pointerreeks plus nageleverde muisklik opent maar één extra niveau.

De eerste schermcontrole vond overlap op de staande iPad bij kleurnonogram en Murdoku. Hiervoor is een onderpaneel met gereserveerde bordruimte toegevoegd. Een vervolgaanpassing houdt het doelgebied zichtbaar binnen een eventueel scrollend bordgebied; dit is opnieuw gericht op deze twee puzzels gecontroleerd.

### Aanscherping na beoordeling: Murdoku

De eerste versie toonde te algemene spelregels bij kijkrichting en redenering. Deze teksten gebruiken nu de echte aanwijzingen en afleidingsredenen uit de bestaande Murdoku-oplosser. Stap 1 noemt de relevante kaartjes en het soort aanwijzing; stap 2 citeert de gebruikte aanwijzingen en legt de toepasselijke uitsluitingen uit. De markering groeit van de belangrijkste kaartjes naar de aanvullende kaartjes. Alleen stap 3 markeert de doelcel.

De automatische controle doorloopt opeenvolgende plaatsingen op alle zes Murdoku-niveaus. Daarbij worden verschillende eerste hints, verborgen doelcoördinaten en het voorkomen van een cirkelredenering gecontroleerd. Voorwaarden uit een hulpafleiding worden niet als uitsluiting voor een andere persoon gepresenteerd. De aangepaste kijkrichting en redenering zijn ook in de lokale webversie bekeken met een hervatte dagpuzzel.

### Aanscherping van de overige puzzels

Ook Binair, Star Battle, Nonogram, Kleurnonogram, Hexcells en Pluszle gebruiken nu gegevens van de daadwerkelijk gekozen techniek. Hiervoor bewaren de bestaande hintoplossers onder meer de betrokken lijn, aantallen, blokgrenzen, combinaties of gebruikte aanwijzingen. De presentatie zoekt deze informatie niet meer op via trefwoorden in de uiteindelijke hinttekst.

- Binair: concrete paren, aantallen per teken, vergelijking met een andere lijn of het aantal geldige aanvullingen.
- Star Battle: geplaatste/ontbrekende sterren, beschikbare plekken, capaciteit van lijnen en gebieden of de tegenspraak uit de afleiding.
- Nonogram/Kleurnonogram: de betreffende lijn en het blok, ruimte om te schuiven, overlap en het aantal passende plaatsingen.
- Pluszle: de betreffende som, reeds omcirkeld totaal, open getallen en de werkelijk toegepaste rekenregel.
- Hexcells: de gebruikte zichtbare aanwijzingen, gevonden en ontbrekende aantallen en beperkingen in hun gedeelde plekken. Een lijngetal krijgt een gestippelde markering. Verborgen doelvakjes blijven in de eerste twee stappen ongemarkeerd. Als de volledige oplosser nodig is, wordt geen korte lokale afleiding verzonnen.

`node .github/scripts/check-hint-guidance.mjs` controleert 288 opeenvolgende hintzetten: acht per puzzelvariant op alle zes niveaus. Gecontroleerd zijn de juistheid van de zetten, tussentellingen, gekozen blokgrenzen, verborgen doelmarkeringen en eenmalige registratie bij doorstappen/heropenen. Aanvullende voorbeelden controleren balans, een lijnvergelijking, groeiende context en het niet uitlezen van onbekende Hexcells-kleuren. Deze controle is toegevoegd aan GitHub Actions.

Een lokale vergelijking met de voorgaande commit bevestigt dat dezelfde 288 zetten worden gekozen. De bestaande zetkeuze en bediening blijven behouden. De volledige browsercontrole met 42 combinaties van puzzelvariant, licht/donker en desktop/iPad/iPhone is opnieuw doorlopen, inclusief uitvoeren, heropenen, hervatten, correcties en gesimuleerde Pencil-klikken. Alle controles slagen. Dit blijft een steekproef en geen bewijs voor elke mogelijke generatoruitkomst.

## Afbakening en openstaande controles

### Aanvulling: stabiel bord bij hints (versie 90)

Een tik buiten de hint sluit deze niet meer vóór de celbepaling. Bordbediening, notities en ongedaan/opnieuw houden het paneel en de bordgeometrie vast. Na een wijziging blijft de uitleg staan, verdwijnen de hintmarkeringen en verschijnt **Vernieuw hint voor dit bord**; een verlopen hint kan geen zet uitvoeren. De sluitknop en hintknop sluiten expliciet. Een passend scrollgebied voorkomt dat een breed bord achter de linkerbediening verdwijnt. Op kleinere liggende iPads houdt het onderpaneel rekening met de verticale linkerbediening.

Gecontroleerd: 70 browsercombinaties (7 puzzelvarianten × licht/donker × desktop 1366×900, iPad 1180×820, iPad 1024×768, iPad 820×1180 en iPhone 390×844). Een echte browserklik/tik verwerkt de vooraf gekozen cel, houdt de celpositie en afmeting gelijk, houdt de hint open en telt geen extra hulp. Hint, bordgebied en bediening overlappen niet. Vernieuwen, expliciet sluiten en het blokkeren van verouderde uitvoering zijn gecontroleerd, ook na opnieuw indelen. De bestaande 42 combinaties voor doorstappen, uitvoeren, heropenen, correcties, hervatten en gesimuleerde Pencil met compatibiliteitsklik slagen eveneens. App-, kruisjes-, hint- en 288 hintafleidingscontroles slagen; de regressie voor verouderde hints is toegevoegd aan de hintcontrole. Dit blijft Chromium met gesimuleerde Apple-formaten; fysieke Safari/Pencil-controles blijven open.

- De oploslogica komt uit de bestaande puzzeloplossers. Deze controle bewijst niet alle mogelijke puzzels, moeilijkheidsgraden en toekomstige generatoruitkomsten.
- Oude resultaten worden zonder verzonnen verdeling getoond. Dit is met representatieve oude gegevens getest, niet door bestaande productieresultaten te wijzigen.
- Fysieke iPhone/iPad, Safari, echte Apple Pencil, VoiceOver en langdurig offline gebruik moeten nog worden gecontroleerd.
- De nieuwe Firestore-regels zijn lokaal aangepast en nagelezen; ze zijn niet in een emulator of tegen productie getest. De bestaande automatische regeldeployment loopt pas bij de daarvoor ingerichte wijziging op main. De client behoudt een compatibiliteitsroute voor oudere regels.
- Het hintvoorbeeld en stijlvoorstel worden ter beoordeling aangeboden; de overige appbrede visuele voorstellen zijn niet uitgevoerd.
- GitHub-checks en eventuele deployment voor de uiteindelijke commit worden apart in de oplevering vermeld. Lokale tests betekenen geen bevestigde productiedeployment.
