import {chromium} from '../../landing/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const width of [1366,390]){
const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:5195/',{waitUntil:'networkidle'});
await page.locator('.pillars').scrollIntoViewIfNeeded();
const images=await page.locator('.pillars img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>{i.loading='eager';return i.decode();}));return imgs.map(i=>({src:i.getAttribute('src'),ok:i.naturalWidth>0}));});
assert.equal(images.length,4);assert.ok(images.every(i=>i.ok));assert.equal(new Set(images.map(i=>i.src)).size,4);
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('.pillars').screenshot({path:new URL(`./reviews/pantheon-cards-${width}.png`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
console.log('Four distinct images loaded; no overflow at',width);await page.close();
}}finally{await browser.close();}
