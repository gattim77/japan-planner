"""Local-only OAuth checks with dummy credentials; never follows Google redirects."""
import os,json,urllib.request,urllib.error,urllib.parse
base=os.environ.get('API_BASE','http://127.0.0.1:8795')
assert base.startswith('http://127.0.0.1:')
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(NoRedirect)
def call(path,form=None,cookie=None):
 h={'Origin':base}
 if form is not None:h['Content-Type']='application/x-www-form-urlencoded'
 if cookie:h['Cookie']=cookie
 q=urllib.request.Request(base+path,data=urllib.parse.urlencode(form).encode() if form is not None else None,headers=h)
 try:r=opener.open(q)
 except urllib.error.HTTPError as e:r=e
 return r.status,r.headers,r.read()
assert call('/')[0]==200 # Former private flag is ignored.
assert b'Continue with Google' in call('/login')[2]
status,h,b=call('/api/auth/google',{'returnTo':'//attacker.test'})
assert status==303,(status,b)
target=urllib.parse.urlsplit(h['Location']);params=urllib.parse.parse_qs(target.query)
assert target.netloc=='accounts.google.com'
assert params['scope']==['openid email profile']
assert params['code_challenge_method']==['S256']
assert params['redirect_uri']==[base+'/api/auth/google/callback']
assert len(params['nonce'][0])>=40 and len(params['code_challenge'][0])==43
cookie=h['Set-Cookie'].split(';')[0];state=params['state'][0]
path='/api/auth/google/callback?'+urllib.parse.urlencode({'state':state,'error':'access_denied'})
assert 'error=google_state' in call(path)[1]['Location']
status,h,b=call(path,cookie=cookie)
assert status==303 and 'error=google_cancelled' in h['Location'] and 'returnTo=%2F' in h['Location']
assert 'error=google_state' in call(path,cookie=cookie)[1]['Location'] # Consumed exactly once.
assert call('/api/account',cookie=cookie)[0]==401 # OAuth state cookie cannot become an app session.
print('PASS: public mode, Google button, PKCE, scopes, safe redirect, browser binding, cancellation, replay protection and session separation')
