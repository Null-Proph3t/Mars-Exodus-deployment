import { ApodComponent } from './components/apod.js';
import { NeoWsComponent } from './components/neows.js';
import { NasaAnimations } from './animations/nasa-anim.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Components
  ApodComponent.render('apod-container');
  NeoWsComponent.render('neows-grid');
  
  // Initialize Animations
  setTimeout(() => {
    NasaAnimations.init();
  }, 1000); // init after some ms to give DOM time to render skeletons
});
