import {CanvasTexture,MeshBasicMaterial,SRGBColorSpace} from './vendor/three.module.js';
export const PALETTES=['#9fca92','#79ad91','#ead6ad','#b2c88a','#b9c8ce','#adb5c3'];
export const ROAD_PALETTES=['#e1d4b2','#c7cbb1','#e7cca0','#ddd1ac','#d8d8ce','#cdd0cc'];
export function sourceProp(w,name,x,z,width,height){
 const s=w.billboard(name,x,z,width,height);s.center.y=.12;
 // Preserve source PNGs; omit only the dark violet studio backdrop at rendering.
 s.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(diffuseColor.b>diffuseColor.r*1.13 && diffuseColor.b>diffuseColor.g*1.2 && max(diffuseColor.r,diffuseColor.g)<0.14) discard;');};
 s.material.customProgramCacheKey=()=> 'source-violet-background';s.userData.occluder=true;
 w.obstacles.push({x,z:z-.3,w:width*.4,d:.7});return s;
}
export function regionalGround(w,index){
 const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');g.fillStyle=PALETTES[index];g.fillRect(0,0,1024,1024);
 const patches=[['#bedf9c','#86b994'],['#589784','#aed1a6'],['#f4e5c4','#d5bd8d'],['#dbd39d','#91b58b'],['#d4d9d3','#a6bec0'],['#cbd0d3','#8fa8ac']][index];
 let seed=index+77;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<26;i++){const x=rng()*1024,y=rng()*1024,r=60+rng()*160,a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,patches[i%2]+'bb');a.addColorStop(1,patches[i%2]+'00');g.fillStyle=a;g.fillRect(x-r,y-r,r*2,r*2)}
 for(let i=0;i<16000;i++){g.fillStyle=i%2?'#ffffff12':'#183c3010';g.fillRect(rng()*1024,rng()*1024,1+rng()*3,1+rng()*2)}
 const texture=new CanvasTexture(c);texture.colorSpace=SRGBColorSpace;const ground=w.floor(0,0,90,90,0xffffff,0);ground.material.dispose();ground.material=new MeshBasicMaterial({map:texture,toneMapped:false});
}
const STORIES=[
 ['归航邮亭','这块木牌记着七年前的回信地址。镇民把每一封“平安”抄在背面，风铃才有了等待的理由。'],
 ['溪谷木牌','护林员把蓝绳系向溪流下游，白绳系向休息站。风暴来时，迷路的人也能沿着绳结找到灯。'],
 ['沙丘里的旧灯','沙丘埋住了旧灯塔的地基。修船匠说，当年最后一船人，就是认着这盏灯靠岸的。'],
 ['候鸟观察棚','草滩每年都会留下不同的脚印。观察簿提醒旅人：留一片安静的地方，比把每条路都铺满更重要。'],
 ['航路纪念花园','花园木牌保存着救援船票和手绘路图的拓印。一张无名的票背面写着：“下一程，换我来接你。”'],
 ['风化石碑','石碑上刻着六个地点，正好对应六封回信。你终于明白，遗迹的力量来自每条路另一端愿意回答的人。']
];
export function addRegionalLandmarks(w){
 const index=w.area,spot=w.safeWildSpot(index===4?-15:8,index===4?-12:15);if(!spot)return;const [x,z]=spot,[name,line]=STORIES[index];
 const art=index===2?'decor-tower':index===5?'decor-rock':'decor-sign';
 sourceProp(w,art,x,z,index===2?4:2.5,index===2?6:3);
 if(index===4){w.flowers(x-1.7,z-1,6);w.flowers(x+1.7,z-1.5,6);w.grass(x,z-2,4,1.6);}
 w.entity('regional-memory',name,x,z+1.5,{labelY:3,line,portrait:'npc-scientist'});
 // Decorations occupy the background or shore, leaving central routes open.
 if(index===2){for(const [a,b] of [[-16,15],[-17,-14],[3,-15]])sourceProp(w,'decor-palm',a,b,5,6);sourceProp(w,'decor-cactus',-13,-14,2.8,3);}
 if(index===3)sourceProp(w,'decor-cactus',-16,-14,2.6,3);
 if(index===5)for(const [a,b] of [[-17,-14],[11,16]])sourceProp(w,'decor-rock',a,b,4,3.5);
}
