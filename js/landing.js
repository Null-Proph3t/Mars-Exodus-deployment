/* ============================================
   MARS EXODUS — Landing Page JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Animate counters on scroll
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        animateCounter(el, target, 2000);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // Parallax on hero orbs
  const hero = document.querySelector('.hero');
  const planet = document.querySelector('.hero-planet');
  if (hero && planet) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroH = hero.offsetHeight;
      if (scrollY < heroH) {
        const ratio = scrollY / heroH;
        planet.style.transform = `translateY(${ratio * -40}px)`;
        const orbs = hero.querySelectorAll('.gradient-orb');
        orbs.forEach((orb, i) => {
          orb.style.transform = `translateY(${ratio * (20 + i * 10)}px)`;
        });
      }
    }, { passive: true });
  }

  // Hide scroll indicator on scroll
  const scrollIndicator = document.querySelector('.hero-scroll-indicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
      }
    }, { passive: true });
  }
});
