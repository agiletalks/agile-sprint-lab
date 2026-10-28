import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=name=>readFile(path.join(root,name),'utf8');
const [template,css,data,engine,app,qr]=await Promise.all([
  read('projection/index.template.html'),read('projection/src/styles.css'),read('projection/src/slides.json'),
  read('projection/src/engine.js'),read('projection/src/app.js'),read('node_modules/qrcode-generator/dist/qrcode.js')
]);
const slides=JSON.parse(data);
if(slides.length!==26||slides.reduce((n,s)=>n+s.durationSec,0)!==7200)throw Error('Invalid workshop content');
let config={};
try {const b=await readFile(path.join(root,'projection/assets/agility-logo.jpg'));config.logoDataUri=`data:image/jpeg;base64,${b.toString('base64')}`;}catch(e){if(e.code!=='ENOENT')throw e;}
const script=engine.replace(/^export /gm,'')+'\n'+app.replace(/^import .*?;\n/,'');
const html=template.replace('/* INLINE_CSS */',()=>css).replace('/* INLINE_DATA */',()=>JSON.stringify(slides).replaceAll('<','\\u003c'))
 .replace('/* INLINE_CONFIG */',()=>JSON.stringify(config)).replace('/* INLINE_QR */',()=>qr.replaceAll('</script','<\\/script')).replace('/* INLINE_APP */',()=>script.replaceAll('</script','<\\/script'));
await mkdir(path.join(root,'projection/dist'),{recursive:true});
await writeFile(path.join(root,'projection/dist/Agile-Sprint-Lab-Projection.html'),html);
await writeFile(path.join(root,'projection/Agile-Sprint-Lab-Projection.html'),html);
console.log(`Built projection/dist/Agile-Sprint-Lab-Projection.html (${Buffer.byteLength(html)} bytes). 26 pages / 120 minutes. No runtime network dependencies.`);
