import {landscapeProp} from './landscape.js';
import {roomSurface} from './surface-art.js';

import {OctahedronGeometry,MeshBasicMaterial,DodecahedronGeometry,Shape,ShapeGeometry} from './vendor/three.module.js';
export const CAVE_NAMES=['风铃石窟','月露洞穴','潮声岩窟','苔光地道','旧城地下道','星痕裂隙'];
// Paint traversable routes around existing scenery, rather than drawing roads through trees.
function trail(w,start,end,color){const key=(x,z)=>x+','+z,queue=[start],previous=new Map([[key(...start),null]]);let found=false;for(let i=0;i<queue.length;i++){const [x,z]=queue[i];if(x===end[0]&&z===end[1]){found=true;break}for(const [dx,dz] of [[1,0],[0,-1],[-1,0],[0,1]]){const a=x+dx,b=z+dz,k=key(a,b);if(a<-19||a>19||b<-17||b>18||previous.has(k)||!w.canMove(a,b))continue;previous.set(k,[x,z]);queue.push([a,b])}}if(!found)return;let p=end;const path=[];while(p){path.push(p);p=previous.get(key(...p))}w.roadPaths.push(path)}
export function addRoutes(w){
 const anchors=[w.safeWildSpot(-15,9),w.safeWildSpot(-14,-10),w.safeWildSpot(8,-14),w.safeWildSpot(9,13)].filter(Boolean);
 const color=[0xc8b789,0xb7ba83,0xe2d5aa,0xbabf83,0xb5b5a4,0xaaa999][w.area];
 
 for(const e of w.entities.filter(e=>e.portal)){const z=Math.round(e.z+1);trail(w,[0,Math.max(-15,Math.min(16,z))],[Math.round(e.x),z],color);}
 const spot=w.safeWildSpot(-16,-9);if(!spot)return;const [x,z]=spot;
 // Layered stone arch inspired by lost_cave_mossy_rock_entrance.
 const palettes=[[0x8c8b72,0xb6ad8a],[0x687e68,0xa2ad80],[0x8b9d9e,0xc3c3aa],[0x728b68,0xb0b990],[0x889398,0xbac2b4],[0x797f95,0xb1b7c9]],colors=palettes[w.area];
 const opening=new Shape();opening.moveTo(-1.25,0);opening.lineTo(-1.25,1.65);opening.quadraticCurveTo(-1.05,3.3,0,3.45);opening.quadraticCurveTo(1.15,3.05,1.25,1.65);opening.lineTo(1.25,0);opening.closePath();
 const dark=w.mesh(new ShapeGeometry(opening),0x182a2c,x,.08,z-.36);dark.material.dispose();dark.material=new MeshBasicMaterial({color:0x182a2c});
 for(let j=0;j<11;j++){const a=j/10*Math.PI,rx=x+Math.cos(a)*1.9,ry=.75+Math.sin(a)*2.75;
  const stone=w.mesh(new DodecahedronGeometry(.84+(j%3)*.07,0),j%2?colors[0]:colors[1],rx,ry,z-.55);stone.scale.set(1,1.2,.9);stone.rotation.z=a*.3;
  if([0,1,3].includes(w.area)&&j%2===0){const moss=w.mesh(new DodecahedronGeometry(.42,0),0x849953,rx,ry+.63,z-.4);moss.scale.set(1.6,.3,1);}
 }
 for(const dx of [-2.45,2.45]){const rock=w.mesh(new DodecahedronGeometry(.8,0),colors[0],x+dx,.4,z);rock.scale.set(1,.7,1.1);w.billboard('grass',x+dx,z+.4,.75,.65);}
 // The connected road reaches the cave; no detached threshold tiles.
 w.obstacles.push({x,z:z-1.1,w:4,d:1.5});
 w.entity('cave',CAVE_NAMES[w.area],x,z+1.1,{portal:true,service:'cave',labelY:4.2,labelZ:z});
 trail(w,[0,z+2],[x,z+2],color);
 for(const [a,b] of anchors){w.flowers(a+1,b,3);}
 w.entity('trail-sign','岔路路标',0,10,{labelY:1,line:'浅色主路通往城镇设施，蜿蜒的小径连接草地和石窟。洞里左右两条路会在深处会合；穿过裂隙，还藏着一片从外面看不见的花谷。',portrait:'npc-hiker'});
}
function gem(w,x,z,color){const m=w.mesh(new OctahedronGeometry(.65),color,x,1.2,z);m.material.dispose();m.material=new MeshBasicMaterial({color});return m}
export function buildCave(w,portal){
 const garden=portal.service==='grotto';w.renderer.setClearColor(garden?0x9fcbb1:0x253b42);w.scene.fog.density=0;
 w.floor(0,0,19,17,garden?0x91b57f:0x596669);roomSurface(w);
 w.box(0,-8,19,.4,3,garden?0x7a9e77:0x394b53);w.box(-9.4,0,.3,16,2,0x52675e);w.box(9.4,0,.3,16,2,0x52675e);
 if(!garden){
  // Low mineral beds provide clues, with a clear central path between them.
  for(const [x,z] of [[-2.4,-3],[2.4,-3],[0,0]]){
   landscapeProp(w,'cerulean_cave_rock_pile',x,z,4.4,2.6);landscapeProp(w,'cerulean_cave_crystal',x+.15,z-.25,3.3,2.6);
   w.obstacles.push({x,z,w:1.8,d:1.3,kind:'mineral-bed'});
  }
  w.billboard('decor-sign',1.6,1.6,1.5,1.8);
  w.entity('echo-vein','回响矿脉 · 勘探记录',0,2,{labelY:1.4,line:'记录一：矿晶会把声音送向有空隙的岩壁。左侧传来皮皮的歌声，右侧的梦之石保存着旧日记忆。调查两边后，沿中央小径向北，暖风会带你找到通往花谷的裂隙。'});
  // Traversal uses the continuous cave floor.
  for(const [x,z] of [[-8,-5],[8,1],[-8,4],[8,-5]]){landscapeProp(w,'cerulean_cave_crystal',x,z,2,2);w.obstacles.push({x,z,w:1.3,d:1,kind:'crystal'});}
  
  const supplies=w.billboard('furnishing-cinnabar_lab_sample_tube_rack',7,4,1.8,1.5);supplies.userData.occluder=true;w.obstacles.push({x:7,z:3.8,w:1.7,d:1.3,kind:'supplies'});
  w.billboard('clefairy-front',-5,-.5,1.7,1.7);w.entity('lost-pokemon','迷路的皮皮',-5,.2,{labelY:2.2});
  const caveStaff=['npc-hiker','npc-brock','npc-lt_surge','npc-bruno','npc-blaine','npc-koga'][w.area];w.billboard(caveStaff,5,0,1.7,2.85);w.entity('cave-hiker','勘探员的营地',5,1,{labelY:3,line:'左边传来皮皮的歌声，右边石壁刻着旧时的星图。两条路都能绕到北面。别被洞口的黑暗骗了，裂隙后面有阳光。',portrait:caveStaff});
  gem(w,5,-4,0xc99bed);w.entity('dream-memory','会发光的梦之石',5,-3.4,{labelY:2.1});
  w.entity('grotto','裂隙另一侧 · 隐秘花谷',0,-6,{labelY:1.2});
  w.entity('exit','离开 · '+portal.name,0,7,{labelY:.6});
  w.roomNote='先读矿脉边的勘探记录，再循歌声与暖风寻找皮皮、梦之石和北面的花谷。';
 }else{
  w.floor(0,0,7,6,0x71bfc5,.028);w.obstacles.push({x:0,z:0,w:7,d:6});
  for(const x of [-6,6])for(const z of [-5,0,5])w.flowers(x,z,6);
  // Meadow floor continues around the pool without overlapping strips.
  w.billboard('lapras-front',0,-1,2.8,2.8);w.entity('hidden-spring','拉普拉斯守护的泉水',0,4,{labelY:1.7});
  const gardenStaff=['npc-woman_1','npc-agatha','npc-misty','npc-lorelei','npc-sabrina','npc-lance'][w.area];w.billboard(gardenStaff,-5,-4,1.7,2.85);w.entity('garden-keeper','花谷守望人',-5,-3,{labelY:3,line:'梦之石不是噩梦的源头。它记住了旅人不肯放弃的愿望。找齐三处不同地区的记忆，就会有一位梦中的伙伴回应你。',portrait:gardenStaff});
  if([1,2,5].includes(w.area)){gem(w,5,-4,0xffdc88);w.entity('legendary-shrine','三圣鸟的誓约石',5,-3,{labelY:2.2})}
  w.entity('cave-return','返回洞窟',0,7,{labelY:.6});w.roomNote='山洞尽头是一片温暖的花谷。沿环湖步道散步，泉水会回应疲惫的伙伴。';
 }
 w.pos.set(0,0,5.5);w.fpos.set(-.7,0,6.3);w.playerDir=1;w.look.set(0,0,0);w.trail=[w.fpos.clone(),w.pos.clone()];
}
