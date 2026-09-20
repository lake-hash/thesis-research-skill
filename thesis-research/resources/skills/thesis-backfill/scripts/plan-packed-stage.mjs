import fs from 'node:fs';
import {packByBudget} from './packed-stage-contract.mjs';
const [inputFile,outputFile]=process.argv.slice(2);if(!outputFile)throw Error('Usage: plan-packed-stage.mjs spec.json output.json');
const spec=JSON.parse(fs.readFileSync(inputFile,'utf8')),items=Array.isArray(spec.items)?spec.items:[];
const packs=packByBudget(items,{maxItems:spec.max_items||4,maxChars:spec.max_chars||30000,getId:item=>item.id,getText:item=>JSON.stringify(item.payload??item)});
fs.writeFileSync(outputFile,JSON.stringify({version:'packed-stage-plan/1.0',stage:spec.stage||'unknown',item_count:items.length,packs:packs.map(({items,...pack})=>pack)},null,2)+'\n');
console.log(JSON.stringify({output:outputFile,items:items.length,packs:packs.length}));
