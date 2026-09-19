import {addHabitat} from './living-world.js';
import {AREAS,MON} from './data.js';
import {CONNECTIONS,townEndpoint,routeEndpoint,placeAtEntrance} from './geography.js';
import {paintRoads} from './roads.js';
import {routeGround,routeCoastalSeam,landscapeProp,enrichLandscape} from './landscape.js';

// Each link is a full outdoor map. Together with the north/south roads these
// connections create loops, rather than six maps on a single corridor.
export const ROUTES=[
 {name:'风铃公园',to:2,biome:'garden',music:'town',color:0x99bb83,npc:'npc-worker_f',person:'园丁 · 花枝',mon:'eevee',hint:'绕过中央池塘，穿过花廊就能看见通往渔港的路。',notes:['池边的脚印','花廊的铃绳','长椅上的回信'],lines:['伊布的脚印绕过水边，在长椅前停住了。它在等一个熟悉的人。','小遥把铃绳系得低了一点，让宝可梦也能触碰。风铃不再只为人响起。','“今天也谢谢你等我。”小孩把这张便条留给每天陪奶奶散步的伊布。']},
 {name:'蒲风草原',to:3,biome:'safari',music:'safari',color:0xa9bd77,npc:'trainer-brendan',person:'小悠',mon:'bulbasaur',hint:'草海分成南北两条小径；北边经过观测营地，南边绕过花田。',notes:['草叶的方向','迁徙路标','营地观察簿'],lines:['矮草朝着同一个方向伏下。宝可梦走出来的路，比人画的路更早。','小悠把旧围栏拆开一段，给迁徙中的伙伴留出了通道。','观察簿最后一页写着：今天没有收服，但终于等到它们放心吃草。']},
 {name:'潮岬山路',to:4,biome:'coast',music:'coast',color:0xb9b393,npc:'trainer-brock',person:'小刚',mon:'onix',hint:'岩壁隔出两条山路，登上北侧观景台，再沿南侧山脚绕回来。',notes:['岩层里的贝壳','避风石堆','远岸灯光'],lines:['山上的岩层里藏着贝壳。海岸曾经在这里，世界一直在慢慢改变。','小刚留下的小石堆标着安全路线。暴风雨时，陌生人的记号也能带人回家。','你从山口看见星灯街。原来绕过一座山，繁华就在海风的另一面。']},
 {name:'苔影古道',to:5,biome:'ruin',music:'forest',color:0x7e9e7c,npc:'trainer-blue',person:'小茂',mon:'abra',hint:'古道绕过倒塌的石庭。遗迹入口仍需要主线中的三枚碎片。',notes:['被树根托住的路牌','旧驿站火塘','门前的回声'],lines:['树根把倾倒的路牌托起，箭头仍然指向回家的方向。','小茂没有急着赶路。他把火塘边的枯叶清开：“总会有人需要歇脚。”','门后传来一声微弱的回应。你决定先记住这里，等伙伴准备好再来。']},
 {name:'归帆海岸',to:0,biome:'coast',music:'coast',color:0xc7c89a,npc:'npc-fat_man',person:'修船匠 · 海叔',mon:'psyduck',hint:'沿北侧沙径看潮池，也可以走南侧木栈道，最终回到青岚镇。',notes:['潮池里的小石子','栈道修补处','归航旗'],lines:['可达鸭把石子排成歪歪的一行。潮水打散后，它又耐心排了一遍。','每一块新木板都刻着不同的名字。原来回家的路，是大家一起修好的。','小遥升起一面小旗：“只要还能看见这个颜色，就知道有人在等你。”']},
 {name:'月露山庭',to:1,biome:'forest',music:'forest',color:0x8eaaa0,npc:'npc-tuber_f',person:'观星员 · 露娜',mon:'clefairy',hint:'从遗迹绕行山庭，可回到微光森林；花径两端在月露池边相会。',notes:['石阶上的花种','月露池倒影','林口的晨光'],lines:['有人把花种撒在裂开的石阶上。古老的遗迹，也能长出新的东西。','皮皮在倒影旁轻轻摇晃。你和伙伴安静坐了一会儿，没有打扰。','走出山庭时，熟悉的森林变成了另一幅模样。旅程绕了一圈，你也变得不同。']}
];
export const routeIndex=room=>/^route-[0-5]$/.test(room?.service||'')?Number(room.service.slice(-1)):-1;
export function addRouteGates(w){
 CONNECTIONS.forEach((link,i)=>{if(!link.towns.includes(w.area))return;const gate=townEndpoint(i,w.area),{x,z,side}=gate;
  const route=ROUTES[i];w.box(x+(side==='west'||side==='east'?0:2.2),z+(side==='west'||side==='east'?-2.2:0),.25,.25,1.7,0x806b4e);
  w.box(x+(side==='west'||side==='east'?0:2.2),z+(side==='west'||side==='east'?-2.2:0),1.7,.18,.6,0xe0c990,1.25);
  w.entity('route-'+i,gate.name+'行 · '+route.name,x,z,{portal:true,service:'route-'+i,labelY:2,route:i});
 });
}
export function buildRoute(w,room){
 const i=routeIndex(room),r=ROUTES[i];w.renderer.setClearColor(r.color);w.scene.fog.color.set(r.color);w.scene.fog.density=.005;
 w.routeSea=null;routeGround(w,i);
 // A ring provides two equally usable ways around the landmark and reconnects.
 const road=r.biome==='coast'?0xe1d1aa:0xccbd94;
 const paths=[];const path=points=>paths.push(points);
 const north=i===2||i===3?[[-20,5],[-12.5,5],[-12.5,-3],[-10,-8],[-7,-8],[-3,-11],[5,-11],[11,-7],[14,-3],[14,5],[20,5]]:[[-20,5],[-13,5],[-13,-4],[-9,-8],[0,-7],[8,-8],[13,-4],[13,5],[20,5]];
 if(i===5){path([[-13,5],[-13,-4],[-9,-8],[0,-7],[8,-8]]);path([[-13,5],[-11,9],[-5,10],[3,9],[9,10],[13,10]]);}
 else{path(i<4?north:north.filter(([x])=>Math.abs(x)<18));path([[-13,5],[-11,9],[-5,10],[3,9],[9,10],[13,5]]);}
 // Side pockets and landmarks break up long roads, as in Route 9/10.
 for(const [x,z] of [[-10,i===2?-11:-14],[15,12],[-6,i===2?-11:-14]]){w.flowers(x,z,6);}
 if(i===0||i===5){w.floor(0,0,15,9,0xd5d3a1,.008);w.water(0,0,14,8);w.obstacles.push({x:0,z:0,w:14,d:8});for(let x=-6;x<=6;x+=3)w.flowers(x,-11,5);w.box(2,5,3,.6,.6,0x8e7557);w.box(2,4.7,3,.15,.65,0xa48b60,.5);for(const x of [-8,8])w.flowers(x,2,5);}
 else if(i===2||i===3){w.obstacles.push({x:0,z:0,w:13,d:8});
  for(const [x,z] of [[-3,-2],[3,-2],[-2,1],[3,2]])landscapeProp(w,i===2?'mt_moon_rock_ridge_module':'lost_cave_moss_rock',x,z,i===2?13:7,i===2?6:5);
  if(i===3)landscapeProp(w,'dotted_hole_rune_slab',0,2,4,3);
  for(const x of [-5,0,5])landscapeProp(w,i===2?'route3_boulder_cluster':'viridian_forest_stump',x,3.5,4,2.6);
  if(i===2){w.water(0,-16,25,5);w.obstacles.push({x:0,z:-16,w:25,d:5});}}
 else if(i===4){
  // Offset tide pools leave a dry, walkable strip through the middle.
  for(const [x,z,width,depth] of [[-4.7,-1.5,6.4,5.3],[4.6,1.3,6,4.8]]){w.water(x,z,width,depth);w.obstacles.push({x,z,w:width,d:depth,kind:'tide-pool'});}
  path([[0,-7],[0,-2],[.3,3],[0,9]]);
  for(const [x,z] of [[-8.3,-4.5],[-7.8,2],[-2.5,-4.8],[2,-2.1],[7.9,-.8],[7.7,4.2]])landscapeProp(w,'fuchsia_marsh_reed_cluster',x,z,2.6,1.8);
  for(const [x,z] of [[-9,1.5],[-4.7,3],[4.8,-3.1],[8.8,3.8]]){landscapeProp(w,'cinnabar_palm_shrub',x,z,3,2.2);w.flowers(x,z+.6,3);}
  w.box(-3,8,5,1.8,.12,0xbba079,.045);
 }
 else{w.grass(0,0,13,8);w.flowers(-3,1,15);path([[0,-7],[0,9]]);}
 // Break up the repeated tree fence: coastal rocks, open meadow and shaded woodland.
 for(let x=i<4?-9:-19;x<=19;x+=5){
  if(i===5&&Math.abs(Math.abs(x)-13)<3)continue;
  if(i===2||i===4){landscapeProp(w,'route14_shore_rock_cluster',x,18,5,3);landscapeProp(w,'cinnabar_palm_shrub',x,-18,4,3);}
  else if(i===1){if(x%2)landscapeProp(w,'seven_island_pine_sapling',x,-18,5,6);landscapeProp(w,'five_island_meadow_wildflower_cluster',x,18,4,2);}
  else{w.tree(x,18,.7+(Math.abs(x)%3)*.1);w.tree(x,-18,.8);}
 }
 for(const x of (i<4?[19]:[-19,19]))for(const z of [-11,-2,13]){if(i===2||i===4)landscapeProp(w,'route3_boulder_cluster',x,z,5,3);else w.tree(x,z,.8);}
 w.npc(r.npc,'route-guide',r.person,3,-10,r.hint+' 帮我记录沿途三处发现吧，奖励会记入旅行手记。');
 const guide=w.land.children.findLast(s=>s.isSprite&&s.position.x===3&&s.position.z===-10);// Character height is normalized centrally from visible sprite bounds.
 const points=[[-10,-10],[10,-10],[7,11]];
 points.forEach(([x,z],n)=>{w.billboard('flowers',x,z,1.5,.9);w.entity('route-observe',r.notes[n],x,z,{route:i,point:n,labelY:1.6});});
 for(const town of CONNECTIONS[i].towns){const g=routeEndpoint(i,town);w.entity('route-town',g.name+'出口 · '+AREAS[town].name,g.x,g.z,{destination:town,route:i,labelY:1.4});if(i>=4)path([[g.x,g.z],[g.x,g.z<0?-7:i===5?10:9]]);}
 if(i===5){
  // Close the redundant eastern loop, leaving both southern town exits connected.
  for(const [x,z] of [[13,-8],[13,-4],[13,0],[13,4],[17,-10],[17,-6],[17,-2],[17,2],[17,6]])w.tree(x,z,.8);
  w.obstacles.push({x:14.7,z:-2,w:6,d:15,kind:'forest-edge'});
  for(const z of [-6,-1,4])landscapeProp(w,'raised_round_shrub',10.8,z,2.4,1.5);
 }
 // Encounters are optional and stay away from both entrances and both paths.
 for(const [x,z,id] of [[-6,13,r.mon],[6,-14,i===2?'geodude':r.mon]]){if(!MON[id])continue;w.grass(x,z,3,2);const mesh=w.billboard(id+'-front',x,z,1.7,1.7);const e={id:'wild',name:MON[id].name,x,z,pokemon:id,mesh,phase:x};w.entities.push(e);w.wild.push(e)}
 w.roomNote=r.hint+(i<4?' 西侧水岸步桥与对岸城镇相接。':'')+' · 按 E 调查路边发现，按 M 查看道路连接。';
 addHabitat(w,i,true);w.roadPaths=paths;paintRoads(w,paths,'#'+road.toString(16));routeCoastalSeam(w,i);enrichLandscape(w,i,paths,true);placeAtEntrance(w,routeEndpoint(i,w.area)||routeEndpoint(i,i));
}
