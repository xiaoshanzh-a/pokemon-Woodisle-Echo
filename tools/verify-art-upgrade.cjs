const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url())});
 await page.route('**/art-harness',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0}canvas{width:1200px;height:800px}#world-labels{display:none}</style><canvas></canvas><div id="world-labels"></div><div id="interact-hint"></div><script type="module">import {prepareSources} from "/source-sprites.js";import {World} from "/world.js";await prepareSources();window.w=new World(document.querySelector("canvas"),()=>{});</script>'}));
 await page.goto('http://127.0.0.1:4188/art-harness');await page.waitForFunction(()=>window.w);
 let count=0;
 for(let area=0;area<6;area++){
  const result=await page.evaluate(async area=>{w.load(area);await new Promise(r=>setTimeout(r,1000));const buildings=w.land.children.filter(s=>s.userData.building),doors=w.land.children.filter(s=>s.userData.buildingDoor),fail=[];
   if(w.land.children.some(s=>s.userData.doorway))fail.push('solid door block remains');
   if(doors.length!==buildings.length)fail.push('missing textured door');
   for(const s of buildings){const im=s.material.map.image;if(!im?.width||Math.abs(s.scale.x/s.scale.y-im.width/im.height)>.01)fail.push('distorted building '+s.userData.asset)}
   for(const s of doors){if(s.scale.y<2.5||!s.material.map.image?.width)fail.push('small or unloaded door')}
   return {fail,count:buildings.length};
  },area);assert.deepEqual(result.fail,[],`area ${area}`);count+=result.count;
  await page.screenshot({path:__dirname+'/../art-review-'+area+'.png'});
 }
 assert.equal(count,13);assert.deepEqual(errors,[]);
 await page.goto('http://127.0.0.1:4188');await page.waitForFunction(()=>window.echoDiagnostics?.().ready);
 await page.evaluate(()=>{const b=document.querySelector('#battle');b.hidden=false;b.innerHTML='<img class="battle-mon ally" src="assets/charmander-back.png"><img class="battle-mon enemy" src="assets/bulbasaur-front.png">'});
 await page.evaluate(()=>{window.effect=import('./battle-fx.js').then(({battleFX})=>battleFX('sendout'))});await page.waitForTimeout(250);await page.screenshot({path:__dirname+'/../summon-review.png'});await page.evaluate(()=>window.effect);
 assert.equal(await page.locator('.battle-fx').count(),0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(async()=>{const {battleFX}=await import('./battle-fx.js');await battleFX('sendout');await battleFX('attack',{type:'火'})});assert.equal(await page.locator('.battle-fx').count(),0);assert.deepEqual(errors,[]);
 console.log('PASS 13 proportional buildings, textured player-sized doors, six area assets/screenshots, summon cleanup and reduced motion');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
