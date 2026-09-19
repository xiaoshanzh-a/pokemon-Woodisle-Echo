// Data and pure functions only. game.js remains the sole owner of state and saves.
export const TRAITS=['curious','cautious','gentle','bold'];
export const TRAIT_NAMES={curious:'好奇',cautious:'谨慎',gentle:'温柔',bold:'勇敢'};
export const DISTRICTS=[
 {name:'风铃修理庭',subtitle:'白墙、砖巷与无人签收的旧信箱',color:0xb9d0b1,music:'town'},
 {name:'树根避雨内院',subtitle:'抬高的木廊绕过旧避难坑',color:0x81a895,music:'forest'},
 {name:'雾港接力码头',subtitle:'运河两岸由中央步桥相接',color:0xb3c9ca,music:'coast'},
 {name:'迁徙观察走廊',subtitle:'湿地、施工栏与留给生命的路',color:0xacc69c,music:'safari'},
 {name:'星灯广播街区',subtitle:'砖铺广场、侧巷工坊与海堤舞台',color:0xa5b6cf,music:'arcade'},
 {name:'四响回廊',subtitle:'四座协议台围绕断裂的核心',color:0x9baeba,music:'ruin'}
];
export const CHARACTERS={
 cheyu:{name:'澈羽',partner:'litwick',sprite:'echo-apprentice',goal:'让微弱的求助也有人签收',flaw:'把音量当成被理解',relations:['oak','gubo'],early:'我把所有接收器都修好了。可有的呼叫还是没有人签收。至少新机器……应该不会漏掉吧。',late:'我把增幅旋钮拆掉了。今天的工作是挨个确认：谁已经得到帮助，谁还需要转交。'},
 gubo:{name:'顾泊',partner:'aggron',sprite:'echo-engineer',goal:'让下一场风暴中每座岛都有应急通路',flaw:'相信替所有人调度就能避免伤害',relations:['oak','may','cheyu'],early:'我负责复响署的工程。先让桥能承重，再谈该怎么连接。只是……伙伴也需要休息。',late:'桥不必永远由它撑着。今天我和年轻工程师一起检查每一处可退出的节点。'},
 qinlan:{name:'琴岚',partner:'ampharos',sprite:'echo-host',goal:'让广播成为能被回答的节目',flaw:'害怕沉默，习惯填满每一拍',relations:['may','cheyu'],early:'欢迎来到星灯广播台！别让节目冷场——等等，电龙怎么躲到音箱后了？',late:'今晚没有收听数字。电龙看我点头之后，才慢慢亮起灯。你愿意听一段不直播的排练吗？'},
 zhino:{name:'枝乃',partner:'timburr',sprite:'npc-worker_f',goal:'修好不会惊吓伙伴的风铃',flaw:'起初坚持修回原样',relations:['qinlan','cheyu'],early:'搬运小匠不是在偷铃片，它在挑哪一种声音不会刺耳。留下修补痕迹也没关系。',late:'新风铃低了一点音。每片修补处，都刻着帮忙的人和宝可梦的名字。'},
 lin:{name:'林音',partner:'vulpix',sprite:'npc-erika',goal:'让避雨棚成为自愿停留的地方',flaw:'有时把保护变成隔离',relations:['oak','aran'],early:'先别问你能做什么。看它现在在做什么。六尾只在棚边取暖，不替任何伙伴决定要不要进来。',late:'我把门闩取下了。需要的人能进来，想寻找族群的伙伴也能离开。'},
 fisher:{name:'老渔人',partner:'lapras',sprite:'npc-fisher',goal:'给远航的潮生留一个能休息的海湾',flaw:'以为撑住才是勇敢',relations:['lin','aran'],early:'那杯水不是为了把它留下，是怕它回来的时候，找不到歇脚的地方。',late:'它今天又没回来。没关系——这次它出发前，看着我点了点头。'},
 aran:{name:'阿岚',partner:'quagsire',sprite:'npc-black_belt',goal:'让自由与安全信息同时存在',flaw:'有时把尊重误解成不干预',relations:['gubo','lin'],early:'沼王给小伙伴挡风，却不追着它们走。我们也可以提供安全的路，而不要求谁留下。',late:'迁徙牌上写的是风暴方向，不是命令。伙伴们有了信息，才能自己选择。'}
};
export const OBSERVATIONS=[
 ['信箱的微弱脉冲','时间戳是七年前，接收栏却空着。伙伴把耳朵贴向箱底：脉冲后还有一声很轻的敲击。'],
 ['避雨坑的三条线索','① 大岩蛇没有追赶离开的人。② 铃声后，它护住松动的树根。③ 伙伴看向裂开的棚柱，而不是敌人。'],
 ['旧浮标的重复编号','同一救援编号出现了两次。第一条写着“继续转发”，第二条角落却有潮生送达的刻痕。'],
 ['围栏之外的脚印','幼小的脚印绕着围栏打转。施工告示写着“只封几小时”，迁徙的宝可梦却读不懂它。'],
 ['铃谱的空白一格','三次呼唤后留着空白。旧记录写“等待对岸”，后来的自动程序却把这格删去了。'],
 ['核心里的许多声音','有求助，也有已获救的回答。最小的声音不是消失了，而是从未进入中心的确认栏。']
];
export const EVIDENCE=[
 ['旧信箱底稿','中心标注“未签收”，但信封上有地方接力员手写的“已送到”。'],
 ['避雨棚名单','纸上先写着“失联”，后来补上了不同笔迹的名字。大岩蛇撑住树干时，他们已经被送走。'],
 ['潮生航路编号','潮生运送的是跨岛的人与宝可梦。它没有回到固定码头，也一直在回应。'],
 ['迁徙沿途刻痕','地方守望人用树干标记代替故障设备。救援成功了，中心却没有收到确认。']
];
export const BEHAVIORS=[
 ['quagsire','沼王',3,'慢慢沉进泥里','给更小的伙伴挡风'],['timburr','搬运小匠',4,'敲敲不同的金属','把失谐铃片放在一边'],
 ['emolga','电飞鼠',0,'轻碰断开的电线','放电前看向同伴'],['buizel','泳圈鼬',2,'沿船舷跟游','跃起后回望码头'],
 ['ampharos','电龙',4,'腹灯跟着一拍闪亮','退到音箱后休息'],['lillipup','小约克',5,'嗅一嗅旧木牌','邀请身边的人继续前行']
];
export const CASES=[
 {id:'mice',name:'轮流消失的泡沫栗鼠',area:0,steps:['两份小脚印在院门处分开了。它们不像走失。','沿砖巷查看老人门前的食盘：一只去送饭，另一只在照看家。','你替老人留下一张便条：不用担心，两个家都有人照顾。'],after:'院门边多了一只共享食盘。'},
 {id:'bell',name:'谁在半夜敲风铃',area:4,steps:['低声敲击从工坊传来，伙伴没有害怕。','枝乃让你比较两块铃片：尖锐的那片被搬运小匠单独放好。','你们把低频铃片挂回廊下。夜晚的声音不再惊醒路过的宝可梦。'],after:'工坊悬起修补过的低频风铃。'},
 {id:'ordinary',name:'今天没有任何异常',area:2,post:true,steps:['通知说码头异常，现场却有人散步、有人修船。','检查浮标：这是第一次正常的维护提醒，不是求救。','潮生从远处回望。你在手记画下平静的一天：没有危机，也值得记住。'],after:'你留下了一张正常生活的旅行速写。'}
];
export const ENDINGS={
 beacon:{name:'灯塔协议',role:'应急守望者',text:'灯塔统一处理紧急呼叫；每处节点保留退出开关。顾泊负责公开调度记录，阿岚监督紧急权限不延伸到日常。'},
 chorus:{name:'群岛合唱',role:'群岛接力员',text:'各地自主确认与转交，中心只记录协议。小遥和澈羽轮流维护低功率节点；老渔人提醒大家，慢一点也必须有人负责签收。'},
 harbor:{name:'静湾协议',role:'港湾守护人',text:'日常联络留给本地互助，只在紧急时启用公共信标。林音与阿岚保留静默区域，顾泊继续维护实体桥梁和救援物资。'}
};
export const MILESTONES=['shelter','relay','migration','overdrive','council','gubo','final'];
export function freshEcho(){return {version:4,observed:[],evidence:[],milestones:[],choices:{},jobs:{},episodes:[],cases:{},behaviors:[],replies:{},period:'day',quiet:false,salvage:false,ending:null,log:[]};}
const cleanList=(value,allowed)=>[...new Set(Array.isArray(value)?value.filter(x=>allowed.includes(x)):[])];
export function migrateEcho(raw,stage=0){
 const e=freshEcho();if(!raw||raw.version!==4){e.legacy=true;return e;}
 e.observed=cleanList(raw.observed,[0,1,2,3,4,5]);e.evidence=cleanList(raw.evidence,[0,1,2,3]);e.milestones=cleanList(raw.milestones,MILESTONES);
 const options={motivation:['strong','help','travel','hear'],forest:['calm','confront'],reserve:['join','trust','pass'],migration:['seasonal','detour','delay'],disclosure:['public','families','verify','personal'],overdrive:['silence'],gubo:['release'],final:['rest','pressure']};
 for(const [k,values] of Object.entries(options))if(values.includes(raw.choices?.[k]))e.choices[k]=raw.choices[k];
 for(const key of ['boat','power','rescue'])if(['fisher','cheyu','may'].includes(raw.jobs?.[key]))e.jobs[key]=raw.jobs[key];
 e.episodes=cleanList(raw.episodes,Object.keys(CHARACTERS));for(const c of CASES)e.cases[c.id]=Math.max(0,Math.min(3,Number.isInteger(raw.cases?.[c.id])?raw.cases[c.id]:0));
 e.behaviors=cleanList(raw.behaviors,BEHAVIORS.flatMap(b=>[b[0]+':0',b[0]+':1']));for(let i=0;i<6;i++)if(['care','relay'].includes(raw.replies?.[i]))e.replies[i]=raw.replies[i];
 e.period=['day','evening','night'].includes(raw.period)?raw.period:'day';e.quiet=!!raw.quiet;e.salvage=!!raw.salvage;e.legacy=!!raw.legacy;e.ending=Object.hasOwn(ENDINGS,raw.ending)?raw.ending:null;
 e.log=Array.isArray(raw.log)?raw.log.filter(x=>typeof x==='string').map(x=>x.slice(0,160)).slice(-60):[];return e;
}
export function endingFor(e){const score={beacon:0,chorus:0,harbor:0};if(e.choices.forest==='confront')score.beacon++;if(e.choices.reserve==='pass')score.harbor+=2;if(e.choices.reserve==='trust')score.chorus+=2;if(e.choices.reserve==='join')score.beacon++;
 if(e.choices.migration==='seasonal')score.beacon+=2;if(e.choices.migration==='detour')score.chorus+=2;if(e.choices.migration==='delay')score.harbor+=2;
 if(e.choices.disclosure==='public')score.beacon+=2;if(e.choices.disclosure==='families'||e.choices.disclosure==='personal')score.chorus+=2;if(e.choices.disclosure==='verify')score.harbor+=2;
 for(const value of Object.values(e.replies))score[value==='relay'?'chorus':'harbor']++;return ['chorus','harbor','beacon'].sort((a,b)=>score[b]-score[a])[0];
}
export function echoObjective(s){const e=s.echo,done=k=>e.milestones.includes(k);
 if(!e.choices.motivation)return {area:0,target:'echo-hub',goal:'在风铃修理庭留下出发的理由'};
 if(!done('shelter'))return s.stage>=2?{area:1,target:e.observed.includes(1)?'echo-hub':'echo-observe',goal:'调查铃绳，支好避雨棚的旧柱'}:null;
 if(!done('relay'))return s.stage>=3?{area:2,target:'echo-hub',goal:'到接力码头安排引路、供电与岸上接应'}:null;
 if(!done('migration'))return s.stage>=4?{area:3,target:'echo-hub',goal:'为施工与季节迁徙提出共存方案'}:null;
 if(!done('overdrive'))return s.stage>=5?{area:4,target:'echo-hub',goal:'到广播街区处理过响事件'}:null;
 if(e.evidence.length<4)return {area:[0,1,2,3].find(i=>!e.evidence.includes(i)),target:'echo-case',goal:'回访四地委托牌，核对七年前的原始记录'};
 if(!done('council'))return {area:5,target:'echo-hub',goal:'在四响回廊整理各地的意见'};
 if(!done('gubo'))return {area:5,target:'echo-hub',goal:'帮助顾泊让承重的伙伴停下来'};
 if(!done('final')&&s.stage===6)return {area:5,target:'echo-hub',goal:'回四响回廊签下新的协议'};return null;
}
