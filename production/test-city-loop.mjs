import {chromium} from '../../landing/node_modules/playwright/index.mjs';
import AxeBuilder from '../../landing/node_modules/@axe-core/playwright/dist/index.mjs';
import {writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=new URL('./reviews/',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),results=[],errors=[];
const browser=await chromium.launch({channel:'chrome',headless:true});
const check=(label,condition)=>{assert.ok(condition,label);results.push(label);};
try{
 if(!process.argv.includes('--layout-only')) {
 const p=await browser.newPage({viewport:{width:1366,height:1000}});p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5195/',{waitUntil:'networkidle'});await p.locator('#city-stage').scrollIntoViewIfNeeded();
 await p.waitForFunction(()=>Number(document.querySelector('#city-stage').dataset.elapsed)>=11000);
 await p.locator('#city-pause').click();const phase=Number(await p.locator('#city-stage').getAttribute('data-elapsed')),step=await p.locator('#city-stage').getAttribute('data-step');
 check('Six pantheon flags',await p.locator('[data-city-pantheon]').count()===6);
 for(const flag of await p.locator('[data-city-pantheon]').all()){
  await flag.click();check('Flag preserves elapsed time: '+await flag.getAttribute('data-city-pantheon'),Number(await p.locator('#city-stage').getAttribute('data-elapsed'))===phase&&await p.locator('#city-stage').getAttribute('data-step')===step);
 }
 await p.locator('[data-city-pantheon=greek]').click();await p.locator('#city-stage').scrollIntoViewIfNeeded();await p.locator('#city-pause').click();
 await p.waitForFunction(()=>document.querySelector('#city-stage').dataset.phase==='hold',{},{timeout:30000});
 const holdStart=Number(await p.locator('#city-stage').getAttribute('data-elapsed'));check('Build sequence completes at 30 seconds',holdStart>=30000&&holdStart<30500);check('All 33 construction steps complete',await p.locator('#city-stage').getAttribute('data-step')==='33');
 await p.locator('[data-city-pantheon=norse]').click();check('Flag retains final hold',await p.locator('#city-stage').getAttribute('data-phase')==='hold');
 await p.waitForFunction(()=>Number(document.querySelector('#city-stage').dataset.elapsed)>34500);check('Capital remains through five-second hold',await p.locator('#city-stage').getAttribute('data-step')==='33');
 await p.waitForFunction(()=>Number(document.querySelector('#city-stage').dataset.elapsed)<600);check('Loop restarts after 35 seconds',await p.locator('#city-stage').getAttribute('data-step')==='0');await p.locator('#city-pause').click();
 console.log('35-second real-time loop and shared phase passed');await p.close();
 } else results.push(...JSON.parse(await readFile(out+'city-loop-report.json','utf8')).results.slice(0,12));
 for(const width of [390,768,1366]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5195/',{waitUntil:'networkidle'});
  await page.locator('#cities').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelectorAll('.city-building img:not(.leaving)').length===18);
  check('No overflow '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  check('Right-hand panel removed '+width,await page.locator('.city-panel').count()===0);
  check('Three gallery shots removed '+width,await page.locator('.gallery-item').count()===5);
  check('Old version text removed '+width,!(await page.locator('body').innerText()).includes('0.11.0'));
  check('Reduced motion starts paused '+width,await page.locator('#city-pause').getAttribute('aria-pressed')==='true');
  const building=page.locator('.city-building[data-slot=civic_hall]');await building.focus();check('Building tooltip '+width,await page.locator('#building-tooltip').isVisible()&&await page.locator('#building-tooltip').innerText()===await building.getAttribute('aria-label'));await page.keyboard.press('Escape');check('Escape closes tooltip '+width,!await page.locator('#building-tooltip').isVisible());
  if(width===1366){await building.hover();check('Pointer hover tooltip',await page.locator('#building-tooltip').isVisible());await page.locator('#city-stage').screenshot({path:out+'city-tooltip.png'});await page.mouse.move(0,0);}
  await page.locator('#cities').screenshot({path:out+'city-flags-'+width+'.png'});
  await page.locator('#legend-download').scrollIntoViewIfNeeded();await page.locator('#legend-download').hover();await page.locator('#download').screenshot({path:out+'download-button-'+width+'.png'});
  await page.locator('#legend-download').evaluate(n=>n.click());check('Missing URL reports availability '+width,(await page.locator('#download-button-detail').innerText()).toLowerCase().includes('coming soon'));
  const axe=await new AxeBuilder({page}).analyze();check('Automated accessibility '+width,axe.violations.length===0);
  await context.close();console.log('Layout verified',width);
 }
 // A valid configured release makes the same button a real download link.
 const page=await browser.newPage();await page.route('**/site-config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.SITE_CONFIG={downloads:[{enabled:true,platform:"Windows",url:"https://example.com/game.exe",filename:"game.exe"}]};'}));await page.goto('http://127.0.0.1:5195/',{waitUntil:'networkidle'});check('Configured download link works',await page.locator('#legend-download').getAttribute('href')==='https://example.com/game.exe');await page.close();check('No JavaScript errors',errors.length===0);
}catch(e){results.push('FAILED: '+e.stack);console.error(e);process.exitCode=1;}
finally{await writeFile(out+'city-loop-report.json',JSON.stringify({results,errors},null,2));await browser.close();console.log(results.length,'checks');}
