# Gepuzzellig — rustig en herkenbaar

Voorstel van 23 oktober 2026, gebaseerd op main `26b5852` en het uitgewerkte hintvoorbeeld. Alleen de hints, hun bordmarkeringen en de benodigde hulpregistratie zijn in deze opdracht veranderd. De hieronder beschreven verdere vormgeving wacht op beoordeling.

## Richting

Een warme, lichte basis met één duidelijk accent per handeling. Gezelligheid blijft in de puzzels, persoonlijke achtergronden, groepsstijlen, illustraties en kleine viermomenten. De interface krijgt minder zware lettergewichten, concurrerende kleurvlakken, schaduwen en decoratieve kaders.

De hintkaart laat deze richting concreet zien: een vrijwel neutrale achtergrond met een zachte blauwgroene tint, een dunne lijn, duidelijke tekst en een rustige primaire knop. Kijkgebied en zet verschillen ook in lijnpatroon. Functionele bordkleuren blijven staan.

## Beoordeling van de bestaande schermen

| Onderdeel | Wat nu aandacht vraagt | Voorgestelde toepassing na beoordeling |
| --- | --- | --- |
| Home | Uitgelichte dagpuzzel, gekleurde puzzelpictogrammen, voortgang, badges en achtergrond vragen tegelijk aandacht. Verschillende compacte regels gebruiken kleine, zware tekst. | Eén visueel hoofdpunt: verder puzzelen of de dagpuzzel. Kleur in pictogrammen en voortgang behouden; decoratieve kaartaccenten afzwakken. Rustiger titels en meer vaste tussenruimte. |
| Puzzelborden | Bordkleuren, kamermuren, cijfers, blokaanwijzingen en invulstanden dragen betekenis. Buiten het bord concurreren soms een sterke themarand, gereedschapsknoppen en achtergronddecoratie. | Betekenisvolle kleuren en afmetingen behouden. Eerst de omringende bediening harmoniseren. Bordwijzigingen apart per puzzelsoort beoordelen. |
| Hints | Directe oplossing, felle kaders en wisselende kleurbetekenis per puzzel. Zwevende kaart kan om aandacht en ruimte concurreren. | Uitgevoerd: bewuste opbouw, rustige kaart, gestippeld kijkgebied, dubbele lijn rond de zet, ruimte naast of onder het bord. |
| Persoonlijk overzicht | Veel afzonderlijke accentkleuren in metriekkaarten, pictogramachtergronden en balken. Kleine labels en zware cijfers verschillen sterk in nadruk. | Neutrale metriekkaarten; accent voor selectie en hoofdresultaat. Tijd en aantallen beter uitlijnen. Verdieping onder de bestaande uitklapknoppen behouden. |
| Groepsoverzicht | Persoonskaarten, chips, kalender en grafieken gebruiken elk eigen accenten en afstanden. | Vaste kaartsystematiek. Persoons- en groepskleuren blijven herkenbaar op namen en relevante grafieken; niet elk cijfer krijgt een eigen kleur. |
| Profiel | Formulieren, stijlkeuzes en acties gebruiken wisselende lettergroottes en zeer zware labels. | Zelfde labels, veldhoogtes en knopvolgorde als groepsbeheer. Thema en accent blijven rechtstreeks instelbaar. |
| Groepsbeheer | Uitnodigen, groepsleden, groepsstijl, Murdoku-namen en wisselen van groep hebben vergelijkbare kaders maar verschillende actiegewichten. | Duidelijke sectiekoppen en vaste tussenruimte; één primaire handeling per sectie. Bestaande functies en uitnodigingsflow behouden. |
| Meldingen | Feedback verschijnt in statusregels, gekleurde badges, opgelost-kaarten en formuliermeldingen met verschillende nadruk. | Vier vaste betekenissen: informatie, geslaagd, aandacht, fout. Icoon én tekst; kleur ondersteunt de betekenis. Tijdelijke berichten voldoende lang leesbaar. |

Home, overzicht en puzzel/hintschermen zijn lokaal in de browser bekeken. Profiel, groepsbeheer en hun meldingen zijn op de bestaande HTML/CSS/JavaScript beoordeeld; er is geen ingelogde groepsomgeving gewijzigd of als gecontroleerd gepresenteerd.

## Concrete stijlkeuzes voor de vervolgfase

