import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {THESIS_POLICY} from '../../references/thesis-policy.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const stages=new Set(['triage','facts','generate','review']);
export function renderStagePrompt(stage){
 if(!stages.has(stage))throw Error('Unknown Thesis stage '+stage);
 const runtime=fs.readFileSync(path.join(root,'../references/runtime-contract.md'),'utf8').trim();
 const stagePrompt=fs.readFileSync(path.join(root,'../prompts/'+stage+'.md'),'utf8').trim();
 const manifest={runtime_contract:THESIS_POLICY.runtimeContract,pipeline_contract:THESIS_POLICY.pipelineContract,stage,generation:THESIS_POLICY.generationVersion,facts:THESIS_POLICY.factLedgerContract,prose_max_chars:THESIS_POLICY.proseMaxChars,feed_projection:THESIS_POLICY.feedProjectionContract,temporal_diversity:THESIS_POLICY.temporalFeedDiversityContract};
 return `# Contract Manifest\n\n${JSON.stringify(manifest,null,2)}\n\n${runtime}\n\n${stagePrompt}\n`;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [stage,output]=process.argv.slice(2);if(!stage)throw Error('Usage: render-stage-prompt.mjs STAGE [OUTPUT]');
 const value=renderStagePrompt(stage);if(output)fs.writeFileSync(output,value);else process.stdout.write(value);
}
