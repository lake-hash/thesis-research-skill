import fs from 'node:fs';
import {validateDelivery} from './source-coverage-contract.mjs';
const [cards,manifest,...options]=process.argv.slice(2);
if(!cards||!manifest)throw Error('Usage: validate-delivery.mjs cards.json ingestion-manifest.json [--allow-legacy]');
const result=validateDelivery(JSON.parse(fs.readFileSync(cards)),JSON.parse(fs.readFileSync(manifest)),{allowLegacy:options.includes('--allow-legacy')});
console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;
