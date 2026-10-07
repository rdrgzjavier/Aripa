(function () {
  window.dataLayer = window.dataLayer || [];

  var startedForms = new WeakSet();
  var generatedLead = false;
  var firedTimers = {};
  var pageMeta = getPageMeta();
  var directGa4Events = {
    aripa_page_view: true,
    form_start: true,
    form_submit_attempt: true,
    engagement_time: true,
    article_progress: true
  };

  function push(eventName, params) {
    var eventData = Object.assign({
      event: eventName,
      page_type: pageMeta.page_type,
      page_slug: pageMeta.page_slug,
      content_group: pageMeta.content_group,
      device_type: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop'
    }, params || {});

    window.dataLayer.push(eventData);

    /*
     * The events below do not have a dedicated GTM event tag. Sending them
     * through the Google tag keeps the existing GTM events untouched, honours
     * Consent Mode and never includes form fields or other personal data.
     */
    if (directGa4Events[eventName] && typeof window.gtag === 'function') {
      var ga4Params = Object.assign({}, eventData);
      delete ga4Params.event;
      window.gtag('event', eventName, ga4Params);
    }
  }

  function cleanText(value) {
    return (value || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  }

  function getPageMeta() {
    var pathName = window.location.pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '') || 'home';
    var pageType = 'other';
    var group = 'site';
    if (pathName === 'home' || pathName === 'index') { pageType = 'home'; group = 'home'; }
    else if (pathName === 'servicios' || pathName === 'captacion') { pageType = 'service'; group = 'services'; }
    else if (pathName === 'recursos') { pageType = 'resource_hub'; group = 'resources'; }
    else if (pathName === 'casos') { pageType = 'case_studies'; group = 'cases'; }
    else if (pathName.indexOf('casos/') === 0) { pageType = 'case_study'; group = 'cases'; }
    else if (pathName === 'sobre-aripa') { pageType = 'about'; }
    else if (document.querySelector('.article-body')) { pageType = 'article'; group = 'resources'; }
    else if (/politica|aviso-legal|privacidad/.test(pathName)) { pageType = 'legal'; group = 'legal'; }
    return { page_slug: pathName, page_type: pageType, content_group: group };
  }

  function getLocation(el) {
    if (!el) return 'unknown';
    if (el.closest('#site-header')) return 'header';
    if (el.closest('#mobile-bottom-nav')) return 'mobile_bottom_bar';
    if (el.closest('#sticky-bottom-bar')) return 'sticky_bottom_bar';
    if (el.closest('footer')) return 'footer';
    if (el.closest('#contact-modal')) return 'contact_modal';
    if (el.closest('aside')) return 'article_cta';
    if (el.closest('#recursos-grid')) return 'resources_grid';
    if (el.closest('#hero-section')) return 'hero';
    return 'body';
  }

  function getDestination(el) {
    return el.getAttribute('href') || el.getAttribute('data-cal-link') || el.getAttribute('onclick') || '';
  }

  function trackClick(e) {
    var el = e.target.closest('a, button, [onclick], [data-cal-link]');
    if (!el) return;
    if (el.id === 'navigation-toggle' || el.closest('#klaro, #id-cookie-notice, .klaro, .cookie-notice, .cm-modal')) return;
    var text = cleanText(el.innerText || el.getAttribute('aria-label') || el.getAttribute('href') || '');
    var destination = getDestination(el);
    var isCal = !!el.getAttribute('data-cal-link');
    var isContact = /openContactModal|contact-modal|#contacto|contactar|hablemos|solicitar an[aá]lisis/i.test(destination + ' ' + text);
    var isResource = !!el.closest('#recursos-grid');

    push('cta_click', {
      cta_text: text,
      cta_location: getLocation(el),
      cta_destination: destination,
      cta_type: isCal ? 'calendar' : isContact ? 'contact' : isResource ? 'resource' : 'navigation'
    });

    if (isCal) {
      push('schedule_intent', {
        cta_text: text,
        cta_location: getLocation(el),
        calendar_link: el.getAttribute('data-cal-link')
      });
    }
  }

  function trackFormStart(e) {
    var form = e.target.closest && e.target.closest('form');
    if (!form || form.id !== 'contact-form' || startedForms.has(form)) return;
    startedForms.add(form);
    push('form_start', {
      form_id: form.id,
      form_name: 'contact_form',
      form_location: getLocation(form)
    });
  }

  function trackFormSubmit(e) {
    var form = e.target;
    if (!form || form.id !== 'contact-form') return;
    var service = form.querySelector('[name="service"]');
    push('form_submit_attempt', {
      form_id: form.id,
      form_name: 'contact_form',
      form_location: getLocation(form),
      service_interest: service ? service.value : undefined
    });
  }

  function watchLeadSuccess() {
    var modal = document.getElementById('success-modal');
    if (!modal || !window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      if (!generatedLead && modal.classList.contains('active')) {
        generatedLead = true;
        push('generate_lead', {
          form_name: 'contact_form',
          lead_type: 'contact_request'
        });
      }
      if (!modal.classList.contains('active')) generatedLead = false;
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  function trackTimers() {
    [30, 60, 120].forEach(function (seconds) {
      window.setTimeout(function () {
        if (firedTimers[seconds]) return;
        firedTimers[seconds] = true;
        push('engagement_time', { engagement_seconds: seconds });
      }, seconds * 1000);
    });
  }

  function trackArticleProgress() {
    var article = document.querySelector('.article-body');
    if (!article) return;
    var milestones = [50, 90];
    var reached = {};

    function measureProgress() {
      var rect = article.getBoundingClientRect();
      var articleHeight = Math.max(article.offsetHeight, 1);
      var viewed = Math.min(Math.max(window.innerHeight - rect.top, 0), articleHeight);
      var percent = Math.round((viewed / articleHeight) * 100);
      milestones.forEach(function (milestone) {
        if (percent >= milestone && !reached[milestone]) {
          reached[milestone] = true;
          push('article_progress', { article_progress: milestone });
        }
      });
    }

    window.addEventListener('scroll', measureProgress, { passive: true });
    window.addEventListener('resize', measureProgress);
    measureProgress();
  }

  document.addEventListener('DOMContentLoaded', function () {
    push('aripa_page_view', {
      page_title: document.title,
      page_location: window.location.href
    });
    document.addEventListener('click', trackClick, true);
    document.addEventListener('focusin', trackFormStart, true);
    document.addEventListener('submit', trackFormSubmit, true);
    watchLeadSuccess();
    trackTimers();
    trackArticleProgress();
  });
})();
