# Fase 11 — gecontroleerde migratie en herstel

Status: tooling op develop. Productie is niet gemigreerd. Een geslaagde synthetische repetitie vervangt geen actuele productie-export, hardwaretest of expliciet productieakkoord.

## Veiligheidsgrens

Alle productiecommando's hieronder zijn een draaiboek voor later. Ze zijn niet tijdens de voorbereiding uitgevoerd. Nieuwe toestemming blijft nodig na een groen rapport voor de actuele bron. Testdata wordt nooit naar productie gepromoveerd. Legacy results/status, groepen en uitnodigingen worden niet verwijderd.

### Besluit: Start solo blijft aan

Peter heeft gekozen voor **Start solo behouden**. Anonymous Authentication wordt daarom niet vooraf stilzwijgend aangezet, maar als **aparte productiestap onder freeze en met expliciet akkoord** uitgevoerd nadat de migratie en postchecks groen zijn en vóór clientactivatie.

Voorwaarden vóór die stap:

- noteer het actuele Firebase-prijsplan van productieproject `gepuzzelig` expliciet als **Spark** of **Blaze**; leid dit niet af uit repositorycode;
- bij **Spark**: accepteer bewust dat openbaar solo-gebruik de dagquota kan verbruiken en daarmee tijdelijk beschikbaarheid kan raken;
- bij **Blaze**: controleer vóór Anonymous Auth dat voor `gepuzzelig` een projectgebonden budgetwaarschuwing actief is; richtwaarde **€5 per maand** met meldingen rond 50%, 90% en 100% (een budgetwaarschuwing is geen harde kostenlimiet);
- leg de huidige Auth-providerconfiguratie en de bestaande waarde van `signIn.anonymous.enabled` vast als herstelbewijs;
- voer geen wijziging aan de productieprovider uit zonder Peters aparte akkoord in dezelfde livegangchat.

De huidige client zegt bij solo dat later veilig een Google-account gekoppeld kan worden en toont bij een ongekoppeld profiel “Solo · nog niet gekoppeld”. Hij waarschuwt nog **niet expliciet** dat toegang tot een ongekoppeld solo-profiel praktisch aan die browser/installatie vastzit totdat Google is gekoppeld. Dat blokkeert de livegang niet; voeg na live aan het verbeterplan toe: duidelijke profieltekst zoals “Koppel aan Google om je voortgang ook na wissen van browsergegevens en op andere apparaten terug te kunnen vinden.”

## Voorbereiden en freeze

1. Leg de volledige release-SHA vast en werk vanuit die schone checkout. Beoordeel de laatste main-delta; main blijft productie tot afzonderlijk goedgekeurde activatie.
2. Bewaar en verifieer de huidige client, gedeployde rules, Functionsversie en Auth-providerconfiguratie als lokale herstelartefacten, met SHA-256. De huidige repo-inhoud alleen bewijst niet welke versie daadwerkelijk gedeployed staat. Controleer toegang tot deze back-ups en de herstelbevoegdheden. Noteer daarbij expliciet de bestaande boolean `signIn.anonymous.enabled` zodat pre-client rollback exact naar de oude providerstand kan terugkeren.
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

## Anonymous Auth: aparte productiestap

Voer dit pas uit **na groene migratie + postchecks, onder de bestaande freeze, en na Peters expliciete akkoord**. Als Anonymous Auth al aan stond, wijzig niets en leg alleen de bevestigde toestand vast.

Voor de wijziging moet het actuele prijsplan van `gepuzzelig` al als Spark/Blaze zijn genoteerd en moet bij Blaze de afgesproken budgetwaarschuwing actief zijn.

