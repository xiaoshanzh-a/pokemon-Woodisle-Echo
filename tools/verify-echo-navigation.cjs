const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4188/');await page.waitForFunction(()=>window.echoDiagnostics?.().ready);await page.locator('#save').click();
 // Simulate a real pre-upgrade save without modifying the user's browser profile.
 await page.addInitScript(()=>{if(sessionStorage.getItem('legacy-fixture'))return;const k='pokemon-echoes-v1',s=JSON.parse(localStorage.getItem(k));if(!s)return;s.stage=6;s.starter=true;delete s.echo;localStorage.setItem(k,JSON.stringify(s));sessionStorage.setItem('legacy-fixture','1')});
 await page.reload();await page.waitForFunction(()=>window.echoDiagnostics?.().stage===6);
 assert.equal(await page.evaluate(()=>echoDiagnostics().echo.milestones.length),0);
 await page.keyboard.press('j');await page.locator('#echo-track').click();await page.waitForFunction(()=>{const d=echoDiagnostics(),e=d.entities.find(e=>e.id==='echo-district');return Math.hypot(e.x-d.position.x,e.z-d.position.z)<1.6});await page.keyboard.press('e');await page.waitForFunction(()=>echoDiagnostics().interior?.service==='echo-district');
 await page.keyboard.press('j');await page.locator('#echo-track').click();await page.waitForFunction(()=>{const d=echoDiagnostics(),e=d.entities.find(e=>e.id==='echo-hub');return Math.hypot(e.x-d.position.x,e.z-d.position.z)<1.6});await page.keyboard.press('e');await page.getByRole('button',{name:'想看看岛屿之外'}).click();await page.locator('#close').click();await page.keyboard.press('j');assert.match(await page.locator('#modal-body').innerText(),/下一步 · 微光森林/);
 assert.deepEqual(errors,[]);console.log('PASS pre-upgrade save retains stage and unlocks new story; journal tracks entrance and inside objective; next region updates');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
