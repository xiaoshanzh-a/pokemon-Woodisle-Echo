import {buildWildland,wildlandIndex} from './wildlands.js'; import {animateLegends} from './legend-world.js'; import {characterScale} from './character-scale.js';
import {BUILDING_ART} from './building-art.js';
import {RESIDENT_SPRITES,addHabitat,animateWild} from './living-world.js';
import {enrichLandscape} from './landscape.js';
import {regionalGround,addRegionalLandmarks,ROAD_PALETTES} from './regional-art.js';
import {buildCoast,waterAt,onWalkway} from './coastlines.js';
import {layoutCharacters} from './character-layout.js';
import {mainConnection,DIRS,CONNECTIONS,townEndpoint,placeAtEntrance} from './geography.js';
import {paintRoads} from './roads.js';
import {addRouteGates,buildRoute,routeIndex} from './side-routes.js';
import {addStoryPlaces} from './story.js'; import {addRoutes} from './exploration.js'; import * as T from './vendor/three.module.js';
import {AREAS,MON,QUESTS} from './data.js';
import {buildInterior} from './interiors.js?v=routes-8';
import {buildDistrict,isDistrict,decorateEchoWorld} from './echo-world.js';
import {sourceUrl} from './source-sprites.js';
const texCache=new Map();
function texture(name){if(texCache.has(name))return texCache.get(name);const t=new T.TextureLoader().load(sourceUrl(name));t.colorSpace=T.SRGBColorSpace;t.magFilter=T.NearestFilter;t.minFilter=T.LinearFilter;texCache.set(name,t);return t;}
let seed=7;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function groundTexture(color){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle=color;g.fillRect(0,0,512,512);for(let i=0;i<12000;i++){const v=Math.random();g.fillStyle=v<.45?'#e3edb017':v<.75?'#28553913':'#ebecae21';g.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*4,1+Math.random()*3)}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(5,5);t.colorSpace=T.SRGBColorSpace;return t;}
export class World {
 constructor(canvas,onInteract){this.canvas=canvas;this.onInteract=onInteract;this.keys=new Set();this.echoState=null;this.area=0;this.pos=new T.Vector3(0,0,7);this.fpos=new T.Vector3(-1,0,8.2);this.look=new T.Vector3(0,0,1);this.target=null;this.obstacles=[];this.entities=[];this.labels=[];this.wild=[];this.time=0;this.zoom=1.12;this.paused=false;this.playerDir=0;this.pointerDown=null;
 this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.setClearColor(0x9dbb91);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.02;
 this.scene=new T.Scene();this.scene.fog=new T.FogExp2(0xbad0a0,.006);this.camera=new T.OrthographicCamera(-20,20,15,-15,.1,180);this.camera.position.set(0,32,38);this.camera.lookAt(0,0,0);
 this.scene.add(new T.HemisphereLight(0xfff8de,0x627b57,1.35));const sun=new T.DirectionalLight(0xffefd2,1.3);sun.position.set(-16,35,-15);this.scene.add(sun);
 this.land=new T.Group();this.scene.add(this.land);this.actorGroup=new T.Group();this.scene.add(this.actorGroup);
 this.player=this.actor('red_normal',1.16,2.32,true);this.follower=this.actor('pikachu-front',1.35,1.35);this.follower.userData.id='pikachu';
 this.playerShadow=this.shadow(0,0,.5,this.actorGroup);this.followerShadow=this.shadow(0,0,.45,this.actorGroup);
 this.raycaster=new T.Raycaster();this.plane=new T.Plane(new T.Vector3(0,1,0),0);
 const markerGeo=new T.RingGeometry(.32,.39,24);this.marker=new T.Mesh(markerGeo,new T.MeshBasicMaterial({color:0xfff7bd,transparent:true,opacity:.9,side:T.DoubleSide}));this.marker.rotation.x=-Math.PI/2;this.marker.visible=false;this.scene.add(this.marker);
 canvas.addEventListener('pointerdown',e=>{this.pointerDown=[e.clientX,e.clientY];canvas.focus()});canvas.addEventListener('pointerup',e=>{if(this.paused||!this.pointerDown)return;const d=Math.hypot(e.clientX-this.pointerDown[0],e.clientY-this.pointerDown[1]);if(d>15)return;const r=canvas.getBoundingClientRect();this.raycaster.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);const hit=new T.Vector3();if(this.raycaster.ray.intersectPlane(this.plane,hit)){hit.x=T.MathUtils.clamp(hit.x,-20,20);hit.z=T.MathUtils.clamp(hit.z,-19,19);this.navigationEntity=null;this.routeTo(hit);this.marker.position.set(hit.x,.04,hit.z);this.marker.visible=true}});
 this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);this.resize();this.load(0);this.last=performance.now();this.loop=this.loop.bind(this);requestAnimationFrame(this.loop);
 }
 resize(){const w=this.canvas.clientWidth,h=this.canvas.clientHeight;this.renderer.setSize(w,h,false);const v=(this.interior&&routeIndex(this.interior)<0&&wildlandIndex(this.interior)<0?10:16)/this.zoom;this.camera.left=-v*w/h;this.camera.right=v*w/h;this.camera.top=v;this.camera.bottom=-v;this.camera.updateProjectionMatrix();}
 actor(name,w,h,sheet=false){const tex=texture(name).clone();tex.needsUpdate=true;if(sheet){tex.repeat.set(1/9,1);tex.offset.set(0,0)}const s=new T.Sprite(new T.SpriteMaterial({map:tex,alphaTest:.15,toneMapped:false,fog:false}));s.center.set(.5,0);s.scale.set(w,h,1);this.actorGroup.add(s);return s;}
 setFollower(id){if(this.follower.userData.walkId===id)return;this.follower.userData.id=id;this.follower.userData.walkId=id;this.followerTextures={front:texture(id+'-walk').clone(),back:texture(id+'-back').clone()};this.followerTextures.front.repeat.set(1,.5);this.follower.material.map=this.followerTextures.front;this.follower.scale.set(1.7,1.7,1);this.followerDirection='south';}
 mesh(geo,color,x,y,z){const m=new T.Mesh(geo,new T.MeshLambertMaterial({color}));m.position.set(x,y,z);this.land.add(m);return m;}
 box(x,z,w,d,h,color,y=0){return this.mesh(new T.BoxGeometry(w,h,d),color,x,y+h/2,z)}
 floor(x,z,w,d,color,y=.015){const m=this.mesh(new T.PlaneGeometry(w,d),color,x,y,z);m.rotation.x=-Math.PI/2;return m;}
 shadow(x,z,r=1,group=this.land){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),a=g.createRadialGradient(32,32,2,32,32,30);a.addColorStop(0,'rgba(31,55,27,0.40)');a.addColorStop(1,'rgba(31,55,27,0)');g.fillStyle=a;g.fillRect(0,0,64,64);const t=new T.CanvasTexture(c);const m=new T.Mesh(new T.PlaneGeometry(r*3,r*2),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x+.3,.05,z+.2);group.add(m);return m;}
 billboard(name,x,z,w,h,collide=false){const proportion=characterScale(name);if(proportion){w=proportion.width;h=proportion.height}const s=new T.Sprite(new T.SpriteMaterial({map:texture(name),alphaTest:.2,toneMapped:false,fog:false}));s.center.set(.5,0);s.scale.set(w,h,1);s.position.set(x,.02,z);s.userData.asset=name;s.userData.characterSprite=/^(npc-|trainer-|professor$|woman$)/.test(name);this.land.add(s);s.userData.shadow=this.shadow(x,z,w*.4);if(name==='tree'||name==='tree2'){const sh=new T.Mesh(new T.PlaneGeometry(w,h*.92),new T.MeshBasicMaterial({map:texture(name),color:0x233c31,transparent:true,opacity:.22,depthWrite:false,alphaTest:.02,toneMapped:false}));sh.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb = vec3(0.13, 0.23, 0.16);')};sh.rotation.x=-Math.PI/2;sh.rotation.z=.52;sh.position.set(x+1,.043,z+1.65);this.land.add(sh)}if(collide)this.obstacles.push({x,z,w:w*.7,d:1.5});return s;}
 tree(x,z,size=1){if(!this.interior&&waterAt(this,x,z))return;const start=this.land.children.length;const type=rand()>.55?'tree':'tree2';const s=this.billboard(type,x,z,4.7*size,5.7*size);this.obstacles.push({x,z,w:1,d:1});this.shadow(x+.6,z+.6,2.3*size);s.userData.treeParts=this.land.children.slice(start);return s;}
 building(name,x,z,w,h,label,action){
 const art=BUILDING_ART[name];
 // Blue-roof cottages need a larger shell, not a larger pasted-on door.
 if(name==='house2'){w*=1.22;if(this.area===0&&action==='shop'){x=7;z=-12.1}if(this.area===1&&action==='heal'){x=-12.3;z=12.6}}
 w*=1.48;h=art?w*art.size[1]/art.size[0]:h*1.48;
 const building=this.billboard(name,x,z,w,h);building.userData.occluder=true;building.userData.building=true;
 let doorX=x;
 if(art){const [iw,ih]=art.size,[dx,dy,dw,dh]=art.door;doorX=x+((dx+dw/2)/iw-.5)*w;
 const map=texture(name).clone();map.repeat.set(dw/iw,dh/ih);map.offset.set(dx/iw,1-(dy+dh)/ih);map.needsUpdate=true;
 const door=new T.Sprite(new T.SpriteMaterial({map,alphaTest:.2,toneMapped:false,fog:false}));
 const doorHeight=name==='house2'?2.45:2.6;
 door.center.set(.5,0);door.scale.set(doorHeight*dw/dh,doorHeight,1);door.position.set(doorX,.025+(1-(dy+dh)/ih)*h,z+.015);door.userData.buildingDoor=true;this.land.add(door);
 }
 const depth=Math.max(4,h*.88);building.userData.footprint={x,z:z-depth/2+.4,w:w*.92,d:depth};
 this.obstacles.push({...building.userData.footprint,kind:'building'});
 this.entity(action,label,doorX,z+1.9,{labelY:h-.1,labelZ:z,portal:true,service:action,returnOffset:.25});
}
 entity(id,name,x,z,extra={}){const e={id,name,x,z,...extra};if(!extra.portal){const actor=[...this.land.children].reverse().find(s=>s.isSprite&&!s.userData.characterId&&s.userData.characterSprite&&Math.hypot(s.position.x-x,s.position.z-z)<1.25);if(actor){e.actor=actor;actor.userData.characterId=id}}this.entities.push(e);const el=document.createElement('button');el.type='button';el.dataset.target=id;el.dataset.kind=extra.portal?'place':e.actor?'person':id==='main-road'||id==='route-town'||id.startsWith('route-')?'route':'object';el.title='走近'+name;el.onclick=()=>{if(!this.paused){this.navigationEntity=e;this.routeTo(new T.Vector3(e.x,0,e.z+.9));this.canvas.focus()}};el.className='world-label';el.textContent=name;el.hidden=true;document.getElementById('world-labels').appendChild(el);this.labels.push({el,e});return e;}
 setQuest(stage){this.storyStage=stage;}
 isQuestEntity(e){if(this.storyStage===6&&this.area===0&&!e.portal&&['prof','lab'].includes(e.id))return !this.legendProgress?.accepted||this.legendProgress.sites.length>=3;const quest=QUESTS[this.storyStage];if(!quest||this.storyStage>=6||quest.area!==this.area)return false;const outside={prof:'prof',ranger:'safari-help'},inside={prof:'lab',ranger:'ranger'};const expected=(this.interior?inside:outside)[quest.target]||quest.target;return e.id===expected;}
 updateLabels(rect){
  const nearest=this.nearest(),candidates=[];
  for(const item of this.labels){const {el,e}=item,quest=this.isQuestEntity(e),distance=Math.hypot(e.x-this.pos.x,e.z-this.pos.z),route=e.id==='main-road'||e.id==='route-town'||e.service?.startsWith('route-'),selected=this.navigationEntity===e,limit=selected?18:quest?9:route?7:e.portal?6.4:e.actor?5.2:4.6,p=new T.Vector3(e.x,e.labelY??2,e.labelZ??e.z).project(this.camera),sx=(p.x+1)*rect.width/2,sy=(-p.y+1)*rect.height/2;
   el.classList.toggle('quest',quest);el.setAttribute('aria-current',quest?'step':'false');
   if(!quest||this.paused||distance>limit||p.x<-.94||p.x>.94||p.y<-.67||p.y>.73||sy<72||sy>rect.height-92){el.hidden=true;el.classList.remove('visible');continue}el.hidden=false;
   candidates.push({...item,quest,distance,selected,route,sx,sy,priority:(quest?100:0)+(selected?70:0)+(nearest===e?45:0)+(e.portal?12:0)+(route?6:0)});
  }
  candidates.sort((a,b)=>b.priority-a.priority||a.distance-b.distance||a.e.name.localeCompare(b.e.name,'zh-CN'));
  const placed=[],offsets=[[0,0],[0,-34],[-72,0],[72,0],[-64,-34],[64,-34],[0,34],[-84,34],[84,34]];
  for(const item of candidates){const {el,sx,sy}=item;el.hidden=false;const w=el.offsetWidth,h=el.offsetHeight;let position=null;
   for(const [dx,dy] of offsets){const x=sx+dx,y=sy+dy,box={left:x-w/2-5,right:x+w/2+5,top:y-h-5,bottom:y+5};if(box.left<8||box.right>rect.width-8||box.top<78||box.bottom>rect.height-91)continue;if(placed.every(other=>box.right<other.left||box.left>other.right||box.bottom<other.top||box.top>other.bottom)){position={x,y,box};break}}
   if(!position){el.hidden=true;el.classList.remove('visible');continue}el.style.left=position.x+'px';el.style.top=position.y+'px';el.classList.add('visible');placed.push(position.box);
  }
  this.visibleLabelCount=placed.length;return nearest;
 }
 npc(sprite,id,name,x,z,line){sprite=RESIDENT_SPRITES[id]||sprite;const actor=this.billboard(sprite,x,z,1.7,2.85);actor.userData.characterSprite=true;const e=this.entity(id,name,x,z,{labelY:3.15,line,portrait:sprite});e.actor=actor;actor.userData.characterId=id;return e;}
 flowers(x,z,count=4){for(let j=0;j<count;j++){this.billboard('flowers',x+(rand()-.5)*3,z+(rand()-.5)*2,1.2,.7)}}
 meadowPatch(x,z,w,d){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gradient=g.createRadialGradient(64,64,12,64,64,63);gradient.addColorStop(0,'#80a45d80');gradient.addColorStop(.65,'#80a45d50');gradient.addColorStop(1,'#80a45d00');g.fillStyle=gradient;g.fillRect(0,0,128,128);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=this.floor(x,z,w*1.2,d*1.2,0xffffff,.024);m.material.dispose();m.material=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false});}
 grass(x,z,w=5,d=4){this.meadowPatch(x,z,w,d);for(let i=0;i<25;i++)this.billboard('grass',x+(rand()-.5)*w,z+(rand()-.5)*d,.6,.45);}
 fence(x,z,w){this.obstacles.push({x:x+w/2,z,w:w+.15,d:.22,kind:'fence'});for(let i=0;i<w;i+=1.2){this.box(x+i,z,.13,.15,.85,0xd7d4aa);this.box(x+i+.5,z,1.1,.1,.11,0xe8dbb6,.25);this.box(x+i+.5,z,1.1,.1,.11,0xe8dbb6,.63)}}
 rock(x,z,r=1){const g=new T.DodecahedronGeometry(r,0),m=this.mesh(g,0x9fa99a,x,r*.43,z);m.scale.y=.65;this.obstacles.push({x,z,w:r*1.3,d:r*1.2});this.shadow(x,z,r);}
 bridge(z=5){this.floor(14.5,z,9,3.3,0xa8895d,.10);for(let i=0;i<28;i++)this.box(10+i*.34,z,.27,3.3,.1,i%2?0xcab17c:0xd6bd88,.09);this.fence(10,z-1.65,9);this.fence(10,z+1.65,9)}
 water(x,z,w,d){const m=this.floor(x,z,w,d,0x71c5b9,.012);const wc=document.createElement('canvas');wc.width=wc.height=128;const cg=wc.getContext('2d');cg.fillStyle='#70bfb5';cg.fillRect(0,0,128,128);for(let k=0;k<55;k++){cg.strokeStyle=k%3?'#99d7bd55':'#d6f2d966';cg.lineWidth=1;const xx=rand()*128,yy=rand()*128;cg.beginPath();cg.moveTo(xx,yy);cg.quadraticCurveTo(xx+6,yy-2,xx+12,yy);cg.stroke()}const wt=new T.CanvasTexture(wc);wt.wrapS=wt.wrapT=T.RepeatWrapping;wt.repeat.set(w/4,d/4);wt.colorSpace=T.SRGBColorSpace;m.material=new T.MeshBasicMaterial({map:wt,color:0xffffff,toneMapped:false});this.waterTexture=wt;this.waterTextures.push(wt);for(let i=0;i<36;i++){const l=this.floor(x+(rand()-.5)*w,z+(rand()-.5)*d,.3+rand(),.055,0xb5ead1,.031);l.userData.wave=rand()*6;this.waves.push(l)}return m;}
 load(index,room=null){this.interior=room;this.roadPaths=[];this.waterZones=[];this.waterTextures=[];this.navigationEntity=null;this.healLights=[];this.area=index;this.target=null;this.path=[];this.keys.clear();this.marker.visible=false;this.pos.set(0,0,7);this.fpos.set(-.9,0,8.2);this.look.set(0,0,1);this.land.traverse(o=>{o.geometry?.dispose();if(o.material){if(o.material.map&&!Array.from(texCache.values()).includes(o.material.map))o.material.map.dispose();o.material.dispose()}});this.land.clear();this.obstacles=[];this.entities=[];this.labels=[];this.wild=[];this.waves=[];this.motes=[];this.waterTexture=null;this.crystal=null;this.trail=[this.fpos.clone(),this.pos.clone()];this.turnUntil=0;document.getElementById('world-labels').innerHTML='';seed=index*57+13;
 if(room){if(wildlandIndex(room)>=0)buildWildland(this,room);else if(routeIndex(room)>=0)buildRoute(this,room);else if(isDistrict(room))buildDistrict(this,room);else buildInterior(this,room);layoutCharacters(this);this.clearSightlines();this.rebuildCharacterObstacles();this.resize();return}this.resize();
 const a=AREAS[index];this.renderer.setClearColor(a.color);this.scene.fog.color.set(a.color);this.scene.fog.density=index===1?.01:.006;
 regionalGround(this,index);
 this.box(0,0,44,40,.4,a.color,-.42);
 const sides=CONNECTIONS.flatMap((c,i)=>c.towns.includes(index)?[townEndpoint(i,index).side]:[]);sides.push(mainConnection(index).side);this.roadPaths.push([[0,sides.includes('north')?-23:-12],[0,sides.includes('south')?24:14]],[[sides.includes('west')?-25:-13,5],[sides.includes('east')?25:11,5]]);
 for(let i=0;i<180;i++){let x=(rand()-.5)*42,z=(rand()-.5)*38;if(Math.abs(x)<2||Math.abs(z-5)<2)continue;}
 if(index===1)this.roadPaths[0]=[[0,-23],[0,-12],[2,-8],[2,-1],[0,5],[0,24]];
 if(index===3)this.roadPaths[0]=[[0,-12],[0,-6],[1,-2],[1,5],[-1,11],[0,24]];
 if(index===5)this.roadPaths[0]=[[0,-23],[0,-11],[2,-6],[2,1],[0,5],[0,24]];
 buildCoast(this,index);
 for(let x=-23;x<25;x+=4){if(Math.abs(x)<3)continue;this.tree(x,-18-rand()*2,1+rand()*.15);if(x<14)this.tree(x,22+rand()*2,1.05)}
 for(let z=-14;z<21;z+=4.5){if(Math.abs(z-5)<4)continue;this.tree(-22-rand()*2,z,1.12);}
 if(index===0){
 this.building('house',-9,-.8,7.4,5.7,'你的家','home');this.building('center',7.2,-2.8,8,5.7,'宝可梦中心','heal');this.building('lab',-9,-11,8,5.5,'大木研究所','lab');this.building('house2',7.2,-12.5,6.2,5,'青岚小铺','shop');this.building('house2',-10,13.5,6.8,5.2,'树果小屋','berry');
 this.billboard('professor',-3,2.5,1.4,2.1);this.entity('prof','大木博士',-3,3,{labelY:2.9});
 this.npc('npc-mom','npc-mom','妈妈',-10,5.6,'早点去宝可梦中心休息。看到你的伙伴跟在身后，我就放心多了。');this.npc('npc-little_girl','npc-girl','捧着花的小女孩',-4.6,10.2,'我刚刚看到草丛里有皮卡丘的耳朵一闪而过！');this.npc('npc-boy','npc-boy','短裤少年',2.8,10.5,'训练家最重要的是勇气，还有背包里够不够精灵球。');this.npc('npc-old_man_1','npc-elder','散步的老人',11.8,2.9,'以前这里没有这么多桥。宝可梦们喜欢看水面发光。');this.npc('npc-daisy','npc-daisy','照料员小蓝',-13,15.3,'树果小屋会免费帮你补一点树果，别忘了常来。');
 this.fence(-15,3,7);this.fence(4,1,6);this.flowers(-8,2.6,8);this.flowers(8,.8,7);this.tree(-16,-7,1.2);this.tree(-17,11);this.tree(9,13);this.tree(5,17);this.grass(-7,-17,6,2);this.grass(6,15,5,3);
 }else if(index===1){
 for(let i=0;i<25;i++){const x=(rand()-.5)*33,z=(rand()-.5)*31;if(Math.abs(x)>3&&Math.abs(z-5)>3)this.tree(x,z,.85+rand()*.45)}
 this.grass(-7,1,7,5);this.grass(6,-7,6,5);this.grass(-7,13,5,4);this.billboard('npc-erika',-2,-4,1.7,2.85);this.entity('warden','守望者 · 林音',-2,-4,{labelY:2.7});this.npc('npc-bug_catcher','npc-bug','捕虫少年',5.5,1.2,'森林里的宝可梦不是随机蹦出来的。你看得见它们，也能决定要不要靠近。');this.npc('npc-lass','npc-lass','迷路的少女',-11,6.5,'沿着浅色小路走，就能回到休息站。');this.npc('npc-hiker','npc-hiker','巡山客',8.5,-13,'大岩蛇的动静从山壁一路传过来，像雷一样。');this.flowers(-4,-2,8);this.rock(7,-12,1.8);this.rock(-7,-13,1.5);this.building('house2',-12,12,5.7,4.5,'林间休息站','heal');
 }else if(index===2){
 this.building('house2',-8,-8,7,5.3,'潮汐钓具屋','shop');this.building('center',-10,12,7,5,'港口休息站','heal');this.entity('fish','潮汐钓场',12,5,{labelY:2.1});this.billboard('npc-old_man_1',3.4,3,1.7,2.85);this.entity('fisher','老渔人的委托',3.4,3,{labelY:2.5});this.npc('npc-sailor','npc-sailor','水手',9.5,9.2,'潮水变绿的时候，远处的岛会像梦一样浮起来。');this.npc('npc-swimmer_f_land','npc-swimmer-f','游泳训练家',5,1.2,'钓鱼不只是等，竿尖一动就要抓住节奏。');this.npc('npc-tuber_m_land','npc-tuber','沙滩小孩',1.8,12.5,'我的宝可梦喜欢在码头边追浪花。');this.npc('npc-fisher','npc-fisher-extra','钓客',-1.5,-7.4,'老钓竿也能钓到惊喜，别嫌它旧。');this.box(8,9,8,2,.16,0xc7ae78,.03);this.fence(5,10,7);this.tree(-15,-12,1.1);this.tree(-15,0);this.tree(-5,15);this.flowers(-6,8,6);this.grass(-8,-15,6,3);this.rock(4,13,1.4);
 }else if(index===3){
 this.building('safari',-9,-10,8,5.8,'保育管理站','ranger');this.billboard('npc-black_belt',-3,1,1.7,2.85);this.entity('safari-help','保育员 · 阿岚',-3,1,{labelY:2.8});this.npc('npc-cooltrainer_m','npc-ranger-field','巡护员',-13,-3.5,'保育区不靠伤害取胜。先投喂，再慢慢靠近。');this.npc('npc-picnicker','npc-picnic','野餐训练家',5.8,5.5,'我带的三明治全被卡比兽盯上了。');this.npc('npc-cooltrainer_f','npc-observer','观察员',11,12.5,'看草叶晃动的方向，就能猜出里面是哪种宝可梦。');this.grass(-8,1,8,6);this.grass(7,-8,7,6);this.grass(7,14,6,5);this.grass(-8,14,6,4);this.fence(-15,7,9);this.tree(-15,-2,1.3);this.tree(9,-15,1.1);this.tree(11,10);this.flowers(5,2,6);this.rock(-13,12,1.2);
 }else if(index===4){
 this.building('arcade',-8,0,10,6.5,'星灯娱乐城','arcade');this.building('center',8,-7,7,5,'星灯宝可梦中心','heal');this.building('house2',-9,12,7,5.3,'伙伴俱乐部','pet');this.building('house',6,13,6,4.6,'星灯百货','shop');
 for(let z=-14;z<18;z+=7){for(let x of [-3,3]){this.box(x,z,.13,.13,3.1,0x556a5b);const lamp=this.mesh(new T.SphereGeometry(.25,8,8),0xffebad,x,3.15,z);lamp.material=new T.MeshBasicMaterial({color:0xffeab3});}}this.npc('npc-rich_boy','npc-rich','阔少训练家',1.5,-5.5,'老虎机靠运气，对战靠准备。两样我都还在练。');this.npc('npc-beauty','npc-beauty','百货顾客',8.5,8.8,'星灯百货的树果香水很受伊布喜欢。');this.npc('npc-rocker','npc-rocker','街头乐手',-2,12.8,'听见这段节拍了吗？伙伴互动区就是按这个感觉来。');this.npc('npc-policeman','npc-police','巡查员',-13,4,'娱乐城可以玩，但记得先存点补给钱。');this.tree(-17,3);this.tree(11,-14);this.flowers(7,2,8);this.grass(-7,-14,5,3);
 }else{
 this.floor(0,-6,16,12,0xb7bdad,.025);for(let x of [-7,7])for(let z of [-10,-4]){this.box(x,z,1.5,1.5,.5,0xd1d1b8);this.box(x,z,1,1,4.2,0xa1ad9d);this.box(x,z,1.6,1.6,.4,0xc8cdb9,4.1)}
 const crystal=this.mesh(new T.OctahedronGeometry(1.8),0x90d0ba,0,3,-10);crystal.material=new T.MeshStandardMaterial({color:0x87d7b8,emissive:0x356b5b,emissiveIntensity:.65,metalness:.2,roughness:.3});crystal.userData.crystal=true;this.crystal=crystal;this.entity('guardian','回响之心',0,-5,{labelY:4,labelZ:-8});this.npc('npc-scientist','npc-researcher','遗迹研究员',-6.8,-1.2,'晶体记录的不是声音，是宝可梦和训练家一起走过的痕迹。');this.npc('npc-gym_guy','npc-guide','联盟向导',6.8,3.2,'走到这里，你已经不是新手训练家了。');this.rock(-10,5,2);this.rock(8,12,1.5);this.rock(-9,-13,1.9);this.grass(-8,12,5,4);this.flowers(5,3,9);this.tree(-15,0,1.2);this.tree(11,-13,1.2);
 }
 const main=mainConnection(index),gate=DIRS[main.side];this.entity('main-road',gate.name+'行 · '+AREAS[main.to].name,gate.x,gate.z,{destination:main.to,side:main.side,labelY:1.4});if(index!==2)this.entity('fish','河畔钓点',11.5,5,{labelY:1.6});
 addRoutes(this);addStoryPlaces(this);addRouteGates(this);addRegionalLandmarks(this);const districtSpot=this.safeWildSpot(-15,8);if(districtSpot){const [x,z]=districtSpot;this.entity('echo-district','剧情街区 · '+['修理庭','避雨内院','接力码头','迁徙走廊','广播街区','四响回廊'][index],x,z,{service:'echo-district',labelY:1.3});}decorateEchoWorld(this);this.clearSightlines();layoutCharacters(this);this.clearSightlines();this.rebuildCharacterObstacles();paintRoads(this,this.roadPaths,ROAD_PALETTES[index],2.8);const wildSpots=index===0?[[5,14],[-6,-16],[8,9]]:index===2?[[-5,-14],[-4,13],[2,-5]]:[[-6,0],[7,-7],[-7,12],[6,13]];
 wildSpots.forEach(([x,z],i)=>{const spot=this.safeWildSpot(x,z);if(!spot)return;[x,z]=spot;const id=a.wild[i%a.wild.length];const s=this.billboard(id+'-front',x,z,1.6,1.6);const e={id:'wild',name:MON[id].name,x,z,pokemon:id,mesh:s,phase:rand()*6};this.entities.push(e);this.wild.push(e)});
 addHabitat(this,index);enrichLandscape(this,index,this.roadPaths);
 const discovery=this.safeWildSpot(-11,8);if(discovery){const [x,z]=discovery;this.billboard('flowers',x,z,1.5,1);this.entity('discovery','伙伴发现了什么？',x,z,{labelY:1.5});}
 // Soft petals, sunlight motes and small flowers give the world depth without obscuring play.
 this.motes=[];for(let i=0;i<35;i++){const m=this.mesh(new T.PlaneGeometry(.045+rand()*.055,.10),i%3?0xfbf4ce:0xe9b9b0,(rand()-.5)*42,1+rand()*6,(rand()-.5)*38);m.material=new T.MeshBasicMaterial({color:i%3?0xfff9df:0xf1c2b6,transparent:true,opacity:.65,side:T.DoubleSide});this.motes.push(m)}
 this.updateActors(false);this.camera.position.set(0,32,39);this.camera.lookAt(0,0,1);
 }
 clearSightlines(){
  const people=this.entities.filter(e=>e.portrait||(e.portal&&!e.service?.startsWith('route-'))||['prof','warden','fisher','safari-help','story-place'].includes(e.id));
  for(const tree of [...this.land.children].filter(s=>s.userData.treeParts)){
   const {x,z}=tree.position;
   if(!people.some(e=>Math.abs(e.x-x)<tree.scale.x*.45+(e.portal?2:.6)&&z-e.z>-.6&&z-e.z<9))continue;
   for(const part of tree.userData.treeParts){this.land.remove(part);part.geometry?.dispose();part.material?.dispose();}
   this.obstacles=this.obstacles.filter(o=>!(o.x===x&&o.z===z&&o.w===1&&o.d===1));
  }
 }
 rebuildCharacterObstacles(){
  this.obstacles=this.obstacles.filter(o=>o.kind!=='npc');
  for(const e of this.entities){if(!e.actor||e.portal||e.id==='wild')continue;const x=e.actor.position.x,z=e.actor.position.z;this.obstacles.push({x,z,w:.72,d:.58,kind:'npc',entity:e.id});}
 }
 enter(portal){this.returnPoint={area:this.area,x:portal.x,z:portal.z+(portal.returnOffset??1.2)};this.load(this.area,{name:portal.name,service:portal.service});}
 leave(){const point=this.returnPoint;if(!this.interior||!point)return;this.load(point.area);const candidates=[[0,0],[0,.35],[0,-.35],[.45,.35],[-.45,.35],[.45,-.35],[-.45,-.35],[0,.8],[0,-.8],[.8,0],[-.8,0]];const spot=candidates.map(([dx,dz])=>[point.x+dx,point.z+dz]).find(([x,z])=>this.canMove(x,z));const [x,z]=spot||[point.x,point.z];this.pos.set(x,0,z);this.fpos.set(x-.6,0,z+.6);this.playerDir=0;this.trail=[this.fpos.clone(),this.pos.clone()];}
 canMove(x,z){if(routeIndex(this.interior)>=0||wildlandIndex(this.interior)>=0){if(x< -20||x>20||z< -18||z>19)return false}else if(this.interior){if(x< -8.7||x>8.7||z< -7.2||z>7.6)return false}else{if(x< -20||x>20||z< -18||z>19)return false;if(waterAt(this,x,z)&&!onWalkway(this,x,z))return false}return !this.obstacles.some(o=>Math.abs(x-o.x)<o.w/2+.34&&Math.abs(z-o.z)<o.d/2+.28)}
 routeTo(goal){
 const key=(x,z)=>x+','+z, sx=Math.round(this.pos.x),sz=Math.round(this.pos.z);let gx=Math.round(goal.x),gz=Math.round(goal.z);
 if(!this.canMove(gx,gz)){let best=Infinity;const original=goal.clone();for(let x=gx-3;x<=gx+3;x++)for(let z=gz-3;z<=gz+3;z++)if(this.canMove(x,z)){const d=Math.hypot(x-original.x,z-original.z);if(d<best){best=d;goal=new T.Vector3(x,0,z)}}gx=Math.round(goal.x);gz=Math.round(goal.z)}
 const start=key(sx,sz),end=key(gx,gz),open=[{x:sx,z:sz,g:0,f:0}],came=new Map(),cost=new Map([[start,0]]);let found=false;
 while(open.length){open.sort((a,b)=>a.f-b.f);const n=open.shift(),nk=key(n.x,n.z);if(nk===end){found=true;break}for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=n.x+dx,z=n.z+dz;if(!this.canMove(x,z)||!this.canMove(n.x+dx,n.z)||!this.canMove(n.x,n.z+dz))continue;const k=key(x,z),g=n.g+Math.hypot(dx,dz);if(g>=(cost.get(k)??Infinity))continue;cost.set(k,g);came.set(k,nk);open.push({x,z,g,f:g+Math.hypot(x-gx,z-gz)})}}
 if(found){const points=[];let k=end;while(k!==start){const [x,z]=k.split(',').map(Number);points.unshift(new T.Vector3(x,0,z));k=came.get(k)}this.path=points;this.target=this.path.shift()||null}else{this.path=[];this.target=null}
 }
 respawnWild(e,id){if(e.mesh.parent!==this.land)return;e.pokemon=id;e.name=MON[id].name;e.wanderTarget=null;e.home={x:e.x,z:e.z};e.mesh.material.map=texture(id+'-front');e.mesh.visible=true;this.entities.push(e);this.wild.push(e);}
 safeWildSpot(x,z,avoidOcclusion=false){const scenery=avoidOcclusion?this.land.children.filter(s=>s.userData.occluder||s.userData.treeParts||s.userData.building):[];const reachable=new Set(),queue=[[0,7]];for(let i=0;i<queue.length;i++){const [a,b]=queue[i],key=a+','+b;if(reachable.has(key)||!this.canMove(a,b))continue;reachable.add(key);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const c=a+dx,d=b+dz;if(c>=-19&&c<=19&&d>=-17&&d<=18&&!reachable.has(c+','+d))queue.push([c,d])}}let best=null,score=Infinity;for(let a=-18;a<=13;a++)for(let b=-16;b<=17;b++){if(scenery.some(s=>s.position.z>b+.2&&Math.abs(s.position.x-a)<s.scale.x/2+1&&s.position.z-b<s.scale.y*1.22+1.2)||Math.abs(a)<3||Math.abs(b-5)<2||!reachable.has(a+','+b)||!this.canMove(a,b+1)||this.entities.some(e=>Math.hypot(e.x-a,e.z-b)<(e.portal?5:e.id==='wild'?3:3.5)))continue;const d=Math.hypot(x-a,z-b);if(d<score){score=d;best=[a,b]}}return best;}
 nearest(){const distance=e=>Math.hypot(e.x-this.pos.x,e.z-this.pos.z),valid=e=>this.entities.includes(e)&&distance(e)<(e.id==='wild'?2.3:3);const door=this.entities.find(e=>(e.portal||e.id==='exit')&&distance(e)<2.7);if(door)return door;const focused=this.navigationEntity;if(focused&&valid(focused))return focused;let n=null,d=3;for(const e of this.entities){const a=distance(e);if(valid(e)&&a<d){n=e;d=a}}return n;}
 goTo(id){const e=typeof id==='object'?this.entities.find(e=>e===id):this.entities.find(e=>e.id===id);if(e){this.navigationEntity=e;this.routeTo(new T.Vector3(e.x,0,e.z+.9));this.marker.position.set(e.x,.04,e.z+.9);this.marker.visible=true;return true}return false;}
 updateActors(moving){
 this.player.position.set(this.pos.x,.08+(moving?Math.abs(Math.sin(this.time*13))*.08:0),this.pos.z);
 this.playerShadow.position.set(this.pos.x+.15,.052,this.pos.z);this.followerShadow.position.set(this.fpos.x+.15,.054,this.fpos.z);
 const turning=this.time<(this.turnUntil||0),walk=moving&&!turning;
 const frame=walk?[[3,0,4,0],[5,1,6,1],[7,2,8,2]][this.playerDir][Math.floor(this.time*(this.keys.has('shift')?13:8))%4]:this.playerDir;
 this.player.material.map.repeat.x=(this.facingRight?-1:1)/9;
 this.player.material.map.offset.x=(frame+(this.facingRight?1:0))/9;
 this.player.scale.set((turning?1.07:1.16)*1.3,3.016,1);this.player.userData.frame=frame;this.player.userData.turning=turning;
 const walking=!!this.followerMoving&&!this.paused,bob=walking?Math.abs(Math.sin(this.time*12))*.14:0;
 this.follower.position.set(this.fpos.x,.09+bob,this.fpos.z);
 if(this.followerTextures){
  const north=this.followerDirection==='north',right=this.followerDirection==='east';
  this.follower.material.map=north?this.followerTextures.back:this.followerTextures.front;
  const map=this.follower.material.map;map.repeat.x=right?-1:1;map.offset.x=right?1:0;
  if(!north)map.offset.y=walking?(Math.floor(this.time*7)%2)*.5:.5;
  this.follower.material.rotation=walking?Math.sin(this.time*12)*.045:0;
  this.follower.scale.set(north?1.9:1.7, (north?1.9:1.7)*(walking?1+Math.sin(this.time*12)*.035:1),1);
  this.follower.userData.frame=walking?Math.floor(this.time*7)%2:0;
 }
 }
 loop(now){requestAnimationFrame(this.loop);const dt=Math.min((now-this.last)/1000,.04);this.last=now;this.time+=dt;let moving=false;
 if(!this.paused){let x=0,z=0;if(this.keys.has('w')||this.keys.has('arrowup'))z--;if(this.keys.has('s')||this.keys.has('arrowdown'))z++;if(this.keys.has('a')||this.keys.has('arrowleft'))x--;if(this.keys.has('d')||this.keys.has('arrowright'))x++;if(x||z){this.navigationEntity=null;this.target=null;this.path=[];this.marker.visible=false}else if(this.target){x=this.target.x-this.pos.x;z=this.target.z-this.pos.z;if(Math.hypot(x,z)<.15){if(this.canMove(this.target.x,this.target.z))this.pos.copy(this.target);x=z=0;this.target=this.path?.shift()||null;if(!this.target)this.marker.visible=false}}
 const l=Math.hypot(x,z);if(l>.001){x/=l;z/=l;
 const dir=Math.abs(x)>Math.abs(z)?2:z<0?1:0,right=dir===2&&x>0;
 if(dir!==this.playerDir||right!==!!this.facingRight){this.playerDir=dir;this.facingRight=right;this.turnUntil=this.time+.075}
 if(this.time>=this.turnUntil){const speed=this.keys.has('shift')?7:4.2;const nx=this.pos.x+x*speed*dt,nz=this.pos.z+z*speed*dt;const old=this.pos.clone();if(this.canMove(nx,this.pos.z))this.pos.x=nx;if(this.canMove(this.pos.x,nz))this.pos.z=nz;moving=this.pos.distanceTo(old)>.001;if(!moving&&this.target){this.target=null;this.marker.visible=false}}}
 this.trail??=[this.fpos.clone(),this.pos.clone()];
 if(this.pos.distanceTo(this.trail.at(-1))>.12)this.trail.push(this.pos.clone());
 let remaining=0;for(let i=this.trail.length-1;i>0;i--)remaining+=this.trail[i].distanceTo(this.trail[i-1]);
 this.followerMoving=false;
 if(remaining>1.35&&this.trail.length>1){const target=this.trail[1],dx=target.x-this.fpos.x,dz=target.z-this.fpos.z,dist=Math.hypot(dx,dz),step=Math.min(dist,dt*(this.keys.has('shift')?7.8:5));
  if(dist>.005){this.followerDirection=Math.abs(dx)>Math.abs(dz)?dx>0?'east':'west':dz<0?'north':'south';const fx=this.fpos.x+dx/dist*step,fz=this.fpos.z+dz/dist*step;if(this.canMove(fx,fz)){this.fpos.x=fx;this.fpos.z=fz;this.followerMoving=true}else{this.fpos.copy(this.pos);this.trail=[this.pos.clone()]}}
  this.trail[0]=this.fpos.clone();if(dist<=step+.01)this.trail.shift();
 }
 }
 this.updateActors(moving);const tx=this.pos.x*(this.interior?.12:.22),tz=this.pos.z*(this.interior?.12:.28);this.look.lerp(new T.Vector3(tx,0,tz),dt*2);this.camera.position.set(this.look.x,32,this.look.z+38);this.camera.lookAt(this.look.x,0,this.look.z);
 for(const tex of this.waterTextures){tex.offset.x=this.time*.007;tex.offset.y=this.time*.004}for(const w of this.waves){w.scale.x=1+Math.sin(this.time*1.7+w.userData.wave)*.25;w.material.color.setHex(Math.sin(this.time+w.userData.wave)>.2?0xaee5d0:0x96d9ca)}
 for(const m of this.land.children)if(m.userData.echoMotion)m.position.y=.08+Math.sin(this.time*(m.userData.echoMotion==='float'?1.4:2.2)+m.position.x)*.055;
 animateWild(this,dt);animateLegends(this);
 for(const m of this.motes){m.position.x+=dt*.22;m.position.z+=dt*.12;m.rotation.y=this.time*.5;if(m.position.x>23)m.position.x=-23}
 if(this.area===5&&this.crystal){this.crystal.rotation.y=this.time*.35;this.crystal.position.y=3+Math.sin(this.time)*.25}
 const r=this.canvas.getBoundingClientRect(),n=this.updateLabels(r),hint=document.getElementById('interact-hint');hint.hidden=!n||this.paused;if(n)hint.textContent=`E · ${n.portal?'进入 '+n.name:n.id==='wild'?'靠近 '+n.name:n.name}`;
 for(const lamp of this.healLights||[])lamp.material.color.setHex(this.time<(this.healUntil||0)&&Math.sin(this.time*14)>0?0xa9fff0:0xffd7de);
 this.renderer.render(this.scene,this.camera);
 }
}


