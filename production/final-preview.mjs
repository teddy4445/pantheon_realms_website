import {chromium} from '../../landing/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});const out=new URL('./reviews/',import.meta.url).pathname.replace(/^\/(\w:)/,'$1');
const result=[];
try{for(const width of [390,1366]){const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:5195/preview-repo/',{waitUntil:'networkidle'});await p.screenshot({path:out+'hero-'+width+'.png'});
await p.locator('#pantheons').scrollIntoViewIfNeeded();await p.locator('#pantheon-panel').evaluate(async n=>Promise.all([...n.querySelectorAll('img')].map(i=>{i.loading='eager';return i.decode();})));await p.locator('#pantheon-panel').screenshot({path:out+'roster-'+width+'.png'});
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);result.push('GitHub project subpath loads '+width);await p.close();}
const p=await b.newPage({reducedMotion:'reduce'});await p.goto(new URL('../index.html',import.meta.url).href,{waitUntil:'load'});assert.equal(await p.locator('[role=tab]').count(),6);await p.locator('[role=tab]').last().click();assert.equal(await p.locator('#pantheon-panel .faction-creatures figure').count(),7);await p.locator('#city-pantheon').selectOption('celtic');await p.waitForFunction(()=>document.querySelectorAll('.city-building img:not(.leaving)').length===18);result.push('Direct file opening, tabs and city work');await writeFile(out+'portability-report.json',JSON.stringify(result,null,2));console.log(result);
}finally{await b.close();}
