import {landscapeProp} from './landscape.js';
// Every guardian has a distinct, low planting/mineral arrangement. These props
// stay outside the central four-unit approach space and never block an exit.
export function dressLegendClearing(w,index,cx,cz){
 const place=(name,dx,dz,width=3,height=1.7)=>{const s=landscapeProp(w,name,cx+dx,cz+dz,width,height);s.userData.legendClearing=index;return s;};
 if(index==='xerneas'){
  w.meadowPatch(cx,cz,8,7);
  for(const [x,z]of [[-4,-2],[-3,-4],[0,-4.5],[3,-4],[4,-1],[3,3],[-4,3]])place('five_island_meadow_wildflower_patch',x,z,3.4,1.7);
  place('berry_forest_berry_bush',-4.5,.5);place('red_flower_clump',4,2,2.7,1.6);
 }else if(index==='zacian'){
  // Two weathered watch stones frame an open approach, with a blue-green hedge.
  place('five_island_meadow_stone',-3.8,1,3.8,2.1);place('five_island_meadow_stone',3.8,-1,3.2,1.9);
  for(const [x,z]of [[-3,-4],[0,-4.5],[3,-4]])place('raised_round_shrub',x,z,2.8,1.5);
  place('green_path_mossy_stepping_stones',0,4.2,4,1.3);
 }else if(index==='jirachi'){
  // Five meteor fragments mark a wish-star; golden flowers soften the clearing.
  for(let n=0;n<5;n++){const a=-Math.PI/2+n*Math.PI*2/5;place('five_island_meadow_stone',Math.cos(a)*4.2,Math.sin(a)*4.2,2.8,1.5);}
  place('five_island_meadow_wildflower_patch',-3.4,2.8,3.6,1.8);place('five_island_meadow_wildflower_patch',3.4,2.8,3.6,1.8);
 }else if(index==='rayquaza'){
  // A rising curl of moss-covered stones echoes its long coiling silhouette.
  for(let n=0;n<7;n++){const a=-2.7+n*.55,r=4+n*.16;place('green_path_mossy_stepping_stones',Math.cos(a)*r,Math.sin(a)*r,2.8,1.2);}
  place('lost_cave_moss_rock',-4,-3,3.7,2);place('seven_island_pine_sapling',-5,-5,3,3.2);
 }else if(index==='reshiram'){
  for(const [x,z]of [[-4,-2],[-2,-4],[1,-4.4],[4,-3],[4,1]])place('route3_boulder_cluster',x,z,3.5,1.9);
  place('red_flower_clump',-3.5,3,3.4,1.9);place('red_flower_clump',3.2,3.4,2.8,1.6);
  place('five_island_meadow_stone',-4,0,3,1.6);
 }else if(index==='lunala'){
  for(let n=0;n<6;n++){const a=Math.PI*.65+n*.35;place('cerulean_cave_crystal',Math.cos(a)*4.5,Math.sin(a)*4.5,2.5,1.8);}
  place('lost_cave_mushroom_cluster',3.5,-3.5,3,1.5);place('lost_cave_mushroom_cluster',4,2,2.4,1.3);
 }else if(index==='suicune'){
  for(const [x,z]of [[-4,-3],[-4,0],[-3.5,3]])place('fuchsia_marsh_reed_cluster',x,z,3.2,2);
  place('route20_tidepool_rock',3.7,-3,3.6,1.6);place('five_island_meadow_wildflower_cluster',3.7,2.5,3,1.7);
 }else if(index==='lugia'){
  // Low rocks spread like wings; the southern approach is deliberately empty.
  for(const [x,z]of [[-5,0],[-4,-2],[-2.5,-4],[2.5,-4],[4,-2],[5,0]])place('route14_shore_rock_cluster',x,z,3.4,1.6);
  place('cinnabar_palm_shrub',5,-4,2.8,1.8);
 }else if(index==='cresselia'){
  for(let n=0;n<7;n++){const a=-2.2+n*.4;place('five_island_meadow_wildflower_cluster',Math.cos(a)*4.5,Math.sin(a)*4.5,2.8,1.6);}
  place('route20_tidepool_rock',-4,1,3.2,1.7);place('fuchsia_marsh_reed_cluster',-4.3,-2,2.6,1.7);
 }
}
