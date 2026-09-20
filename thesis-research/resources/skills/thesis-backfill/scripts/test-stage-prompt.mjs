import test from 'node:test';
import assert from 'node:assert/strict';
import {renderStagePrompt} from './render-stage-prompt.mjs';

test('stage prompts share one compact runtime contract without loading unrelated stage instructions',()=>{
 const triage=renderStagePrompt('triage'),generate=renderStagePrompt('generate');
 assert.match(triage,/thesis-runtime\/1\.0/);assert.match(generate,/reviewed-thesis-facts\/1\.0/);
 assert.match(triage,/# Triage Stage/);assert.doesNotMatch(triage,/# Language Generation Stage/);
 assert.match(generate,/# Language Generation Stage/);assert.doesNotMatch(generate,/# Triage Stage/);
 assert(triage.length<15000);assert(generate.length<15000);
});

test('unknown prompt stage fails closed',()=>assert.throws(()=>renderStagePrompt('publish'),/Unknown Thesis stage/));
