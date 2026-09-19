// Postgame encounters are residents responding to the restored relay, not copies
// of the old distress signal. A saved seed keeps random clearings stable.
export const LEGEND_SPECIES=[['suicune','水君','水',245],['lugia','洛奇亚','飞行',249],['rayquaza','烈空坐','龙',384],['cresselia','克雷色利亚','超能',488],['reshiram','莱希拉姆','火',643],['xerneas','哲尔尼亚斯','妖精',716],['lunala','露奈雅拉','幽灵',792],['zacian','苍响','妖精',888],['jirachi','基拉祈','钢',385]];
export const LEGENDS=[
 {id:'suicune',sanctuary:2,area:2,color:0x7ee9ff,motion:'tide',clue:'潮池里的水纹逆着风散开',story:'潮生以为旧浮标又在求救。水君却走向新修好的潮池：它回应的是如今洁净的水，而不是七年前的录音。'},
 {id:'lugia',sanctuary:2,area:4,route:true,color:0xb2d9ff,motion:'wing',clue:'归帆海岸响起低沉的翼声',story:'海叔拆下多余的围网，让海风重新穿过双湖。洛奇亚顺着归航旗而来，收拢翅膀，静静等待你靠近。'},
 {id:'rayquaza',sanctuary:1,area:5,color:0x98ed9c,motion:'spiral',clue:'遗迹上空出现翡翠色气流',story:'遗迹向天空送出完整的回答。烈空坐降下来确认云层里的扰动已经平息；它不属于晶体，也不听命于博士。'},
 {id:'cresselia',sanctuary:2,area:5,route:true,color:0xffbfe9,motion:'moon',clue:'月露山庭的倒影多了一弯月',story:'露娜发现皮皮不再惊醒。克雷色利亚沿着新开的花径而来，把旧日噩梦留在已经结束的故事里。'},
 {id:'reshiram',sanctuary:1,area:4,color:0xffbf80,motion:'flame',clue:'星灯街广播旁出现温暖白焰',story:'乐手播放了当年未经剪接的求救声，也播放了今天的回答。莱希拉姆被这份坦诚吸引，白焰没有烧伤一片草叶。'},
 {id:'xerneas',sanctuary:0,area:1,route:true,color:0xf5c9ff,motion:'bloom',clue:'蒲风草原枯枝一夜抽出新芽',story:'阿岚拆开了迁徙围栏。哲尔尼亚斯沿旧兽径来到保育区外的蒲风草原，停在被保护的嫩芽旁；先守护栖息地，才有资格邀请它同行。'},
 {id:'lunala',sanctuary:1,area:1,color:0xb5a0ff,motion:'moon',clue:'林间出现一束不灼热的月光',story:'林音把避雨棚重新留给过路的人。露奈雅拉在棚外舒展双翼，照亮夜行伙伴回家的路。'},
 {id:'zacian',sanctuary:0,area:0,color:0x87dcf8,motion:'dash',clue:'青岚镇外留下闪亮的足迹',story:'小蓝给过路伙伴留下水与树果。苍响沿接力路线来到小镇，它守望的是愿意彼此保护的人，而非最强的训练家。'},
 {id:'jirachi',sanctuary:0,area:0,color:0xffe692,motion:'star',clue:'风息原野落下一颗金色星光',story:'小蓝把大家写给明天的愿望系在风铃旁。没有人请求重来一次，只希望每个旅人都能平安回家。基拉祈在花地的陨石碎片上醒来，轻轻触碰写着你名字的纸签。'}
];
export const TRAINERS={
 'npc-boy':{mon:'rattata',level:8,line:'短裤跑起来方便！和我的小拉达试试速度吧。'},
 'npc-bug':{mon:'scyther',level:12,line:'我每天观察虫宝可梦的步伐。想和飞天螳螂练习吗？'},
 'npc-hiker':{mon:'onix',level:14,line:'大岩蛇陪我巡山，也陪我清理落石。来一场切磋？'},
 'npc-sailor':{mon:'lapras',level:15,line:'拉普拉斯是我的救援搭档。我们在岸上练习配合，绝不把海上的乘客当练习对象。'},
 'npc-rich':{mon:'eevee',level:16,line:'伊布不是奖品，是我的搭档。让我展示最近练习的成果吧。'},
 'npc-guide':{mon:'aggron',level:20,line:'波士可多拉守着遗迹通道。这里有一场自愿的联盟练习赛。'}
};
export const freshLegend=()=>({accepted:false,seed:Math.floor(Math.random()*0x7fffffff),round:0,sites:[],met:[],wins:[]});
export function migrateLegend(raw){const s=freshLegend();if(!raw)return s;s.accepted=raw.accepted===true;s.seed=Number.isInteger(raw.seed)&&raw.seed>=0?raw.seed:s.seed;s.round=Number.isInteger(raw.round)&&raw.round>=0?Math.min(raw.round,100000):0;for(const key of ['sites','met','wins'])s[key]=[...new Set((Array.isArray(raw[key])?raw[key]:[]).filter(x=>key==='sites'?Number.isInteger(x)&&x>=0&&x<6:key==='met'?LEGENDS.some(l=>l.id===x):Object.hasOwn(TRAINERS,x)))];return s;}
export const surveyTargets=round=>[round%6,(round+2)%6,(round+4)%6];
