import {routeGround,landscapeProp} from './landscape.js';
import {paintRoads} from './roads.js';
import {dressLegendClearing} from './legend-clearings.js';
export const WILDLANDS=[
 {name:'风息原野',towns:[0,1],biome:'garden',color:0xa9bd87,music:'forest',theme:1,npc:'npc-worker_f',person:'迁徙记录员 · 若叶',line:'这片草甸连接小镇和森林。我只记录足迹，不在兽径上设置围栏。三处空地留给途经的伙伴。',hint:'花径连接青岚镇与微光森林。神兽调查开启后，留意三处宽阔草甸。'},
 {name:'云脊山径',towns:[1,5],biome:'ruin',color:0xa3ada6,music:'ruin',theme:5,npc:'npc-hiker',person:'山道维护员 · 岩叔',line:'弯道绕开了落石带。北边通向遗迹，三处观景台留出了足够的活动空间。',hint:'沿岩壁外侧上行，连接微光森林与回响遗迹；可从两侧绕行观景台。'},
 {name:'星汐湿地',towns:[2,4],biome:'coast',color:0xb3c7b1,music:'coast',theme:4,npc:'npc-sailor',person:'湿地巡护员 · 汐远',line:'水道之间保留了三块干燥高地。海鸟落下时，请从芦苇外绕行，给它们留出空间。',hint:'芦苇步道连接潮汐渔港与星灯街。水面不能行走，岸边有完整的绕行通路。'}
];
export const wildlandIndex=room=>/^wildland-[0-2]$/.test(room?.service||'')?Number(room.service.slice(-1)):-1;
export const LEGEND_CLEARINGS_BY_MAP=[
 [[-10,-8],[9,-9],[9,10]],
 [[-9,-5],[10,-12],[8,8]],
 [[-11,-8],[10,-4],[4,11]]
];
export const LEGEND_CLEARINGS=LEGEND_CLEARINGS_BY_MAP[0];
export function addWildlandGates(w){
 if(w.interior)return;
 WILDLANDS.forEach((r,i)=>{if(!r.towns.includes(w.area)||w.entities.some(e=>e.id==='wildland-gate-'+i))return;
  const spot=w.safeWildSpot(-16,-6+i*7,true);if(!spot)return;const [x,z]=spot;
  landscapeProp(w,i===1?'five_island_meadow_stone':'five_island_meadow_wildflower_patch',x-.9,z-.3,1.7,1);
  w.entity('wildland-gate-'+i,r.name+' · 野外通路',x,z,{portal:true,service:'wildland-'+i,returnOffset:0});
 });
}
export function buildWildland(w,room){
 const i=wildlandIndex(room),r=WILDLANDS[i];w.renderer.setClearColor(r.color);w.scene.fog.color.set(r.color);w.scene.fog.density=.003;routeGround(w,r.theme);
 // Open routes, not three repeated closed lobes around the encounters.
 const paths=i===0?[
  [[0,18],[-1,10],[1,3],[-1,-5],[0,-16]],
  [[-1,-5],[-6,-3],[-10,-5]],
  [[-1,-5],[4,-7],[9,-6]],
  [[-1,10],[4,12],[9,13]]
 ]:i===1?[
  [[0,18],[-4,12],[4,6],[-6,0],[4,-6],[-2,-12],[0,-16]],
  [[4,6],[12,3],[16,-2]],
  [[-6,0],[-14,-4],[-17,-12]],
  [[4,-6],[10,-10],[15,-14]]
 ]:[
  [[0,18],[-3,15],[-4,7],[-2,2],[-2,-5],[-5,-11],[0,-16]],
  [[-5,-11],[-11,-12],[-15,-8]],
  [[-2,-5],[2,-5],[5,-6],[9,-7],[14,-6]],
  [[-4,7],[0,7],[3,8]]
 ];
 w.roadPaths=paths;paintRoads(w,paths,i===1?'#c2b99f':i===2?'#d7ceac':'#c3d4a7',2.5);
 // Tall scenery stays on the perimeter; low planting frames three open arenas.
 for(const x of [-19,19])for(const z of [-15,-8,0,9,16]){
  if(i===1){landscapeProp(w,'route3_boulder_cluster',x,z,6.5,4.2);w.obstacles.push({x,z,w:2.4,d:3,kind:'mountain'});}
  else if(i===2)landscapeProp(w,'cinnabar_palm_shrub',x,z,3.5,2.5);
  else w.tree(x,z,.85);
 }
 const plants=i===0?['five_island_meadow_wildflower_patch','berry_forest_berry_bush','red_flower_clump']:i===1?['lost_cave_moss_rock','cerulean_cave_crystal','lost_cave_mushroom_cluster']:['fuchsia_marsh_reed_cluster','route20_tidepool_rock','five_island_meadow_wildflower_cluster'];
 const residents=[['xerneas','zacian','jirachi'],['rayquaza','reshiram','lunala'],['suicune','lugia','cresselia']][i],clearings=LEGEND_CLEARINGS_BY_MAP[i];
 clearings.forEach(([cx,cz],n)=>dressLegendClearing(w,residents[n],cx,cz));
 for(const [x,z]of [[-17,14],[-14,15],[-13,9],[-11,1],[-5,-17],[7,-17],[16,17],[18,5],[5,3],[-4,-2]]){if(clearings.some(([a,b])=>Math.hypot(a-x,b-z)<5))continue;landscapeProp(w,plants[Math.abs(Math.round(x))%3],x,z,3.2,1.7);}
 if(i===1)for(const [x,z]of [[-18,-16],[18,-16],[-18,15],[18,17]])landscapeProp(w,'seven_island_pine_sapling',x,z,4.6,5.5);
 if(i===2)for(const [x,z,ww,d] of [[-9,10,6,5],[8,0,7,3],[-8,-1,5,3]]){w.water(x,z,ww,d);w.obstacles.push({x,z,w:ww,d,kind:'wetland-water'});for(const dx of [-ww/2,ww/2])for(const dz of [-d/2,d/2])landscapeProp(w,'fuchsia_marsh_reed_cluster',x+dx,z+dz,2.8,1.9);}
 if(i===1){for(const [x,z]of [[-8,9],[-9,1],[8,0]]){landscapeProp(w,'route3_boulder_cluster',x,z,3.4,2);w.obstacles.push({x,z,w:2,d:1.5,kind:'mountain'});}}
 w.npc(r.npc,'wildland-guide',r.person,-5,14,r.line);
 for(let n=0;n<2;n++)w.entity('wildland-town-'+n,n?'前往 '+['青岚镇','微光森林','潮汐渔港','翠野保育区','星灯街','回响遗迹'][r.towns[n]]:'返回 '+['青岚镇','微光森林','潮汐渔港','翠野保育区','星灯街','回响遗迹'][r.towns[n]],0,n?-16:18,{wildlandTown:r.towns[n],wildlandGate:i});
 const north=w.area===r.towns[1];w.pos.set(0,0,north?-13:15);w.fpos.set(-.7,0,w.pos.z+.7);w.trail=[w.fpos.clone(),w.pos.clone()];w.roomNote=r.hint;
}
