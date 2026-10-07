import {build} from '../../landing/node_modules/esbuild/lib/main.js';
import path from 'node:path';
const root=import.meta.dirname, game='C:/Users/lazeb/Desktop/pantheon_realms';
const alias=Object.fromEntries(['testing','session','rules','content','campaign','ai','mapgen','platform'].map(k=>['@pr/'+k,path.join(game,'packages',k,'src/index.ts')]));
await build({entryPoints:[path.join(root,'fixtures.ts')],outfile:path.join(root,'fixtures.cjs'),bundle:true,platform:'node',format:'cjs',alias});
process.env.CAPTURE_OUT=root;await import('./fixtures.cjs');
