/* IB·BEURS — market navigation instrument.
   Verbatim from the original Claude Design export (New Test Ai/js/instrument.js),
   wrapped as a module. The only addition is an IntersectionObserver that pauses the
   needle drift while the hero is off screen (invisible; avoids off-screen repaint). */
export function initCompass() {
  const svg = document.getElementById('instrument');
  if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const CX = 700, CY = 1010, R = 560;        // disc centre sits below the viewBox — only the upper arc shows
  const rad = d => d * Math.PI / 180;
  const px = (d, r) => CX + r * Math.cos(rad(d));
  const py = (d, r) => CY + r * Math.sin(rad(d));
  const heading = a => ((a + 450) % 360 + 360) % 360;   // -90deg (top) -> 000

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(n);
    return n;
  }
  function arc(r, a0, a1) {
    return 'M ' + px(a0, r) + ' ' + py(a0, r) +
           ' A ' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' +
           px(a1, r) + ' ' + py(a1, r);
  }
  function tick(g, a, r0, r1, stroke, w, o) {
    el('line', { x1: px(a, r0), y1: py(a, r0), x2: px(a, r1), y2: py(a, r1),
                 stroke: stroke, 'stroke-width': w, opacity: o }, g);
  }

  /* ---- atmosphere: faint coordinate system on the light field ---- */
  const atmos = el('g', { id: 'atmos' });
  el('path', { d: arc(704, -168, -12), fill: 'none', stroke: '#16181a', 'stroke-width': 1, opacity: 0.05 }, atmos);
  el('path', { d: arc(806, -165, -15), fill: 'none', stroke: '#16181a', 'stroke-width': 1, opacity: 0.035 }, atmos);
  for (let a = -165; a <= -15; a += 15) tick(atmos, a, 668, 704, '#16181a', 1, 0.06);

  /* ---- disc: dark instrument face ---- */
  el('circle', { cx: CX, cy: CY, r: R + 6, fill: '#0b0d0d', opacity: 0.16, filter: 'url(#f-soft)' });
  el('circle', { cx: CX, cy: CY, r: R, fill: 'url(#discGrad)' });
  el('path', { d: arc(R - 1, -152, -28), fill: 'none', stroke: '#ffffff', opacity: 0.09, 'stroke-width': 1.5 });
  el('path', { d: arc(468, -150, -30), fill: 'none', stroke: '#ffffff', opacity: 0.045, 'stroke-width': 1 });

  /* ---- outer measurement scale (on the light field) ---- */
  const outer = el('g', { id: 'outer-scale' });
  for (let a = -160; a <= -20; a += 5) {
    const major = heading(a) % 15 === 0;
    tick(outer, a, 582, major ? 600 : 593, '#16181a', 1, major ? 0.28 : 0.14);
  }
  for (const a of [-150, -120, -90, -60, -30]) {
    el('text', { x: px(a, 632), y: py(a, 632) + 4, 'text-anchor': 'middle',
                 fill: '#16181a', opacity: 0.34, 'font-size': 13, class: 'num' },
       outer).textContent = String(heading(a)).padStart(3, '0');
  }

  /* ---- inner fine ticks on the disc rim ---- */
  const inner = el('g', { id: 'inner-scale' });
  for (let a = -152; a <= -28; a += 2) {
    const major = heading(a) % 10 === 0;
    tick(inner, a, major ? 534 : 543, 553, '#ffffff', 1, major ? 0.26 : 0.10);
  }

  /* ---- market orientation labels ---- */
  const markets = [['GOLD', -141], ['US10Y', -116], ['SPX', -91], ['BRENT', -41]];
  const mg = el('g', { id: 'markets' });
  for (const [name, a] of markets) {
    el('circle', { cx: px(a, 488), cy: py(a, 488), r: 2, fill: '#ffffff', opacity: 0.3 }, mg);
    el('text', { x: px(a, 452), y: py(a, 452) + 4, 'text-anchor': 'middle',
                 fill: '#ffffff', opacity: 0.4, 'font-size': 12.5, class: 'lbl' }, mg).textContent = name;
  }

  /* ---- embedded signal line (intermarket series) ---- */
  const pts = [];
  for (let a = -150; a <= -32; a += 2) {
    const i = (a + 150) / 2;
    const r = 392 + 26 * Math.sin(i * 0.55) + 13 * Math.sin(i * 1.3 + 2) + 7 * Math.sin(i * 2.3 + 5);
    pts.push(px(a, r).toFixed(1) + ',' + py(a, r).toFixed(1));
  }
  const spark = el('polyline', { points: pts.join(' '), fill: 'none',
    'stroke-width': 1.5, opacity: 0.42, 'stroke-linejoin': 'round', style: 'stroke: var(--accent)' });
  const endXY = pts[pts.length - 1].split(',');
  const sparkDot = el('circle', { cx: endXY[0], cy: endXY[1], r: 2.6, style: 'fill: var(--accent)', opacity: 0 });

  /* ---- active sector arc ---- */
  el('path', { d: arc(502, -86, -50), fill: 'none', stroke: 'url(#arcGrad)',
               'stroke-width': 2, 'stroke-linecap': 'round' });

  /* ---- needle group (drifts a few degrees) ---- */
  const needle = el('g', { id: 'needle' });
  const A = -66; // base bearing -> heading 024
  el('line', { x1: px(A, 120), y1: py(A, 120), x2: px(A, 470), y2: py(A, 470),
               stroke: '#e9eae8', 'stroke-width': 1.4, opacity: 0.5 }, needle);
  el('line', { x1: px(A, 470), y1: py(A, 470), x2: px(A, 524), y2: py(A, 524),
               'stroke-width': 2, style: 'stroke: var(--accent)' }, needle);
  el('circle', { cx: px(A, 524), cy: py(A, 524), r: 46, filter: 'url(#f-glow)',
                 class: 'breathe', style: 'fill: var(--accent)' }, needle);
  el('circle', { cx: px(A, 524), cy: py(A, 524), r: 12, opacity: 0.3,
                 filter: 'url(#f-halo)', style: 'fill: var(--accent)' }, needle);
  el('circle', { cx: px(A, 524), cy: py(A, 524), r: 4, style: 'fill: var(--accent)' }, needle);
  el('line', { x1: px(A, 544), y1: py(A, 544), x2: px(A, 724), y2: py(A, 724),
               'stroke-width': 1, opacity: 0.28, 'stroke-dasharray': '2 5',
               style: 'stroke: var(--accent)' }, needle);
  el('text', { x: px(A, 446), y: py(A, 446) + 4, 'text-anchor': 'middle', 'font-size': 13,
               'letter-spacing': '0.14em', 'font-weight': 600, class: 'lbl',
               style: 'fill: var(--accent)' }, needle).textContent = 'DXY';
  el('text', { x: px(A, 408), y: py(A, 408) + 4, 'text-anchor': 'middle', 'font-size': 12.5,
               fill: '#ffffff', opacity: 0.5, class: 'num' }, needle).textContent = '104.2';

  /* ---- motion ---- */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionOn = () => !document.body.classList.contains('motion-off') && !reduced.matches;

  // signal line draw-in
  try {
    const L = spark.getTotalLength();
    if (motionOn()) {
      spark.style.strokeDasharray = L;
      spark.style.strokeDashoffset = L;
      sparkDot.style.transition = 'opacity .8s ease 2.6s';
      requestAnimationFrame(() => {
        spark.style.transition = 'stroke-dashoffset 2.6s cubic-bezier(.4,0,.2,1) .7s';
        spark.style.strokeDashoffset = 0;
        sparkDot.setAttribute('opacity', 0.85);
      });
    } else {
      sparkDot.setAttribute('opacity', 0.85);
    }
  } catch (e) { sparkDot.setAttribute('opacity', 0.85); }

  // needle drift + live heading readout — paused while the hero is off screen
  const readout = document.getElementById('heading-readout');
  const heroEl = document.querySelector('.hero');
  const t0 = performance.now();
  let lastDrift = 0, heroVisible = true;
  function frame(now) {
    if (motionOn() && heroVisible) {
      const t = (now - t0) / 1000;
      const d = 3.1 * Math.sin(t * 0.21) + 1.5 * Math.sin(t * 0.057 + 1.7);
      if (Math.abs(d - lastDrift) > 0.01) {
        needle.setAttribute('transform', 'rotate(' + d.toFixed(2) + ' ' + CX + ' ' + CY + ')');
        if (readout) readout.textContent = (heading(A) + d).toFixed(1) + '°';
        lastDrift = d;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (readout) readout.textContent = heading(A).toFixed(1) + '°';
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }, { threshold: 0 }).observe(heroEl);
  }

  // hover tilt — refined, a few degrees only
  const tiltEl = document.querySelector('.instrument-tilt');
  const hero = document.querySelector('.hero');
  if (tiltEl && hero && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', e => {
      if (!motionOn()) return;
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tiltEl.style.transform =
        'perspective(1400px) rotateY(' + (nx * 3).toFixed(2) + 'deg) rotateX(' + (-ny * 1.8).toFixed(2) + 'deg)';
    });
    hero.addEventListener('mouseleave', () => {
      tiltEl.style.transform = 'perspective(1400px) rotateY(0deg) rotateX(0deg)';
    });
  }

  /* phone: swap the cropped arc for a full ROUND compass that reacts to the
     device's orientation. Built always; CSS reveals it only on phones. The arc
     (and its mouse hover-tilt) stays for tablet/desktop. */
  setupMobileCompass(document.querySelector('.instrument-tilt'));
}

