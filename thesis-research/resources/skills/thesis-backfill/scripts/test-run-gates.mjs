import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {runGates,shouldBuildPresentation} from './run-gates.mjs';

test('gate-run resolves manifest paths and fails closed on invalid packet',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'thesis-gates-'));fs.writeFileSync(path.join(dir,'packet.json'),'{}');fs.writeFileSync(path.join(dir,'run.json'),JSON.stringify({packet:'packet.json',presentation:'presentation.json'}));
 const status=runGates(path.join(dir,'run.json'));fs.rmSync(dir,{recursive:true,force:true});assert.equal(status,1);
});

test('gate-run requires packet and presentation',()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'thesis-gates-'));const file=path.join(dir,'run.json');fs.writeFileSync(file,'{}');assert.throws(()=>runGates(file),/packet and presentation/);fs.rmSync(dir,{recursive:true,force:true});});

test('gate-run preserves an existing hash-bound presentation unless rebuild is explicit',()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'thesis-gates-')),presentation=path.join(dir,'presentation.json');fs.writeFileSync(presentation,'{}');assert.equal(shouldBuildPresentation({},presentation),false);assert.equal(shouldBuildPresentation({rebuild_presentation:true},presentation),true);assert.equal(shouldBuildPresentation({},path.join(dir,'missing.json')),true);fs.rmSync(dir,{recursive:true,force:true});});
