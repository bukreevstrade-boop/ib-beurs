// Static DOM/SVG generation for sections 02–04 (content, not animation).
// Responsive responders use ResizeObserver / matchMedia — no scroll listeners.
const NS = 'http://www.w3.org/2000/svg';
const elNS = (t, a, p) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); p.appendChild(n); return n; };

/* ============ SECTION 02 — Market Context Engine ============ */
function buildEngine() {
  const canvas = document.querySelector('.engine-canvas');
  const svg = document.getElementById('engine-svg');
  if (!canvas || !svg) return;
  const el = (t, a) => elNS(t, a, svg);
  const CONV = { x: 660, y: 280 };

  document.querySelectorAll('.asset-label').forEach((lb) => {
    const y = +lb.dataset.y;
    el('circle', { cx: 180, cy: y, r: 3, fill: '#16181a', opacity: 0.4 });
    const d = y === CONV.y
      ? 'M 188 ' + y + ' L ' + CONV.x + ' ' + CONV.y
      : 'M 188 ' + y + ' C 400 ' + y + ', 460 ' + CONV.y + ', ' + CONV.x + ' ' + CONV.y;
    const p = el('path', { d, fill: 'none', stroke: '#16181a', 'stroke-width': 1.2, opacity: 0.16, class: 'a-line' });
    const L = p.getTotalLength();
    p.setAttribute('stroke-dasharray', L);
    p.setAttribute('stroke-dashoffset', L); // hidden until GSAP draws it
  });

  [[502, 92], [612, 238], [524, 468], [468, 308]].forEach((xy) =>
    el('circle', { cx: xy[0], cy: xy[1], r: 2, fill: '#16181a', opacity: 0.16 }));

  el('path', { d: 'M 660 280 L 670 280', fill: 'none', stroke: '#16181a', 'stroke-width': 1.2, opacity: 0.25 });

  const out = el('path', { d: 'M 724 280 L 982 280', fill: 'none', 'stroke-width': 1.6, opacity: 0.85, class: 'out-line' });
  out.style.stroke = 'var(--accent)';
  const OL = out.getTotalLength();
  out.setAttribute('stroke-dasharray', OL);
  out.setAttribute('stroke-dashoffset', OL);

  const port = el('circle', { cx: 982, cy: 280, r: 3.5 });
  port.style.fill = 'var(--accent)';

  const dot = el('circle', { r: 2.6, class: 'out-dot', opacity: 0 });
  dot.style.fill = 'var(--accent)';

  /* fixed-canvas scaling via ResizeObserver (no resize listener) */
  const wrap = document.querySelector('.engine-wrap');
  const fit = () => {
    const w = wrap.clientWidth;
    if (!w) return;
    const s = Math.min(1, w / 1480);
    canvas.style.transform = 'scale(' + s + ')';
    canvas.style.marginRight = (s < 1 ? -(1480 * (1 - s)) : 0) + 'px';
    wrap.style.height = 560 * s + 'px';
  };
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(wrap);
}

