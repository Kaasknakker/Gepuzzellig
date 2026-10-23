# Uitvoering van de UX-review

23 oktober 2026. Lokaal uitgewerkt op basis van de actuele GitHub-main `e5ed5907d7119547964df08a1f4e48131ce751bd`. De betrokken appcode daarvan kwam overeen met de lokale basis. Bestaande persoonlijke en groepsstijlen en eerdere documentwijzigingen zijn behouden. Gereedgemaakt voor publicatie als v94. De publicatiestatus volgt uit de bijbehorende GitHub Actions.

## Uitgevoerd

| Reviewonderwerp | Resultaat |
| --- | --- |
| Hervatten | De herkenning van dagelijkse en vrije sessies is hersteld, inclusief niveaus, telefoonsuffixen en kleurnonogram. |
| Alleen potlood | Notities blijven ook bij 0% ingevuld bewaard. Ook eigen Hexcells-markeringen en handmatig afgestreepte aanwijzingen zijn bewaarwaardig werk. |
| Modale vensters | Focus blijft binnen het actieve venster, de achtergrond is tijdelijk niet bedienbaar en de focus keert na sluiten terug. Puzzelsneltoetsen voeren geen acties achter een venster uit. |
| Rekenraadselvalidatie | De volledige invoer wordt gevalideerd. Nederlandse getalnotaties, decimale punten, negatieve waarden en een euroteken voor of na het getal blijven ondersteund. Een punt met precies drie cijfers erachter betekent, zoals eerder, een duizendtalscheiding. Codes behouden voorloopnullen; tijden moeten binnen 00:00–23:59 vallen. Ongeldige schrijfwijzen krijgen invoerhulp zonder foutpunt. Eenheden en berekeningen horen niet in het eindantwoordveld. |
| Fouten en hints | De bestaande deduplicatie uit de recente hintwijzigingen is behouden en gecontroleerd. Dezelfde verkeerde invoer opnieuw controleren telt niet opnieuw. Bediening benoemt het verschil tussen controlefouten, directe Hexcells-pogingen en Murdoku-beschuldigingen. Historische statistieken worden niet herschreven. |
| Opslagfeedback | Bewaren, synchroniseren, mislukte opslag en mislukte synchronisatie krijgen zichtbare feedback en een herstelactie. Opnieuw verbinden probeert delen opnieuw. Verouderde netwerkreacties mogen een nieuwere status niet overschrijven. Bij een mislukte netwerkpoging voorkomt de bestaande minuutgrens dat iedere opslagronde meteen weer uploadt. |
| Apparaten | Lopende telefoonpuzzels blijven bewust lokaal: de varianten en niveaus zijn niet zonder meer uitwisselbaar. De app legt dit nu uit. Resultaten blijven via het bestaande mechanisme gedeeld. De statistieken benoemen dat twee apparaatvarianten samen als één dagpuzzel tellen en bij beide oplossingen het groot-schermresultaat wordt gebruikt. |
| Nieuwe vrije puzzel | Eén keuze: Verder puzzelen of Vervangen, daarna zo nodig niveaukeuze. Annuleren wist niets. Ook willekeurig puzzelen beschermt een bestaande sessie. Vervangen op een ander niveau slaat de vervangen sessie niet alsnog opnieuw op. |
| Willekeurig | Kies de gewenste soorten en de eigen ingestelde niveaus of alle niveaus. De selectie blijft lokaal bewaard. De ingestelde nonogramvariant wordt gevolgd. |
| Voortgang | Percentages heten ingevuld en krijgen uitleg dat ze geen maat zijn voor correctheid. Notities blijven bewaard zonder het percentage te verhogen. |
| Grotere groepen | De beschikbare breedte en naamlengte bepalen wanneer de app samenvat. De groepsstatus staat op een aparte knop naast of onder de eigen puzzelactie. Aantallen slaan op andere groepsleden en de getoonde apparaatvariant. Eén activiteitsmelding opent de actieve leden. De volledige ledenlijst is doorzoekbaar; gelijke namen krijgen een lidnummer. De statistieken hebben een ledenkiezer en uitklapbare groepsgrafieken. |
| Eerste gebruik | Drie korte aanwijzingen per soort en een los oefenvakje dat de echte puzzel niet verandert. De oefenstap blijft opnieuw bereikbaar. Vrij puzzelen blijft beschikbaar om verder te oefenen. |
| Bediening | Binair en Star Battle hebben expliciete kruis/cirkel- of kruis/sterknoppen. Borden van de zes actieve soorten hebben toetsenbordfocus, pijltjesnavigatie en een plaatsactie. Murdoku-keuze, nonogram-/Pluszle-aanwijzingen en Hexcells-lijnaanwijzingen zijn ook via het toetsenbord te bedienen. Kandidaatnotities krijgen volledige namen in de toegankelijke vakbeschrijving. |
| Hexcells | Eigen lijn- en zonemarkeringen ondersteunen Ongedaan en Opnieuw en worden opgeslagen. Onthulde vakjes blijven volgens de spelregels definitief. |
| Vergroting | De viewport blokkeert zoomen niet meer. De borden laten pinch-zoom toe naast de eigen bediening. |
| Formulieren | Knoppen voor aanvragen zijn geblokkeerd zolang de aanvraag loopt. Groepscode en uitnodigingslink worden onderscheiden. Een e-mailfout wordt als verzendfout gemeld; de kopieerbare link blijft beschikbaar. |
| Rekenraadsels hervatten | Antwoord, fouten, hints en voltooiing blijven lokaal behouden. Het laatst geopende vrije rekenraadsel is na herladen weer bereikbaar. Kladpapier gebruikt zijn bestaande opslag. Opslagproblemen worden ook hier gemeld. |

