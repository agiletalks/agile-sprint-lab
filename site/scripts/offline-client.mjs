import {readFileSync,writeFileSync} from 'node:fs';
let s=readFileSync('app/lab.jsx','utf8');
s=s.replace("const stored=await read('active');const q=new URLSearchParams(location.search);const code=q.get('code')||stored?.code;","const q=new URLSearchParams(location.search);const stored=(mode==='project'&&q.get('code')?await read('projection-'+q.get('code')):null)||await read('active');const code=q.get('code')||stored?.code;");
s=s.replace("setState(e.data.state);setSession(e.data.session);","setState(e.data.state);setSession(e.data.session);save('projection-'+e.data.session.code,e.data.session).catch(()=>{});");
s=s.replace("setConnected(true);if(mode==='host'&&!preserve)","setConnected(true);if(mode==='project')await save('projection-'+code,j);if(mode==='host'&&!preserve)");
writeFileSync('app/lab.jsx',s);
