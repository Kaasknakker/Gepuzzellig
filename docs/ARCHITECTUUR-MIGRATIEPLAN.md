# Grote verbouwing Gepuzzellig — technisch ontwerp en migratieplan

Status: ontwerp, nog niet implementeren  
Doelbranch: `develop`  
Productiebranch: `main` (niet wijzigen vanuit deze fase)  
Testproject: `gepuzzellig-test`

## 1. Bron van waarheid en aangetroffen situatie

Dit document is gebaseerd op inspectie van de actuele repository op 24 oktober 2026. De repository blijft de bron van waarheid; controleer bij iedere vervolgfase opnieuw de actuele code en documentatie.

### Branches en testomgeving

- `main` is productie en gebruikt Firebase-project `gepuzzelig`.
- `develop` is de ontwikkeltak voor de grote verbouwing en gebruikt bij deployment Firebase-project `gepuzzellig-test`.
- `.github/workflows/deploy-test.yml` draait bij pushes naar `develop`, voert regressiechecks uit, bouwt een tijdelijke Hosting-map, vervangt daarin `js/config.js` door `js/config.test.js`, controleert expliciet het test-projectId en deployt alleen Firestore-rules en Hosting naar `gepuzzellig-test`.
- Functions worden bewust niet naar test gedeployed. `functions/index.js` bevat momenteel een productie-URL voor uitnodigingen en verstuurt echte e-mail via Postmark.
- `docs/TESTOMGEVING.md` staat op `develop`; `docs/AI-WERKWIJZE.md` is op `main` en `develop` gelijk.
- Tijdens deze inspectie waren de branches gedivergeerd: `develop` 8 commits vóór en 34 commits achter `main`. Relevante livewijzigingen moeten daarom bewust van `main` naar `develop` worden geïntegreerd; niet blind overschrijven.

### Huidige identiteit en groepen

- Firebase Authentication gebruikt in de webapp alleen Google-login.
- Profielen staan in `profiles/{authUid}`.
- Een profiel bevat onder andere `authUid`, `playerId`, `displayName`, precies één `groupId`, `role`, stijlvelden en uitnodigingsmetadata.
- Nieuwe profielen krijgen momenteel `playerId = "p_" + authUid`; bestaande speciale playerId's zoals `u-peter` bestaan en zijn in rules/code betekenisvol.
- Een gebruiker zonder `groupId` wordt nu naar groeps-onboarding gestuurd; solo gebruik is dus nog geen volwaardig model.
- Groepsleden worden gevonden door `profiles` te queryen op `groupId`.
- Groepen staan in `groups/{groupId}` en hebben één `ownerAuthUid`.
- Een groepscode in `groupInvites/{code}` kan een bestaand profiel momenteel rechtstreeks naar die groep laten overschakelen.
- `accessInvites` regelen toegang tot de app en zijn momenteel gekoppeld aan e-mail/Google en een voorgestelde groep.

### Huidige resultaten en voortgang

- Resultaten staan in `results` en bevatten `uid` (= playerId), `group`, datum, puzzeltype, tijd en kwaliteitsvelden.
- De document-ID is nu `group_date_type_uid`. De groep is dus onderdeel van de opslagidentiteit van een resultaat.
- Status en cloudvoortgang staan in `status/{group_playerId}`; ook deze opslag is groepsgebonden.
- Firestore-rules geven groepsleden leesrechten op resultaten/status van hun huidige groep.
- Lokale voortgang bestaat daarnaast in browseropslag en wordt met cloudvoortgang gesynchroniseerd.
- Statistieken en streaks worden grotendeels uit resultaten afgeleid. Dit is gunstig voor migratie: afgeleide waarden hoeven niet per se als zelfstandige waarheid te worden gemigreerd, maar moeten vóór/na migratie wel worden vergeleken.
- Vrije puzzels coderen aanvullende informatie in het huidige type/resultaatformaat; dagpuzzels kennen apparaatvarianten. Dit moet bij een nieuw resultaatmodel expliciet behouden blijven.

### Puzzelarchitectuur

