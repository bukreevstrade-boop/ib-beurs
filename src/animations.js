// All scroll-driven animation on GSAP ScrollTrigger. Initial hidden states live
// in CSS (anim.css) so nothing flashes; GSAP reveals to the final inline values
// and LEAVES them there (no clearProps — clearing reverts to the hidden CSS state
// and re-blurs/re-hides the element).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const reveal = { duration: 0.9, ease: 'power3.out' };

/* ---- hero: reveal on load ---- */
function heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.nav', { opacity: 1, y: 0, duration: 0.9 }, 0)
    .to('.hero-copy h1', { opacity: 1, y: 0, duration: 1 }, 0.08)
    .to('.hero-copy p', { opacity: 1, y: 0, duration: 0.9 }, 0.2)
    .to('.hero-copy .cta', { opacity: 1, y: 0, duration: 0.9 }, 0.3)
    .to('.instrument-tilt', { opacity: 1, y: 0, duration: 1.3 }, 0.25)
    .to('.hero-foot', { opacity: 1, y: 0, duration: 0.9 }, 0.5);
}

/* ---- generic blur/rise reveals on scroll ---- */
function scrollReveals() {
  ScrollTrigger.batch('.ctx-head .e-anim, .walk-head .e-anim, .brief-head .e-anim, .access-head .e-anim, .fit-head .e-anim', {
    start: 'top 85%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.12, ...reveal }),
  });
  ScrollTrigger.batch('.cap, .ans-key, .acc-col, .scen, .fit-canvas, .strip-tick', {
    start: 'top 88%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, stagger: 0.1, ...reveal }),
  });
  gsap.utils.toArray('.fin > *').forEach((el) =>
    gsap.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', ...reveal, scrollTrigger: { trigger: el, start: 'top 90%' } }));
}

/* ---- bridge thread grows ---- */
function bridgeThread() {
  const thread = document.querySelector('.thread');
  if (!thread) return;
  gsap.to(thread, { scaleY: 1, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: '.bridge', start: 'top 85%' } });
}

/* ---- section 02: draw connectors, reveal noise, run the signal dot ---- */
function engine() {
  const wrap = document.querySelector('.engine-wrap');
  if (!wrap) return;
  const lines = gsap.utils.toArray('.a-line, .out-line');
  gsap.to(lines, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.08, scrollTrigger: { trigger: wrap, start: 'top 75%' } });
  gsap.to('.noise-layer span', { opacity: 0.22, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: wrap, start: 'top 70%' } });
  const dot = document.querySelector('.out-dot');
  if (dot) {
    gsap.set(dot, { attr: { cx: 724, cy: 280, opacity: 0.75 } });
    const travel = gsap.fromTo(dot, { attr: { cx: 724 } }, { attr: { cx: 982 }, duration: 3.8, ease: 'none', repeat: -1, paused: true });
    ScrollTrigger.create({ trigger: '.ctx', start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? travel.play() : travel.pause()) });
  }
}

/* ---- section 05: Pro line draws across the panel top ---- */
function proLine() {
  const line = document.querySelector('.pro-line');
  if (!line) return;
  gsap.to(line, { scaleX: 1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.access-surface', start: 'top 70%' } });
}

/* ---- Pro statement: word-by-word reveal tied to scroll ---- */
function stripWords() {
  const p = document.querySelector('.strip p');
  if (!p) return;
  const words = [];
  [...p.childNodes].forEach((node) => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = part;
        frag.appendChild(s);
        words.push(s);
      });
      p.replaceChild(frag, node);
    } else if (node.nodeType === 1) { node.classList.add('w'); words.push(node); }
  });
  if (!words.length) return;
  gsap.to(words, { opacity: 1, ease: 'none', stagger: { each: 0.5, ease: 'none' }, scrollTrigger: { trigger: p, start: 'top 92%', end: 'top 42%', scrub: true } });
}

/* ---- section 03: scenes crossfade by scroll (desktop) / stack (mobile) ---- */
function walkthrough() {
  const walk = document.querySelector('.walk');
  if (!walk) return;
  const scroller = walk.querySelector('.walk-scroll');
  const stage = walk.querySelector('.stage');
  const items = [...walk.querySelectorAll('.rail-item')];
  const scenes = [...walk.querySelectorAll('.scene')];

  const place = (stacked) => scenes.forEach((sc, i) => {
    const target = stacked ? items[i] : stage;
    if (target && sc.parentElement !== target) target.appendChild(sc);
    stage.style.display = stacked ? 'none' : '';
  });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 981px)', () => {
    place(false);
    const st = ScrollTrigger.create({
      trigger: scroller, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (self) => { walk.dataset.active = Math.min(4, Math.floor(self.progress * 3.999) + 1); },
    });
    walk.dataset.active = 1;
    return () => st.kill();
  });
  mm.add('(max-width: 980px)', () => { place(true); walk.dataset.active = 1; });

  items.forEach((it, i) => it.addEventListener('click', () => {
    if (window.innerWidth < 981) return;
    const total = scroller.offsetHeight - window.innerHeight;
    const top = scroller.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + total * (i / 4) + total * 0.03, behavior: 'smooth' });
  }));
}

