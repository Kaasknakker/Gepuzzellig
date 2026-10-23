# AI-werkwijze Gepuzzellig

## Starten in een nieuwe chat

De vaste startzin is **Gepuzzellig start**. Lees dan eerst dit bestand in de GitHub-repository `Kaasknakker/Gepuzzellig` op de nieuwste `main` en pas onderstaande afspraken toe. Oude chats, lokale kopieën en voorgestelde code zijn context; de actuele repository is de bron van waarheid. Als alleen de startzin is gegeven, bevestig kort dat de afspraken zijn gelezen en wacht op de opdracht.

Voorbeeld: `Gepuzzellig start` gevolgd door `bugtemplate: op de iPad doet de terugknop soms niets.`

## Vaste werkwijze

1. Haal de nieuwste `main` op en bekijk eerst de bestaande implementatie, relevante projectafspraken en afhankelijkheden.
2. Bepaal de oorzaak of het gewenste gedrag en maak de kleinste gerichte wijziging volgens bestaande patronen. Behoud niet-gerelateerde functionaliteit en bestaand werk; vermijd onnodige herbouw of opschoning.
3. Voer passende automatische checks uit en controleer het gewijzigde gedrag en regressierisico's. Controleer waar relevant iPad, iPhone en desktop, inclusief touch, muis en Apple Pencil.
4. Controleer na publicatie de GitHub-checks en de bijbehorende deployment voor de exacte commit. Meld expliciet wanneer een check of deployment ontbreekt, is overgeslagen, nog loopt of niet te verifiëren is; claim dan geen succesvolle controle. Volg de bestaande deploy-inrichting en start geen ongerelateerde deploys.
5. Rapporteer kort wat is aangepast, wat is gecontroleerd en wat eventueel openstaat.

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
