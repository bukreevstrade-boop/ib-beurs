// Entry point — styles, static DOM, smooth scroll, animations.
import './styles/base.css';
import './styles/anim.css';
import './styles/hero.css';
import './styles/engine.css';
import './styles/walkthrough.css';
import './styles/ribbon.css';
import './styles/access.css';
import './styles/faq.css';
import './styles/mobile.css';

import { initSmoothScroll } from './lenis.js';
import { buildAll } from './builders.js';
import { initCompass } from './compass.js';
import { initFaq } from './faq.js';
import { initAnimations } from './animations.js';

// 1. generate the static SVG/table DOM, 2. build the compass,
// 3. wire interactions, 4. smooth scroll, 5. scroll animations.
buildAll();
initCompass();
initFaq();
initSmoothScroll();
initAnimations();