/* ---- full round compass (phones) ---- */
function buildRoundCompass(host) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('id', 'instrument-round');
  svg.setAttribute('viewBox', '0 0 600 600');
  svg.setAttribute('aria-hidden', 'true');
  const el = (tag, attrs, par) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); (par || svg).appendChild(n); return n; };
  const CX = 300, CY = 300;
  const rad = (d) => (d - 90) * Math.PI / 180;     // 0° at the top, clockwise
  const px = (d, r) => CX + r * Math.cos(rad(d));
  const py = (d, r) => CY + r * Math.sin(rad(d));

  const defs = el('defs', {});
  const dg = el('radialGradient', { id: 'rDisc', cx: '0.5', cy: '0.34', r: '0.9' }, defs);
  el('stop', { offset: '0', 'stop-color': '#303436' }, dg);
  el('stop', { offset: '0.6', 'stop-color': '#1f2224' }, dg);
  el('stop', { offset: '1', 'stop-color': '#141617' }, dg);
  const glow = el('filter', { id: 'rGlow', x: '-200%', y: '-200%', width: '500%', height: '500%' }, defs);
  el('feGaussianBlur', { stdDeviation: '13' }, glow);

  el('circle', { cx: CX, cy: CY, r: 270, fill: '#0b0d0d', opacity: 0.2, filter: 'url(#rGlow)' });
  el('circle', { cx: CX, cy: CY, r: 258, fill: 'url(#rDisc)' });
  el('circle', { cx: CX, cy: CY, r: 258, fill: 'none', stroke: '#ffffff', opacity: 0.1, 'stroke-width': 1.5 });
  el('circle', { cx: CX, cy: CY, r: 226, fill: 'none', stroke: '#ffffff', opacity: 0.05, 'stroke-width': 1 });

  for (let a = 0; a < 360; a += 6) {                // full 360° tick ring
    const major = a % 30 === 0;
    el('line', { x1: px(a, major ? 234 : 243), y1: py(a, major ? 234 : 243), x2: px(a, 250), y2: py(a, 250),
                 stroke: '#ffffff', 'stroke-width': major ? 1.4 : 1, opacity: major ? 0.42 : 0.14 });
  }
  for (let a = 0; a < 360; a += 30) {               // degree labels
    if (a === 0) continue;
    el('text', { x: px(a, 208), y: py(a, 208) + 4, 'text-anchor': 'middle', fill: '#ffffff', opacity: 0.34, 'font-size': 13, class: 'num' }).textContent = String(a).padStart(3, '0');
  }
  el('text', { x: CX, y: 92, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 600, class: 'lbl', style: 'fill: var(--accent)' }).textContent = 'N';

  [['GOLD', 24], ['US10Y', 78], ['SPX', 140], ['BRENT', 214], ['DXY', 312]].forEach((m) => {   // market labels
    el('circle', { cx: px(m[1], 178), cy: py(m[1], 178), r: 2, fill: '#ffffff', opacity: 0.3 });
    el('text', { x: px(m[1], 158), y: py(m[1], 158) + 4, 'text-anchor': 'middle', 'font-size': 12, class: 'lbl', opacity: 0.5, fill: '#ffffff' }).textContent = m[0];
  });

  const pts = [];                                   // inner intermarket signal loop
  for (let a = 0; a <= 360; a += 10) {
    const i = a / 10;
    const r = 96 + 13 * Math.sin(i * 0.6) + 7 * Math.sin(i * 1.3 + 2);
    pts.push(px(a, r).toFixed(1) + ',' + py(a, r).toFixed(1));
  }
  el('polyline', { points: pts.join(' '), fill: 'none', 'stroke-width': 1.4, opacity: 0.4, 'stroke-linejoin': 'round', style: 'stroke: var(--accent)' });

  const needle = el('g', { id: 'round-needle' });   // needle — rotates with the device
  el('line', { x1: CX, y1: CY, x2: px(0, 206), y2: py(0, 206), 'stroke-width': 2, style: 'stroke: var(--accent)' }, needle);
  el('circle', { cx: px(0, 206), cy: py(0, 206), r: 26, filter: 'url(#rGlow)', class: 'breathe', style: 'fill: var(--accent)' }, needle);
  el('circle', { cx: px(0, 206), cy: py(0, 206), r: 4, style: 'fill: var(--accent)' }, needle);
  el('line', { x1: CX, y1: CY, x2: px(180, 66), y2: py(180, 66), 'stroke-width': 1.5, stroke: '#e9eae8', opacity: 0.4 }, needle);

  el('circle', { cx: CX, cy: CY, r: 7, fill: '#1e2123', stroke: '#ffffff', 'stroke-opacity': 0.2, 'stroke-width': 1 });
  el('circle', { cx: CX, cy: CY, r: 3, style: 'fill: var(--accent)' });

  host.appendChild(svg);
  return needle;
}

