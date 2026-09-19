const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.route('**/landscape-harness',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0}canvas{width:1200px;height:800px}#world-labels{display:none}</style><canvas></canvas><div id="world-labels"></div><div id="interact-hint"></div><script type="module">import {World} from "/world.js";window.w=new World(document.querySelector("canvas"),()=>{});</script>'}));
 await page.goto('http://127.0.0.1:4188/landscape-harness');await page.waitForFunction(()=>window.w);
 for(let i=0;i<6;i++){
  const result=await page.evaluate(async i=>{const {CONNECTIONS}=await import('/geography.js');w.load(CONNECTIONS[i].towns[0],{name:'review',service:'route-'+i});const fail=[];
   if(i<4){const deck=w.land.children.find(o=>o.userData.routeCrossing)?.userData.routeCrossing;if(!deck)fail.push('missing bridge');for(let x=-20;x<=-12;x+=.25){if(!w.canMove(x,5))fail.push('bridge blocked '+x);for(const z of [1,9])if(x<-15&&w.canMove(x,z))fail.push('water walkable '+x+','+z)}if(deck.width!==3.2)fail.push('town bridge width mismatch');}
   if(i===2&&w.canMove(0,-16))fail.push('northern sea walkable');
   const props=w.land.children.filter(s=>s.userData.landscape);if(props.length<5)fail.push('empty landscape');
   for(const s of props.filter(s=>s.userData.occluder))for(const e of w.entities.filter(e=>e.actor))if(Math.abs(s.position.x-e.x)<1.7&&s.position.z>e.z&&s.position.z-e.z<3)fail.push('NPC hidden');
   w.pos.set(0,0,10);w.fpos.set(-1,0,11);w.look.set(0,0,0);return fail;
  },i);assert.deepEqual(result,[],`route ${i}`);await page.waitForTimeout(1200);await page.screenshot({path:__dirname+'/../landscape-route-'+i+'.png'});
 }
 assert.deepEqual(errors,[]);console.log('PASS four matching coastal bridges, blocked water, six decorated routes, NPC sightlines and asset requests');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
