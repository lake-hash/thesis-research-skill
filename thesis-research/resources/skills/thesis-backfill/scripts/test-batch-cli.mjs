import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

test('Installed symlink invocation runs the batch validator instead of silently succeeding',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'thesis-batch-cli-test-'));
  const cli=path.join(dir,'batch-cli.mjs');
  fs.symlinkSync(fileURLToPath(new URL('./validate-batch.mjs',import.meta.url)),cli);
  fs.writeFileSync(path.join(dir,'catalog.json'),JSON.stringify({revision:'fixture',records:[],pending:[],sources:[]}));
  fs.writeFileSync(path.join(dir,'batch.json'),JSON.stringify({packets:[],catalog:'catalog.json'}));
  const result=spawnSync(process.execPath,[cli,path.join(dir,'batch.json')],{encoding:'utf8'});
  assert.equal(result.status,1,result.stderr);assert.equal(JSON.parse(result.stdout).ok,false);
});
