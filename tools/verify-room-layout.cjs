const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{const p=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.url())});
 await p.route('**/room-check',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0}canvas{width:1200px;height:800px}#world-labels{display:none}</style><canvas></canvas><div id="world-labels"></div><div id="interact-hint"></div><script type="module">import {prepareSources} from "/source-sprites.js";import {World} from "/world.js";await prepareSources();window.w=new World(document.querySelector("canvas"),()=>{});</script>'}));await p.goto('http://127.0.0.1:4188/room-check');await p.waitForFunction(()=>window.w);
 for(const service of ['home','shop','lab','heal','ranger','berry','pet','arcade','cave','grotto']){
  const result=await p.evaluate(service=>{w.load(0,{service,name:service});w.paused=true;const fail=[];const cells=new Set(),q=[[0,5.5]];for(let i=0;i<q.length;i++){const [x,z]=q[i],key=x+','+z;if(cells.has(key)||!w.canMove(x,z))continue;cells.add(key);for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const a=x+dx,b=z+dz;if(a>=-8.5&&a<=8.5&&b>=-7&&b<=7.5&&!cells.has(a+','+b))q.push([a,b])}}
   for(const e of w.entities){if(![...cells].some(k=>{const [x,z]=k.split(',').map(Number);return Math.hypot(e.x-x,e.z-z)<1.65}))fail.push('unreachable '+e.name)}
   for(const o of w.obstacles){if(w.canMove(o.x,o.z))fail.push('walkable obstacle '+o.kind)}
   if(['home','lab','berry','pet'].includes(service)&&w.obstacles.some(o=>o.kind==='counter'))fail.push('unwanted counter');
   if(w.entities.some(e=>e.id==='pc')!==(service==='heal'))fail.push('PC in wrong room');
   if(w.layoutWarnings.length)fail.push('NPC layout '+w.layoutWarnings.join(','));return fail;
  },service);assert.deepEqual(result,[],service);await p.waitForTimeout(600);await p.screenshot({path:__dirname+'/../room-review-'+service+'.png'});
  if(['shop','heal','ranger','arcade'].includes(service)){
   await p.evaluate(()=>{w.pos.set(0,0,-1);w.paused=false;w.keys.add('w');w.keys.add('shift')});await p.waitForTimeout(1200);const d=await p.evaluate(()=>{w.keys.clear();return{x:w.pos.x,z:w.pos.z,valid:w.canMove(w.pos.x,w.pos.z)}});assert.ok(d.valid&&d.z>=-2.35,service+' sprint through counter');
   const path=await p.evaluate(()=>{w.pos.set(0,0,1);w.routeTo(w.pos.clone().set(0,0,-6));return [w.target,...w.path].filter(Boolean).every(v=>w.canMove(v.x,v.z))});assert.ok(path,'invalid click path');
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS ten distinct rooms: reachable services and exits, solid furniture, counter sprint/click collision, NPC layout and assets');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
