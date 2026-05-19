/* ============================================
   MARS EXODUS — Auth JS (Login + Signup)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- SIGNUP ----
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmInput = document.getElementById('signup-confirm');
    const submitBtn = document.getElementById('signup-btn');

    // Password strength
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      const rules = {
        length: val.length >= 8,
        upper: /[A-Z]/.test(val),
        lower: /[a-z]/.test(val),
        number: /[0-9]/.test(val),
        special: /[^A-Za-z0-9]/.test(val),
      };

      // Update rule indicators
      Object.keys(rules).forEach(key => {
        const el = document.getElementById(`rule-${key}`);
        if (el) {
          el.classList.toggle('valid', rules[key]);
          el.querySelector('.rule-icon').textContent = rules[key] ? '[x]' : '[-]';
        }
      });

      // Strength bars
      const passed = Object.values(rules).filter(Boolean).length;
      const bars = ['str-1', 'str-2', 'str-3', 'str-4'];
      const strengthText = document.getElementById('strength-text');

      bars.forEach((id, i) => {
        const bar = document.getElementById(id);
        bar.className = 'strength-bar';
        if (i < passed) {
          if (passed <= 2) bar.classList.add('weak');
          else if (passed <= 3) bar.classList.add('medium');
          else bar.classList.add('strong');
        }
      });

      if (val.length === 0) strengthText.textContent = '';
      else if (passed <= 2) strengthText.textContent = 'Weak password';
      else if (passed <= 3) strengthText.textContent = 'Medium strength';
      else if (passed <= 4) strengthText.textContent = 'Strong password';
      else strengthText.textContent = 'Very strong password';
    });

    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      // Validate name
      if (!nameInput.value.trim()) {
        showFieldError(nameInput, 'name-error');
        valid = false;
      } else {
        clearFieldError(nameInput, 'name-error');
      }

      // Validate email
      if (!isValidEmail(emailInput.value)) {
        showFieldError(emailInput, 'email-error');
        valid = false;
      } else {
        clearFieldError(emailInput, 'email-error');
      }

      // Validate password
      if (passwordInput.value.length < 8) {
        showFieldError(passwordInput);
        valid = false;
      } else {
        clearFieldError(passwordInput);
      }

      // Validate confirm
      if (confirmInput.value !== passwordInput.value || !confirmInput.value) {
        showFieldError(confirmInput, 'confirm-error');
        valid = false;
      } else {
        clearFieldError(confirmInput, 'confirm-error');
      }

      if (!valid) return;

      // Simulate registration
      submitBtn.classList.add('btn-loading');
      await simulateDelay(1800);
      submitBtn.classList.remove('btn-loading');

      // Save user
      const user = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        createdAt: new Date().toISOString(),
      };

      // Store user credentials
      const users = MarsState.get('users', []);
      // Check duplicate
      if (users.find(u => u.email === user.email)) {
        showToast('An account with this email already exists.', 'error');
        return;
      }
      users.push({ ...user, password: passwordInput.value });
      MarsState.set('users', users);

      // Auto login
      MarsState.set('session', user);
      showToast('Account created! Welcome to Mars Exodus.', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1200);
    });
  }

  // ---- LOGIN ----
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const rememberMe = document.getElementById('remember-me');
    const submitBtn = document.getElementById('login-btn');

    // Pre-fill if remembered
    const remembered = MarsState.get('remembered_email');
    if (remembered) {
      emailInput.value = remembered;
      rememberMe.checked = true;
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      if (!isValidEmail(emailInput.value)) {
        showFieldError(emailInput, 'login-email-error');
        valid = false;
      } else {
        clearFieldError(emailInput, 'login-email-error');
      }

      if (!passwordInput.value) {
        showFieldError(passwordInput, 'login-password-error');
        valid = false;
      } else {
        clearFieldError(passwordInput, 'login-password-error');
      }

      if (!valid) return;

      submitBtn.classList.add('btn-loading');
      await simulateDelay(1500);
      submitBtn.classList.remove('btn-loading');

      // Check credentials
      const users = MarsState.get('users', []);
      const user = users.find(u => u.email === emailInput.value.trim() && u.password === passwordInput.value);

      if (!user) {
        showToast('Invalid email or password. Try again.', 'error');
        showFieldError(passwordInput, 'login-password-error');
        document.getElementById('login-password-error').textContent = 'Invalid credentials';
        document.getElementById('login-password-error').classList.add('visible');
        return;
      }

      // Remember me
      if (rememberMe.checked) {
        MarsState.set('remembered_email', user.email);
      } else {
        MarsState.remove('remembered_email');
      }

      // Set session
      MarsState.set('session', { name: user.name, email: user.email, createdAt: user.createdAt });
      showToast(`Welcome back, ${user.name}!`, 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);
    });
  }

  // ---- Helpers ----
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFieldError(input, errorId) {
    input.classList.add('error');
    if (errorId) {
      const err = document.getElementById(errorId);
      if (err) err.classList.add('visible');
    }
  }

  function clearFieldError(input, errorId) {
    input.classList.remove('error');
    if (errorId) {
      const err = document.getElementById(errorId);
      if (err) err.classList.remove('visible');
    }
  }
});
