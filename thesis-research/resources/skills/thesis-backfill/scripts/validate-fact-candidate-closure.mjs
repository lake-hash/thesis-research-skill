import fs from 'node:fs';
import {validateFactCandidateClosure} from './fact-candidate-closure-contract.mjs';
const [triageFile,factsFile,archiveFile,reviewFile]=process.argv.slice(2);
if(!archiveFile)throw Error('Usage: validate-fact-candidate-closure.mjs TRIAGE FACTS ARCHIVE [CANDIDATE_REVIEW]');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const result=validateFactCandidateClosure(read(triageFile),read(factsFile),read(archiveFile),reviewFile?read(reviewFile):undefined);
console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;
