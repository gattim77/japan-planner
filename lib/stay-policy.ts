import type {City} from './catalog.ts';
/** Editorial planning defaults, not limits on how long a traveller may stay.
 * Explicit night locks override them. The festival calendar span is unrelated. */
export function stayPolicy(city:City,pace:string){
 if(city.id==='nara')return {min:1,target:1,max:2};
 if(city.id==='kyoto')return {min:pace==='Intensive'?2:3,target:pace==='Relaxed'?4:3,max:4};
 if(city.id==='tokyo')return {min:2,target:pace==='Relaxed'?5:4,max:5};
 if(city.id==='chiba'||city.id==='wakayama')return {min:1,target:2,max:2};
 const target=pace==='Intensive'?Math.max(1,city.nights-1):pace==='Relaxed'?city.nights+1:city.nights;
 return {min:Math.max(1,target-1),target,max:Math.max(3,target)};
}
