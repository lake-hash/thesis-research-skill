import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {THESIS_POLICY} from '../../references/thesis-policy.mjs';
import {renderStagePrompt} from './render-stage-prompt.mjs';
import {runGates} from './run-gates.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const reviewRoot=path.resolve(root,'../../thesis-review-publish/scripts');

const commands={
 validate:{script:path.join(root,'validate-packet.mjs'),prefix:['--require-history-coverage','--require-generation-contract','--require-prose-limit','--require-run-review']},
 'validate-archive':{script:path.join(root,'validate-packet.mjs'),prefix:[]},
 presentation:{script:path.join(root,'build-presentation.mjs'),prefix:[]},
 'candidate-gate':{script:path.join(root,'validate-candidate-accounting.mjs'),prefix:[]},
 facts:{script:path.join(root,'validate-fact-ledger.mjs'),prefix:[]},
 final:{script:path.join(root,'final-public-projection.mjs'),prefix:[]},
 batch:{script:path.join(root,'validate-batch.mjs'),prefix:[]},
 pack:{script:path.join(root,'plan-packed-stage.mjs'),prefix:[]},
 'prepare-feed':{script:path.join(reviewRoot,'prepare-card-export.mjs'),prefix:[]},
 'project-feed':{script:path.join(reviewRoot,'project-thesis-feed.mjs'),prefix:[]},
 delivery:{script:path.join(reviewRoot,'validate-delivery.mjs'),prefix:[]}
};

function usage(){
 return `Usage: thesis-pipeline.mjs COMMAND [args...]\n\nCommands:\n  policy\n  prompt STAGE [OUTPUT]\n  facts FACTS ARCHIVE [--triage TRIAGE] [--candidate-review REVIEW]\n  gate-run RUN_SPEC\n  validate PACKET [--baseline PREVIOUS] [--allow-editorial-corrections]\n  validate-backfill PACKET --triage TRIAGE [--candidate-review REVIEW] [packet options]\n  validate-archive PACKET [--baseline PREVIOUS]\n  candidate-gate TRIAGE PACKET [CANDIDATE_REVIEW]\n  presentation PACKET PRESENTATION [options]\n  final PACKET PRESENTATION REVIEW [--published]\n  batch BATCH_SPEC\n  pack PACKED_STAGE_SPEC OUTPUT\n  prepare-feed PACKET CONFIG NEW_OUTPUT_DIR\n  project-feed PLAYBOOK_DATA FEED_PROJECTION\n  delivery CARDS MANIFEST [--allow-legacy]\n  test`;
}

function testFiles(dir){return fs.readdirSync(dir).filter(name=>/^test-.*\.mjs$/.test(name)).sort().map(name=>path.join(dir,name));}
function run(script,args){return spawnSync(process.execPath,[script,...args],{stdio:'inherit'}).status??1;}

export function main(argv=process.argv.slice(2)){
 const [command,...args]=argv;
 if(command==='policy'){console.log(JSON.stringify(THESIS_POLICY,null,2));return 0;}
 if(command==='prompt'){const [stage,output]=args;if(!stage){console.error(usage());return 1;}const value=renderStagePrompt(stage);if(output)fs.writeFileSync(output,value);else process.stdout.write(value);return 0;}
 if(command==='gate-run'){if(!args[0]){console.error(usage());return 1;}return runGates(args[0]);}
 if(command==='test')return spawnSync(process.execPath,['--test',...testFiles(root),...testFiles(reviewRoot)],{stdio:'inherit'}).status??1;
 if(command==='validate-backfill'){
  const packet=args[0],triageAt=args.indexOf('--triage'),reviewAt=args.indexOf('--candidate-review');
  const triage=triageAt>=0?args[triageAt+1]:undefined,review=reviewAt>=0?args[reviewAt+1]:undefined;
  if(!packet||!triage){console.error(usage());return 1;}
  const gate=run(path.join(root,'validate-candidate-accounting.mjs'),[triage,packet,...(review?[review]:[])]);
  if(gate!==0)return gate;
  const skip=new Set([triageAt,triageAt+1,...(reviewAt>=0?[reviewAt,reviewAt+1]:[])]);
  const packetArgs=args.filter((_,index)=>!skip.has(index));
  return run(path.join(root,'validate-packet.mjs'),[...packetArgs,...commands.validate.prefix]);
 }
 if(command==='facts'){
  const [facts,archive]=args,triageAt=args.indexOf('--triage'),reviewAt=args.indexOf('--candidate-review'),triage=triageAt>=0?args[triageAt+1]:undefined,review=reviewAt>=0?args[reviewAt+1]:undefined;
  if(!facts||!archive){console.error(usage());return 1;}
  const ledger=run(path.join(root,'validate-fact-ledger.mjs'),[facts,archive]);if(ledger!==0)return ledger;
  if(triage)return run(path.join(root,'validate-fact-candidate-closure.mjs'),[triage,facts,archive,...(review?[review]:[])]);
  return 0;
 }
 const spec=commands[command];if(!spec){console.error(usage());return 1;}
 if(!args.length){console.error(usage());return 1;}
 return run(spec.script,[...args,...spec.prefix]);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)process.exitCode=main();
