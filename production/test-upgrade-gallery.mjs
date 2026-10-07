import {chromium} from '../../landing/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=new URL('./reviews/',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),checks=[],errors=[];
const check=(s,v)=>{assert.ok(v,s);checks.push(s);};
const b=await chromium.launch({channel:'chrome',headless:true});
try{
 const p=await b.newPage({viewport:{width:1366,height:1000},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:5195/',{waitUntil:'networkidle'});
 for(let i=0;i<6;i++){
  await p.locator('[role=tab]').nth(i).click();
  const cards=p.locator('#pantheon-panel .creature-preview');check('Seven upgrade previews '+i,await cards.count()===7);
  for(let n=0;n<7;n++){
   const card=cards.nth(n);await card.scrollIntoViewIfNeeded();await card.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.map(im=>{im.loading='eager';return im.decode();}));});
   await card.hover();check('Hover reveals upgrade '+i+'/'+n,await card.locator('.creature-upgrade').evaluate(im=>getComputedStyle(im).opacity==='1'&&im.naturalWidth>0));
   await p.mouse.move(0,0);check('Mouse leave restores base '+i+'/'+n,await card.locator('.creature-upgrade').evaluate(im=>getComputedStyle(im).opacity==='0'));
  }
 }
 await p.locator('[role=tab]').first().click();await p.locator('#pantheon-panel').focus();await p.keyboard.press('Tab');check('Keyboard focus previews upgrade',await p.locator('#pantheon-panel .creature-upgrade').first().evaluate(im=>getComputedStyle(im).opacity==='1'));await p.locator('#pantheon-panel').screenshot({path:out+'creature-upgrade-preview.png'});
 check('Hero label is Download',(await p.locator('.hero-actions .button').innerText()).toLowerCase()==='download');check('No placeholder anchor scroll',await p.locator('.hero-actions .button').getAttribute('href')===null);
 await p.close();
 for(const width of [390,768,1366]){
  const page=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:5195/',{waitUntil:'networkidle'});await page.locator('.gallery').scrollIntoViewIfNeeded();
  const rects=await page.locator('.gallery-item').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
  check('Exactly four gallery images '+width,rects.length===4);check('2x2 gallery grid '+width,Math.abs(rects[0].y-rects[1].y)<1&&Math.abs(rects[2].y-rects[3].y)<1&&rects[2].y>rects[0].y&&Math.abs(rects[0].x-rects[2].x)<1);
  check('No city gallery images '+width,await page.locator('.gallery img[src*="town-"]').count()===0);check('No overflow '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('.gallery img').evaluateAll(async imgs=>Promise.all(imgs.map(im=>{im.loading='eager';return im.decode();})));await page.locator('.gallery').screenshot({path:out+'gallery-2x2-'+width+'.png'});
  await page.locator('.gallery-item').first().click();await page.keyboard.press('ArrowLeft');check('Gallery wraps across four images '+width,(await page.locator('dialog [aria-live]').innerText()).includes('4 / 4'));await page.keyboard.press('Escape');await page.close();
 }
 const page=await b.newPage();await page.route('**/site-config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.SITE_CONFIG={downloads:[{enabled:true,platform:"Windows",url:"./downloads/test.exe",filename:"test.exe"}]};'}));await page.route('**/downloads/test.exe',r=>r.fulfill({headers:{'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename="test.exe"'},body:'Download wiring test fixture; not an executable.'}));await page.goto('http://127.0.0.1:5195/',{waitUntil:'networkidle'});
 for(const selector of ['.hero-actions .button','#legend-download']){const button=page.locator(selector);const event=page.waitForEvent('download');await button.click();const dl=await event;check('Direct download event '+selector,dl.suggestedFilename()==='test.exe');}
 await page.close();check('No JavaScript errors',errors.length===0);
}catch(e){console.error(e);checks.push('FAILED '+e.stack);process.exitCode=1;}
finally{await writeFile(out+'upgrade-gallery-report.json',JSON.stringify({checks,errors},null,2));await b.close();console.log(checks.length,'checks');}
