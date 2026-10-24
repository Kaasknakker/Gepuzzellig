# Fase 7 — favorieten, moeilijkheid, daily plan en navigatie

Status: geïmplementeerd op `develop` op 24 oktober 2026.

## Persoonlijke voorkeuren

- `profiles/{authUid}.preferences.favoritePuzzleTypes` bepaalt welke dagpuzzels op Home staan.
- `profiles/{authUid}.preferences.dailyDifficulty` bewaart per actief puzzeltype `easy | normal | hard`.
- De puzzle registry is de bron voor actieve puzzels, starterfavorieten en de mapping van semantische moeilijkheid naar wide/phone-generatorlevels.
- Nieuwe spelers starten met Binair, Star Battle en Nonogram. Bestaande profielen zonder preferences krijgen bij de compatibiliteitsbackfill alle vóór Fase 7 actieve puzzels, zodat bestaand gedrag niet stilzwijgend verdwijnt.
- Wijzigingen gelden vanaf de volgende kalenderdag. Dagpuzzels t/m 24 oktober 2026 behouden de bestaande weekday/weekend-levelmapping.

## Daily plan

Bij eerste online profielinitialisatie van een dag wordt `dailyPlans/{playerId}/days/{YYYY-MM-DD}` aangemaakt met de favorieten en moeilijkheden van dat moment. Het document is via Firestore-rules alleen door de eigen speler leesbaar/aanmaakbaar en daarna immutable. Daardoor kunnen latere voorkeurwijzigingen de denominator en moeilijkheid van die dag niet herschrijven.

Daily plans bevatten geen groepsidentiteit. Resultaten en progress uit Fase 4 blijven persoonlijk; memberships uit Fase 5 bepalen groepsrelaties onafhankelijk hiervan.

## Navigatie

Home heeft vier duidelijke bestemmingen: Home, Vrij puzzelen, Groepen en Profiel. Home toont alleen de dagfavorieten uit het plan. Vrij puzzelen blijft alle `active:true` registry-items tonen, ongeacht favorieten. Groepen en Profiel gebruiken de bestaande Fase-5-dialogen en flows.

## Migratie en compatibiliteit

`scripts/migrate-phase7.mjs` is dry-run by default en maakt alleen een deterministische voorkeurbackfill in een outputbestand met `--apply`; het wijzigt geen Firebase-project. De regressiecheck bewijst dry-run, idempotentie, behoud van bestaande voorkeuren en behoud van playerId. De runtime kan ontbrekende legacy-preferences daarnaast veilig aanvullen op het eigen profiel.

Legacy `groupId`, oude results/status, compatibility-readers en Functions-scheiding blijven bestaan. Fase 7 verwijdert niets destructief en vereist geen Functions-deploy.

## Handmatige smoke-test in test

1. Open Profiel en wijzig één favoriet en één dagmoeilijkheid; controleer de melding dat dit vanaf morgen geldt.
2. Controleer dat Home vandaag stabiel blijft en Vrij puzzelen nog alle actieve puzzelsoorten toont.
3. Controleer Home / Vrij puzzelen / Groepen / Profiel op iPad/iPhone/desktop en met touch/Pencil/muis waar relevant.
4. Maak met een nieuw solo-testaccount een profiel en controleer dat de starterset Binair, Star Battle en Nonogram is.
