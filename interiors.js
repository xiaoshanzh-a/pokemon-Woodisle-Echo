import {furnishRoom} from './room-layout.js';
import {roomSurface} from './surface-art.js';
import {buildCave} from './exploration.js'; import {SphereGeometry,MeshBasicMaterial} from './vendor/three.module.js';
// All exterior buildings use the same portal contract, with distinct furnishing
// and service stations. Coordinates are room-local; the return point is exterior.
export const ROOMS={
 home:{color:0xdfcfaa,accent:0x7097aa,service:'home',staff:'家的休息区',prop:'room-bed',note:'和家人交谈，休息后再出发。队伍存取电脑位于宝可梦中心。'},
 heal:{color:0xe1e7df,accent:0xd8737a,service:'heal',staff:'乔伊 · 恢复全队',prop:'room-healer',note:'走到乔伊面前按 E，免费恢复全队；右侧电脑可管理后备盒。'},
 shop:{color:0xd7e3df,accent:0x619aac,service:'shop',staff:'店员 · 购买补给',prop:'room-shelf',note:'柜台前按 E 购买精灵球、伤药和树果。'},
 lab:{color:0xdde1c9,accent:0x80a07b,service:'lab',staff:'大木博士',prop:'room-pc',note:'研究台前按 E，与博士交谈或领取最初的伙伴。'},
 berry:{color:0xe7d7b8,accent:0xa3b56f,service:'berry',staff:'树果婆婆',prop:'room-shelf',note:'向树果婆婆领取补给，空闲时可以在这里照顾伙伴。'},
 ranger:{color:0xd6dec2,accent:0x829965,service:'ranger',staff:'保育员 · 阿岚',prop:'room-shelf',note:'向保育员购买精灵球，了解温柔收服的规则。'},
 pet:{color:0xe9dcc8,accent:0xb69a78,service:'pet',staff:'伙伴互动区',prop:'room-sofa',note:'与伙伴喂食、玩耍，完成心跳节拍挑战。'},
 arcade:{color:0xd8d3df,accent:0x927eaf,service:'arcade',staff:'娱乐城接待员',prop:'room-arcade',note:'左侧转轮、右侧奖品柜台，中央可参加伙伴节奏挑战。'}
};

export function buildInterior(w,portal){
 if(['cave','grotto'].includes(portal.service)){buildCave(w,portal);return}const r=ROOMS[portal.service]||ROOMS.home;
 w.renderer.setClearColor(0x344c46);w.scene.fog.density=0;
 w.floor(0,0,19,17,r.color);
 roomSurface(w);
 w.box(0,-8,19,.35,4.5,0xf1eddc);w.box(-9.4,0,.3,16,2.3,0xcecfbd);w.box(9.4,0,.3,16,2.3,0xcecfbd);
 w.box(0,-7.76,18.5,.05,.45,r.accent,1.5);
 for(const x of [-6,6]){w.box(x,-7.7,2.4,.07,1.7,0x83b9c3,2);w.box(x,-7.6,2.6,.16,.1,0xfff8da,1.96)}
 
 
 const {staffX,staffZ,serviceX,serviceZ}=furnishRoom(w,portal.service,r);
 let staff=portal.service==='lab'?'professor':portal.service==='heal'?'room-nurse':portal.service==='shop'?'room-clerk':portal.service==='ranger'?'npc-black_belt':portal.service==='arcade'?'npc-rich_boy':portal.service==='berry'?'npc-old_woman':portal.service==='pet'?'npc-daisy':'npc-mom';
 if(w.districtReturn){const names={0:['npc-man','npc-woman_3'],1:['npc-old_woman','npc-old_woman'],2:['npc-worker_m','npc-clerk'],4:['npc-woman_2','npc-youngster']};staff=names[w.area]?.[portal.name.includes('东屋')?1:0]||'npc-man';}
 const attendant=w.billboard(staff,staffX,staffZ,1.95,3.25);attendant.material.depthTest=false;attendant.renderOrder=2;
 if(portal.service==='heal'){

  w.healLights=[];for(let i=0;i<6;i++){const ball=w.mesh(new SphereGeometry(.2,12,8),0xfad9db,-1.5+i*.6,1.58,-6.1);ball.material.dispose();ball.material=new MeshBasicMaterial({color:0xffd7de});w.healLights.push(ball)}
 }
 w.entity(r.service,r.staff,serviceX,serviceZ,{labelY:3.7,labelZ:staffZ,actor:attendant,fixedActor:true});
 w.entity('exit','离开 · '+portal.name,0,7,{labelY:.6});
 w.pos.set(0,0,5.5);w.fpos.set(-.7,0,6.3);w.playerDir=1;w.facingRight=false;w.look.set(0,0,0);
 w.trail=[w.fpos.clone(),w.pos.clone()];w.roomNote=r.note;
}
