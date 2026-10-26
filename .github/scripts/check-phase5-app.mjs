#!/usr/bin/env node
import fs from 'node:fs';
const src=fs.readFileSync('js/firebase.js','utf8');
const must=[
 ['meerdere memberships','currentMemberships'],
 ['pending aanvraag','status:"pending"'],
 ['approved membership','status:"approved"'],
 ['goedkeuren','approveMembership'],
 ['inverse index','playerMemberships'],
 ['groepswissel','pdactivegroup:'],
 ['actuele memberships','watchMyMemberships'],
 ['persoonlijke resultaten','playerResults'],
 ['persoonlijke voortgang','progress",o.uid,"items"']
];
for(const [name,needle] of must)if(!src.includes(needle))throw new Error('Fase 5 ontbreekt: '+name);
const join=src.match(/const joinGroup=async\(\)=>\{[^\n]+/s)?.[0]||'';
if(!join.includes('requestMembership')||join.includes('profiles",auth.currentUser.uid'))throw new Error('Groepscode moet pending membership maken en profiel.groupId niet wijzigen');
const finish=src.match(/const finishOnboarding=async[^\n]+/)?.[0]||'';
if(!finish.includes('requestMembership')||finish.includes('profiles",auth.currentUser.uid'))throw new Error('Onboarding mag groupId niet direct wisselen');
console.log('Fase 5 appcontract: memberships, pending flow, solo en Fase 4 opslag geslaagd.');
