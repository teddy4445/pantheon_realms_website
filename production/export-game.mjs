import {build} from '../../landing/node_modules/esbuild/lib/main.js';
import path from 'node:path';
import {writeFileSync} from 'node:fs';
const game='C:/Users/lazeb/Desktop/pantheon_realms';
const root=path.resolve(import.meta.dirname,'..');
const alias=Object.fromEntries(['testing','session','rules','content','campaign','ai','mapgen','platform'].map(k=>['@pr/'+k,path.join(game,'packages',k,'src/index.ts')]));
await build({stdin:{contents:`import {loadCatalog} from '@pr/content'; import {writeFileSync} from 'node:fs'; const c=loadCatalog(); writeFileSync(${JSON.stringify(path.join(root,'production/catalog.json'))},JSON.stringify(c,null,2)); console.log('Catalog exported',Object.keys(c.pantheons),Object.keys(c.townArchetypes));`,resolveDir:game,loader:'ts'},outfile:path.join(root,'production/catalog.bundle.cjs'),bundle:true,platform:'node',format:'cjs',alias});
await import('./catalog.bundle.cjs');
