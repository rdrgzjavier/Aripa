// Run against `npm run preview`; external services are intercepted.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const out = process.env.REVIEW_OUTPUT || path.resolve(__dirname, '../../review');
fs.mkdirSync(out, { recursive:true });
const root = path.resolve(__dirname, '..');
const routes = ['/', ...fs.readdirSync(root).filter(f=>f.endsWith('.html') && f !== 'index.html').map(f=>'/' + f.replace('.html','')), '/casos/', '/casos/shifta-auditoria/'];
(async () => {
  const browser = await chromium.launch({ headless:true, channel:process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
  const context = await browser.newContext();
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === base) return route.continue();
    return route.fulfill({contentType:'text/javascript', body: url.hostname === 'api.kiprotect.com' ? 'window.klaro={getManager:()=>({getConsent:()=>false,watch:()=>{}})};' : ''});
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', msg=>{ if(msg.type()==='error') errors.push(msg.text()); });
  const report = [];
  try {
    for (const width of [1440, 390]) {
      await page.setViewportSize({width,height:900});
      for (const route of routes) {
        errors.length = 0;
        const response = await page.goto(base+route);
        await page.locator('h1').waitFor();
        assert.equal(response.status(),200,route);
        assert.equal(await page.locator('h1').count(),1,route+' one h1');
        assert.ok(await page.locator('link[rel=canonical]').getAttribute('href'),route);
        const overflowing = await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflowing,false,route+' horizontal overflow '+width);
        if (width < 960) {
          assert.equal(await page.locator('#primary-navigation').isVisible(),false);
          await page.locator('#navigation-toggle').click();
          assert.equal(await page.locator('#primary-navigation').isVisible(),true);
          assert.equal(await page.locator('#navigation-toggle').getAttribute('aria-expanded'),'true');
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('#primary-navigation').isVisible(),false);
        } else {
          assert.equal(await page.locator('#primary-navigation').isVisible(),true);
          assert.equal(await page.locator('#navigation-toggle').isVisible(),false);
        }
        assert.deepEqual(await page.locator('#primary-navigation a').allTextContents(),['Servicios','Casos','Insights','Sobre Aripa','Solicitar análisis']);
        assert.deepEqual(errors,[],route+' console '+width);
        report.push({route,width,status:'passed'});
        if (['/','/servicios','/recursos','/sobre-aripa','/casos/'].includes(route)) {
          await page.screenshot({animations:'disabled',path:path.join(out,(route==='/'?'home':route.replaceAll('/',''))+'-'+width+'.png')});
          if (['/sobre-aripa','/casos/'].includes(route)) {
            await page.screenshot({animations:'disabled',fullPage:true,path:path.join(out,(route==='/casos/'?'casos':'sobre-aripa')+'-full-'+width+'.png')});
          }
        }
      }
    }
    await page.setViewportSize({width:1440,height:900});
    await page.goto(base+'/');
    // Exercise real links rather than only checking their target strings.
    for (const route of ['/servicios','/casos/','/recursos','/sobre-aripa']) {
      await page.locator('#primary-navigation a[href="'+route+'"]').click();
      await page.waitForURL(base+route);
    }
    await page.locator('#primary-navigation a[data-contact-link]').click();
    await page.waitForURL(base+'/#contacto');
    await page.locator('#contact-modal.active').waitFor();
    await page.screenshot({animations:'disabled',path:path.join(out,'contact-desktop.png')});
    await page.keyboard.press('Escape');
    await page.locator('#contact-modal').waitFor({state:'hidden'});
    await page.goto(base+'/');
    const sections = await page.locator('main > section').evaluateAll(nodes=>nodes.map(n=>n.dataset.trackSection));
    assert.deepEqual(sections,['hero','pain_points','services','clients','process','ideal_client','founder','principles','featured_insights','faq','final_cta']);
    await page.locator('#primary-navigation a[data-contact-link]').click();
    await page.locator('#contact-form button[type=submit]').click();
    assert.equal(await page.locator('#success-modal').isVisible(),false,'Invalid empty form cannot count as success');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#primary-navigation a[data-contact-link]').evaluate(el=>el===document.activeElement),true,'Focus returns to opener');
    await page.setViewportSize({width:390,height:844});
    await page.goto(base+'/');
    await page.locator('#navigation-toggle').click();
    await page.screenshot({animations:'disabled',path:path.join(out,'mobile-menu.png')});
    await page.locator('#primary-navigation a[data-contact-link]').click();
    await page.screenshot({animations:'disabled',path:path.join(out,'contact-mobile.png')});
    assert.equal(await page.locator('#primary-navigation').isVisible(),false);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#contact-modal')),true,'Focus trapped in form');
    await page.keyboard.press('Escape');
    await page.locator('#problema').scrollIntoViewIfNeeded();
    await page.screenshot({animations:'disabled',path:path.join(out,'home-mobile-content.png')});
    fs.writeFileSync(path.join(out,'ui-results.json'), JSON.stringify(report,null,2));
    console.log('PASS: '+report.length+' route/viewport checks, navigation, form validation, keyboard and Home narrative. Screenshots: '+out);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
