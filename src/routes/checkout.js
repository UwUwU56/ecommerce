const checkoutController = require('../controllers/checkoutController');
const express = require('express');
const router = express.Router();

// POST /api/checkout
router.post('/', checkoutController.processCheckout);

module.exports = router;
