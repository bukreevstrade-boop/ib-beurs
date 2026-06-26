// Entry point — styles, static DOM, animations. Native scroll (no smooth-scroll
// library): the browser's own scrolling is the lightest possible, zero per-frame
// JS, no lag. GSAP ScrollTrigger drives all scroll animations on native scroll.
import './styles/base.css';
import './styles/anim.css';
import './styles/hero.css';
import './styles/engine.css';
import './styles/walkthrough.css';
import './styles/ribbon.css';
import './styles/access.css';
import './styles/faq.css';
import './styles/mobile.css';

import { buildAll } from './builders.js';
import { initCompass } from './compass.js';
import { initFaq } from './faq.js';
import { initAnimations } from './animations.js';

// 1. generate the static SVG/table DOM, 2. build the compass,
// 3. wire interactions, 4. scroll animations (native scroll).
buildAll();
initCompass();
initFaq();
initAnimations();
