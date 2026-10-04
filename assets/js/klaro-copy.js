(() => {
  const message = 'Utilizamos herramientas de análisis para entender cómo interactúas con nuestra consultoría y mejorar tu experiencia. ¿Nos das tu consentimiento?';
  const updateNotice = () => {
    const notice = document.querySelector('#klaro .cookie-notice, #id-cookie-notice .cookie-notice');
    if (!notice) return;
    const paragraph = notice.querySelector('.cn-body p');
    if (paragraph && paragraph.textContent.trim() !== message) paragraph.textContent = message;
    const labels = [
      ['.cn-decline', 'Rechazar'],
      ['.cm-btn-success', 'Aceptar'],
      ['.cn-learn-more', 'Configurar']
    ];
    for (const [selector, label] of labels) {
      const control = notice.querySelector(selector);
      if (control && control.textContent.trim() !== label) control.textContent = label;
    }
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-label', 'Aviso de cookies y privacidad');
  };
  new MutationObserver(updateNotice).observe(document.documentElement, {childList:true, subtree:true});
  updateNotice();
})();
