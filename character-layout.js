// Reserve physical conversation space and the camera's view of each character.
// Moving a character also moves its interaction point, label and ground shadow.
export function layoutCharacters(w){
 const people=w.entities.filter(e=>e.actor),placed=[],indoor=!!w.interior&&!/^(route|wildland)-/.test(w.interior.service||''),gap=indoor?3.2:4.6;
 const scenery=w.land.children.filter(s=>s.userData.occluder);
 const blocksView=(x,z,s)=>{const q=s.position;return q.z>z+.2&&Math.abs(q.x-x)<s.scale.x/2+.9&&q.z-z<s.scale.y*1.22+1.2};
 w.layoutWarnings=[];
 for(const e of people){
  const actor=e.actor,ox=actor.position.x,oz=actor.position.z,ex=e.x-ox,ez=e.z-oz;
  if(e.fixedActor){placed.push([ox,oz]);continue}
  const candidates=[];for(let dx=-7;dx<=7;dx++)for(let dz=-7;dz<=7;dz++)if(Math.hypot(dx,dz)<=7)candidates.push([ox+dx,oz+dz,dx*dx+dz*dz]);candidates.sort((a,b)=>a[2]-b[2]);
  const spot=candidates.find(([x,z])=>w.canMove(x,z)&&w.canMove(x+ex,z+ez+.9)&&!scenery.some(s=>blocksView(x,z,s))&&!placed.some(([a,b])=>Math.hypot(x-a,z-b)<gap||Math.abs(x-a)<2.3&&Math.abs(z-b)<5)&&!w.entities.some(t=>t!==e&&t.portal&&Math.hypot(x-t.x,z-t.z)<2.7));
  if(!spot){w.layoutWarnings.push(e.name);placed.push([ox,oz]);continue}
  const [x,z]=spot,dx=x-ox,dz=z-oz;actor.position.x=x;actor.position.z=z;e.x+=dx;e.z+=dz;if(Number.isFinite(e.labelZ))e.labelZ+=dz;
  if(actor.userData.shadow){actor.userData.shadow.position.x+=dx;actor.userData.shadow.position.z+=dz}
  placed.push([x,z]);
 }
 // Low flowers may hide feet even after larger tree silhouettes are cleared.
 for(const s of [...w.land.children])if(['flowers','grass'].includes(s.userData.asset)&&placed.some(([x,z])=>Math.hypot(x-s.position.x,z-s.position.z)<1.15)){
  w.land.remove(s);if(s.userData.shadow)w.land.remove(s.userData.shadow);s.material?.dispose();
 }
}
