import {LEGENDS} from './legend-data.js';
export async function legendBattleFX(id,kind='entrance'){
 const arena=document.querySelector('#battle'),enemy=arena?.querySelector('.battle-mon.enemy');if(!enemy)return;
 const q=LEGENDS.find(q=>q.id===id)||{color:0xf2d691,motion:'wing'};
 const color='#'+q.color.toString(16).padStart(6,'0'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const layer=document.createElement('div');layer.className='legend-fx';layer.dataset.motion=q.motion;
 Object.assign(layer.style,{position:'absolute',inset:'0 0 28% 0',pointerEvents:'none',overflow:'hidden',zIndex:'3'});arena.append(layer);
 const r=arena.getBoundingClientRect(),m=enemy.getBoundingClientRect(),x=m.left-r.left+m.width/2,y=m.top-r.top+m.height*.7;
 const animations=[];
 try{
  for(let i=0;i<(reduced?1:16);i++){
   const el=document.createElement('i'),a=i*Math.PI/8;
   Object.assign(el.style,{position:'absolute',left:x+'px',top:y+'px',width:q.motion==='moon'?'12px':'7px',height:'7px',background:color,borderRadius:q.motion==='bloom'?'70% 0':'50%',boxShadow:'0 0 10px '+color});layer.append(el);
   const dx=Math.cos(a)*(kind==='attack'?135:95),dy=q.motion==='flame'?-120-i*3:Math.sin(a)*70;
   animations.push(el.animate([{opacity:0,transform:'scale(.3)'},{opacity:.8,offset:.3},{opacity:0,transform:`translate(${dx}px,${dy}px) rotate(${i*40}deg) scale(.1)`}],{duration:reduced?120:850+i*12}).finished.catch(()=>{}));
  }
  if(!reduced){const motion=q.motion==='dash'?'translateX(-18px)':q.motion==='wing'?'translateY(-24px) scale(1.08)':'translateY(-10px)';animations.push(enemy.animate([{filter:'drop-shadow(0 0 0px '+color+')',transform:'none'},{filter:'drop-shadow(0 0 16px '+color+')',transform:motion,offset:.45},{filter:'none',transform:'none'}],{duration:950}).finished.catch(()=>{}));}
  await Promise.all(animations);
 }finally{layer.remove()}
}
