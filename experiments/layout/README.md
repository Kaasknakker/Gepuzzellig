# Layoutproef

`proef-layout.html` is een zelfstandige, tijdelijke proef naast de gewone app. De productiepagina, scripts, stylesheet, Firebase-inrichting en service worker blijven ongewijzigd. De proef bevat een snapshot van de bestaande puzzels en hints, met uitsluitend presentatieaanpassingen. Alle testopslag zit in het geheugen van de geopende pagina; herladen wist de proefvoortgang. Firebase wordt niet geladen en de proef registreert geen service worker.

Bron bij eerste bouw: main `6f54f029ff5629379a7a9fb323eb1beec2f5e480`.

- iPhone: oorspronkelijke indeling en oorspronkelijke hoogte van de knoppenstrook; Murdoku-aanwijzingen kunnen scrollen.
- Grotere schermen: begrensde celgrootte, leesbaar Pluszle, Murdoku zonder apart scrollpaneel voor de aanwijzingen.
- Hints: doorschijnende laag met vrijgehouden relevante gebieden; tekstplek wordt vooraf voor de drie stappen bepaald. Alleen de huidige stap wordt gemarkeerd.
- Als er geen geschikte tekstplek is, vervangt de hint tijdelijk de bestaande bediening. Langere uitleg scrolt binnen de vaste kaart.
- Via **Origineel** bekijk je dezelfde puzzel met de bestaande indeling. Via de terugknop kun je Home en overzichten bekijken.

Dit is een proef om te beoordelen, geen definitieve vervanging. Bij wijzigen van vensterformaat mag de tekstplek opnieuw worden bepaald. Op zeer kleine liggende telefoons kan scrollen nodig zijn.

## Bouwen en controleren

Vanuit de repositoryroot:

```sh
node experiments/layout/build.mjs
node experiments/layout/build.mjs --check
node experiments/layout/check.mjs
```

De browsercontrole vereist Playwright. Met `PLAYWRIGHT_CHROMIUM_EXECUTABLE` kan een bestaande Chromium worden gekozen. Geef optioneel een gepubliceerde test-URL mee als argument.

Gecontroleerd met Chromium: 320×667 en 390×844 (telefoon), 820×1180 en 1180×820 (tablet), 3840×2160 (desktop). Alle zes actieve puzzels op hun grootste formaat: 30 borden en 90 hintstappen. Checks: bordbreedte/-hoogte, geen overlap met benodigd hintgebied, vaste bord- en kaartgeometrie, hints voeren niets voortijdig uit, uitklappen/sluiten, begrensd Pluszle, geen afzonderlijke Murdoku-scroll op grote schermen, originele lokale opslag onaangeroerd. Screenshots van telefoon, tablet en desktop visueel bekeken.

Echte Safari-, Apple Pencil- en iOS-veilige-schermrandcontrole blijft gebruikersacceptatie op de apparaten zelf. De browsercontrole simuleert schermformaten; dit is geen claim van fysieke apparaattests.

## Tweede proef na schermafbeeldingen

De eerste proef maakte de velden onnodig kleiner door vaste speelbreedtes, lage celplafonds en een verhoogde telefoonfooter. Deze ingrepen zijn teruggenomen. De bestaande pagina-indeling bepaalt weer de ruimte; alleen werkelijke overschrijding wordt gecorrigeerd. Pluszle en zeer ruime desktops houden een maximumformaat. De lage proefbalk heeft in beide vergelijkstanden dezelfde hoogte, zodat de vergelijking eerlijk is.

Hexcells maakt de hele betrokken lijn of zone helder, inclusief het aanwijzingsvakje. De gaten in de hintlaag volgen de echte zeshoeken; daardoor worden geen halve buurvakjes zichtbaar. De ruimere gebieden van alle hintstappen worden vooraf meegenomen bij de tekstplaatsing. Een later gebied wordt pas bij de bijbehorende stap helder.

Extra regressiecontrole: vergelijk hetzelfde bord met de oorspronkelijke stand, controleer dat de knoppenstrook niet hoger is en dat een passend origineel op telefoon/tablet niet onnodig kleiner wordt (maximaal 3% marge voor randen). Controleer volledige lijn-/zone-dekking en zeshoekige maskeruitsparingen. Visuele controle in donker thema bij 1180×820 en 390×724, inclusief lijn- en zonevoorbeelden.

## Derde proef: gecentreerd bord en ruimere hintgebieden

Proef 3.1 voegt op de iPhone minimaal 12 px ruimte toe tussen de bovenste knoppenstrook en het speelveld. Het speelveld staat verticaal midden tussen bovenste en onderste bediening; bij Murdoku betreft dit het geheel met personen en aanwijzingen. De bestaande maatberekening neemt de tussenruimte mee, zodat hoge borden blijven passen. De originele vergelijkstand en grotere schermen behouden hun afstand.

Op grotere schermen staat het bord zelf horizontaal midden in het scherm en verticaal midden in de beschikbare speelruimte. De bediening staat 12 px naast het bord; bij onvoldoende ruimte komt deze direct onder het bord. Bij Murdoku blijft het raster midden staan, met aanwijzingen rechts. Alleen iPhone gebruikt een scrollend aanwijzingenpaneel.

Pluszle heeft een eigen maximum per puzzelformaat (80/88/96 px op tablet, lager op zeer grote desktops) in plaats van de te kleine vaste limiet van 56 px. De beschikbare schermruimte blijft bepalend. De bestaande iPhone-layout van Hexcells en Nonogram blijft behouden.

De hintlaag houdt hele betrokken kamers bij Murdoku, gebieden bij Star Battle, somgebieden bij Pluszle en vergeleken lijnen met tellers bij Binair helder. Nonogram benadrukt vanaf de uitlegstap het betrokken blokgetal wanneer de afleiding dit aanwijst. De tekstplek houdt vanaf stap één rekening met alle later benodigde gebieden.

De browsercontrole controleert ook exacte horizontale centrering, nabije bediening zonder overlap, volledige hintgebieden en de grotere maar begrensde Pluszle-cellen. De vergelijking op onveranderde telefoonlayouts houdt de bestaande maatcontrole; op grotere schermen wordt de nieuwe centrering en bedieningindeling gecontroleerd.
