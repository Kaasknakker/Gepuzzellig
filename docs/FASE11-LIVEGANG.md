# Fase 11 — gecontroleerde migratie en herstel

Status: tooling op develop. Productie is niet gemigreerd. Een geslaagde synthetische repetitie vervangt geen actuele productie-export, hardwaretest of expliciet productieakkoord.

## Veiligheidsgrens

Alle productiecommando's hieronder zijn een draaiboek voor later. Ze zijn niet tijdens de voorbereiding uitgevoerd. Nieuwe toestemming blijft nodig na een groen rapport voor de actuele bron. Testdata wordt nooit naar productie gepromoveerd. Legacy results/status, groepen en uitnodigingen worden niet verwijderd.

## Voorbereiden en freeze

1. Leg de volledige release-SHA vast en werk vanuit die schone checkout. Beoordeel de laatste main-delta; main blijft productie tot afzonderlijk goedgekeurde activatie.
2. Bewaar en verifieer de huidige client, gedeployde rules, Functionsversie en Auth-providerconfiguratie als lokale herstelartefacten, met SHA-256. De huidige repo-inhoud alleen bewijst niet welke versie daadwerkelijk gedeployed staat. Controleer toegang tot deze back-ups en de herstelbevoegdheden.
3. Plan het korte onderhoudsvenster en stop oude clients/PWA's en nieuwe registraties/accountkoppelingen. Bereid de expliciete tijdelijke freeze voor. `firebase.freeze.json` verwijst naar deny-all clientrules; deployen hiervan gebeurt uitsluitend na productieakkoord en met expliciet project `gepuzzelig`. Dit veroorzaakt tijdelijke onbeschikbaarheid. Admin SDK kan daarna de gecontroleerde migratie uitvoeren. De normale develop-deploy gebruikt deze freezeconfig niet.
4. Verifieer de daadwerkelijke freeze en noteer het tijdstip. Maak daarna een verse volledige read-only Firestore/Auth-inventaris met `snapshot-production-firestore.mjs --project gepuzzelig --output <nieuw-snapshot.json>`. De tool neemt alle collecties/subcollecties mee en bewaart onder meer Timestamp-nanoseconden, bytes en referenties. Onbekende datatypes/unsafe integers stoppen de export. De Auth-inventaris is geen gerepeteerde Auth-restore; de migratie doet geen Auth-writes. Bewaar waar nodig daarnaast de beheerde Firebase/Google-back-ups volgens het productieherstelbeleid.
5. Draai `rehearse-production-migration.mjs <snapshot.json>` en beoordeel iedere blocker, telling, aggregaat en privacyuitkomst. Alleen bij groen genereer je met hetzelfde commando plus `--apply` de lokale `*-phase10.json` en `*-phase10-report.json`. Dit schrijft uitsluitend lokale bestanden.

De snapshot, kandidaat, rapporten, runtimeback-ups en journals bevatten privégegevens. Bewaar ze buiten de repository en de Hosting-map; voeg ze nooit aan GitHub toe. De exporttool print alleen hashes/aantallen. Een nieuwe eerste apply weigert snapshots ouder dan 24 uur. Hervatten/herstel gebruikt altijd de oorspronkelijke bron en het journal, ook als die inmiddels ouder zijn; vervang de bron dan niet door een export van een half gemigreerde database.

## Wat preflight hard controleert

- unieke playerIds, stabiele profiel/Auth-UID-koppeling en registry;
- bestaande profielen en ondersteunde voorkeuren, inclusief tutorialstatus, favorieten en moeilijkheid;
- resultaten: volledige inhoudelijke equivalentie bij deduplicatie; een verschil in bijvoorbeeld afrondingsdag/timestamps is een blocker;
- resultaataggregaten en data, voortgangscollisies, geldige persoonlijke eigenaar en documentpaden;
- bestaande canonical data: bewaren, met STOP bij botsing met de legacyomzetting;
- memberships/inverse indexen en minimaal één goedgekeurde admin per groep; geen stilzwijgende keuze van een willekeurige vervangende eigenaar;
- bestaande persoonlijke dagplannen en veilige sociale projecties;
- volledige snapshot/source-overeenkomst en aanwezigheid van ieder profiel in de Auth-inventaris;
- koppeling aan exacte bronhash, kandidaathash, releasecommit en toolinghash. De live-writer rekent de kandidaat opnieuw uit; een handmatig groengemaakt rapport volstaat niet.

