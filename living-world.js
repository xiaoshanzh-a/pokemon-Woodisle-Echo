import {MON} from './data.js';
// Named people keep one identity; incidental residents have distinct local sprites.
export const RESIDENT_SPRITES={
 'npc-ranger-field':'npc-worker_m','npc-observer':'npc-woman_2',
 'npc-fisher-extra':'npc-swimmer_m_land','npc-researcher':'npc-celio',
 'warden':'npc-erika','fisher':'npc-old_man_1','safari-help':'npc-black_belt'
};
export const HABITATS=[
 ['eevee','ralts','swablu'],['ralts','swablu','litwick'],['buizel','lapras','dratini'],
 ['quagsire','chansey','scyther'],['minccino','emolga','growlithe'],['aron','chandelure','abra']
];
export function addHabitat(w,index,route=false){
 const pool=HABITATS[index];
 for(let n=0;n<pool.length;n++){
  const id=pool[n];if(w.wild.some(e=>e.pokemon===id))continue;
  let spot;
  if(!route)spot=w.safeWildSpot([-10,9,-6][n],[-12,12,0][n]);
  else{const candidates=[[-7,14],[8,-14],[10,0],[-9,0],[4,14]];spot=candidates.find(([x,z])=>w.canMove(x,z)&&w.canMove(x+.7,z+.7)&&!w.entities.some(e=>Math.hypot(x-e.x,z-e.z)<4)&&(!w.routeSea||x>w.routeSea.shore+2));}
  if(!spot)continue;const [x,z]=spot,mesh=w.billboard(id+'-front',x,z,1.9,1.9);
  const e={id:'wild',name:MON[id].name,x,z,pokemon:id,mesh,phase:n*2+index,habitatPool:pool};w.entities.push(e);w.wild.push(e);
 }
}
export function animateWild(w,dt){
 for(const e of w.wild){
  e.home??={x:e.x,z:e.z};e.pauseUntil??=w.time+1+(e.phase||0)%3;
  if(w.paused||w.navigationEntity===e||Math.hypot(w.pos.x-e.x,w.pos.z-e.z)<2.5){e.mesh.position.y=.03+Math.sin(w.time*2+(e.phase||0))*.04;continue;}
  const allowed=(x,z)=>w.canMove(x,z)&&!w.entities.some(t=>t!==e&&t.id!=='wild'&&Math.hypot(t.x-x,t.z-z)<(t.portal||t.id==='route-town'?5:2.6))&&!w.wild.some(t=>t!==e&&Math.hypot(t.x-x,t.z-z)<1.3);
  if(!e.wanderTarget&&w.time>e.pauseUntil){e.wanderStep=(e.wanderStep||0)+1;const angle=e.wanderStep*2.399+(e.phase||0),x=e.home.x+Math.cos(angle)*.95,z=e.home.z+Math.sin(angle)*.95;if(allowed(x,z))e.wanderTarget={x,z};else e.pauseUntil=w.time+1.2;}
  if(e.wanderTarget){const dx=e.wanderTarget.x-e.x,dz=e.wanderTarget.z-e.z,d=Math.hypot(dx,dz),step=Math.min(d,dt*.65),x=e.x+dx/(d||1)*step,z=e.z+dz/(d||1)*step;
   if(allowed(x,z)){e.x=x;e.z=z;e.mesh.position.x=x;e.mesh.position.z=z;e.mesh.material.rotation=Math.sin(w.time*9+(e.phase||0))*.035;const sh=e.mesh.userData.shadow;if(sh){sh.position.x=x;sh.position.z=z}}
   else{e.wanderTarget=null;e.pauseUntil=w.time+1.5;}
   if(d<.06){e.wanderTarget=null;e.pauseUntil=w.time+1.7+(e.phase||0)%2;e.mesh.material.rotation=0;}
  }
  e.mesh.position.y=.035+Math.abs(Math.sin(w.time*(e.wanderTarget?9:2)+(e.phase||0)))*(e.wanderTarget?.11:.045);
 }
}
