// Smoke test: open the built site exactly as GitHub Pages serves it (/Bucketlist/)
// and fail the deploy if the page is blank or throws.
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:4173/Bucketlist/';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const rootChildren = await page.evaluate(() => document.querySelector('#root')?.children.length ?? 0);
const heading = await page.evaluate(() => document.querySelector('h1')?.textContent ?? '');
console.log(`root children: ${rootChildren}`);
console.log(`h1: ${heading}`);
for (const e of errors) console.log(e);

// click through to a goal to make sure routing works on the sub-path
await page.click('[data-item]');
await page.waitForTimeout(500);
console.log(`goal page h1: ${await page.evaluate(() => document.querySelector('h1')?.textContent ?? '')}`);

await browser.close();
const fatal = errors.filter((e) => !/images\.unsplash\.com|fonts\.g/.test(e));
if (!rootChildren || !heading || fatal.length) {
  console.error('SMOKE TEST FAILED');
  process.exit(1);
}
console.log('SMOKE TEST PASSED');
