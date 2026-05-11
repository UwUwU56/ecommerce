const orderRepository = require('../repositories/orderRepository');

class OrderService {
    async processCheckout(checkoutData, userId) {
        const { email, creditCard, firstName, lastName, cartItems } = checkoutData;
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

        if (Object.keys(errors).length > 0) {
            throw { status: 400, errors, message: "Validation failed" };
        }

        // SIMULATED MICROSERVICE CALL (Step 5 Integration)
        // Instead of calling a UserService function directly, we simulate a network request to an Auth/User microservice.
        try {
            // Simulated network delay
            await new Promise(resolve => setTimeout(resolve, 100));
            // Simulated fetch call to a User Service
            // const response = await fetch(`http://user-service/api/verify?userId=${userId}`);
            // if (!response.ok) throw new Error("User verification failed");
            console.log(`[OrderService] Simulated fetch('http://user-service/api/verify?userId=${userId}') - OK`);
        } catch (error) {
            console.warn(`[OrderService] User service is down or user invalid. Continuing as guest (graceful degradation).`);
            // In a real microservice, we might fallback to treating them as a guest instead of crashing.
        }

        let total = 0;
        const itemsToSave = cartItems.map(item => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            total += price * quantity;
            const product_id = item.id || 0;
            const item_total = price * quantity;
            return { product_id, quantity, item_total };
        });

        // Save orders to db via Repository
        try {
            const savePromises = itemsToSave.map(item => 
                orderRepository.saveOrder(userId, item.product_id, item.quantity, item.item_total)
            );
            await Promise.all(savePromises);
        } catch (error) {
             throw { status: 500, message: "Failed to save order to the database.", errors: { general: error.message } };
        }

        return { total };
    }
}

module.exports = new OrderService();
