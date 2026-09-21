import assert from 'node:assert/strict';import test from 'node:test';import {sourceCoverageIssues} from './source-coverage-contract.mjs';
const archive=()=>({requested_scope:{end:'2026-09-20T00:00:00Z'},coverage:{latest:'2026-09-18T00:53:16Z',collected_at:'2026-09-20T14:58:05Z',pagination_exhausted:true,gaps:[]}});
test('pagination exhaustion does not prove upper-bound freshness',()=>assert(sourceCoverageIssues(archive()).length>0));
test('an explicit sync-lag gap preserves partial coverage honestly',()=>{const value=archive();value.coverage.gaps.push('Upper bound freshness gap: provider sync lag after September 18.');assert.deepEqual(sourceCoverageIssues(value),[]);});