- `js/puzzle-registry.js` is al de centrale registratie van puzzelsoorten en onderscheidt actieve/inactieve puzzels.
- Puzzelspecifieke spelcode staat al in afzonderlijke modules onder `js/puzzles/`.
- Dit is de juiste basis voor uitbreiding naar 20+ puzzelsoorten; er is geen reden voor een volledig nieuwe puzzelarchitectuur.

## 2. Ontwerpprincipes

1. **Persoon eerst, groepen als relatie.** De duurzame spelidentiteit is `playerId`; `groupId` is nooit onderdeel van de identiteit.
2. **Eén persoonlijk resultaat.** Een gespeelde puzzel wordt eenmaal opgeslagen en via memberships zichtbaar gemaakt aan relevante groepen.
3. **Firebase Auth UID is authenticatie, playerId is domeinidentiteit.** Bestaande playerId's blijven behouden. Nieuwe accounts mogen een stabiele playerId krijgen die niet verandert wanneer een anonieme Firebase-user later een provider koppelt.
4. **Solo is de standaard, groep is optioneel.** Geen membership is een geldige toestand.
5. **Compatibiliteit vóór opschoning.** Tijdens migratie tijdelijk dual-read/compatibiliteitscode gebruiken waar dat risico verlaagt; oude velden pas verwijderen nadat productiegegevens aantoonbaar veilig zijn overgezet.
6. **Geen productiedata uit test promoveren.** Testdata is alleen voor ontwikkeling en migratierepetities. De echte live-migratie leest de dan actuele productiegegevens.
7. **Registry-driven groei.** Metadata voor favorieten, moeilijkheden en tutorials haakt aan op de bestaande puzzle registry.
8. **Sociale vergelijking zonder oneerlijk algemeen klassement.** Vergelijk tijd alleen binnen dezelfde puzzelidentiteit én moeilijkheid.

## 3. Aanbevolen identiteit en authenticatie

### 3.1 Nieuwe speler

Aanbevolen flow:

`app openen → signInAnonymously → naam kiezen → profiel aanmaken → optioneel favorieten/moeilijkheden → Home → spelen`.

Anonymous Authentication moet eerst expliciet in het test-Firebase-project worden ingeschakeld en getest. Niet aannemen dat dit al aanstaat.

Aanbevolen profielcreatie:
- Firestore-document blijft voorlopig `profiles/{authUid}` om de overgang klein te houden.
- `playerId` is een apart stabiel veld.
- Voor nieuwe spelers: genereer een niet-betekenisvolle stabiele `playerId` (bijvoorbeeld `p_<uid>` zolang de Firebase UID behouden blijft).
- Een anonieme gebruiker kan later credentials koppelen aan dezelfde Firebase Auth-user; bij succesvolle linking blijft de Firebase UID en daarmee het profiel behouden.
- Bij provider-conflicten (credential hoort al bij een andere Firebase-user) mag nooit automatisch data worden overschreven. Daarvoor is later een expliciete account-mergeprocedure nodig of een duidelijke fout/ondersteuningsroute.

### 3.2 Bestaande Google-gebruikers

- Zij blijven inloggen op hun bestaande Firebase Auth-account.
- Hun bestaande `profiles/{authUid}` en `playerId` worden behouden.
- De migratie voegt nieuwe profielvelden/preferences en memberships toe, maar maakt geen nieuwe identiteit.
- Speciale bestaande playerId's worden niet hernummerd.

### 3.3 Duurzame inlogmethoden

Aanbevolen volgorde:
1. **Google** behouden als bestaande, makkelijke optie.
2. **E-mail-link (passwordless)** als voorkeurskandidaat naast Google: lage frictie, geen wachtwoordbeheer in de app. Hiervoor moeten Email/Password én Email Link in Firebase expliciet worden geconfigureerd; dit bestaat nu niet in de repository.
3. **E-mail + wachtwoord** technisch mogelijk, maar minder aantrekkelijk voor deze persoonlijke app wegens wachtwoord-UX en resetflow.
4. Apple/Microsoft kunnen later als federated providers worden overwogen als daar echte behoefte aan is; niet nodig voor de eerste migratie.

