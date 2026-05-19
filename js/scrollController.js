let scrollProgress = 0;
let ticking = false;

export function initScrollController(onUpdate) {
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;

        scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;

        onUpdate(scrollProgress);
        ticking = false;
      });
      ticking = true;
    }
  });
}