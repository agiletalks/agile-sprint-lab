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
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(pathname==='/healthz'){res.writeHead(200,{'content-type':'text/plain'});res.end('ok');return;}
    let target,type='text/html; charset=utf-8';
    if(pathname==='/'||pathname==='/Agile-Sprint-Lab-Projection.html') target=file;
    else if(pathname==='/test-results') target=path.join(root,'reports/latest.html');
    else if(/^\/qa\/[a-zA-Z0-9._-]+\.png$/.test(pathname)){target=path.join(root,'screenshots',path.basename(pathname));type='image/png';}
    if(!target){res.writeHead(404);res.end('Not found');return;}
    const data=await readFile(target);
    res.writeHead(200,{'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff'});res.end(data);
  }catch(e){res.writeHead(e.code==='ENOENT'?404:500,{'content-type':'text/plain; charset=utf-8'});res.end(e.code==='ENOENT'?'尚無測試報告。請執行 npm run test:e2e。':'Server error');}
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} 已被使用。可開啟現有服務，或用 PORT=4174 npm run dev 選其他連接埠。`:e.message);process.exitCode=1;});
server.listen(port,host,()=>console.log(`Agile Sprint Lab projection: http://${host}:${server.address().port}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
