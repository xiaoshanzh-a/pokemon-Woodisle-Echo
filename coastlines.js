import {Shape,ShapeGeometry,CylinderGeometry,ConeGeometry} from './vendor/three.module.js';
export const COASTS=[
 [[15,-26],[14,-9],[14,5],[16,17],[15,26]],
 [[19,-26],[13,-13],[17,-4],[14,5],[18,15],[15,26]],
 [[11,-26],[6.4,-10],[6.4,5],[9,15],[13,26]],
 [[18,-26],[14,-12],[16,0],[14,5],[17,16],[14,26]],
 [[15,-26],[14,-12],[14,12],[16,26]],
 [[18,-26],[15,-15],[13,-4],[14,5],[17,16],[14,26]]
];
export function shoreX(area,z){const pts=COASTS[area];for(let i=1;i<pts.length;i++)if(z<=pts[i][1]){const [x0,z0]=pts[i-1],[x1,z1]=pts[i];return x0+(x1-x0)*(z-z0)/(z1-z0)}return pts.at(-1)[0]}
export function waterAt(w,x,z){return x>shoreX(w.area,z)||w.waterZones.some(p=>Math.abs(x-p.x)<p.w/2+.2&&Math.abs(z-p.z)<p.d/2+.2)}
export function onWalkway(w,x,z){return Math.abs(z-5)<1.38&&x>=5.8&&x<=22||w.area===2&&x>=4&&x<=11.6&&z>=8.2&&z<=9.8;}
export function buildCoast(w,index){
 const shore=COASTS[index],shape=new Shape();shape.moveTo(shore[0][0],-shore[0][1]);for(const [x,z] of shore.slice(1))shape.lineTo(x,-z);shape.lineTo(50,-26);shape.lineTo(50,26);shape.closePath();
 const sea=w.water(0,0,100,60);sea.geometry.dispose();sea.geometry=new ShapeGeometry(shape);const pos=sea.geometry.attributes.position,uv=sea.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+50)/100,(pos.getY(i)+30)/60);sea.material.color.setHex(index===2?0x9dccf2:index===5?0xa4cbd8:0xb5e2d5);
 // The rectangular water helper creates foam samples; keep only those at sea.
 for(const foam of [...w.waves])if(foam.position.x<shoreX(index,foam.position.z)){w.land.remove(foam);w.waves.splice(w.waves.indexOf(foam),1);foam.geometry.dispose();foam.material.dispose()}
 const pool=(x,z,width,depth)=>{w.floor(x,z,width+.7,depth+.7,0xb5c29a,.006);w.water(x,z,width,depth);w.waterZones.push({x,z,w:width,d:depth});};
 // Continuous raised bridge from inland approach to the map edge; collision and deck share the same corridor.
 const left=shoreX(index,5)-1,right=22;const deck=w.floor((left+right)/2,5,right-left,3.2,index===5?0xaeb9b9:0xc3ac80,.095);deck.userData.crossing={left,right,z:5,width:3.2};for(let x=left;x<right;x+=.6)w.box(x,5,.06,3.2,.035,0x9e916f,.10);w.fence(left,3.3,right-left);w.fence(left,6.7,right-left);
 if(index===0){w.flowers(12,-7,4);w.box(12.8,11,1.8,.6,.6,0xa78c62);}
 if(index===1){
  pool(8.8,-9,3.4,10);pool(11.2,-3.8,4.4,2);pool(-7,10,4.4,3);
  w.box(11,-14.5,3,1,1.7,0x829687);w.box(11,-14.1,1.5,.08,1.5,0xa6e4dc);
  for(const [x,z] of [[6.5,-8],[6.5,-12],[-9.8,10]])w.billboard('grass',x,z,.8,1.15);
 }
 if(index===2){
  for(const z of [-14,-5,14]){w.box(shoreX(index,z)-.5,z,1.1,3,.4,0xd9d0ac);}
  w.box(18,-7,4,1.7,.45,0x8e7056,.12);w.box(18,-7,.15,.15,3,0xbcb28d,.5);w.box(18.8,-7,1.5,.08,1.8,0xf4ebd0,1.5);
  w.billboard('lapras-front',21,13,2.8,2.8);w.box(21,-15,4,4,.7,0x9aa99c);w.mesh(new CylinderGeometry(.9,1.1,4.2,12),0xe6e3d3,21,2.7,-15);w.mesh(new CylinderGeometry(1.1,1.1,.9,12),0xffe1a0,21,5.1,-15);w.mesh(new ConeGeometry(1.5,1,12),0xb76851,21,6,-15);
 }
 if(index===3){
  pool(-6,-4,5,3);pool(8,10,3.4,4);
  for(const [x,z] of [[-9,-4],[-5,-6.5],[10.4,10]])w.billboard('grass',x,z,1,1.3);
  w.box(11,-7,2.7,2.3,.3,0xb59f74);w.box(11,-8,.15,.15,2.2,0x8a795c);w.box(11,-8,3,.8,.2,0x9dab78,2.2);
 }
 if(index===4){
  const basin=w.mesh(new CylinderGeometry(1.4,1.6,.5,16),0xbac7c1,-5,.25,7);w.mesh(new CylinderGeometry(1.15,1.15,.05,16),0x74c9d9,-5,.54,7);w.mesh(new CylinderGeometry(.09,.16,1,8),0xb4edee,-5,1,7);w.floor(12.8,0,2,36,0xcbcbbd,.07);for(let z=-16;z<=18;z+=4){w.box(14,z,.4,.4,.7,0xb4bfb4);w.box(12.8,z,1.3,.4,.55,0x8e8168);}
  w.box(22,-9,3,1.3,.4,0xb89875,.1);w.billboard('magikarp-front',20,15,1.2,1.2);
 }
 if(index===5){
  pool(-12,-6,3,7);pool(10,-10,3,4);
  for(const [x,z] of [[18,-10],[21,-5],[20,14]]){w.box(x,z,1.1,1.1,1.4,0x9cafa4);w.box(x,z,1.5,1.5,.25,0xbdc7b8,1.4);}
 }
}
