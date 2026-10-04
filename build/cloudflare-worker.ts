import handler from 'vinext/server/fetch-handler';
import {digest} from '../lib/auth-storage';
export default {
 async fetch(request:Request, env:Cloudflare.Env, ctx:ExecutionContext){
  const url=new URL(request.url);
  const publicRoute=['/login','/register','/api/auth/login','/api/auth/register','/api/auth/logout'].includes(url.pathname);
  if(env.PRIVATE_SITE !== 'false' && !publicRoute){
   const token=request.headers.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith('__Host-tabi-session='))?.slice('__Host-tabi-session='.length);
   const session=token&&/^[A-Za-z0-9_-]{40,100}$/.test(token)&&env.DB ? await env.DB.prepare('SELECT s.expires_at, u.email FROM app_sessions s JOIN app_users u ON u.id=s.user_id WHERE s.token_hash=?').bind(await digest(token)).first<{expires_at:number;email:string}>():null;
   if(!session || session.expires_at<=Date.now() || !env.OWNER_EMAIL || session.email!==env.OWNER_EMAIL.toLowerCase()){
    if(url.pathname.startsWith('/api/'))return Response.json({error:'Sign in to access this private travel space.'},{status:401,headers:{'Cache-Control':'no-store'}});
    return Response.redirect(new URL('/login?returnTo='+encodeURIComponent(url.pathname+url.search),url.origin),302);
   }
  }
  const response=await handler.fetch(request,env,ctx);
  const headers=new Headers(response.headers); headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  if(url.pathname.startsWith('/api/auth/')||env.PRIVATE_SITE!=='false')headers.set('Cache-Control','no-store');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }
};
