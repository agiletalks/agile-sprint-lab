import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=name=>readFile(path.join(root,name),'utf8');
const [template,css,data,app]=await Promise.all([
  read('projection/index.template.html'),read('projection/src/styles.css'),read('projection/src/slides.json'),read('projection/src/app.js')
]);
const slides=JSON.parse(data);
if(slides.length!==26||slides.reduce((n,s)=>n+s.durationSec,0)!==7200)throw Error('Invalid workshop content');
// Embedded images: everything works offline from one HTML file.
const asset=async(file,mime)=>{try{return `data:${mime};base64,${(await readFile(path.join(root,'projection/assets',file))).toString('base64')}`;}catch(e){if(e.code==='ENOENT')return '';throw e;}};
const config={
  profileImageDataUri:await asset('percy-cartoon.png','image/png'),
  logoDataUri:await asset('agility-logo.jpg','image/jpeg'),
  contactQr:{wechat:await asset('qr-wechat.png','image/png'),linkedin:await asset('qr-linkedin.png','image/png')},
  cards:{
    intro:await asset('01_Introduction_Card_Example.png','image/png'),
    challenge:await asset('02_Challenge_Card_Example.png','image/png'),
    ac:await asset('03_Acceptance_Criteria_Example.png','image/png'),
    dor:await asset('04_DoR_Card_Example.jpg','image/jpeg'),
    dod:await asset('05_DoD_Card_Example.jpg','image/jpeg')
  }
};
const html=template.replace('/* INLINE_CSS */',()=>css)
  .replace('/* INLINE_DATA */',()=>JSON.stringify(slides).replaceAll('<','\\u003c'))
  .replace('/* INLINE_CONFIG */',()=>JSON.stringify(config))
  .replace('/* INLINE_APP */',()=>app.replaceAll('</script','<\\/script'));
await mkdir(path.join(root,'projection/dist'),{recursive:true});
await writeFile(path.join(root,'projection/dist/Agile-Sprint-Lab-Projection.html'),html);
await writeFile(path.join(root,'projection/Agile-Sprint-Lab-Projection.html'),html);
console.log(`Built projection/dist/Agile-Sprint-Lab-Projection.html (${Buffer.byteLength(html)} bytes). 26 pages. No runtime network dependencies.`);
