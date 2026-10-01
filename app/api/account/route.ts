import {identity,fail} from '@/lib/server';
export async function GET(){try{return Response.json(await identity(),{headers:{'Cache-Control':'no-store'}})}catch(e){return fail(e)}}
