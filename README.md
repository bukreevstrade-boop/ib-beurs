# IB · BEURS

Premium financial-analytics landing — Vite (vanilla JS) + GSAP ScrollTrigger + Lenis.

## Stack
- **Vite** — build & dev server
- **GSAP + ScrollTrigger** — all scroll-driven animation
- **@studio-freight/lenis** — smooth scroll, wired into GSAP's ticker

## Develop
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview
```

## Structure
```
index.html            markup only
src/
  main.js             entry
  lenis.js            smooth scroll ↔ ScrollTrigger
  animations.js       all scroll animations (GSAP)
  compass.js          radar compass (build + needle drift + hover)
  builders.js         section 02–04 SVG/table generation
  faq.js              scenario switcher
  styles/             CSS by block (+ anim.css = initial hidden states)
```

## Deploy
Auto-deploys to Netlify on push to `main` (`npm run build` → `dist`). Config in `netlify.toml`.
