/** Generates repeatable, reviewable seed SQL separately from schema migrations.
 * Run with: node --experimental-strip-types scripts/import-catalog.ts > work/catalog.sql
 * Imports only reviewed source records. Never promotes recurrence to confirmation. */
import {readFileSync} from 'node:fs';
import {cities,festivals,occurrences,regionFor,verifiedAt} from '../lib/catalog.ts';
import {edges,passes} from '../lib/transport.ts';
const q=(s:unknown)=>s===null?'NULL':"'"+String(s).replaceAll("'","''")+"'";
const statement=(table:string,columns:string[],values:unknown[])=>console.log(`INSERT OR REPLACE INTO ${table} (${columns.join(',')}) VALUES (${values.map(q).join(',')});`);
const source=(id:string,url:string,authority:string,kind:string)=>statement('sources',['id','url','authority','kind','verified_at'],[id,url,authority,kind,verifiedAt]);
source('geography','https://github.com/dataofjapan/land','GSI / Data of Japan','open_geography');
const geo=JSON.parse(readFileSync(new URL('../public/japan.geojson',import.meta.url),'utf8'));
for(const f of geo.features)statement('prefectures',['id','name','japanese_name','region','source_id'],[f.properties.id,f.properties.nam,f.properties.nam_ja,regionFor(f.properties.id),'geography']);
for(const c of cities){source('city-'+c.id,c.source,'Official destination tourism','official_tourism');statement('cities',['id','prefecture_id','payload','source_id'],[c.id,c.prefecture,JSON.stringify(c),'city-'+c.id])}
for(const e of festivals){source('event-'+e.id,e.source,new URL(e.source).hostname,'official_event');statement('events',['id','city_id','payload','source_id'],[e.id,e.cityId,JSON.stringify(e),'event-'+e.id])}
for(const e of occurrences('2026-01-01','2028-12-31'))statement('event_occurrences',['id','event_id','year','start_date','end_date','confidence','cancelled','source_id','verified_at'],[e.occurrenceId,e.id,e.year,e.start,e.end,e.confidence,0,'event-'+e.id,verifiedAt]);
for(const [i,e] of edges.entries()){source('transport-'+i,e.source,e.operator,'official_operator');statement('transport_services',['id','operator','payload','source_id'],['service-'+i,e.operator,JSON.stringify({...e,provenance:'derived_planning_estimate'}),'transport-'+i])}
for(const p of passes){source('pass-'+p.id,p.source,p.provider,'official_pass');statement('rail_passes',['id','payload','source_id'],[p.id,JSON.stringify(p),'pass-'+p.id])}
