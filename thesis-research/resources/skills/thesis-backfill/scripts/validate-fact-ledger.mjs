import fs from 'node:fs';
import {validateFactLedger} from './fact-ledger-contract.mjs';
const [factsFile,archiveFile]=process.argv.slice(2);
if(!archiveFile)throw Error('Usage: validate-fact-ledger.mjs facts.json archive.json');
const result=validateFactLedger(JSON.parse(fs.readFileSync(factsFile)),JSON.parse(fs.readFileSync(archiveFile)));
console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;
