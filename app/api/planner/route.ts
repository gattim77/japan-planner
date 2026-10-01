import {inputSchema,body,fail} from '@/lib/server';
import {optimize,dateAdd} from '@/lib/optimizer';
import {occurrences,cities,festivals,cityById,verifiedAt} from '@/lib/catalog';
import {rollingWindow,validCalendarDate} from '@/lib/date-window';
export async function GET(request:Request){const u=new URL(request.url),horizon=rollingWindow(),start=u.searchParams.get('start')??dateAdd(horizon.start,2),end=u.searchParams.get('end')??dateAdd(horizon.start,16);if(!validCalendarDate(start)||!validCalendarDate(end)||end<start||Number(end.slice(0,4))-Number(start.slice(0,4))>3)return Response.json({error:'Invalid dates or unsupported date span'},{status:400});return Response.json({cities,events:occurrences(start,end),horizon,coverage:{records:festivals.length,prefectures:new Set(festivals.map(f=>cityById.get(f.cityId)?.prefecture)).size},verifiedAt},{headers:{'Cache-Control':'public,max-age=300'}})}
export async function POST(request:Request){try{const p=inputSchema.parse(await body(request));return Response.json({journey:optimize(p)})}catch(e){return fail(e)}}
