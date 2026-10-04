"""Local-only integration tests; independent user namespaces, actual D1 persistence."""
import json,urllib.request,urllib.error,uuid,os
BASE=os.environ.get('API_BASE','http://127.0.0.1:8787');
assert BASE.startswith('http://127.0.0.1:') or BASE.startswith('http://localhost:'), 'Tests must run locally.'
owner='qa-'+str(uuid.uuid4())
sessions={}
def call(path,body=None,who=owner,method=None):
 h={'Content-Type':'application/json','Origin':BASE}
 if who in sessions:h['Cookie']=sessions[who]
 if who:h['oai-authenticated-user-id']=who;h['oai-authenticated-user-email']='qa@sites.test'
 q=urllib.request.Request(BASE+path,data=json.dumps(body).encode() if body is not None else None,headers=h,method=method or ('POST' if body is not None else 'GET'))
 try:
  with urllib.request.urlopen(q) as r:return r.status,json.load(r)
 except urllib.error.HTTPError as e:return e.code,json.load(e)
def register(who):
 email=who+'@example.test'
 data=json.dumps({'name':'Local test','email':email,'password':'local-test-password-123'}).encode()
 req=urllib.request.Request(BASE+'/api/auth/register',data=data,headers={'Content-Type':'application/json','Origin':BASE})
 with urllib.request.urlopen(req) as r:
  assert r.status==200
  sessions[who]=r.headers['Set-Cookie'].split(';')[0]
 return email
owner_email=register(owner)
register('different-user')
# External identity headers cannot authenticate an anonymous caller.
assert call('/api/account',who='spoofed-user')[0]==401
assert call('/api/auth/login',{'email':owner_email,'password':'wrong-password'},who=None)[0]==401
assert call('/api/auth/login',{'email':owner_email,'password':'local-test-password-123'},who=None)[0]==200
p={'start':'2026-10-03','end':'2026-10-17','mode':'Balanced Japan','intensity':'Balanced','transport':'Fastest','entry':'tokyo','locked':[],'excluded':[],'mustAttend':[],'saved':[]}
status,catalog=call('/api/planner?start=2026-10-01&end=2027-10-01');assert status==200 and catalog['coverage']['records']>2500 and catalog['coverage']['prefectures']==47,catalog
assert call('/api/planner?start=2026-02-30&end=2026-03-02')[0]==400
assert call('/api/planner',{**p,'mustAttend':['jp-41-03']})[0]==400
status,j=call('/api/planner',p);assert status==200,j
maximum={**p,'mode':'Maximum Festivals','exit':'osaka'}
status,m=call('/api/planner',maximum);assert status==200,m
assert m['journey']['stops'][0]['cityId']=='tokyo' and m['journey']['stops'][-1]['cityId']=='osaka'
assert any(s['events'] for s in m['journey']['stops'])
assert any(e['cityId']!=s['cityId'] for s in m['journey']['stops'] for e in s['events'])
winter_input={**maximum,'start':'2027-02-20','end':'2027-03-18','exit':'tokyo'}
status,winter_response=call('/api/planner',winter_input);assert status==200,winter_response
winter=winter_response['journey'];assert winter['stops'][0]['cityId']==winter['stops'][-1]['cityId']=='tokyo'
assert sum(s['nights'] for s in winter['stops'])==26
winter_events=[e for s in winter['stops'] for e in s['events']]
assert len(winter_events)>=7 and any(e['id']=='omizutori' for e in winter_events)
assert next(s for s in winter['stops'] if s['cityId']=='nara')['nights']==1
assert 3<=next(s for s in winter['stops'] if s['cityId']=='kyoto')['nights']<=4
assert 'One evening' in next(e for e in winter_events if e['id']=='omizutori')['visitPlan']
assert all(e['confidence'] in ('expected','confirmed') for e in winter_events)
assert call('/api/planner',{**p,'exit':'unknown'})[0]==400
journey=j['journey'];assert sum(s['nights'] for s in journey['stops'])==14
assert all(s['events']==[] or all(e['confidence'] in ('expected','confirmed') for e in s['events']) for s in journey['stops'])
assert len(journey['legs'])==len(journey['stops'])-1
assert all(l['fare']>0 and l['segments'] for l in journey['legs'])
q={**p,'exit':'kyoto','locked':[{'cityId':'kyoto','nights':3}],'mustAttend':['takayama-autumn']}
status,j=call('/api/planner',q);assert status==200,j
assert any(s['cityId']=='kyoto' and s['nights']==3 for s in j['journey']['stops'])
assert any(e['id']=='takayama-autumn' for s in j['journey']['stops'] for e in s['events'])
assert call('/api/planner',{**q,'excluded':['kyoto']})[0]==400
assert call('/api/planner',{**p,'start':'2026-02-30'})[0]==400
assert call('/api/planner',{**p,'end':'2026-10-04','mustAttend':['takayama-autumn']})[0]==400
assert call('/api/trips',who=None)[0]==401
status,t=call('/api/trips',{'name':'Integration test journey','input':q});assert status==201,t
id=t['id'];stored=next(t for t in call('/api/trips')[1]['trips'] if t['id']==id);assert stored['payload']['input']['exit']=='kyoto';assert stored['payload']['journey']['stops'][-1]['cityId']=='kyoto'
assert call('/api/trips/'+id,{'action':'rename','name':'Not yours'},who='different-user',method='PATCH')[0]!=200
assert call('/api/trips/'+id,{'action':'regenerate','input':q},method='PATCH')[0]==200
versions=call('/api/trips/'+id)[1]['versions'];assert len(versions)==1
assert call('/api/trips/'+id,{'action':'restore','versionId':versions[0]['id']},method='PATCH')[0]==200
status,link=call('/api/trips/'+id,{'action':'share'},method='PATCH');assert status==200
assert call('/api/share/'+link['token'],who=None)[0]==200
call('/api/trips/'+id,{'action':'unshare'},method='PATCH');assert call('/api/share/'+link['token'],who=None)[0]==404
assert call('/api/saved-events',{'eventId':'jidai','priority':'High Priority','notes':'Local test'})[0]==200
assert any(e['event_id']=='jidai' for e in call('/api/saved-events')[1]['events'])
assert call('/api/saved-events',who='different-user')[1]['events']==[]
call('/api/saved-events',{'eventId':'jidai','priority':'Interested','remove':True})
assert call('/api/trips/'+id,method='DELETE')[0]==200
assert not any(t['id']==id for t in call('/api/trips')[1]['trips'])
print('PASS: itinerary constraints, date validation, transport legs, authentication, ownership, durable trips, versions, share revocation and festival persistence.')

assert call('/api/auth/logout',{},who=owner)[0]==200
assert call('/api/account',who=owner)[0]==401
print('Local integration: accounts, session revocation, ownership, festival route and persistence passed')
