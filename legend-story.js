import {LEGENDS,TRAINERS,surveyTargets} from './legend-data.js';
import {MON,AREAS} from './data.js';
import {WILDLANDS} from './wildlands.js';
export function research(a){
 const {state:s,dialog,save,sync}=a,l=s.legend;
 if(s.stage<6){dialog('远方的回应','博士仍在辨认旧日求救声。完成回响之心的主线后，再回研究所开启跨世代生态调查。');return}
 if(!l.accepted){dialog('大木博士 · 远方的回应','“我曾以为所有异象都来自那段旧录音。但林音发现新长的嫩芽，潮生听见了从未记录的翼声。过去的求救已经结束，现在来访的，是有自己意愿的伙伴。”<br><br>博士邀请你调查六区域，赠予 3 枚大师球。每轮记录三个指定区域的生态样点，回博士处提交，可再次获得 3 枚大师球。可无限重复，不消耗任何捕获道具。',[{text:'接下生态调查',fn:()=>{l.accepted=true;s.masterBalls+=3;save();sync();research(a)}},{text:'稍后再来',fn:a.closeModal}],'professor');return}
 const targets=surveyTargets(l.round),ready=targets.every(i=>l.sites.includes(i));
 const done=LEGENDS.filter(q=>s.caught.includes(q.id)).length;
 dialog('远方的回应 · 第 '+(l.round+1)+' 轮',`新伙伴 ${done} / ${LEGENDS.length} · 大师球 ${s.masterBalls}<br><br>本轮生态记录：${targets.map(i=>`${l.sites.includes(i)?'✓':'○'} ${AREAS[i].name}`).join(' / ')}<br>到指定区域寻找花丛生态样点，靠近按 E 记录。同一区域本轮只计一次。<br><br>${LEGENDS.map(q=>`${s.caught.includes(q.id)?'✓':l.met.includes(q.id)?'◇':'○'} ${MON[q.id].name}：${q.clue} · ${WILDLANDS[q.sanctuary].name}`).join('<br>')}<br><br>${done===LEGENDS.length?'博士将新记录封入旅行档案：“它们不是旧故事的奖品，而是新旅途的见证者。”':'先调查异象，再自愿挑战；大师球必定收服野生目标，不能带走训练师的伙伴。'}`,[{text:ready?'提交记录 · 大师球 +3':'继续调查',fn:()=>{if(!ready){a.closeModal();return}l.round++;l.sites=[];s.masterBalls+=3;save();sync();research(a)}},{text:'关闭手记',fn:a.closeModal}]);
}
export function legendInteraction(e,a){
 const {state:s,dialog,save,sync,closeModal,startBattle}=a;
 if(s.stage===6&&!e.portal&&['prof','lab'].includes(e.id)){
  // Finish the older road-letter conclusion before opening the new epilogue.
  if(s.surveys.length===18&&!s.relayReported)return false;
  research(a);return true;
 }
 if(e.id==='legend-survey'){
  const targets=surveyTargets(s.legend.round),i=e.surveyArea;
  if(!targets.includes(i)){dialog('生态记录','本轮关注 '+targets.map(j=>AREAS[j].name).join('、')+'。此处的样点会在后续轮次重新开放。');return true}
  const already=s.legend.sites.includes(i);if(!already)s.legend.sites.push(i);save();sync();dialog('生态记录',already?'这个区域本轮已经记录过。':`${AREAS[i].name}记录完成。你记下新脚印、植物生长和回声方向，留下完整的栖息地。<br>三个指定区域完成后，回大木博士处或打开手记提交。`);return true;
 }
 if(e.legend){const q=LEGENDS.find(q=>q.id===e.legend);if(!s.legend.met.includes(q.id))s.legend.met.push(q.id);if(!s.seen.includes(q.id))s.seen.push(q.id);save();sync();dialog(q.clue,q.story+'<br><br>循着线索，你来到'+WILDLANDS[q.sanctuary].name+'的开阔空地。它在这里停下，给双方留下足够的距离。<br><br>可用普通精灵球或大师球收服。击败、战败或离开后仍可重试，只有成功收服才结束这次相遇。',[{text:'邀请它对战',fn:()=>{closeModal();startBattle(q.id,22+q.area*2,'roaming:'+q.id,e)}},{text:'安静离开',fn:closeModal}],q.id+'-front');return true}
 const trainer=TRAINERS[e.id];
 if(trainer){dialog(e.name,trainer.line+`<br>搭档：${MON[trainer.mon].name} · Lv.${trainer.level}。这是自愿切磋，不能收服对方的伙伴。`,[{text:'接受切磋',fn:()=>{closeModal();startBattle(trainer.mon,trainer.level,'trainer:'+e.id)}},{text:'下次再战',fn:closeModal}],e.portrait);return true}
 return false;
}