/* ============ SECTION 03 — walkthrough scenes ============ */
function buildWheel() {
  const host = document.getElementById('cycle-wheel');
  if (!host) return;
  const svg = elNS('svg', { viewBox: '0 0 400 400', class: 'wheel-svg' }, host);
  const el = (t, a) => elNS(t, a, svg);
  const CX = 200, CY = 200;
  const rad = (d) => (d * Math.PI) / 180;
  const px = (d, r) => CX + r * Math.cos(rad(d));
  const py = (d, r) => CY + r * Math.sin(rad(d));
  const arc = (r, a0, a1) => 'M ' + px(a0, r) + ' ' + py(a0, r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + px(a1, r) + ' ' + py(a1, r);

  const stages = ['Новый порядок', 'Подъём', 'Мир и процветание', 'Излишества', 'Упадок', 'Депрессия'];
  const ACTIVE = 4;
  stages.forEach((name, i) => {
    const a0 = i * 60 - 86, a1 = a0 + 52, mid = (a0 + a1) / 2;
    const p = el('path', { d: arc(150, a0, a1), fill: 'none', 'stroke-width': i === ACTIVE ? 10 : 7, 'stroke-linecap': 'round' });
    if (i === ACTIVE) { p.style.stroke = 'var(--accent)'; p.setAttribute('opacity', 0.9); }
    else p.setAttribute('stroke', '#e6e5e0');
    const words = name.split(' ');
    const rows = name.length > 11 && words.length > 1
      ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
      : [name];
    const tx = px(mid, 184), ty = py(mid, 184) + 4 - (rows.length > 1 ? 6 : 0);
    const t = el('text', { x: tx, y: ty, 'text-anchor': 'middle', 'font-size': 11.5, fill: i === ACTIVE ? '' : '#9a9d9a', 'font-weight': i === ACTIVE ? 600 : 400 });
    if (i === ACTIVE) t.style.fill = 'var(--accent)';
    rows.forEach((r, ri) => { elNS('tspan', { x: tx, dy: ri === 0 ? 0 : 13 }, t).textContent = r; });
  });
  el('circle', { cx: CX, cy: CY, r: 96, fill: 'none', stroke: '#16181a', opacity: 0.08 });
  const countries = [['Индия', 0, false], ['Китай', 60, false], ['Еврозона', 120, false], ['США', 180, true], ['Япония', 240, false]];
  countries.forEach((c) => {
    const d = el('circle', { cx: px(c[1], 96), cy: py(c[1], 96), r: c[2] ? 5 : 3.5 });
    if (c[2]) { d.style.fill = 'var(--accent)'; el('circle', { cx: px(c[1], 96), cy: py(c[1], 96), r: 10, fill: 'none', 'stroke-width': 1, opacity: 0.5, style: 'stroke: var(--accent)' }); }
    else d.setAttribute('fill', '#2c2f31');
    const lx = px(c[1], 96) + (Math.cos(rad(c[1])) > 0 ? 14 : -14);
    el('text', { x: lx, y: py(c[1], 96) + 4, 'font-size': 11, fill: '#6a6d6a', 'text-anchor': Math.cos(rad(c[1])) > 0 ? 'start' : 'end' }).textContent = c[0];
  });
  el('text', { x: CX, y: CY - 8, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#9a9d9a', 'letter-spacing': '2', style: 'text-transform: uppercase' }).textContent = 'БОЛЬШОЙ ЦИКЛ';
  el('text', { x: CX, y: CY + 16, 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 600, fill: '#16181a' }).textContent = 'США · Упадок';
}

const spark = (dir) => {
  const pts = { up: '2,18 14,15 26,16 38,11 50,12 62,7 74,8 86,3', flat: '2,11 14,9 26,12 38,10 50,11 62,9 74,11 86,10', down: '2,4 14,7 26,6 38,11 50,10 62,14 74,13 86,18' }[dir];
  const col = dir === 'up' ? 'var(--accent)' : dir === 'flat' ? '#b3b6b3' : '#43474a';
  return '<svg viewBox="0 0 88 22" class="spk"><polyline points="' + pts + '" fill="none" stroke="' + col + '" stroke-width="1.5"></polyline></svg>';
};
const sig = { pos: ['sig-pos', 'положительный'], neu: ['sig-neu', 'нейтральный'], neg: ['sig-neg', 'отрицательный'] };

function buildCarry() {
  const host = document.getElementById('carry-table');
  if (!host) return;
  const rows = [
    ['AUD/JPY', '3.2', '3.1', 'flat', '6.4%', 'pos'], ['GBP/JPY', '2.5', '2.4', 'down', '5.0%', 'pos'],
    ['AUD/CHF', '4.5', '2.4', 'flat', '5.1%', 'pos'], ['NZD/JPY', '1.4', '1.8', 'flat', '7.4%', 'pos'],
    ['USD/CHF', '3.7', '0.1', 'up', '6.3%', 'neu'], ['EUR/USD', '−1.4', '0.6', 'up', '4.9%', 'neu'],
    ['USD/CAD', '1.3', '−0.9', 'flat', '3.1%', 'neg'], ['USD/CNY', '2.0', '−1.5', 'flat', '1.9%', 'neg'],
  ];
  host.innerHTML =
    '<table class="tbl"><thead><tr><th>Пара</th><th>Спред</th><th>Реальный</th><th>Тренд 30д</th><th>Волат. 30д</th><th>Кэрри</th></tr></thead><tbody>' +
    rows.map((r) => '<tr><td class="strong">' + r[0] + '</td><td class="num">' + r[1] + '</td><td class="num">' + r[2] + '</td><td>' + spark(r[3]) + '</td><td class="num soft">' + r[4] + '</td><td><span class="sig ' + sig[r[5]][0] + '"></span><span class="sig-word">' + sig[r[5]][1] + '</span></td></tr>').join('') +
    '</tbody></table>' +
    '<div class="tbl-cards">' + rows.map((r) =>
      '<div class="tc-row"><div class="tc-top"><span class="tc-name">' + r[0] + '</span><span class="tc-state"><span class="sig ' + sig[r[5]][0] + '"></span>' + sig[r[5]][1] + '</span></div>' +
      '<div class="tc-facts"><span>Спред<b>' + r[1] + '</b></span><span>Реальный<b>' + r[2] + '</b></span><span>Волат. 30д<b>' + r[4] + '</b></span><span>' + spark(r[3]) + '</span></div></div>').join('') + '</div>';
}

function buildCommodities() {
  const host = document.getElementById('commod-table');
  if (!host) return;
  const groups = [
    ['Энергия', [['Нефть WTI', 'Дефицит', '−24.2%', true], ['Газ Henry Hub', 'Норма', '+4.2%', false]]],
    ['Драгметаллы', [['Золото', 'Норма', '−8.7%', false], ['Серебро', 'Норма', '−18.6%', true]]],
    ['Промметаллы', [['Медь', 'нет данных', '−3.7%', true], ['Литий', 'нет данных', '−8.0%', false]]],
    ['Агро', [['Пшеница', 'Дефицит', '−9.2%', true], ['Соя', 'Избыток', '−6.6%', false]]],
  ];
  const stateCls = { Дефицит: 'sig-pos', Норма: 'sig-neu', Избыток: 'sig-neg' };
  const stateTd = (s) => stateCls[s] ? '<span class="sig ' + stateCls[s] + '"></span><span class="sig-word">' + s + '</span>' : '<span class="sig-word dim">— нет данных</span>';
  const stateInline = (s) => stateCls[s] ? '<span class="sig ' + stateCls[s] + '"></span>' + s : '<span class="dim">нет данных</span>';
  host.innerHTML =
    '<table class="tbl tbl-tight"><thead><tr><th>Инструмент</th><th>Запасы</th><th>Цена 30д %</th><th>Крупные покупки</th></tr></thead><tbody>' +
    groups.map((g) => '<tr class="grp"><td colspan="4">' + g[0] + '</td></tr>' +
      g[1].map((r) => '<tr><td class="strong">' + r[0] + '</td><td>' + stateTd(r[1]) + '</td><td class="num soft">' + r[2] + '</td><td>' + (r[3] ? '<span class="buy-mark"></span><span class="sig-word">есть</span>' : '<span class="sig-word dim">нет</span>') + '</td></tr>').join('')).join('') +
    '</tbody></table>' +
    '<div class="tbl-cards">' + groups.map((g) => '<div class="tc-group">' + g[0] + '</div>' +
      g[1].map((r) => '<div class="tc-row"><div class="tc-top"><span class="tc-name">' + r[0] + '</span><span class="tc-state">' + stateInline(r[1]) + '</span></div>' +
        '<div class="tc-facts"><span>Цена 30д %<b>' + r[2] + '</b></span><span>Крупные покупки<b>' + (r[3] ? 'есть' : 'нет') + '</b></span></div></div>').join('')).join('') + '</div>';
}

function buildCot() {
  const host = document.getElementById('cot-chart');
  if (!host) return;
  const el = (t, a, p) => elNS(t, a, p);
  const mq = window.matchMedia('(max-width: 767px)');
  let lastNarrow = null;
  const render = () => {
    const narrow = mq.matches;
    if (narrow === lastNarrow) return;
    lastNarrow = narrow;
    host.innerHTML = '';
    const W = narrow ? 440 : 640, N = narrow ? 17 : 26, STEP = narrow ? 25 : 24, BW = narrow ? 13 : 12;
    const svg = el('svg', { viewBox: '0 0 ' + W + ' 230', class: 'cot-svg' }, host);
    const ZERO = 128;
    el('line', { x1: 8, y1: ZERO, x2: W - 8, y2: ZERO, stroke: '#ffffff', opacity: 0.16, 'stroke-width': 1 }, svg);
    let flipX = 0;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const v = Math.round(-52 + 118 * t * t + 14 * Math.sin(t * 25 * 1.7));
      const x = 14 + i * STEP, h = Math.max(4, Math.abs(v));
      const bar = el('rect', { x, y: v > 0 ? ZERO - h : ZERO, width: BW, height: h }, svg);
      if (v > 0) { bar.style.fill = 'var(--accent)'; bar.setAttribute('opacity', 0.85); }
      else bar.setAttribute('fill', 'rgba(255,255,255,.22)');
      if (v > 0 && !flipX) flipX = x + BW / 2;
    }
    if (flipX) {
      el('line', { x1: flipX, y1: 18, x2: flipX, y2: 218, 'stroke-width': 1, 'stroke-dasharray': '2 5', opacity: 0.5, style: 'stroke: var(--accent)' }, svg);
      el('circle', { cx: flipX, cy: ZERO, r: 5, fill: 'none', 'stroke-width': 1.4, style: 'stroke: var(--accent)' }, svg);
      const atRight = flipX > W - 175;
      const t = el('text', { x: flipX + (atRight ? -10 : 10), y: 28, 'font-size': narrow ? 15 : 11, 'letter-spacing': '1', 'text-anchor': atRight ? 'end' : 'start' }, svg);
      t.style.fill = 'var(--accent)';
      t.textContent = 'смена направления';
    }
  };
  render();
  mq.addEventListener('change', render);
}

/* ============ SECTION 04 — briefing data ============ */
function buildBriefing() {
  const movers = document.getElementById('movers');
  if (movers) {
    const col = (title, rows) => '<div><div class="mv-title">' + title + '</div>' +
      rows.map((r) => '<div class="mv-row"><span class="sig ' + r[2] + '"></span><span class="nm">' + r[0] + '</span><span class="chg ' + (r[2] === 'sig-pos' ? 'up' : '') + '">' + r[1] + '</span></div>').join('') + '</div>';
    movers.innerHTML =
      col('Лидеры', [['Nasdaq', '+1.8%', 'sig-pos'], ['Золото', '+0.9%', 'sig-pos'], ['EUR/USD', '+0.4%', 'sig-pos']]) +
      col('Аутсайдеры', [['Brent', '−2.1%', 'sig-neg'], ['Газ TTF', '−1.6%', 'sig-neg'], ['Никель', '−0.8%', 'sig-neg']]);
    const ev = document.getElementById('events');
    if (ev) ev.innerHTML = '<div class="mv-title">Важные события</div>' +
      [['07:10', 'Банк Японии сохранил ставку — иена слабеет'], ['05:40', 'Запасы нефти выросли сильнее прогноза']]
        .map((e) => '<div class="ev-row"><span class="t">' + e[0] + '</span><span class="sig sig-pos"></span><span>' + e[1] + '</span></div>').join('');
  }
  const cal = document.getElementById('cal-rows');
  if (cal) {
    const rows = [
      ['09:00', 'Банк Японии · итоги заседания', 'высокая', 'hi'], ['12:00', 'ЕЦБ · выступление главы', 'средняя', ''],
      ['14:30', 'ФРС · протокол заседания', 'высокая', 'hi'], ['16:00', 'Банк Англии · отчёт по инфляции', 'средняя', ''],
      ['18:00', 'Минфин · аукцион 10-летних облигаций', 'низкая', ''],
    ];
    cal.innerHTML = rows.map((r) => '<div class="cal-row ' + r[3] + '"><span class="t">' + r[0] + '</span><span class="nm">' + r[1] + '</span><span class="imp">' + r[2] + '</span></div>').join('');
  }
  const alloc = document.getElementById('alloc');
  if (alloc) {
    const segs = [['Акции', 44, '#2c2f31'], ['Облигации', 26, '#7d817e'], ['Товары', 12, '#b3b6b3'], ['Валюты', 10, '#d8d7d2'], ['Крипто', 8, 'var(--accent)']];
    alloc.innerHTML = '<div class="alloc-bar">' + segs.map((s) => '<i style="width:' + s[1] + '%; background:' + s[2] + ';"></i>').join('') + '</div>' +
      '<div class="alloc-legend">' + segs.map((s) => '<span><span class="sw" style="background:' + s[2] + ';"></span>' + s[0] + ' · ' + s[1] + '%</span>').join('') + '</div>';
  }
  const matrix = document.getElementById('matrix');
  if (matrix) {
    const names = ['Акц', 'Обл', 'Вал', 'Тов', 'Крп'];
    const vals = [[null, '−0.4', '0.2', '0.5', '0.8'], ['−0.4', null, '0.3', '−0.2', '−0.3'], ['0.2', '0.3', null, '0.4', '0.1'], ['0.5', '−0.2', '0.4', null, '0.3'], ['0.8', '−0.3', '0.1', '0.3', null]];
    let h = '<div class="mx-h"></div>' + names.map((n) => '<div class="mx-h">' + n + '</div>').join('');
    vals.forEach((row, i) => {
      h += '<div class="mx-h side">' + names[i] + '</div>';
      row.forEach((v) => { h += v === null ? '<div class="mx-c self">—</div>' : '<div class="mx-c' + (v === '0.8' ? ' hot' : '') + '">' + v + '</div>'; });
    });
    matrix.innerHTML = h;
    const flow = document.getElementById('flow');
    if (flow) {
      const svg = elNS('svg', { viewBox: '0 0 320 190', class: 'flow-svg' }, flow);
      const defs = elNS('defs', {}, svg);
      const m = elNS('marker', { id: 'flow-arr', viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
      elNS('path', { d: 'M 0 0 L 8 4 L 0 8 z', style: 'fill: var(--accent)' }, m);
      elNS('path', { d: 'M 60 50 C 130 80, 200 110, 238 140', fill: 'none', 'stroke-width': 1.8, style: 'stroke: var(--accent)', 'marker-end': 'url(#flow-arr)' }, svg);
      elNS('path', { d: 'M 230 50 C 170 70, 110 100, 62 138', fill: 'none', stroke: 'rgba(255,255,255,.18)', 'stroke-width': 1.2, 'stroke-dasharray': '3 5' }, svg);
      [['Акции', 40, 40], ['Облигации', 250, 40], ['Товары', 250, 150], ['Валюты', 40, 150]].forEach((n) => {
        const active = n[0] === 'Акции' || n[0] === 'Товары';
        const c = elNS('circle', { cx: n[1], cy: n[2], r: active ? 5 : 4 }, svg);
        if (active) c.style.fill = 'var(--accent)'; else c.setAttribute('fill', 'rgba(255,255,255,.35)');
        elNS('text', { x: n[1], y: n[2] + (n[2] < 100 ? -14 : 22), 'text-anchor': 'middle', 'font-size': 11.5, fill: 'rgba(245,245,242,.6)' }, svg).textContent = n[0];
      });
    }
  }
}

export function buildAll() {
  buildEngine();
  buildWheel();
  buildCarry();
  buildCommodities();
  buildCot();
  buildBriefing();
}
