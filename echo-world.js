import {roomSurface} from './surface-art.js';
import {CanvasTexture,MeshBasicMaterial,SRGBColorSpace} from './vendor/three.module.js';
import {DISTRICTS,CHARACTERS,BEHAVIORS} from './echo-data.js';
export const isDistrict=room=>room?.service==='echo-district';
function paving(w,area){
 const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d'),colors=['#c8c6b9','#a4b99b','#a3bcc4','#bdc49b','#b2b5c6','#a3b6bb'];g.fillStyle=colors[area];g.fillRect(0,0,512,512);
 for(let y=0;y<512;y+=32)for(let x=-16;x<512;x+=48){g.fillStyle=(x+y)%3?'#ffffff12':'#21364c0a';g.fillRect(x+(y%64?24:0)+1,y+1,46,30);}
 if(w.echoState?.period==='night'){g.fillStyle='#24375b38';g.fillRect(0,0,512,512);}
 const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;const m=w.floor(0,0,20,18,0xffffff,0);m.material.dispose();m.material=new MeshBasicMaterial({map:t,toneMapped:false});
}
function facade(w,x,z,width,color){
 if([0,1,2,4].includes(w.area)){const sprite=w.billboard(w.area===4?'architecture-purple-house':'architecture-green-house',x,z+1.3,width*1.25,6);sprite.userData.occluder=true;w.obstacles.push({x,z,w:width,d:2.5});w.entity('echo-building','进入 · '+(w.area===4?'铃声工坊':w.area===2?'码头值班室':w.area===1?'护林休息屋':'风铃居民屋')+(x<0?' · 西屋':x>0?' · 东屋':''),x,z+2,{labelY:1.2,service:'home',districtDoor:true});return;}

 w.box(x,z,width,2.5,3.8,color);w.box(x,z,width+.5,2.9,.35,0x536276,3.8);w.box(x,z+1.28,width,.18,.35,0xe9ddc9,2.5);
 for(let dx=-width/2+.7;dx<width/2;dx+=1.4){w.box(x+dx,z+1.3,.8,.08,1.3,0xf9d9a0,1);w.box(x+dx,z+1.38,.08,.1,1.3,0x68828a,1);}
 w.obstacles.push({x,z,w:width,d:2.5});
}
function lamp(w,x,z,color){w.box(x,z,.12,.12,2.7,0x4c6270);w.box(x,z,.45,.45,.45,color,2.7);}
function planter(w,x,z,color){w.box(x,z,1.2,.75,.38,color);w.billboard('flowers',x,z,1.25,1);}
export function buildDistrict(w){
 const i=w.area,e=w.echoState||{},d=DISTRICTS[i],done=k=>e.milestones?.includes(k);w.renderer.setClearColor(e.period==='night'?0x657c94:d.color);w.scene.fog.density=0;paving(w,i);
 // Front-facing facades and open courtyards: silhouettes behind the play space.
 if([0,4].includes(i)){facade(w,-5,-7,6,i===4?0xc7cbd5:0xdacdb9);facade(w,5,-7,6,i===4?0xb38481:0xc0ccb5);w.box(0,-7,2,1.8,6.5,0xc6d0d0);w.box(0,-6,1.2,.1,1.2,0xf7e8b3,4.5);for(let x=-7;x<=7;x+=3.5)lamp(w,x,6,i===4&&w.storyStage===5&&!done('overdrive')?0xf295ad:0xffe6a9);}
 else if(i===1){for(const x of [-7,7])w.tree(x,-6,1.5);w.box(0,0,3.8,3.2,.3,0x485e53);w.obstacles.push({x:0,z:0,w:3.8,d:3.2});for(const x of [-3,3]){w.floor(x,0,1.4,6,0xb6a179,.08);w.fence(x-.5,-2.8,1);}facade(w,0,-7,6,done('shelter')?0xb6bc96:0x858b70);if(done('shelter'))w.billboard('vulpix-front',6,-5,1.8,1.8);}
 else if(i===2){w.water(0,0,2.8,16);for(const z of [-6.5,6.5])w.obstacles.push({x:0,z,w:2.8,d:3});w.obstacles.push({x:0,z:0,w:2.8,d:6});for(const z of [-4.5,4.5]){w.floor(0,z,3.6,2,0xd4c9ae,.09);for(let x=-1.6;x<=1.6;x+=.4)w.box(x,z,.05,2,.04,0xb09c79,.10);}facade(w,-5,-7,5,0xc3cdd0);facade(w,5,-7,5,0xbb8d80);const mon=w.billboard('lapras-front',0,done('relay')?-.8:-6,2.8,2.8);mon.userData.echoMotion='float';}
 else if(i===3){w.water(-.4,0,3.5,3.4);w.obstacles.push({x:-.4,z:0,w:3.5,d:3.4});w.grass(-6,-6,4,2);w.grass(6,-6,4,2);w.fence(-2,-6,4);if(!done('migration')){w.box(0,-5.8,2,.2,.7,0xd4ab6f);}else{w.billboard('quagsire-front',0,-6,2,2);w.floor(0,-5,2,2,0xd8ce9d,.04);}for(const x of [-7,7])lamp(w,x,6,0xcbe6ae);}
 else{w.box(0,0,3,3,.4,0x708895);w.obstacles.push({x:0,z:0,w:3,d:3});for(const x of [-7,7])for(const z of [-6,0,6]){w.box(x,z,.8,.8,2.6,0x718891);w.box(x,z,1.1,1.1,.2,0xd5d8c6,2.6);}for(const [x,z] of [[-3,-3],[3,-3],[-3,3],[3,3]])w.floor(x,z,.8,.8,done('final')?0xb5e5bd:0x86c1d3,.06);}
 // Both sides are linked above and below any central obstacle.
 roomSurface(w,20,18);
 if([0,2,4].includes(i)){for(const x of [-7.5,7.5])planter(w,x,-3.8,i===2?0x9f7967:0xa8b29c);w.box(-7.5,0,1.5,.65,.45,0xae8b66);w.box(-7.5,-.28,1.5,.12,.55,0xc1a17e,.35);}
 // Small, persistent consequences occupy the rear of the scene, outside conversation space.
 if(i===0&&e.cases?.mice===3){w.floor(-6,-5,1.3,.7,0xd8a270,.08);w.billboard('minccino-front',-7,-4.8,1.4,1.4);w.billboard('minccino-front',-5.5,-5,1.3,1.3);}
 if(i===3&&done('migration')){
  if(e.choices?.migration==='detour'){for(const x of [-2.8,2.8]){w.floor(x,0,.9,6,0xcfb583,.08);for(let z=-2.8;z<3;z+=.45)w.floor(x,z,.9,.025,0xb39365,.085);}}
  else if(e.choices?.migration==='delay'){w.flowers(-3,-5,3);w.flowers(3,-5,3);}
  else{w.box(-2.8,-5,.1,.1,1,0xcdb588);w.box(-2.8,-5,.8,.1,.4,0x91b9a0,.8);}
 }
 if(i===4&&e.cases?.bell===3){for(const x of [-1,0,1]){w.box(x,-6,.025,.025,1.4,0xa8b7ba,2);w.box(x,-6,.17,.17,.3,0xe4ca85,1.8);}}
 const memory=w.entity('echo-observe','倾听 · '+['旧信箱','棚柱铃绳','浮标记录','迁徙脚印','旧铃谱','四响记录'][i],5,-3.6,{labelY:1.4});
 const actorId=['cheyu','lin','fisher','aran',e.period==='night'?'zhino':'qinlan','gubo'][i],character=CHARACTERS[actorId];
 const s=w.billboard(character.sprite,-5,2.2,1.7,2.85);const person=w.entity('echo-character',character.name,-5,2.2,{labelY:3.2,character:actorId,portrait:character.sprite,fixedActor:true});person.actor=s;
 const mon=w.billboard(character.partner+'-front',-6.5,3.8,1.5,1.5);mon.userData.echoMotion='nod';
 w.entity('echo-hub',i===5?'议席与承重装置':'地区事务台',0,-4.5,{labelY:1.6});
 w.entity('echo-case','街区委托与旧证据',-5,-3.6,{labelY:1.4});
 const behavior=BEHAVIORS.find(b=>b[2]===i);if(behavior){const m=w.billboard(behavior[0]+'-front',5,3,1.6,1.6);m.userData.echoMotion='nod';w.entity('echo-behavior','观察 · '+behavior[1],5,3,{labelY:2,behavior:behavior[0]});}
 else w.entity('echo-behavior','伙伴记忆触点',5,3,{labelY:1.5});
 if(i===4){const m=w.billboard('ampharos-front',7,0,1.7,1.7);m.userData.echoMotion='nod';w.entity('echo-behavior-extra','观察 · 电龙',7,0,{labelY:2,behavior:'ampharos'});}
 w.entity('exit','返回 · 主区域',i===2?-5:0,7,{labelY:.8});w.roomNote=d.subtitle+' · 按 E 调查，南口返回。';w.pos.set(i===2?-5:0,0,5.6);w.fpos.set(i===2?-5.7:-.7,0,6.4);w.look.set(0,0,0);w.trail=[w.fpos.clone(),w.pos.clone()];
}
export function decorateEchoWorld(w){

 const e=w.echoState;if(!e)return;
 const route=/^route-([0-5])$/.exec(w.interior?.service||'');if(route&&e.replies[route[1]]){w.box(-3,11,2.5,.7,.55,0xb5a077);w.billboard('eevee-front',-3,10.7,1.5,1.5);w.entity('echo-reply-result','已寄出的回信',-3,11,{line:'你留下的记录已经变成沿路的休息点。今天，有另一位旅人带着伙伴坐在这里。',labelY:1.8});}
 if(w.interior)return;
 if(w.area===1&&e.milestones.includes('shelter')){const p=w.entities.find(x=>x.id==='story-place');if(p)w.billboard('vulpix-front',p.x+2,p.z,1.4,1.4);}
 if(w.area===2&&e.milestones.includes('relay'))for(const z of [-2,1,8])lamp(w,15,z,0xa6f1d7);
 if(w.area===4&&e.milestones.includes('overdrive'))w.flowers(-5,8,5);
}
