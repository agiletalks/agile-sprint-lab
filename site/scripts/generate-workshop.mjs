import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const text=readFileSync('../Agile Sprint Lab Rundown and Facilitator Script.txt','utf8');
const chapters=[...text.matchAll(/^\d+  [A-Z][A-Z ]+\r?$/gm)];
const scripts=chapters.map((m,i)=>text.slice(m.index+m[0].length,chapters[i+1]?.index??text.indexOf('APPENDIX A')).trim());
if(scripts.length!==13)throw Error('Expected 13 script blocks');
mkdirSync('lib',{recursive:true});writeFileSync('lib/scripts.json',JSON.stringify(scripts,null,2));
