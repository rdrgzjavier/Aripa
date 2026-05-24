(function () {
  var selector = '[data-track-section]';
  var viewedSections = new Set();
  var engagedSections = new Set();
  var visibleSections = new Map();
  var engagementThresholdMs = 8000;
  var timerId = 0;

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

  function pushSectionEngagement(sectionName, engagementTime) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'section_engagement',
      section_name: sectionName,
      engagement_time: engagementTime,
      page_type: getPageType(),
      page_path: window.location.pathname,
      device_type: getDeviceType()
    });
  }

  function stopTimerIfIdle() {
    if (timerId && visibleSections.size === 0) {
      window.clearInterval(timerId);
      timerId = 0;
    }
  }

  function startTimer() {
    if (timerId) return;

    timerId = window.setInterval(function () {
      var now = Date.now();

      visibleSections.forEach(function (state, section) {
        var sectionName = section.getAttribute('data-track-section');
        if (!sectionName || engagedSections.has(sectionName)) return;

        var totalMs = state.accumulatedMs + (now - state.startedAt);

        if (totalMs >= engagementThresholdMs) {
          engagedSections.add(sectionName);
          visibleSections.delete(section);
          pushSectionEngagement(sectionName, Math.round(totalMs / 1000));
        }
      });

      stopTimerIfIdle();
    }, 1000);
  }

  function startVisibility(section) {
    var sectionName = section.getAttribute('data-track-section');
    if (!sectionName || engagedSections.has(sectionName) || visibleSections.has(section)) return;

    visibleSections.set(section, {
      accumulatedMs: 0,
      startedAt: Date.now()
    });
    startTimer();
  }

  function stopVisibility(section) {
    var state = visibleSections.get(section);
    if (!state) return;

    state.accumulatedMs += Date.now() - state.startedAt;
    visibleSections.delete(section);
    stopTimerIfIdle();
  }

  function stopAllVisibility() {
    Array.prototype.slice.call(visibleSections.keys()).forEach(stopVisibility);
  }

  function isSectionVisible(section) {
    var rect = section.getBoundingClientRect();
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    return visibleHeight > 0 && visibleHeight / Math.max(rect.height, 1) >= 0.5;
  }

  function resumeVisibleSections(sections) {
    sections.forEach(function (section) {
      if (isSectionVisible(section)) startVisibility(section);
    });
  }

  function initSectionTracking() {
    var sections = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var sectionName = entry.target.getAttribute('data-track-section');

        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (sectionName && !viewedSections.has(sectionName)) {
            viewedSections.add(sectionName);
            pushSectionView(sectionName);
          }
          startVisibility(entry.target);
          return;
        }

        stopVisibility(entry.target);
      });
    }, { threshold: 0.5 });

    sections.forEach(function (section) {
      observer.observe(section);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAllVisibility();
        return;
      }

      resumeVisibleSections(sections);
    });

    window.addEventListener('pagehide', stopAllVisibility);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionTracking, { once: true });
  } else {
    initSectionTracking();
  }
})();
