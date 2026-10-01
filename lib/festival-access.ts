import {cities,cityById} from './catalog.ts';
import type {Festival} from './catalog.ts';
const bases=cities.filter(c=>!c.discoveryOnly);
function distance(a:{lat:number;lng:number},b:{lat:number;lng:number}){
 const rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLng=(b.lng-a.lng)*rad;
 const h=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;
 return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}
const access=new Map(cities.map(venue=>{
 if(!venue.discoveryOnly)return [venue.id,{cityId:venue.id,distanceKm:0}] as const;
 const nearest=bases.map(c=>({cityId:c.id,distanceKm:distance(c,venue)})).sort((a,b)=>a.distanceKm-b.distanceKm)[0];
 return [venue.id,nearest&&nearest.distanceKm<=25?{...nearest,distanceKm:Math.round(nearest.distanceKm*10)/10}:null] as const;
}));
/** Nearby opportunities, not verified local routes or guaranteed attendance. */
export function festivalAccess(f:Pick<Festival,'cityId'>){return access.get(f.cityId)??null}
export function festivalVenue(f:Pick<Festival,'cityId'>){return cityById.get(f.cityId)?.name??f.cityId}
// Two source records for the same Tenson Shrine festival; keep saved IDs compatible.
export function festivalKey(f:Pick<Festival,'id'>){return f.id==='local-c27e2ff9-931c-4970-bede-4d14d50e8bf1'?'jp-25-03':f.id}
