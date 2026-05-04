const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

// 1. Trigger: User clicks "Hat" on the Frontend.
// GET /api/products or /api/products?category=Hat
router.get('/', productsController.getProducts);

module.exports = router;
