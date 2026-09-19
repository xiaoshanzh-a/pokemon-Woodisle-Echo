// Render indexed GBA source sheets into browser textures; source files stay intact.
import {LEGEND_SPECIES} from './legend-data.js'; import {CHARACTER_METRICS} from './character-scale.js';
import {ROOM_ASSETS} from './room-assets.js';
import {EXTRA_SPECIES} from './evolution.js';
import {prepareSurfaces} from './surface-art.js';
export const SOURCE_SPECIES=[['litwick','烛光灵','幽灵',607],['chandelure','水晶灯火灵','幽灵',609],['aggron','波士可多拉','钢',306],['ampharos','电龙','电',181],['quagsire','沼王','水',195],['timburr','搬运小匠','格斗',532],['emolga','电飞鼠','电',587],['buizel','泳圈鼬','水',418],['lillipup','小约克','一般',506],['minccino','泡沫栗鼠','一般',572],['ralts','拉鲁拉丝','超能',280],['swablu','青绵鸟','飞行',333],['aron','可可多拉','钢',304]];
export const SOURCE_IMAGES=new Map();
const root='assets/sources/pokeemerald-expansion-master/graphics/pokemon/';
function imageReady(url){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Missing source sprite '+url));i.src=url;});}
export async function prepareSources(){
 await prepareSurfaces();
 // Followers use a two-frame vertical sheet, unlike the battle portraits.
 await Promise.all(EXTRA_SPECIES.map(async([id])=>{const im=await imageReady('assets/'+id+'-front.png'),c=document.createElement('canvas');c.width=im.width;c.height=im.height*2;const g=c.getContext('2d');g.drawImage(im,0,0);g.drawImage(im,0,im.height);SOURCE_IMAGES.set(id+'-walk',c.toDataURL())}));
 // Repair keyed-out interior pixels, keeping the exterior silhouette transparent.
 // These opaque roof/wall surfaces must not reveal scenery behind the facade.
 await Promise.all(['house','house2','center','lab','arcade','safari'].map(async name=>{
  const im=await imageReady('assets/'+name+'.png'),c=document.createElement('canvas');c.width=im.width;c.height=im.height;
  const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height),p=d.data;
  for(let y=0;y<c.height;y++){
   let left=0,right=c.width-1;while(left<right&&p[(y*c.width+left)*4+3]<128)left++;while(right>left&&p[(y*c.width+right)*4+3]<128)right--;
   for(let x=left+1;x<right;x++){const n=(y*c.width+x)*4;if(p[n+3]>=128)continue;
    let end=x;while(end<right&&p[(y*c.width+end)*4+3]<128)end++;
    const a=(y*c.width+x-1)*4,b=(y*c.width+end)*4;
    for(let k=x;k<end;k++){const q=(y*c.width+k)*4;for(let ch=0;ch<3;ch++)p[q+ch]=Math.round((p[a+ch]+p[b+ch])*.44);p[q+3]=255;}x=end;
   }
  }
  g.putImageData(d,0,0);SOURCE_IMAGES.set(name,c.toDataURL());
 }));
 await Promise.all(['architecture-green-house','architecture-purple-house',...ROOM_ASSETS].map(async name=>{
  const im=await imageReady('assets/'+name+'.png'),c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height),p=d.data;let left=c.width,top=c.height,right=0,bottom=0;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const n=(y*c.width+x)*4,r=p[n],v=p[n+1],b=p[n+2];if(b>r*1.13&&b>v*1.2&&r<100&&v<100)p[n+3]=0;if(p[n+3]){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}}
  g.putImageData(d,0,0);if(right<left)throw Error('Empty architecture '+name);const out=document.createElement('canvas'),width=right-left+1,height=bottom-top+1;out.width=512;out.height=Math.round(512*height/width);out.getContext('2d').drawImage(c,left,top,width,height,0,0,out.width,out.height);SOURCE_IMAGES.set(name,out.toDataURL());
 }));
 await Promise.all([...SOURCE_SPECIES,...LEGEND_SPECIES].flatMap(([id])=>['front','back','walk'].map(async side=>{
  const im=await imageReady(root+id+'/'+(side==='walk'?'icon':side)+'.png'),c=document.createElement('canvas');c.width=side==='walk'?32:64;c.height=side==='walk'?64:64;const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;g.drawImage(im,0,0,c.width,c.height,0,0,c.width,c.height);
  const data=g.getImageData(0,0,c.width,c.height),p=data.data,key=[p[0],p[1],p[2]];for(let n=0;n<p.length;n+=4)if(p[n]===key[0]&&p[n+1]===key[1]&&p[n+2]===key[2])p[n+3]=0;g.putImageData(data,0,0);SOURCE_IMAGES.set(id+'-'+side,c.toDataURL());
 })));
 await Promise.all([['echo-engineer','scientist_1'],['echo-host','woman_3'],['echo-apprentice','boy_1']].map(async([id,file])=>{
  const im=await imageReady('assets/sources/pokeemerald-master/graphics/object_events/pics/people/'+file+'.png'),c=document.createElement('canvas');c.width=16;c.height=32;const g=c.getContext('2d');g.drawImage(im,0,0,16,32,0,0,16,32);const d=g.getImageData(0,0,16,32),p=d.data,k=[p[0],p[1],p[2]];for(let n=0;n<p.length;n+=4)if(p[n]===k[0]&&p[n+1]===k[1]&&p[n+2]===k[2])p[n+3]=0;g.putImageData(d,0,0);SOURCE_IMAGES.set(id,c.toDataURL());let top=32,bottom=0;for(let y=0;y<32;y++)for(let x=0;x<16;x++)if(p[(y*16+x)*4+3]>40){top=Math.min(top,y);bottom=Math.max(bottom,y)}CHARACTER_METRICS[id]=[16,32,bottom-top+1];
 }));
}
export const sourceUrl=name=>SOURCE_IMAGES.get(name)||`assets/${name}.png`;
