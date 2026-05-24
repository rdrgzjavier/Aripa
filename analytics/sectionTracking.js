(function () {
  var selector = '[data-track-section]';
  var seen = new Set();

  function getDeviceType() {
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  }

  function getPageType() {
    return (document.body && document.body.dataset && document.body.dataset.page) || 'unknown';
  }

  function pushSectionView(sectionName) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'section_view',
      section_name: sectionName,
      page_type: getPageType(),
      page_path: window.location.pathname,
      device_type: getDeviceType()
    });
  }

  function initSectionTracking() {
    var sections = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
        var sectionName = entry.target.getAttribute('data-track-section');
        if (!sectionName || seen.has(sectionName)) return;
        seen.add(sectionName);
        pushSectionView(sectionName);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionTracking, { once: true });
  } else {
    initSectionTracking();
  }
})();