Gebruik dezelfde geauthenticeerde Google Cloud-context waarmee de overige productiehandelingen voor `gepuzzelig` worden uitgevoerd:

    PROJECT=gepuzzelig
    TOKEN="$(gcloud auth print-access-token)"
    curl --fail-with-body --silent --show-error \
      -H "Authorization: Bearer $TOKEN" \
      "https://identitytoolkit.googleapis.com/admin/v2/projects/$PROJECT/config" \
      > prod-auth-config-before-anonymous.json
    shasum -a 256 prod-auth-config-before-anonymous.json
    python3 - <<'PY'
    import json
    x=json.load(open("prod-auth-config-before-anonymous.json"))
    print("anonymous-before =", x.get("signIn",{}).get("anonymous",{}).get("enabled", False))
    PY

Bewaar dit bestand privé bij de overige runtimeback-ups. Als de vastgelegde oude waarde `false` is en Peter akkoord geeft:

    TOKEN="$(gcloud auth print-access-token)"
    curl --fail-with-body --silent --show-error \
      -X PATCH \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      "https://identitytoolkit.googleapis.com/admin/v2/projects/gepuzzelig/config?updateMask=signIn.anonymous.enabled" \
      -d '{"signIn":{"anonymous":{"enabled":true}}}' \
      > prod-auth-config-after-anonymous.json
    python3 - <<'PY'
    import json
    x=json.load(open("prod-auth-config-after-anonymous.json"))
    assert x.get("signIn",{}).get("anonymous",{}).get("enabled") is True
    print("anonymous-after = true")
    PY

Controleer daarna nogmaals met een verse GET dat `signIn.anonymous.enabled == true`. **Markeer de client pas daarna actief.**

Pre-client rollback: als de oude vastgelegde waarde `false` was, zet uitsluitend deze providerinstelling onder expliciet rollbackakkoord terug naar `false` en verifieer opnieuw met een verse GET. Herstel daarnaast waar nodig de volledige vastgelegde Auth-providerconfiguratie volgens het bestaande herstelpad.

## Legacy-write-lock en cutovervolgorde

De release-rules maken de oude gameplaycollecties `results` en `status` read-only. De nieuwe client schrijft resultaten, voortgang en presence uitsluitend naar `playerResults`/`groupActivity`, `progress` en `presence`. Daardoor kan een achtergebleven oude tab/PWA na de datamigratie geen nieuwe niet-gemigreerde gameplaydata meer toevoegen. Legacy reads blijven voorlopig bestaan voor compatibiliteit en controle.

Hanteer bij de echte cutover deze volgorde:

1. rond de hardware-/PWA-controle op de exacte releasekandidaat in de geïsoleerde testomgeving af;
2. start na expliciet productieakkoord de freeze en verifieer dat gewone clientwrites werkelijk geblokkeerd zijn;
3. leg runtime-/providerback-ups vast, noteer Spark/Blaze en de huidige Anonymous Auth-stand, maak de verse productie-snapshot en draai de actuele dry-run/`--apply` naar lokale kandidaat en rapport;
4. voer de gecontroleerde productiemigratie uit en rond alle postchecks af terwijl de freeze nog actief is;
5. controleer de gemigreerde groep **Rekensukkels**: group-id blijft exact `peter-aart-jk4hv92t`, Peter en Aart hebben hun verwachte approved membership en bestaande historie/voortgang is gekoppeld aan hun bestaande speleridentiteit;
6. als het prijsplan Blaze is: bevestig de afgesproken budgetwaarschuwing. Vraag daarna apart akkoord en zet/verifieer Anonymous Authentication volgens de sectie hierboven;
7. markeer het journal met `mark-migration-client-active.mjs` direct vóór het punt waarop de release publiek weer kan schrijven; vanaf dit moment is automatische rollback bewust niet meer toegestaan;
8. zet exact dezelfde releasecommit op `main`. De productie-rulesworkflow en GitHub Pages kunnen daarna in verschillende volgorde afronden; de legacy write-lock voorkomt in dat overgangsvenster nieuwe oude gameplaywrites. Behandel de site tot volledige verificatie nog als onderhoud;
9. deploy de productie-Functions uitsluitend vanaf diezelfde `main`-release en controleer de exacte Functionsversie;
10. verifieer dat Pages/client, normale Firestore-rules en Functions allemaal bij de goedgekeurde release horen en voer daarna de korte productie-smoke-test met bestaande accounts uit;
11. controleer **Aart op iPad, Mac en iPhone**. Als een inlogscherm verschijnt: kies uitsluitend **Bestaand account met Google**, niet **Start solo**. Open Profiel en bevestig dat het niet “Solo · nog niet gekoppeld” toont, dat Aarts eigen naam/profiel en bestaande voortgang zichtbaar zijn en dat de actieve groep Rekensukkels is;
12. controleer met zowel Peter als Aart in Rekensukkels dat Home de tegel **Rekenraadsel van vandaag** toont en dat die de bestaande proefpagina opent;
13. faalt iets ná stap 7, activeer opnieuw de freeze en volg het post-activatie herstelpad; gebruik dan niet de automatische pre-client rollback.

