// Run with Node and Playwright available (or set PLAYWRIGHT_MODULE to its path).
// Optionally set PLAYWRIGHT_CHANNEL=chrome or msedge to use an installed browser.
// All external requests are intercepted. No contact or analytics data is sent.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(__dirname, '..');
const analytics = fs.readFileSync(path.join(root, 'assets/js/aripa-analytics.js'), 'utf8');
const consent = fs.readFileSync(path.join(root, 'assets/js/consent-analytics.js'), 'utf8');
const klaroStub = `
  window.__consents = {};
  window.__watchers = [];
  window.__manager = {
    getConsent: function (name) { return !!window.__consents[name]; },
    watch: function (watcher) { window.__watchers.push(watcher); }
  };
  window.klaro = { getManager: function () { return window.__manager; } };
  window.__setConsent = function (name, value) {
    window.__consents[name] = value;
    window.__watchers.forEach(function (watcher) {
      watcher.update(window.__manager, name, value);
    });
  };
`;

function localFile(urlPath) {
  let relative = decodeURIComponent(urlPath).replace(/^\/+/, '');
  if (!relative) relative = 'index.html';
  let file = path.resolve(root, relative);
  if (file !== root && !file.startsWith(root + path.sep)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) file = path.resolve(root, relative.replace(/\/$/, '') + '.html');
  return fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
}

const server = http.createServer((request, response) => {
  const file = localFile(new URL(request.url, 'http://localhost').pathname);
  if (!file) { response.writeHead(404); response.end(); return; }
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
  response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});

function allHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'tests') return [];
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? allHtmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}

async function eventList(page, name) {
  return page.evaluate(event => (window.dataLayer || []).filter(item => item.event === event), name);
}

