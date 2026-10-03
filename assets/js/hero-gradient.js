(function () {
  'use strict';
  const canvas = document.getElementById('hero-gradient-canvas');
  const hero = document.getElementById('hero-section');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const orbs = [
    { color: [26, 42, 108], r: 1.06, ax: 0.30, ay: 0.22, px: 0.12, py: 0.16, speed: 0.0000037 },
    { color: [90, 50, 160], r: 1.00, ax: 0.27, ay: 0.34, px: 0.55, py: 0.22, speed: 0.0000028 },
    { color: [160, 80, 180], r: 0.96, ax: 0.22, ay: 0.38, px: 0.79, py: 0.58, speed: 0.0000022 },
    { color: [220, 95, 160], r: 0.90, ax: 0.35, ay: 0.24, px: 0.42, py: 0.76, speed: 0.0000031 }
  ];
  let visible = false;
  let frame = 0;
  let lastDraw = 0;

  function resize() {
    canvas.width = Math.max(1, Math.round(hero.clientWidth));
    canvas.height = Math.max(1, Math.round(hero.clientHeight));
    draw(performance.now());
  }
  function draw(timestamp) {
    const width = canvas.width, height = canvas.height;
    ctx.fillStyle = '#0e1240';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'screen';
    for (const orb of orbs) {
      const x = Math.max(0, Math.min(1, orb.px + orb.ax * Math.sin(timestamp * orb.speed * 1000 + orb.color[0]))) * width;
      const y = Math.max(0, Math.min(1, orb.py + orb.ay * Math.cos(timestamp * orb.speed * 700 + orb.color[2]))) * height;
      const radius = orb.r * Math.max(width, height);
      const [red, green, blue] = orb.color;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${red},${green},${blue},0.40)`);
      gradient.addColorStop(.45, `rgba(${red},${green},${blue},0.14)`);
      gradient.addColorStop(1, `rgba(${red},${green},${blue},0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  function tick(timestamp) {
    if (!visible || document.hidden || motion.matches) { frame = 0; return; }
    if (timestamp - lastDraw >= 32) { draw(timestamp); lastDraw = timestamp; }
    frame = requestAnimationFrame(tick);
  }
  function update() {
    if (!visible || document.hidden || motion.matches) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (motion.matches) draw(0);
      return;
    }
    if (!frame) frame = requestAnimationFrame(tick);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', update);
  motion.addEventListener('change', update);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    update();
  }, { threshold: 0 }).observe(hero);
}());
