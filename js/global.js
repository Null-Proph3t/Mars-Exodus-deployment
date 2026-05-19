/* ============================================
   MARS EXODUS — Global JavaScript
   Shared utilities, navigation, scroll, state
   ============================================ */

// ---- State Management ----
const MarsState = {
  get(key, fallback = null) {
    try {
      const data = localStorage.getItem(`mars_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try {
      localStorage.setItem(`mars_${key}`, JSON.stringify(value));
    } catch (e) { console.warn('Storage error:', e); }
  },
  remove(key) {
    localStorage.removeItem(`mars_${key}`);
  },
  isLoggedIn() {
    return !!this.get('session');
  },
  getUser() {
    return this.get('session');
  },
  logout() {
    this.remove('session');
    window.location.href = 'login.html';
  }
};

// ---- Toast Notifications ----
function showToast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '[OK]', error: '[ERR]', info: '[INFO]' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-weight:700;font-size:1.1em">${icons[type] || 'ℹ'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---- Scroll Reveal ----
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger').forEach(el => {
    observer.observe(el);
  });
}

// ---- Stars Background ----
function initStars(container, count = 120) {
  const bg = container || document.querySelector('.stars-bg');
  if (!bg) return;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 1;
    star.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      --duration: ${Math.random() * 4 + 2}s;
      --delay: ${Math.random() * 5}s;
      opacity: ${Math.random() * 0.7 + 0.3};
    `;
    bg.appendChild(star);
  }
}

// ---- Navigation ----
function initNavigation() {
  const nav = document.querySelector('.site-nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');

  // Scroll detection
  if (nav) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      lastScroll = scrollY;
    }, { passive: true });
  }

  // Mobile hamburger
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
  }

  // Update auth state in nav
  updateNavAuth();
}

function updateNavAuth() {
  const userBtn = document.querySelector('.nav-user-btn');
  if (!userBtn) return;
  if (MarsState.isLoggedIn()) {
    const user = MarsState.getUser();
    userBtn.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    userBtn.title = `Logged in as ${user.name || user.email}`;
    userBtn.onclick = () => window.location.href = 'dashboard.html';
  } else {
    userBtn.textContent = '→';
    userBtn.title = 'Sign In';
    userBtn.onclick = () => window.location.href = 'login.html';
  }
}

// ---- Set active page in nav ----
function setActivePage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ---- Generate Navigation HTML ----
function generateNav() {
  return `
  <nav class="site-nav" id="site-nav">
    <div class="nav-inner">
      <a href="index.html" class="nav-logo">
        <div class="logo-icon" style="font-family: var(--font-display); font-weight: 900; letter-spacing: 0;">MX</div>
        MARS <span>EXODUS</span>
      </a>
      <div class="nav-links">
        <a href="index.html">Home</a>
        <a href="inspiration.html">Inspiration</a>
        <a href="journey.html">Journey</a>
        <a href="mission.html">Mission</a>
        <a href="fleet.html">Fleet</a>
        <a href="intelligence.html">Intelligence</a>
        <a href="booking.html">Book Now</a>
        <a href="dashboard.html">Dashboard</a>
      </div>
      <div class="nav-actions">
        <a href="booking.html" class="btn btn-primary btn-sm">Reserve Seat</a>
        <button class="nav-user-btn" aria-label="User account">→</button>
        <div class="nav-hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </nav>

  <div class="nav-mobile" id="nav-mobile">
    <a href="index.html">Home</a>
    <a href="inspiration.html">Inspiration</a>
    <a href="journey.html">Journey</a>
    <a href="mission.html">Mission</a>
    <a href="fleet.html">Fleet</a>
    <a href="intelligence.html">Intelligence</a>
    <a href="booking.html">Book Now</a>
    <a href="dashboard.html">Dashboard</a>
    <a href="login.html">Sign In</a>
  </div>`;
}

// ---- Generate Footer HTML ----
function generateFooter() {
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">MARS <span>EXODUS</span></div>
          <p>Pioneering the future of interplanetary travel. Making Mars accessible to those who dare to dream beyond Earth.</p>
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          <a href="journey.html">The Journey</a>
          <a href="mission.html">Mission Details</a>
          <a href="fleet.html">Our Fleet</a>
          <a href="booking.html">Book a Seat</a>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <a href="inspiration.html">The Inspiration</a>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
          <a href="#">Investors</a>
        </div>
        <div class="footer-col">
          <h4>Support</h4>
          <a href="#">FAQ</a>
          <a href="#">Contact</a>
          <a href="#">Safety</a>
          <a href="#">Terms</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Mars Exodus Corporation. All rights reserved.</span>
        <span>Made for the stars ✦</span>
      </div>
    </div>
  </footer>`;
}

// ---- Simulated delay ----
function simulateDelay(ms = 1500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---- ID Generator ----
function generateId(prefix = 'MX') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = prefix + '-';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// ---- Number formatter ----
function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n);
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ---- Counter Animation ----
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = formatNumber(current);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = formatNumber(target);
  }
  requestAnimationFrame(update);
}

// ---- Init on DOM ready ----
document.addEventListener('DOMContentLoaded', () => {
  // Insert nav + footer
  const navSlot = document.getElementById('nav-slot');
  const footerSlot = document.getElementById('footer-slot');
  if (navSlot) navSlot.innerHTML = generateNav();
  if (footerSlot) footerSlot.innerHTML = generateFooter();

  initNavigation();
  setActivePage();
  initScrollReveal();

  // Stars
  const starsBg = document.querySelector('.stars-bg');
  if (starsBg) initStars(starsBg);
});
