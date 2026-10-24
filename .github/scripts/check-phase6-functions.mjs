#!/usr/bin/env node
import fs from 'node:fs';
const src=fs.readFileSync('functions/index.js','utf8');
const required=[
 ['project-aware APP_URL','defineString("APP_URL"'],
 ['mail mode','defineString("MAIL_MODE"'],
 ['testproject','gepuzzellig-test'],
 ['test URL','https://gepuzzellig-test.web.app/'],
 ['sink','env.mode === "sink"'],
 ['allowlist','env.mode === "allowlist"'],
 ['productieproject','gepuzzelig'],
 ['productie URL','https://kaasknakker.github.io/Gepuzzellig/'],
 ['onbekend-project blokkade','Onbekend Firebase-project'],
 ['geen hardcoded linkconst','const APP_URL = "']
];
for(const [name,needle] of required.slice(0,-1))if(!src.includes(needle))throw new Error('Functions fase 6 ontbreekt: '+name);
if(src.includes(required.at(-1)[1]))throw new Error('APP_URL is nog hardcoded');
const sinkBlock=src.slice(src.indexOf('if (env.mode === "sink")'),src.indexOf('if (env.mode === "allowlist"'));
if(sinkBlock.includes('fetch('))throw new Error('Test sink mag geen netwerkmail versturen');
const wf=fs.readFileSync('.github/workflows/deploy-test-functions.yml','utf8');
for(const needle of ['workflow_dispatch:','project_id: gepuzzellig-test','--project gepuzzellig-test','MAIL_MODE=sink' ])if(!wf.includes(needle))throw new Error('Test-Functionsworkflow mist veiligheidsborging: '+needle);
if(/FIREBASE_SERVICE_ACCOUNT_GEPUZZELIG[^_]/.test(wf))throw new Error('Test-Functionsworkflow verwijst naar productie-serviceaccount');
if(/--project gepuzzelig(?:\s|$)/.test(wf))throw new Error('Test-Functionsworkflow kan productie targeten');
console.log('Fase 6 Functions-contract: project-aware URL, sink/allowlist en geïsoleerde handmatige testdeploy geslaagd.');
