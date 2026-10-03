(function () {
  'use strict';
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('navigation-toggle');
  const nav = document.getElementById('primary-navigation');
  const mobile = window.matchMedia('(max-width: 959px)');
  const focusable = 'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([hidden]), textarea, [tabindex="0"]';
  let returnFocus = null;
  let activeModal = null;
  const serviceAliases = {
    'CRO y Conversión': 'cro', 'UX/UI de Negocio': 'ux', 'Analítica y Medición': 'analitica',
    'Growth y Experimentación': 'growth', 'SEO, GEO y Contenido': 'seo_geo',
    'Landings y Activos Web': 'landings', 'Automatización': 'automatizacion',
    'Servicios B2B / Soporte': 'servicios_complementarios'
  };

  function closeNavigation(restore) {
    nav?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Abrir menú');
    if (restore) toggle?.focus();
  }
  toggle?.addEventListener('click', function () {
    const opened = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(opened));
    toggle.setAttribute('aria-label', opened ? 'Cerrar menú' : 'Abrir menú');
  });
  mobile.addEventListener('change', function () { closeNavigation(false); });
  document.addEventListener('click', function (event) {
    if (header && !header.contains(event.target)) closeNavigation(false);
    const contactLink = event.target.closest('a[data-contact-link]');
    if (contactLink && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0 && document.getElementById('contact-form')) {
      event.preventDefault();
      closeNavigation(false);
      window.openContactModal();
    } else if (event.target.closest('#primary-navigation a')) closeNavigation(false);
  });
  const sticky = function () { header?.classList.toggle('is-sticky', window.scrollY > 20); };
  window.addEventListener('scroll', sticky, { passive: true });
  sticky();
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav?.classList.contains('is-open')) closeNavigation(true);
  });

  if (!document.getElementById('contact-form')) return;

  function visibleControls(root) {
    return Array.from(root.querySelectorAll(focusable)).filter(function (el) { return el.getClientRects().length && !el.closest('[hidden]'); });
  }
  // Keep the established modal IDs and .active success signal used by analytics.
  window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (!activeModal) returnFocus = document.activeElement;
    if (activeModal && activeModal !== modal) activeModal.classList.remove('active');
    activeModal = modal;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    const panel = modal.querySelector('.modal-panel') || modal;
    panel.setAttribute('tabindex', '-1');
    requestAnimationFrame(function () { panel.focus({ preventScroll: true }); });
  };
  window.closeModal = function (id) {
    const modal = document.getElementById(id);
    modal?.classList.remove('active');
    if (activeModal === modal) activeModal = null;
    if (!document.querySelector('.modal-overlay.active')) document.body.classList.remove('modal-open');
    if (returnFocus?.isConnected && returnFocus.getClientRects().length) returnFocus.focus({ preventScroll: true });
    else if (mobile.matches) toggle?.focus({ preventScroll: true });
  };
  window.openContactModal = function (serviceValue) {
    const service = document.getElementById('service');
    if (service) {
      service.value = serviceAliases[serviceValue] || serviceValue || 'general';
      if (!service.value) service.value = 'general';
    }
    closeNavigation(false);
    window.openModal('contact-modal');
  };
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (activeModal) window.closeModal(activeModal.id);
      else if (nav?.classList.contains('is-open')) closeNavigation(true);
    }
    if (event.key !== 'Tab' || !activeModal) return;
    const controls = visibleControls(activeModal);
    const first = controls[0], last = controls[controls.length - 1];
    if (!first) return;
    const current = document.activeElement;
    if (event.shiftKey && (current === first || !controls.includes(current))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (current === last || !controls.includes(current))) {
      event.preventDefault(); first.focus();
    }
  });
  document.querySelectorAll('.modal-overlay').forEach(function (modal) {
    modal.addEventListener('click', function (event) { if (event.target === modal) window.closeModal(modal.id); });
  });
  window.handleFormSubmit = async function (event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('[type="submit"]');
    if (button.disabled) return;
    const error = form.querySelector('[role="alert"]');
    const original = button.innerHTML;
    if (error) error.hidden = true;
    button.disabled = true;
    button.textContent = 'ENVIANDO…';
    try {
      const response = await fetch('https://formspree.io/f/maqalopa', {
        method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
      });
      if (!response.ok) throw new Error('Submission failed');
      window.openModal('success-modal');
      form.reset();
    } catch (failure) {
      if (error) { error.hidden = false; error.focus(); }
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  };
  function openFromHash() {
    if (window.location.hash === '#contacto') window.openContactModal();
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}());
