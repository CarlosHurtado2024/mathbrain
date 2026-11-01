/* Una superficie matemática, sin imágenes remotas ni dependencias. */
(() => {
  'use strict';
  const rings = 144;
  const sides = 14;
  const tau = Math.PI * 2;
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const normalize = point => { const length = Math.hypot(...point); return point.map(value => value / length); };
  const curve = t => [(2 + .45 * Math.cos(3 * t)) * Math.cos(2 * t), (2 + .45 * Math.cos(3 * t)) * Math.sin(2 * t), 1.1 * Math.sin(3 * t)];
  let dispose = () => {};

  function mount() {
    dispose();
    dispose = () => {};
    const canvas = document.querySelector('[data-learning-network]');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const light = document.documentElement.dataset.theme === 'light';
    const color = light ? '8,123,78' : '89,247,189';
    const points = [];
    for (let ring = 0; ring < rings; ring += 1) {
      const t = ring / rings * tau;
      const center = curve(t);
      const next = curve(t + .001);
      const tangent = normalize(next.map((value, index) => value - center[index]));
      const normal = normalize(cross(tangent, [0, 0, 1]));
      const binormal = cross(normal, tangent);
      for (let side = 0; side < sides; side += 1) {
        const u = side / sides * tau;
        points.push(center.map((value, index) => value + .34 * (Math.cos(u) * normal[index] + Math.sin(u) * binormal[index])));
      }
    }
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = 0;
    let angle = .85;
    let visible = true;
    let pixelRatio = 1;

    function draw() {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width, height) * .129;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const projected = points.map(([x, y, z]) => {
        const tiltedY = y * .8 - z * .6;
        const tiltedZ = y * .6 + z * .8;
        const rotatedX = x * cos + tiltedZ * sin;
        const depth = -x * sin + tiltedZ * cos;
        const perspective = 7 / (7 + depth);
        return [width * .5 + rotatedX * scale * perspective, height * .5 + tiltedY * scale * perspective, depth];
      });
      ctx.lineWidth = .65;
      projected.forEach(([x, y, depth], index) => {
        const alpha = .11 + (2.8 - depth) / 5.6 * .3;
        ctx.strokeStyle = `rgba(${color},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const nextRing = projected[(index + sides) % projected.length];
        ctx.lineTo(nextRing[0], nextRing[1]);
        const ringStart = Math.floor(index / sides) * sides;
        const nextSide = projected[ringStart + (index + 1) % sides];
        ctx.moveTo(x, y);
        ctx.lineTo(nextSide[0], nextSide[1]);
        ctx.stroke();
        if (index % 7 === 0) {
          ctx.fillStyle = `rgba(${color},${alpha + .3})`;
          ctx.beginPath();
          ctx.arc(x, y, depth < 0 ? 1.45 : .85, 0, tau);
          ctx.fill();
        }
      });
      // Puntos deterministas alrededor de la superficie; no generan trabajo entre cuadros.
      for (let index = 0; index < 90; index += 1) {
        const t = index * 2.39996;
        const radius = .22 + ((index * 31) % 71) / 120;
        ctx.fillStyle = `rgba(${color},${.12 + (index % 5) * .05})`;
        ctx.beginPath();
        ctx.arc(width * .5 + Math.cos(t) * width * radius * .64, height * .5 + Math.sin(t) * height * radius * .65, index % 8 === 0 ? 1.6 : .7, 0, tau);
        ctx.fill();
      }
    }
    function stop() { if (frame) window.cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    function tick(time) {
      frame = 0;
      if (lastTime && time - lastTime >= 33) { angle += Math.min(time - lastTime, 80) * .00009; lastTime = time; draw(); }
      else if (!lastTime) lastTime = time;
      frame = window.requestAnimationFrame(tick);
    }
    function sync() {
      stop();
      if (visible && !document.hidden && !motion.matches) frame = window.requestAnimationFrame(tick);
      else draw();
    }
    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw();
    }
    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    canvas.parentElement.classList.add('is-ready');
    resize();
    sync();
    dispose = () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync);
    };
  }
  document.addEventListener('zuka:routechange', mount);
})();
