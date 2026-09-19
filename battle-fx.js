// Battle effects use the supplied FireRed sprite sheets and DOM animations.
const styles={钢:['hit','#b4d8e5'],格斗:['hit','#ecb685'],火:['fire','#ff873c'],水:['bubble','#68d8ff'],电:['electricity','#ffe85c'],草:['green_spike','#8ddc57'],虫:['fangs','#b3d953'],飞行:['gust','#d2f4ff'],毒:['ghostly_spirit','#c57aff'],妖精:['gold_stars','#ff9fda'],超能:['circle_of_light','#eb8fff'],幽灵:['ghostly_spirit','#9b7de6'],岩石:['flat_rock','#ba9a76'],龙:['breath','#86b3ff'],冰:['ice_chunk','#a2edff'],一般:['hit','#fff2cb']};
const textures=new Map();
function texture(name){if(!textures.has(name))textures.set(name,new Promise(resolve=>{const im=new Image();im.onload=()=>{const size=Math.min(im.width,im.height,64),c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');g.drawImage(im,0,0,size,size,0,0,size,size);const p=g.getImageData(0,0,size,size),key=p.data.slice(0,3);for(let i=0;i<p.data.length;i+=4)if(p.data[i]===key[0]&&p.data[i+1]===key[1]&&p.data[i+2]===key[2])p.data[i+3]=0;g.putImageData(p,0,0);resolve(c.toDataURL())};im.onerror=()=>resolve('');im.src=`assets/battle-fx/${name}.png`}));return textures.get(name)}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function animate(el,frames,duration){if(!el)return;const a=el.animate(frames,{duration,easing:'ease-in-out'});await a.finished.catch(()=>{});a.cancel()}
export async function battleFX(kind,{side='ally',type='一般',quick=false,immune=false,both=true}={}){
 const arena=document.querySelector('#battle'),actor=arena?.querySelector('.battle-mon.'+side),target=arena?.querySelector('.battle-mon.'+(side==='ally'?'enemy':'ally'));
 if(!actor||!target)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(kind==='faint'){await animate(actor,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(45px) scale(.65)'}],reduced?80:480);actor.style.opacity='0';return}
 const bounds=arena.getBoundingClientRect(),point=el=>{const r=el.getBoundingClientRect();return{x:r.left-bounds.left+r.width/2,y:r.top-bounds.top+r.height*.55}},a=point(actor),b=point(target);
 const layer=document.createElement('div');layer.className='battle-fx';layer.dataset.effect=kind;arena.append(layer);
 const [name,color]=styles[type]||styles.一般;
 const src=await texture(kind==='heal'?'gold_stars':name),jobs=[];
 function particle(x,y,size,url=src){const el=document.createElement('div');el.className='battle-particle';Object.assign(el.style,{left:x+'px',top:y+'px',width:size+'px',height:size+'px',backgroundImage:url?`url("${url}")`:'none',color,backgroundColor:url?'transparent':color});layer.append(el);return el}
 try{
 if(reduced){layer.style.background=color+'22';await wait(100);return}
 if(kind==='sendout'){
 for(const [el,p] of (both?[[actor,a],[target,b]]:[[actor,a]])){
 jobs.push(animate(el,[{opacity:0,filter:'brightness(3)',transform:'translateY(18px) scale(.15)'},{opacity:1,filter:'brightness(1.8)',transform:'translateY(-12px) scale(1.12)',offset:.65},{opacity:1,filter:'brightness(1)',transform:'translateY(0) scale(1)'}],600));
 for(let i=0;i<12;i++){const angle=i*Math.PI/6,q=particle(p.x,p.y,8,'');q.style.backgroundColor='#fff1ae';jobs.push(animate(q,[{opacity:0,transform:'scale(.2)'},{opacity:1,offset:.15},{opacity:0,transform:`translate(${Math.cos(angle)*85}px,${Math.sin(angle)*65}px) scale(.1)`}],520+i*12))}
 }
 }
 else if(kind==='heal'){for(let i=0;i<10;i++){const p=particle(a.x+(i%5-2)*20,a.y+30,24);jobs.push(animate(p,[{opacity:0,transform:'translateY(0)'},{opacity:1,offset:.3},{opacity:0,transform:'translateY(-90px)'}],650+i*20))}}
 else if(kind==='catch'){const p=particle(a.x,a.y,24,'');p.classList.add('battle-ball');jobs.push(animate(p,[{transform:'translate(0,0)'},{transform:`translate(${(b.x-a.x)/2}px,${b.y-a.y-100}px)`,offset:.5},{transform:`translate(${b.x-a.x}px,${b.y-a.y}px) rotate(540deg)`}],650));}
 else{
 const dx=b.x-a.x,dy=b.y-a.y,contact=quick||['一般','虫'].includes(type);
 jobs.push(animate(actor,[{transform:'translate(0,0)'},{transform:`translate(${-dx*.035}px,8px) scale(.96)`,offset:.25},{transform:`translate(${dx*(contact?.72:.10)}px,${dy*(contact?.72:.10)}px) scale(1.08)`,offset:.6},{transform:'translate(0,0)'}],650));
 for(let i=0;i<(contact?5:10);i++){const p=particle(contact?b.x:a.x,contact?b.y:a.y, type==='岩石'?40:30+(i%3)*10);const spread=(i%5-2)*13;let frames;
 if(type==='超能'||type==='幽灵')frames=[{opacity:0,transform:`translate(${dx}px,${dy}px) scale(.2)`},{opacity:1,offset:.5},{opacity:0,transform:`translate(${dx}px,${dy}px) scale(3)`}];
 else if(contact)frames=[{opacity:0,transform:'scale(.1)'},{opacity:1,offset:.55},{opacity:0,transform:`translate(${spread*2}px,${-35+i*12}px) scale(1.5)`}];
 else frames=[{opacity:0,transform:'translate(0,0) scale(.4)'},{opacity:1,offset:.15},{opacity:1,transform:`translate(${dx*.55}px,${dy*.55+spread-30}px) rotate(${i*40}deg)`,offset:.55},{opacity:0,transform:`translate(${dx+spread}px,${dy+spread}px) scale(1.3)`}];
 jobs.push(animate(p,frames,650+i*22));}
 await wait(350);
 if(!immune){const ring=particle(b.x,b.y,60,'');Object.assign(ring.style,{backgroundColor:'transparent',border:'3px solid '+color,borderRadius:'50%',margin:'-30px'});jobs.push(animate(ring,[{opacity:.9,transform:'scale(.2)'},{opacity:0,transform:'scale(2.8)'}],420));}
 if(!immune)jobs.push(animate(target,[{filter:'brightness(1)',transform:'translateX(0)'},{filter:'brightness(3)',transform:'translateX(-12px)'},{filter:'brightness(1)',transform:'translateX(12px)'},{filter:'brightness(2)',transform:'translateX(-8px)'},{filter:'brightness(1)',transform:'translateX(0)'}],380));
 }
 await Promise.all(jobs);
 }finally{layer.remove()}
}
