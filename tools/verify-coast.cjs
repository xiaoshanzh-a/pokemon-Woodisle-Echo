const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/coast-harness',r=>r.fulfill({contentType:'text/html',body:'<canvas style="width:1000px;height:700px"></canvas><div id="world-labels"></div><div id="interact-hint"></div><script type="module">import {World} from "/world.js";window.w=new World(document.querySelector("canvas"),()=>{});</script>'}));
  await page.goto('http://127.0.0.1:4188/coast-harness');await page.waitForFunction(()=>window.w);
  const failures=await page.evaluate(async()=>{
   const {waterAt,shoreX}=await import('/coastlines.js'),failures=[];
   for(let area=0;area<6;area++){
    w.load(area);const decks=w.land.children.filter(s=>s.userData.crossing).map(s=>s.userData.crossing);
    if(decks.length!==1)failures.push('Overlapping or absent bridge '+area);
    for(let x=shoreX(area,5)-.5;x<=20;x+=.25)if(!w.canMove(x,5))failures.push('Blocked bridge '+area+':'+x);
    for(let x=6;x<=20;x+=.5)for(const z of [4,5,6])if(waterAt(w,x,z)&&w.canMove(x,z)&&!decks.some(d=>x>=d.left&&x<=d.right&&Math.abs(z-d.z)<d.width/2))failures.push('Unsupported crossing '+area+':'+x+','+z);
    if(w.canMove(19,2))failures.push('Walkable open sea '+area);
    if(w.entities.filter(e=>e.id==='regional-memory'&&e.line).length!==1)failures.push('Missing local story '+area);
   }return failures;
  });assert.deepEqual(failures,[]);assert.deepEqual(errors,[]);
  console.log('PASS six continuous bridges, supported water crossings, blocked open sea and six local stories');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
