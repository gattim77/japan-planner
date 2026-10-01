import assert from 'node:assert/strict';
import {optimize,days} from '../lib/optimizer.ts';
import {festivalAccess,festivalKey} from '../lib/festival-access.ts';
import {festivals} from '../lib/catalog.ts';
const p={start:'2026-10-03',end:'2026-10-17',mode:'Maximum Festivals',intensity:'Balanced',transport:'Fastest',entry:'tokyo',exit:'osaka',locked:[],excluded:[],mustAttend:[],saved:[]};
function check(input){const j=optimize(input);assert.equal(j.stops[0].cityId,input.entry);if(input.exit)assert.equal(j.stops.at(-1).cityId,input.exit);assert.equal(j.stops[0].arrival,input.start);assert.equal(j.stops.at(-1).departure,input.end);assert.equal(j.stops.reduce((n,s)=>n+s.nights,0),days(input.start,input.end));assert.equal(j.legs.length,j.stops.length-1);for(const [i,s] of j.stops.entries()){if(i)assert.equal(s.arrival,j.stops[i-1].departure);for(const e of s.events){assert.ok(e.confidence!=='season');assert.ok(e.visitDate>=s.arrival&&e.visitDate<s.departure);assert.equal(festivalAccess(e)?.cityId,s.cityId);assert.ok(e.distanceKm<=25)}}return j}
let start=performance.now();const j=check(p);const keys=j.stops.flatMap(s=>s.events).map(e=>festivalKey(e)+'-'+e.year+'-'+e.start);assert.equal(new Set(keys).size,keys.length);assert.ok(j.stops.some(s=>s.events.length),'Festival optimization must find dated nearby opportunities');assert.ok(j.stops.some(s=>s.events.some(e=>e.cityId!==s.cityId)),'Venue IDs must map to nearby overnight cities');
const balanced=check({...p,mode:'Balanced Japan'});assert.ok(j.stops.flatMap(s=>s.events).length>=balanced.stops.flatMap(s=>s.events).length);
check({...p,exit:'tokyo'});
const round=check({...p,exit:'tokyo',locked:[{cityId:'tokyo',nights:2}]});assert.equal(round.stops[0].nights,2);
const locked=check({...p,exit:'kyoto',locked:[{cityId:'kyoto',nights:3}],mustAttend:['takayama-autumn']});assert.ok(locked.stops.some(s=>s.cityId==='kyoto'&&s.nights===3));assert.ok(locked.stops.flatMap(s=>s.events).some(e=>e.id==='takayama-autumn'));
const near=festivals.find(f=>f.researchTier==='local'&&festivalAccess(f));assert.ok(near);
assert.throws(()=>optimize({...p,exit:'unknown'}),/supported/);assert.throws(()=>optimize({...p,excluded:['osaka']}),/excluded/);
assert.throws(()=>optimize({...p,end:'2026-10-04',locked:[{cityId:'kyoto',nights:3}]}),/Locked nights/);
console.log(`PASS: festival opportunities, start/finish constraints, round trips, festival alignment, locked nights, complete dates and transport continuity (${Math.round(performance.now()-start)}ms).`);
console.log(j.stops.map(s=>({city:s.cityId,nights:s.nights,festivals:s.events.length})));
