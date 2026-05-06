// Checkout Controller
const db = require('../database/db');

exports.processCheckout = (req, res) => {
    try {
        const { email, creditCard, firstName, lastName, cartItems } = req.body;
        const errors = {};

        // 1. Check incoming cart items
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            errors.cartItems = "Your cart is empty or invalid.";
        }

        // 2. Check email using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.email = "Please provide a valid email address.";
        }

        // 3. Check 16-digit credit card number
        const ccRegex = /^\d{16}$/;
        if (!creditCard || !ccRegex.test(creditCard)) {
            errors.creditCard = "Please provide a valid 16-digit credit card number.";
        }

        if (!firstName) errors.firstName = "First name is required.";
        if (!lastName) errors.lastName = "Last name is required.";

        // If validation fails, throw to be caught by try...catch
        if (Object.keys(errors).length > 0) {
            // Throw custom error object to be handled in catch block
            throw { status: 400, errors, message: "Validation failed" };
        }

        // 4. Calculate the total
        let total = 0;
        cartItems.forEach(item => {
            // assuming item has price and quantity
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            total += price * quantity;
        });

        // "Save Order" step — real SQLite INSERT per cart item
        // SQL: INSERT INTO orders (user_id, product_id, quantity, total_price)
        const SQL = `INSERT INTO orders (user_id, product_id, quantity, total_price)
                     VALUES (?, ?, ?, ?)`;

        // user_id is taken from the JWT payload if auth is used, else default to 0
        const user_id = req.user ? req.user.id : 0;

        // Use a counter to know when all inserts are done
        let completed = 0;
        let insertError = null;

        cartItems.forEach((item) => {
            const product_id  = item.id       || 0;
            const quantity    = parseInt(item.quantity) || 1;
            const item_total  = (parseFloat(item.price) || 0) * quantity;

            db.run(SQL, [user_id, product_id, quantity, item_total], function (err) {
                if (err) {
                    console.error('❌ DB INSERT error:', err.message);
                    insertError = err;
                } else {
                    console.log(`✅ Order row saved — id: ${this.lastID}`);
                }

                completed++;
                if (completed === cartItems.length) {
                    // All inserts attempted — respond to client
                    if (insertError) {
                        return res.status(500).json({
                            message: "Failed to save order to the database.",
                            errors: { general: insertError.message }
                        });
                    }
                    return res.status(200).json({
                        message: "Order processed successfully!",
                        total: total
                    });
                }
            });
        });

    } catch (error) {
        // "Crucially, include a try...catch block so that if the 'Save Order' step fails, 
        // it sends a 400 status with a specific error message for each failed field, 
        // and does NOT clear the user's cart on the frontend."
        console.error("Checkout Error:", error);
        
        if (error.errors) {
            // Validation error
            return res.status(400).json({
                message: error.message || "Invalid order data",
                errors: error.errors
            });
        }
        
        // Other errors (e.g. Save Order failure)
        return res.status(400).json({
            message: error.message || "An error occurred while processing the order.",
            errors: { general: "Checkout process failed." }
        });
    }
};
