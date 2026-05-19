/**
 * Intelligence Page Specific Animations
 * Adds parallax and subtle hover dynamics beyond global.js
 */

export class NasaAnimations {
  static init() {
    this.initParallax();
    this.enhanceHoverEffects();
  }

  static initParallax() {
    const hero = document.querySelector('.intel-header');
    window.addEventListener('scroll', () => {
      if (!hero) return;
      const scroll = window.scrollY;
      if (scroll < 500) {
        hero.style.transform = `translateY(${scroll * 0.4}px)`;
        hero.style.opacity = 1 - scroll / 400;
      }
    });
  }

  static enhanceHoverEffects() {
    const cards = document.querySelectorAll('.glass-panel, .neo-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / card.clientWidth) * 100;
        const y = ((e.clientY - rect.top) / card.clientHeight) * 100;
        
        // Add subtle radial gradient glow tracking mouse
        card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0, 210, 255, 0.1), rgba(10, 15, 30, 0.6) 80%)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.background = 'rgba(10, 15, 30, 0.6)';
      });
    });
  }
}
