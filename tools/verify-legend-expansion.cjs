const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 const source=fs.readFileSync(__dirname+'/../game.js','utf8');
 await p.route('**/game.js*',r=>r.fulfill({contentType:'text/javascript',body:source+'\nwindow.qa={get state(){return state},get world(){return world},get battle(){return battle},fresh,validate,sync,save,interact,research:()=>research(legendAPI()),closeModal,startBattle,battleAction,endBattle,travel,journal,dex};'}));
 await p.goto('http://127.0.0.1:4188/');await p.waitForFunction(()=>window.echoDiagnostics?.().ready);
 await p.evaluate(()=>{qa.state.stage=6;qa.sync();qa.research()});await p.getByRole('button',{name:'接下生态调查'}).click();assert.equal(await p.evaluate(()=>qa.state.masterBalls),2);
 // Each round requires three distinct target regions; early and duplicate claims fail.
 for(let round=0;round<5;round++){
  await p.evaluate(()=>{qa.closeModal();qa.research()});assert.equal(await p.getByRole('button',{name:'提交记录 · 大师球 +2'}).count(),0);await p.evaluate(()=>qa.closeModal());
  for(const area of [round%6,(round+2)%6,(round+4)%6]){
   await p.evaluate(area=>{qa.travel(area);const e=qa.world.entities.find(e=>e.id==='legend-survey');if(!e)throw Error('no survey '+area);qa.world.pos.set(e.x,0,e.z);qa.world.navigationEntity=e;qa.interact()},area);await p.evaluate(()=>qa.closeModal());
   const before=await p.evaluate(()=>qa.state.legend.sites.length);await p.evaluate(()=>qa.interact());assert.equal(await p.evaluate(()=>qa.state.legend.sites.length),before);await p.evaluate(()=>qa.closeModal());
  }
  await p.evaluate(()=>qa.research());await p.getByRole('button',{name:'提交记录 · 大师球 +2'}).click();assert.equal(await p.evaluate(()=>qa.state.masterBalls),4+round*2);assert.equal(await p.getByRole('button',{name:'提交记录 · 大师球 +2'}).count(),0);await p.evaluate(()=>qa.closeModal());
 }
 await p.evaluate(()=>qa.journal());assert.equal(await p.getByRole('button',{name:'远方的回应 · 神兽调查 / 大师球'}).count(),1);await p.evaluate(()=>qa.closeModal());
 const legends=await p.evaluate(async()=> (await import('/legend-data.js')).LEGENDS);
 assert.ok(!legends.some(q=>q.id==='mewtwo'),'final guardian must never be a roaming encounter');assert.ok(legends.some(q=>q.id==='jirachi'));
 for(const q of legends){
  const result=await p.evaluate(async q=>{const w=qa.world;const {WILDLANDS}=await import('/wildlands.js');const area=WILDLANDS[q.sanctuary].towns[0];qa.state.area=area;w.storyStage=6;w.load(area,{name:WILDLANDS[q.sanctuary].name,service:'wildland-'+q.sanctuary});qa.sync();const e=w.entities.find(e=>e.legend===q.id);if(!e)return {missing:true};const first=[e.x,e.z];w.load(area,{name:WILDLANDS[q.sanctuary].name,service:'wildland-'+q.sanctuary});qa.sync();const e2=w.entities.find(e=>e.legend===q.id);w.pos.set(e2.x,0,e2.z+1);w.navigationEntity=e2;qa.interact();return {first,again:[e2.x,e2.z],walkable:w.canMove(e2.x,e2.z+1)}},q);
  assert.ok(!result.missing,q.id+' present');assert.deepEqual(result.first,result.again,q.id+' stable seeded clearing');assert.ok(result.walkable,q.id+' approachable');
  await p.getByRole('button',{name:'邀请它对战'}).click();await p.waitForFunction(()=>!document.querySelector('[data-battle="attack"]').disabled);if(q.id==='suicune'){await p.locator('#battle').screenshot({path:__dirname+'/../legend-survey-battle.png'});await p.locator('[data-battle="more"]').click();await p.locator('[data-battle="run"]').click();assert.ok(await p.evaluate(()=>qa.world.entities.some(e=>e.legend==='suicune')));await p.evaluate(()=>qa.interact());await p.getByRole('button',{name:'邀请它对战'}).click();await p.waitForFunction(()=>!document.querySelector('[data-battle="attack"]').disabled);}
  await p.locator('[data-battle="more"]').click();await p.locator('[data-battle="master"]').click();await p.waitForFunction(()=>!qa.battle);assert.ok(await p.evaluate(id=>qa.state.caught.includes(id),q.id));assert.equal(await p.evaluate(id=>qa.world.entities.filter(e=>e.legend===id).length,q.id),0);
  console.log('PASS encounter, stable placement, approach, master capture and removal',q.id);
 }
 await p.evaluate(()=>{qa.travel(0);const e=qa.world.entities.find(e=>e.id==='npc-boy');qa.world.pos.set(e.x,0,e.z+1);qa.world.navigationEntity=e;qa.interact()});await p.getByRole('button',{name:'接受切磋'}).click();await p.waitForFunction(()=>!document.querySelector('[data-battle="attack"]').disabled);assert.equal(await p.evaluate(()=>qa.battle.enemy.id),'rattata');assert.ok(await p.locator('[data-battle="catch"]').isDisabled());await p.locator('[data-battle="more"]').click();assert.ok(await p.locator('[data-battle="master"]').isDisabled());await p.evaluate(()=>{qa.endBattle(true);qa.save()});
 const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('pokemon-echoes-v1')));assert.equal(saved.masterBalls,3);assert.equal(saved.legend.round,5);assert.equal(saved.legend.met.length,9);assert.ok(saved.legend.wins.includes('npc-boy'));
 await p.reload();await p.waitForFunction(()=>window.echoDiagnostics?.().ready);assert.equal(await p.evaluate(()=>qa.state.masterBalls),3);assert.equal(await p.evaluate(()=>qa.state.legend.met.length),9);
 await p.evaluate(()=>qa.dex());assert.equal(await p.locator('.dex-tile').count(),64);assert.ok((await p.locator('#modal-body').innerText()).includes('苍响'));
 assert.deepEqual(errors,[]);console.log('PASS five repeatable rewards, nine captures, trainer ownership, dex, save migration/persistence and all asset requests');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
