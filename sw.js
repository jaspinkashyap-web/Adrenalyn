/* Adrenalyn offline support: saves the app on the phone after the first visit.
   The page itself is checked online first so updates show up; everything falls back to the saved copy with no signal. */
const CACHE='adrenalyn-v3';
const CORE=['./','index.html','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png','favicon-32.png','adrenalyn-icon.svg'];
const POSE=['pose.js','pose_landmark_lite.tflite','pose_solution_packed_assets.data','pose_solution_packed_assets_loader.js','pose_solution_simd_wasm_bin.js','pose_solution_simd_wasm_bin.wasm','pose_solution_simd_wasm_bin.data','pose_solution_wasm_bin.js','pose_solution_wasm_bin.wasm','pose_web.binarypb'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).then(()=>Promise.all(POSE.map(u=>c.add(u).catch(()=>null))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const url=new URL(r.url);
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));return res}).catch(()=>caches.match('index.html')));return}
  /* fonts and our own files: saved copy first, refresh in the background */
  if(url.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>hit);return hit||net}));
  }
});
