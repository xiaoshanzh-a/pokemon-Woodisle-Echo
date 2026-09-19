// Furniture footprints describe visible floor occupancy, including table edges.
export function furnishRoom(w,service,r){
 const furniture=(name,x,z,width,height,depth=1.7)=>{const s=w.billboard(name,x,z,width,height);s.userData.occluder=true;s.userData.furniture=true;w.obstacles.push({x,z:z-.35,w:width*.9,d:depth,kind:'furniture'});return s;};
 const art=(name,...args)=>furniture('furnishing-'+name,...args);
 const notice=(id,name,x,z,line)=>w.entity(id,name,x,z,{labelY:1.5,line});
 let staffX=0,staffZ=-4.9,serviceX=0,serviceZ=-1.55;
 const counter=['shop','heal','ranger','arcade'].includes(service);
 if(counter){w.box(0,-3.5,5,1.2,.78,r.accent);w.box(0,-3.5,5.3,1.4,.12,0xf8edcc,.78);w.obstacles.push({x:0,z:-3.7,w:5.4,d:2.2,kind:'counter'});}
 if(service==='home'){
  art('celadon_hotel_bed',-5.7,-4.8,4,3.9,2.5);art('celadon_condominiums_bookshelf',5.9,-5.5,3.2,3.6);
  art('celadon_restaurant_table',-4.7,1,2.8,2,2);art('celadon_restaurant_chair',-7,1.2,1.3,1.8);art('celadon_restaurant_chair',-2.5,1.2,1.3,1.8);
  staffX=-2.1;staffZ=-3.2;serviceX=-2.1;serviceZ=-1.9;
  w.npc('npc-old_man_1','room-grandfather','整理旧信的老人',4,-1,'七年前的风暴里，每间亮灯的屋子都收留过旅人。桌上的旧信，记着他们后来平安到家的消息。');
  w.npc('npc-little_girl','room-child','画地图的孩子',-4,4.8,'我给每一位回家的训练家画一片叶子。你下次来时，能告诉我山洞另一边是什么样的吗？');
 }else if(service==='lab'){
  art('cinnabar_lab_microscope_station',-6,-4.4,3.6,3.5);art('cinnabar_lab_experiment_tank',6,-5,3.1,4.1,2);
  art('lab_bench_computer',0,-6.3,3.5,2.7);art('lab_red_dome_apparatus',5,1,2.8,2.5,2);
  staffX=0;staffZ=-2.6;serviceZ=-1.2;
  w.npc('npc-scientist','npc-lab-aide','生态研究员',-5,-.6,'显微镜下，每片叶子都留着不同的孢子。森屿各处的植物，是追踪宝可梦迁徙的线索。');
  w.npc('echo-engineer','room-lab-engineer','对战装置工程师',-4,4.6,'这里的模拟装置记录属性反应。训练时先观察对手，再选择招式；机器记录的数字，替代不了你与伙伴的默契。');
  notice('lab-simulator','属性对战模拟装置',4,3,'模拟记录：火克制草，草克制水，水克制火。装置供观察研究，不会扣除伙伴体力。');
 }else if(service==='heal'){
  w.box(0,-6.1,4.8,1.4,1.2,0xdadfcf);w.box(0,-6.1,5,1.5,.15,0xbc6d73,1.2);w.obstacles.push({x:0,z:-6.1,w:5,d:1.5,kind:'healing-console'});art('cinnabar_lab_experiment_tank',-6,-5,3.1,3.5,2);art('lab_red_dome_apparatus',6,-5,3.2,2.6);
  art('vermilion_center_waiting_bench',-5.8,1.2,3.8,1.9);
  w.npc('npc-gentleman','npc-center-guest','等候恢复的训练家',-4,4.6,'先让伙伴在恢复舱里休息，再出发吧。右边的电脑可以整理同行队伍。');
 }else if(service==='ranger'){
  art('safari_zone_checkin_console',-6,-5,3.5,2.8);art('ss_anne_captains_wall_map',6,-6.7,3.5,2.4,1);
  furniture('room-shelf',6,-3.5,3,2.5);art('cinnabar_lab_sample_tube_rack',-6,1,2.7,2.1);
  w.npc('npc-worker_f','room-ranger','巡护队记录员',-4,4.5,'保育区里先投喂，再接近。把恢复健康的伙伴留在原来的栖息地，也是很好的相遇。');
 }else if(service==='pet'||service==='berry'){
  art('celadon_restaurant_table',-5,-3.8,3.4,2.4,2.2);furniture(service==='berry'?'room-shelf':'room-sofa',5,-5,3.6,2.8);
  staffX=0;staffZ=-3;serviceZ=-1.6;
  w.npc('npc-lass','room-playmate','照顾伙伴的女孩',4,4.5,'我把树果分成小块，伙伴就会慢慢靠近。它们喜欢的游戏也不完全一样。');
 }else{
  furniture(r.prop,-5.7,-4.8,3.7,3.1);furniture(r.prop,5.7,-4.8,3.7,3.1);
 }
 if(service==='heal'){furniture('room-pc',6,3,2.1,2.2);w.entity('pc','电脑 · 队伍与后备盒',6,4.4,{labelY:1.8});}
 // Furnish the former computer corner according to the building's purpose.
 if(service==='home'){art('celadon_condominiums_bookshelf',6,2.8,2.5,2.6);notice('home-shelf','旅行相册',6,4.3,'相册里夹着一张孩子画的路线图：森林的风铃、港口的船灯，还有山洞另一头的花。每一页都写着同一句话：记得平安回来。');}
 if(service==='shop'){art('cinnabar_lab_sample_tube_rack',6,2.6,2.5,2);notice('shop-stock','补给陈列架',6,4.1,'柜台旁备好了伤药、树果和精灵球。购买补给请找前面的店员。');}
 if(service==='ranger'){art('celadon_condominiums_bookshelf',6,2.7,2.8,2.8);notice('ranger-records','迁徙观察簿',6,4.2,'观察员用树叶夹住今天的一页：靠近植物时先停一停，稀有的伙伴有时就藏在花丛旁。');}
 if(service==='berry'){art('celadon_restaurant_chair',-7,-3.5,1.2,1.6);art('cinnabar_lab_sample_tube_rack',6,2.5,2.5,1.9);notice('berry-jars','树果调配台',6,4,'小瓶按甜、酸、涩排列着。婆婆说：照顾伙伴要记住它喜欢的味道，不只是记住它会什么招式。');}
 if(service==='pet'){art('celadon_restaurant_chair',-7,-3.5,1.2,1.6);furniture('room-sofa',6,2.3,3,1.8);notice('pet-rest','伙伴休息角',6,4,'玩累了就歇一会儿。训练家和伙伴都需要有不赶路的时光。');}
 if(service==='arcade'){art('celadon_restaurant_table',6,2.5,2.5,1.8);notice('arcade-lounge','赛后交流桌',6,4,'桌边留着常客的留言：输赢之外，也别错过朋友为你打的那一拍。');}
 if(service==='lab')notice('research-terminal','科研终端 · 栖息地记录',0,-4.8,'终端记录着森林、海岸与遗迹的生态差异。沿途观察植物旁的宝可梦，能帮助研究员补全森屿的栖息地地图。');
 if(service==='shop'||service==='arcade')furniture('room-sofa',-6,2,3,1.5);
 if(service==='shop')w.npc('npc-woman_1','npc-shopper','挑选补给的顾客',-3.5,4.5,'精灵球、伤药、树果都要带一点。');
 if(service==='arcade'){furniture('room-arcade',-5,0,2.1,2.5);w.entity('slots','幸运转轮',-5,1.6,{labelY:2});w.entity('prizes','奖品兑换',5,-1.8,{labelY:2});w.npc('npc-rocker','npc-arcade-fan','转轮常客',2.7,3.5,'别只盯着灯，听节拍也很重要。');}
 if(service==='pet'||service==='berry')w.entity('pet','与伙伴玩耍',-5,3.6,{labelY:1.8});
 return {staffX,staffZ,serviceX,serviceZ};
}