async function fillContactForm(page) {
  const controls = page.locator('#contact-form input:visible, #contact-form textarea:visible, #contact-form select:visible');
  for (let i = 0; i < await controls.count(); i += 1) {
    const control = controls.nth(i);
    const info = await control.evaluate(el => ({ name: el.name, tag: el.tagName, type: el.type }));
    if (info.tag === 'SELECT') {
      const value = await control.evaluate(el => Array.from(el.options).find(option => option.value && !option.disabled)?.value);
      if (value) await control.selectOption(value);
    } else if (info.type === 'checkbox') {
      await control.check();
    } else if (!['submit', 'button', 'radio', 'hidden'].includes(info.type)) {
      const value = info.type === 'email' ? 'phase1@example.test'
        : info.type === 'url' || /web|url/.test(info.name) ? 'https://example.test'
        : info.type === 'tel' ? '+34 600 000 000'
        : info.name === 'name' ? 'Phase 1 regression'
        : 'Phase 1 private context test';
      await control.fill(value);
    }
  }
  // Service attribution is a controlled category, retained independently of free text.
  return page.locator('#contact-form [name="service"]').evaluate(el => {
    const options = Array.from(el.options || []);
    const value = options.find(option => option.value === 'cro')?.value || options.find(option => option.value && option.value !== 'general')?.value || 'general';
    el.value = value;
    return value;
  });
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 1365, height: 1000 }, serviceWorkers: 'block' });
    const requested = [];
    let formResponses = [];
    let postedPayloads = [];
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === base) { await route.continue(); return; }
      requested.push(request.url());
      if (url.hostname === 'formspree.io') {
        assert.equal(url.pathname, '/f/maqalopa');
        assert.equal(request.method(), 'POST');
        postedPayloads.push(request.postDataJSON());
        const status = formResponses.shift();
        assert.ok(status, 'Unexpected form submission');
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(status === 200 ? { ok: true } : { error: 'Simulated failure' }) });
      } else if (url.hostname === 'analytics.fixture') {
        await route.fulfill({ contentType: 'text/html', body: `<!doctype html><title>Analytics fixture</title><body><header id="site-header"><a href="/#contacto" onclick="event.preventDefault()">Solicitar análisis</a></header><script>${analytics}</script></body>` });
      } else if (url.hostname === 'consent.fixture') {
        await route.fulfill({ contentType: 'text/html', body: `<!doctype html><title>Consent fixture</title><script>window.dataLayer=[];window.gtag=function(){dataLayer.push(arguments)};gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});${klaroStub}</script><body><script>${consent}</script></body>` });
      } else if (url.hostname === 'api.kiprotect.com') {
        await route.fulfill({ contentType: 'text/javascript', body: klaroStub });
      } else {
        await route.fulfill({ status: 200, contentType: 'text/javascript', body: '/* External dependency deliberately intercepted by regression test. */' });
      }
    });

    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    page.on('dialog', dialog => dialog.dismiss());
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    for (const [urlPath, slug, type, group] of [
      ['/', 'home', 'home', 'home'],
      ['/index.html', 'index', 'home', 'home'],
      ['/servicios/', 'servicios', 'service', 'services'],
      ['/recursos/', 'recursos', 'resource_hub', 'resources'],
      ['/casos/', 'casos', 'case_studies', 'cases'],
      ['/casos/shifta-auditoria/', 'casos/shifta-auditoria', 'case_study', 'cases'],
      ['/sobre-aripa/', 'sobre-aripa', 'about', 'site']
    ]) {
      await page.goto('http://analytics.fixture' + urlPath);
      const events = await eventList(page, 'aripa_page_view');
      assert.equal(events.length, 1);
      assert.equal(events[0].page_slug, slug);
      assert.equal(events[0].page_type, type);
      assert.equal(events[0].content_group, group);
      await page.locator('#site-header a').click({ noWaitAfter: true });
      const clicks = await eventList(page, 'cta_click');
      assert.equal(clicks.at(-1).cta_type, 'contact');
      assert.equal(clicks.at(-1).cta_location, 'header');
    }
    console.log('PASS: canonical path metadata and contact CTA classification');

    await page.goto('http://analytics.fixture/');
    await page.evaluate(() => {
      const consent = document.createElement('div');
      consent.id = 'klaro';
      consent.innerHTML = '<button type="button" class="cm-btn">Aceptar</button>';
      document.body.appendChild(consent);
      consent.querySelector('button').click();
      const menu = document.createElement('button');
      menu.id = 'navigation-toggle';
      menu.type = 'button';
      menu.textContent = 'Menú';
      document.body.appendChild(menu);
      menu.click();
    });
    assert.equal((await eventList(page, 'cta_click')).length, 0, 'Consent and menu toggle must not count as CTAs');
    console.log('PASS: consent and menu controls excluded from CTA analytics');

    for (const consentName of ['google-analytics', 'google-tag-manager', 'microsoft-clarity']) {
      requested.length = 0;
      await page.goto('http://consent.fixture/');
      await page.waitForFunction(() => window.__watchers.length > 0);
      assert.equal(requested.some(url => /googletagmanager|clarity\.ms/.test(url)), false, 'Analytics must not load without consent');
      assert.deepEqual((await eventList(page, 'analytics_consent_update')).map(item => item.analytics_consent), ['denied']);
      await page.evaluate(name => window.__setConsent(name, true), consentName);
      await page.waitForFunction(() => [...document.scripts].some(script => script.src.includes('gtm.js?id=GTM-KBK55KW8')) && [...document.scripts].some(script => script.src.includes('clarity.ms/tag/wd9btxwafk')));
      await page.evaluate(name => window.__setConsent(name, true), consentName);
      assert.equal(await page.locator('script[src*="gtm.js?id=GTM-KBK55KW8"]').count(), 1);
      assert.equal(await page.locator('script[src*="clarity.ms/tag/wd9btxwafk"]').count(), 1);
      await page.evaluate(name => {
        document.cookie = '_ga_phase1=fixture; path=/';
        document.cookie = '_clck=fixture; path=/';
        window.__setConsent(name, false);
      }, consentName);
      assert.equal(await page.evaluate(() => /_ga_phase1|_clck/.test(document.cookie)), false);
      assert.deepEqual((await eventList(page, 'analytics_consent_update')).map(item => item.analytics_consent), ['denied', 'granted', 'denied']);
      const updates = await page.evaluate(() => dataLayer.filter(item => item[0] === 'consent').map(item => item[2]));
      assert.equal(updates.at(-1).analytics_storage, 'denied');
      assert.ok(updates.every(item => item.ad_storage === 'denied' && item.ad_user_data === 'denied' && item.ad_personalization === 'denied'));
    }
    console.log('PASS: consent default, accept, deduplicated loads, revoke and advertising denied (external services stubbed)');

    const contactPages = allHtmlFiles(root).filter(file => /id="contact-form"/.test(fs.readFileSync(file, 'utf8')));
    for (const file of contactPages) {
      const relative = path.relative(root, file).split(path.sep).join('/');
      pageErrors.length = 0;
      postedPayloads = [];
      formResponses = [500, 200];
      await page.goto(base + '/' + relative);
      await page.evaluate(() => window.openContactModal('cro'));
      const serviceInterest = await fillContactForm(page);
      const starts = await eventList(page, 'form_start');
      assert.equal(starts.length, 1, relative + ' must emit one form_start');
      assert.equal(starts[0].form_location, 'contact_modal');
      const submit = page.locator('#contact-form button[type="submit"]');
      await submit.click();
      await page.waitForFunction(() => !document.querySelector('#contact-form button[type="submit"]').disabled);
      assert.equal((await eventList(page, 'form_submit_attempt')).length, 1, relative + ' failed attempt');
      assert.equal((await eventList(page, 'generate_lead')).length, 0, relative + ' must not count a failed submission as a lead');
      assert.equal(await page.locator('#success-modal').evaluate(el => el.classList.contains('active')), false);
      await submit.click();
      await page.waitForFunction(() => document.getElementById('success-modal').classList.contains('active'));
      assert.equal((await eventList(page, 'form_submit_attempt')).length, 2, relative + ' retry must count');
      assert.equal((await eventList(page, 'generate_lead')).length, 1, relative + ' successful response must count once');
      assert.ok((await eventList(page, 'form_submit_attempt')).every(item => item.service_interest === serviceInterest));
      assert.equal(postedPayloads.length, 2);
      assert.equal(postedPayloads[1].service, serviceInterest);
      assert.equal(postedPayloads[1].email, 'phase1@example.test');
      const tracked = await page.evaluate(() => JSON.stringify(dataLayer));
      assert.equal(/phase1@example\.test|Phase 1 private context test|https:\/\/example\.test/.test(tracked), false, 'Free text/contact PII must not enter dataLayer');
      assert.deepEqual(pageErrors, [], relative + ' JS errors');
      console.log('PASS: contact failure → retry → success, attribution and no PII: ' + relative);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    formResponses = [200];
    await page.goto(base + '/');
    await page.evaluate(() => window.openContactModal('ux'));
    await fillContactForm(page);
    await page.locator('#contact-form button[type="submit"]').click();
    await page.waitForFunction(() => document.getElementById('success-modal').classList.contains('active'));
    assert.equal((await eventList(page, 'generate_lead'))[0].device_type, 'mobile');
    console.log('PASS: mobile contact submission and device attribution');
    console.log(`Verified ${contactPages.length} contact pages. All external calls were intercepted; production receipt is not tested.`);
    await context.close();
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