| Bouwsteen | Voorstel |
| --- | --- |
| Lettertype | Bestaande systeemletter behouden; geen extra webfont. Lopende tekst 15–16 px, regelafstand 1,45–1,55; labels minimaal 12–13 px. |
| Hiërarchie | Schermtitel 24–28 px/700; sectietitel 18–20 px/700; gewone tekst 400; acties 600. Gewicht 800/900 alleen bij een uitzonderlijk hoofdcijfer. Bordcijfers apart beoordelen. |
| Afstanden | Reeks 4, 8, 12, 16, 24, 32 px. Binnen een kaart doorgaans 16 px; tussen secties 24 px. |
| Knoppen | Eén duidelijke primaire knop, rustige secundaire knoppen met dunne lijn, tekstknop voor aanvullende actie. Nieuwe hintacties minimaal 44 px hoog. Bestaande bediening en aanraakgebieden behouden. |
| Kaarten | Hoekradius 14–16 px, lijn 1 px, hooguit één zachte schaduw. Geen stapeling van gekleurde bovenrand, volle achtergrond én zware schaduw. |
| Lichte basis | Bestaand warm wit `#f6f4ef`, witte kaarten, donkere tekst `#1f2430`. Zacht blauwgroen alleen als ondersteunende tint. |
| Donkere basis | Bestaand `#15171c`, kaarten rond `#20232b`, lichte tekst `#ecebe6`. Geen rechtstreekse overname van lichte pastelkleurvlakken; tinten mengen met de donkere kaartkleur. |
| Accenten | Bestaande persoonlijke en groepsaccenten behouden. Decoratief accent, selectie, foutmelding en puzzelkleur krijgen elk een eigen rol. |
| Contrast | Doel: minimaal 4,5:1 voor gewone tekst en 3:1 voor grote tekst en betekenisvolle UI-lijnen. Voor elke nieuwe combinatie meten, inclusief gekleurde puzzelvlakken. |
| Beweging | Alleen korte, functionele overgang; systeemvoorkeur voor minder beweging respecteren. Geen pulserende hintmarkering. |

## Wat deze opdracht gedeeld raakt

- `#hint` en `#hintb`: de hintkaart en hintknop in alle zes actieve puzzelsoorten.
- `.c.ht/.hr`, `.mc.ht/.hr`, `#mclues li.hr` en Hexcells-SVG: uitsluitend actieve hintmarkeringen; functionele vulling, muren, cijfers, symbolen en klikvlakken blijven behouden.
- De ruimteberekening van het speelgebied wanneer een hint openstaat. Op brede schermen een zijpaneel; op smalle schermen een kaart boven de bestaande bediening. Een te groot bord kan binnen zijn eigen gebied scrollen in plaats van onder de hint te vallen.
- Resultaatkaarten en het dagdetail tonen de hulpverdeling. De bestaande compacte badges blijven aantallen tonen; hun toelichting vermeldt de verdeling. Tekst in dagmetingen mag afbreken.
- Resultaten en voortgang bewaren hulpgegevens. De Firestore-regels ondersteunen de nieuwe verdeling; oude resultaten blijven geldig. Een oudere serverregel krijgt tijdelijk het bestaande totaalaantal zonder verdeling aangeboden.
- Er zijn geen algemene lettertypes, persoonlijke achtergronden, groepsaccenten, andere knoppen of overige kaarten herontworpen.

## Aanbevolen volgorde

1. **Hintvoorbeeld beoordelen.** Begrijpelijkheid van de drie stappen, kaarttint, lijnpatronen en ruimte op eigen iPad/iPhone bekijken. Bijsturen vóór verdere toepassing.
2. **Bediening en meldingen.** Knoppen, focus, formulieren en statusmeldingen gelijk trekken. Dit geeft de meeste samenhang met weinig risico voor puzzellogica.
3. **Home.** Nadruk en informatiehiërarchie verbeteren met behoud van dezelfde routes en bediening.
4. **Profiel en groepsbeheer.** Dezelfde formulier- en kaartbouwstenen toepassen; persoonlijke en groepsstijl expliciet behouden.
5. **Overzichten.** Metriekkaarten, chips, tabellen en grafieken op elkaar afstemmen. Hulpverdeling waar nuttig zichtbaar maken zonder ranglijst of strafpunten.
6. **Omgeving van puzzelborden.** Pas na bovenstaande stappen per puzzel beoordelen welke decoratie rustiger kan. Muren, kleurbetekenis, vakgroottes en aanraakgebieden afzonderlijk verifiëren.

Publicatie van de hintwijziging kan via beoordeling van de wijzigingsbranch. De appbrede vervolgstappen worden pas uitgevoerd na akkoord op dit voorbeeld en voorstel.
