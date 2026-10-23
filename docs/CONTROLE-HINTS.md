# Controle stapsgewijze hints

Datum: 23 oktober 2026. Uitgangspunt: nieuwste main `26b5852acfd0e1401fadb5b72cc6a042553aab44`. Wijzigingen op branch `codex/stapsgewijze-hints`.

## Automatische controles

- `node .github/scripts/check-app.mjs`: geslaagd; scripts, gezamenlijke laadvolgorde, serviceworker-syntax en consistente bestandsversie 87.
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

## Afbakening en openstaande controles

- De oploslogica komt uit de bestaande puzzeloplossers. Deze controle bewijst niet alle mogelijke puzzels, moeilijkheidsgraden en toekomstige generatoruitkomsten.
- Oude resultaten worden zonder verzonnen verdeling getoond. Dit is met representatieve oude gegevens getest, niet door bestaande productieresultaten te wijzigen.
- Fysieke iPhone/iPad, Safari, echte Apple Pencil, VoiceOver en langdurig offline gebruik moeten nog worden gecontroleerd.
- De nieuwe Firestore-regels zijn lokaal aangepast en nagelezen; ze zijn niet in een emulator of tegen productie getest. De bestaande automatische regeldeployment loopt pas bij de daarvoor ingerichte wijziging op main. De client behoudt een compatibiliteitsroute voor oudere regels.
- Het hintvoorbeeld en stijlvoorstel worden ter beoordeling aangeboden; de overige appbrede visuele voorstellen zijn niet uitgevoerd.
- GitHub-checks en eventuele deployment voor de uiteindelijke commit worden apart in de oplevering vermeld. Lokale tests betekenen geen bevestigde productiedeployment.
