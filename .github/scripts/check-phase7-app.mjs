import fs from 'node:fs';
const core=fs.readFileSync('js/core.js','utf8'),fb=fs.readFileSync('js/firebase.js','utf8'),reg=fs.readFileSync('js/puzzle-registry.js','utf8'),html=fs.readFileSync('index.html','utf8'),rules=fs.readFileSync('firestore.rules','utf8');
const need=(src,needle,label)=>{if(!src.includes(needle))throw new Error('Fase 7 ontbreekt: '+label)};
for(const [needle,label] of [['defaultFavorite:true','starterfavorieten'],['dailyLevels:{easy:','semantische moeilijkheid'],['window.PUZZLE_REGISTRY=PUZZLE_REGISTRY','registry export']])need(reg,needle,label);
for(const [needle,label] of [['PLAYER_PREFS','persoonlijke voorkeuren'],['DAILY_PLANS','daily plan gebruik'],['semanticLevel','registry difficulty mapping'],['allTypes.flatMap','volledige vrije catalogus'],['data-home-nav="puzzles"','Puzzelen-navigatie']])need(core,needle,label);
for(const [needle,label] of [['ensureDailyPlan','daily plan snapshot'],['saveDailyDifficulty','dagmoeilijkheid opslaan'],['defaultPrefs(false)','starterset nieuwe speler'],['cleanPrefs(null,true)','legacy backfill']])need(fb,needle,label);
need(core,'data-puzzle-tab="favorites"','Favorieten-tab in Puzzelen');need(core,'data-puzzle-tab="all"','Alle puzzels-tab in Puzzelen');need(core,'data-daily-diff','dagmoeilijkheid in Favorieten');need(rules,'match /dailyPlans/{playerId}/days/{date}','daily plan rules');need(rules,'allow update, delete: if false','immutable daily plan');
console.log('Fase 7 appcontract: favorieten, moeilijkheid, daily plan, vrije catalogus en navigatie geslaagd.');

if(!core.includes('HVIEW==="puzzles"')) fail('zelfstandige Puzzelen-view ontbreekt');
if(!core.includes('HVIEW="puzzles";PUZZLETAB="favorites";renderHome()')) fail('Puzzelen-navigatie opent Favorieten niet');
if(!core.includes('HVIEW="puzzles";PUZZLETAB="all";renderHome()')) fail('Meer puzzels opent Alle puzzels niet');
if(core.includes('setHomeDestination=')) fail('oude verborgen Home/Puzzelen-wissel is nog aanwezig');