function setupMobileCompass(host) {
  if (!host || document.getElementById('instrument-round')) return;
  const needle = buildRoundCompass(host);
  const hint = document.createElement('div');
  hint.className = 'compass-hint';
  hint.textContent = 'Наклоните телефон';
  host.appendChild(hint);

  // the SVG is built on every size (CSS reveals it on phones); orientation +
  // idle drift only run on phones so a desktop motion sensor can't tilt the arc.
  if (!window.matchMedia('(max-width: 767px)').matches) return;

  const clamp = (v, m) => Math.max(-m, Math.min(m, v));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let oriented = false, visible = true;
  const heroEl = document.querySelector('.hero');
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(heroEl);
  }

  // gentle idle drift until the gyro takes over
  const t0 = performance.now();
  (function idle(now) {
    if (!oriented && visible && !reduced.matches) {
      const t = (now - t0) / 1000;
      const d = 6 * Math.sin(t * 0.24) + 3 * Math.sin(t * 0.07 + 1.5);
      needle.setAttribute('transform', 'rotate(' + d.toFixed(2) + ' 300 300)');
    }
    requestAnimationFrame(idle);
  })(t0);

  const onOrient = (e) => {
    let heading = null;
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) heading = e.webkitCompassHeading;
    else if (typeof e.alpha === 'number' && e.alpha != null) heading = 360 - e.alpha;
    const g = e.gamma || 0, b = e.beta || 0;
    const rot = (heading != null) ? -heading : g * 1.4;     // point to north, or swing with tilt
    needle.setAttribute('transform', 'rotate(' + rot.toFixed(1) + ' 300 300)');
    host.style.transform = 'perspective(1400px) rotateY(' + clamp(g * 0.5, 20).toFixed(1) + 'deg) rotateX(' + clamp(-(b - 45) * 0.3, 14).toFixed(1) + 'deg)';
    if (!oriented) { oriented = true; host.classList.add('oriented'); }
  };

  const listen = () => {
    window.addEventListener('deviceorientation', onOrient);
    window.addEventListener('deviceorientationabsolute', onOrient);
  };
  const needsPerm = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
  if (!needsPerm) {
    if ('DeviceOrientationEvent' in window) listen();          // Android / desktop sensors
  } else {
    const enable = () => {
      DeviceOrientationEvent.requestPermission().then((s) => { if (s === 'granted') listen(); }).catch(() => {});
    };
    window.addEventListener('touchend', enable, { once: true });  // iOS: permission on first tap
    window.addEventListener('click', enable, { once: true });
  }
}
