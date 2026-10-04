"""Local-only verification of the private deployment gate."""
import os,json,urllib.request,urllib.error,uuid
base=os.environ.get('API_BASE','http://127.0.0.1:8795')
assert base.startswith('http://127.0.0.1:')
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(NoRedirect)
def call(path,data=None,cookie=None,origin=None):
 h={'Content-Type':'application/json','Origin':origin or base,'oai-authenticated-user-id':'spoof','oai-authenticated-user-email':'private-owner@example.test'}
 if cookie:h['Cookie']=cookie
 q=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers=h)
 try:r=opener.open(q)
 except urllib.error.HTTPError as e:r=e
 return r.status,r.headers,r.read()
assert call('/')[0]==302
assert call('/api/planner')[0]==401
assert call('/login')[0]==200
credentials={'email':'private-owner@example.test','name':'Private local owner','password':'test-password-1234'}
assert call('/api/auth/register',{**credentials,'invitation':'wrong'})[0]==403
assert call('/api/auth/register',{**credentials,'invitation':'local-test-invitation'},origin='https://different.example')[0]==403
status,h,b=call('/api/auth/register',{**credentials,'invitation':'local-test-invitation'})
if status==409:status,h,b=call('/api/auth/login',credentials)
assert status==200,(status,b)
cookie=h['Set-Cookie'].split(';')[0]
assert call('/api/account',cookie=cookie)[0]==200
assert call('/api/planner?start=2027-02-20&end=2027-03-18',cookie=cookie)[0]==200
assert call('/api/auth/logout',{},cookie=cookie)[0]==200
assert call('/api/planner',cookie=cookie)[0]==401
email='lock-'+str(uuid.uuid4())+'@example.test'
for i in range(8):assert call('/api/auth/login',{'email':email,'password':'incorrect'})[0]==401
assert call('/api/auth/login',{'email':email,'password':'incorrect'})[0]==429
print('PASS: private pages/APIs, owner invitation, spoof rejection, CSRF, owner session, logout revocation and login lockout')
