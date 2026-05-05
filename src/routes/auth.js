const express = require('express');
const router  = express.Router();
const authController = require('../controllers/authController');

// POST /api/login  — authenticates an existing user and returns a JWT
router.post('/login', authController.login);

// POST /api/register — creates a new user account and saves it to auth_user.json
router.post('/register', authController.register);

module.exports = router;
