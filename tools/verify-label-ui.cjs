const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const targets=['prof','warden','fish','safari-help','arcade','guardian'];
const expected=['大木博士','守望者','潮汐钓场','保育员','星灯娱乐城','回响之心'];

async function visibleLabels(page){
 return page.evaluate(()=>[...document.querySelectorAll('.world-label:not([hidden])')].map(el=>{const r=el.getBoundingClientRect();return{text:el.textContent,quest:el.classList.contains('quest'),left:r.left,right:r.right,top:r.top,bottom:r.bottom,opacity:+getComputedStyle(el).opacity}}).filter(x=>x.opacity>.9));
}
function assertNoOverlap(labels,scene){
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
  const a=labels[i],b=labels[j],overlap=a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
  assert.equal(overlap,false,`${scene}: ${a.text} overlaps ${b.text}`);
 }
}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const errors=[],bootstrap=await browser.newPage({viewport:{width:1440,height:1060}});await bootstrap.goto('http://127.0.0.1:4188');await bootstrap.waitForFunction(()=>window.echoDiagnostics?.().ready);await bootstrap.locator('#save').click();
 const key=await bootstrap.evaluate(()=>echoDiagnostics().saveKey),base=await bootstrap.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);await bootstrap.close();
 async function load(stage,area){const seed=structuredClone(base);seed.stage=stage;seed.area=area;seed.room=null;if(stage===6)seed.legend={accepted:true,seed:1,round:0,sites:[],met:[],wins:[]};const context=await browser.newContext({viewport:{width:1440,height:1060}});await context.addInitScript(([key,value])=>localStorage.setItem(key,JSON.stringify(value)),[key,seed]);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.goto('http://127.0.0.1:4188');await page.waitForFunction(()=>window.echoDiagnostics?.().ready);await page.waitForTimeout(250);return{page,context}}
 for(let stage=0;stage<6;stage++){
  const {page,context}=await load(stage,stage);console.log(`checking stage ${stage}`);await page.locator('#track').click();
  await page.waitForFunction(target=>{const d=echoDiagnostics(),alias=target==='safari-help'?'safari-help':target,e=d.entities.find(e=>e.id===alias);return e&&Math.hypot(d.position.x-e.x,d.position.z-e.z)<3.3},targets[stage],{timeout:22000});
  await page.waitForTimeout(220);const labels=await visibleLabels(page),quests=labels.filter(x=>x.quest);
  assert.equal(quests.length,1,`stage ${stage} should show exactly one active quest marker`);assert.match(quests[0].text,new RegExp(expected[stage]));assert.equal(labels.length,1,`stage ${stage} should hide ordinary map labels`);assertNoOverlap(labels,`stage ${stage}`);
  await context.close();
 }
 const {page,context}=await load(6,0);let labels=await visibleLabels(page);assert.equal(labels.filter(x=>x.quest).length,0,'completed story must clear every quest exclamation');assertNoOverlap(labels,'completed story');
 for(let area=0;area<6;area++){
  if(area){await page.locator('[data-panel="map"]').click();await page.locator(`[data-travel="${area}"]`).click();await page.waitForFunction(area=>echoDiagnostics().area===area,area);await page.waitForTimeout(180)}
  labels=await visibleLabels(page);assert.equal(labels.length,0,`completed story area ${area} should have no floating labels`);assertNoOverlap(labels,`area ${area}`);
 }
 await context.close();assert.deepEqual(errors,[]);console.log('PASS interaction-only naming, single active quest marker and completed-task cleanup');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
