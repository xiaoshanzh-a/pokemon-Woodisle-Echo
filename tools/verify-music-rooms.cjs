const {chromium}=require('C:/Users/Sheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1060}});
 await page.addInitScript(()=>{const Original=window.Audio;window.testAudio=[];window.Audio=function(...args){const a=new Original(...args);window.testAudio.push(a);return a}});
 await page.goto('http://127.0.0.1:4188');await page.waitForFunction(()=>window.echoDiagnostics?.().ready);
 await page.locator('#save').click();
 await page.addInitScript(()=>{const s=JSON.parse(localStorage.getItem('pokemon-echoes-v1'));if(s){s.room={name:'宝可梦中心',service:'heal',returnPoint:{area:0,x:7.2,z:.3}};localStorage.setItem('pokemon-echoes-v1',JSON.stringify(s))}});
 await page.reload();await page.waitForFunction(()=>window.echoDiagnostics?.().interior);
 await page.locator('#sound').click();
 const playing=async file=>{await page.waitForFunction(file=>window.testAudio.some(a=>a.src.endsWith(file)&&!a.paused&&a.currentTime>0),file);assert.equal(await page.evaluate(()=>window.testAudio.filter(a=>!a.paused).length),1)};
 await playing('pokemon-center.mp3');await page.waitForTimeout(700);await page.screenshot({path:__dirname+'/../interior-center-fixed.png',fullPage:true});
 await page.locator('#music-select').selectOption('forest');await playing('viridian-forest.mp3');
 for(const [area,file] of [[2,'slateport-city.mp3'],[0,'pallet-town.mp3'],[1,'viridian-forest.mp3'],[0,'pallet-town.mp3']]){await page.locator('[data-panel="map"]').click();await page.locator(`[data-travel="${area}"]`).click();await playing(file);assert.equal(await page.locator('#music-select').inputValue(),'auto')}
 await page.locator('#sound').click();assert.equal(await page.evaluate(()=>window.testAudio.filter(a=>!a.paused).length),0);
 console.log('PASS actual MP3 playback, manual override, repeated scene changes, single audio and mute');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
