import {identity,fail} from '@/lib/server';
import {googleConfigured} from '@/lib/google-auth';
export async function GET(){try{return Response.json({...await identity(),googleEnabled:googleConfigured()},{headers:{'Cache-Control':'no-store'}})}catch(e){return fail(e)}}