Bronnen voor vervolgfase:
- https://firebase.google.com/docs/auth/web/anonymous-auth
- https://firebase.google.com/docs/auth/web/account-linking
- https://firebase.google.com/docs/auth/web/email-link-auth

### 3.4 Risico anonieme accounts

Een anonieme login is duurzaam op hetzelfde apparaat zolang de lokale Auth-persistentie behouden blijft, maar is geen herstelbare accountmethode als de browser/appdata verdwijnt. UX moet daarom na enige waardevolle voortgang vriendelijk aanbieden het account te koppelen, zonder dat dit verplicht is om te spelen.

## 4. Voorgesteld datamodel

Dit is het doelmodel. Namen kunnen in implementatiefase nog minimaal worden aangepast als Firestore-query's/indexen daar aantoonbaar baat bij hebben.

### 4.1 `profiles/{authUid}`

Persoons- en accountinstellingen, niet groepslidmaatschap.

```text
authUid
playerId
displayName
createdAt
updatedAt
accountState: "anonymous" | "linked"        # afleidbaar, maar nuttig voor UX indien bewust beheerd
theme
accent
preferences:
  favoritePuzzleTypes: ["bin", "star", ...]
  dailyDifficulty:
    bin: "normal"
    star: "hard"
  onboardingCompletedAt
  pwaPromptDismissedAt?                     # alleen als server-side gewenst
tutorials:
  bin:
    status: "completed" | "skipped"
    completedAt?
    version: 1
```

Opmerking: providerinformatie die Firebase Auth zelf betrouwbaar bezit niet onnodig dupliceren in Firestore.

### 4.2 `players/{playerId}` — aanbevolen dunne publieke identiteit

Aanbevolen als stabiele lookup-laag zodra meerdere groepen bestaan:

```text
playerId
authUid
displayName
createdAt
updatedAt
```

Doel: groepsmemberships en resultaten kunnen stabiel naar `playerId` verwijzen zonder overal private profieldata te hoeven lezen. Als duplicatie van `displayName` ongewenst blijkt, kan dit document nog dunner. `authUid` mag alleen leesbaar zijn waar nodig; security rules moeten dit begrenzen.

### 4.3 `groups/{groupId}`

```text
name
createdAt
updatedAt
theme
accent
murdokuNames
joinCode / invite-config
```

`ownerAuthUid` wordt na overgang geen enige bron van beheer. Beheer komt uit memberships.

### 4.4 `groups/{groupId}/members/{playerId}`

Voorkeursmodel voor goedgekeurde en wachtende lidmaatschappen:

```text
playerId
role: "member" | "admin"
status: "pending" | "approved" | "rejected" | "left"
requestedAt
approvedAt?
joinedAt?             # moment vanaf wanneer groepsresultaten standaard zichtbaar zijn
approvedByPlayerId?
updatedAt
```

Waarom subcollection:
- natuurlijke autorisatie per groep;
- eenvoudig alle leden van één groep ophalen;
- meerdere groepen per persoon zonder profielmutatie;
- meerdere admins mogelijk;
- pending aanvraag is apart van toegang.

Voor “mijn groepen” is een collection-group query op `members` mogelijk, maar rules/indexering kan onnodig complex worden. Daarom is een kleine inverse index aanbevolen:

### 4.5 `playerMemberships/{playerId}/groups/{groupId}`

Alleen een minimale, transactioneel bijgehouden index:

```text
groupId
role
status
joinedAt?
updatedAt
```

Dit is geen tweede bron van waarheid voor groepsbeheer: de canonical membership blijft `groups/{groupId}/members/{playerId}`. Schrijfacties die beide kanten raken horen uiteindelijk via een gecontroleerde serveractie/Function of streng gevalideerde transactionele clientflow te lopen.

### 4.6 `results/{resultId}`

Persoonlijk en groepsonafhankelijk.

```text
playerId
puzzleType
mode: "daily" | "free"
puzzleKey             # stabiele identiteit van de concrete puzzel
date?                 # voor daily
difficulty: "easy" | "normal" | "hard" | legacyLevel
deviceVariant?        # zolang telefoon/groot-scherm inhoudelijk verschillende puzzels kunnen zijn
variant?              # bv. nonogram classic/color
seconds
mistakes
hints
hintSteps
completedAt
completedOn           # indien nodig voor bestaande periode-logica
legacy:
  sourceGroupId?
  sourceResultId?
  sourceType?
```

