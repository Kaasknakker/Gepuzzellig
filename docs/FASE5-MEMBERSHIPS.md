# Fase 5 — memberships en groepen

Status: geïmplementeerd op `develop` voor de geïsoleerde testomgeving.

## Canonical model

- `profiles/{authUid}.groupId` blijft uitsluitend als legacymetadata voor eigen data-import bestaan en wordt door nieuwe groepsflows niet meer gewijzigd.
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

Bestaande spelers houden exact hun `playerId`. Groepsrechten en de actieve groep vereisen canonical approved memberships; `profile.groupId` en `ownerAuthUid` leveren geen alternatieve groepsrechten. Vóór clientactivatie moeten players, memberships en inverse indexen zijn gebackfilld. Eigen legacyresultaten en eigen legacyvoortgang blijven privé leesbaar. Persoonlijke resultaten en voortgang blijven groepsonafhankelijk.

## Pre-migratiefix stap 3 — identiteit en intrekken rechten

- players-creatie vereist hetzelfde playerId/authUid als het eigen bestaande of gelijktijdig aangemaakte profiel. Een registryrecord alleen geeft geen eigendom zonder overeenkomstig profiel. Bestaande bijzondere playerIds blijven geldig.
- Nieuwe groepen en hun eerste adminmembership plus inverse index ontstaan atomair. De bootstrapuitzondering geldt uitsluitend voor een werkelijk nieuwe groep; een verwijderde eigenaar kan zich daarmee niet opnieuw admin maken.
- Een oude eigenaar die canonical wordt gedegradeerd/verwijderd verliest beheerrechten. Een approved membership kan niet rechtstreeks worden teruggedateerd via joinedAt. De bestaande laatste-adminbescherming blijft behouden.
- Een groepscode of oude uitnodiging kan profile.groupId niet meer wijzigen; aanvragen blijven pending tot goedkeuring.
- Groepsleden lezen displaynamen uit memberships, geen private profielen van anderen. Bestaande expliciete sitebeheerrollen houden hun bedoelde beheerleesrechten; een groepsadmin is daarmee niet automatisch sitebeheerder.
- De client luistert naar zijn eigen membershipindex. Degradatie, verwijdering en wisseling worden verwerkt zonder dat een oud profielveld de groep terugzet.
- Sociale online-status staat voortaan in presence, met het bestaande statusformaat maar zonder progress-veld. Legacy status is privé leesbaar voor de eigenaar en de bestaande sitebeheerrollen; persoonlijke voortgang blijft in progress. Presence is vluchtig en vereist geen historische backfill.
- Uitnodigingsmail controleert ook server-side dat de maker nog approved lid is van de voorgestelde groep, voordat mailSentAt of bezorging wordt afgehandeld. Solo-uitnodigingen blijven geldig. De gewijzigde Function vereist de aparte test-Functionsdeployment; een gewone develop-push deployt alleen rules/Hosting.

De rules-suite voert ook check-security-boundaries.mjs uit: identiteitsreservering, speciale legacy-identiteit, atomaire solo-registratie, ongeldige registrykoppeling, pending/verwijderde/gedegradeerde leden, privé legacydata, presence zonder borddata, nieuwe-groepsbootstrap en laatste admin. check-security-app.mjs test actuele clientrechten en de echte mail-callable met geïsoleerde opslag en sinkmodus.