De bestaande automatische Firestore-rulesworkflow op een push naar `main` is hierdoor geen dataverliesrisico voor oude gameplaywrites, maar de volgorde van Pages en rules is niet deterministisch. Plan daarom een zichtbaar onderhoudsvenster en beschouw de productie pas als vrijgegeven nadat beide deployments en Functions expliciet zijn geverifieerd.

## Clientactivatie en gegevens daarna

Voordat nieuwe clients mogen schrijven, registreer je dit eenmalig:

    node scripts/mark-migration-client-active.mjs <journal.json> --confirm-release <volledige-SHA>

Daarna weigert de hersteltool automatische rollback. Nieuwe resultaten, voortgang, profielen, memberships en Auth-accounts kunnen immers alleen in het nieuwe model bestaan. Bij problemen na activatie: freeze opnieuw, exporteer zowel de actuele toestand als het oorspronkelijke herstelpunt en behoud alle journals. Vergelijk/reconcilieer alle nieuwe writes in een afzonderlijk goedgekeurd herstelplan. Alleen oude client/rules terugzetten is dan geen dataveilige rollback. Er is bewust geen force-optie die deze controle omzeilt.

Clientactivatie volgt alleen na groene postchecks en menselijke smoke-tests. Leg vóór activatie `PD_SETUP.dailyPreferencesFrom` bewust vast als de eerste volledige nieuwe puzzeldag na cutover; neem nooit de testdatum over. Zonder instelling blijft de oude kalenderkeuze gelden. Players, canonical memberships en inverse indexen moeten gereed zijn. Controleer dat de nieuwe rules en Functions daadwerkelijk de goedgekeurde versies zijn; de bestaande productie-Functionsworkflow checkt main uit en mag dus niet blind vóór de juiste main-versie worden gestart.

## Bewijs in tests versus resterend productiebewijs

Automatisch: bronbinding, ongeldige identiteit, voorkeur-/dagplanbehoud, snapshottypes, Auth-mappingcontrole, crash tussen batches, verloren lokale cursor, idempotent hervatten, rechtstreeks herstel na gedeeltelijke apply, onderbroken rollback, exact databaseherstel en stoppen bij nieuwere writes/clientactivatie. De volledige herstelcyclus draait ook op een uitsluitend lokale Firestore-emulator in CI.

Nog nodig vóór echte migratie: actuele productie-export onder bewezen freeze, werkelijk beschikbare runtime-/providerback-ups met herstelbevoegdheden, herhaalde actuele preflight, afgesproken historische groepsprivacy, exacte release/deployvolgorde, handmatig vastgesteld productieprijsplan (Spark/Blaze; bij Blaze budgetwaarschuwing), bestaande-account- en echte iPhone/iPad/PWA-smoke-tests, en nieuw expliciet productieakkoord. Na migratie horen ook de Rekensukkels-id/tegelcontrole en Aarts Google-profielcontrole op iPad, Mac en iPhone bij het productiebewijs. Er zijn in deze stap geen productiegegevens gelezen of gewijzigd.
