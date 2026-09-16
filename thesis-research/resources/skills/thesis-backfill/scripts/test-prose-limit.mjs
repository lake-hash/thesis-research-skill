import test from 'node:test';
import assert from 'node:assert/strict';
import {proseLength,validateProseLimit} from './prose-limit.mjs';
import {validatePacket} from './validate-packet.mjs';

const packet = description => ({generation_policy:{prose_max_chars:500},records:[{id:'company',description,events:[]}]});
const errors = (value,options={}) => {
  const result=[];
  validateProseLimit(value,{...options,check:(ok,message)=>{if(!ok)result.push(message);}});
  return result;
};

test('500 passes and 501 fails; spaces, punctuation, line breaks and Unicode are counted consistently',()=>{
  assert.equal(proseLength('a '.repeat(249)+'!?'),500);
  assert.equal(proseLength('a'.repeat(499)+'\u{1F642}'),500);
  assert.equal(proseLength('a\r\nb'),3);
  assert.equal(proseLength('a\n\nb'),4);
  assert.equal(errors(packet('a'.repeat(500))).length,0);
  assert.equal(errors(packet('a'.repeat(501))).length,1);
});

test('Named source footer is excluded without truncating or changing the text',()=>{
  const text='a'.repeat(500)+'\n\n[Author interview](https://example.invalid/interview?long='+ 'b'.repeat(300)+')';
  const input=packet(text),before=structuredClone(input);
  assert.equal(proseLength(text),500);assert.equal(errors(input).length,0);
  assert.deepEqual(input,before);
  assert.equal(errors(packet('x'+text)).length,1);
});

test('A baseline preserves unchanged history but cannot exempt a new or rewritten update',()=>{
  const baseline=packet('a'.repeat(600));baseline.records[0].events=[{id:'old',description:'b'.repeat(600)}];
  const next=structuredClone(baseline);
  assert.equal(errors(next,{baseline}).length,0);
  next.records[0].events.push({id:'new',description:'c'.repeat(501)});
  assert.equal(errors(next,{baseline}).length,1);
  next.records[0].description='d'.repeat(501);
  assert.equal(errors(next,{baseline}).length,2);
  next.records[0].events[0].description='e'.repeat(501);
  assert.equal(errors(next,{baseline}).length,3);
});

test('Required validation cannot omit or downgrade the limit, while old archives remain readable',()=>{
  const legacy={records:[]};assert.deepEqual(errors(legacy),[]);
  assert.equal(errors(legacy,{required:true}).length,1);
  assert.equal(errors(legacy,{baseline:packet('old')}).length,1);
  assert.equal(errors({generation_policy:{prose_max_chars:600},records:[]}).length,1);
  const minimal={authors:[],coverage:[],sources:[],decisions:[],records:[],pending:[]};
  assert(validatePacket(minimal,{requireProseLimit:true}).errors.some(e=>e.includes('prose_max_chars: 500')));
});
