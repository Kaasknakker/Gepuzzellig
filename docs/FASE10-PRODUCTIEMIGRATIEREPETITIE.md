# Fase 10 — productiemigratierepetitie

Status: **afgerond op 25 oktober 2026** op een verse, read-only JSON-kopie van de toen actuele productiegegevens.

## Veiligheidsgrens

Fase 10 heeft niet naar productie-Firestore geschreven en heeft `main` niet gewijzigd. `scripts/rehearse-production-migration.mjs` leest uitsluitend een lokaal JSON-snapshot. Zonder `--apply` is het een pure dry-run. Met `--apply` ontstaan alleen lokale kandidaat- en rapportbestanden naast de snapshot. De productie-snapshot, kandidaat en het volledige rapport worden vanwege productiegegevens niet in GitHub opgeslagen.

## Uitgevoerde repetitie

De productiegegevens zijn read-only uit Firebase-project `gepuzzelig` gelezen naar een lokaal snapshot. De bronhash is vóór en na de repetitie gelijk gebleven.

Uitkomst:
- profiles: 2 → 2;
- groups: 1;
- memberships: 2;
- legacy result-documenten: 97;
- unieke logische resultaten: 76;
- gecontroleerde legacy-dubbelen: 21;
- conflicterende dubbelen: 0;
- gemigreerde resultaten: 76;
- progress-items: 12 → 12;
- blockers/orphans: 0;
- dry-run: geslaagd;
- lokale `--apply`: geslaagd;
- herhaalde `--apply`: byte-identieke kandidaat, dus deterministisch/idempotent;
- rollbackcontrole: bron-snapshot bleef ongewijzigd en kan de lokale kandidaat volledig vervangen.

Tijdens de eerste repetitie bleek dat productie 21 dubbele legacy-resultaatdocumenten bevatte die dezelfde logische speler/datum/puzzelcombinatie representeerden. De Fase-10-tooling is daarop aangescherpt: alleen inhoudelijk equivalente records mogen als gecontroleerde deduplicatie samenvallen; een inhoudelijk verschil op dezelfde logische sleutel wordt een harde blocker. Daardoor wordt deduplicatie expliciet gerapporteerd in plaats van stil overschreven.

## Repetitiecommando's

`node scripts/rehearse-production-migration.mjs <verse-productie-snapshot.json>`

Pas na een groene dry-run:

`node scripts/rehearse-production-migration.mjs <verse-productie-snapshot.json> --apply`

## Conclusie en grens naar Fase 11

Fase 10 bewijst dat de op 25 oktober 2026 gekopieerde productiegegevens zonder bekende blocker naar de nieuwe datastructuur kunnen worden omgezet. Dit is **geen toestemming om productie te migreren** en de snapshot mag niet als latere livebron worden gebruikt: productie kan intussen wijzigen.

Fase 11 blijft een apart expliciet goedkeuringsmoment. Voor livegang moet opnieuw een verse productieback-up/export worden gemaakt, moet de migratie-dry-run tegen exact die actuele snapshot groen zijn en moeten de pre/post-invarianten opnieuw worden gecontroleerd. Legacydata wordt bij livegang nog niet verwijderd.
