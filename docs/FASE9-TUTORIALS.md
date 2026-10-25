# Fase 9 — generieke tutorials + Binair-pilot

Status: geïmplementeerd op `develop` op 25 oktober 2026.

De generieke tutorial-engine leest stappen uit de bestaande puzzle registry. Binair is de pilot met vijf korte stappen over doel, regels en bediening. Nieuwe spelers krijgen de uitleg bij de eerste Binair-puzzel; afronden bewaart `completed`, overslaan `skipped` onder `profiles/{authUid}.preferences.tutorials`. Via **Uitleg → Uitleg stap voor stap** kan de uitleg altijd opnieuw worden gestart. Alleen sluiten bewaart niets.

Voor bestaande/legacy-profielen is de compatibiliteitsdefault bewust `bin: "skipped"`, zodat ervaren productiespelers bij een latere livegang niet onverwacht een beginnersuitleg krijgen. Nieuwe profielen starten met een lege tutorialstatus. `scripts/migrate-phase9.mjs` kan dezelfde default deterministisch op een export toepassen; dry-run is standaard en `--apply` schrijft alleen een nieuw lokaal JSON-bestand, nooit Firebase.

Firestore Rules accepteren het persoonlijke `tutorials`-mapveld binnen preferences. Fase 9 vereist geen Functions-deploy.

## Handmatige smoke-test in test

1. Nieuw solo-testaccount → start Binair → tutorial verschijnt.
2. Rond alle stappen af → volgende Binair opent zonder automatische tutorial.
3. Start opnieuw via **Uitleg → Uitleg stap voor stap**.
4. Nieuw account → **Overslaan** → tutorial komt niet automatisch terug.
5. Sluit zonder afronden/overslaan → tutorial mag later opnieuw verschijnen.
6. Controleer iPhone, iPad en desktop op bruikbare knoppen zonder overflow.
7. Controleer dat andere puzzels ongewijzigd werken.
