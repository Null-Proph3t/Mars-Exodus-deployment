/* ============================================
   MARS EXODUS — Payment JS
   Payment simulation with processing animation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const booking = MarsState.get('booking_draft', null);
  let paymentMethod = 'card';

  // ---- Populate order summary ----
  function renderOrderSummary() {
    const linesEl = document.getElementById('order-lines');
    if (!linesEl) return;

    if (!booking) {
      linesEl.innerHTML = '<p style="color:var(--color-text-muted);font-size:var(--fs-small)">No booking found. Please complete your booking first.</p>';
      const payBtn = document.getElementById('pay-btn');
      if (payBtn) payBtn.style.display = 'none';
      return;
    }

    const classNames = { economy: 'Economy — Pathfinder', business: 'Business — Voyager', elite: 'Elite — Sovereign' };
    let html = `
      <div class="order-line"><span>Passenger</span><span>${booking.passenger?.name || 'N/A'}</span></div>
      <div class="order-line"><span>Mission</span><span>${booking.mission || 'N/A'}</span></div>
      <div class="order-line"><span>Travel Class</span><span>${classNames[booking.travelClass] || booking.travelClass}</span></div>
      <div class="order-line"><span>Base Fare</span><span class="amount">${formatCurrency(booking.classPrice || 0)}</span></div>
    `;

    if (booking.addons && booking.addons.length > 0) {
      booking.addons.forEach(a => {
        html += `<div class="order-line"><span>${a.name}</span><span class="amount">${formatCurrency(a.price)}</span></div>`;
      });
    }

    html += `<div class="order-line total"><span>Total</span><span class="amount">${formatCurrency(booking.total || 0)}</span></div>`;
    linesEl.innerHTML = html;
  }

  renderOrderSummary();

  // ---- Payment method tabs ----
  const methodTabs = document.querySelectorAll('.payment-method-tab');
  const cardForm = document.getElementById('card-form');
  const upiForm = document.getElementById('upi-form');

  methodTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      methodTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      paymentMethod = tab.dataset.method;

      if (paymentMethod === 'card') {
        cardForm.classList.add('active');
        upiForm.classList.remove('active');
      } else {
        cardForm.classList.remove('active');
        upiForm.classList.add('active');
      }
    });
  });

  // ---- Card number formatting ----
  const cardNum = document.getElementById('card-number');
  const cardName = document.getElementById('card-name');
  const cardExpiry = document.getElementById('card-expiry');
  const cardCvv = document.getElementById('card-cvv');

  if (cardNum) {
    cardNum.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      val = val.substring(0, 16);
      let formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
      e.target.value = formatted;

      // Update preview
      const display = document.getElementById('card-display-num');
      if (display) {
        display.textContent = formatted || '•••• •••• •••• ••••';
      }
    });
  }

  if (cardName) {
    cardName.addEventListener('input', (e) => {
      const display = document.getElementById('card-display-name');
      if (display) {
        display.textContent = e.target.value.toUpperCase() || 'YOUR NAME';
      }
    });
  }

  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
      }
      e.target.value = val;

      const display = document.getElementById('card-display-exp');
      if (display) {
        display.textContent = val || 'MM/YY';
      }
    });
  }

  if (cardCvv) {
    cardCvv.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
    });
  }

  // ---- Pay button ----
  const payBtn = document.getElementById('pay-btn');
  if (payBtn) {
    payBtn.addEventListener('click', async () => {
      if (!booking) {
        showToast('No booking found. Please start from the booking page.', 'error');
        return;
      }

      // Validate
      if (paymentMethod === 'card') {
        let valid = true;

        if (!cardNum || cardNum.value.replace(/\s/g, '').length < 16) {
          cardNum.classList.add('error');
          document.getElementById('card-number-error').classList.add('visible');
          valid = false;
        } else {
          cardNum.classList.remove('error');
          document.getElementById('card-number-error').classList.remove('visible');
        }

        if (!cardName || !cardName.value.trim()) {
          cardName.classList.add('error');
          document.getElementById('card-name-error').classList.add('visible');
          valid = false;
        } else {
          cardName.classList.remove('error');
          document.getElementById('card-name-error').classList.remove('visible');
        }

        if (!cardExpiry || cardExpiry.value.length < 5) {
          cardExpiry.classList.add('error');
          document.getElementById('card-expiry-error').classList.add('visible');
          valid = false;
        } else {
          cardExpiry.classList.remove('error');
          document.getElementById('card-expiry-error').classList.remove('visible');
        }

        if (!cardCvv || cardCvv.value.length < 3) {
          cardCvv.classList.add('error');
          document.getElementById('card-cvv-error').classList.add('visible');
          valid = false;
        } else {
          cardCvv.classList.remove('error');
          document.getElementById('card-cvv-error').classList.remove('visible');
        }

        if (!valid) return;
      } else {
        const upiId = document.getElementById('upi-id');
        if (!upiId || !upiId.value.trim()) {
          upiId.classList.add('error');
          document.getElementById('upi-error').classList.add('visible');
          return;
        }
        upiId.classList.remove('error');
        document.getElementById('upi-error').classList.remove('visible');
      }

      // Start processing
      await processPayment();
    });
  }

  // ---- Processing animation ----
  async function processPayment() {
    const overlay = document.getElementById('processing-overlay');
    const textEl = document.getElementById('processing-text');
    const substepEl = document.getElementById('processing-substep');

    overlay.classList.add('active');

    const steps = [
      { text: 'Processing Payment', sub: 'Validating card details...' },
      { text: 'Processing Payment', sub: 'Contacting payment gateway...' },
      { text: 'Securing Transaction', sub: 'Encrypting payment data...' },
      { text: 'Confirming Booking', sub: 'Reserving your seat...' },
      { text: 'Generating Ticket', sub: 'Creating your boarding pass...' },
    ];

    for (const step of steps) {
      textEl.textContent = step.text;
      substepEl.textContent = step.sub;
      await simulateDelay(800 + Math.random() * 600);
    }

    overlay.classList.remove('active');

    // 90% success, 10% simulated failure for realism
    const success = Math.random() > 0.1;
    
    if (success) {
      completeBooking();
    } else {
      showToast('Payment declined. Please try again or use a different payment method.', 'error');
    }
  }

  // ---- Complete booking ----
  function completeBooking() {
    const ticketId = generateId('MX');
    const classNames = { economy: 'Economy — Pathfinder', business: 'Business — Voyager', elite: 'Elite — Sovereign' };

    // Save ticket
    const ticket = {
      id: ticketId,
      ...booking,
      className: classNames[booking.travelClass] || booking.travelClass,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      paymentMethod: paymentMethod === 'card' ? 'Credit Card' : 'UPI / Wallet',
    };

    const tickets = MarsState.get('tickets', []);
    tickets.push(ticket);
    MarsState.set('tickets', tickets);
    MarsState.remove('booking_draft');

    // Show success
    document.getElementById('payment-content').style.display = 'none';
    const successScreen = document.getElementById('success-screen');
    successScreen.classList.add('active');

    document.getElementById('ticket-id').textContent = ticketId;

    const detailsEl = document.getElementById('success-details');
    detailsEl.innerHTML = `
      <div class="detail-row"><span class="dl">Passenger</span><span>${booking.passenger?.name}</span></div>
      <div class="detail-row"><span class="dl">Mission</span><span>${booking.mission}</span></div>
      <div class="detail-row"><span class="dl">Travel Class</span><span>${classNames[booking.travelClass] || booking.travelClass}</span></div>
      <div class="detail-row"><span class="dl">Total Paid</span><span style="color:var(--color-primary);font-weight:700">${formatCurrency(booking.total || 0)}</span></div>
      <div class="detail-row"><span class="dl">Payment</span><span>${paymentMethod === 'card' ? 'Credit Card' : 'UPI / Wallet'}</span></div>
      <div class="detail-row"><span class="dl">Status</span><span style="color:var(--color-success);font-family:monospace;">[OK] Confirmed</span></div>
    `;

    showToast('Payment successful! Your mission is confirmed.', 'success');
  }
});
