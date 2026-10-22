(() => {
  'use strict';

  const layer = document.getElementById('space-background');
  const canvas = document.getElementById('space-canvas');
  const toggle = document.getElementById('space-motion-toggle');
  if (!layer || !canvas || !toggle) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const storageKey = 'mathbrain-space-paused';
  const tau = Math.PI * 2;
  let paused = false;
  try { paused = localStorage.getItem(storageKey) === 'true'; } catch { /* El fondo funciona sin almacenamiento. */ }

  let width = 0;
  let height = 0;
  let stars = [];
  let meteors = [];
  let dust = [];
  let frameId = 0;
  let previousFrame = null;
  let time = 0;
  let nextMeteor = 1.2;
  let scrollTarget = window.scrollY || 0;
  let scrollPosition = scrollTarget;
  let suspended = false;
  const pointer = { x: 0, y: 0, visible: false, movedAt: -Infinity, emittedAt: -Infinity };
  const offset = { x: 0, y: 0 };
  const random = (min, max) => min + Math.random() * (max - min);
  const mobile = () => width < 650 || !finePointer.matches;
  const running = () => !paused && !reducedMotion.matches && !document.hidden && !suspended;

  // Un sprite pequeño evita recalcular el degradado del cursor en cada fotograma.
  const glow = document.createElement('canvas');
  glow.width = glow.height = 160;
  const glowContext = glow.getContext('2d');
  if (glowContext) {
    const gradient = glowContext.createRadialGradient(80, 80, 0, 80, 80, 80);
    gradient.addColorStop(0, '#91c6ff22');
    gradient.addColorStop(.35, '#5acdd515');
    gradient.addColorStop(1, '#5acdd500');
    glowContext.fillStyle = gradient;
    glowContext.fillRect(0, 0, 160, 160);
  }

  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, mobile() ? 1.25 : 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(mobile() ? 65 : 155, Math.max(30, Math.round(width * height / 8500)));
    stars = Array.from({ length: count }, () => ({
      x: random(0, width), y: random(0, height), radius: random(.4, 1.3),
      depth: random(.2, 1), opacity: random(.28, .7), phase: random(0, tau)
    }));
    meteors = [];
    dust = [];
    pointer.visible = false;
    offset.x = offset.y = 0;
    paint(0);
  }

  function spawnMeteor() {
    if (meteors.length >= (mobile() ? 1 : 2)) return;
    const speed = random(480, 780);
    const angle = random(.55, .85);
    meteors.push({
      x: random(-width * .1, width * .85), y: random(-70, height * .35),
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      length: random(95, mobile() ? 150 : 230), age: 0, life: random(.9, 1.5)
    });
  }

  function paint(dt) {
    ctx.clearRect(0, 0, width, height);
    const animated = running();
    const pointerActive = animated && finePointer.matches && pointer.visible && performance.now() - pointer.movedAt < 1400;
    const easing = 1 - Math.exp(-dt * 4);
    const targetX = pointerActive ? (pointer.x / width - .5) * 18 : 0;
    const targetY = pointerActive ? (pointer.y / height - .5) * 12 : 0;
    offset.x += (targetX - offset.x) * easing;
    offset.y += (targetY - offset.y) * easing;
    scrollPosition += (scrollTarget - scrollPosition) * easing;

    if (pointerActive && glowContext) ctx.drawImage(glow, pointer.x - 140, pointer.y - 140, 280, 280);
    let connections = 0;
    for (const star of stars) {
      const x = ((star.x + offset.x * star.depth) % width + width) % width;
      const drift = reducedMotion.matches ? 0 : time * (.6 + star.depth);
      const y = ((star.y + drift + offset.y * star.depth - scrollPosition * star.depth * .045) % height + height) % height;
      const twinkle = reducedMotion.matches ? 1 : .78 + .22 * Math.sin(time * .9 + star.phase);
      ctx.fillStyle = `rgba(190,214,255,${star.opacity * twinkle})`;
      ctx.beginPath();
      ctx.arc(x, y, star.radius, 0, tau);
      ctx.fill();

      if (pointerActive && connections < 6) {
        const distance = Math.hypot(x - pointer.x, y - pointer.y);
        if (distance < 155) {
          ctx.strokeStyle = `rgba(137,217,239,${(1 - distance / 155) * .24})`;
          ctx.lineWidth = .65;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(x, y);
          ctx.stroke();
          connections++;
        }
      }
    }

    if (!animated) return;
    for (let i = meteors.length - 1; i >= 0; i--) {
      const meteor = meteors[i];
      meteor.age += dt;
      meteor.x += meteor.vx * dt;
      meteor.y += meteor.vy * dt;
      if (meteor.age >= meteor.life || meteor.x > width + 250 || meteor.y > height + 250) {
        meteors.splice(i, 1);
        continue;
      }
      const speed = Math.hypot(meteor.vx, meteor.vy);
      const tailX = meteor.x - meteor.vx / speed * meteor.length;
      const tailY = meteor.y - meteor.vy / speed * meteor.length;
      const alpha = Math.sin(meteor.age / meteor.life * Math.PI) * .72;
      const streak = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
      streak.addColorStop(0, 'rgba(110,160,255,0)');
      streak.addColorStop(.65, `rgba(126,194,255,${alpha * .4})`);
      streak.addColorStop(1, `rgba(220,246,255,${alpha})`);
      ctx.strokeStyle = streak;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(meteor.x, meteor.y);
      ctx.stroke();
      ctx.fillStyle = `rgba(224,247,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, 1.4, 0, tau);
      ctx.fill();
    }

    for (let i = dust.length - 1; i >= 0; i--) {
      const particle = dust[i];
      particle.age += dt;
      if (particle.age >= particle.life) { dust.splice(i, 1); continue; }
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      const alpha = (1 - particle.age / particle.life) * .65;
      ctx.fillStyle = `rgba(160,227,244,${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, tau);
      ctx.fill();
      const neighbor = dust[i - 1];
      if (neighbor && Math.hypot(neighbor.x - particle.x, neighbor.y - particle.y) < 55) {
        ctx.strokeStyle = `rgba(131,201,244,${alpha * .28})`;
        ctx.lineWidth = .6;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(neighbor.x, neighbor.y);
        ctx.stroke();
      }
    }
  }

  function frame(timestamp) {
    frameId = 0;
    if (!running()) return;
    if (previousFrame === null) previousFrame = timestamp;
    const elapsed = timestamp - previousFrame;
    // Treinta fotogramas por segundo bastan para un fondo suave.
    if (elapsed >= 1000 / 30) {
      const dt = Math.min(elapsed / 1000, .06);
      previousFrame = timestamp - elapsed % (1000 / 30);
      time += dt;
      nextMeteor -= dt;
      if (nextMeteor <= 0) {
        spawnMeteor();
        nextMeteor = mobile() ? random(6, 10) : random(3, 6);
      }
      paint(dt);
    }
    frameId = requestAnimationFrame(frame);
  }

  function syncState() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    previousFrame = null;
    meteors = [];
    dust = [];
    pointer.visible = false;
    const active = running();
    layer.dataset.state = reducedMotion.matches ? 'static' : paused ? 'paused' : active ? 'running' : 'idle';
    toggle.hidden = reducedMotion.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Reanudar animación del fondo espacial' : 'Pausar animación del fondo espacial');
    toggle.querySelector('.space-motion-label').textContent = paused ? 'Reanudar fondo' : 'Pausar fondo';
    paint(0);
    if (active) frameId = requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove', event => {
    if (!running() || !finePointer.matches || event.pointerType === 'touch') return;
    const now = performance.now();
    const moved = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
    if (moved > 4 && now - pointer.emittedAt > 22) {
      dust.push({ x: event.clientX, y: event.clientY, vx: random(-10, 10), vy: random(-12, 8), age: 0, life: random(.55, 1.2), radius: random(.8, 1.8) });
      if (dust.length > 45) dust.shift();
      pointer.emittedAt = now;
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.movedAt = now;
    pointer.visible = true;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointer.visible = false; });
  window.addEventListener('scroll', () => { scrollTarget = window.scrollY || 0; }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pagehide', () => { suspended = true; syncState(); });
  window.addEventListener('pageshow', () => { suspended = false; syncState(); });
  document.addEventListener('visibilitychange', syncState);
  reducedMotion.addEventListener('change', syncState);
  finePointer.addEventListener('change', () => { resize(); syncState(); });
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem(storageKey, String(paused)); } catch { /* La pausa sigue funcionando en esta página. */ }
    syncState();
  });

  resize();
  syncState();
})();
