const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:1060}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://127.0.0.1:4188');await page.waitForFunction(()=>window.echoDiagnostics?.().ready);
 const diag=()=>page.evaluate(()=>echoDiagnostics());
 async function station(name,id){
  await page.locator('#buildings').click();await page.getByRole('button',{name,exact:false}).last().click();
  await page.waitForFunction(id=>{const d=echoDiagnostics(),e=d.entities.find(e=>e.id===id);return e&&Math.hypot(d.position.x-e.x,d.position.z-e.z)<1.65},id,{timeout:18000});
  await page.keyboard.press('e');
 }
 let total=0;
 for(let area=0;area<5;area++){
  await page.locator('[data-panel="map"]').click();await page.locator(`[data-travel="${area}"]`).click();
  const doors=(await diag()).entities.filter(e=>e.portal&&!e.service?.startsWith('route-')&&e.service!=='cave');
  for(const door of doors){
   await station(door.name,door.id);await page.waitForFunction(()=>!!echoDiagnostics().interior);
   assert.equal((await diag()).interior.service,door.service);
   assert.equal((await diag()).entities.some(e=>e.id==='exit'),true);
   await station((await diag()).entities.find(e=>e.id===door.service).name,door.service);
   if(door.service==='shop'){
    const before=await page.locator('#money').textContent();await page.locator('[data-buy="balls"]').click();assert.notEqual(await page.locator('#money').textContent(),before);
   }
   if(door.service==='heal'||door.service==='home')for(const m of (await diag()).team)assert.equal(m.hp,m.max);
   if(door.service==='lab'){
    await page.getByRole('button',{name:'选择一位新的同行伙伴'}).click();await page.getByRole('button',{name:'选择小火龙',exact:true}).click();assert.ok((await diag()).team.some(m=>m.id==='charmander'));
   }
   if(await page.locator('#modal').isVisible())await page.locator('#close').click();
   // Free berry supply gives a toast, all other stations have a modal.
   if(door.service==='heal'){await station('电脑 · 队伍与后备盒','pc');assert.equal(await page.locator('.team-tile').count()>0,true);await page.locator('#close').click();}else assert.equal((await diag()).entities.some(e=>e.id==='pc'),false);
   if(door.service==='heal'&&area===0){
    await page.screenshot({path:__dirname+'/../interior-center.png',fullPage:true});await page.locator('#save').click();await page.reload();await page.waitForFunction(()=>window.echoDiagnostics?.().ready);assert.equal((await diag()).interior.service,'heal');
   }
   await station('离开 · '+door.name,'exit');await page.waitForFunction(()=>!echoDiagnostics().interior);
   const out=await diag();assert.equal(out.area,area);assert.ok(Math.abs(out.position.x-door.x)<.1);assert.ok(Math.abs(out.position.z-(door.z+(door.returnOffset??1.2)))<.1);assert.ok(out.position.z<20&&out.position.z>-19);total++;console.log('PASS enter, service, PC, exit:',area,door.name);
  }
 }
 await page.locator('[data-panel="map"]').click();await page.locator('[data-travel="0"]').click();
 // Face right and left on open ground; verify UV flipping and animated frames.
 await page.keyboard.down('d');await page.waitForTimeout(420);let d=await diag();assert.equal(d.playerDirection,2);assert.equal(d.playerFlip,true);await page.keyboard.up('d');
 const samples=[];await page.keyboard.down('a');for(let i=0;i<5;i++){await page.waitForTimeout(170);samples.push(await diag())}await page.keyboard.up('a');
 assert.ok(samples.some(d=>!d.playerFlip));assert.ok(new Set(samples.map(d=>d.playerFrame)).size>1);assert.ok(samples.some(d=>d.follower.moving));
 assert.deepEqual(errors,[]);console.log('PASS direction, walking frames, follower movement, no errors; buildings:',total);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
