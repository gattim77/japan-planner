/** Calendar dates use UTC arithmetic; today's date uses Japan's festival timezone. */
export function japanToday(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}
export function addCalendarMonths(iso:string,months:number){const [y,m,d]=iso.split('-').map(Number);const target=new Date(Date.UTC(y,m-1+months,1));target.setUTCDate(Math.min(d,new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate()));return target.toISOString().slice(0,10)}
export function rollingWindow(today=japanToday()){return {start:today,end:addCalendarMonths(today,12)}}
export function clampShift(start:string,end:string,delta:number,min:string,max:string){const days=(a:string,b:string)=>(Date.parse(b)-Date.parse(a))/86400000;return Math.max(days(start,min),Math.min(days(end,max),delta))}
export function validCalendarDate(s:string){const d=new Date(s+'T00:00:00Z');return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s}

/** A date-derived draft title; names entered by the traveller take precedence. */
export function defaultTripTitle(start:string,end:string){
 const month=(s:string,withYear=false)=>new Date(s+'T12:00:00Z').toLocaleDateString('en-US',{timeZone:'UTC',month:'long',...(withYear?{year:'numeric' as const}:{})});
 if(start.slice(0,7)===end.slice(0,7))return month(start)+' in Japan';
 const crossYear=start.slice(0,4)!==end.slice(0,4);
 return month(start,crossYear)+(crossYear?' – ':'–')+month(end,crossYear)+' in Japan';
}
