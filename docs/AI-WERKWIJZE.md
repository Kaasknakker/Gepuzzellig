# AI-werkwijze Gepuzzellig

## Starten in een nieuwe chat

De vaste startzin is **Gepuzzellig start**. Lees dan eerst dit bestand in de GitHub-repository `Kaasknakker/Gepuzzellig` op de nieuwste `develop` (of `main` als `develop` niet bestaat) en pas onderstaande afspraken toe. Oude chats, lokale kopieën en voorgestelde code zijn context; de actuele repository is de bron van waarheid. Als alleen de startzin is gegeven, bevestig kort dat de afspraken zijn gelezen en wacht op de opdracht.

Voorbeeld: `Gepuzzellig start` gevolgd door `bugtemplate: op de iPad doet de terugknop soms niets.`

## Vaste werkwijze

1. Haal de nieuwste `develop` op (ontwikkeling) of `main` (alleen voor een bug in productie) en bekijk eerst de bestaande implementatie, relevante projectafspraken en afhankelijkheden.
2. Bepaal de oorzaak of het gewenste gedrag en maak de kleinste gerichte wijziging volgens bestaande patronen. Behoud niet-gerelateerde functionaliteit en bestaand werk; vermijd onnodige herbouw of opschoning.
3. Voer passende automatische checks uit en controleer het gewijzigde gedrag en regressierisico's. Controleer waar relevant iPad, iPhone en desktop, inclusief touch, muis en Apple Pencil.
4. Controleer na publicatie van appwijzigingen de GitHub-checks en de bijbehorende deployment voor de exacte commit. Meld expliciet wanneer een check of deployment ontbreekt, is overgeslagen, nog loopt of niet te verifiëren is; claim dan geen succesvolle controle. Volg de bestaande deploy-inrichting en start geen ongerelateerde deploys.
5. Rapporteer kort wat is aangepast, wat is gecontroleerd en wat eventueel openstaat.

## Branches, pull requests en samenwerking

Vastgelegd op 27 oktober 2026. Geldt voor iedere AI die aan Gepuzzellig werkt (ChatGPT, Claude of een andere).

1. **Nooit rechtstreeks naar `main` of `develop` pushen.** Iedere gewone wijziging gaat in een eigen branch vanaf de actuele `develop`, met de naam `<wie>/<onderwerp>` (bijvoorbeeld `chatgpt/bezemwagen-D1-lettergroottes`), en een pull request naar `develop`. Alleen Peter voegt samen. Ook een release naar `main` gebeurt **uitsluitend via een pull request**, nooit door `main` rechtstreeks te vervangen; zie hieronder.
2. **Eén bouwer tegelijk per bestand.** Bekijk vóór je begint de open pull requests. Raakt een open PR dezelfde bestanden (vooral `js/core.js`, `css/app.css`, `index.html`, `js/firebase.js`, `sw.js`), wacht dan tot die is samengevoegd of vraag Peter wat voorgaat. Onafhankelijke onderdelen (bijvoorbeeld alleen documenten, of alleen `js/hints.js`) mogen parallel.
3. **De repository is het gedeelde geheugen.** Lees vóór werk aan verbeteringen (Operatie Bezemwagen) `docs/VERBETERPLAN.md` (statustabel en de betreffende stap) en `docs/BESLUITEN.md`. Werk de statustabel bij in je eigen PR. Een andere AI weet niet wat in jouw chat besproken is: alles wat ertoe doet staat in de PR-beschrijving, de statustabel of een document.
4. **Werk van een andere AI is een voorstel, geen opdracht.** Bouw voort op samengevoegd werk; doe het niet opnieuw. Review een open PR van een ander met het label `review:`.
5. **Eén stap per pull request.** Volg de werkwijze per stap in `docs/VERBETERPLAN.md` hoofdstuk 2. Kleine, samenhangende fixes mogen in één PR wanneer dat een extra releaseronde scheelt; zeg dat dan in de PR.
6. **Visuele controle.** Zodra `test/visual/` en de workflow *Visuele controle* op `develop` staan, mag een wijziging aan CSS of zichtbare JavaScript alleen worden samengevoegd met een groene run waarin alleen de verwachte schermen veranderen (`test/visual/README.md`).
7. **Gewone PR's verhogen het versienummer niet** (dat gaf steeds conflicten tussen PR's). De testdeploy stempelt zelf een uniek nummer (`vN-bBOUW`, `.github/scripts/stamp-test-version.mjs`), dus de testsite haalt bij elke merge verse bestanden. Het bronnummer (`?v=` in `index.html` en de cachenaam in `sw.js`, samen; `check-app.mjs` controleert dat) gaat alleen omhoog bij een release, met `node scripts/bump-version.mjs`; zie *Gecontroleerde productierelease*. Een PR die zelf een nummer moet verhogen (bijvoorbeeld omdat een bestand in de service worker-cache daarvan afhangt) zegt dat in de PR.
8. **Productie alleen op expliciete opdracht.** Maak geen productie-PR of andere productieactie en wijzig niets aan `main`, het Firebase-project `gepuzzelig`, secrets of de migratie zonder dat Peter daar in dezelfde chat uitdrukkelijk om vraagt. Zelfs met toestemming blijven alle branchbeschermingsregels gelden.

