import {chromium} from '../../landing/node_modules/playwright/index.mjs';
import AxeBuilder from '../../landing/node_modules/@axe-core/playwright/dist/index.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),out=root+'production/reviews/';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={checks:[],errors:[],accessibility:[]};
const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);};
let page;
try{
 for(const width of [360,768,1366,1920]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto('http://127.0.0.1:5195/',{waitUntil:'networkidle'});
  await page.locator('#cities').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
  check('No horizontal overflow '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(let i=0;i<6;i++){
   await page.locator('[role=tab]').nth(i).click();await page.locator('#pantheon-panel').scrollIntoViewIfNeeded();
   check('Seven creatures '+width+'/'+i,await page.locator('#pantheon-panel .faction-creatures figure').count()===7);
   check('Patron visibility '+width+'/'+i,await page.locator('#pantheon-panel .patron-card').isVisible()===(width>800));
  }
  if(width===1366){
   await page.locator('[role=tab]').first().click();await page.locator('[role=tab]').first().press('ArrowRight');check('Keyboard pantheon selection',await page.locator('[role=tab]').nth(1).getAttribute('aria-selected')==='true');
   const ids=await page.evaluate(()=>REALMS_DATA.map(p=>p.id));
   for(const id of ids){
    await page.locator('#city-pantheon').selectOption(id);
    for(const level of [1,2,3,4]){
     await page.locator(`[data-city-level="${level}"]`).click();
     await page.waitForFunction(()=>{const t=REALMS_DATA.find(p=>p.id===document.getElementById('city-pantheon').value).town;return t.slots.every(s=>{const n=document.querySelector(`[data-slot="${s.id}"]`),l=Number(n.dataset.level),im=n.querySelector('img:not(.leaving)');return l===0||im?.complete&&im.getAttribute('src')===s.levels[l-1].image;});});
     check('City art and positions '+id+'/'+level,await page.evaluate(()=>{
      const p=REALMS_DATA.find(p=>p.id===document.getElementById('city-pantheon').value),s=p.town.steps[Number(document.getElementById('city-stage').dataset.step)];
      return p.town.slots.every(slot=>{const n=document.querySelector(`[data-slot="${slot.id}"]`),l=s.buildings[slot.id]||0;return Number(n.dataset.level)===l&&Math.abs(parseFloat(n.style.left)-(slot.placement.x-slot.placement.width/2))<.001&&Number(n.style.zIndex)===slot.placement.layer&&(!l||n.querySelector('img:not(.leaving)').getAttribute('src')===slot.levels[l-1].image)})&&[...document.querySelectorAll('.city-backgrounds img')].findIndex(i=>i.classList.contains('active'))===s.hallLevel-1;
     }));
    }
   }
   await page.locator('#city-pantheon').selectOption('greek');
   await page.locator('#city-timeline').evaluate(n=>{for(const i of [0,33,0,13,33]){n.value=String(i);n.dispatchEvent(new Event('input',{bubbles:true}));}});
   await page.waitForFunction(()=>{const t=REALMS_DATA.find(p=>p.id===document.getElementById('city-pantheon').value).town;return t.slots.every(s=>{const n=document.querySelector(`[data-slot="${s.id}"]`),l=Number(n.dataset.level),im=n.querySelector('img:not(.leaving)');return l===0||im?.complete&&im.getAttribute('src')===s.levels[l-1].image;});});
   check('Rapid timeline seeking renders all buildings',await page.locator('.city-building img:not(.leaving)').count()===18);
   await page.locator('#cities').screenshot({path:out+'city-desktop.png'});
   await page.locator('[role=tab]').first().click();await page.locator('#pantheons').scrollIntoViewIfNeeded();await page.locator('#pantheon-panel').evaluate(async n=>Promise.all([...n.querySelectorAll('img')].map(i=>i.decode().catch(()=>{}))));await page.locator('#pantheons').screenshot({path:out+'pantheons-desktop.png'});
   await page.locator('#origin').screenshot({path:out+'origin-desktop.png'});
   await page.locator('#game').screenshot({path:out+'features-desktop.png'});
   await page.locator('#battle').screenshot({path:out+'battle-desktop.png'});
   await page.locator('.gallery-item').first().click();check('Gallery opens',await page.locator('dialog').isVisible());await page.keyboard.press('ArrowRight');check('Gallery next',await page.locator('dialog [aria-live]').innerText().then(s=>s.includes('2 /')));await page.keyboard.press('Escape');check('Gallery closes',!await page.locator('dialog').isVisible());
  }
  if(width===360){await page.locator('.menu-toggle').click();check('Mobile menu opens',await page.locator('#main-nav').isVisible());await page.keyboard.press('Escape');await page.locator('#pantheons').screenshot({path:out+'pantheons-mobile.png'});await page.locator('#cities').screenshot({path:out+'city-mobile.png'});}
  await page.evaluate(()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');window.scrollTo(0,0)});
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
  check('All page images loaded '+width,await page.evaluate(()=>[...document.images].every(i=>i.naturalWidth>0)));
  await page.screenshot({path:out+'page-'+width+'.png',fullPage:true});
  const axe=await new AxeBuilder({page}).analyze();report.accessibility.push({width,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
  await context.close();console.log('Verified width',width);
 }
 const context=await browser.newContext({viewport:{width:1366,height:1000}});page=await context.newPage();await page.goto('http://127.0.0.1:5195/',{waitUntil:'networkidle'});await page.locator('#city-stage').scrollIntoViewIfNeeded();await page.waitForTimeout(3600);check('City autoplay advances',Number(await page.locator('#city-stage').getAttribute('data-step'))>0);await page.locator('#city-play').click();const step=await page.locator('#city-stage').getAttribute('data-step');await page.waitForTimeout(1800);check('Pause holds position',await page.locator('#city-stage').getAttribute('data-step')===step);await page.locator('#city-replay').click();check('Replay resets',await page.locator('#city-stage').getAttribute('data-step')==='0');await context.close();
 check('No JavaScript errors',report.errors.length===0);
}catch(e){report.failure=e.stack;console.error(e);if(page&&!page.isClosed())await page.screenshot({path:out+'test-failure.png',fullPage:true});process.exitCode=1;}
finally{await writeFile(out+'test-report.json',JSON.stringify(report,null,2));await browser.close();console.log('Checks passed:',report.checks.length);}
