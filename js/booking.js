/* ============================================
   MARS EXODUS — Booking JS
   Multi-step booking logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  let currentStep = 1;
  const totalSteps = 4;
  const booking = MarsState.get('booking_draft', {
    passenger: {},
    travelClass: '',
    classPrice: 0,
    mission: '',
    addons: [],
    addonTotal: 0,
  });

  // Pre-fill from URL params
  const params = new URLSearchParams(window.location.search);
  const tierParam = params.get('tier');

  // Pre-fill from session
  if (MarsState.isLoggedIn()) {
    const user = MarsState.getUser();
    const nameInput = document.getElementById('b-name');
    const emailInput = document.getElementById('b-email');
    if (nameInput && !nameInput.value) nameInput.value = user.name || '';
    if (emailInput && !emailInput.value) emailInput.value = user.email || '';
  }

  // ---- Step navigation ----
  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;
    currentStep = step;

    // Show active panel
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');

    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach(ind => {
      const s = parseInt(ind.dataset.step);
      ind.classList.remove('active', 'completed');
      if (s === step) ind.classList.add('active');
      else if (s < step) ind.classList.add('completed');
    });

    // Update step lines
    const lines = document.querySelectorAll('.step-line');
    lines.forEach((line, i) => {
      line.classList.toggle('completed', i < step - 1);
    });

    // Save state
    MarsState.set('booking_draft', booking);

    // Scroll to top of booking
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- Step 1: Passenger ----
  document.getElementById('next-1')?.addEventListener('click', () => {
    const name = document.getElementById('b-name');
    const email = document.getElementById('b-email');
    const dob = document.getElementById('b-dob');
    let valid = true;

    if (!name.value.trim()) {
      name.classList.add('error');
      document.getElementById('b-name-error').classList.add('visible');
      valid = false;
    } else {
      name.classList.remove('error');
      document.getElementById('b-name-error').classList.remove('visible');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('error');
      document.getElementById('b-email-error').classList.add('visible');
      valid = false;
    } else {
      email.classList.remove('error');
      document.getElementById('b-email-error').classList.remove('visible');
    }

    if (!dob.value) {
      dob.classList.add('error');
      document.getElementById('b-dob-error').classList.add('visible');
      valid = false;
    } else {
      dob.classList.remove('error');
      document.getElementById('b-dob-error').classList.remove('visible');
    }

    if (!valid) return;

    booking.passenger = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: document.getElementById('b-phone').value.trim(),
      dob: dob.value,
      nationality: document.getElementById('b-nationality').value,
      medical: document.getElementById('b-medical').value.trim(),
    };

    goToStep(2);
  });

  // ---- Step 2: Travel Class ----
  const classOptions = document.querySelectorAll('.class-option');
  classOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      classOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      booking.travelClass = opt.dataset.class;
      booking.classPrice = parseInt(opt.dataset.price);
    });
  });

  // Pre-select from URL
  if (tierParam) {
    const target = document.querySelector(`.class-option[data-class="${tierParam}"]`);
    if (target) {
      target.click();
    }
  }

  document.getElementById('back-2')?.addEventListener('click', () => goToStep(1));
  document.getElementById('next-2')?.addEventListener('click', () => {
    if (!booking.travelClass) {
      showToast('Please select a travel class.', 'error');
      return;
    }
    booking.mission = document.getElementById('b-mission').value;
    goToStep(3);
  });

  // ---- Step 3: Add-ons ----
  const addonItems = document.querySelectorAll('.addon-item');
  addonItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('selected');
      updateAddons();
    });
  });

  function updateAddons() {
    booking.addons = [];
    booking.addonTotal = 0;
    addonItems.forEach(item => {
      if (item.classList.contains('selected')) {
        booking.addons.push({
          name: item.querySelector('h4').textContent,
          id: item.dataset.addon,
          price: parseInt(item.dataset.price),
        });
        booking.addonTotal += parseInt(item.dataset.price);
      }
    });
  }

  document.getElementById('back-3')?.addEventListener('click', () => goToStep(2));
  document.getElementById('next-3')?.addEventListener('click', () => {
    goToStep(4);
    renderReview();
  });

  // ---- Step 4: Review ----
  function renderReview() {
    const summary = document.getElementById('review-summary');
    if (!summary) return;

    const total = booking.classPrice + booking.addonTotal;
    const classNames = { economy: 'Economy — Pathfinder', business: 'Business — Voyager', elite: 'Elite — Sovereign' };

    let html = `
      <div class="review-row"><span class="label">Passenger</span><span class="value">${booking.passenger.name}</span></div>
      <div class="review-row"><span class="label">Email</span><span class="value">${booking.passenger.email}</span></div>
      <div class="review-row"><span class="label">Date of Birth</span><span class="value">${booking.passenger.dob}</span></div>
      <div class="review-row"><span class="label">Mission</span><span class="value">${booking.mission}</span></div>
      <div class="review-row"><span class="label">Travel Class</span><span class="value">${classNames[booking.travelClass] || booking.travelClass}</span></div>
      <div class="review-row"><span class="label">Base Price</span><span class="value">${formatCurrency(booking.classPrice)}</span></div>
    `;

    if (booking.addons.length > 0) {
      booking.addons.forEach(addon => {
        html += `<div class="review-row"><span class="label">+ ${addon.name}</span><span class="value">${formatCurrency(addon.price)}</span></div>`;
      });
    }

    html += `<div class="review-total"><span class="label">Total</span><span class="value">${formatCurrency(total)}</span></div>`;

    summary.innerHTML = html;

    // Save complete booking for payment page
    booking.total = total;
    MarsState.set('booking_draft', booking);
  }

  document.getElementById('back-4')?.addEventListener('click', () => goToStep(3));

  // ---- Proceed to payment ----
  document.getElementById('proceed-payment')?.addEventListener('click', (e) => {
    if (!MarsState.isLoggedIn()) {
      e.preventDefault();
      showToast('Please sign in before proceeding to payment.', 'error');
      setTimeout(() => window.location.href = 'login.html', 1500);
      return;
    }
    MarsState.set('booking_draft', booking);
  });
});