Ontbrekende toetredingshistorie wordt niet verzonnen. Voor nog te migreren legacygroepen geldt bij een volledige snapshot conservatief de snapshotdatum als joinedAt. Oude persoonlijke resultaten blijven behouden, maar onbewijsbare historische groepsactiviteit wordt niet automatisch gedeeld. Bestaande canonical memberships en hun joinedAt blijven behouden. Het rapport meldt hoeveel sociale records daardoor worden overgeslagen. Beoordeel dit expliciet; de oude fase-10-uitkomst is geen toezegging dat het sociale dashboard dezelfde historische telling houdt.

## Readinessmanifest

Maak na verificatie een lokaal JSON-bestand met `version:1`, de volledige `releaseCommit`, `sourceSha256`, `freezeConfirmed:true`, `preClient:true`, en `freezeStartedAt` (ISO-tijd vóór de snapshot). `runtimeBackups` bevat voor elk van `client`, `rules`, `functions`, `authConfig` een `file` (relatief aan het manifest of absoluut) en de werkelijke `sha256` van dat bestand. De schrijver verifieert die bestanden/hashes. De menselijke controle moet bevestigen dat dit de werkelijk gedeployde herstelversies zijn; hashes bewijzen alleen dat de gecontroleerde bestanden niet gewijzigd zijn.

## Gecontroleerde apply vóór clientactivatie

Eerst offline het exacte plan bekijken:

    node scripts/apply-production-migration.mjs <candidate.json> --project gepuzzelig --source <snapshot.json> --report <report.json> --release <volledige-SHA>

Dit maakt geen Firebase-verbinding. Pas na beoordeling en expliciet productieakkoord dezelfde opdracht uitvoeren met:

    --apply --confirm-project gepuzzelig --confirm-freeze --confirm-pre-client --readiness <readiness.json> --journal <nieuw-journal.json>

De schrijver controleert actuele Auth-identiteiten/providers en alle Firestore-documenten tegen de bron. Onbekende/nieuwere data = STOP. Vóór de eerste wijziging wordt een geflusht journal met exacte before-images opgeslagen. Elke transactie leest en controleert de betrokken documenten opnieuw voordat zij schrijft. Maximaal 100 documenten en een conservatief groottebudget per transactie. De writer schrijft profielen, registry, memberships/indexen, persoonlijke resultaten/progress/dagplannen en veilige sociale projecties. Bestaande brondata buiten dat plan blijft onaangeroerd.

Na onderbreking mag alleen dezelfde opdracht met dezelfde bron, kandidaat, release en hetzelfde journal worden hervat. Een commit kan al geslaagd zijn voordat de lokale cursor is bijgewerkt; de documentcontrole maakt ook dat geval herhaalbaar. Een afgerond of gedeeltelijk hersteld journal mag niet worden hergebruikt voor een nieuwe applyronde.

De schrijver vergelijkt alle geplande documenten en de overige bron opnieuw en meldt pas daarna `applied`. Auth-identiteiten/providers worden ook na afloop vergeleken. Dat vervangt geen afzonderlijke menselijke controle van profielhistorie, resultaten/streaks, open borden en groepen.

## Herstel vóór clientactivatie

Stop/reverifieer eerst alle nieuwe writes. Gebruik dezelfde bestanden en flags, maar met:

    node scripts/restore-production-migration.mjs <candidate.json> --project gepuzzelig --source <snapshot.json> --report <report.json> --release <volledige-SHA> --apply --confirm-project gepuzzelig --confirm-freeze --confirm-pre-client --readiness <readiness.json> --journal <journal.json>

De tool herstelt vóór de migratie bestaande documentwaarden en verwijdert uitsluitend door deze migratie aangemaakte documentpaden. Iedere aangetroffen derde/nieuwere waarde of onbekend nieuw document blokkeert automatisch herstel vóór overschrijven. Ook onderbroken rollback is hervatbaar met dezelfde opdracht. De test vereist dat het volledige databasebeeld daarna gelijk is aan de beginsnapshot, inclusief oude profielen, afwezige nieuwe paden en Firestore-types.

Herstel daarnaast de vastgelegde oude rules, Functions, Auth-providerconfiguratie en client voordat het onderhoudsvenster wordt opgeheven. Doe dit niet blind vanuit de huidige main wanneer een andere versie is vastgelegd. Journals wijzigen nooit Auth-accounts. Ontbreekt hersteltoegang of klopt één postcheck niet, dan blijft de applicatie onder freeze totdat het is opgelost.

## Legacy-write-lock en cutovervolgorde

