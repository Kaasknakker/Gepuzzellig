# Product- en UX-visie Gepuzzellig

Status: blijvend productkader. Dit document beschrijft richting en ontwerpprincipes; het is geen tijdelijke featureplanning en geen vervanging voor de actuele code, architectuurdocumentatie of testafspraken.

## 1. Productidentiteit

Gepuzzellig draait om **dagelijks puzzelen, je eigen favoriete puzzels en licht sociaal contact met mensen die je kent, zonder harde competitie**.

De app mag functioneel en technisch groeien, maar moet eenvoudig blijven aanvoelen. Nieuwe mogelijkheden zijn geen reden om automatisch meer informatie, bediening of keuzes tegelijk te tonen.

Kernregel:

> **De puzzelcatalogus mag groeien. Home groeit alleen mee met de voorkeuren van de gebruiker.**

Kwaliteit gaat boven hoeveelheid. Gepuzzellig moet geen generieke verzameling minigames worden.

## 2. Hoofdstructuur

De blijvende conceptuele indeling is:

- **Home:** mijn puzzels en wat ik nu kan doen.
- **Puzzelen:** het volledige puzzelaanbod.
- **Groepen:** samen puzzelen en groepszaken.
- **Profiel:** persoonlijke en accountinstellingen.

Concrete schermindelingen mogen evolueren wanneer gebruikerstests daar aanleiding toe geven, zolang deze verantwoordelijkheden begrijpelijk blijven.

## 3. Home en favorieten

Home is een persoonlijke snelstart, geen volledige catalogus.

### Favorieten

Er is één begrijpelijk favorietenconcept:

> **Favoriet = deze puzzelsoort hoort bij mijn persoonlijke Home.**

Maak niet zonder duidelijke gebruikersreden afzonderlijke favorietensystemen voor dagpuzzels en vrij puzzelen.

Favorieten bepalen welke puzzelsoorten prominent op Home staan. Andere persoonlijke eigenschappen, zoals dagmoeilijkheid, kunnen per puzzel apart worden opgeslagen.

### Wat Home mag bieden

Home kan, afhankelijk van de actuele toestand, bevatten:

- favoriete dagpuzzels;
- openstaande puzzels / Verder puzzelen;
- **Vrij puzzelen** als snelle start voor favoriete puzzelsoorten;
- een compacte sociale/groepsweergave;
- een duidelijke actie zoals **Meer puzzels** naar de volledige catalogus.

Vrij puzzelen hoort dus bewust op Home te blijven. Ook wanneer de dagpuzzels klaar zijn moet een gebruiker vanaf Home gemakkelijk een nieuwe vrije puzzel kunnen starten.

## 4. Puzzelen en groei van de catalogus

Puzzelen is de volledige catalogus en moet schaalbaar zijn naar ongeveer 20 of meer kwalitatief goede puzzelsoorten zonder Home onoverzichtelijk te maken.

Wanneer het aanbod groot genoeg is, mogen categorieën worden gebruikt. Mogelijke richtingen zijn bijvoorbeeld:

- Logica
- Woorden
- Rekenen
- Beeld/patronen
- Gepuzzellig Originals

Dit zijn **geen definitief vastgelegde categorieën**. Gebruik alleen categorieën die door het daadwerkelijke aanbod logisch worden gedragen; maak geen kunstmatige categorieën om een structuur te vullen.

Favorieten kunnen dwars door categorieën heen lopen. Het volledige puzzeloverzicht is een logische plek om favorieten direct te kunnen toevoegen of verwijderen.

Toekomstige woordpuzzels zoals woordzoeker, kruiswoord, paardensprong en een eigen woordraadspel zijn productrichtingen, geen opdracht om ze nu te bouwen.

## 5. Informatiehiërarchie en responsive ontwerp

Ontwerp eerst robuust voor smalle iPhone-schermen en grotere tekst en schaal daarna op naar iPad en desktop.

Een desktopindeling hoeft niet met uitzonderingen in één regel op telefoon te worden geperst. Dezelfde informatiehiërarchie mag op een smal scherm meerdere regels of een andere fysieke indeling gebruiken.

