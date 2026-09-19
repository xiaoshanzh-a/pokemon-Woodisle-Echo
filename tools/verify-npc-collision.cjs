const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

function checkScene(d,label){
 const actors=d.entities.filter(e=>e.actor);
 assert.deepEqual(d.layoutWarnings,[],label+' has NPC layout warnings');
 assert.ok(actors.length,label+' has no tracked NPC actors');
 for(const e of actors){
  const a=e.actor;
  const own=d.obstacles.find(o=>o.kind==='npc'&&o.entity===e.id&&Math.hypot(o.x-a.x,o.z-a.z)<.02);
  assert.ok(own,label+' missing NPC collision: '+e.name);
  for(const o of d.obstacles.filter(o=>o.kind&&o.kind!=='npc'&&o.kind!=='counter')){
   const overlaps=Math.abs(a.x-o.x)<o.w/2+.08&&Math.abs(a.z-o.z)<o.d/2+.08;
   assert.equal(overlaps,false,`${label} NPC ${e.name} overlaps ${o.kind}`);
  }
 }
 for(let i=0;i<actors.length;i++)for(let j=i+1;j<actors.length;j++){
  const a=actors[i].actor,b=actors[j].actor;
  assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>=.72,`${label} NPC overlap: ${actors[i].name} / ${actors[j].name}`);
 }
}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:1060}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://127.0.0.1:4188');await page.waitForFunction(()=>window.echoDiagnostics?.().ready);
 await page.locator('#save').click();const saveKey=await page.evaluate(()=>echoDiagnostics().saveKey),seed=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),saveKey);seed.stage=6;seed.area=0;await page.addInitScript(([key,value])=>localStorage.setItem(key,JSON.stringify(value)),[saveKey,seed]);await page.reload();await page.waitForFunction(()=>window.echoDiagnostics?.().ready);
 const diag=()=>page.evaluate(()=>echoDiagnostics());
 async function travel(area){
  await page.locator('[data-panel="map"]').click();await page.locator(`[data-travel="${area}"]`).click();
  await page.waitForFunction(a=>{const d=echoDiagnostics();return d.area===a&&!d.interior},area);
 }
 async function activate(id){
  const e=await page.evaluate(id=>echoDiagnostics().entities.find(e=>e.id===id),id);assert.ok(e,id);
  await page.locator('#buildings').click();await page.getByRole('button',{name:e.name,exact:false}).last().click();
  await page.waitForFunction(id=>{const d=echoDiagnostics(),e=d.entities.find(e=>e.id===id);return e&&Math.hypot(d.position.x-e.x,d.position.z-e.z)<1.65},id,{timeout:20000});
  await page.keyboard.press('e');
 }
 async function enter(id){
  await activate(id);await page.waitForFunction(()=>!!echoDiagnostics().interior);
 }
 async function leave(){
  await activate('exit');
  await page.waitForFunction(()=>{const d=echoDiagnostics();return !d.interior});
 }
 for(let area=0;area<6;area++){
  await travel(area);checkScene(await diag(),`area ${area}`);
  const doors=(await diag()).entities.filter(e=>e.portal&&!e.service?.startsWith('route-')&&!e.service?.startsWith('wildland-')&&e.service!=='cave');
  for(const door of doors){await enter(door.id);checkScene(await diag(),`area ${area} ${door.service}`);await leave();}
  for(const route of (await diag()).entities.filter(e=>e.portal&&e.service?.startsWith('route-'))){
   await enter(route.id);checkScene(await diag(),`area ${area} ${route.service}`);
   const town=(await diag()).entities.find(e=>e.id==='route-town');assert.ok(town,`missing return town for ${route.service}`);
   await activate('route-town');await page.waitForFunction(()=>!echoDiagnostics().interior);await travel(area);
  }
  const cave=(await diag()).entities.find(e=>e.id==='cave');
  if(cave){
   await enter('cave');checkScene(await diag(),`area ${area} cave`);
   if((await diag()).entities.some(e=>e.id==='grotto')){await enter('grotto');checkScene(await diag(),`area ${area} grotto`);await activate('cave-return');await page.waitForFunction(()=>echoDiagnostics().interior?.service==='cave');checkScene(await diag(),`area ${area} cave return`);}
   await leave();
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS NPC collision anchors, spacing, furniture clearance and exit checks across all main areas and building interiors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
