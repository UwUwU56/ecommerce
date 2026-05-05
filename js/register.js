/**
 * register.js — Frontend Registration Logic
 *
 * This file handles the registration form on register.html.
 * Responsibilities:
 *  1. Show a live password requirement checklist as the user types.
 *  2. Validate all password rules CLIENT-SIDE before hitting the server.
 *  3. Send a POST /api/register request to the backend.
 *  4. Display success or error feedback inside #message.
 */

// ─── Password Validation Rules ────────────────────────────────────────────────

/**
 * Checks whether a password meets ALL three rules:
 *   - At least 8 characters
 *   - At least one uppercase letter (A-Z)
 *   - At least one special character from: ! @ # $ % ^ & *
 *
 * @param {string} password - The raw password string typed by the user.
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePassword(password) {
    const errors = [];

    // Rule 1 — minimum length
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long.');
    }

    // Rule 2 — uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter (A-Z).');
    }

    // Rule 3 — special character
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!, @, #, $, %, ^, &, *).');
    }

    return { valid: errors.length === 0, errors };
}

// ─── Live Password Checklist ──────────────────────────────────────────────────

/**
 * Updates the three #rule-* list items in real time as the user types.
 * Each item receives a 'rule-pass' or 'rule-fail' CSS class and a ✓/✗ icon.
 *
 * @param {string} password - Current value of the password field.
 */
function updatePasswordChecklist(password) {
    const rules = {
        'rule-length':    password.length >= 8,
        'rule-uppercase': /[A-Z]/.test(password),
        'rule-special':   /[!@#$%^&*]/.test(password),
    };

    Object.entries(rules).forEach(([id, passing]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle('rule-pass', passing);   // gold when passing
        el.classList.toggle('rule-fail', !passing);  // red when failing
        el.querySelector('.rule-icon').textContent = passing ? '✓' : '✗';
    });
}

// ─── Utility: show a message in #message ─────────────────────────────────────

/**
 * Renders feedback text inside the #message div.
 * CSS classes 'success', 'error', 'info' control the coloured border.
 *
 * @param {string} text
 * @param {'success'|'error'|'info'} type
 */
function showMessage(text, type) {
    const el = document.getElementById('message');
    if (!el) return;
    el.textContent = text;
    el.className = 'auth-message ' + type; // class drives display:block
}

// ─── Main: wire up events after DOM is ready ─────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const form          = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');

    // ── Live checklist: update every keystroke inside the password field ──
    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            updatePasswordChecklist(this.value);
        });
    }

    if (!form) return; // Safety guard — nothing to do without the form

    // ── Form submit handler ───────────────────────────────────────────────
    form.addEventListener('submit', async function (e) {
        // Stop the browser from doing a full-page POST
        e.preventDefault();

        // ── Step 1: Collect values ──────────────────────────────────────
        const name     = document.getElementById('name').value.trim();
        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // ── Step 2: Presence check ──────────────────────────────────────
        if (!name || !email || !password) {
            showMessage('All fields are required.', 'error');
            return;
        }

        // ── Step 3: Client-side password validation (FRONTEND check) ────
        const { valid, errors } = validatePassword(password);
        if (!valid) {
            showMessage(errors[0], 'error'); // show the first failing rule
            return;
        }

        // ── Step 4: Send request to backend ─────────────────────────────
        showMessage('Creating your account…', 'info');

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            // ── Step 5: Handle the response ────────────────────────────
            if (response.ok) {
                // 201 Created — success
                showMessage('Account created! Redirecting to sign in…', 'success');
                form.reset();
                updatePasswordChecklist(''); // reset checklist icons
                setTimeout(function () {
                    window.location.href = '/login.html';
                }, 1500);
            } else {
                // 4xx / 5xx — show the backend's message
                showMessage(data.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (err) {
            // Network-level error
            console.error('Registration network error:', err);
            showMessage('Network error. Please check your connection and try again.', 'error');
        }
    });
});
