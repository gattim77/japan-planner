"""Local-only checks for public browsing and account boundaries."""
import os,json,urllib.request,urllib.error,uuid
base=os.environ.get('API_BASE','http://127.0.0.1:8795')
assert base.startswith('http://127.0.0.1:')
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(NoRedirect)
def call(path,data=None,cookie=None,origin=None):
 h={'Content-Type':'application/json','Origin':origin or base,'oai-authenticated-user-id':'spoof','oai-authenticated-user-email':'owner@example.test'}
 if cookie:h['Cookie']=cookie
 q=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers=h)
 try:r=opener.open(q)
 except urllib.error.HTTPError as e:r=e
 return r.status,r.headers,r.read()
assert call('/')[0]==200
assert call('/api/planner')[0]==200
assert call('/api/account')[0]==401
assert call('/api/trips')[0]==401
assert call('/api/saved-events')[0]==401
assert call('/login')[0]==200
assert b'Owner invitation' not in call('/register')[2]
credentials={'email':'public-'+str(uuid.uuid4())+'@example.test','name':'Local visitor','password':'test-password-1234','returnTo':'https://attacker.test'}
assert call('/api/auth/register',credentials,origin='https://different.example')[0]==403
status,h,b=call('/api/auth/register',credentials)
assert status==200,(status,b)
assert json.loads(b)['returnTo']=='/'
cookie=h['Set-Cookie'].split(';')[0]
assert all(x in h['Set-Cookie'] for x in ['Secure','HttpOnly','SameSite=Lax','Path=/'])
assert call('/api/account',cookie=cookie)[0]==200
assert call('/api/auth/logout',{},cookie=cookie)[0]==200
assert call('/api/account',cookie=cookie)[0]==401
assert call('/')[0]==200
assert call('/api/auth/google',{},origin='https://different.example')[0]==403
assert call('/api/auth/google',{})[0]==503
status,h,b=call('/api/auth/google/callback?state=bad&code=bad')
assert status==303 and 'error=google_unavailable' in h['Location']
email='lock-'+str(uuid.uuid4())+'@example.test'
for i in range(8):assert call('/api/auth/login',{'email':email,'password':'incorrect'})[0]==401
assert call('/api/auth/login',{'email':email,'password':'incorrect'})[0]==429
print('PASS: public pages/planner, open email registration, cookie flags, CSRF, spoof rejection, account protection, logout and login lockout')
