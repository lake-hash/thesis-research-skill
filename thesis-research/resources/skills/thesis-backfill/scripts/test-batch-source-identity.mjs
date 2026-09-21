import test from 'node:test';
import assert from 'node:assert/strict';
import {sameBatchSourceIdentity} from './validate-batch.mjs';

const source=()=>({id:'source-x',channel_id:'x:author',url:'https://example.invalid/source-x',author_ids:['author'],canonical_event_id:'event-x',published_at:'2026-06-01T00:00:00Z',spoken_at:null,locator:'Window post',source_level:'primary',context_complete:true,text:'Original text',text_sha256:'hash',attachment_status:'none',attachments:[],window_source:true,context_for_source_ids:[]});

test('batch source identity allows packet-local window and context usage metadata',()=>{
 const left=source(),right={...source(),locator:'Quoted or replied-to context post',window_source:false,context_for_source_ids:['parent-source']};
 assert.equal(sameBatchSourceIdentity(left,right),true);
});

test('batch source identity still rejects changed evidence or provenance',()=>{
 assert.equal(sameBatchSourceIdentity(source(),{...source(),text:'Changed text'}),false);
 assert.equal(sameBatchSourceIdentity(source(),{...source(),published_at:'2026-06-02T00:00:00Z'}),false);
 assert.equal(sameBatchSourceIdentity(source(),{...source(),attachments:[{id:'image-1'}]}),false);
});