## Controles

- Appcontrole: syntaxis, samen laden, bestaande bestanden en één consistente assetversie (v94).
- Nieuwe vaste regressiecontrole: 188 controles voor sessieherkenning, notities, markeringen, antwoordnotaties, willekeurig en opslagstatus. Opgenomen in de bestaande GitHub-workflow; lokaal uitgevoerd.
- Bestaande controles voor automatische kruisjes, hintregistratie en puzzelspecifieke afleidingen slagen, inclusief 288 opeenvolgende hintzetten.
- Lokale browsercontrole met de echte app en voorbeeldgegevens: 80 routes/controlepunten, waaronder groepen van 2, 5, 10 en 25 leden op 320, 390, 820 en 1280 pixels, grotere tekst, lange en gelijke namen, telefoonlayout, toetsenbord, gesimuleerde aanraking, correcte groepsaantallen, modale focus, aanvraagblokkering, opslagfouten en hervatten van rekenraadsels.
- De echte serviceworker is afzonderlijk met een lokale voorbeeldserver getest: online openen, offline herladen, alleen notities hervatten en opnieuw verbinden.
- Actuele voorbeelden van Home, ledenlijst en telefoonbediening zijn visueel bekeken. De bestaande uitstraling is behouden.

De browsercontroles staan lokaal in `hint-controle/ux-check.cjs` en `hint-controle/ux-offline-check.cjs`, naast de appmap. Ze gebruiken geen productiegegevens en roepen Firebase niet aan.

## Nog in de praktijk controleren

- Safari op echte iPhone/iPad, VoiceOver, echte Apple Pencil, pinch-zoom en langdurig gebruik met grotere tekst.
- Volledige ingelogde route met echte accountopslag, twee apparaten, verlopen uitnodiging en daadwerkelijke e-mailverzending. Netwerkfouten en formulierblokkering zijn lokaal getest; de echte diensten niet.
- Offline starten met een echt eerder gekoppeld Google-profiel. De cache en lokale puzzelopslag zijn getest met een lokaal voorbeeld zonder Google-login.
- Na eventuele publicatie: de GitHub-checks en de bijbehorende deployment voor de exacte gepubliceerde commit. De publicatiecontrole wordt afzonderlijk voor de gepubliceerde commit gerapporteerd.
