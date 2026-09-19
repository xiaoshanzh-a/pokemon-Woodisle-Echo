const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1440,height:1060}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.route('**/living-harness',r=>r.fulfill({contentType:'text/html',body:'<canvas style="width:1200px;height:800px"></canvas><div id="world-labels"></div><div id="interact-hint"></div><script type="module">import {World} from "/world.js";import {prepareSources} from "/source-sprites.js";await prepareSources();window.w=new World(document.querySelector("canvas"),()=>{});</script>'}));
 await page.goto('http://127.0.0.1:4188/living-harness');await page.waitForFunction(()=>window.w);
 const result=await page.evaluate(async()=>{const {animateWild}=await import('/living-world.js'),fail=[],counts=[];
  for(let area=0;area<6;area++)for(const room of [null,{service:'route-'+area,name:'route'},{service:'echo-district',name:'district'}]){
   w.load(area,room);const people=w.entities.filter(e=>e.actor),assets=people.map(e=>e.actor.userData.asset);if(new Set(assets).size!==assets.length)fail.push('Duplicate NPC '+area+' '+room?.service+' '+assets.join(','));
   if(room?.service==='echo-district')continue;
   counts.push([area,room?.service||'main',w.wild.length]);if(w.wild.length<3)fail.push('Too few wild '+area);
   const start=w.wild.map(e=>[e.x,e.z]);w.pos.set(0,0,5);let moved=false;
   for(let n=0;n<500;n++){w.time+=.04;animateWild(w,.04);for(const [i,e]of w.wild.entries()){if(!w.canMove(e.x,e.z))fail.push('Wild enters obstacle '+area);if(Math.hypot(e.x-start[i][0],e.z-start[i][1])>1.01)fail.push('Wild leaves home '+area);if(Math.hypot(e.mesh.position.x-e.x,e.mesh.position.z-e.z)>.01)fail.push('Interaction stale');if(Math.hypot(e.x-start[i][0],e.z-start[i][1])>.2)moved=true;}}
   if(!moved)fail.push('No motion '+area);w.paused=true;const stopped=w.wild.map(e=>[e.x,e.z]);w.time+=5;animateWild(w,1);if(w.wild.some((e,i)=>e.x!==stopped[i][0]||e.z!==stopped[i][1]))fail.push('Moves during pause');w.paused=false;
  }return {fail,counts};});assert.deepEqual(result.fail,[]);console.log('PASS unique local people; ecology counts',JSON.stringify(result.counts));
 await page.goto('http://127.0.0.1:4188');await page.waitForFunction(()=>window.echoDiagnostics?.().ready);
 async function visitName(name){if(await page.locator('#modal').isVisible())await page.locator('#close').click();const e=await page.evaluate(name=>echoDiagnostics().entities.find(e=>e.name===name),name);await page.locator('#buildings').click();await page.locator('[data-station]').filter({hasText:name}).click();await page.waitForFunction(e=>Math.hypot(echoDiagnostics().position.x-e.x,echoDiagnostics().position.z-e.z)<1.65,e,{timeout:25000});await page.keyboard.press('e');}
 await visitName('剧情街区 · 修理庭');await page.waitForFunction(()=>echoDiagnostics().interior?.service==='echo-district');await page.screenshot({path:__dirname+'/../living-residences.png'});
 const door=await page.evaluate(()=>echoDiagnostics().entities.find(e=>e.id==='echo-building').name);await visitName(door);assert.equal(await page.evaluate(()=>echoDiagnostics().interior.service),'home');await page.locator('#save').click();await page.reload();await page.waitForFunction(()=>window.echoDiagnostics?.().ready);assert.equal(await page.evaluate(()=>echoDiagnostics().interior.service),'home');
 await visitName(await page.evaluate(()=>echoDiagnostics().entities.find(e=>e.id==='exit').name));assert.equal(await page.evaluate(()=>echoDiagnostics().interior.service),'echo-district');await visitName('返回 · 主区域');assert.equal(await page.evaluate(()=>echoDiagnostics().interior),null);
 assert.deepEqual(errors,[]);console.log('PASS new residential entrance, save/reload inside, nested return to courtyard and originating town; no asset errors');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
