const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const assert=require('node:assert/strict'),fs=require('fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const p=await b.newPage({viewport:{width:1440,height:1060}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(__dirname+'/../game.js','utf8')+'\nwindow.qa={get state(){return state},get world(){return world},travel,sync,save,interact,closeModal};'}));
 await p.goto('http://127.0.0.1:4188');await p.waitForFunction(()=>window.echoDiagnostics?.().ready);
 await p.evaluate(()=>{qa.state.stage=6;qa.state.legend.accepted=true;qa.state.legend.seed=123;qa.sync()});
 const maps=await p.evaluate(async()=> (await import('/wildlands.js')).WILDLANDS);
 for(let i=0;i<3;i++)for(const from of maps[i].towns){
  await p.evaluate(({i,from})=>{qa.travel(from);const gate=qa.world.entities.find(e=>e.id==='wildland-gate-'+i);if(!gate)throw Error('missing gate '+i+' town '+from);qa.world.goTo(gate)},{i,from});
  await p.waitForFunction(i=>{const w=qa.world,e=w.entities.find(e=>e.id==='wildland-gate-'+i);return Math.hypot(w.pos.x-e.x,w.pos.z-e.z)<1.5},i,{timeout:25000});await p.keyboard.press('e');await p.waitForFunction(i=>qa.world.interior?.service==='wildland-'+i,i);
  assert.equal(await p.evaluate(()=>qa.world.entities.filter(e=>e.legend).length),3);
  const issues=await p.evaluate(()=>{const w=qa.world,out=[];for(const e of w.entities.filter(e=>e.legend)){if(!w.canMove(e.x,e.z+1))out.push('blocked legend');for(const other of w.entities.filter(v=>v.legend&&v!==e))if(Math.hypot(e.x-other.x,e.z-other.z)<8)out.push('crowded legend');for(const o of w.obstacles)if(Math.abs(e.x-o.x)<o.w/2+2&&Math.abs(e.z-o.z)<o.d/2+2)out.push('obstacle near legend');}for(const o of w.obstacles.filter(o=>o.kind==='wetland-water'))if(w.canMove(o.x,o.z))out.push('walkable water');return out});assert.deepEqual(issues,[]);
  await p.evaluate(()=>qa.save());await p.reload();await p.waitForFunction(i=>window.qa?.world?.interior?.service==='wildland-'+i,i);assert.equal(await p.evaluate(()=>qa.world.entities.filter(e=>e.legend).length),3);
  if(from===maps[i].towns[0]){await p.evaluate(()=>{qa.world.pos.set(0,0,8);qa.world.look.set(0,0,0)});await p.waitForTimeout(500);await p.locator('#viewport').screenshot({path:__dirname+'/../wildland-'+i+'.png'});}
  const to=maps[i].towns.find(n=>n!==from);await p.evaluate(to=>{const e=qa.world.entities.find(e=>e.wildlandTown===to);qa.world.goTo(e)},to);
  await p.waitForFunction(to=>{const w=qa.world,e=w.entities.find(e=>e.wildlandTown===to);return Math.hypot(w.pos.x-e.x,w.pos.z-e.z)<1.5},to,{timeout:25000});await p.keyboard.press('e');await p.waitForFunction(to=>!qa.world.interior&&qa.state.area===to,to);
  const distance=await p.evaluate(i=>{const w=qa.world,e=w.entities.find(e=>e.id==='wildland-gate-'+i);return Math.hypot(w.pos.x-e.x,w.pos.z-e.z)},i);assert.ok(distance<.1);console.log('PASS walk-in, 3 spacious encounters, blocked water, save/reload, walk-through and matching arrival',i,from,'->',to);
 }
 assert.deepEqual(errors,[]);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
