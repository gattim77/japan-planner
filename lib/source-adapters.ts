import {z} from 'zod';
/** Boundary for licensed / manually reviewed structured provider exports.
 * No arbitrary-URL fetch, implicit scraping or invented confirmations. */
export const sourceRecord=z.object({id:z.string().min(1),sourceUrl:z.string().url(),authority:z.string().min(1),sourceType:z.enum(['official_tourism','official_event','official_operator','open_geography']),verifiedAt:z.string().datetime(),data:z.record(z.unknown())});
export type SourceRecord=z.infer<typeof sourceRecord>;
export interface SourceAdapter {name:string;version:string;parse(input:unknown):SourceRecord[]}
export class ReviewedJsonAdapter implements SourceAdapter {name='reviewed-json';version='1';parse(input:unknown){return z.array(sourceRecord).max(10000).parse(input)}}
export const providerOccurrence=z.object({eventId:z.string(),year:z.number().int(),start:z.string().nullable(),end:z.string().nullable(),confidence:z.enum(['confirmed','expected','historically_likely','not_announced','cancelled']),yearSpecificSource:z.string().url().nullable(),verifiedAt:z.string().nullable()}).superRefine((e,c)=>{if(e.confidence==='confirmed'&&(!e.yearSpecificSource||!e.verifiedAt||!e.start||!e.end))c.addIssue({code:'custom',message:'Confirmation requires a year-specific source, verification timestamp and dates.'})});
