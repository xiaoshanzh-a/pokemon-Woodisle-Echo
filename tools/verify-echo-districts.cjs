const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1060}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.route('**/district-harness',r=>r.fulfill({contentType:'text/html',body:'<canvas style="width:1000px;height:700px"></canvas><div id="world-labels"></div><div id="interact-hint"></div><script type="module">import {World} from "/world.js";import {prepareSources} from "/source-sprites.js";await prepareSources();window.w=new World(document.querySelector("canvas"),()=>{});</script>'}));
 await page.goto('http://127.0.0.1:4188/district-harness');await page.waitForFunction(()=>window.w);
 const failures=await page.evaluate(async()=>{
  const {freshEcho,migrateEcho,endingFor}=await import('/echo-data.js'),fail=[];
  if(migrateEcho(null,6).milestones.length)fail.push('Legacy save skips new events');
  const dirty=migrateEcho({version:4,observed:[0,0,8],evidence:[-1,2],milestones:['fake'],ending:'fake'},6);if(dirty.observed.join()!=='0'||dirty.evidence.join()!=='2'||dirty.ending!==null)fail.push('Invalid migration');
  const {SOURCE_SPECIES,SOURCE_IMAGES}=await import('/source-sprites.js');for(const [id]of SOURCE_SPECIES)for(const side of ['front','back','walk'])if(!SOURCE_IMAGES.get(id+'-'+side)?.startsWith('data:image/png'))fail.push('Missing prepared sprite '+id+'-'+side);
  const choices=freshEcho();choices.choices.migration='delay';if(endingFor(choices)!=='harbor')fail.push('Choice ending not derived');
  for(let i=0;i<6;i++)for(const completed of [false,true]){
   w.echoState=freshEcho();if(completed){w.echoState.milestones=['shelter','relay','migration','overdrive','council','gubo','final'];w.echoState.period='night'}
   w.load(i,{name:'district',service:'echo-district'});
   if(!w.canMove(w.pos.x,w.pos.z))fail.push('Blocked spawn '+i);
   const q=[[Math.round(w.pos.x),Math.round(w.pos.z)]],seen=new Set(q.map(p=>p.join(',')));
   for(let j=0;j<q.length;j++){const [x,z]=q[j];for(const [a,b]of [[x+1,z],[x-1,z],[x,z+1],[x,z-1]])if(!seen.has(a+','+b)&&w.canMove(a,b)){seen.add(a+','+b);q.push([a,b])}}
   for(const e of w.entities)if(!q.some(([x,z])=>Math.hypot(x-e.x,z-e.z)<1.6))fail.push('Unreachable '+i+' '+e.id);
   if(i===2){for(const z of [-4.5,4.5])for(let x=-3;x<=3;x+=.25)if(!w.canMove(x,z))fail.push('Blocked bridge '+x+','+z);if(w.canMove(0,0))fail.push('Walkable canal');}
  }return fail;
 });assert.deepEqual(failures,[]);console.log('PASS all district spawns, entities, canal bridges and day/night states reachable');
 await page.goto('http://127.0.0.1:4188/');await page.waitForFunction(()=>window.echoDiagnostics?.().ready);
 await page.locator('#save').click();
 await page.addInitScript(()=>{const k='pokemon-echoes-v1',s=JSON.parse(localStorage.getItem(k));if(s&&s.stage===0){s.stage=6;s.starter=true;localStorage.setItem(k,JSON.stringify(s))}});await page.reload();await page.waitForFunction(()=>window.echoDiagnostics?.().stage===6);
 async function close(){if(await page.locator('#modal').isVisible())await page.locator('#close').click()}
 async function visit(id){await close();const e=await page.evaluate(id=>echoDiagnostics().entities.find(e=>e.id===id),id);assert.ok(e,id);await page.locator('#buildings').click();await page.locator('[data-station]').filter({hasText:e.name}).click();await page.waitForFunction(e=>Math.hypot(echoDiagnostics().position.x-e.x,echoDiagnostics().position.z-e.z)<1.6,e,{timeout:30000});await page.waitForTimeout(250);await page.keyboard.press('e');}
 async function district(i){await close();await page.locator('[data-panel="map"]').first().click();await page.locator('[data-travel="'+i+'"]').click();await visit('echo-district');await page.waitForFunction(()=>echoDiagnostics().interior?.service==='echo-district');}
 await district(0);await visit('echo-behavior');await page.getByRole('button',{name:'记下它自己的选择'}).click();await visit('echo-case');await page.getByRole('button',{name:'休息，切换日夜'}).click();await visit('echo-behavior');await page.getByRole('button',{name:'记下它自己的选择'}).click();await visit('echo-behavior');await page.getByRole('button',{name:'邀请它自愿同行'}).click();await close();assert.ok((await page.evaluate(()=>echoDiagnostics().team)).some(m=>m.id==='emolga'));await visit('echo-case');await page.getByRole('button',{name:'休息，切换日夜'}).click();await visit('echo-hub');await page.getByRole('button',{name:'想听懂那声回响'}).click();await close();
 for(const i of [0,1,2,3]){await district(i);await visit('echo-case');await page.getByRole('button',{name:'核对并保存原始证据'}).click();await close();
  if(i===0){for(let n=0;n<3;n++){await visit('echo-case');await page.getByRole('button',{name:'跟进委托 · 轮流消失的泡沫栗鼠'}).click();await close()}}
  if(i===1){await visit('echo-observe');await page.getByRole('button',{name:'和伙伴一起记录'}).click();await visit('echo-hub');await page.getByRole('button',{name:'先支好棚柱，再解开铃绳'}).click();}
  if(i===2){await visit('echo-hub');await page.locator('#job-boat').selectOption('fisher');await page.locator('#job-power').selectOption('cheyu');await page.locator('#job-rescue').selectOption('may');await page.getByRole('button',{name:'确认接力安排'}).click();await close();await page.screenshot({path:__dirname+'/../echo-harbor-review.png'});}
  if(i===3){await visit('echo-hub');await page.getByRole('button',{name:'绕湿地建木廊'}).click();}
 }
 await district(4);await visit('echo-hub');await page.getByRole('button',{name:'把空白的一拍还给对岸'}).click();await page.waitForFunction(()=>echoDiagnostics().echo.milestones.includes('overdrive'));await close();
 await visit('echo-case');await page.getByRole('button',{name:'休息，切换日夜'}).click();assert.equal((await page.evaluate(()=>echoDiagnostics())).echo.period,'night');await visit('echo-character');assert.match(await page.locator('#modal-title').innerText(),/枝乃/);await close();await page.screenshot({path:__dirname+'/../echo-city-review.png'});
 await district(5);await visit('echo-hub');await page.getByRole('button',{name:'先让当事家庭确认'}).click();await visit('echo-hub');await page.getByRole('button',{name:'确认支架承重，请伙伴退下来'}).click();await visit('echo-hub');await close();
 const result=await page.evaluate(()=>echoDiagnostics().echo);assert.equal(result.milestones.length,7);assert.equal(result.ending,'chorus');assert.equal(result.evidence.length,4);
 await page.locator('#save').click();await page.reload();await page.waitForFunction(()=>window.echoDiagnostics?.().ready);assert.deepEqual(await page.evaluate(()=>echoDiagnostics().echo),result);assert.equal(await page.evaluate(()=>echoDiagnostics().interior.service),'echo-district');
 await visit('exit');assert.equal(await page.evaluate(()=>echoDiagnostics().interior),null);
 await page.keyboard.press('j');await page.getByRole('button',{name:'主线、神兽与道路手记'}).click();assert.match(await page.locator('#modal-body').innerText(),/回信接力/);
 assert.deepEqual(errors,[]);console.log('PASS district tasks, evidence, roles, quiet beat, night NPC, ending, save/reload, exit, old journal; no browser or asset errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
