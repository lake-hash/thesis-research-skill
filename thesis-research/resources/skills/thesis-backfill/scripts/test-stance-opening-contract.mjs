import assert from 'node:assert/strict';
import test from 'node:test';
import {openingChainIssues,openingDiversityReview,passageProgressionIssues,professionalOpeningIssues,stanceStructureIssues,timelineOpeningIssues,STANCE_OPENING_CONTRACT,TIMELINE_OPENING_CONTRACT} from './stance-opening-contract.mjs';
import {validateReleaseConsistency} from './release-consistency.mjs';

const plan=(overrides={})=>({version:STANCE_OPENING_CONTRACT,subject:'Zoetis',stance:'bearish',judgment_axis:'capital_allocation',directional_state:'weakening',mechanism:'Poor capital allocation compounds a deteriorating outlook.',stance_clause:'Zoetis looks weak',mechanism_clause:'as poor capital allocation compounds a deteriorating outlook',stance_realizations:[{ticker:'ZTS',stance:'bearish',text_span:'Zoetis looks weak'}],mechanism_location:'same_sentence',opening_family:'company_state',source_explicit_direction:false,...overrides});

test('professional source-specific openings pass',()=>{
 assert.deepEqual(openingChainIssues({stanceSentence:'Zoetis looks weak as poor capital allocation compounds a deteriorating outlook.',body:'Buybacks destroyed value.',subject:'Zoetis',openingPlan:plan()}),[]);
 assert.deepEqual(openingChainIssues({stanceSentence:'Zoetis looks unattractive as poor capital allocation compounds a deteriorating outlook.',body:'Buybacks destroyed value.',subject:'Zoetis',openingPlan:plan({stance_clause:'Zoetis looks unattractive',stance_realizations:[{ticker:'ZTS',stance:'bearish',text_span:'Zoetis looks unattractive'}]})}),[]);
 assert.deepEqual(openingChainIssues({stanceSentence:'SK hynix remains well positioned in memory, although capital allocation will determine how much value reaches shareholders.',body:'Cash from AI demand can be reinvested or distributed.',subject:'SK hynix',openingPlan:plan({subject:'SK hynix',stance:'bullish',judgment_axis:'capital_allocation',directional_state:'well positioned',mechanism:'Capital allocation will determine how much value reaches shareholders.',stance_clause:'SK hynix remains well positioned in memory',mechanism_clause:'although capital allocation will determine how much value reaches shareholders',stance_realizations:[{ticker:'SKHY',stance:'bullish',text_span:'SK hynix remains well positioned'}],mechanism_location:'same_sentence',opening_family:'company_state'})}),[]);
 assert(openingChainIssues({stanceSentence:'SK hynix remains well positioned in memory.',body:'Capital allocation will determine how much value reaches shareholders.',subject:'SK hynix',openingPlan:plan({subject:'SK hynix',stance:'bullish',judgment_axis:'capital_allocation',directional_state:'well positioned',mechanism:'Capital allocation will determine how much value reaches shareholders.',mechanism_location:'next_sentence',opening_family:'company_state'})}).some(issue=>issue.includes('first sentence')));
});

test('generic, circular, passive and repetitive openings fail',()=>{
 for(const value of ['Zoetis looks unattractive.','Zoetis appears compelling because capital allocation is weak.','The case for Zoetis is weak.','Amazon looks vulnerable because the case for a higher valuation is limited.','Sandisk is well positioned as the NAND outlook is supported.','ASML is well positioned as the case for a competitive breakthrough against ASML remained limited.'])assert(professionalOpeningIssues(value,{subject:value.startsWith('ASML')?'ASML':'Zoetis'}).length,value);
});

test('opening names the necessary counterparty or product',()=>{
 assert(professionalOpeningIssues('Nebius is well positioned to benefit as the partnership could expand distribution.',{subject:'Nebius'}).some(issue=>issue.includes('counterparty')));
 assert(!professionalOpeningIssues('Nebius is well positioned to benefit as its partnership with Palantir could expand distribution.',{subject:'Nebius'}).some(issue=>issue.includes('counterparty')));
 assert(professionalOpeningIssues('Robinhood is strengthening as new products diversify revenue.',{subject:'Robinhood'}).some(issue=>issue.includes('products')));
 assert(!professionalOpeningIssues('Robinhood has upside from new products, including tokenized assets and prediction markets.',{subject:'Robinhood'}).some(issue=>issue.includes('products')));
});

test('following prose advances rather than paraphrases the opening',()=>{
 assert(passageProgressionIssues('Robinhood is strengthening as new products reduce its dependence on trading.', 'New products and services could support growth.').length>0);
 assert(passageProgressionIssues('Zoom has upside if AI Companion expands its role across workflows.', 'AI Companion could expand its role across additional workflows.').length>0);
 assert.deepEqual(passageProgressionIssues("Nebius is well positioned as its partnership with Palantir expands distribution.", "The integration puts Nebius endpoints inside Palantir's platform, while delivery remains the key risk."),[]);
 assert.deepEqual(passageProgressionIssues("Apple and Snap could benefit if Apple bought Snap's Specs business.", 'Neither company has announced a deal.'),[]);
});

test('US abbreviations do not create false sentence fragments',async()=>{
 const {proseQualityIssues}=await import('./public-content-gates.mjs');
 assert.deepEqual(proseQualityIssues("Jabil strengthened its outlook through a $500 million U.S. AI manufacturing expansion."),[]);
});

