import assert from 'node:assert/strict';
import {rollingWindow,addCalendarMonths,clampShift,validCalendarDate} from '../lib/date-window.ts';
import {cities,festivals,occurrences,festivalOccurrence} from '../lib/catalog.ts';
assert.deepEqual(rollingWindow('2026-10-01'),{start:'2026-10-01',end:'2027-10-01'});
assert.equal(addCalendarMonths('2028-02-29',12),'2029-02-28');
assert.equal(addCalendarMonths('2026-12-31',2),'2027-02-28');
assert.equal(clampShift('2026-10-03','2026-10-17',-7,'2026-10-01','2027-10-01'),-2);
assert.equal(clampShift('2027-09-24','2027-10-01',7,'2026-10-01','2027-10-01'),0);
assert.equal(validCalendarDate('2027-02-29'),false);
assert.equal(rollingWindow(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date('2026-09-30T16:00:00Z'))).start,'2026-10-01');
assert.equal(new Set(festivals.map(f=>f.id)).size,festivals.length);
assert.equal(new Set(festivals.map(f=>cities.find(c=>c.id===f.cityId).prefecture)).size,47);
for(const f of festivals){assert.ok(cities.some(c=>c.id===f.cityId),f.id);assert.ok(/^https?:$/.test(new URL(f.source).protocol));for(const year of [2026,2027,2028]){const e=festivalOccurrence(f,year);if(!e)continue;assert.ok(validCalendarDate(e.start),f.id+' start');assert.ok(validCalendarDate(e.end),f.id+' end');assert.ok(e.end>=e.start,f.id);if(e.confidence==='confirmed'){assert.ok(f.announcements?.[year]);assert.equal(e.occurrenceSource,f.announcements[year].source)}}}
const by=(id,year=2027)=>festivalOccurrence(festivals.find(f=>f.id===id),year);
assert.equal(by('jp-41-03',2030).start,'2030-07-20'); // weekend after third Monday, not fourth Saturday

assert.equal(by('jp-11-02',2026).confidence,'confirmed');
assert.equal(by('jp-11-02').start,'2027-10-16'); // third Sunday and preceding Saturday
assert.equal(by('jp-09-03').start,'2027-10-09'); // second Saturday
assert.equal(by('jp-25-03').start,'2027-10-09'); // weekend before second Monday
assert.equal(by('jp-13-03').start,'2027-05-14'); // Friday through third Sunday
assert.equal(by('jp-10-02').start,'2027-08-06'); // first Friday
assert.equal(by('jp-24-01').start,'2027-07-31'); // first Sunday, crosses July/August
assert.equal(by('jp-13-01',2026),null); // biennial Kanda main festival
assert.equal(by('jp-13-01').confidence,'season');
assert.equal(by('jp-01-01').confidence,'confirmed');
assert.equal(by('jp-01-01').start,'2027-02-04');
assert.equal(by('jp-05-01',2026).confidence,'season'); // conflicting directory labels not promoted
assert.equal(by('hachinohe-sansha').end,'2027-08-04');
assert.ok(occurrences('2027-08-01','2027-08-02').some(e=>e.id==='hachinohe-sansha'));
assert.ok(occurrences('2026-10-03','2026-10-17').length>9);
const cross={...festivals[0],id:'cross-year-test',month:12,startDay:20,endMonth:1,endDay:10};
assert.equal(festivalOccurrence(cross,2026).end,'2027-01-10');
console.log(`Passed: rolling calendar/leap years/drag bounds; ${festivals.length} unique records across 47 prefectures; annual weekday rules, cross-month/year dates, biennial and evidence status.`);