`resultId` moet deterministisch genoeg zijn om migraties idempotent te maken. Voor gemigreerde records: bijvoorbeeld hash/escape van `playerId + oude document-id`. Voor nieuwe dagresultaten: combinatie van `playerId + puzzleKey + difficulty + variant/deviceVariant`. Leg vóór implementatie exact vast wat “dezelfde puzzel” betekent.

Belangrijk: moeilijkheid wordt een expliciet resultaatveld. Alleen resultaten met dezelfde `puzzleKey` én `difficulty` mogen rechtstreeks op tijd worden gerangschikt. Als devicevarianten verschillende boards opleveren, moeten die óók in de vergelijkingssleutel zitten.

### 4.7 `progress/{playerId}/items/{progressId}`

Persoonlijke openstaande voortgang, los van groep.

```text
playerId
puzzleType
mode
puzzleKey
difficulty
variant?
deviceVariant?
state                   # huidige board/notities/overige bestaande progress payload
progressPercent
startedAt
updatedAt
```

Hiermee verdwijnt cloudvoortgang uit het groepsgebonden `status`-document.

### 4.8 Presence apart van voortgang

De huidige `status` combineert openstaande voortgang, “bezig met dagpuzzel” en online presence. Splits dit:

- `progress/...`: duurzame persoonlijke data.
- `presence/{playerId}` of een vergelijkbare vluchtige structuur: online/puzzelstatus.
- Groepszichtbaarheid van presence wordt via approved memberships bepaald.

Presence is niet migratiekritisch en hoeft niet historisch te worden bewaard.

### 4.9 Tutorials

Tutorialstatus hoort bij de persoon, bijvoorbeeld in `profiles.preferences/tutorials` of een aparte `tutorialProgress/{playerId}` als het later groot wordt. Begin klein in het profiel.

De puzzle registry krijgt later optionele metadata zoals:
```text
supportsDaily
difficulties
defaultFavoriteForNewUsers
tutorialId
tutorialVersion
```

De tutorial-engine zelf krijgt generieke stappen (uitleg, highlight, toegestane actie, validatie, volgende stap) en puzzels leveren alleen tutorialdata/validators. Binair is de pilot; geen tutorialcode per puzzel dupliceren.

## 5. Groepsprivacy en zichtbaarheid

Aanbevolen standaardregel: een approved groepslid ziet van een ander approved lid alleen resultaten waarvan `completedAt/completedOn >= joinedAt` van de bekeken speler voor die groep.

Voordelen:
- sluit aan bij verwachting “vanaf deelname samen puzzelen”;
- oude persoonlijke geschiedenis wordt niet stilzwijgend gedeeld;
- hetzelfde persoonlijke resultaat kan in meerdere groepen zichtbaar zijn zonder kopie.

Technisch nadeel: Firestore Security Rules kunnen relationele tijdsfilters over memberships en willekeurige resultaatqueries complex maken. Een query moet door rules als geheel veilig aantoonbaar zijn; “haal alle persoonlijke resultaten op en filter client-side” is niet acceptabel.

Aanbevolen oplossingsrichting:
- groepsresultaten server-side of via zorgvuldig begrensde query's ophalen op `playerId` + tijdsvenster, waarbij rules membership en `joinedAt` valideren;
- bij schaalproblemen een **afgeleide zichtbaarheid/index** gebruiken die alleen verwijzingen bevat, niet een volledige kopie van het resultaat. Het persoonlijke resultaat blijft canonical.
- geen historische resultaten vóór `joinedAt` tonen tenzij Peter later bewust kiest voor een opt-in “deel eerdere geschiedenis”.

**Open productbeslissing:** blijft “vanaf joinedAt” definitief, of mag een lid optioneel eerdere historie delen? Aanbeveling: start strikt vanaf `joinedAt`; voeg opt-in pas toe als daar behoefte aan blijkt.

## 6. Groepsbeheer en goedkeuring

