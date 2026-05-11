// Checkout Controller
const orderService = require('../services/orderService');

exports.processCheckout = async (req, res) => {
    try {
        const user_id = req.user ? req.user.id : 0;
        
        const result = await orderService.processCheckout(req.body, user_id);

        return res.status(200).json({
            message: "Order processed successfully!",
            total: result.total
        });

    } catch (error) {
        console.error("Checkout Error:", error);
        
        const status = error.status || 400;
        if (error.errors) {
            // Validation error
            return res.status(status).json({
                message: error.message || "Invalid order data",
                errors: error.errors
            });
        }
        
        // Other errors (e.g. Save Order failure)
        return res.status(status).json({
            message: error.message || "An error occurred while processing the order.",
            errors: { general: "Checkout process failed." }
        });
    }
};
