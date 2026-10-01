import {inputSchema,body,fail} from '@/lib/server';
import {optimize} from '@/lib/optimizer';
import {occurrences,cities,verifiedAt} from '@/lib/catalog';
export async function GET(request:Request){const u=new URL(request.url);const start=u.searchParams.get('start')??'2026-10-03',end=u.searchParams.get('end')??'2026-10-17';if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end))return Response.json({error:'Invalid dates'},{status:400});return Response.json({cities,events:occurrences(start,end),verifiedAt},{headers:{'Cache-Control':'public,max-age=300'}})}
export async function POST(request:Request){try{const p=inputSchema.parse(await body(request));return Response.json({journey:optimize(p)})}catch(e){return fail(e)}}
