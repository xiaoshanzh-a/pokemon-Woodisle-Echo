import {EXTRA_SPECIES,LEVEL_EVOLUTIONS} from './evolution.js';
import {LEGEND_SPECIES} from './legend-data.js'; import {CHAPTERS} from './story.js'; export const DEX = [
['bulbasaur','妙蛙种子','草',1],['ivysaur','妙蛙草','草',2],['venusaur','妙蛙花','草',3],['charmander','小火龙','火',4],['charmeleon','火恐龙','火',5],['charizard','喷火龙','火',6],['squirtle','杰尼龟','水',7],['wartortle','卡咪龟','水',8],['blastoise','水箭龟','水',9],['caterpie','绿毛虫','虫',10],['weedle','独角虫','虫',13],['pidgey','波波','飞行',16],['rattata','小拉达','一般',19],['pikachu','皮卡丘','电',25],['raichu','雷丘','电',26],['nidoran_f','尼多兰','毒',29],['nidoran_m','尼多朗','毒',32],['clefairy','皮皮','妖精',35],['vulpix','六尾','火',37],['psyduck','可达鸭','水',54],['growlithe','卡蒂狗','火',58],['abra','凯西','超能',63],['gastly','鬼斯','幽灵',92],['onix','大岩蛇','岩石',95],['chansey','吉利蛋','一般',113],['kangaskhan','袋兽','一般',115],['scyther','飞天螳螂','虫',123],['tauros','肯泰罗','一般',128],['magikarp','鲤鱼王','水',129],['gyarados','暴鲤龙','水',130],['lapras','拉普拉斯','水',131],['eevee','伊布','一般',133],['vaporeon','水伊布','水',134],['jolteon','雷伊布','电',135],['flareon','火伊布','火',136],['snorlax','卡比兽','一般',143],['articuno','急冻鸟','冰',144],['zapdos','闪电鸟','电',145],['moltres','火焰鸟','火',146],['dratini','迷你龙','龙',147],['mewtwo','超梦','超能',150],['mew','梦幻','超能',151],
['litwick','烛光灵','幽灵',607],['chandelure','水晶灯火灵','幽灵',609],['aggron','波士可多拉','钢',306],['ampharos','电龙','电',181],['quagsire','沼王','水',195],['timburr','搬运小匠','格斗',532],['emolga','电飞鼠','电',587],['buizel','泳圈鼬','水',418],['lillipup','小约克','一般',506],['minccino','泡沫栗鼠','一般',572],['ralts','拉鲁拉丝','超能',280],['swablu','青绵鸟','飞行',333],['aron','可可多拉','钢',304]
,...LEGEND_SPECIES,...EXTRA_SPECIES].map(([id,name,type,no])=>({id,name,type,no}));
export const MON = Object.fromEntries(DEX.map(m=>[m.id,m]));
export const AREAS = [
{id:'town',name:'青岚镇',en:'QINGLAN TOWN',sub:'旅程开始的地方',icon:'⌂',color:0x9bb873,description:'大木研究所 · 宝可梦中心',wild:['pidgey','rattata','eevee'],hint:'沿着小路，去见见大木博士吧。'},
{id:'forest',name:'微光森林',en:'GLIMMERWOOD',sub:'每一片树叶都有回声',icon:'♧',color:0x80a572,description:'森林守望者 · 秘密草丛',wild:['caterpie','weedle','bulbasaur','pikachu','vulpix','abra'],hint:'林间的草丛正在沙沙作响。'},
{id:'coast',name:'潮汐渔港',en:'TIDEBLOOM HARBOR',sub:'风与潮水相遇的地方',icon:'≈',color:0xbdc68c,description:'海边钓场 · 岸边疗愈',wild:['squirtle','psyduck','lapras','magikarp'],hint:'在木栈桥边按 E，试试今天的手气。'},
{id:'safari',name:'翠野保育区',en:'VERDANT SANCTUARY',sub:'与野生宝可梦保持一份温柔',icon:'♧',color:0x9fb974,description:'自由狩猎 · 珍稀宝可梦',wild:['scyther','kangaskhan','tauros','chansey','nidoran_f','nidoran_m','dratini'],hint:'这里可以投饵和投球，不能攻击野生宝可梦。'},
{id:'arcade',name:'星灯街',en:'STARLIT PROMENADE',sub:'夜色中的一点小幸运',icon:'✧',color:0x9aab9b,description:'星灯娱乐城 · 伙伴挑战',wild:['eevee','clefairy','growlithe','gastly'],hint:'街角的娱乐城，总有惊喜在等着你。'},
{id:'summit',name:'回响遗迹',en:'ECHO SANCTUM',sub:'让岛屿再次听见心跳',icon:'◇',color:0x91a99a,description:'三枚回响碎片 · 最终试炼',wild:['onix','snorlax','dratini','abra'],hint:'伙伴的信任，是唤醒遗迹的钥匙。'}
];
// Baby/pre-evolution forms also occur naturally, so every added family is collectible.
[['pichu','munchlax'],['mareep','cleffa'],['wooper'],['happiny'],[],[]].forEach((ids,i)=>AREAS[i].wild.push(...ids));
export const QUESTS=[
{title:'风捎来的邀请',text:'大木博士在青岚镇等你。最近，群岛上的宝可梦似乎听见了同一种神秘的声音。',goal:'与大木博士交谈',area:0,target:'prof',speaker:'大木博士',dialog:'你来得正好！森屿曾有一颗「回响之心」，让人类与宝可梦听见彼此。它如今碎成了三片。森林里的守望者发现了线索，带着你的伙伴去找她吧。别急着变强，先学会倾听。'},
{title:'森林里的求救声',text:'微光森林的守望者正照顾一只受惊的妙蛙种子。帮助她，让森林恢复平静。',goal:'寻找森林守望者',area:1,target:'warden',speaker:'守望者 · 林音',dialog:'一只大岩蛇受到了回响的影响，挡住了林间小路。请和伙伴一起让它冷静下来。用属性招式会更有效，我会先帮你恢复体力。'},
{title:'潮水写下的答案',text:'第一片回响在掌心微微发亮。渔港老人说，潮汐带回了另一片失落的记忆。',goal:'在潮汐渔港成功钓鱼',area:2,target:'fish',speaker:'老渔人',dialog:'海里有很多故事。看见游标进入绿色区域时收竿，别着急。钓起一位新朋友，也许能找到你要的东西。'},
{title:'不必用战斗证明',text:'保育区的管理员守护着第三枚碎片。用温柔靠近野生宝可梦，让它愿意与你同行。',goal:'在保育区成功收服一次',area:3,target:'ranger',speaker:'保育员 · 阿岚',dialog:'在这里，信任比力量重要。给它一点树果，再轻轻投球。成功结识一位伙伴，我就把最后一片回响交给你。'},
{title:'伙伴心中的节拍',text:'三片回响还没有共鸣。星灯街的朋友告诉你，和伙伴一起完成节奏游戏，可以唤醒它们。',goal:'完成一次伙伴节奏挑战',area:4,target:'arcade',speaker:'星灯店长',dialog:'回响之心需要的不是胜利，而是你们共同的节拍。在伙伴互动里完成一次节奏挑战，再去遗迹吧。这里的小游戏，也欢迎你随时来玩。'},
{title:'回应世界的心跳',text:'三枚碎片终于开始共鸣。前往回响遗迹，与守护者完成最后的试炼。',goal:'在遗迹挑战回响守护者',area:5,target:'guardian',speaker:'回响守护者',dialog:'你学会了探索、等待、温柔与信任。最后，请让我看看你与伙伴一起走过的路。无论胜负，这份羁绊都不会消失。'},
{title:'每一次相遇，都是回响',text:'岛屿重新听见了彼此的心跳。你已经完成主线，但和伙伴的旅程，才刚刚开始。',goal:'自由探索，完成你的图鉴',area:0,target:'prof',speaker:'大木博士',dialog:'回响之心已经苏醒。谢谢你！这趟旅程没有真正的终点。森林、海风和每一位新朋友，都还在等你。'}
];
QUESTS.forEach((q,i)=>Object.assign(q,CHAPTERS[i]));export const EVOLVE=LEVEL_EVOLUTIONS;
export const MOVES={钢:['金属爪','铁头'],格斗:['碎岩','劈瓦'],草:['藤鞭','飞叶快刀'],火:['火花','火焰轮'],水:['水枪','泡沫光线'],电:['电击','十万伏特'],虫:['虫咬','飞弹针'],飞行:['起风','翅膀攻击'],一般:['撞击','电光一闪'],毒:['毒针','毒液冲击'],妖精:['妖精之风','魅惑之声'],超能:['念力','精神冲击'],幽灵:['舌舔','暗影球'],岩石:['落石','岩石封锁'],龙:['龙息','龙之怒'],冰:['细雪','冰冻光束']};
export function effectiveness(a,b){const chart={钢:{岩石:2,冰:2,妖精:2,火:.5,水:.5,电:.5,钢:.5},格斗:{一般:2,岩石:2,冰:2,钢:2,幽灵:0,飞行:.5,超能:.5,妖精:.5},电:{水:2,飞行:2,草:.5,电:.5,岩石:.5},草:{水:2,岩石:2,火:.5,草:.5,虫:.5,飞行:.5},火:{草:2,虫:2,冰:2,水:.5,岩石:.5,火:.5},水:{火:2,岩石:2,水:.5,草:.5},虫:{草:2,超能:2,火:.5,飞行:.5},飞行:{虫:2,草:2,电:.5,岩石:.5},岩石:{飞行:2,火:2,虫:2},超能:{毒:2,超能:.5},幽灵:{超能:2,一般:0},一般:{幽灵:0,岩石:.5},妖精:{龙:2},龙:{龙:2,妖精:0},冰:{草:2,飞行:2,龙:2,火:.5,水:.5}};return chart[a]?.[b]??1;}
