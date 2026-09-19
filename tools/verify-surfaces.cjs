const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const p=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.url())});
 await p.route('**/surface-check',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0}canvas{width:1200px;height:800px}#world-labels{display:none}</style><canvas></canvas><div id="world-labels"></div><div id="interact-hint"></div><script type="module">import {prepareSources} from "/source-sprites.js";import {World} from "/world.js";await prepareSources();window.w=new World(document.querySelector("canvas"),()=>{});</script>'}));
 await p.goto('http://127.0.0.1:4188/surface-check');await p.waitForFunction(()=>window.w);
 const result=await p.evaluate(async()=>{const {sceneSurface}=await import('/surface-art.js'),fail=[],rows=[];
  for(let a=0;a<6;a++)for(const service of [null,'route-'+a,'cave','grotto','shop','arcade','lab','ranger','echo-district']){w.load(a,service?{service,name:'review'}:null);if(w.roadSurface!==sceneSurface(w))fail.push('surface '+a+':'+service);const guests=w.wild.filter(e=>e.plantGuest);if(!service||service.startsWith('route-')){if(guests.length!==1)fail.push('missing plant guest '+a+':'+service);for(const e of guests){if(!w.canMove(e.x,e.z))fail.push('blocked guest');if(w.entities.some(t=>t.portal&&Math.hypot(e.x-t.x,e.z-t.z)<6.5))fail.push('guest near door')}}rows.push([a,service,w.roadSurface,guests.map(e=>e.pokemon)]);
  }return {fail,rows};});assert.deepEqual(result.fail,[]);console.log(JSON.stringify(result.rows));
 for(const [area,service,name] of [[5,'route-5','ruin-trail'],[1,null,'forest'],[4,'shop','shop'],[4,'arcade','arcade']]){await p.evaluate(([a,s])=>w.load(a,s?{service:s,name:s}:null),[area,service]);await p.waitForTimeout(900);await p.screenshot({path:__dirname+'/../surface-'+name+'.png'});}
 assert.deepEqual(errors,[]);console.log('PASS 54 scene surfaces, 12 safe plant encounters, asset loads and screenshots');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
