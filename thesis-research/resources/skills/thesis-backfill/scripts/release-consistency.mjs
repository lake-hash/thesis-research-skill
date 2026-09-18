import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const list=value=>Array.isArray(value)?value:[];
const numberWords={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};

export function validateReleaseConsistency(catalog,readme){
 const errors=[],version=catalog?.release_version,status=catalog?.release_status;
 const signalCount=list(catalog?.theses).reduce((sum,row)=>sum+list(row?.signals).length,0);
 if(status==='released'&&/\blocal candidate\b/i.test(readme))errors.push('Released README still describes a local candidate');
 if(version&&!new RegExp(`Current Release\\s+[—-]\\s+${String(version).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`,'i').test(readme))errors.push('README current release does not match catalog release_version');
 const note=String(catalog?.signals_note||''),match=note.match(/\b(\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:source-reviewed\s+)?outside views?\b/i);
 if(match){const stated=/^\d+$/.test(match[1])?Number(match[1]):numberWords[match[1].toLowerCase()];if(stated!==signalCount)errors.push(`signals_note states ${stated} outside views but catalog renders ${signalCount}`);}
 return{ok:errors.length===0,errors,counts:{signals:signalCount}};
}

if(process.argv[1]&&fs.existsSync(process.argv[1])&&import.meta.url===pathToFileURL(fs.realpathSync(process.argv[1])).href){
 const[catalogFile,readmeFile]=process.argv.slice(2);if(!readmeFile)throw Error('Usage: release-consistency.mjs catalog.json README.md');
 const result=validateReleaseConsistency(JSON.parse(fs.readFileSync(catalogFile,'utf8')),fs.readFileSync(readmeFile,'utf8'));
 console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;
}
