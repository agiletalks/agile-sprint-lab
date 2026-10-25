import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import scripts from '@/lib/scripts.json';
import {initialState,stages} from '@/lib/content';
export const dynamic='force-dynamic';
const json=(o:unknown,status=200)=>Response.json(o,{status,headers:{'Cache-Control':'no-store'}});
async function isHost(){const u=await getChatGPTUser();return !!u && (u.email.toLowerCase()===env.HOST_EMAIL?.toLowerCase() || (import.meta.env.DEV && u.email==='seedy@sites.test'));}
function db(){if(!env.DB)throw Error('Workshop storage is unavailable.');return env.DB;}
function validCode(c:string){return /^[A-Z0-9]{8}$/.test(c);}
async function session(c:string){return validCode(c)?await db().prepare('SELECT * FROM sessions WHERE code = ?').bind(c).first<{code:string;title:string;state:string;accepting:number}>():null;}
export async function GET(req:Request){
 try{
  const q=new URL(req.url).searchParams;
  if(q.get('mode')==='host')return json({authorized:await isHost()});
  if(q.get('mode')==='scripts'){if(!await isHost())return json({error:'Host access required.'},403);return json(scripts);}
  if(q.get('mode')==='sessions'){if(!await isHost())return json({error:'Host access required.'},403);return json((await db().prepare('SELECT code,title,created,accepting FROM sessions ORDER BY created DESC').all()).results);}
  const c=(q.get('code')||'').toUpperCase();const s=await session(c);if(!s)return json({error:'Check your workshop code.'},404);
  if(q.get('image')){
   const p=await db().prepare('SELECT key,mime FROM posters WHERE id = ? AND code = ?').bind(q.get('image'),c).first<{key:string;mime:string}>();if(!p)return json({error:'Poster not found.'},404);
   const image=await env.BUCKET?.get(p.key);if(!image)return json({error:'Photo not found.'},404);
   return new Response(image.body,{headers:{'Content-Type':p.mime,'Cache-Control':'private, max-age=3600','X-Content-Type-Options':'nosniff'}});
  }
  const posters=(await db().prepare('SELECT id,team,title,status,created FROM posters WHERE code = ? ORDER BY created DESC').bind(c).all()).results;
  return json({code:c,title:s.title,state:JSON.parse(s.state),accepting:!!s.accepting,posters});
 }catch{return json({error:'Could not connect to workshop storage. Your physical activities can continue.'},503);}
}
export async function POST(req:Request){
 try{
  const origin=req.headers.get('origin');if(origin && origin!==new URL(req.url).origin)return json({error:'Invalid request origin.'},403);
  if(req.headers.get('content-type')?.includes('multipart/form-data')){
   if(Number(req.headers.get('content-length')||0)>11*1024*1024)return json({error:'Please choose a photo under 10 MB.'},413);
   const f=await req.formData();const c=String(f.get('code')||'').toUpperCase();const s=await session(c);if(!s)return json({error:'Check your workshop code.'},404);
   const id=String(f.get('id')||'');const team=Number(f.get('team'));const title=String(f.get('title')||'').trim();const image=f.get('image');
   if(!/^[0-9a-f-]{36}$/.test(id)||!Number.isInteger(team)||team<1||team>JSON.parse(s.state).teamCount||!title||title.length>160||!(image instanceof File))return json({error:'Choose a team, add a short title, and select a photo.'},400);
   const existing=await db().prepare('SELECT code FROM posters WHERE id = ?').bind(id).first<{code:string}>();if(existing)return existing.code===c?json({id,duplicate:true}):json({error:'Please start a new submission.'},409);
   if(!s.accepting)return json({error:'This workshop is no longer accepting uploads. Keep your photo for the facilitator.'},409);
   if(image.size>10*1024*1024||image.size<12)return json({error:'Please choose a photo under 10 MB.'},413);
   const bytes=new Uint8Array(await image.arrayBuffer());
   const mime=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10'?'image/png':new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP'?'image/webp':null;
   if(!mime)return json({error:'Use a JPG, PNG, or WebP photo. Convert HEIC photos before uploading.'},400);
   if(!env.BUCKET)return json({error:'Photo storage is unavailable. Please keep your photo and try again.'},503);
   const key=`${c}/${id}`;await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:mime}});
   const status=f.get('status')==='wip'?'wip':'complete';
   await db().prepare('INSERT OR IGNORE INTO posters (id,code,team,title,key,mime,status,created) VALUES (?,?,?,?,?,?,?,?)').bind(id,c,team,title,key,mime,status,Date.now()).run();
   return json({id});
  }
  if(!await isHost())return json({error:'Only the workshop host can make this change.'},403);
  const p=await req.json() as Record<string, any>;
  if(p.op==='create'){
   const c=Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('');
   const title=String(p.title||'Agile Sprint Lab').slice(0,100);const state={...initialState,teamCount:Math.min(20,Math.max(1,Math.trunc(Number(p.teamCount)||8))),hostName:String(p.hostName||'Percy Hsu').slice(0,80)};
   await db().prepare('INSERT INTO sessions (code,title,state,accepting,created) VALUES (?,?,?,1,?)').bind(c,title,JSON.stringify(state),Date.now()).run();return json({code:c,title,state,accepting:true,posters:[]});
  }
  const s=await session(String(p.code||''));if(!s)return json({error:'Workshop not found.'},404);
  if(p.op==='state'){
   const t=p.state;if(!t||!Number.isInteger(t.stage)||t.stage<0||t.stage>=stages.length||!Number.isFinite(t.remaining)||t.remaining<0||t.remaining>86400||t.end!==null&&!Number.isFinite(t.end)||t.started!==null&&!Number.isFinite(t.started)||typeof t.running!=='boolean'||!Number.isInteger(t.teamCount)||t.teamCount<1||t.teamCount>20)return json({error:'Invalid timer or stage.'},400);
   const safe={...initialState,...t,hostName:String(t.hostName).slice(0,80),slide:Math.min(2,Math.max(0,Number(t.slide)||0))};
   await db().prepare('UPDATE sessions SET state = ? WHERE code = ?').bind(JSON.stringify(safe),s.code).run();return json({ok:true});
  }
  if(p.op==='accept'){await db().prepare('UPDATE sessions SET accepting = ? WHERE code = ?').bind(p.accepting?1:0,s.code).run();return json({ok:true});}
  if(p.op==='edit'){
   const team=Number(p.team),title=String(p.title||'').trim();if(!Number.isInteger(team)||team<1||team>JSON.parse(s.state).teamCount||!title||title.length>160)return json({error:'Check the title and team number.'},400);
   await db().prepare('UPDATE posters SET team = ?,title = ? WHERE id = ? AND code = ?').bind(team,title,p.id,s.code).run();return json({ok:true});
  }
  if(p.op==='delete'){
   const poster=await db().prepare('SELECT key FROM posters WHERE id = ? AND code = ?').bind(p.id,s.code).first<{key:string}>();
   if(poster){await db().prepare('DELETE FROM posters WHERE id = ? AND code = ?').bind(p.id,s.code).run();await env.BUCKET?.delete(poster.key);}return json({ok:true});
  }
  return json({error:'Unknown action.'},400);
 }catch{return json({error:'The change could not be saved. Please try again.'},503);}
}
