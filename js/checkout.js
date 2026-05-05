document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Collect data
            const email = document.getElementById('email').value.trim();
            const creditCard = document.getElementById('creditCard').value.trim();
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();

            // Mock cart items (since we don't have a real cart state yet)
            const cartItems = [
                { id: 1, name: 'Electric Hummer', price: 65.00, quantity: 1 }
            ];

            const payload = {
                email,
                creditCard,
                firstName,
                lastName,
                cartItems
            };

            // Clear previous error messages
            const errorContainer = document.getElementById('checkout-errors');
            if (errorContainer) {
                errorContainer.innerHTML = '';
                errorContainer.style.display = 'none';
            }

            try {
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    // Display errors
                    if (errorContainer && data.errors) {
                        let errorHTML = '<ul style="color: red; list-style-type: disc; margin-left: 20px;">';
                        for (const [field, msg] of Object.entries(data.errors)) {
                            errorHTML += `<li><strong>${field}</strong>: ${msg}</li>`;
                        }
                        errorHTML += '</ul>';
                        errorContainer.innerHTML = errorHTML;
                        errorContainer.style.display = 'block';
                    } else if (errorContainer && data.message) {
                        errorContainer.innerHTML = `<p style="color: red;">${data.message}</p>`;
                        errorContainer.style.display = 'block';
                    }
                    console.error('Checkout failed:', data);
                    // Crucially, do NOT clear cart on the frontend here
                } else {
                    // Success
                    alert('Order placed successfully!');
                    // Normally you'd clear cart here: localStorage.removeItem('cart')
                    window.location.href = '/index.html';
                }
            } catch (err) {
                console.error('Network error during checkout:', err);
                alert('Network error. Please try again.');
            }
        });
    }
});