/* ---- section 04: horizontal ribbon pan (scrub, 1.5x travel, cached geometry) ---- */
function ribbon() {
  const brief = document.querySelector('.brief');
  if (!brief) return;
  const scroller = brief.querySelector('.ribbon-scroll');
  const sticky = brief.querySelector('.ribbon-sticky');
  const ribbonEl = brief.querySelector('.ribbon');
  const track = ribbonEl.querySelector('.track');
  const fill = ribbonEl.querySelector('.track-fill');
  const zones = [...ribbonEl.querySelectorAll('.zone')];
  const stations = zones.map(() => { const s = document.createElement('span'); s.className = 'station'; track.appendChild(s); return s; });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 981px)', () => {
    // geometry measured once per refresh — NO per-frame layout reads (kills section-04 jank)
    let centers = [], geom = [], trackLeft = 0, trackW = 0, maxX = 0, vw = 0;
    const measure = () => {
      vw = sticky.clientWidth;
      geom = zones.map((z) => ({ left: z.offsetLeft, width: z.offsetWidth }));
      centers = geom.map((g) => g.left + g.width / 2);
      // End the pan with the LAST zone ("Контекст собран") centred in the
      // viewport — not over-travelled past it. (Was `(scrollWidth - vw) * 1.5`,
      // which shoved the final zone way off to the left.)
      maxX = Math.max(0, centers[centers.length - 1] - vw / 2);
      trackLeft = centers[0];
      trackW = centers[centers.length - 1] - centers[0];
      track.style.left = trackLeft + 'px';
      track.style.width = trackW + 'px';
      stations.forEach((s, i) => (s.style.left = centers[i] - trackLeft + 'px'));
    };
    measure();

    const st = ScrollTrigger.create({
      trigger: scroller, start: 'top top', end: 'bottom bottom', scrub: true,
      invalidateOnRefresh: true, onRefresh: measure,
      onUpdate: (self) => {
        const x = -self.progress * maxX;
        gsap.set(ribbonEl, { x });
        const center = -x + vw * 0.45;
        const lastIdx = zones.length - 1;
        const endApproach = Math.min(1, Math.max(0, (vw - (geom[lastIdx].left + x)) / geom[lastIdx].width));
        const finale = endApproach >= 0.5;
        let ai = 0, best = Infinity;
        for (let i = 0; i < centers.length; i++) { const d = Math.abs(centers[i] - center); if (d < best) { best = d; ai = i; } }
        if (finale) ai = lastIdx;
        ribbonEl.classList.toggle('finale', finale);
        for (let i = 0; i < zones.length; i++) {
          const left = geom[i].left + x, right = left + geom[i].width;
          const vis = Math.min(right, vw) - Math.max(left, 0);
          zones[i].classList.toggle('on', i === ai || (!finale && vis / geom[i].width > 0.55));
        }
        // fill the signal line linearly with scroll progress — reaches the end
        // exactly at the end (no early-completion acceleration).
        const fw = trackW * self.progress;
        for (let i = 0; i < stations.length; i++) stations[i].classList.toggle('on', centers[i] - trackLeft <= fw + 1);
        fill.style.width = fw + 'px';
        brief.dataset.active = ai + 1;
      },
    });
    return () => st.kill();
  });
  mm.add('(max-width: 980px)', () => { gsap.set(ribbonEl, { x: 0 }); zones.forEach((z) => z.classList.add('on')); });
}

export function initAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.anim-hidden, .reveal, .e-anim, .cap, .ans-key, .acc-col, .scen, .fit-canvas, .strip-tick, .fin > *, .thread, .noise-layer span, .pro-line')
      .forEach((el) => { el.style.opacity = ''; el.style.transform = ''; el.style.filter = ''; });
    document.querySelectorAll('.zone').forEach((z) => z.classList.add('on'));
    return;
  }
  heroIntro();
  scrollReveals();
  bridgeThread();
  engine();
  proLine();
  stripWords();
  walkthrough();
  ribbon();
  ScrollTrigger.refresh();
}
