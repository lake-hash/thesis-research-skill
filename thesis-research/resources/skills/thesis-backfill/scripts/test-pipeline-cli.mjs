import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const cli=fileURLToPath(new URL('thesis-pipeline.mjs',import.meta.url));

test('pipeline exposes the canonical policy manifest',()=>{
 const result=spawnSync(process.execPath,[cli,'policy'],{encoding:'utf8'});
 assert.equal(result.status,0);const policy=JSON.parse(result.stdout);
 assert.equal(policy.generationVersion,'3.2');assert.equal(policy.proseMaxChars,500);
 assert.equal(policy.finalPublicContract,'final-public/1.3');
 assert.equal(policy.factLedgerContract,'reviewed-thesis-facts/1.0');
});

test('pipeline compiles one stage prompt from the shared runtime contract',()=>{
 const result=spawnSync(process.execPath,[cli,'prompt','facts'],{encoding:'utf8'});
 assert.equal(result.status,0);assert.match(result.stdout,/thesis-runtime\/1\.0/);assert.match(result.stdout,/# Source Review And Fact Ledger Stage/);
});

test('pipeline fails closed for an unknown command',()=>{
 const result=spawnSync(process.execPath,[cli,'unknown'],{encoding:'utf8'});
 assert.equal(result.status,1);assert.match(result.stderr,/Usage:/);
});

test('backfill validation runs candidate accounting before the packet validator',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'thesis-backfill-pipeline-'));
 const triage=path.join(dir,'triage.json'),packet=path.join(dir,'packet.json');
 fs.writeFileSync(triage,JSON.stringify({version:'fixture',counts:{candidate:0},decisions:[]}));
 fs.writeFileSync(packet,'{}');
 const result=spawnSync(process.execPath,[cli,'validate-backfill',packet,'--triage',triage],{encoding:'utf8'});
 fs.rmSync(dir,{recursive:true,force:true});
 assert.equal(result.status,1);
 assert.match(result.stdout,/authors must be an array/);
});
