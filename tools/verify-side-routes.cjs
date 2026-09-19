const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1060}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.route('**/route-harness',r=>r.fulfill({contentType:'text/html',body:'<div style="width:1000px;height:700px"><canvas id="world" style="width:100%;height:100%"></canvas></div><div id="world-labels"></div><div id="interact-hint"></div><script type="module">import {World} from "/world.js";window.testWorld=new World(document.querySelector("canvas"),()=>{});</script>'}));
 await page.goto('http://127.0.0.1:4188/route-harness');await page.waitForFunction(()=>window.testWorld);
 const findings=await page.evaluate(()=>{
  const w=window.testWorld,result=[];
  function reachable(){const start=[Math.round(w.pos.x),Math.round(w.pos.z)],q=[start],seen=new Set([start.join(',')]);for(let j=0;j<q.length;j++){const [x,z]=q[j];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=z+dz,k=a+','+b;if(!seen.has(k)&&w.canMove(a,b)){seen.add(k);q.push([a,b])}}}return e=>q.some(([x,z])=>Math.hypot(e.x-x,e.z-z)<1.6)}
  for(let i=0;i<6;i++){w.load(i);let can=reachable();for(const e of w.entities.filter(e=>e.id!=='wild'))if(!can(e))result.push('Town gate unreachable '+i+' '+e.name);
   w.load(i,{name:'route',service:'route-'+i});can=reachable();for(const e of w.entities)if(!can(e))result.push('Route entity unreachable '+i+' '+e.name);
   const gates=w.entities.filter(e=>e.id==='route-town');for(const e of w.wild)if(gates.some(g=>Math.hypot(g.x-e.x,g.z-e.z)<6))result.push('Unsafe encounter '+i);
  }return result;
 });assert.deepEqual(findings,[]);console.log('PASS all 12 town gates, 6 route maps, observations, NPCs and safe encounters reachable');
 await page.goto('http://127.0.0.1:4188');await page.waitForFunction(()=>window.echoDiagnostics?.().ready);
 async function visit(name){const e=await page.evaluate(name=>echoDiagnostics().entities.find(e=>e.name===name),name);assert.ok(e,name);await page.locator('#buildings').click();await page.locator('[data-station]').filter({hasText:name}).click();await page.waitForFunction(e=>Math.hypot(echoDiagnostics().position.x-e.x,echoDiagnostics().position.z-e.z)<1.65,e,{timeout:30000});await page.keyboard.press('e');}
 await page.screenshot({path:__dirname+'/../town-layout-review.png'});await page.keyboard.press('m');await page.screenshot({path:__dirname+'/../region-map-review.png'});await page.locator('#close').click();await visit('西行 · 风铃公园');await page.waitForFunction(()=>echoDiagnostics().interior?.service==='route-0');
 assert.ok((await page.evaluate(()=>echoDiagnostics().position.x))>15,'Westbound travel must enter the eastern edge');await page.screenshot({path:__dirname+'/../side-route-park.png'});
 for(const name of ['池边的脚印','花廊的铃绳','长椅上的回信']){await visit(name);await page.getByRole('button',{name:'记录这次发现'}).click();await page.locator('#close').click()}
 const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('pokemon-echoes-v1')));assert.equal(first.surveys.length,3);assert.equal(first.money,1380);
 await visit('长椅上的回信');assert.equal(await page.getByRole('button',{name:'记录这次发现'}).count(),0);await page.locator('#close').click();await page.locator('#save').click();await page.reload();await page.waitForFunction(()=>echoDiagnostics().interior?.service==='route-0');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pokemon-echoes-v1')).surveys.length),3);
 const town=await page.evaluate(()=>echoDiagnostics().entities.find(e=>e.destination===2).name);await visit(town);await page.waitForFunction(()=>echoDiagnostics().area===2&&!echoDiagnostics().interior);
 assert.ok((await page.evaluate(()=>echoDiagnostics().position.x))>14);
 await visit('东行 · 风铃公园');await page.waitForFunction(()=>echoDiagnostics().interior?.service==='route-0');const home=await page.evaluate(()=>echoDiagnostics().entities.find(e=>e.destination===0).name);await visit(home);await page.waitForFunction(()=>echoDiagnostics().area===0&&!echoDiagnostics().interior);
 console.log('PASS bidirectional crossing, three discoveries, single reward, save/reload and return to originating town');
 // Locked destination must remain locked through side entrances too.
 await page.addInitScript(()=>{const k='pokemon-echoes-v1',s=JSON.parse(localStorage.getItem(k));s.area=3;s.stage=0;s.room={name:'苔影古道',service:'route-3',returnPoint:{area:3,x:-18,z:6}};localStorage.setItem(k,JSON.stringify(s))});await page.reload();await page.waitForFunction(()=>echoDiagnostics().interior?.service==='route-3');const ruin=await page.evaluate(()=>echoDiagnostics().entities.find(e=>e.destination===5).name);await visit(ruin);assert.equal(await page.evaluate(()=>echoDiagnostics().area),3);assert.equal(await page.evaluate(()=>echoDiagnostics().interior.service),'route-3');
 assert.deepEqual(errors,[]);console.log('PASS ruin gate preserved and no browser/asset errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
