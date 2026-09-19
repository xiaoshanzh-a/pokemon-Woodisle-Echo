import {roadPattern} from './surface-art.js';
import {CanvasTexture,SRGBColorSpace,MeshBasicMaterial} from './vendor/three.module.js';
// Draw all road branches into one surface: no overlapping tile borders or
// coplanar circle meshes. Canvas +z runs down, matching the world ground plane.
export function paintRoads(w,paths,color='#d5c79f',width=2.5){
 const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d'),scale=1024/52;
 g.strokeStyle=roadPattern(g,w)||color;g.lineWidth=width*scale;g.lineJoin='round';g.lineCap='round';
 for(const points of paths){if(points.length<2)continue;g.beginPath();points.forEach(([x,z],i)=>{const a=(x+26)*scale,b=(z+26)*scale;i?g.lineTo(a,b):g.moveTo(a,b)});g.stroke()}
 // A quiet granular finish, clipped to the painted paths; no tile grid.
 g.globalCompositeOperation='source-atop';
 let seed=718;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<6800;i++){g.fillStyle=i%3?'#ffffff14':'#66573d13';g.fillRect(rng()*1024,rng()*1024,1+rng()*3,1+rng()*2)}
 g.globalCompositeOperation='source-over';
 const tex=new CanvasTexture(c);tex.colorSpace=SRGBColorSpace;
 const plane=w.floor(0,0,52,52,0xffffff,.042);plane.material.dispose();plane.material=new MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,alphaTest:.02,toneMapped:false});plane.renderOrder=-1;
}
