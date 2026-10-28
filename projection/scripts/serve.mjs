import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import './build.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const file=path.join(root,'dist/Agile-Sprint-Lab-Projection.html');
const port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
const server=createServer(async(req,res)=>{
  try {
    if(req.url==='/healthz'){res.writeHead(200,{'content-type':'text/plain'});res.end('ok');return;}
    if(req.url==='/'||req.url==='/Agile-Sprint-Lab-Projection.html'){
      res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});res.end(await readFile(file));return;
    }
    res.writeHead(404);res.end('Not found');
  }catch{res.writeHead(500);res.end('Server error');}
});
server.listen(port,host,()=>console.log(`Agile Sprint Lab projection: http://${host}:${port}`));