test('Timeline opens with the historical implication and mechanism',()=>{
 assert.deepEqual(timelineOpeningIssues({body:'Nvidia looks stronger as rising H100 rental prices show persistent use of older hardware.',openingConclusion:'Nvidia looks stronger.',openingReason:'Rising H100 rental prices show persistent demand for older Nvidia hardware.',stanceClause:'Nvidia looks stronger',mechanismClause:'as rising H100 rental prices show persistent use of older hardware',stanceRealizations:[{ticker:'NVDA',stance:'bullish',text_span:'Nvidia looks stronger'}],tickerStances:[{ticker:'NVDA',stance:'bullish'}]}),[]);
 assert(timelineOpeningIssues({body:'H100 rental prices rose. That supports Nvidia demand.',openingConclusion:"Demand for Nvidia's older hardware appears unusually persistent.",openingReason:'Rising H100 rental prices show persistent demand for older Nvidia hardware.'}).some(issue=>issue.includes('reviewed dated conclusion')||issue.includes('reviewed mechanism')));
 assert(timelineOpeningIssues({body:'Nebius could benefit as the partnership expands distribution.',openingReason:'Nebius could benefit as its partnership with Palantir expands distribution.'}).some(issue=>issue.includes('counterparty')));
 assert(timelineOpeningIssues({body:'Nvidia demand looks stronger as H100 rental prices rise. Rising H100 rental prices support persistent demand.',openingReason:'Rising H100 rental prices show persistent demand for older Nvidia hardware.'}).some(issue=>issue.includes('restates')));
});

test('ticker-direction labels never substitute for visible stance prose',()=>{
 const p=plan({subject:'Coinbase',stance:'bullish',judgment_axis:'regulation',directional_state:'strengthening',mechanism:'Regulatory clarity expands institutional access.',stance_clause:'Bullish on Coinbase',mechanism_clause:'as regulatory clarity expands institutional access',stance_realizations:[{ticker:'COIN',stance:'bullish',text_span:'Bullish on Coinbase'}],source_explicit_direction:true});
 assert(openingChainIssues({stanceSentence:'Bullish on Coinbase as regulatory clarity expands institutional access.',body:'Institutional activity could increase.',subject:'Coinbase',openingPlan:p,tickerStances:[{ticker:'COIN',stance:'bullish'}]}).some(issue=>issue.includes('metadata labels')));
});

test('stance-first remains clear after ticker metadata is hidden',()=>{
 assert.deepEqual(stanceStructureIssues({sentence:'Meta is better positioned than Google because it keeps purchased compute inside model development.',stanceClause:'Meta is better positioned than Google',mechanismClause:'because it keeps purchased compute inside model development',stanceRealizations:[{ticker:'META',stance:'bullish',text_span:'Meta is better positioned than Google'},{ticker:'GOOG',stance:'bearish',text_span:'Meta is better positioned than Google'}],tickerStances:[{ticker:'META',stance:'bullish'},{ticker:'GOOG',stance:'bearish'}]}),[]);
 assert.deepEqual(stanceStructureIssues({sentence:'IREN and CIFR are execution-dependent because secured power shifts the test to contracts and delivery.',stanceClause:'IREN and CIFR are execution-dependent',mechanismClause:'because secured power shifts the test to contracts and delivery',stanceRealizations:[{ticker:'IREN',stance:'none',text_span:'IREN and CIFR are execution-dependent'},{ticker:'CIFR',stance:'none',text_span:'IREN and CIFR are execution-dependent'}],tickerStances:[{ticker:'IREN',stance:'none'},{ticker:'CIFR',stance:'none'}]}),[]);
 for(const row of [
  {sentence:'Meta’s advertising franchise remained intact because the core business was not impaired.',stanceClause:'Meta’s advertising franchise remained intact',mechanismClause:'because the core business was not impaired'},
  {sentence:'IREN’s contract pricing rose 125% because customers accepted higher prices.',stanceClause:'IREN’s contract pricing rose 125%',mechanismClause:'because customers accepted higher prices'},
  {sentence:'Bullish on BTC because rate-cut expectations attract capital.',stanceClause:'Bullish on BTC',mechanismClause:'because rate-cut expectations attract capital'}
 ])assert(stanceStructureIssues({...row,stanceRealizations:[{ticker:'ACME',stance:'bullish',text_span:row.stanceClause}],tickerStances:[{ticker:'ACME',stance:'bullish'}]}).length,row.sentence);
});

test('diversity creates review work without automatic synonym rotation',()=>{
 const values=['A is well positioned as demand rises.','B has upside if margins recover.','C is well positioned as supply tightens.','D looks weak as costs rise.','E is well positioned as adoption grows.','F remains supported by pricing.','G has upside if utilization rises.','H looks weak as demand falls.','I remains supported by backlog.','J has upside if funding closes.'];
 const result=openingDiversityReview(values);assert(result.warnings.some(item=>item.includes('well-positioned')));assert.equal(result.errors.length,0);
 const adjacent=openingDiversityReview(['A has upside if demand rises.','B has upside if margins recover.']);assert.equal(adjacent.errors.length,1);
});

test('released README and Signals metadata must match production state',()=>{
 const catalog={release_version:'v1.2.3',release_status:'released',signals_note:'Eight source-reviewed outside views.',theses:[{signals:[]}]};
 const failed=validateReleaseConsistency(catalog,'## Current Release — v1.2.3\n\nThis local candidate contains one card.');assert.equal(failed.ok,false);assert.equal(failed.errors.length,2);
 const clean={...catalog,signals_note:'No reviewed outside views are currently published.'};assert.equal(validateReleaseConsistency(clean,'## Current Release — v1.2.3\n\nOne public card.').ok,true);
});
