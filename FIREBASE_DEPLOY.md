# Firestore rules deployen

De Firestore-regels van Gepuzzellig worden voortaan in `firestore.rules` beheerd.
De repo is daarmee de bron van waarheid; pas de regels niet meer handmatig in de Firebase Console aan.

## Eenmalig op de Mac

Installeer de Firebase CLI en log in:

```bash
npm install -g firebase-tools
firebase login
```

Voer dit uit vanuit de map van de Gepuzzellig-repository.

## Regels publiceren

```bash
firebase deploy --only firestore:rules
```

`.firebaserc` wijst al naar Firebase-project `gepuzzelig`.

## Controleren

Na een succesvolle deploy toont de terminal dat de Firestore-rules zijn gepubliceerd.
Gebruik de Firebase Console daarna alleen nog om de actieve rules te bekijken;
wijzigingen horen in `firestore.rules` en gaan via GitHub + Firebase CLI.


## Automatisch via GitHub Actions

Na de eenmalige CI-inrichting deployt GitHub Actions `firestore.rules` automatisch zodra
`firestore.rules`, `firebase.json`, `.firebaserc` of de workflow zelf op `main` wijzigt.

De workflow staat in:

```
.github/workflows/deploy-firestore-rules.yml
```

GitHub verwacht hiervoor één repository secret:

```
FIREBASE_SERVICE_ACCOUNT_GEPUZZELIG
```

Dit secret bevat de JSON-sleutel van een aparte Google Cloud service account met alleen
de rol **Firebase Rules Admin** (`roles/firebaserules.admin`).

Na deze inrichting is handmatig `firebase deploy` normaal niet meer nodig.
