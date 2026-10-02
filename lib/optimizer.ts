import {cities,cityById,occurrences,modes} from './catalog.ts';
import type {City,Occurrence} from './catalog.ts';
import {festivalAccess,festivalKey} from './festival-access.ts';
import {route,comparePasses} from './transport.ts';
import type {Leg} from './transport.ts';
export type PlannerInput={start:string;end:string;mode:string;intensity:string;transport:string;entry:string;exit?:string;locked:{cityId:string;nights:number}[];excluded:string[];mustAttend:string[];saved:string[]};
export type PlannedFestival=Occurrence&{baseCityId:string;distanceKm:number;visitDate:string};
export type Stop={cityId:string;arrival:string;departure:string;nights:number;events:PlannedFestival[];reasons:string[];locked:boolean};
export type Journey={stops:Stop[];legs:Leg[];score:{festival:number;destination:number;travelPenalty:number;hotelPenalty:number;uncertaintyPenalty:number;total:number};warnings:string[];pass:ReturnType<typeof comparePasses>};
const day=86400000;
export function dateAdd(date:string,n:number){return new Date(Date.parse(date+'T00:00:00Z')+n*day).toISOString().slice(0,10)}
export function days(a:string,b:string){return Math.round((Date.parse(b)-Date.parse(a))/day)}
export function optimize(p:PlannerInput):Journey{
 const routable=cities.filter(c=>!c.discoveryOnly),totalNights=days(p.start,p.end),finish=p.exit||null;
 if(totalNights<1||totalNights>60)throw new Error('Choose a trip between 2 and 61 calendar days.');
 if(!modes.includes(p.mode))throw new Error('Unknown itinerary mode.');
 if(!routable.some(c=>c.id===p.entry)||finish&&!routable.some(c=>c.id===finish))throw new Error('Choose supported start and finish cities.');
 if(p.excluded.includes(p.entry)||finish&&p.excluded.includes(finish))throw new Error('Your start and finish cities cannot be excluded.');
 const locked=new Map(p.locked.map(l=>[l.cityId,l.nights]));
 if(locked.size!==p.locked.length||p.locked.some(l=>!routable.some(c=>c.id===l.cityId)||!Number.isInteger(l.nights)||l.nights<1))throw new Error('Invalid locked stop.');
 if([...locked.values()].reduce((a,b)=>a+b,0)>totalNights)throw new Error('Locked nights exceed the trip.');
 if(p.locked.some(l=>p.excluded.includes(l.cityId)))throw new Error('A destination cannot be both locked and excluded.');
 const discovered=occurrences(p.start,p.end);
 const events:PlannedFestival[]=discovered.flatMap(e=>{const a=festivalAccess(e);return e.confidence!=='season'&&a?[{...e,baseCityId:a.cityId,distanceKm:a.distanceKm,visitDate:e.start}]:[]});
 for(const id of p.mustAttend){
  if(!events.some(e=>e.id===id))throw new Error(discovered.some(e=>e.id===id&&e.confidence==='season')?'This festival has only an approximate season. Wait for announced dates before marking it must attend.':'A must-attend festival is outside these dates or beyond the supported city network. Move the window or change its priority.');
 }
 const maxStops=Math.min(totalNights,routable.length+(finish===p.entry?1:0),Math.max(finish&&finish!==p.entry?2:1,p.intensity==='Relaxed'?Math.floor(totalNights/4):p.intensity==='Intensive'?Math.ceil(totalNights/2):Math.ceil(totalNights/3))+(finish===p.entry?1:0));
 const modeTag:Record<string,string>={'Culture & History':'culture','Nature & Scenery':'nature','Photography':'photography','Food':'food','Hidden Japan':'hidden','Classic First Trip':'classic'};
 const eventByCity=new Map(routable.map(c=>[c.id,events.filter(e=>e.baseCityId===c.id)]));
 const routeCache=new Map<string,ReturnType<typeof route>>(),stayCache=new Map<string,PlannedFestival[]>();
 function travel(a:string,b:string){const key=a+':'+b;if(!routeCache.has(key))routeCache.set(key,route(a,b,p.transport));return routeCache.get(key)!}
 function stayEvents(c:City,used:number,nights:number,minutes:number){
  // Long transfer days are kept free of festival attendance assumptions.
  const first=used+(minutes>180?1:0),key=c.id+':'+first+':'+(used+nights);
  if(first>=used+nights)return [];
  if(!stayCache.has(key)){const arrival=dateAdd(p.start,first),departure=dateAdd(p.start,used+nights);stayCache.set(key,(eventByCity.get(c.id)??[]).filter(e=>e.end>=arrival&&e.start<departure).map(e=>({...e,visitDate:e.start>arrival?e.start:arrival})));}
  return stayCache.get(key)!;
 }
 function value(c:City,ev:PlannedFestival[],minutes:number){return 24+(c.tags.includes(modeTag[p.mode])?30:0)+(p.saved.includes(c.id)?20:0)+ev.reduce((s,e)=>s+e.importance*(p.mode==='Maximum Festivals'?10:5)+(p.saved.includes(e.id)?15:0),0)-minutes*(p.mode==='Minimum Travel'?.22:.055)-(p.intensity==='Relaxed'?15:8)-ev.filter(e=>e.confidence!=='confirmed').length*4}
 type State={stops:Stop[];legs:Leg[];score:number;used:number;travelMinutes:number;eventIds:Set<string>;mustIds:Set<string>;lockIds:Set<string>};
 let beam:State[]=[{stops:[],legs:[],score:0,used:0,travelMinutes:0,eventIds:new Set(),mustIds:new Set(),lockIds:new Set()}],finished:State[]=[];
 function compare(a:State,b:State){return b.mustIds.size-a.mustIds.size||b.lockIds.size-a.lockIds.size||(p.mode==='Maximum Festivals'?b.eventIds.size-a.eventIds.size||a.travelMinutes-b.travelMinutes||a.stops.length-b.stops.length:0)||b.score-a.score}
 for(let depth=0;depth<maxStops;depth++){
  const buckets=new Map<number,State[]>();
  for(const state of beam){
   const usedCities=new Set(state.stops.map(s=>s.cityId)),remaining=totalNights-state.used;
   for(const c of routable){
    const returning=!!finish&&c.id===finish&&c.id===p.entry&&depth>0;
    if(p.excluded.includes(c.id)||usedCities.has(c.id)&&!returning||depth===0&&c.id!==p.entry)continue;
    // A chosen finish city is the final stay, except the starting stay of a round trip.
    const finalOnly=!!finish&&c.id===finish&&(depth>0||finish!==p.entry);
    const from=state.stops.at(-1)?.cityId,t=from?travel(from,c.id):null;if(from&&(!t||from===c.id))continue;
    const lockNights=returning?undefined:locked.get(c.id);
    const base=lockNights??(p.intensity==='Intensive'?Math.max(1,c.nights-1):p.intensity==='Relaxed'?c.nights+1:c.nights);
    const choices=finalOnly?[remaining]:lockNights!==undefined?[base]:Array.from({length:remaining},(_,i)=>i+1);
    for(const nights of choices){
     if(nights>remaining||nights<1||lockNights!==undefined&&nights!==base)continue;
     if(t&&t.minutes>600&&nights<3)continue;
     const used=state.used+nights,ends=used===totalNights;
     if(ends&&finish&&c.id!==finish||!ends&&depth===maxStops-1)continue;
     const newLockIds=new Set(state.lockIds);if(locked.has(c.id))newLockIds.add(c.id);
     const required=[...locked].filter(([id])=>!newLockIds.has(id)).reduce((sum,[,n])=>sum+n,0);
     if(totalNights-used<required||!ends&&finish&&c.id!==finish&&totalNights-used<Math.max(1,locked.get(finish)??1))continue;
     const unique=new Map<string,PlannedFestival>();for(const e of stayEvents(c,state.used,nights,t?.minutes??0)){const key=festivalKey(e)+'-'+e.year+'-'+e.start;if(state.eventIds.has(key))continue;const previous=unique.get(key);if(!previous||p.mustAttend.includes(e.id)&&!p.mustAttend.includes(previous.id)||e.importance>previous.importance&&!p.mustAttend.includes(previous.id))unique.set(key,e)}
     const ev=[...unique.values()];
     const eventIds=new Set(state.eventIds),mustIds=new Set(state.mustIds);for(const e of ev){eventIds.add(festivalKey(e)+'-'+e.year+'-'+e.start);for(const id of p.mustAttend)if(festivalKey({id})===festivalKey(e))mustIds.add(id)}
     const stop:Stop={cityId:c.id,arrival:dateAdd(p.start,state.used),departure:dateAdd(p.start,used),nights,events:ev,locked:lockNights!==undefined,reasons:[]};
     const s:State={stops:[...state.stops,stop],legs:t?[...state.legs,{...t,date:stop.arrival}]:state.legs,score:state.score+value(c,ev,t?.minutes??0),used,travelMinutes:state.travelMinutes+(t?.minutes??0),eventIds,mustIds,lockIds:newLockIds};
     if(ends){if(newLockIds.size===locked.size&&mustIds.size===new Set(p.mustAttend).size){finished.push(s);finished.sort(compare);if(finished.length>24)finished.length=24}}else{const list=buckets.get(s.used)??[];list.push(s);list.sort(compare);if(list.length>16)list.length=16;buckets.set(s.used,list)};
    }
   }
  }
  // Keep alternatives for each arrival day so long stays cannot crowd out festival-aligned routes.
  beam=[...buckets.values()].flat();if(!beam.length)break;
 }
 if(!finished.length)throw new Error('No feasible route preserves your cities, nights and festival priorities. Try fewer locks, more days or different start and finish cities.');
 const best=finished.sort(compare)[0],included=best.stops.flatMap(s=>s.events);
 for(const [i,s] of best.stops.entries()){
  const c=cityById.get(s.cityId)!;
  s.reasons=[`${s.events.length} dated festival opportunities overlap this stay.`,...(c.tags.includes(modeTag[p.mode])?[`Strong match for ${p.mode.toLowerCase()}.`]:[]),`${c.attractions.slice(0,2).join(' and ')} add destination value.`,...(i===0?['Your selected start city.']:[]),...(finish&&i===best.stops.length-1?['Your selected finish city.']:[]),...(s.locked?['You locked this destination and its nights.']:[]),...(s.events.some(e=>e.cityId!==s.cityId)?['Nearby festival venues are within 25 km in a straight line. Check local transport and programme times before choosing visits.']:[])];
 }
 const festival=included.reduce((s,e)=>s+e.importance*(p.mode==='Maximum Festivals'?10:5),0),travelPenalty=Math.round(best.legs.reduce((s,l)=>s+l.minutes,0)*(p.mode==='Minimum Travel'?.22:.055)),hotelPenalty=(best.stops.length-1)*(p.intensity==='Relaxed'?15:8),uncertaintyPenalty=included.filter(e=>e.confidence!=='confirmed').length*4;
 return {stops:best.stops,legs:best.legs,score:{festival,destination:Math.round(best.score-festival+travelPenalty+hotelPenalty+uncertaintyPenalty),travelPenalty,hotelPenalty,uncertaintyPenalty,total:Math.round(best.score)},warnings:[...(included.length?['Festival opportunities overlap your stays; select visits after checking programme times. Events on the same day may conflict. Expected dates require confirmation.']:['No dated festival opportunities fit this route and its constraints. Try different dates, start/finish cities or fewer locked stops. Seasonal listings are excluded from attendance scoring.']),...(p.mode==='Maximum Festivals'?['Festival mode prioritizes dated opportunities, then less travel and fewer hotel changes among the routes searched.']:[]),'Festival routing covers supported overnight cities and nearby venues within 25 km. More distant venues remain available in the calendar.','Intercity travel times and fares are estimates. Local festival transfers are not included in fares or rail-pass savings.',...(best.legs.some(l=>l.minutes>360)?['A long travel day is included; its arrival day is kept free of festival visits.']:[])],pass:comparePasses(best.legs)};
}
