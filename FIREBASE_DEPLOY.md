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
