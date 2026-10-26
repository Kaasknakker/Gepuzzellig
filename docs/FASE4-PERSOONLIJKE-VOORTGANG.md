# Persoonlijke voortgang — pre-migratiefix stap 2

Open voortgang, eigen dagresultaten en persoonlijke historie zijn onafhankelijk van de actieve groep. Home, Verder puzzelen en eigen statistieken nemen ook eigen records uit een andere groep of solo mee. Groepsweergaven houden hun bestaande groepsfilter; de oorspronkelijke groep blijft metadata.

## Wissen en hervatten

Wissen vervangt het persoonlijke progress-document door een kleine verwijdermarkering onder dezelfde sleutel. De markering gebruikt het bestaande state-mapcontract: k, at, pc=0 en deleted=true; geen board, notities of undo blijven daarin achter. Zij overschaduwt oude status.progress zonder legacydata destructief te wijzigen. Verwijdermarkeringen zijn geen open puzzels en mogen niet als zodanig worden geteld.

De client bewaart de verwijdertijd lokaal per playerId onder pdprogdeleted:<playerId>. Na offline wissen wordt de markering bij de volgende succesvolle cloudpull opnieuw aangeboden. Oude netwerkantwoorden worden lokaal onderdrukt. Persoonlijke cloudwrites gebruiken een transactie: een oudere schrijfopdracht kan een nieuwere voortgang of verwijdermarkering niet vervangen. Een bewust nieuw begonnen puzzel krijgt een nieuwere tijd en vervangt de markering volledig. Kloktijden volgen de bestaande clienttijdstrategie; sterk afwijkende apparaatklokken blijven een beperking.

De legacyreader haalt alleen de eigen status uit profile.groupId als compatibiliteitsbron; groepswisseling verandert die bron niet. Canonical persoonlijke voortgang blijft de hoofdbron. Telefoon-cloudsynchronisatie blijft zoals vóór deze fix uitgeschakeld.

## Resultaten herstellen

Eigen legacyresultaten worden per playerId gelezen, zonder filter op de actieve groep. Herstelde eigen afrondingen worden niet opnieuw als open puzzel aangeboden. Offline dag- en vrije resultaten die canonical ontbreken worden éénmaal per logische puzzelsleutel persoonlijk hersteld, ongeacht de actieve groep. Een herstelwrite deelt oude historie niet alsnog in huidige groepen: lidmaatschap op het oorspronkelijke afrondingsmoment is daarvoor niet bewezen. Nieuwe normale afrondingen blijven hun bestaande sociale projecties krijgen.

## Controle

check-personal-progress.mjs voert de echte opslag-, verwijder-, merge-, voltooiings- en herstelmethoden uit met geïsoleerde opslaggrenzen. Het controleert wissen/herladen, legacyherimport, late writes, bewust herstarten, offline retry, per-spelerverwijdermarkeringen, groepswisseling/solo, dubbele resultaten en de grens tussen persoonlijk en sociaal. De rules-emulatortest controleert dat alleen de eigenaar een verwijdermarkering kan schrijven/lezen. Beide workflows nemen de nieuwe regressietest mee.

Handmatige test op de testsite: maak een oude en een vrije puzzel open in groep A; wissel naar B en controleer beide; wis één, herlaad en controleer dat die wegblijft; herhaal wissen offline en daarna online; rond de andere af en controleer na groepswisseling/herladen één resultaat. Controleer op een tweede wide-sessie dat wissen en bewust opnieuw beginnen correct synchroniseren. Gebruik alleen testaccounts.
