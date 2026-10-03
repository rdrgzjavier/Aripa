const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const root = path.resolve(__dirname, '..');
const routes = ['/', ...fs.readdirSync(root).filter(name => name.endsWith('.html') && name !== 'index.html').map(name => '/' + name.replace(/\.html$/, '')), '/casos/', '/casos/shifta-auditoria/'];

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.fulfill({ status: 200, body: '' }));
    let count = 0;
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(base + route);
        const issues = await page.evaluate(() => [...document.querySelectorAll('.cta-core, .about-button, .cases-button, .btn-expertise, #contact-form [type=submit]')].filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
        }).map(el => {
          const tops = new Set();
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.textContent.trim()) continue;
            const range = document.createRange(); range.selectNodeContents(node);
            [...range.getClientRects()].forEach(rect => tops.add(Math.round(rect.top)));
          }
          return { text: el.textContent.trim().replace(/\s+/g, ' '), width: Math.round(el.getBoundingClientRect().width), lines: tops.size, overflow: el.scrollWidth > el.clientWidth + 1 };
        }).filter(item => item.lines > 1 || item.overflow));
        if (issues.length) { console.error(JSON.stringify({ width, route, issues })); count += issues.length; }
      }
    }
    if (count) throw new Error(`${count} CTA labels wrap or overflow`);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base + '/sobre-aripa');
    await page.locator('.about-actions .about-button').click();
    await page.waitForURL(base + '/#contacto');
    await page.locator('#contact-modal.active').waitFor();
    const pointerFocus = await page.locator('#contact-modal .modal-panel').evaluate(el => ({ active: el === document.activeElement, outline: getComputedStyle(el).outlineStyle }));
    if (!pointerFocus.active || pointerFocus.outline !== 'none') throw new Error('Pointer-opened dialog panel shows a focus ring or lacks focus');
    await page.keyboard.press('Tab');
    const keyboardFocus = await page.evaluate(() => ({ inDialog: !!document.activeElement.closest('#contact-modal'), outline: getComputedStyle(document.activeElement).outlineStyle }));
    if (!keyboardFocus.inDialog || keyboardFocus.outline === 'none') throw new Error('Keyboard focus in dialog is not visible');
    console.log(`PASS: CTA labels stay on one line without overflow across ${routes.length} routes and four widths`);
    console.log('PASS: pointer opens modal without panel ring; keyboard focus remains visible');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
