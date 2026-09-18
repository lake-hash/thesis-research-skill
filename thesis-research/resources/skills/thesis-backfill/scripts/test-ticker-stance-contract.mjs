import assert from 'node:assert/strict';
import test from 'node:test';
import {tickerStanceIssues,TICKER_STANCE_CONTRACT} from './ticker-stance-contract.mjs';

const sources=new Map([['s1',{text:'Acme demand is improving while Beta faces higher costs.'}]]);
const evidence=explanation=>[{source_id:'s1',quote:sources.get('s1').text,explanation}];

test('each ticker can carry a different supported direction',()=>{
 const rows=[{ticker:'ACME',stance:'bullish',evidence:evidence('Demand supports Acme.')},{ticker:'BETA',stance:'bearish',evidence:evidence('Costs pressure Beta.')}];
 assert.deepEqual(tickerStanceIssues({tickerStances:rows,tickers:['ACME','BETA'],sources,allowedSourceIds:['s1']}),[]);
 assert.equal(TICKER_STANCE_CONTRACT,'per-expression-ticker-stance/1.0');
});

test('none is valid but unresolved or inherited ticker sets are not',()=>{
 assert.deepEqual(tickerStanceIssues({tickerStances:[{ticker:'ACME',stance:'none',evidence:evidence('The source links Acme without a clear positive or negative direction.')}],tickers:['ACME'],sources,allowedSourceIds:['s1']}),[]);
 assert(tickerStanceIssues({tickerStances:[{ticker:'ACME',stance:'unknown',evidence:evidence('Unknown is not a direction.')}],tickers:['ACME'],sources,allowedSourceIds:['s1']}).length);
 assert(tickerStanceIssues({tickerStances:[{ticker:'ACME',stance:'bullish',evidence:evidence('Only Acme is reviewed.')}],tickers:['ACME','BETA'],sources,allowedSourceIds:['s1']}).some(issue=>issue.includes('exactly match')));
});

test('direction evidence must be exact and expression-bound',()=>{
 const rows=[{ticker:'ACME',stance:'bullish',evidence:[{source_id:'s2',quote:'Invented',explanation:'Unsupported.'}]}];
 const issues=tickerStanceIssues({tickerStances:rows,tickers:['ACME'],sources,allowedSourceIds:['s1']});
 assert(issues.some(issue=>issue.includes('outside')));assert(issues.some(issue=>issue.includes('exact source quote')));
});