- Een code/link maakt alleen een `pending` membership/request aan.
- Pending gebruikers blijven volledig solo kunnen spelen.
- Een approved admin keurt goed of wijst af.
- Meerdere admins zijn toegestaan.
- Promote/demote/leave/remove moet atomair controleren dat een approved groep minimaal één admin overhoudt.
- De laatste admin kan zichzelf niet demoten, verwijderen of de groep verlaten totdat een andere approved admin bestaat.
- Voor gevoelige membershipmutaties is een callable Function uiteindelijk veiliger dan complexe client-only multi-documentwrites. Dit is een goede kandidaat voor de fase waarin Functions testveilig worden gemaakt.
- Bestaande `ownerAuthUid` blijft tijdens compatibiliteit bestaan, maar wordt na gecontroleerde migratie alleen legacy of wordt verwijderd wanneer alle beheerflows memberships gebruiken.

## 7. Favorieten, moeilijkheid en catalogus

### Favorieten

- `favoritePuzzleTypes` is persoonlijk.
- Nieuwe puzzeltypes worden niet automatisch favoriet bij bestaande gebruikers.
- Voor nieuwe gebruikers wordt een expliciete starterset gekozen; niet automatisch “alles wat active is”.
- Home toont alleen favoriete dagpuzzels.
- Vrij puzzelen leest alle `active:true` puzzels uit de registry.

### Moeilijkheid

- Per puzzeltype één persoonlijke dagvoorkeur.
- UI-termen bij voorkeur `Makkelijk / Normaal / Moeilijk`.
- Registry vertaalt die drie semantische niveaus naar bestaande generator-levels/devicevarianten waar nodig.
- Een wijziging van voorkeur verandert toekomstige dagpuzzels, niet historische resultaten.
- `puzzleKey` moet garanderen dat “dezelfde puzzel” bij dezelfde moeilijkheid reproduceerbaar/identificeerbaar is.

## 8. Toekomstig groeps-overzicht

### Vandaag

Primair sociaal:
- per persoon: welke gekozen dagpuzzels zijn gespeeld, met moeilijkheid;
- “bezig” waar privacy/presence dit toestaat;
- geen straf voor minder favorieten;
- voltooiing = opgeloste gekozen dagpuzzels / voor die persoon gekozen dagpuzzels voor die dag.

Belangrijk ontwerpdetail: voorkeuren kunnen later wijzigen. Voor eerlijke historische voltooiingspercentages moet bekend zijn welke dagset op die datum voor die persoon gold. Aanbevolen: bij eerste dagactiviteit of daginitialisatie een kleine `dailyPlan`/snapshot vastleggen met de gekozen favorieten en moeilijkheden voor die datum. Anders verandert een historische denominator achteraf wanneer iemand favorieten wijzigt.

### Per puzzel

- filter op puzzeltype;
- groepeer/vergelijk tijd alleen per `puzzleKey + difficulty (+ variant indien inhoudelijk anders)`;
- toon deelname en persoonlijke voortgang zonder één totaalklassement.

### Week / Maand / Jaar / Alles

Gebruik samenvattingen:
- aantal gespeelde/opgeloste gekozen dagpuzzels;
- deelnamepercentage t.o.v. eigen daily plans;
- verdeling per puzzel;
- streak/activiteit;
- gezamenlijke groepsactiviteit.

Vermijd een matrix met alle spelers × alle puzzels × alle dagen voor lange perioden.

## 9. Navigatie en onboarding

Doelstructuur:
- **Home** — persoonlijke dagpuzzels, eigen voortgang, rustige sociale signalen.
- **Vrij puzzelen** — volledige actieve catalogus.
- **Groepen** — memberships, pending aanvragen, groep kiezen/bekijken/beheren.
- **Profiel** — naam, stijl, favorieten, moeilijkheden, tutorials opnieuw starten, account koppelen.

Onboarding:
1. app opent;
2. anonymous auth op achtergrond;
3. naam kiezen;
4. optioneel starter-favorieten en moeilijkheden (met goede defaults en overslaan);
5. Home;
6. eerste tutorial/puzzel;
7. later niet-opdringerig “account beveiligen/koppelen”.

