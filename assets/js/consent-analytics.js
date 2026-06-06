(function () {
  if (window.location.protocol === 'http:' && /(^|\.)aripa\.es$/.test(window.location.hostname)) {
    window.location.replace('https://' + window.location.host + window.location.pathname + window.location.search + window.location.hash);
    return;
  }

  var clarityId = 'wd9btxwafk';
  var gaMeasurementId = 'G-8METZ78PVG';
  var clarityLoaded = false;
  var gaLoaded = false;
  var isSecureContext = window.location.protocol === 'https:';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  function deleteCookie(name) {
    var hostParts = window.location.hostname.split('.');
    var domains = ['', window.location.hostname];
    if (hostParts.length > 1) domains.push('.' + hostParts.slice(-2).join('.'));

    domains.forEach(function (domain) {
      var domainPart = domain ? '; domain=' + domain : '';
      document.cookie = name + '=; Max-Age=0; path=/' + domainPart + '; SameSite=Lax';
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + domainPart + '; SameSite=Lax';
    });
  }

  function clearAnalyticsCookies() {
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (/^(_ga|_gid|_gat|_clck|_clsk)/.test(name)) deleteCookie(name);
    });
  }
  function updateAnalyticsConsent(granted) {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (!granted) clearAnalyticsCookies();
  }

  function loadGoogleAnalytics() {
    if (gaLoaded || !isSecureContext) return;
    gaLoaded = true;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaMeasurementId);
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', gaMeasurementId, {
      anonymize_ip: true,
      cookie_domain: 'aripa.es',
      cookie_flags: 'SameSite=Lax;Secure',
      cookie_update: true,
      send_page_view: true
    });
  }

  function loadClarity() {
    if (clarityLoaded || window.clarity) return;
    clarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', clarityId);
  }

  function hasAnalyticsConsent(manager) {
    return !!(
      manager &&
      (manager.getConsent('google-analytics') ||
       manager.getConsent('google-tag-manager') ||
       manager.getConsent('microsoft-clarity'))
    );
  }

  function syncFromKlaro(manager) {
    var granted = hasAnalyticsConsent(manager);
    updateAnalyticsConsent(granted);
    if (granted) {
      loadGoogleAnalytics();
      loadClarity();
      window.dataLayer.push({ event: 'analytics_consent_granted' });
    }
  }

  function initConsentBridge() {
    if (typeof window.klaro === 'undefined' || !window.klaro.getManager) return false;

    var manager = window.klaro.getManager();
    syncFromKlaro(manager);

    if (manager && manager.watch) {
      manager.watch({
        update: function (updatedManager, name) {
          if (name === 'google-analytics' || name === 'google-tag-manager' || name === 'microsoft-clarity') {
            syncFromKlaro(updatedManager || manager);
          }
        }
      });
    }

    return true;
  }

  window.addEventListener('load', function () {
    if (initConsentBridge()) return;

    var attempts = 0;
    var intervalId = window.setInterval(function () {
      attempts += 1;
      if (initConsentBridge() || attempts >= 20) window.clearInterval(intervalId);
    }, 250);
  });
})();
