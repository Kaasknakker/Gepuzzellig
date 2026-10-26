# Releasecontrole 26 oktober 2026

## Afstemming main en develop

Main ceb4a3e630bd092e1db307ced78a42488b062489 is samengevoegd in develop na beoordeling van beide main-only commits. De app blijft v228, met exact dezelfde runtimebestanden als develop 8db1f5d08c787eb172fc92db3abde62971eb91c2.

- De smalle-iPhone-hotfix uit 5843b93 is inhoudelijk opgevolgd door de nieuwere dagregels in develop: aparte status-, peer-, actie- en informatiezones, met responsive begrenzing. De oude CSS achteraan toevoegen zou deze nieuwere cascade opnieuw overschrijven. Daarom blijft de huidige develop-CSS behouden.
- De handmatige test-Functionsworkflow uit ceb4a3e is beschikbaar in develop en daar verder beveiligd: Node 22, expliciete testprojectcontroles en runtimecontroles. De nieuwere developworkflow blijft behouden.
- Index en serviceworker blijven v228; er is geen nieuwe runtimewijziging waarvoor een cacheversie nodig is.

## Parallelle wijzigingen

De vijf commits na bd3e56c tot en met 8db1f5d zijn beoordeeld. Zij wijzigen puzzelinteractie, afronding, Murdoku en de eerste Binair-uitleg; migratietooling, regels en Functions blijven gelijk. De definitieve mergecommit moet opnieuw alle CI-controles en de testdeployment doorlopen.

## Gebruikerscontrole en privacy

Peter meldt dat de kernpaden op iPad, iPhone en pc zijn getest zonder bijzonderheden. Afzonderlijke Safari/PWA-versies en iPad-orientaties zijn niet gespecificeerd; dit verslag claimt die afzonderlijke varianten dus niet als bewezen.

Peter heeft expliciet ingestemd met de privacygrens: persoonlijke historie blijft behouden; ontbrekende historische toetredingsdata geven geen automatische toegang tot onbewijsbare oude groepsactiviteit. Behoud bestaande canonical memberships; gebruik voor ontbrekende legacydata de conservatieve snapshotgrens uit het draaiboek.

## Aanvullende cutover-hardening

Na de eerste releasecontrole is één migratierisico expliciet dichtgezet: de nieuwe client gebruikt de legacy collecties `results` en `status` alleen nog als read-fallback, daarom zijn clientwrites naar die twee collecties in de release-rules geblokkeerd. De Firestore-emulatortest controleert dat bestaande legacydata leesbaar blijft voor de eigenaar, maar create/update/delete door clients wordt geweigerd. Dit voorkomt dat een oude tab of PWA na de migratie nog niet-gemigreerde gameplaydata kan toevoegen.

Dit is een rules-/test-/draaiboekwijziging; de webclient blijft v228. Gebruik bij livegang altijd de dan actuele volledige `develop`-HEAD als release-SHA en herhaal de exacte CI- en testdeploymentcontrole.

## Productiegrens

Dit is releasevoorbereiding. Main en productie zijn niet gewijzigd. De actuele productie-export onder bewezen freeze, uitvoerbare runtime-/providerback-ups, actuele preflight en expliciet productieakkoord blijven vereist vóór de feitelijke migratie. De productiedatum voor nieuwe dagpuzzelvoorkeuren wordt bij de geplande cutover vastgesteld. Volg docs/FASE11-LIVEGANG.md.
