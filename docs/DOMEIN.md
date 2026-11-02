# Gepuzzellig — productie-domein en GitHub Pages

## Hoofdadres
- Productie: **https://gepuzzellig.nl/**
- `https://www.gepuzzellig.nl/` verwijst via GitHub Pages door naar `https://gepuzzellig.nl/`.
- Oorspronkelijk GitHub Pages-projectadres: `https://kaasknakker.github.io/Gepuzzellig/` (GitHub Pages hoort dit automatisch naar het ingestelde custom domain door te sturen).
- Test blijft afzonderlijk: **https://gepuzzellig-test.web.app/**; nooit het productiedomein aan test-Firebase of test-Hosting koppelen.

## Vastleggen in Git
- Het bestand `CNAME` in de root moet exact `gepuzzellig.nl` bevatten.
- GitHub Pages (repository **Settings → Pages → Custom domain**) gebruikt hetzelfde adres.
- GitHub maakte `CNAME` tijdens de domeinkoppeling alleen op `main` aan. Voeg het daarom ook op `develop` toe, zodat een volgende release het bestand niet kwijtraakt.
- `.github/scripts/check-app.mjs` controleert automatisch aanwezigheid en inhoud van `CNAME`. Een mislukte check is een blokkade voor goedkeuring/samenvoegen, maar stopt een onafhankelijke GitHub Pages-deployment niet automatisch. Controleer de checks dus vóór een productie-release.
- Gebruik de normale PR-werkwijze via `develop`; wijzig `main` alleen na expliciete toestemming.
- Houd `CNAME` in de repository, ook wanneer GitHub Pages de domeininstelling al toont. Na elk nieuw releasecommit controleer je de Pages-deployment en het custom domain.

## DNS bij STRATO (ingesteld op 2 november 2026)
- Domein: `gepuzzellig.nl`.
- A-record van het hoofddomein: `185.199.108.153` (STRATO toont één veld).
- AAAA-record: `2606:50c0:8000::153` (STRATO toont één veld).
- `www`-subdomein: CNAME naar `kaasknakker.github.io` (zonder repository-pad of protocol).
- DNSSEC staat aan. Een afzonderlijke GitHub Pages-verificatie-TXT-record is toegevoegd; laat deze behouden.
- GitHub Pages levert zelf HTTPS; een apart betaald STRATO-SSL-certificaat is niet nodig.
- Als STRATO later meerdere A-/AAAA-records ondersteunt, kan de DNS aan GitHubs volledige lijst worden aangepast. Verander geen nameservers of e-mailrecord zonder afzonderlijke reden.

## Firebase Authentication
- Productieproject **`gepuzzelig`** (één l): zowel `gepuzzellig.nl` als `www.gepuzzellig.nl` zijn aan Authorized domains toegevoegd.
- De bestaande `authDomain` in `js/config.js` blijft `gepuzzelig.firebaseapp.com`; dit hoeft niet omgezet te worden naar het nieuwe domein.
- De persoonlijke Firestore-gegevens en Google-identiteiten blijven ongewijzigd bij een domeinwissel.

## PWA en browseropslag
- Een nieuw domein is een **nieuwe origin**: lokale browseropslag, IndexedDB, offline caches en PWA-installaties gaan niet automatisch mee.
- Controleer eerst of onafgemaakte puzzels en resultaten vanaf het nieuwe domein in Firebase zichtbaar zijn.
- Pas daarna oude iPhone/iPad-beginschermiconen vervangen. Voor offline/nooit-gesynchroniseerde puzzels eerst de situatie onderzoeken.

## Controlelijst voor toekomstige releases
1. Zowel `main` als `develop` bevatten `CNAME` met `gepuzzellig.nl`.
2. Integriteitscheck `check-app` en de relevante GitHub Actions zijn groen voor de exacte releasecommit.
3. GitHub Pages toont `gepuzzellig.nl` als custom domain en HTTPS is ingeschakeld.
4. `https://gepuzzellig.nl/` en `https://www.gepuzzellig.nl/` werken en het oude GitHub-adres leidt door.
5. Inloggen met bestaande Google-accounts, eigen resultaten, gezamenlijk overzicht en synchronisatie werken.
6. Testomgeving `gepuzzellig-test.web.app` blijft apart en heeft geen toegang tot productie-Firebase.

Bron: [GitHub — Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
