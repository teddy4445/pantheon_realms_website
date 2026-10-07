import {chromium} from '../../landing/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1600,height:1000}});
page.on('pageerror',e=>console.log('PAGEERROR',e.message));
await page.goto('http://127.0.0.1:5193/?e2e',{waitUntil:'networkidle'});
await page.screenshot({path:new URL('./reviews/current-menu.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
console.log((await page.locator('body').innerText()).slice(0,7000));
await browser.close();
