# Automatische uitnodigingsmail

De webapp maakt uitnodigingen al veilig aan in Firestore. De callable Cloud Function `sendInviteEmail` verstuurt daarna automatisch de nette uitnodigingsmail via Postmark.

## Eenmalig activeren

1. Maak in Postmark een Server aan en verifieer een afzenderadres of domein.
2. Zet de twee Firebase secrets lokaal of via Cloud Shell:

```bash
firebase functions:secrets:set POSTMARK_SERVER_TOKEN
firebase functions:secrets:set POSTMARK_FROM
```

Gebruik bij `POSTMARK_FROM` bijvoorbeeld:

```
Gepuzzellig <uitnodigen@jouwdomein.nl>
```

3. Deploy daarna:

```bash
npm --prefix functions install
firebase deploy --only functions --project gepuzzelig
```

Zolang de functie nog niet is gedeployed, blijft de app gewoon een kopieerbare uitnodigingslink tonen. Er gaat dus geen uitnodigingsfunctionaliteit verloren.

De functie draait in `europe-west1`, controleert Firebase Authentication én eigenaarschap van de uitnodiging en accepteert nooit een vrij e-mailadres vanuit de callable request.