PWA-installatie blijft optioneel. Op iPhone/iPad moet de UX rekening houden met handmatige “Zet op beginscherm”-stappen en mag installatie nooit onboarding blokkeren.

## 10. Compatibiliteitsstrategie

Gebruik een tijdelijke migratielaag met expliciete schema-versies.

Aanbevolen:
- voeg `schemaVersion`/feature capability toe waar nuttig;
- nieuwe code kan tijdens overgang oude én nieuwe records lezen;
- schrijf in een korte gecontroleerde overgang eventueel dual-write, maar alleen als idempotentie en foutafhandeling zijn getest;
- nieuwe canonical opslag pas activeren nadat backfill en rules bewezen zijn;
- oude collecties blijven read-only beschikbaar gedurende verificatie/rollbackperiode;
- verwijder oude velden/collecties pas in een aparte latere cleanup na expliciete goedkeuring.

Vermijd langdurige dual-write: twee bronnen van waarheid zijn risicovol. Gebruik het alleen als tijdelijke brug.

## 11. Gefaseerd implementatieplan

### Fase 0 — ontwerp en veiligheidsbasis (deze fase)

- dit document vastleggen;
- geen functionele architectuurwijziging;
- checks/deployment verifiëren;
- branchesituatie vastleggen.

### Fase 1 — main veilig in develop integreren

**Eerste aanbevolen implementatiefase na dit ontwerp.**

Doel: `develop` eerst op de actuele livebasis brengen vóór architectuurwerk.

- vergelijk `main...develop`;
- merge `main` naar `develop` (niet andersom);
- conflicten per bestand inhoudelijk beoordelen;
- testomgeving-specifieke bestanden en TEST-markering behouden;
- alle regressiechecks draaien;
- testdeploy controleren;
- visueel/functioneel smoke-testen dat test gelijk is aan live plus testmarkering/infrastructuur.

Geen nieuw datamodel in deze fase.

### Fase 2 — datamodel-skelet en rules in test

- nieuwe collections/membershipmodel toevoegen naast legacy;
- geen productiedata verwijderen;
- rules-tests toevoegen voor solo, eigen data, pending, approved member, admin en laatste-adminbescherming;
- registry uitbreiden met niet-zichtbare metadata-contracten indien nodig;
- testdata fixtures maken.

### Fase 3 — anonymous auth + solo profiel in test

- Anonymous provider eerst in `gepuzzellig-test` inschakelen;
- naam-kiezen → solo profiel;
- bestaande Google-testaccounts blijven werken;
- linking anonymous → Google testen met behoud UID/playerId/data;
- account-conflictpad testen;
- nog geen productie-authconfig wijzigen.

### Fase 4 — persoonlijke progress/results in test

- nieuwe persoonlijke `results` en `progress`;
- compatibele readers voor legacy data;
- migratiescript bouwen dat idempotent en dry-runbaar is;
- bestaande resultaatsvelden/devicevarianten/vrije puzzels exact mappen;
- statistieken vóór/na vergelijken.

### Fase 5 — memberships en groepen in test

- meerdere groepen;
- pending/approved;
- meerdere admins;
- laatste-adminbescherming;
- bestaande groupId → approved membership;
- groepscode/link maakt alleen pending request;
- solo blijft bruikbaar.

### Fase 6 — Functions testveilig maken

Pas wanneer serveracties nodig zijn:
- environment/project-aware `APP_URL`;
- testmailstrategie: bij voorkeur mail niet echt versturen of alleen naar expliciete allowlist/sink;
- aparte testsecrets;
- Function-deploy workflow uitsluitend voor `gepuzzellig-test`;
- callable membership/admin-acties waar server-side invariant nodig is;
- nooit productie-Postmarkgedrag vanuit test laten lekken.

### Fase 7 — favorieten, moeilijkheid, daily plan en navigatie

- persoonlijke favorieten;
- per-type dagmoeilijkheid;
- daily-plan snapshot voor eerlijke historische percentages;
- Home / Vrij puzzelen / Groepen / Profiel;
- bestaande puzzle registry als bron;
- geen nieuwe puzzelsoorten nodig om deze architectuur te bewijzen.

### Fase 8 — groeps-overzicht nieuw model

