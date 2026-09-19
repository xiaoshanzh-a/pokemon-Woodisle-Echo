const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const p=await b.newPage({viewport:{width:1200,height:800}});
 await p.route('**/footprints',r=>r.fulfill({contentType:'text/html',body:'<canvas style="width:1200px;height:800px"></canvas><div id="world-labels"></div><div id="interact-hint"></div><script type="module">import {prepareSources} from "/source-sprites.js";import {World} from "/world.js";await prepareSources();window.w=new World(document.querySelector("canvas"),()=>{});</script>'}));
 await p.goto('http://127.0.0.1:4188/footprints');await p.waitForFunction(()=>window.w);
 for(let area=0;area<6;area++)assert.deepEqual(await p.evaluate(area=>{w.load(area);const errors=[];
  for(const s of w.land.children.filter(s=>s.userData.building)){
   const f=s.userData.footprint;if(!f||f.d<4){errors.push('shallow '+s.userData.asset);continue;}
   for(let z=f.z-f.d/2+.1;z<f.z+f.d/2;z+=.25)for(let x=f.x-f.w/2+.1;x<f.x+f.w/2;x+=.5)if(w.canMove(x,z))errors.push('walkable building');
  }
  if(area===4&&w.land.children.some(s=>s.userData.asset==='decor-museum'))errors.push('old museum remains');
  return errors;
 },area),[],`area ${area}`);
 await p.evaluate(()=>{w.load(4);const f=w.land.children.find(s=>s.userData.asset==='arcade').userData.footprint;w.pos.set(f.x,0,f.z-f.d/2-.6);w.keys.add('s');w.keys.add('shift');});
 await p.waitForTimeout(1600);assert.ok(await p.evaluate(()=>{w.keys.clear();const f=w.land.children.find(s=>s.userData.asset==='arcade').userData.footprint;return w.pos.z<f.z-f.d/2&&w.canMove(w.pos.x,w.pos.z)}),'sprinting through arcade rear');
 console.log('PASS solid footprints of 13 buildings, arcade rear sprint blocked, redundant museum removed');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
