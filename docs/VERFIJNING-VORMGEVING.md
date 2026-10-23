# Verfijning van de bestaande vormgeving

23 oktober 2026, bestandsversie 92. De gebruiker heeft het brede herontwerp afgewezen en de onderstaande plaatselijke verfijningen inclusief publicatie goedgekeurd. De bestaande kleuren, achtergronden, puzzelillustraties en indeling blijven het uitgangspunt.

## Aanpassingen

- Star Battle: één doorlopende lijnlaag voor het raster en de gebiedsranden, met een afgeronde buitenrand. Kleuren, vakgroottes en celindices blijven behouden; de celgeometrie houdt rekening met de relatieve bordcontainer.
- Profiel: vaste ruimte tussen de beheerknop, naam opslaan en uitloggen.
- Profiel en groepsbeheer: de sluitknop blijft bereikbaar bij scrollen; de bestaande kleurbolletjes krijgen aanraakvlakken van 44×44 px, benoemde kleuren en een selectiestatus.
- Beide stijlkeuzes tonen direct het echte achtergrondpatroon en accent. De voorbeelden delen de bestaande thema-CSS met Home. Het voorbeeldkaartje is bewust klein: ruim twee derde van het voorbeeldvlak laat de achtergrond zien. Alle veertien thema's blijven beschikbaar, inclusief het wisselende seizoen.
- Groepsbeheer: consequente afstand tussen naamveld, actie en volgende sectie; ruimere acties en afbreekbare uitnodigingscodes.
- Kleine toelichtingen bij instellingen, resultaten en overzichten worden beter leesbaar. Stijlopslag toont de voortgang, bevestiging of fout bij de betreffende stijlkeuze. De bestaande opgeslagen velden en rechten veranderen niet.
- Murdoku: grotere, minder doorschijnende kamernamen; de plaatsingsberekening houdt rekening met de grotere tekst. Bord, muren en illustraties blijven behouden.
- Hintmarkeringen: subtiel okergeel kijkgebied en blauwgroene concrete zet, afgestemd op licht/donker. Gestippelde en dubbele lijnen blijven de betekenis onderscheiden; doelen blijven verborgen tot stap 3. Hexcells gebruikt dezelfde kleuren.

## Controles

- App-, automatische-kruisjes-, hint- en hintafleidingscontroles slagen, inclusief 288 opeenvolgende zetten.
- Stijlvoorbeelden: veertien achtergronden voor profiel en groep, licht/donker, desktop, iPad, iPhone en 320 px. Patronen vergeleken met Home; accentkeuze, 44 px kleurknoppen, knopafstand, sluitknop na scrollen, achtergrondoppervlak en horizontale overloop gecontroleerd.
- Opslagfeedback: profiel- en groepsstijl met nagebootste opslag gecontroleerd voor succes en geweigerde rechten. Dezelfde collectie, identificatie en stijlvelden worden opgeslagen. Geen productieprofielen gewijzigd tijdens deze test.
- Star Battle: licht/donker op desktop, iPad en iPhone, inclusief celbediening, ongedaan maken, hints en gelijke bordafmetingen. De gedeelde celgeometrie is eerder tijdens deze verfijning voor Binair, Star Battle, beide Nonogramvarianten en Pluszle in vijftig browsercombinaties gecontroleerd.
- De volledige hintflow is na de kleurwijziging opnieuw in 42 combinaties gecontroleerd: zeven varianten, licht/donker en desktop/iPad/iPhone, inclusief uitvoeren, heropenen, hervatten, correcties en gesimuleerde Pencil met compatibiliteitsklik.
- Star Battle en Murdoku zijn aanvullend in twintig combinaties met open hint gecontroleerd op celkeuze, stabiele geometrie, vernieuwen en sluiten.

Browsercontroles gebruiken Chromium en gesimuleerde Apple-formaten. Fysieke Safari/Pencil en echte accountopslag zijn hiermee niet als gecontroleerd aangemerkt. De GitHub-check en bestaande Pages-publicatie worden apart voor de uiteindelijke commit gecontroleerd.
