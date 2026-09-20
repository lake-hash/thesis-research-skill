import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateCandidateAccounting} from './candidate-accounting-contract.mjs';

function read(file){return JSON.parse(fs.readFileSync(file,'utf8'));}

export function main(argv=process.argv.slice(2)){
 const [triageFile,packetFile,reviewFile]=argv;
 if(!triageFile||!packetFile){console.error('Usage: validate-candidate-accounting.mjs TRIAGE PACKET [CANDIDATE_REVIEW]');return 1;}
 const result=validateCandidateAccounting(read(triageFile),read(packetFile),reviewFile?read(reviewFile):undefined);
 console.log(JSON.stringify(result,null,2));
 return result.ok?0:1;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)process.exitCode=main();