- Vandaag persoonsgericht;
- per-puzzelweergave;
- Dag/Week/Maand/Jaar/Alles;
- vergelijkingstijden alleen binnen identieke puzzleKey/moeilijkheid;
- privacy vanaf joinedAt.

### Fase 9 — generieke tutorials + Binair pilot

- herbruikbare tutorial-engine;
- Binair pilot met kleine stappen;
- skip/restart;
- persoonlijke tutorialstatus.

### Fase 10 — productiemigratierepetitie

Op een **verse export/kopie van actuele productiegegevens**, niet op oude testdata:
- productie-export/back-up;
- migratiescript dry-run;
- aantallen en checksums/aggregaten;
- orphan-detectie;
- mapping profiles/playerId/groups/results/status/progress/preferences;
- vergelijking van statistieken/streaks;
- steekproef actieve accounts;
- rollbackrepetitie.

### Fase 11 — livegang, alleen na expliciete goedkeuring

1. nieuw architectuurwerk eerst volledig bijgewerkt met laatste `main`;
2. korte change freeze of duidelijk cutovermoment;
3. verse productieback-up/export;
4. migratie dry-run tegen die exacte snapshot;
5. rules/functions/config klaarzetten;
6. gecontroleerde migratie van de **dan actuele** productiegegevens;
7. pre/post aantallen en invarianten vergelijken;
8. smoke-tests met bestaande accounts;
9. pas daarna nieuwe client activeren;
10. monitoring;
11. legacy data nog niet verwijderen.

### Fase 12 — cleanup

Pas na stabiele periode en expliciete goedkeuring:
- legacy groupId uit profiel verwijderen;
- legacy groepsgebonden results/status niet meer lezen;
- oude inviteflows verwijderen/ombouwen;
- oude data archiveren/verwijderen volgens apart plan.

## 12. Productiemigratie: harde controles

### Voor migratie

Leg minimaal vast:
- aantal Auth-users (waar toegankelijk);
- aantal profiles en unieke playerId's;
- aantal groups;
- aantal results totaal en per playerId/group/type;
- aantal statusdocs en aantal progress-items daarin;
- lijst orphaned/ongeldige referenties;
- opgeslagen voorkeuren/stijlvelden;
- relevante invite/membershipdata;
- statistiek-samenvatting per actieve gebruiker (aantal resultaten, eerste/laatste datum, streak-inputs);
- export/back-up locatie en herstelprocedure.

### Na migratie

Controleer:
- iedere bestaande playerId exact behouden;
- ieder profiel gemapt;
- ieder bestaand groupId behouden;
- ieder bestaand groepslid heeft approved membership;
- iedere groep heeft minimaal één admin;
- resultaat-aantallen en inhoudelijke mapping;
- geen onbedoelde resultaatduplicaten;
- open voortgang gemapt;
- afgeleide statistieken/streaks gelijk of verklaarbaar;
- privacyquery's geven alleen toegestane data;
- nieuwe productievoortgang sinds eerdere testkopieën is aanwezig.

### Rollback

- migratie is idempotent;
- oude collecties worden tijdens cutover niet destructief gewijzigd voordat nieuwe client is bewezen;
- productie-export blijft beschikbaar;
- client/rules/functions moeten terug te zetten zijn naar de pre-migratie commit/config;
- als postchecks falen: nieuwe writes stoppen/feature uitschakelen, oude client/rules herstellen en diagnose uitvoeren;
- destructieve cleanup nooit onderdeel maken van dezelfde release als de migratie.

## 13. Main → develop synchronisatie tijdens lange verbouwing

Omdat productie doorontwikkelt:

1. vóór iedere nieuwe architectuurfase: `main` met `develop` vergelijken;
2. relevante livewijzigingen eerst **main → develop** integreren;
3. conflicten bewust oplossen; testomgevingbestanden niet overschrijven met productieconfig;
4. checks + testdeploy;
5. pas daarna nieuwe fase implementeren;
6. in documentatie/PR vastleggen tot welke main-SHA develop is gesynchroniseerd.

Aanbevolen cadence: minimaal aan het begin van iedere fase en extra na relevante productiebugfixes. Geen automatische blind merge.

