import assert from 'node:assert/strict';
import test from 'node:test';
import {sourceFidelityIssues,sourceFidelityClaimIssues,SOURCE_FIDELITY_CONTRACT} from './source-fidelity-contract.mjs';

const source = text => new Map([['s1',{text}]]);

test('source fidelity contract is versioned',()=>assert.equal(SOURCE_FIDELITY_CONTRACT,'source-fidelity/1.0'));

test('unsupported author possessive fails',()=>{
 const issues=sourceFidelityIssues({prose:"Gold retained upside after the author's largest negative catalyst.",sources:source("today is the biggest negative catalyst towards gold but GC didn’t crash."),allowedSourceIds:['s1']});
 assert(issues.some(issue=>issue.includes('source/author narration')));
});

test('faithful source-bound direction passes',()=>{
 const issues=sourceFidelityIssues({prose:'Gold retained upside because GC did not crash after the biggest negative catalyst for gold.',sources:source('today is the biggest negative catalyst towards gold but GC didn’t crash.'),allowedSourceIds:['s1']});
 assert.deepEqual(issues,[]);
});

test('unsupported degree word fails when absent from evidence',()=>{
 const issues=sourceFidelityIssues({prose:'Gold clearly retained upside because GC held up.',sources:source('GC held up.'),allowedSourceIds:['s1']});
 assert(issues.some(issue=>issue.includes('degree word')));
});

test('claim tuple is required for strict generation',()=>{
 const issues=sourceFidelityClaimIssues({id:'c1',text:'Gold retained upside',evidence:[{source_id:'s1',quote:'GC held up.'}]},source('GC held up.'));
 assert(issues.some(issue=>issue.includes('semantic_claim tuple')));
});
