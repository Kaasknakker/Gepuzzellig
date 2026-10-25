# Fase 10 — productiemigratierepetitie

Status: tooling voorbereid op `develop`; de fase is pas afgerond na een repetitie op een **verse kopie/export van de actuele productiegegevens**.

## Veiligheidsgrens

Fase 10 schrijft niet naar productie-Firestore en wijzigt `main` niet. `scripts/rehearse-production-migration.mjs` leest uitsluitend een lokaal JSON-snapshot. Zonder `--apply` is het een pure dry-run. Met `--apply` ontstaan alleen twee nieuwe lokale bestanden naast de snapshot: een gemigreerde kandidaat en een rapport. Legacydata blijft in de kandidaat aanwezig.

## Repetitie

`node scripts/rehearse-production-migration.mjs <verse-productie-snapshot.json>`

Controleer vóór vervolg dat `checks.blockers` leeg is en de result/progress-aantallen gelijk zijn. Het rapport bevat SHA-256 van bron en kandidaat, orphan-detectie, mapping van profiles/playerId/groups/results/status/progress/preferences, per-player aggregaten voor resultaat-aantal/tijd/datums, een deterministische steekproef van accounts en rollbackinformatie.

Pas daarna mag lokaal een kandidaatbestand worden gemaakt:

`node scripts/rehearse-production-migration.mjs <verse-productie-snapshot.json> --apply`

## Nog nodig om Fase 10 af te ronden

1. Maak een verse, read-only export/kopie van **actuele productiegegevens**.
2. Bewaar die ongewijzigd als rollbackbron.
3. Draai de dry-run en archiveer het rapport.
4. Onderzoek iedere blocker/orphan; niet negeren.
5. Draai `--apply` alleen lokaal nadat de dry-run groen is.
6. Vergelijk de deterministische accountsteekproef met de productiebron.
7. Herhaal de rollbackrepetitie door de bronhash te verifiëren en de kandidaat weg te gooien/hergenereren.
8. Pas als deze repetitie groen is, kan Fase 11 worden voorbereid. Live mutaties/deploys blijven een apart expliciet goedkeuringsmoment.

De CI-test gebruikt uitsluitend synthetische fixturedata en bewijst de werking van de tooling; hij vervangt de verplichte repetitie op een verse productie-export niet.
