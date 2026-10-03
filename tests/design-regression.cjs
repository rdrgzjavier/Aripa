// Run against `npm run preview`; compare interior-page typography with Aripa's existing pages.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const routes = ['/', '/servicios', '/recursos', '/casos/', '/sobre-aripa'];

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => new URL(route.request().url()).origin === base
      ? route.continue()
      : route.fulfill({ contentType: 'text/javascript', body: '' }));
    const readings = {};
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(base + route);
        await page.evaluate(() => document.fonts.ready);
        readings[`${route}:${width}`] = await page.evaluate(() => {
          const properties = selector => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const style = getComputedStyle(element);
            return { family: style.fontFamily, size: parseFloat(style.fontSize), weight: style.fontWeight, lineHeight: style.lineHeight, align: style.textAlign };
          };
          const hero = document.querySelector('main > section');
          const header = document.querySelector('#site-header');
          const card = document.querySelector('.pill, .experience-card');
          return {
            h1: properties('main h1'), h2: properties('main h2'), h3: properties('main h3'),
            fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family}:${f.weight}`),
            heroBackground: hero ? getComputedStyle(hero).backgroundImage : '',
            headerBlur: header ? getComputedStyle(header).backdropFilter : '',
            cardRadius: card ? getComputedStyle(card).borderRadius : '',
            bodyBackground: getComputedStyle(document.body).backgroundColor,
          };
        });
      }
    }
    for (const width of [1440, 390]) {
      const home = readings[`/:${width}`];
      const services = readings[`/servicios:${width}`];
      assert.ok(home.fonts.some(font => font.startsWith('Inter:')), 'Home must load the shared Inter font');
      assert.ok(services.fonts.some(font => font.startsWith('Inter:')), 'Servicios must load the shared Inter font');
      for (const route of ['/servicios', '/recursos', '/casos/', '/sobre-aripa']) {
        const current = readings[`${route}:${width}`];
        assert.ok(current.fonts.some(font => font.startsWith('Inter:')), `${route}: shared Inter font must load`);
        assert.match(current.h1.family, /Inter/i, `${route}: H1 font`);
        assert.equal(current.h1.align, 'left', `${route}: H1 alignment`);
        if (route === '/servicios' || route === '/recursos') continue;
        assert.ok(current.h1.size >= Math.min(home.h1.size, services.h1.size) - 1, `${route}: H1 too small`);
        assert.ok(current.h1.size <= Math.max(home.h1.size, services.h1.size) + 1, `${route}: H1 too large`);
        assert.ok(current.h2.size <= Math.max(home.h2.size, services.h2.size) + 1, `${route}: H2 too large`);
        assert.ok(current.h3.size <= Math.max(home.h3.size, services.h3?.size || 0) + 1, `${route}: H3 too large`);
        assert.match(current.heroBackground, /gradient/, `${route}: branded hero gradient`);
        assert.match(current.headerBlur, /blur/, `${route}: glass header`);
        assert.equal(current.cardRadius, '16px', `${route}: card radius`);
        assert.equal(current.bodyBackground, 'rgb(252, 249, 248)', `${route}: warm background`);
      }
    }
    console.log(JSON.stringify(readings, null, 2));
    console.log('PASS: interior-page type scale matches Home and Servicios at desktop and mobile widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
