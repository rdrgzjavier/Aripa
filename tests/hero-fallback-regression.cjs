// Run against `npm run preview`; the Hero must remain legible when its canvas is late or unavailable.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const routes = ['/', '/servicios', '/recursos'];

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
  try {
    const context = await browser.newContext();
    await context.route('**/*', route => new URL(route.request().url()).origin === base
      ? route.continue()
      : route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/assets/js/hero-gradient.js*', route => route.abort());
    const page = await context.newPage();
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(base + route, { waitUntil: 'domcontentloaded' });
        const initial = await page.locator('#hero-section').evaluate(hero => ({
          background: getComputedStyle(hero).backgroundImage,
          heading: getComputedStyle(hero.querySelector('h1')).color,
        }));
        assert.match(initial.background, /rgb\(14, 18, 64\)/, `${route}: dark CSS fallback at ${width}px`);
        assert.equal(initial.heading, 'rgb(255, 255, 255)', `${route}: white heading at ${width}px`);
      }
    }
    await context.unroute('**/assets/js/hero-gradient.js*');
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => {
        const canvas = document.querySelector('#hero-gradient-canvas');
        const hero = document.querySelector('#hero-section');
        return canvas && hero && canvas.width === hero.clientWidth && canvas.height === hero.clientHeight;
      });
    }
    console.log('PASS: dark Hero fallback without canvas at 375/768/1024/1440px; canvas initializes on all three pages.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
