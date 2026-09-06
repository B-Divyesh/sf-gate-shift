import { access, readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const required = ['dist/index.html', 'dist/404.html', 'dist/staticwebapp.config.json'];
await Promise.all(required.map((file) => access(file)));

const config = JSON.parse(await readFile('dist/staticwebapp.config.json', 'utf8'));
if (config.responseOverrides?.['404']?.rewrite !== '/404.html' || config.responseOverrides?.['404']?.statusCode !== 404) {
  throw new Error('The deploy artifact must use the designed 404 page with HTTP 404.');
}
if (!config.globalHeaders?.['Content-Security-Policy'] || !config.globalHeaders?.['Permissions-Policy']) {
  throw new Error('The deploy artifact is missing its security headers.');
}
const immutableAssets = config.routes?.some((route) => route.route === '/assets/*' && /immutable/.test(route.headers?.['Cache-Control'] ?? ''));
if (!immutableAssets) throw new Error('The deploy artifact is missing immutable caching for hashed assets.');
const staticMissesReach404 = config.navigationFallback?.exclude?.some((pattern) => pattern.includes('png') && pattern.includes('svg'));
if (!staticMissesReach404) throw new Error('Unknown static files would fall through to the SPA instead of the designed HTTP 404.');

const assets = await readdir('dist/assets');
let jsGzip = 0;
let cssGzip = 0;
for (const asset of assets) {
  const bytes = gzipSync(await readFile(`dist/assets/${asset}`)).byteLength;
  if (asset.endsWith('.js')) jsGzip += bytes;
  if (asset.endsWith('.css')) cssGzip += bytes;
}
if (jsGzip > 200_000) throw new Error(`Initial JavaScript is ${jsGzip} gzip bytes; budget is 200000.`);
if (cssGzip > 50_000) throw new Error(`CSS is ${cssGzip} gzip bytes; budget is 50000.`);
console.log(JSON.stringify({ required, jsGzip, cssGzip }));
