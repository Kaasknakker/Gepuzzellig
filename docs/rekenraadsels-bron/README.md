# Rekenraadsels: bronlijsten en nieuwe soorten (R2)

Peter en Aart vinden de verhaaltjessommen van Beter Rekenen (niveau 2F en 3F) de leukste puzzels. Dit document is **ons eigen overzicht van soorten sommen**. Er staan geen teksten, sommen of uitwerkingen van Beter Rekenen in, en de PDF-lijsten zelf staan hier bewust niet. We nemen alleen het *type* som over, met eigen onderwerpen (de familie, treinen, honden) en eigen getallen.

Bronnen (bij Peter, niet in de repository): *Rekenraadseltjes 2F #6* en *Rekenraadseltjes 3F #18*.

## Vergelijking met de bestaande sjablonen

De app heeft nu ongeveer 89 sjablonen in `raadsels.html`. Die dekken al: reizen en inhalen, tegemoet rijden, verhoudingen en mengsels, twee bestellingen met twee onbekenden, leeftijden, wegen, trakteren en verdelen, huisnummers, kaartenhuizen, dobbelstenen, kubussen en bakken water, kgv en veelvouden, klokwijzers, breuken van een rest en de Altijd 6-reeks.

## Nieuwe soorten (gekozen door Peter, 28 oktober 2026)

| Nr | Soort | Kern |
| --- | --- | --- |
| 1 | Op schaal | kaart of plattegrond, werkelijke afstand en omgekeerd |
| 2 | Hectare en are | oppervlakte omrekenen, ontbrekende zijde zoeken |
| 3 | Rechthoek en diagonaal | verhouding 3 : 4, diagonaal, grootste cirkel in een rechthoek |
| 4 | Gemiddelde verandert | iemand komt erbij, samenvoegen, welk cijfer heb je nog nodig |
| 5 | Kortingen na elkaar | korting op korting, btw als percentage, klok die te snel loopt |
| 6 | Twee geheimzinnige getallen | som, verschil en product gegeven; oppervlakte gelijk aan omtrek |
| 7 | Zakken en medailles | meerdere soorten met een totaal en een verband tussen de soorten |
| 8 | Zeker weten | minimaal pakken om zeker twee dezelfde te hebben |
| 9 | Kans | eenvoudige kansen in een verhaal |
| 10 | Dagen en weekdagen | dagen tussen twee data, een weekdag later |
| 11 | Vlucht met tijdsverschil | heen en terug even lang, klokken lopen anders |

Niet gekozen: wip en tandwielen, oude maten en eenheden, binair en Romeinse cijfers.

## Uitleg op meerdere manieren (voor R3)

In de bronlijsten komen steeds dezelfde aanpakken terug. Wij gebruiken drie namen:

1. **Proberen**: een tabelletje, gokken en bijstellen.
2. **Met een vergelijking**: letters of "stel het is x", dan oplossen.
3. **Slim redeneren**: terugrekenen, verhoudingen, een handige vergelijking tussen twee gegevens.

Eén tot drie manieren per som, alleen waar het echt iets toevoegt.

## Regels voor elk nieuw sjabloon

- Eigen tekst, eigen getallen, familie-onderwerpen waar het past.
- Het antwoord klopt bij elke seed, de getallen zijn mooi, en de zoeklus heeft een einde (maximaal aantal pogingen met een vaste terugvaloptie).
- Testen over veel seeds, zoals bij R1 (zie de PR-beschrijving).

## Hoe een som meerdere manieren krijgt (R3, techniek en stijl)

In `raadsels.html` is `uitwerking` van een sjabloon:

- een rijtje stappen (tekst), zoals altijd; of
- een rijtje van rijtjes: elk binnenste rijtje is één manier. De app zet ze onder elkaar met het woord OF ertussen. Manieren hebben geen naam.

Een stap is tekst, of `ts("tekst", kop, rijen)` voor een klein tabelletje (proberen). De uitleg verschijnt direct na een goed antwoord; wie het opgeeft, krijgt hem via "Toon uitwerking".

### Stijl van de uitleg (Peter, 28 oktober 2026)

- **Volgorde:** eerst slim redeneren in gewone woorden over de situatie, dan "met formules" (letters), dan eventueel proberen. Alleen manieren die echt iets toevoegen.
- **Letters eerst uitleggen** ("k is een lege kan"), vergelijkingen nummeren, één bewerking per regel.
- **Controle:** de eerste manier eindigt met een stap die met "Controle" begint: het antwoord ingevuld in elke zin van de som.
- **Zeg "probeer", nooit "gok".** In een proeftabel staat het goede antwoord op de laatste rij, en alleen die rij heeft het label "klopt".
- Korte zinnen, zoals een goede rekendocent. Geen tekst van Beter Rekenen overnemen.

### Eisen bij een extra manier

- Tekst, vraag, antwoord en hints van de som veranderen niet.
- Elke manier eindigt bij hetzelfde antwoord. Rekenstappen als `a × b = c` worden in de test nagerekend.
- Op een iPhone (390 px breed) moet een tabel in beeld passen.

Proef (28 oktober 2026): Twee keer wegen, Twee bestellingen, Moeder en dochter (3 manieren), Leeftijden in de familie, Eerlijk verdelen, Samen klussen, Cacao mengen, Knikkers over, Fietsen huren en Procent meer dan ….
