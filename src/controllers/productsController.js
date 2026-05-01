const productsService = require('../services/productsService');

const getProducts = (req, res) => {
    try {
        const products = productsService.getAllProducts();
        res.status(200).json({
            status: 'success',
            data: products
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve products'
        });
    }
};

module.exports = {
    getProducts
};