Bij compacte puzzelweergaven geldt:

1. puzzelidentiteit moet direct herkenbaar zijn;
2. eigen status/voortgang is belangrijker dan secundaire sociale details;
3. de primaire actie (bijvoorbeeld Start, Verder of Bekijk) moet duidelijk en goed aanraakbaar zijn;
4. aanvullende informatie mag secundair of uitklapbaar zijn;
5. voorkom dubbele informatie die hetzelfde vertelt zonder extra waarde.

Controleer relevante wijzigingen waar passend op smalle en normale iPhone, grotere tekst, iPad portrait/landscape en desktop, inclusief touch, muis/toetsenbord en waar relevant Apple Pencil.

## 6. Browser, PWA en puzzelvariant

De fysieke apparaatklasse en de bedoelde puzzelvariant moeten voorspelbaar zijn. Dezelfde gebruiker op hetzelfde apparaat krijgt in Safari/browser en als geïnstalleerde PWA normaal dezelfde bord-/puzzelvariant.

- Houd responsive UI-layout en de keuze van puzzelvariant conceptueel gescheiden.
- Baseer een apparaatvariant niet onnodig op browser- of standalone-status.
- Een ontwikkeloverride mag alleen bewust en tijdelijk werken en mag normaal gebruik niet persistent veranderen.
- Portrait/landscape mag niet onverwacht een andere dagelijkse puzzel opleveren wanneer het conceptueel hetzelfde apparaat blijft.
- Bestaande voortgang en resultaten van oudere telefoon- of groot-schermvarianten moeten bereikbaar blijven.
- Behandel dit als een generiek productprincipe, niet als een Binair-specifieke uitzondering.

## 7. Groepen en sociale laag

De onderliggende architectuur mag uitgebreid zijn; de gebruikersinterface gebruikt menselijke taal.

Interne begrippen zoals `membership`, `playerId`, readmodel, projectie of canonical result horen niet in normale gebruikersschermen wanneer een begrijpelijk gebruikersbegrip bestaat, zoals **Mijn groepen**, **Groepsleden**, **Uitnodigen** of **Groep beheren**.

De sociale laag is ondersteunend en gezellig. Vermijd ontwerpkeuzes die Gepuzzellig onnodig competitief maken.

Groepsweergaven moeten schaalbaar blijven wanneer het aantal puzzelsoorten groeit. Gebruik begrijpelijke tekst boven cryptische notatie wanneer ruimte en context daarom vragen.

## 8. Profiel

Profiel is voor persoonlijke en accountinstellingen en mag geen verzamelbak worden voor functies die logischer bij Puzzelen of Groepen horen.

Een instelling moet waar mogelijk ook te beheren zijn op de plek waar de gebruiker het effect ervan begrijpt. Favorieten uitsluitend diep in Profiel beheren is bijvoorbeeld minder direct dan ze ook vanuit het puzzelaanbod kunnen aanpassen.

## 9. Puzzelmetadata en interne identiteit

De bestaande puzzle registry is de natuurlijke centrale bron voor gedeelde metadata van puzzelsoorten. Vermijd dezelfde puzzelmetadata op meerdere plekken hardcoden.

Houd rekening met concepten zoals:

- stabiele interne puzzle-id;
- zichtbare naam of naam-key;
- actief/inactief;
- categorie;
- favoriet/default favorite;
- dagpuzzelondersteuning;
- moeilijkheidsniveaus;
- kleur en functioneel icoon;
- taalafhankelijkheid.

De **interne puzzle-id staat los van de zichtbare naam**. Een puzzel moet later kunnen worden hernoemd of per taal anders heten zonder gebruikersdata te hoeven migreren.

## 10. Nederlands-first, international-ready

Gepuzzellig blijft voorlopig Nederlands. Bouw niet preventief een volledige internationale versie of zwaar lokalisatieframework zonder concrete behoefte.

Voorkom wel nieuwe technische schuld die internationalisering onnodig moeilijk maakt:

