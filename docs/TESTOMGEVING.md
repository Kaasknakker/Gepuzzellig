# Gepuzzellig testomgeving

## Scheiding productie en ontwikkeling

- Productiecode: branch `main`.
- Productie-Firebase: `gepuzzelig`.
- Productie-webapp: GitHub Pages.
- Ontwikkelcode voor de grote verbouwing: branch `develop`.
- Test-Firebase: `gepuzzellig-test`.
- Test-webapp: Firebase Hosting op `https://gepuzzellig-test.web.app`.
- Test Auth, Firestore en Hosting zijn fysiek gescheiden van productie.
- Testdata en testaccounts horen uitsluitend in `gepuzzellig-test`.

## Deploys

Pushes naar `develop` gebruiken `.github/workflows/deploy-test.yml`.
Die workflow:
1. draait de bestaande regressiechecks;
2. bouwt een tijdelijke Hosting-map;
3. vervangt daarin de productieconfig door `js/config.test.js`;
4. controleert expliciet dat de gebouwde config naar `gepuzzellig-test` wijst;
5. deployt Firestore-rules en Hosting uitsluitend met `--project gepuzzellig-test`.

De productie-workflows blijven apart en gebruiken expliciet `gepuzzelig`.

Firebase Functions worden voorlopig **niet** naar test gedeployed. De huidige uitnodigingsfunctie bevat nog de productie-URL en moet eerst testveilig worden gemaakt. Dit is bewust een open punt.

## Werkwijze voor volgende chats

Bij werk aan de grote verbouwing:
1. lees eerst `docs/AI-WERKWIJZE.md` op de actuele `main`;
2. lees daarna dit bestand en controleer de actuele `develop`;
3. werk uitsluitend op `develop` zolang de wijziging in testontwikkeling is;
4. gebruik `gepuzzellig-test` voor testaccounts, testgroepen, Firestore en rules;
5. wijzig of deploy niets naar `main` / `gepuzzelig` zonder expliciete opdracht van Peter;
6. controleer na iedere testdeploy de checks én de exacte deployment;
7. een latere productiemigratie krijgt een apart plan met databack-up, rules-controle, migratietest en expliciete goedkeuring.

## Belangrijke veiligheidsregel

`develop` bevat in de bron nog de normale `js/config.js`, maar de testdeploy vervangt die alleen in de tijdelijke Hosting-map door `js/config.test.js`. Daardoor blijft de productieconfig ongewijzigd en krijgt de testsite uitsluitend de testconfig.

De GitHub Actions-secret heet `FIREBASE_SERVICE_ACCOUNT_GEPUZZELLIG_TEST`. De inhoud daarvan hoort nooit in code, documentatie of chat.
