/* ============================================
   MARS EXODUS — Dashboard JS
   Dynamic data rendering from localStorage
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  if (!MarsState.isLoggedIn()) {
    container.innerHTML = `
      <div class="dash-login-prompt">
        <h2>Access Restricted</h2>
        <p>You need to sign in to access your Mars Exodus dashboard.</p>
        <a href="login.html" class="btn btn-primary btn-lg">Sign In</a>
        <br><br>
        <a href="signup.html" class="btn btn-outline">Create Account</a>
      </div>
    `;
    return;
  }

  const user = MarsState.getUser();
  const tickets = MarsState.get('tickets', []);
  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
  const memberDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently';

  // Compute totals
  const totalSpent = tickets.reduce((sum, t) => sum + (t.total || 0), 0);
  const nextMission = tickets.length > 0 ? tickets[tickets.length - 1].mission : 'None';

  container.innerHTML = `
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-greeting">Welcome back, <span>${user.name || 'Explorer'}</span></h1>
      <p class="dashboard-subtext">Here's your mission control overview.</p>
    </div>

    <!-- Summary Cards -->
    <div class="dash-summary reveal stagger">
      <div class="dash-summary-card">
        <div class="icon" style="font-family: var(--font-display); font-weight: 800;">TKT</div>
        <div class="number">${tickets.length}</div>
        <div class="label">Booked Tickets</div>
      </div>
      <div class="dash-summary-card">
        <div class="icon" style="font-family: var(--font-display); font-weight: 800;">MSN</div>
        <div class="number">${nextMission}</div>
        <div class="label">Next Mission</div>
      </div>
      <div class="dash-summary-card">
        <div class="icon" style="font-family: var(--font-display); font-weight: 800;">VAL</div>
        <div class="number">${formatCurrency(totalSpent)}</div>
        <div class="label">Total Investment</div>
      </div>
      <div class="dash-summary-card">
        <div class="icon" style="font-family: var(--font-display); font-weight: 800;">LVL</div>
        <div class="number">${tickets.length >= 3 ? 'Platinum' : tickets.length >= 1 ? 'Silver' : 'Bronze'}</div>
        <div class="label">Member Tier</div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="dashboard-grid">
      <div>
        <!-- Tickets -->
        <div class="dash-section">
          <h3 class="dash-section-title">Your Tickets</h3>
          <div id="tickets-list">
            ${tickets.length === 0 ? `
              <div class="no-tickets">
                <p>No bookings yet. Your Mars adventure awaits!</p>
                <a href="booking.html" class="btn btn-primary">Book Your First Mission →</a>
              </div>
            ` : tickets.map(t => `
              <div class="ticket-card">
                <div class="ticket-header">
                  <div class="ticket-id-display">${t.id}</div>
                  <div class="ticket-status ${t.status}">${t.status}</div>
                </div>
                <div class="ticket-details">
                  <div class="ticket-detail">
                    <div class="td-label">Mission</div>
                    <div class="td-value">${t.mission}</div>
                  </div>
                  <div class="ticket-detail">
                    <div class="td-label">Class</div>
                    <div class="td-value">${t.className || t.travelClass}</div>
                  </div>
                  <div class="ticket-detail">
                    <div class="td-label">Passenger</div>
                    <div class="td-value">${t.passenger?.name}</div>
                  </div>
                  <div class="ticket-detail">
                    <div class="td-label">Total</div>
                    <div class="td-value" style="color:var(--color-primary)">${formatCurrency(t.total || 0)}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Mission Status -->
        <div class="dash-section">
          <h3 class="dash-section-title">Mission Status</h3>
          <div class="mission-timeline">
            <div class="mission-step completed">
              <div class="mission-step-dot" style="font-family: monospace;">OK</div>
              <div class="mission-step-info">
                <h4>Registration Complete</h4>
                <p>Account verified and medical clearance obtained</p>
              </div>
            </div>
            <div class="mission-step ${tickets.length > 0 ? 'completed' : 'current'}">
              <div class="mission-step-dot" style="font-family: monospace;">${tickets.length > 0 ? 'OK' : '-'}</div>
              <div class="mission-step-info">
                <h4>Booking Confirmed</h4>
                <p>Seat reserved and payment processed</p>
              </div>
            </div>
            <div class="mission-step ${tickets.length > 0 ? 'current' : ''}">
              <div class="mission-step-dot" style="font-family: monospace;">-</div>
              <div class="mission-step-info">
                <h4>Pre-Flight Training</h4>
                <p>2-week intensive preparation program</p>
              </div>
            </div>
            <div class="mission-step">
              <div class="mission-step-dot" style="font-family: monospace;">-</div>
              <div class="mission-step-info">
                <h4>Launch Day</h4>
                <p>Report to Exodus Spaceport</p>
              </div>
            </div>
            <div class="mission-step">
              <div class="mission-step-dot" style="font-family: monospace;">-</div>
              <div class="mission-step-info">
                <h4>Mars Arrival</h4>
                <p>Welcome to your new home</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div>
        <div class="profile-section">
          <div class="profile-avatar">${initial}</div>
          <div class="profile-name">${user.name || 'Explorer'}</div>
          <div class="profile-email">${user.email}</div>
          <div class="profile-member-since">Member since ${memberDate}</div>

          <div class="profile-stats">
            <div class="profile-stat">
              <div class="ps-val">${tickets.length}</div>
              <div class="ps-lbl">Missions</div>
            </div>
            <div class="profile-stat">
              <div class="ps-val">${tickets.length >= 1 ? 'Active' : 'Pending'}</div>
              <div class="ps-lbl">Status</div>
            </div>
          </div>

          <button class="btn btn-outline logout-btn" id="logout-btn">Sign Out</button>
        </div>
      </div>
    </div>
  `;

  // Re-init scroll reveal for dynamically added elements
  initScrollReveal();

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    MarsState.logout();
  });
});
