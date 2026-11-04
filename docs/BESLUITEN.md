# Productbesluiten Gepuzzellig

Genomen door Peter op 27 oktober 2026, bij Operatie Bezemwagen (`docs/VERBETERPLAN.md`, stappen B1–B8), aangevuld op 3 en 4 november (B9–B11).
Iedere bouwer leest dit bestand vóór een stap uit het verbeterplan. Een besluit wijzigen kan alleen Peter; noteer dan datum en reden in de tabel onderaan.

| ID | Besluit | Gevolg in het verbeterplan |
| --- | --- | --- |
| **B1** | **Aparte dagpuzzels voor telefoon en groot scherm: eerst laten onderzoeken.** De bouwer zoekt uit of één dagpuzzel per dag haalbaar is, met een bordvorm die zich aanpast óf een kleinere telefoonvariant die als dezelfde dagpuzzel telt. Daarna kiest Peter. Tot dan blijft het zoals het is. | Nieuwe stap **B1-O** (onderzoek). Uitkomst: korte notitie met per optie wat er verandert aan generators, resultaten, voortgang, statistieken en migratie, en een advies. Geen code. T1 (teksten over varianten) wacht op dit besluit. |
| **B2** | **Navigatie op de iPhone onderaan**, zoals de meeste iPhone-apps. | Stap **S8** wordt uitgevoerd. |
| **B3** | **Emoji alleen in de inhoud**, niet in knoppen, koppen, labels of statussen. Per plek wordt in de emojilijst (stap D3) besloten of iets mag blijven, bijvoorbeeld 💀 bij het slachtoffer in Murdoku. | Stap **D3**: eerst de emojilijst, Peter loopt hem na, dan vervangen. |
| **B4** | **Start-knoppen in de persoonlijke kleur** op Home; op Puzzelen mag de puzzelkleur. De persoonlijke kleur komt ook terug in de achtergrondtint, het welkomstvak en de navigatie. | Stappen **D2**, **D4**, **S1**, **S5**. |
| **B5** | **Groepspagina in drie delen: Overzicht · Activiteit · Statistieken**, zoals `PRODUCT-UX.md` §16. Op de iPhone begint de pagina met een compacte ledenlijst met de week. | Stap **S2**. |
| **B6** | **Woordenlijst overgenomen** zoals in `VERBETERPLAN.md` hoofdstuk 5. Later aanpassen mag. | Stap **T1** en alle nieuwe teksten. |
| **B7** | **Grotere tekst tot de grootste maat.** Bij een web-app betekent dat: inzoomen (aA in Safari, ⌘+ op de Mac). Tot 130 % zonder enig probleem; daarboven zonder overlap (scrollen mag). De iOS-instelling voor tekstgrootte geldt niet voor web-apps. | Stap **D1** (zoomtest in de visuele controle). |
| **B8** | **Murdoku-aanwijzing markeren als “nog nodig” met een vlaggetje** rechts op elk kaartje (optie c, gekozen 27 oktober). Tikken op het kaartje blijft afstrepen zoals nu; het vlaggetje zet “nog nodig” aan of uit. Afgestreept en nog nodig sluiten elkaar uit. | Stap **S10**. |
| **B9** | **Opslagstatus alleen bij een probleem**, als compact icoon in de kop; uitleg en “Opnieuw proberen” in het menu (optie b, gekozen 3 november). | Stap **S15** (klaar, live in v257). |
| **B10** | **Penalty of puntensysteem voor het aantal controles: nog niet besloten.** Nu geldt: onbeperkt en vrij controleren. Voorstel voor later: stille teller of badge zonder straf; opnieuw beoordelen na een paar weken spelen. | Geen stap. Open besluit, zie `VERBETERPLAN.md` hoofdstuk 5. |
| **B11** | **Indeling dagpuzzels (4 november).** Twee onderdelen: **Dagelijkse puzzels** (per soort een dagpuzzel op je eigen vaste niveau; één soort per dag is de **Puzzel van de dag**, voor iedereen gelijk op Normaal, met een bijna vierkante maat die op iPhone en iPad past) en **Vrij puzzelen**. Het vinkje betekent “deze soort vandaag gedaan”, los van niveau en apparaat; resultaten van elkaar zijn altijd zichtbaar (dagpuzzels én vrije puzzels); tijden alleen naast elkaar bij gelijke soort, niveau en bordmaat. **Eén reeks** voor de hele app: elke afgeronde dagpuzzel telt voor de dag; vrij puzzelen niet. Geen weekritme (nog). Telefoon en groot scherm houden eigen bordmaten. Langere termijn: formaat en moeilijkheid los kiezen. Delen van vrije puzzels: voorlopig altijd, later mogelijk een keuze “niet tonen” (raakt Firestore-regels, eerst Peters akkoord). | Uitwerken in B1-O, S1, S2, S8; nog **niet bouwen**. Details en open punten in `VERBETERPLAN.md` hoofdstuk 5. |

## Woordenlijst (B6)

| Gebruik | Niet gebruiken | Opmerking |
| --- | --- | --- |
| Home | Vandaag (als plaatsnaam) | “Naar Home”, niet “Naar Vandaag” |
| Dagpuzzel | dagelijkse puzzel, daily | |
| Vrij puzzelen | oefenpuzzel | |
| Reeks: 1 dag / 3 dagen | dagen reeks | |
| Gebied (Star Battle) | vlak | |
| Leeg vakje | vrij vakje | |
| Groep, groepslid, beheerder | membership, admin | |
| Personen (Murdoku) | cast, personages | “Personen opslaan” |
| Op de telefoon / op een groot scherm | telefoonvariant, apparaatvariant | alleen zolang B1 dat nodig maakt |
| Fout | foutmoment | |
| Hint, klein duwtje, volledige hint | zetje | |

## Wijzigingen

| Datum | Besluit | Wijziging | Reden |
| --- | --- | --- | --- |
| 4 nov | B8 | Ongewijzigd bevestigd: vlaggetje naast afstrepen, die twee sluiten elkaar uit. S10 in het plan was tijdelijk omgezet naar drie standen; teruggezet. “Deels afstrepen per aanwijzing” is een mogelijke uitbreiding en nog niet besloten. | Tegenstrijdigheid gevonden bij onafhankelijke review. |
