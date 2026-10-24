/* Shared 30-second town development clock, followed by a five-second hold. */
(() => {
 'use strict';
 const data=window.REALMS_DATA,stage=document.getElementById('city-stage');if(!data||!stage)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),flags=[...document.querySelectorAll('[data-city-pantheon]')];
 const tooltip=document.getElementById('building-tooltip'),pause=document.getElementById('city-pause');
 const BUILD=30000,HOLD=5000,CYCLE=BUILD+HOLD;
 let current=data[0],elapsed=reduce.matches?BUILD:0,paused=reduce.matches,visible=false,last=null,frame=0,revision=0,index=-1,hovered=null;
 const loaded=new Set();
 function preload(src){if(loaded.has(src))return;loaded.add(src);const im=new Image();im.src=src;}
 function hideTip(){tooltip.hidden=true;hovered=null;}
 function showTip(node){if(!node.dataset.name)return;hovered=node;tooltip.textContent=node.dataset.name;tooltip.hidden=false;const r=node.getBoundingClientRect(),s=stage.getBoundingClientRect();const x=Math.max(tooltip.offsetWidth/2+10,Math.min(s.width-tooltip.offsetWidth/2-10,r.left-s.left+r.width/2));tooltip.style.left=x+'px';tooltip.style.top=Math.max(10,r.top-s.top-38)+'px';}
 function paint(animate=true){
  const town=current.town,next=Math.min(town.steps.length-1,Math.floor(Math.min(elapsed,BUILD)/BUILD*town.steps.length));
  stage.dataset.elapsed=String(Math.round(elapsed));stage.dataset.phase=elapsed>=BUILD?'hold':'building';
  document.getElementById('city-cycle-progress').style.width=Math.min(100,elapsed/BUILD*100)+'%';
  if(next===index)return;index=next;const step=town.steps[index];stage.dataset.step=String(index);
  document.getElementById('city-caption').textContent=current.name+' · '+['Village','Town','City','Capital'][step.hallLevel-1];
  stage.setAttribute('aria-label',current.name+' town development');
  stage.querySelectorAll('.city-backgrounds img').forEach((im,i)=>im.classList.toggle('active',i===step.hallLevel-1));
  for(const slot of town.slots){
   const node=stage.querySelector(`[data-slot="${slot.id}"]`),level=step.buildings[slot.id]||0;
   if(node.dataset.level===String(level))continue;
   node.dataset.level=String(level);node.classList.remove('just-built');const token=Symbol();node.loadToken=token;
   const previous=node.querySelector('img:not(.leaving)');node.querySelectorAll('.leaving').forEach(n=>n.remove());
   node.hidden=!level;node.tabIndex=level?0:-1;
   if(!level){node.replaceChildren();delete node.dataset.name;if(hovered===node)hideTip();continue;}
   const art=slot.levels[level-1];node.dataset.name=art.name;node.setAttribute('aria-label',art.name);node.setAttribute('aria-describedby','building-tooltip');
   if(hovered===node)showTip(node);
   const im=new Image();im.alt='';im.src=art.image;const rev=revision;
   const show=()=>{if(rev!==revision||node.loadToken!==token)return;if(previous){previous.classList.add('leaving');setTimeout(()=>previous.remove(),650);}if(animate&&!reduce.matches){im.className='arriving';node.classList.add('just-built');}node.append(im);};
   if(im.complete)show();else im.decode().then(show).catch(()=>{});
  }
  for(const future of town.steps.slice(index+1,index+5)){const slot=town.slots.find(s=>s.id===future.changedSlot);if(slot)preload(slot.levels[future.level-1].image);}
 }
 function choose(id){
  const selected=data.find(p=>p.id===id);if(!selected)return;current=selected;revision++;index=-1;hideTip();
  stage.dataset.pantheon=id;
  // Placements are authored in the game's scene coordinates; preserve that aspect ratio.
  stage.style.aspectRatio=String(current.town.aspectRatio||1.5);
  flags.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cityPantheon===id)));
  const backgrounds=stage.querySelector('.city-backgrounds'),buildings=stage.querySelector('.city-buildings');backgrounds.replaceChildren();buildings.replaceChildren();
  current.town.backgrounds.forEach(src=>{const im=new Image();im.src=src;im.alt='';backgrounds.append(im);});
  for(const slot of current.town.slots){const n=document.createElement('button');n.type='button';n.className='city-building';n.dataset.slot=slot.id;const p=slot.placement;Object.assign(n.style,{left:`${p.x-p.width/2}%`,bottom:`${100-p.y}%`,width:`${p.width}%`,zIndex:String(p.layer)});n.addEventListener('pointerenter',()=>showTip(n));n.addEventListener('pointerleave',hideTip);n.addEventListener('focus',()=>showTip(n));n.addEventListener('blur',hideTip);n.addEventListener('click',()=>showTip(n));buildings.append(n);}
  // Preserve the shared clock, including the five-second final hold.
  paint(false);
 }
 function tick(now){frame=0;if(last!==null)elapsed=(elapsed+now-last)%CYCLE;last=now;paint();frame=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(frame);frame=0;last=null;pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'Play city animation':'Pause city animation');pause.setAttribute('aria-pressed',String(paused));if(visible&&!document.hidden&&!paused)frame=requestAnimationFrame(tick);}
 flags.forEach((button,i)=>{button.addEventListener('click',()=>choose(button.dataset.cityPantheon));button.addEventListener('keydown',e=>{let to;if(e.key==='ArrowRight')to=(i+1)%flags.length;if(e.key==='ArrowLeft')to=(i+flags.length-1)%flags.length;if(e.key==='Home')to=0;if(e.key==='End')to=flags.length-1;if(to!==undefined){e.preventDefault();flags[to].focus();flags[to].click();}});});
 pause.addEventListener('click',()=>{paused=!paused;sync();});
 stage.addEventListener('keydown',e=>{if(e.key==='Escape')hideTip();});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.1}).observe(stage);
 document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',()=>{paused=reduce.matches;if(paused){elapsed=BUILD;paint(false);}sync();});choose(current.id);sync();
})();
