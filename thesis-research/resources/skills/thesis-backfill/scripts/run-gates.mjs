import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const reviewRoot=path.resolve(root,'../../thesis-review-publish/scripts');
const resolve=(base,value)=>value?path.resolve(base,value):undefined;
const run=(script,args)=>spawnSync(process.execPath,[script,...args],{stdio:'inherit'}).status??1;
export const shouldBuildPresentation=(spec,presentation)=>spec?.rebuild_presentation===true||!fs.existsSync(presentation);

export function runGates(specFile){
 const absolute=path.resolve(specFile),base=path.dirname(absolute),spec=JSON.parse(fs.readFileSync(absolute));
 const packet=resolve(base,spec.packet),triage=resolve(base,spec.triage),candidate=resolve(base,spec.candidate_review),presentation=resolve(base,spec.presentation),finalReview=resolve(base,spec.final_review),feedBundle=resolve(base,spec.feed_bundle),feedProjection=resolve(base,spec.feed_projection);
 if(!packet||!presentation)throw Error('gate-run needs packet and presentation paths');
 if(triage){const status=run(path.join(root,'validate-candidate-accounting.mjs'),[triage,packet,...(candidate?[candidate]:[])]);if(status)return status;}
 const packetArgs=[packet,'--require-history-coverage','--require-generation-contract','--require-prose-limit','--require-run-review'];if(spec.baseline)packetArgs.push('--baseline',resolve(base,spec.baseline));if(spec.allow_editorial_corrections)packetArgs.push('--allow-editorial-corrections');
 let status=run(path.join(root,'validate-packet.mjs'),packetArgs);if(status)return status;
 if(shouldBuildPresentation(spec,presentation)){status=run(path.join(root,'build-presentation.mjs'),[packet,presentation]);if(status)return status;}
 if(finalReview){status=run(path.join(root,'final-public-projection.mjs'),[packet,presentation,finalReview,...(spec.published?['--published']:[])]);if(status)return status;}
 if(feedBundle){if(!feedProjection)throw Error('gate-run feed_bundle needs feed_projection');status=run(path.join(reviewRoot,'project-thesis-feed.mjs'),[feedBundle,feedProjection]);if(status)return status;}
 return 0;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const [spec]=process.argv.slice(2);if(!spec)throw Error('Usage: run-gates.mjs run.json');process.exitCode=runGates(spec);}
