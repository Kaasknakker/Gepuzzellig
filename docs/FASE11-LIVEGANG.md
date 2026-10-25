# Fase 11 — livegangvoorbereiding

Status: **voorbereid op develop; productie nog niet gemigreerd of gedeployed.**

## Veiligheidsgrens
Fase 11 vereist een verse productie-export na change freeze. De Fase-10-snapshot is nooit een livebron. Geen productie-write, deploy of merge naar main zonder een nieuw expliciet akkoord na groene actuele dry-run.

## Cutover
1. Freeze en exacte releasecommit vastleggen.
2. Verse read-only productie-export/back-up maken en herstelbaarheid vastleggen.
3. Fase-10-repetitietool tegen exact die snapshot draaien; iedere blocker, orphan of conflicterend dubbel resultaat = STOP.
4. Kandidaat lokaal genereren en hashes/aantallen/aggregaten vergelijken.
5. Productieconfig (waaronder vereiste Auth-providers) verifiëren.
6. Pas na expliciet akkoord rules/Functions voorbereide productieversies activeren.
7. Live-writer uitsluitend met `--project gepuzzelig --apply --confirm-project gepuzzelig` uitvoeren.
8. Post-invarianten en smoke-tests uitvoeren vóór nieuwe clientactivatie.
9. Nieuwe client pas daarna via main activeren en monitoren.
10. Legacydata niet verwijderen.

## Live-writer
`scripts/apply-production-migration.mjs` maakt zonder `--apply` geen Firebase-verbinding. Apply vereist twee expliciete productieguards. De writer gebruikt merge-upserts en bevat geen deletes. Hij is bedoeld voor de kandidaat die uit de actuele snapshot is gegenereerd, niet voor een oude Fase-10-kandidaat.

## Rollback
Rollbackpunt is de verse pre-cutover-export plus de pre-cutover main/rules/functions. Bij falende postchecks: stop nieuwe writes/activatie, herstel oude client/rules/functions en diagnoseer. Legacycollecties blijven intact; destructieve cleanup hoort niet bij Fase 11.