Voor uiteindelijke livegang opnieuw de allerlaatste `main` integreren voordat develop richting productie gaat.

## 14. Technische risico's en afhankelijkheden

- Firestore rules voor “persoonlijke data zichtbaar via membership vanaf joinedAt” zijn complexer dan het huidige groepsfilter; ontwerp queries samen met rules, niet achteraf.
- Resultaatidentiteit moet vóór migratie exact worden gedefinieerd, vooral devicevarianten, vrije puzzels en toekomstige moeilijkheden.
- Huidige lokale browserdata kan nieuwer zijn dan clouddata; migratie van serverdata alleen garandeert niet automatisch elk lokaal onafgemaakt bord. Compatibiliteitscode moet lokale legacy progress kunnen importeren.
- Anonymous Auth zonder gekoppelde provider is apparaatgebonden/herstelgevoelig.
- Account linking kan providerconflicten geven; nooit automatisch twee playerId's samenvoegen.
- De huidige owner-special-case `u-peter` zit in code/rules en moet gecontroleerd worden afgebouwd, niet abrupt verwijderd.
- Functions zijn nu productiegericht en mogen pas na testisolatie worden gebruikt.
- `develop` loopt momenteel achter op `main`; architectuurwerk starten vóór synchronisatie vergroot merge-risico.
- Firestore indexen voor memberships/resultaatqueries moeten tijdens implementatie expliciet worden bepaald en getest.
- De huidige adminpagina leest groepsgebonden results/status; deze moet later naar membership/persoonlijke resultaten worden aangepast.

## 15. Beslissingen die Peter nog moet nemen

Niet blokkerend voor Fase 1; wel vóór de betreffende implementatiefase:

1. **Historische groepsprivacy:** definitief alleen resultaten vanaf `joinedAt` (aanbevolen), of later optioneel eerdere historie delen?
2. **Tweede duurzame login:** e-mail-link naast Google als eerste extra methode (aanbevolen), of voorlopig alleen anonymous + Google?
3. **Starter-favorieten:** welke puzzeltypes krijgen nieuwe spelers standaard op Home? Aanbevolen: kleine starterset, later eenvoudig aanpasbaar.
4. **Dagvoorkeur wijzigen:** geldt een wijziging vanaf de volgende kalenderdag (aanbevolen voor stabiele daily plans) of direct voor vandaag?
5. **Groepsaanvraag:** mogen alle admins aanvragen goedkeuren (aanbevolen) of alleen een specifieke hoofdbeheerder? Het model ondersteunt meerdere admins.
6. **Oude historie delen:** als dit ooit optioneel wordt, is de keuze per groep of globaal? Aanbevolen: per groep.
7. **Vrij puzzelen in groepen:** tellen vrije puzzels mee in sociale periode-overzichten, of alleen in persoonlijke statistieken? Aanbevolen: zichtbaar als activiteit maar niet in voltooiingspercentage.

## 16. Definition of done per vervolgfase

Een fase is pas klaar als:
- actuele `main`-delta vooraf is beoordeeld;
- alleen `develop` is gewijzigd;
- automatische checks groen zijn;
- exacte testdeployment voor de commit is gecontroleerd;
- relevante testscenario's zijn uitgevoerd;
- geen productie-Firebase/config/deploy is geraakt;
- documentatie is bijgewerkt als contract/datamodel verandert.

## 17. Concrete opdracht voor de volgende nieuwe chat

Gebruik:

> **Gepuzzellig start. Fase 1 grote verbouwing: synchroniseer de actuele main veilig naar develop volgens docs/AI-WERKWIJZE.md, docs/TESTOMGEVING.md en docs/ARCHITECTUUR-MIGRATIEPLAN.md. Inspecteer eerst beide branches en los conflicten bewust op. Behoud alle testomgeving-specifieke configuratie en TEST-markering. Implementeer nog geen nieuw datamodel of gebruikersfunctionaliteit. Draai alle bestaande checks, controleer de exacte testdeployment en verifieer dat productie/main en het productie-Firebase-project niet zijn gewijzigd. Rapporteer welke livewijzigingen zijn overgenomen en eventuele conflicten/risico's.**
