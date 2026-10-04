// Run against `npm run preview`; verify the Hero/header transition on every affected page.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const out = process.env.REVIEW_OUTPUT || path.resolve(__dirname, '../../review');
const heroRoutes = ['/', '/servicios', '/recursos', '/casos/', '/casos/shifta-auditoria/', '/casos/mamas-de-cielo-y-tierra/', '/sobre-aripa', '/aviso-legal', '/politica-cookies', '/politica-privacidad'];
const plainRoute = '/analitica-pymes-decisiones';

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => new URL(route.request().url()).origin === base
      ? route.continue()
      : route.fulfill({ contentType: 'text/javascript', body: '' }));
    const headerState = () => page.locator('#site-header').evaluate(el => {
      const style = getComputedStyle(el);
      return { sticky: el.classList.contains('is-sticky'), color: style.backgroundColor, blur: style.backdropFilter };
    });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of heroRoutes) {
        await page.goto(base + route);
        await page.waitForTimeout(350);
        assert.equal(await page.locator('#site-header.aripa-hero-header').count(), 1, `${route}: Hero header marker`);
        let state = await headerState();
        assert.equal(state.sticky, false, `${route}: not sticky at top`);
        assert.equal(state.color, 'rgba(0, 0, 0, 0)', `${route}: transparent at top`);
        if ((route === '/' || route === '/casos/') && width === 1440) {
          await page.screenshot({ animations: 'disabled', path: path.join(out, `${route === '/' ? 'home' : 'casos'}-header-top.png`) });
        }
        await page.evaluate(() => window.scrollTo(0, 180));
        await page.waitForTimeout(350);
        state = await headerState();
        assert.equal(state.sticky, true, `${route}: sticky after scroll`);
        assert.match(state.color, /^rgba?\(6, 21, 66,?/, `${route}: dark after scroll`);
        assert.match(state.blur, /blur\(14px\)/, `${route}: blurred after scroll`);
        if ((route === '/' || route === '/casos/') && width === 1440) {
          await page.screenshot({ animations: 'disabled', path: path.join(out, `${route === '/' ? 'home' : 'casos'}-header-sticky.png`) });
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(350);
        state = await headerState();
        assert.equal(state.color, 'rgba(0, 0, 0, 0)', `${route}: transparent again at top`);
      }
      await page.goto(base + plainRoute);
      await page.waitForTimeout(350);
      const state = await headerState();
      assert.equal(await page.locator('#site-header.aripa-hero-header').count(), 0, 'Article has no Hero marker');
      assert.match(state.color, /^rgba?\(6, 21, 66,?/, 'Article keeps dark header');
    }
    console.log(`PASS: ${heroRoutes.length} Hero pages transparent → dark on scroll → transparent at top; plain article stays dark, desktop and mobile.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
