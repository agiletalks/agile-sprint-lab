const CACHE='agile-lab-v2';
self.addEventListener('install',event=>{event.waitUntil((async()=>{const assets=await (await fetch('/offline-assets.json',{cache:'no-store'})).json();const c=await caches.open(CACHE);await c.addAll(['/','/project','/upload','/favicon.svg',...assets]);})());self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))]));});
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/')||u.pathname.includes('signin')||u.pathname.includes('signout')||u.pathname.includes('callback'))return;
 if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(u.pathname,copy));}return r;}).catch(()=>caches.match(u.pathname).then(r=>r||caches.match('/'))));}
 else{event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(r=>{if(r.ok&&!u.pathname.includes('/@vite/')){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return r;})));}
});
