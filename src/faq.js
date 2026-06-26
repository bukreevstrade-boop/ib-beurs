// Section 06 Fit Navigator: scenario switching (click) + selector edge-fade.
export function initFaq() {
  const fit = document.querySelector('.fit');
  if (!fit) return;
  const scens = [...fit.querySelectorAll('.scen')];
  const answers = [...fit.querySelectorAll('.ans')];

  scens.forEach((s, i) =>
    s.addEventListener('click', () => {
      scens.forEach((x, j) => x.classList.toggle('on', j === i));
      answers.forEach((a, j) => {
        if (j === i) {
          a.classList.add('on', 'sw');
          const clear = () => { a.classList.remove('sw'); clearTimeout(a._t); };
          a.addEventListener('animationend', clear, { once: true });
          clearTimeout(a._t);
          a._t = setTimeout(clear, 900);
        } else {
          a.classList.remove('on', 'sw');
        }
      });
    })
  );

  // mobile selector: edge-fade affordance reflecting real scrollability
  const sel = fit.querySelector('.selector');
  if (sel) {
    let tick = false;
    const fade = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        tick = false;
        const max = sel.scrollWidth - sel.clientWidth, sl = sel.scrollLeft;
        sel.classList.toggle('can-left', max > 4 && sl > 4);
        sel.classList.toggle('can-right', max > 4 && sl < max - 4);
      });
    };
    sel.addEventListener('scroll', fade, { passive: true });
    window.addEventListener('resize', fade);
    fade();
  }
}
