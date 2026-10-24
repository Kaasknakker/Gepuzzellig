# Fase 8 — groepsoverzicht op memberships

Status: geïmplementeerd op `develop` op 24 oktober 2026.

## Readmodel

Persoonlijke `playerResults/{playerId}/items/{resultId}` blijven de canonical resultaten. Voor sociale groepsweergave schrijft de client een beperkte projectie naar `groupActivity/{groupId}/items/{activityId}` voor iedere approved membership die op het moment van afronden bestaat. De projectie bevat alleen velden die het groepsoverzicht nodig heeft.

Dagplannen blijven persoonlijk en immutable onder `dailyPlans`. Voor eerlijke groepspercentages wordt dezelfde gekozen dagset beperkt geprojecteerd naar `groupDailyPlans/{groupId}/items/{date_playerId}`.

## Privacy vanaf joinedAt

Firestore Rules staan het maken van beide sociale projecties alleen toe wanneer:
- de schrijver eigenaar is van de betreffende `playerId`;
- die speler approved lid is van de groep;
- `completedAt` respectievelijk de sociale delingstijd `sharedAt` niet vóór de canonical membership-`joinedAt` ligt. Het persoonlijke dagplan mag al eerder die dag zijn aangemaakt; bij een nieuw membership wordt alleen de huidige dagset vanaf het lidmaatschap gedeeld.

Legacy `results` zijn voor gewone gebruikers vanaf Fase 8 alleen nog voor de eigen speler leesbaar. Sociale lezingen lopen via het nieuwe readmodel. Daardoor kan een nieuw groepslid niet via een oude legacy-query historische resultaten van anderen ophalen.

## Overzicht

- **Vandaag** is persoonsgericht: per groepslid wordt de gekozen dagset getoond, met moeilijkheid, klaar/bezig-status en voltooiing.
- **Dag / Week / Maand / Jaar / Alles** blijven beschikbaar.
- Het groepsoverzicht toont deelname ten opzichte van ieders eigen gedeelde daily plans.
- Per puzzel blijft activiteit zichtbaar.
- Tijden worden alleen naast elkaar gezet wanneer `puzzleKey + difficulty + variant + deviceVariant` gelijk zijn. Er is geen algemeen tijdklassement.
- Solo blijft volledig bruikbaar; zonder actieve groep verschijnt geen sociaal overzicht.
- Wisselen tussen meerdere approved memberships wisselt het groepsreadmodel zonder de persoonlijke resultaatidentiteit te veranderen.

## Legacy en migratie

`scripts/migrate-phase8.mjs` maakt uit een export deterministisch het sociale readmodel. Records waarvan het tijdstip niet aantoonbaar op of na `joinedAt` ligt worden bewust niet gedeeld. De migratie is dry-run by default, schrijft met `--apply` alleen een nieuw lokaal JSON-bestand en wijzigt geen Firebase-project.

Eigen legacy resultaten blijven via de compatibiliteitsreader beschikbaar. Oude groepshistorie van anderen wordt niet rechtstreeks uit `results` gelezen; die wordt alleen zichtbaar als een veilige Fase-8-projectie bestaat.

## Functions

Fase 8 vereist geen Functions-wijziging of Functions-deploy.

## Handmatige smoke-test in test

1. Open een groep met minimaal twee approved leden en controleer Vandaag: per persoon gekozen puzzels, moeilijkheid en klaar/bezig.
2. Speel met één lid een nieuwe dagpuzzel en controleer dat die in alle groepen verschijnt waarvan die speler al approved lid was.
3. Maak/gebruik een tweede membership en wissel van groep; persoonlijke resultaten blijven dezelfde, groepsweergave wisselt.
4. Keur een nieuw lid goed en controleer dat resultaten van vóór `joinedAt` niet in de nieuwe groep verschijnen.
5. Controleer Dag, Week, Maand, Jaar en Alles.
6. Controleer de sectie Vergelijkbare tijden met twee spelers die exact dezelfde `puzzleKey`, moeilijkheid en variant hebben.
7. Controleer solo: puzzelen blijft werken en er wordt geen groepshistorie getoond.
