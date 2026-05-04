const productsService = require('../services/productsService');

const getProducts = (req, res) => {
    try {
        // 2. Request: The Browser sends a specific "envelope" to the Server.
        // Opening the envelope to check for query parameters like 'category'
        const category = req.query.category;

        // 3. Processing: The Server opens the envelope, checks the "Gatekeeper" logic, and fetches data.
        let products = productsService.getAllProducts();
        
        // Gatekeeper logic: filter the data based on the category parameter if it exists
        if (category) {
            products = products.filter(product => 
                product.category && product.category.toLowerCase() === category.toLowerCase()
            );
        }

        // 4. Response: The Server sends back a "Package" (JSON) and a "Status" (Success/Fail).
        res.status(200).json({
            status: 'Success',
            data: products
        });
    } catch (error) {
        // 4. Response: The Server sends back a "Status" (Fail).
        res.status(500).json({
            status: 'Fail',
            message: 'Failed to retrieve products'
        });
    }
};

module.exports = {
    getProducts
};
