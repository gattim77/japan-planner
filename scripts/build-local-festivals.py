# -*- coding: utf-8 -*-
import json,re,calendar,math,unicodedata,collections,datetime,sys
from pathlib import Path
root=Path(sys.argv[1] if len(sys.argv)>1 else "work/national-festival-research")
existing=json.loads((root/'existing.json').read_text())
def norm(s):return re.sub(r'[^\wぁ-んァ-ン一-龯]','',unicodedata.normalize('NFKC',s or '')).lower().replace('matsuri','festival').replace('maturi','festival')
def distance(a,b):return math.hypot((a[0]-b[0])*111,(a[1]-b[1])*90)
# Explicit reconciliation aliases for highlight records whose English/Japanese naming differs.
aliases={'jp-13-01':'神田祭','jp-13-02':'山王祭','jp-13-03':'三社祭','jp-13-04':'深川八幡祭','jp-14-01':'小田原北條五代祭り','jp-14-02':'湘南ひらつか七夕まつり','jp-15-01':'十日町雪まつり','jp-15-02':'長岡まつり大花火大会','jp-16-01':'高岡御車山祭','jp-16-02':'じゃんとこい魚津まつり','jp-16-03':'おわら風の盆','jp-17-01':'青柏祭','jp-18-01':'勝山左義長まつり','jp-18-03':'三国祭','jp-19-01':'信玄公祭り','jp-19-02':'吉田の火祭り','jp-20-02':'野沢温泉道祖神祭り','jp-21-02':'古川祭','jp-21-03':'大垣まつり','jp-22-01':'浜松まつり','jp-22-02':'清水みなと祭り','jp-23-01':'犬山祭','jp-23-02':'尾張津島天王祭','jp-24-01':'桑名石取祭','jp-25-01':'長浜曳山まつり','jp-25-03':'大津祭','jp-27-01':'天神祭','jp-27-03':'今宮戎神社十日戎','jp-28-02':'灘のけんか祭り','jp-28-03':'西宮神社十日えびす','jp-29-01':'なら燈花会','jp-30-02':'淡嶋神社雛流し','jp-30-03':'那智の扇祭り','jp-33-01':'西大寺会陽','jp-35-01':'しものせき海峡まつり','jp-35-02':'防府天満宮御神幸祭','jp-37-01':'さぬき高松まつり','jp-37-02':'丸亀お城まつり','jp-38-01':'うわじま牛鬼まつり','jp-38-02':'新居浜太鼓祭り','jp-38-03':'西条まつり','jp-39-02':'よさこい祭り','jp-40-01':'小倉祇園太鼓','jp-40-02':'戸畑祇園大山笠','jp-40-03':'博多祇園山笠','jp-41-03':'浜崎祇園祭','jp-43-01':'牛深ハイヤ祭り','jp-43-02':'山鹿灯籠まつり','jp-45-01':'日向ひょっとこ夏祭り','jp-46-01':'おはら祭','jp-47-01':'那覇大綱挽まつり','akita-kanto':'秋田竿燈まつり','hirosaki-neputa':'弘前ねぷたまつり','shinjo':'新庄まつり','aoi':'葵祭','gozan':'五山送り火','kurama':'鞍馬の火祭','omizutori':'お水取り','karatsu-kunchi':'唐津くんち'}
records=[];venues=[];rejected=[];seen={};categories=collections.Counter()
weekday={'日':0,'月':1,'火':2,'水':3,'木':4,'金':5,'土':6}
for p in sorted((root/'details').glob('*.json')):
 d=json.loads(p.read_text());loc=d.get('location') or {};pref=int((loc.get('prefecture') or {}).get('key') or 0)
 try:lat=float(loc['latitude']);lng=float(loc['longitude'])
 except (ValueError,KeyError,TypeError):rejected.append([p.stem,'Missing source coordinates']);continue
 if not 1<=pref<=47 or not 20<lat<47 or not 122<lng<155:rejected.append([p.stem,'Invalid geographic facts']);continue
 if d['canceled'] or d['statusWarning']:rejected.append([p.stem,'Cancellation/closure warning']);continue
 ja=d['subject'];en=(d.get('nameEnglish') or '').strip();en=en if en not in ['-','―','なし'] else '';en=re.sub(r'(?<=[a-z])(?=[A-Z])',' ',en)
 if len(norm(en))<3 or len(en)>32 and not re.search(r'\s',en):en=''
 normalized=re.sub(r'第\s*\d+\s*回|20\d\d年?|令和\d+年','',ja).strip();n=norm(normalized)
 dup=next((e for e in existing if e['prefecture']==pref and (n in [norm(e['ja']),norm(aliases.get(e['id']))] or en and norm(en)==norm(e['name']))),None)
 if dup:rejected.append([p.stem,'Existing highlight '+dup['id']]);continue
 if (pref,n) in seen:
  previous=seen[(pref,n)]
  if distance((lat,lng),(previous[0],previous[1]))<1:rejected.append([p.stem,'Duplicate name and venue '+previous[2]]);continue
 seen[(pref,n)]=(lat,lng,p.stem)
 source='https://www.japan47go.travel/ja/detail/'+p.stem;links=d.get('url') or [];organizer=next((x['url'] for x in links if str(x.get('url','')).startswith(('https://','http://'))),None)
 start=d.get('startDate') or '';end=d.get('endDate') or start
 valid=bool(re.fullmatch(r'\d{4}-\d{2}-\d{2}',start) and re.fullmatch(r'\d{4}-\d{2}-\d{2}',end) and end>=start)
 if valid:
  try:datetime.date.fromisoformat(start);datetime.date.fromisoformat(end)
  except ValueError:valid=False
 month=int(start[5:7]) if valid else 0;endMonth=int(end[5:7]) if valid else month
 if not month and d.get('startDateDisplay'):m=re.search(r'(\d+)月',str(d['startDateDisplay']));month=int(m[1]) if m else 0;endMonth=month
 spec=d.get('dateSpecification') or '';years=set(re.findall(r'(?<!\d)(20\d\d)年',spec));years.update(str(2018+int(y)) for y in re.findall(r'令和\s*(\d+)年',spec));years.update(str(1988+int(y)) for y in re.findall(r'平成\s*(\d+)年',spec));titleYears=set(re.findall(r'(?<!\d)(20\d\d)(?!\d)',ja));dateYear=start[:4] if valid else ''
 conflict=bool(valid and (years and dateYear not in years or titleYears and dateYear not in titleYears))
 approximate=bool(d.get('startDateDisplay') or d.get('endDateDisplay'))
 archival=bool(valid and dateYear<'2025')
 span=(datetime.date.fromisoformat(end)-datetime.date.fromisoformat(start)).days if valid else 0
 series=span>31
 sessions=[]
 explicitDates=list(dict.fromkeys(re.findall(r'(20\d\d)年\s*(\d{1,2})月\s*(\d{1,2})日',spec)))
 if series and not conflict and not archival and len(explicitDates)>=3:
  for yy,mm,dd in explicitDates:
   try:session=datetime.date(int(yy),int(mm),int(dd)).isoformat()
   except ValueError:continue
   if start<=session<=end:sessions.append({'start':session,'end':session,'source':source})
 rule={'kind':'season' if month else 'undated'};day=1;endDay=calendar.monthrange(2026,endMonth)[1] if endMonth else 1;recurrence=('Previously listed in '+calendar.month_name[month]+'; next programme pending') if month else 'Programme dates and season not established'
 # Derive annual recurrence only from an explicit, unambiguous annual date statement.
 fixed=re.search(r'毎年\s*(\d{1,2})月\s*(\d{1,2})日',spec)
 if not fixed and '毎年同日' in spec and valid:fixed=re.match(r'(\d+)-(\d+)',start[5:])
 if fixed and not re.search(r'旧暦|第|隔年|[2356]年に|頃|ごろ',spec) and int(fixed[1])==month and valid and start[5:]==end[5:] and int(fixed[2])==int(start[8:10]):
  rule={'kind':'fixed'};day=endDay=int(fixed[2]);endMonth=month;recurrence='Annual '+calendar.month_name[month]+' '+str(day)+' (source annual rule)'
 announcements={}
 if valid and not conflict and not approximate and not archival and not series and int(dateYear)>=2025:announcements[dateYear]={'start':start,'end':end,'source':source}
 type='Traditional matsuri' if (d.get('categoryTag') or {}).get('id2')==605 else 'Cultural festival'
 if re.search('花火',ja):type='Fireworks'
 elif re.search('桜|さくら|梅まつり|つつじ|あじさい|菊まつり|雪まつり',ja):type='Seasonal festival'
 elif re.search('食|そば|鮎|かに|カニ|魚|陶器|焼まつり',ja):type='Food & craft festival'
 vid='local-venue-'+p.stem;city=(loc.get('city') or {}).get('label') or (loc.get('prefecture') or {}).get('label');venue=d.get('placeName') or city
 venues.append({'id':vid,'name':city,'ja':city,'prefecture':pref,'lat':lat,'lng':lng,'description':'Festival venue recorded by the national municipal tourism directory.','source':source,'tags':['culture'],'attractions':[],'nights':0,'discoveryOnly':True})
 f={'id':'local-'+p.stem,'name':en or ja,'ja':ja,'cityId':vid,'type':type,'month':month,'startDay':day,'endDay':endDay,'endMonth':endMonth,'importance':5,'description':'Local celebration or ritual in '+city+'. Consult the linked municipal tourism listing and organizer for visitor access and the programme.','source':source,'organizerSource':organizer,'bestTime':'Check the programme for visitor access and daily times','recurrence':recurrence,'rule':rule,'venue':venue,'address':loc.get('address') or '', 'coordinatePrecision':'National tourism listing map pin','researchTier':'local','searchTerms':(d.get('nameKana') or '')+' '+en,'dateEvidence':'Municipal tourism record; source updated '+str(d.get('updateDate') or 'unknown'),'scheduleNote':'A local discovery record, not a guarantee of future operation.'}
 if valid:f.update(lastListedStart=start,lastListedEnd=end)
 if sessions:f['sessions']=sessions
 if series:f['scheduleNote']='A recurring programme or festival series, not a continuous daily event. Only individually published session dates are announced; other matches show a provisional season.'
 if archival:f['archival']=True;f['scheduleNote']='Historical listing only. A recent programme and continued operation have not been established. Excluded from upcoming date matches.'
 if conflict:f['scheduleNote']='The structured dates and named programme year disagree. Dates remain provisional; consult the organizer.'
 if announcements:f['announcements']=announcements
 records.append(f);categories[type]+=1
out={'venues':venues,'festivals':records};(root/'local-data.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));(root/'rejected.json').write_text(json.dumps(rejected,ensure_ascii=False,indent=2))
Path('lib/local-festivals.ts').write_text("/* Factual metadata from municipal tourism listings. See docs/festival-research.md. */\nimport type {City,Festival} from './catalog.ts';\nconst local:{venues:Omit<City,'region'>[];festivals:Festival[]}="+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\nexport default local;\n')
print('Added',len(records),'local records;',sum(f.get('archival',False) for f in records),'historical;',sum(bool(f.get('announcements')) for f in records),'year-specific programmes;',len(rejected),'excluded');print(categories)
