# Fase 5 — memberships en groepen

Status: geïmplementeerd op `develop` voor de geïsoleerde testomgeving.

## Canonical model

- `profiles/{authUid}.groupId` blijft uitsluitend als legacy fallback bestaan en wordt door nieuwe groepsflows niet meer gewijzigd.
- Canonical membership: `groups/{groupId}/members/{playerId}`.
- Inverse index voor "mijn groepen": `playerMemberships/{playerId}/groups/{groupId}`.
- Nieuwe membershipwrites wijzigen canonical document en inverse index in één Firestore batch.
- Een groepscode maakt alleen een `pending` membership. De speler blijft solo of in de huidige approved groep totdat een groepsadmin goedkeurt.
- Een nieuwe groep maakt de maker direct als eerste approved admin.
- Meerdere approved memberships en meerdere admins zijn toegestaan.
- Een approved admin kan zichzelf niet degraderen of verwijderen. Daardoor kan de laatste admin niet verdwijnen; een andere admin kan een mede-admin wel degraderen/verwijderen.
- Nieuwe code gebruikt approved memberships voor groepsbeheer en presence. Legacy `groupId`, `results` en `status` blijven leesbaar tijdens de migratie.

## Legacy-backfill

`scripts/migrate-phase5.mjs` is bewust export-gebaseerd en destructievrij.

Dry-run:

`node scripts/migrate-phase5.mjs <firestore-export.json>`

Controleer vóór toepassen minimaal `countsMatch`, `orphans` en `groupsWithoutAdmin`.

Deterministische migratie-output maken:

`node scripts/migrate-phase5.mjs <firestore-export.json> --apply`

Dit schrijft alleen een nieuw `*-phase5.json` bestand en wijzigt Firestore niet. De bronexport en alle legacyvelden blijven onaangeraakt. Herhaald uitvoeren met dezelfde invoer levert dezelfde output.

De daadwerkelijke productiebackfill hoort pas bij de latere productiemigratierepetitie/livegang. In Fase 5 wordt geen productie- of test-Firestore bulkmutatie automatisch uitgevoerd.

## Compatibiliteit

Bestaande spelers houden exact hun `playerId`. Als voor een bestaand account nog geen nieuwe membershipdocumenten bestaan, gebruikt de client tijdelijk het oude `profile.groupId` als actieve legacygroep. Persoonlijke resultaten en voortgang uit Fase 4 blijven canonical en groepsonafhankelijk.