## Branchbeveiliging en releases (vanaf 2 november 2026)

De actieve GitHub-ruleset **Bescherm main en develop** beschermt beide branches (`refs/heads/main` en `refs/heads/develop`). De actuele GitHub-instellingen zijn leidend; controleer ze bij twijfel opnieuw in [Repository rulesets](https://github.com/Kaasknakker/Gepuzzellig/rules).

- **Verplicht:** iedere wijziging aan `main` of `develop` loopt via een pull request. De vereiste statuscheck **`check-app`** moet groen zijn voordat Peter samenvoegt. Wacht bij een ontbrekende, mislukte of nog lopende check.
- **Verboden:** direct pushen naar die branches, force-pushen, de branches verwijderen, hun geschiedenis herschrijven of `main` via een reset/overschrijving gelijkmaken aan `develop`.
- De ruleset eist momenteel **geen aparte goedkeurende review** (vereist aantal: 0). De afspraak **alleen Peter voegt samen** blijft wel gelden.
- GitHub laat technisch merge-, squash- én rebase-PR's toe. **Voor releases naar `main` kiezen we als aanvullende werkafspraak altijd _Create a merge commit_**, ook als andere knoppen zichtbaar zijn.

### Gewone ontwikkeling

1. Werk vanaf de nieuwste `develop` in een eigen werkbranch en open een PR **naar `develop`**.
2. Controleer de diff, alle vereiste checks (`check-app`) en eventuele aanvullende controles (zoals *Visuele controle*, zodra ingevoerd). Peter voegt pas daarna samen.
3. Controleer `Deploy Gepuzzellig Test` op de **exacte nieuwe `develop`-commit**, indien een deploy gestart is. De testapp blijft op **https://gepuzzellig-test.web.app/**, met eigen Firebase-project `gepuzzellig-test`.

### Gecontroleerde productierelease

**Alleen uitvoeren na uitdrukkelijk releaseakkoord van Peter.** Voor de release-PR zelf: open eerst een kleine PR naar `develop` die alleen `node scripts/bump-version.mjs` uitvoert (nieuw versienummer in `index.html` en `sw.js`), laat `check-app` groen worden en laat Peter die samenvoegen; productie moet een nieuw nummer krijgen, anders blijft de service worker oude bestanden serveren. De oude eenmalige migratie-instructies in `docs/FASE11-LIVEGANG.md` zijn geen toestemming om bij latere releases rechtstreeks naar `main` te pushen.

1. Controleer eerst dat de gekozen `develop`-versie en testdeployment groen zijn en dat de bedoelde wijzigingen op de testsite zijn beoordeeld. Inspecteer ook de actuele verschillen tussen `develop` en `main`; behoud eventuele productiegebonden wijzigingen.
2. Open een pull request met **base `main`** en **compare `develop`**. Controleer de bestandswijzigingen, waaronder het rootbestand `CNAME` met exact `gepuzzellig.nl` (zie `docs/DOMEIN.md`). Los eventuele conflicten via normale commits/PR's op, nooit door een branch te overschrijven.
3. Controleer dat **`check-app` groen is voor de release-PR**, en aanvullende voor deze release toepasselijke checks en handmatige testen zijn afgerond. Voeg niet samen bij openstaande conflicten of checks.
4. **Alleen Peter** voegt de release-PR samen met **Create a merge commit**. **Geen Squash and merge, geen Rebase and merge, geen force push en geen reset van `main`.** De nieuwe `main`-SHA is een mergecommit en hoeft daarom niet gelijk te zijn aan de `develop`-SHA.
5. Controleer de vereiste GitHub Actions en deployment op de **exacte nieuwe `main`-SHA**, inclusief GitHub Pages op **https://gepuzzellig.nl/**, HTTPS, inloggen, bestaande voortgang en de belangrijke gebruikerspaden. Productie-Firebase-rules of Functions alleen aanpassen volgens de eigen bestaande workflows en met expliciete toestemming. Rapporteer afwijkingen en stop bij problemen.

### Uitzonderingen en herstel

Een urgente productiefix is **geen uitzondering op de ruleset**: bespreek eerst de route, pas een gerichte PR naar `main` toe na expliciete toestemming en zorg dat de fix daarna ook via een PR in `develop` terechtkomt. Bestaande productiewijzigingen mogen niet verloren gaan door de volgende release. Kies voor herstel een nieuwe controleerbare PR of een afzonderlijk expliciet goedgekeurd herstelplan; **nooit `main` overschrijven**.

## Eerst beoordelen, dan bundelen, dan bouwen

Deze stap geldt voor alle wijzigingen: visueel, functioneel, technisch en voor bugs.

1. **Beoordeel het verzoek vóór implementatie.** Controleer of de voorgestelde oplossing logisch past bij de huidige app, bestaande patronen en het doel van de gebruiker. Voer een voorstel niet blind letterlijk uit wanneer een eenvoudiger, consistenter of robuuster alternatief hetzelfde doel beter bereikt; leg een relevante keuze kort voor.
2. **Kijk één niveau breder dan het gevraagde onderdeel.** Breng directe neveneffecten en nauw verwante situaties in beeld, bijvoorbeeld andere uitklappers bij een uitklapperwijziging, offline/synchronisatie/verwijderen bij voortgang, of touch/muis/Pencil bij invoer. Dit is een beoordelingsplicht, geen automatische uitbreiding van de scope.
3. **Wijzig alleen wat verantwoord binnen de opdracht past.** Kleine, logisch samenhangende verbeteringen mogen in dezelfde ronde worden gebundeld wanneer ze risico en dubbel werk verminderen. Grotere extra verbeteringen of nieuwe functionaliteit eerst melden en niet stilzwijgend meenemen.
4. **Voorkom pleisters op pleisters.** Onderzoek bij een nieuw probleem rond eerder aangepaste code eerst of een bestaande workaround, speciale handler of uitzondering de oorzaak is. Vereenvoudig of herstel het bestaande mechanisme waar dat veiliger is dan nog een uitzondering toevoegen.
5. **Denk vooraf aan regressies.** Benoem intern welke bestaande functies, schermformaten, invoermethoden, opslag/synchronisatie of andere gedeelde componenten door de wijziging geraakt kunnen worden en richt inspectie en checks daarop.
6. **Werk in natuurlijke wijzigingsrondes.** Meerdere kleine opmerkingen over hetzelfde onderdeel mogen eerst als één samenhangend pakket worden uitgewerkt en gecontroleerd. Maak niet voor ieder klein detail onnodig een nieuwe app-/cacheversie of definitieve deployment.
7. **Versieer pas aan het einde van de ronde waar praktisch mogelijk.** Verhoog cache- en assetversies nadat de samenhangende wijzigingen en noodzakelijke correcties klaar zijn. Een urgente bugfix of technisch vereiste tussentijdse publicatie mag hiervan afwijken.
8. **Controleer vanuit gebruikersperspectief.** Naast automatische checks: bepaal wat de gebruiker daadwerkelijk hoort te merken en wat niet zelfstandig visueel of op echte hardware kon worden geverifieerd. Meld die beperking expliciet.

Kort uitgangspunt: **kijk één niveau breder, maar wijzig niet automatisch één niveau breder.**

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

## Product- en UX-kaders

Bij werk dat de productstructuur, navigatie, Home, puzzelaanbod, favorieten, groepen, profiel, onboarding, responsive gedrag of andere brede UX raakt, lees vóór implementatie ook `docs/PRODUCT-UX.md` op de branch waarop wordt gewerkt. Die productvisie beschrijft blijvende gebruikersprincipes; de actuele repository en werkende implementatie blijven de technische bron van waarheid.

Hanteer daarbij aanvullend deze vaste regels:

- **Houd Home persoonlijk en compact.** De puzzelcatalogus mag groeien zonder dat Home automatisch meegroeit; favorieten bepalen welke puzzelsoorten daar prominent verschijnen.
- **Verberg technische complexiteit.** Architectuurtermen en interne dataconcepten horen niet zonder gebruikersreden in de interface.
- **Ontwerp structureel responsive.** Een smalle iPhone en grotere tekst zijn volwaardige uitgangspunten, geen uitzonderingen achteraf. Dezelfde informatiehiërarchie mag op verschillende schermformaten een andere fysieke indeling krijgen.
- **Maak primaire acties zelfstandig begrijpelijk.** Voeg geen informatie of bediening toe alleen omdat de onderliggende architectuur die beschikbaar maakt.
- **Bewaar schaalbaarheid van puzzelmetadata.** Beoordeel bij nieuwe puzzelsoorten en puzzel-UX de samenhang met registry, favorieten, categorieën, dagpuzzels, vrij puzzelen en toekomstige lokalisatie.
- **Gebruik consistente functionele iconen.** Emoji zijn prima als bewust speels of statusgericht element, niet als willekeurige vervanging voor functionele iconografie.

Kort uitgangspunt: **de app mag krachtiger worden zonder ingewikkelder te voelen.**