De release-rules maken de oude gameplaycollecties `results` en `status` read-only. De nieuwe client schrijft resultaten, voortgang en presence uitsluitend naar `playerResults`/`groupActivity`, `progress` en `presence`. Daardoor kan een achtergebleven oude tab/PWA na de datamigratie geen nieuwe niet-gemigreerde gameplaydata meer toevoegen. Legacy reads blijven voorlopig bestaan voor compatibiliteit en controle.

Hanteer bij de echte cutover deze volgorde:

1. rond de hardware-/PWA-controle op de exacte releasekandidaat in de geïsoleerde testomgeving af;
2. start na expliciet productieakkoord de freeze en verifieer dat gewone clientwrites werkelijk geblokkeerd zijn;
3. leg runtime-/providerback-ups vast, maak de verse productie-snapshot en draai de actuele dry-run/`--apply` naar lokale kandidaat en rapport;
4. voer de gecontroleerde productiemigratie uit en rond alle postchecks af terwijl de freeze nog actief is;
5. markeer het journal met `mark-migration-client-active.mjs` direct vóór het punt waarop de release publiek weer kan schrijven; vanaf dit moment is automatische rollback bewust niet meer toegestaan;
6. zet exact dezelfde releasecommit op `main`. De productie-rulesworkflow en GitHub Pages kunnen daarna in verschillende volgorde afronden; de legacy write-lock voorkomt in dat overgangsvenster nieuwe oude gameplaywrites. Behandel de site tot volledige verificatie nog als onderhoud;
7. deploy de productie-Functions uitsluitend vanaf diezelfde `main`-release en controleer de exacte Functionsversie;
8. verifieer dat Pages/client, normale Firestore-rules en Functions allemaal bij de goedgekeurde release horen en voer daarna de korte productie-smoke-test met bestaande accounts uit;
9. faalt iets ná stap 5, activeer opnieuw de freeze en volg het post-activatie herstelpad; gebruik dan niet de automatische pre-client rollback.

De bestaande automatische Firestore-rulesworkflow op een push naar `main` is hierdoor geen dataverliesrisico voor oude gameplaywrites, maar de volgorde van Pages en rules is niet deterministisch. Plan daarom een zichtbaar onderhoudsvenster en beschouw de productie pas als vrijgegeven nadat beide deployments en Functions expliciet zijn geverifieerd.

## Clientactivatie en gegevens daarna

Voordat nieuwe clients mogen schrijven, registreer je dit eenmalig:

    node scripts/mark-migration-client-active.mjs <journal.json> --confirm-release <volledige-SHA>

Daarna weigert de hersteltool automatische rollback. Nieuwe resultaten, voortgang, profielen, memberships en Auth-accounts kunnen immers alleen in het nieuwe model bestaan. Bij problemen na activatie: freeze opnieuw, exporteer zowel de actuele toestand als het oorspronkelijke herstelpunt en behoud alle journals. Vergelijk/reconcilieer alle nieuwe writes in een afzonderlijk goedgekeurd herstelplan. Alleen oude client/rules terugzetten is dan geen dataveilige rollback. Er is bewust geen force-optie die deze controle omzeilt.

Clientactivatie volgt alleen na groene postchecks en menselijke smoke-tests. Leg vóór activatie `PD_SETUP.dailyPreferencesFrom` bewust vast als de eerste volledige nieuwe puzzeldag na cutover; neem nooit de testdatum over. Zonder instelling blijft de oude kalenderkeuze gelden. Players, canonical memberships en inverse indexen moeten gereed zijn. Controleer dat de nieuwe rules en Functions daadwerkelijk de goedgekeurde versies zijn; de bestaande productie-Functionsworkflow checkt main uit en mag dus niet blind vóór de juiste main-versie worden gestart.

## Bewijs in tests versus resterend productiebewijs

Automatisch: bronbinding, ongeldige identiteit, voorkeur-/dagplanbehoud, snapshottypes, Auth-mappingcontrole, crash tussen batches, verloren lokale cursor, idempotent hervatten, rechtstreeks herstel na gedeeltelijke apply, onderbroken rollback, exact databaseherstel en stoppen bij nieuwere writes/clientactivatie. De volledige herstelcyclus draait ook op een uitsluitend lokale Firestore-emulator in CI.

Nog nodig vóór echte migratie: actuele productie-export onder bewezen freeze, werkelijk beschikbare runtime-/providerback-ups met herstelbevoegdheden, herhaalde actuele preflight, afgesproken historische groepsprivacy, exacte release/deployvolgorde, bestaande-account- en echte iPhone/iPad/PWA-smoke-tests, en nieuw expliciet productieakkoord. Er zijn in deze stap geen productiegegevens gelezen of gewijzigd.
