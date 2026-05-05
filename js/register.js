/**
 * register.js — Frontend Registration Logic
 *
 * Responsibilities:
 *  1. Listen for the form submit event.
 *  2. Run all password validation rules on the CLIENT before hitting the server.
 *  3. Send a POST request to the backend /api/register endpoint.
 *  4. Display success or error feedback to the user.
 */

// ─── Password Validation Rules ────────────────────────────────────────────────

/**
 * Checks whether the password meets ALL of the following rules:
 *  - At least 8 characters long
 *  - Contains at least one uppercase letter (A-Z)
 *  - Contains at least one special character: ! @ # $ % ^ & *
 *
 * @param {string} password - The raw password string entered by the user.
 * @returns {{ valid: boolean, errors: string[] }}
 *   `valid` is true only when every rule passes.
 *   `errors` is an array of human-readable failure messages.
 */
function validatePassword(password) {
  const errors = [];

  // Rule 1 – minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }

  // Rule 2 – at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  }

  // Rule 3 – at least one special character from the required set
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!, @, #, $, %, ^, &, *).');
  }

  return { valid: errors.length === 0, errors };
}

// ─── Real-time Password Strength Indicator ────────────────────────────────────

/**
 * Updates the live password-requirement checklist shown below the password field.
 * Each rule gets a ✓ or ✗ icon and a CSS class so users see progress as they type.
 */
function updatePasswordChecklist(password) {
  const lengthRule   = document.getElementById('rule-length');
  const uppercaseRule = document.getElementById('rule-uppercase');
  const specialRule  = document.getElementById('rule-special');

  // Helper — toggles classes/icons on a single rule element
  const applyRule = (el, passing) => {
    if (!el) return;
    el.classList.toggle('rule-pass', passing);
    el.classList.toggle('rule-fail', !passing);
    el.querySelector('.rule-icon').textContent = passing ? '✓' : '✗';
  };

  applyRule(lengthRule,    password.length >= 8);
  applyRule(uppercaseRule, /[A-Z]/.test(password));
  applyRule(specialRule,   /[!@#$%^&*]/.test(password));
}

// ─── Main: Attach event listeners once the DOM is ready ──────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const form        = document.getElementById('registerForm');
  const passwordInput = document.getElementById('password');
  const messageDiv  = document.getElementById('message');

  // Live update the checklist every time the user types in the password field
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      updatePasswordChecklist(passwordInput.value);
    });
  }

  if (!form) return; // Safety guard — do nothing if the form doesn't exist

  // ── Form Submit Handler ──────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    // Prevent the browser's default form submission (page reload)
    e.preventDefault();

    // ── Step 1: Collect field values ──────────────────────────────────────
    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // ── Step 2: Basic presence check ──────────────────────────────────────
    if (!name || !email || !password) {
      showMessage('All fields are required.', 'error');
      return;
    }

    // ── Step 3: Client-side password validation (FRONTEND check) ──────────
    const { valid, errors } = validatePassword(password);
    if (!valid) {
      // Join multiple error messages into a readable list
      showMessage(errors.join(' '), 'error');
      return;
    }

    // ── Step 4: Send registration request to the backend ──────────────────
    showMessage('Creating your account…', 'info');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The payload matches what the backend expects
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      // ── Step 5: Handle the response ───────────────────────────────────
      if (response.ok) {
        // 201 Created — registration succeeded
        showMessage('Account created! Redirecting to login…', 'success');
        form.reset();
        // Reset the live checklist back to neutral after a successful register
        updatePasswordChecklist('');
        setTimeout(() => { window.location.href = '/login.html'; }, 1500);
      } else {
        // 4xx / 5xx — show the backend's error message
        showMessage(data.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (err) {
      // Network error — server might be unreachable
      console.error('Registration error:', err);
      showMessage('Network error. Please check your connection and try again.', 'error');
    }
  });
});

// ─── Utility ─────────────────────────────────────────────────────────────────

/**
 * Displays a styled message inside the #message div.
 *
 * @param {string} text    - The text content to display.
 * @param {'success'|'error'|'info'} type - Controls the CSS class applied.
 */
function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  if (!messageDiv) return;
  messageDiv.textContent = text;
  messageDiv.className = type; // CSS classes: .success, .error, .info
}
