import urllib.request,re,json,concurrent.futures,time,sys
from pathlib import Path
root=Path(sys.argv[1] if len(sys.argv)>1 else "work/national-festival-research");root.mkdir(parents=True,exist_ok=True); (root/'pages').mkdir(exist_ok=True); (root/'details').mkdir(exist_ok=True)
def get(u):
 for attempt in range(3):
  try:
   with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'TABI festival source review (public factual metadata)'}),timeout=40) as r:s=r.read().decode()
   return json.loads(re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',s)[1])['props']['pageProps']
  except Exception:
   if attempt==2:raise
   time.sleep(2+attempt)
def page(n):
 path=root/'pages'/f'{n}.json'
 if path.exists():return json.loads(path.read_text())
 p=get(f'https://www.japan47go.travel/ja/search/result?page={n}&tag=5')
 rows=[{k:i.get(k) for k in ['articleType','slug','name','categoryTag','prefecture','city','startDate','startDateDisplay','endDate','endDateDisplay','regularFlg','updateDate']} for i in p['items']]
 path.write_text(json.dumps(rows,ensure_ascii=False));return rows
rows=[];fails=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 pending={pool.submit(page,n):n for n in range(1,395)}
 for j,f in enumerate(concurrent.futures.as_completed(pending)):
  try:rows.extend(f.result())
  except Exception as e:fails.append([pending[f],str(e)])
  if (j+1)%40==0:print('Pages',j+1,'records',len(rows),'failed',len(fails),flush=True)
rows=list({r['slug']:r for r in rows}.values());root.joinpath('national-list.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));root.joinpath('failures.json').write_text(json.dumps(fails))
# Only festival/ritual candidates; not exhibitions, leaf-viewing, unrelated tours or generic events.
positive=re.compile('祭|まつり|マツリ|神楽|田楽|踊り|盆踊|獅子舞|曳山|山笠|ねぶた|ねぷた|左義長|どんど|えびす|七夕|節分|花火|火渡|御田植|裸参り|流鏑馬|七日堂|修正会|鬼夜|御燈|御柱|ソーラン|よさこい')
negative=re.compile('中止|休止|終了|休催|開催なし|行いません|スタンプラリー|ワークショップ|セミナー|コンサート|映画|企画展|特別展|収穫体験|マルシェ|クラフト市|物産|フェア|ライトアップ|イルミネーション')
candidates=[r for r in rows if r['articleType']=='event' and positive.search(r['name']) and not negative.search(r['name']) and r.get('prefecture')]
root.joinpath('candidates.json').write_text(json.dumps(candidates,ensure_ascii=False,indent=2));print('Selected',len(candidates),'festival/ritual candidates from',len(rows),'national event entries',flush=True)
def detail(r):
 path=root/'details'/(r['slug']+'.json')
 if path.exists():return
 d=get('https://www.japan47go.travel/ja/detail/'+r['slug'])['article']['data']
 # Retain factual metadata only. Do not reproduce descriptions, images, contact personal data or other prose.
 fields=['subject','slug','nameKana','nameEnglish','nameCommon','startDate','endDate','regularFlg','dateSpecification','canceled','placeName','location','url','updateDate','categoryTag','startDateDisplay','endDateDisplay']
 out={k:d.get(k) for k in fields};out['statusWarning']=bool(re.search('中止|休止|終了しました|開催しません|開催されません|開催なし',str(d.get('importantNotice',''))+' '+str(d.get('notes',''))+' '+str(d.get('description',''))));path.write_text(json.dumps(out,ensure_ascii=False,indent=2))
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 pending={pool.submit(detail,r):r['slug'] for r in candidates}
 for j,f in enumerate(concurrent.futures.as_completed(pending)):
  try:f.result()
  except Exception as e:fails.append([pending[f],str(e)])
  if (j+1)%100==0:print('Details',j+1,'/',len(candidates),'failed',len(fails),flush=True)
root.joinpath('failures.json').write_text(json.dumps(fails));print('DONE',flush=True)
