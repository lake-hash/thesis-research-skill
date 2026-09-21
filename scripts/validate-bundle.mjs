import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const skill=path.join(root,'thesis-research');
const failures=[];
const required=[
 'SKILL.md',
 'resources/skills/references/thesis-core-contract.md',
 'resources/skills/references/thesis-operation-contract.md',
 'resources/skills/references/thesis-policy.mjs',
 'resources/skills/thesis-backfill/SKILL.md',
 'resources/skills/thesis-backfill/prompts/facts.md',
 'resources/skills/thesis-backfill/references/pipeline-contract.md',
 'resources/skills/thesis-backfill/references/runtime-contract.md',
 'resources/skills/thesis-backfill/references/weekly-aggregation.md',
 'resources/skills/thesis-backfill/references/source-fidelity-contract.md',
 'resources/skills/thesis-backfill/references/stance-opening-contract.md',
 'resources/skills/thesis-backfill/scripts/canonical-company-history.mjs',
 'resources/skills/thesis-backfill/scripts/fact-candidate-closure-contract.mjs',
 'resources/skills/thesis-backfill/scripts/plan-packed-stage.mjs',
 'resources/skills/thesis-backfill/scripts/run-gates.mjs',
 'resources/skills/thesis-backfill/scripts/source-coverage-contract.mjs',
 'resources/skills/thesis-backfill/scripts/source-fidelity-contract.mjs',
 'resources/skills/thesis-backfill/scripts/stance-opening-contract.mjs',
 'resources/skills/thesis-backfill/scripts/thesis-pipeline.mjs',
 'resources/skills/thesis-backfill/scripts/weekly-group.mjs',
 'resources/skills/thesis-review-publish/SKILL.md',
 'resources/skills/thesis-review-publish/scripts/project-thesis-feed.mjs',
 'resources/skills/thesis-review-publish/scripts/test-feed-projection.mjs',
 'resources/skills/thesis-update/SKILL.md',
 'resources/skills/thesis-ops/SKILL.md'
];

for(const file of required)if(!fs.existsSync(path.join(skill,file)))failures.push('Missing required package file: '+file);

function walk(dir){
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  if(entry.name==='.DS_Store'||entry.name==='.git')return [];
  const target=path.join(dir,entry.name);
  return entry.isDirectory()?walk(target):[target];
 });
}

const files=walk(root);
const entry=fs.readFileSync(path.join(skill,'SKILL.md'),'utf8');
const frontmatter=entry.match(/^---\n([\s\S]*?)\n---\n/);
if(!frontmatter)failures.push('thesis-research/SKILL.md has no YAML frontmatter');
else{
 if(!/^name:\s*thesis-research\s*$/m.test(frontmatter[1]))failures.push('Skill name must be thesis-research');
 if(!/^description:\s*\S.+$/m.test(frontmatter[1]))failures.push('Skill description is missing');
}

for(const file of files){
 const ext=path.extname(file);
 if(!['.md','.mjs','.js','.cjs','.yaml','.yml'].includes(ext))continue;
 const text=fs.readFileSync(file,'utf8');
  if(file!==fileURLToPath(import.meta.url)&&text.includes('/Users/lake'))failures.push(relative(file)+': contains a local absolute path');
 if(file!==fileURLToPath(import.meta.url)&&/(?:alva_your_key|gho_[A-Za-z0-9]+|sk-[A-Za-z0-9]{20,})/.test(text))failures.push(relative(file)+': contains a credential-like token');
 if(ext==='.md')checkMarkdown(file,text);
 if(['.mjs','.js','.cjs'].includes(ext))checkImports(file,text);
}

function checkMarkdown(file,text){
 for(const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  const raw=match[1].trim().replace(/^<|>$/g,'');
  if(!raw||/^(?:https?:|mailto:|#)/i.test(raw)||/^(?:URL|original URL)$/i.test(raw))continue;
  const target=decodeURIComponent(raw.split('#')[0]);
  if(!target)continue;
  const resolved=path.resolve(path.dirname(file),target);
  if(!fs.existsSync(resolved))failures.push(relative(file)+': broken link '+raw);
 }
}

function checkImports(file,text){
 const patterns=[/\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]/g,/\brequire\(['"](\.{1,2}\/[^'"]+)['"]\)/g];
 for(const pattern of patterns)for(const match of text.matchAll(pattern)){
  const resolved=path.resolve(path.dirname(file),match[1]);
  const candidates=[resolved,resolved+'.js',resolved+'.mjs',resolved+'.cjs',path.join(resolved,'index.js')];
  if(!candidates.some(candidate=>fs.existsSync(candidate)))failures.push(relative(file)+': broken import '+match[1]);
 }
}

function relative(file){return path.relative(root,file);}

assert.equal(failures.length,0,failures.join('\n'));
console.log(JSON.stringify({ok:true,files:files.length,skill:'thesis-research'},null,2));
