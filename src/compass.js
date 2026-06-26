// Market-navigation compass (radar). Generates the gauge SVG for tick precision,
// then drives the needle drift on gsap.ticker and the hover tilt. No scroll listeners.
import { gsap } from 'gsap';

export function initCompass() {
  const svg = document.getElementById('instrument');
  if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const CX = 700, CY = 1010, R = 560;
  const rad = (d) => (d * Math.PI) / 180;
  const px = (d, r) => CX + r * Math.cos(rad(d));
  const py = (d, r) => CY + r * Math.sin(rad(d));
  const heading = (a) => (((a + 450) % 360) + 360) % 360;

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(n);
    return n;
  }
  function arc(r, a0, a1) {
    return (
      'M ' + px(a0, r) + ' ' + py(a0, r) +
      ' A ' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' +
      px(a1, r) + ' ' + py(a1, r)
    );
  }
  function tick(g, a, r0, r1, stroke, w, o) {
    el('line', { x1: px(a, r0), y1: py(a, r0), x2: px(a, r1), y2: py(a, r1), stroke, 'stroke-width': w, opacity: o }, g);
  }

  /* atmosphere */
  const atmos = el('g', { id: 'atmos' });
  el('path', { d: arc(704, -168, -12), fill: 'none', stroke: '#16181a', 'stroke-width': 1, opacity: 0.05 }, atmos);
  el('path', { d: arc(806, -165, -15), fill: 'none', stroke: '#16181a', 'stroke-width': 1, opacity: 0.035 }, atmos);
  for (let a = -165; a <= -15; a += 15) tick(atmos, a, 668, 704, '#16181a', 1, 0.06);

  /* disc */
  el('circle', { cx: CX, cy: CY, r: R + 6, fill: '#0b0d0d', opacity: 0.16, filter: 'url(#f-soft)' });
  el('circle', { cx: CX, cy: CY, r: R, fill: 'url(#discGrad)' });
  el('path', { d: arc(R - 1, -152, -28), fill: 'none', stroke: '#ffffff', opacity: 0.09, 'stroke-width': 1.5 });
  el('path', { d: arc(468, -150, -30), fill: 'none', stroke: '#ffffff', opacity: 0.045, 'stroke-width': 1 });

  /* outer scale */
  const outer = el('g', { id: 'outer-scale' });
  for (let a = -160; a <= -20; a += 5) {
    const major = heading(a) % 15 === 0;
    tick(outer, a, 582, major ? 600 : 593, '#16181a', 1, major ? 0.28 : 0.14);
  }
  for (const a of [-150, -120, -90, -60, -30]) {
    el('text', { x: px(a, 632), y: py(a, 632) + 4, 'text-anchor': 'middle', fill: '#16181a', opacity: 0.34, 'font-size': 13, class: 'num' }, outer)
      .textContent = String(heading(a)).padStart(3, '0');
  }

  /* inner ticks */
  const inner = el('g', { id: 'inner-scale' });
  for (let a = -152; a <= -28; a += 2) {
    const major = heading(a) % 10 === 0;
    tick(inner, a, major ? 534 : 543, 553, '#ffffff', 1, major ? 0.26 : 0.1);
  }

  /* market labels */
  const markets = [['GOLD', -141], ['US10Y', -116], ['SPX', -91], ['BRENT', -41]];
  const mg = el('g', { id: 'markets' });
  for (const [name, a] of markets) {
    el('circle', { cx: px(a, 488), cy: py(a, 488), r: 2, fill: '#ffffff', opacity: 0.3 }, mg);
    el('text', { x: px(a, 452), y: py(a, 452) + 4, 'text-anchor': 'middle', fill: '#ffffff', opacity: 0.4, 'font-size': 12.5, class: 'lbl' }, mg)
      .textContent = name;
  }

  /* embedded signal line */
  const pts = [];
  for (let a = -150; a <= -32; a += 2) {
    const i = (a + 150) / 2;
    const r = 392 + 26 * Math.sin(i * 0.55) + 13 * Math.sin(i * 1.3 + 2) + 7 * Math.sin(i * 2.3 + 5);
    pts.push(px(a, r).toFixed(1) + ',' + py(a, r).toFixed(1));
  }
  const spark = el('polyline', { points: pts.join(' '), fill: 'none', 'stroke-width': 1.5, opacity: 0.42, 'stroke-linejoin': 'round', style: 'stroke: var(--accent)' });
  const endXY = pts[pts.length - 1].split(',');
  const sparkDot = el('circle', { cx: endXY[0], cy: endXY[1], r: 2.6, style: 'fill: var(--accent)', opacity: 0 });

  /* active sector arc */
  el('path', { d: arc(502, -86, -50), fill: 'none', stroke: 'url(#arcGrad)', 'stroke-width': 2, 'stroke-linecap': 'round' });

  /* needle */
  const needle = el('g', { id: 'needle' });
  const A = -66;
  el('line', { x1: px(A, 120), y1: py(A, 120), x2: px(A, 470), y2: py(A, 470), stroke: '#e9eae8', 'stroke-width': 1.4, opacity: 0.5 }, needle);
  el('line', { x1: px(A, 470), y1: py(A, 470), x2: px(A, 524), y2: py(A, 524), 'stroke-width': 2, style: 'stroke: var(--accent)' }, needle);
  el('circle', { cx: px(A, 524), cy: py(A, 524), r: 46, filter: 'url(#f-glow)', class: 'breathe', style: 'fill: var(--accent)' }, needle);
  el('circle', { cx: px(A, 524), cy: py(A, 524), r: 12, opacity: 0.3, filter: 'url(#f-halo)', style: 'fill: var(--accent)' }, needle);
  el('circle', { cx: px(A, 524), cy: py(A, 524), r: 4, style: 'fill: var(--accent)' }, needle);
  el('line', { x1: px(A, 544), y1: py(A, 544), x2: px(A, 724), y2: py(A, 724), 'stroke-width': 1, opacity: 0.28, 'stroke-dasharray': '2 5', style: 'stroke: var(--accent)' }, needle);
  el('text', { x: px(A, 446), y: py(A, 446) + 4, 'text-anchor': 'middle', 'font-size': 13, 'letter-spacing': '0.14em', 'font-weight': 600, class: 'lbl', style: 'fill: var(--accent)' }, needle)
    .textContent = 'DXY';
  el('text', { x: px(A, 408), y: py(A, 408) + 4, 'text-anchor': 'middle', 'font-size': 12.5, fill: '#ffffff', opacity: 0.5, class: 'num' }, needle)
    .textContent = '104.2';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* spark draw-in (one-time) */
  try {
    const L = spark.getTotalLength();
    if (!reduced.matches) {
      gsap.set(spark, { strokeDasharray: L, strokeDashoffset: L });
      gsap.to(spark, { strokeDashoffset: 0, duration: 2.6, delay: 0.7, ease: 'power2.inOut' });
      gsap.to(sparkDot, { attr: { opacity: 0.85 }, duration: 0.8, delay: 2.6 });
    } else {
      sparkDot.setAttribute('opacity', 0.85);
    }
  } catch (e) {
    sparkDot.setAttribute('opacity', 0.85);
  }

  /* needle drift + live azimuth — on gsap.ticker (no rAF/scroll listeners) */
  const readout = document.getElementById('heading-readout');
  let lastReadout = '';
  const tickFn = () => {
    if (reduced.matches) return;
    const t = gsap.ticker.time;
    const d = 3.1 * Math.sin(t * 0.21) + 1.5 * Math.sin(t * 0.057 + 1.7);
    needle.setAttribute('transform', 'rotate(' + d.toFixed(2) + ' ' + CX + ' ' + CY + ')');
    const s = (heading(A) + d).toFixed(1) + '°';
    if (readout && s !== lastReadout) { readout.textContent = s; lastReadout = s; }
  };
  gsap.ticker.add(tickFn);
  if (readout) readout.textContent = heading(A).toFixed(1) + '°';

  /* hover tilt — cached rect, gsap-eased (pointer:fine only; not a scroll listener) */
  const tiltEl = document.querySelector('.instrument-tilt');
  const hero = document.querySelector('.hero');
  if (tiltEl && hero && window.matchMedia('(pointer: fine)').matches) {
    let r = null;
    const refresh = () => { r = hero.getBoundingClientRect(); };
    refresh();
    window.addEventListener('resize', refresh);
    hero.addEventListener('mouseenter', refresh);
    hero.addEventListener('mousemove', (e) => {
      if (reduced.matches || !r) return;
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(tiltEl, { rotationY: nx * 3, rotationX: -ny * 1.8, transformPerspective: 1400, duration: 0.5, ease: 'power2.out' });
    });
    hero.addEventListener('mouseleave', () => {
      gsap.to(tiltEl, { rotationY: 0, rotationX: 0, duration: 0.7, ease: 'power2.out' });
    });
  }
}
