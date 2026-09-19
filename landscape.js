import {MON} from './data.js';
import {CanvasTexture,MeshBasicMaterial,SRGBColorSpace} from './vendor/three.module.js';
// Original vegetation/terrain PNGs, rendered with their studio background keyed out.
export function landscapeProp(w,name,x,z,width,height){
 const s=w.billboard('landscape-'+name,x,z,width,height);s.center.y=.16;
 s.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(diffuseColor.b>diffuseColor.r*1.13 && diffuseColor.b>diffuseColor.g*1.2 && max(diffuseColor.r,diffuseColor.g)<0.14) discard;');};
 s.material.customProgramCacheKey=()=> 'landscape-key-v1';s.userData.occluder=height>2;s.userData.landscape=name;return s;
}
const palettes=[['#a0bd8a','#c1d6a0','#739e82'],['#adc184','#d5d69c','#88ae88'],['#c4c3a3','#e2d8b4','#9fad9c'],['#93ad99','#b2c2a3','#758f89'],['#d3c9a1','#ece0bd','#aebe9f'],['#a5bbad','#ced5b4','#839f98']];
export function routeGround(w,index){
 const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d'),p=palettes[index];g.fillStyle=p[0];g.fillRect(0,0,1024,1024);
 let seed=91+index;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<32;i++){const x=rng()*1024,y=rng()*1024,r=70+rng()*180,a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,p[1+i%2]+'aa');a.addColorStop(1,p[1+i%2]+'00');g.fillStyle=a;g.fillRect(x-r,y-r,r*2,r*2)}
 for(let i=0;i<9000;i++){g.fillStyle=i%2?'#ffffff12':'#2c51460c';g.fillRect(rng()*1024,rng()*1024,2,2)}
 const texture=new CanvasTexture(c);texture.colorSpace=SRGBColorSpace;const m=w.floor(0,0,90,90,0xffffff,0);m.material.dispose();m.material=new MeshBasicMaterial({map:texture,toneMapped:false});
}
export function routeCoastalSeam(w,index){
 if(index>=4)return;
 // Every western endpoint of routes 0–3 connects to an eastern town sea bridge.
 // Deck width and railing follow buildCoast's 3.2-unit bridge profile.
 const sea=w.water(-21,0,14,44);sea.material.color.setHex(index===0?0x9dccf2:index===3?0xa4cbd8:0xb5e2d5);w.floor(-14,0,1,44,0xdcd0ab,.02);
 const deck=w.floor(-18,5,12,3.2,index===3?0xaeb9b9:0xc3ac80,.095);deck.userData.routeCrossing={left:-24,right:-12,z:5,width:3.2};
 for(let x=-24;x<=-12;x+=.6)w.box(x,5,.06,3.2,.035,0x9e916f,.10);
 // Stop railings at the bank so the north/south park paths do not cross a fence.
 w.fence(-24,3.3,10);w.fence(-24,6.7,10);
 w.obstacles.push({x:-21,z:-9.44,w:14,d:25.12},{x:-21,z:17.44,w:14,d:21.12});
 w.routeSea={shore:-14,z:5,width:3.2};
 for(const z of [-12,-5,12,17])landscapeProp(w,index===2?'route14_shore_rock_cluster':'fuchsia_marsh_reed_cluster',-13.8,z,3,2.3);
 if(index===0){landscapeProp(w,'cerulean_water_lily',-18,-4,3,1.3);landscapeProp(w,'cerulean_water_lily',-20,12,3,1.3);}
}
const themes=[
 ['berry_forest_golden_tree','raised_round_shrub','red_flower_clump','green_path_mossy_stepping_stones','five_island_meadow_stone','berry_forest_berry_bush'],
 ['seven_island_pine_sapling','five_island_meadow_wildflower_cluster','raised_round_shrub','route3_boulder_cluster','viridian_forest_mushroom_log','lost_cave_mushroom_cluster','five_island_meadow_wildflower_patch'],
 ['cinnabar_palm_shrub','route14_shore_rock_cluster','route20_tidepool_rock','five_island_meadow_wildflower_cluster'],
 ['lost_cave_root_cluster','lost_cave_moss_rock','viridian_forest_stump','dotted_hole_rune_slab','five_island_meadow_stone'],
 ['cinnabar_palm_shrub','fuchsia_marsh_reed_cluster','route20_tidepool_rock','five_island_meadow_wildflower_cluster'],
 ['seven_island_pine_sapling','viridian_forest_mushroom_log','lost_cave_moss_rock','viridian_forest_stump','cerulean_cave_crystal','cerulean_cave_rock_pile']
];
function distanceToPath(x,z,paths){let best=Infinity;for(const line of paths)for(let i=1;i<line.length;i++){const [a,b]=line[i-1],[c,d]=line[i],dx=c-a,dz=d-b,t=Math.max(0,Math.min(1,((x-a)*dx+(z-b)*dz)/(dx*dx+dz*dz||1)));best=Math.min(best,Math.hypot(x-a-t*dx,z-b-t*dz))}return best;}
function addPlantGuest(w,index,paths){
 const species=['emolga','eevee','swablu','ralts','abra','litwick'][index];if(w.wild.some(e=>e.pokemon===species))return;
 for(let z=17;z>=-15;z-=1)for(let x=-17;x<=12;x+=1){
  if(Math.abs(x)<3||Math.abs(z-5)<2||distanceToPath(x,z,paths)<2.8||!w.canMove(x,z)||!w.canMove(x+1,z+1))continue;
  if(w.entities.some(e=>Math.hypot(e.x-x,e.z-z)<(e.portal||e.id==='route-town'?6.5:4)))continue;
  if(w.land.children.some(s=>(s.userData.occluder||s.userData.treeParts)&&s.position.z>z&&Math.abs(s.position.x-x)<s.scale.x/2+1&&s.position.z-z<s.scale.y*1.22+1.2))continue;
  const mesh=w.billboard(species+'-front',x,z,1.7,1.7),e={id:'wild',name:MON[species].name,x,z,pokemon:species,mesh,phase:index+.5,habitatPool:[species],plantGuest:true};w.entities.push(e);w.wild.push(e);
  const plant=index===5?'lost_cave_mushroom_cluster':index===2?'five_island_meadow_wildflower_patch':'berry_forest_berry_bush';
  landscapeProp(w,plant,x-.85,z-.7,2.5,1.5);landscapeProp(w,plant,x+.9,z-.8,2,1.1);return;
 }
}
export function enrichLandscape(w,index,paths=[],route=false){
 const theme=themes[index],spots=[];
 addPlantGuest(w,index,paths);
 for(let z=-15;z<=15;z+=3.8)for(let x=-16;x<=13;x+=3.8){
  const px=x+Math.sin(x*7+z+index)*.8,pz=z+Math.cos(z*3+x)*.8;
  if(!w.canMove(px,pz)||distanceToPath(px,pz,paths)<2.6)continue;
  if(w.entities.some(e=>Math.hypot(e.x-px,e.z-pz)<3.3||Math.abs(e.x-px)<3&&pz>e.z-.5&&pz-e.z<6))continue;
  if(spots.some(([x,z])=>Math.hypot(x-px,z-pz)<3.5))continue;
  const name=theme[(spots.length+index)%theme.length],tree=name.includes('tree')||name.includes('sapling'),h=tree?5:2.2;
  landscapeProp(w,name,px,pz,tree?5.5:3.5,h);spots.push([px,pz]);
  if(spots.length>=(route?24:18))return;
 }
}