- zichtbare namen niet als opslagidentiteit gebruiken;
- nieuwe UI-teksten waar praktisch centraliseerbaar/vertalbaar houden;
- geen onnodige Nederlandse aannames in datum-, tijd-, week- of tekstlayout;
- taalafhankelijke puzzelcontent later per locale kunnen scheiden;
- taalneutrale en taalafhankelijke puzzelsoorten kunnen onderscheiden.

Engels is een logische eerste extra taal wanneer internationalisering daadwerkelijk aan de orde is.

## 11. Naamgeving en eigen identiteit

Bekende, juridisch veilige puzzelnamen hoeven niet geforceerd een woordgrap te krijgen. Eigen Gepuzzellig-concepten mogen een herkenbare, speelse naamstijl krijgen.

Brainstormnamen zoals **Sterk**, **Zeskundig**, **Hexact**, **Optellig**, **Hoofdsom**, **Sompig** en **LogiCase** zijn **geen definitieve productbesluiten**. Voer zulke namen niet automatisch door en doe vóór publieke/commerciële toepassing waar nodig een actuele merk-/juridische controle.

## 12. Visuele taal en toegankelijkheid

- Gebruik consistente functionele SVG/line-iconen waar functies een icoon nodig hebben.
- Gebruik emoji bewust als speels of statusgericht element, niet willekeurig als functioneel icoon.
- Houd primaire acties voldoende groot voor touch.
- Bewaar duidelijke focus, toetsenbordbediening, reduced-motion-ondersteuning en voldoende contrast.
- Communiceer betekenis niet uitsluitend met kleur.
- Grotere tekst en iOS-safe-areas zijn onderdeel van normaal responsive ontwerp.
- Bestaande goede toegankelijkheidsvoorzieningen niet herschrijven zonder concrete reden.

## 13. Frontend-onderhoud

Voorkom pleisters op pleisters en steeds meer specifieke responsive uitzonderingen.

Een groot bestand hoeft niet om architecturale schoonheid ineens te worden herschreven. Gebruik waar passend het principe:

> **Extract while changing.**

Wanneer een afgebakend onderdeel toch substantieel wordt gewijzigd, mag het veilig worden losgemaakt uit een te breed bestand als dat onderhoudbaarheid aantoonbaar verbetert zonder onnodig migratierisico.

## 14. Toekomstige productrichting

Meer puzzelsoorten zijn welkom wanneer ze kwalitatief goed zijn en cognitief voldoende variëren. Bekende puzzels kunnen instap en herkenning bieden; eigen puzzels geven Gepuzzellig identiteit.

Moeilijkheid hoort op langere termijn waar mogelijk meer te betekenen dan alleen bordgrootte. Een solver/hint-engine kan later helpen gegenereerde puzzels te beoordelen op deductiekwaliteit, benodigde technieken, routinewerk, uniciteit en interessante stappen.

Dit is richting, geen verplichte scope voor huidige migratie- of polishfasen.

## 15. Besluit versus richting

Bij gebruik van dit document altijd onderscheid maken tussen:

**Vast productkader**
- Home blijft persoonlijk en compact.
- Favorieten bepalen welke puzzelsoorten op Home staan.
- Vrij puzzelen blijft als favorieten-snelstart op Home.
- De volledige catalogus hoort bij Puzzelen.
- Groepen zijn een lichte sociale laag, geen harde competitie.
- Interne puzzle-id en zichtbare naam zijn gescheiden.
- Browser en PWA gebruiken op hetzelfde fysieke apparaat voorspelbaar dezelfde bedoelde puzzelvariant.
- Eenvoud en kwaliteit gaan boven het tonen van alle mogelijkheden.

**Richtinggevend / nog te valideren**
- exacte categorie-indeling;
- concrete toekomstige puzzelsoorten;
- definitieve puzzelnamen;
- exacte responsive componentlayout;
- moment en vorm van internationalisering;
- commerciële functies en monetisatie.

Nieuwe gebruikerstests of aantoonbaar betere oplossingen mogen richtinggevende punten veranderen. Wijzig een vast productkader alleen bewust en documenteer waarom.
