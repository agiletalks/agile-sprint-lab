import {readdirSync,writeFileSync,copyFileSync} from 'node:fs';
import path from 'node:path';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const assets=walk('dist/client').filter(p=>/\.(js|css)$/.test(p)&&!p.endsWith('sw.js')).map(p=>'/'+p.replaceAll('\\','/').replace('dist/client/',''));
writeFileSync('public/offline-assets.json',JSON.stringify(assets));
copyFileSync('public/offline-assets.json','dist/client/offline-assets.json');
copyFileSync('public/sw.js','dist/client/sw.js');
console.log('Offline bundle contains',assets.length,'assets');
