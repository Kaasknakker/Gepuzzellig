# AI-werkwijze Gepuzzellig

## Starten in een nieuwe chat

De vaste startzin is **Gepuzzellig start**. Lees dan eerst dit bestand in de GitHub-repository `Kaasknakker/Gepuzzellig` op de nieuwste `main` en pas onderstaande afspraken toe. Oude chats, lokale kopieën en voorgestelde code zijn context; de actuele repository is de bron van waarheid. Als alleen de startzin is gegeven, bevestig kort dat de afspraken zijn gelezen en wacht op de opdracht.

Voorbeeld: `Gepuzzellig start` gevolgd door `bugtemplate: op de iPad doet de terugknop soms niets.`

## Vaste werkwijze

1. Haal de nieuwste `main` op en bekijk eerst de bestaande implementatie, relevante projectafspraken en afhankelijkheden.
2. Bepaal de oorzaak of het gewenste gedrag en maak de kleinste gerichte wijziging volgens bestaande patronen. Behoud niet-gerelateerde functionaliteit en bestaand werk; vermijd onnodige herbouw of opschoning.
3. Voer passende automatische checks uit en controleer het gewijzigde gedrag en regressierisico's. Controleer waar relevant iPad, iPhone en desktop, inclusief touch, muis en Apple Pencil.
4. Controleer na publicatie van appwijzigingen de GitHub-checks en de bijbehorende deployment voor de exacte commit. Meld expliciet wanneer een check of deployment ontbreekt, is overgeslagen, nog loopt of niet te verifiëren is; claim dan geen succesvolle controle. Volg de bestaande deploy-inrichting en start geen ongerelateerde deploys.
5. Rapporteer kort wat is aangepast, wat is gecontroleerd en wat eventueel openstaat.

## Gericht en zuinig werken

Deze afspraken gelden voor alle Gepuzzellig-chats die deze werkwijze volgen.

- Beperk onderzoek tot de concrete opdracht. Pak bij losse verbeterpunten één afgebakend punt tegelijk aan; bij een expliciet gevraagde brede review mag het onderzoek breder zijn.
- Hergebruik eerdere bevindingen en controles waar ze nog geldig zijn. Controleer relevante verschillen met de actuele `main`, zonder het hele onderzoek opnieuw te doen.
- Zoek eerst gericht naar relevante bestanden, functies en regels. Lees alleen de benodigde delen; voorkom grote, ongefilterde code- en tooluitvoer die wordt afgekapt.
- Gebruik alleen hulpmiddelen, browsercontroles en aanvullende bronnen die nodig zijn voor de opdracht. Voer noodzakelijke controles volledig uit; herhaal of verbreed ze alleen bij nieuwe wijzigingen, fouten of concrete onzekerheden.
- Houd voortgangsberichten en eindrapportages kort en begrijpelijk. Maak alleen een uitgebreid rapport wanneer de opdracht daar aanleiding toe geeft.
- Rond het afgesproken werk zelfstandig af. Zuinig werken betekent geen noodzakelijke stappen overslaan of voor iedere deelstap opnieuw toestemming vragen.

## Labels

| Label | Aanvullende werkwijze |
| --- | --- |
| `bugtemplate:` | Onderzoek eerst de oorzaak en maak een minimale fix. Controleer cache, service worker en Firebase wanneer relevant. |
| `nieuwe functionaliteit:` | Bekijk eerst de app-opbouw en voeg de functie toe volgens bestaande patronen; bewaak de bestaande werking op iPad, iPhone en desktop. |
| `aanpassing functionaliteit:` | Vergelijk huidig en gewenst gedrag. Pas het bestaande mechanisme aan en behoud alles wat niet hoeft te veranderen. |
| `visuele wijziging:` | Houd de wijziging lokaal, wijzig logica alleen als dat nodig is en controleer verschillende schermgroottes. |
| `ux:` | Beoordeel consistentie, aantal handelingen, directe feedback en bediening met touch, muis en Pencil. Stel een betere oplossing voor als die het doel beter dient. |
| `technische opschoning:` | Breng eerst afhankelijkheden in kaart; structureer en test gecontroleerd zonder zichtbaar gedrag te veranderen. |
| `review:` | Behandel code of advies van Claude of andere bronnen als voorstel. Vergelijk met de huidige `main`, beoordeel juistheid en regressierisico's en neem alleen passende wijzigingen over binnen de opdracht. |
| `idee:` | Denk eerst mee over UX, gevolgen en haalbaarheid. Voer nog niets door totdat een concrete uitvoering is gevraagd. |

De gebruiker beschrijft het probleem of doel; de passende werkwijze volgt uit het label. Vraag alleen om ontbrekende informatie die nodig is om verantwoord verder te kunnen.
