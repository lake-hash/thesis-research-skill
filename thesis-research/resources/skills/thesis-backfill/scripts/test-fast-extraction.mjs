import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {planFastExtraction} from './plan-fast-extraction.mjs';

const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const source=(id,body,canonical=id)=>({id,canonical_event_id:canonical,text:body,text_sha256:sha(body),published_at:'2026-09-16T00:00:00Z',attachment_status:'none',attachments:[]});

test('plans bounded batches after exact event deduplication',()=>{const packet={sources:[source('a','12345','event'),source('copy','12345','event'),source('b','67890')]};const result=planFastExtraction(packet,{maxChars:6,maxItems:10});assert.equal(result.unique_triage_count,2);assert.equal(result.exact_duplicates,1);assert.deepEqual(result.batches.map(b=>b.item_count),[1,1]);});
test('cache keys skip unchanged sources without becoming content rejections',()=>{const s=source('a','view and reason'),policy='what-why-increment/1.0',key=crypto.createHash('sha256').update(JSON.stringify({source_id:s.id,text_sha256:s.text_sha256,policy_version:policy})).digest('hex');const result=planFastExtraction({sources:[s]},{policyVersion:policy,cacheKeys:[key]});assert.equal(result.cache_hits,1);assert.equal(result.unique_triage_count,0);assert.equal(result.duplicates[0].disposition,'cache_hit');});
test('empty extraction is a technical gap, not no-judgment',()=>{const result=planFastExtraction({sources:[source('a','')]});assert.equal(result.technical_gap_count,1);assert.equal(result.batches.length,0);});
