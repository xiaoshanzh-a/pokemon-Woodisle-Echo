import * as T from './vendor/three.module.js';
import {LEGENDS} from './legend-data.js';
import {MON} from './data.js';
import {wildlandIndex,LEGEND_CLEARINGS_BY_MAP} from './wildlands.js';
export function ensureLegends(w,state){
 w.legendProgress=state.legend;
 if(state.stage<6||!state.legend.accepted)return;
 const sanctuary=wildlandIndex(w.interior);
 if(w.interior&&sanctuary<0)return;
 const area=w.area;
 if(!w.interior&&!w.entities.some(e=>e.id==='legend-survey')){const spot=w.safeWildSpot(-9,11);if(spot){const [x,z]=spot;w.billboard('flowers',x,z,1.6,1);w.entity('legend-survey','回响生态样点 · 记录',x,z,{surveyArea:area});}}
 if(sanctuary<0)return;
 for(const [n,q] of LEGENDS.filter(q=>q.sanctuary===sanctuary).entries()){
  if(state.caught.includes(q.id)||w.entities.some(e=>e.legend===q.id))continue;
  const hash=(state.legend.seed+q.id.length*7919+q.area*3571)>>>0;
  const [cx,cz]=LEGEND_CLEARINGS_BY_MAP[sanctuary][n],jitter=[(hash%5-2)*.4,((hash>>>5)%5-2)*.4];
  const spot=[[cx+jitter[0],cz+jitter[1]],[cx,cz]].find(([x,z])=>w.canMove(x,z)&&w.canMove(x,z+1));if(!spot)continue;
  const [x,z]=spot,mesh=w.billboard(q.id+'-front',x,z,3.1,3.1);
  const e=w.entity('legend-encounter',MON[q.id].name+' · 调查异象',x,z,{legend:q.id,mesh,legendSpec:q,labelY:3.4,born:w.time});
  e.baseY=mesh.position.y;e.effects=[];
  const ring=new T.Mesh(new T.RingGeometry(.9,1.04,40),new T.MeshBasicMaterial({color:q.color,transparent:true,opacity:.3,side:T.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.08,z);w.land.add(ring);e.effects.push(ring);
  for(let i=0;i<9;i++){const p=new T.Mesh(new T.OctahedronGeometry(.07),new T.MeshBasicMaterial({color:q.color,transparent:true,opacity:.65,depthWrite:false}));w.land.add(p);e.effects.push(p)}
 }
}
export function animateLegends(w){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 for(const e of w.entities.filter(e=>e.legend)){
  const t=w.time,age=t-e.born,q=e.legendSpec;
  const near=Math.hypot(w.pos.x-e.x,w.pos.z-e.z)<10;
  // Soft local light: no screen-wide flashing and no particles across the HUD.
  const float=['wing','moon','spiral'].includes(q.motion);
  e.mesh.position.y=e.baseY+(reduced?0:Math.sin(t*(float?1.4:2.5))*(float?.3:.07));
  e.mesh.material.opacity=reduced?1:Math.min(1,age*1.6+.15);
  e.effects.forEach((p,i)=>{p.visible=near;if(i===0){p.scale.setScalar(reduced?1:1+Math.sin(t*1.7)*.12);return}const a=i/9*Math.PI*2+t*(q.motion==='spiral'?1.3:.35),r=q.motion==='bloom'?1.7:1.25;p.position.set(e.x+Math.cos(a)*r,.3+(q.motion==='tide'?.06:(i*.27+t*.35)%2.5),e.z+Math.sin(a)*r);});
 }
}
export function dismissLegend(w,e){if(!e)return;e.mesh.visible=false;for(const p of e.effects||[])p.visible=false;w.entities=w.entities.filter(v=>v!==e);e.label?.remove();}
