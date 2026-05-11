// src/services/userService.js
// Service Layer: Contains business logic.
// Orchestrates data access via the Repository and applies business rules.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const SALT_ROUNDS = 10;

/**
 * Authenticate a user and generate a JWT token.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} The JWT token if successful
 * @throws {Error} If authentication fails
 */
const authenticateUser = async (email, password) => {
    const user = userRepository.findByEmail(email);

    if (!user) {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }

    const token = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    return token;
};

/**
 * Register a new user.
 * @param {Object} userData
 * @returns {Promise<Object>} The registered user data (without password)
 * @throws {Error} If registration fails (e.g., duplicate email)
 */
const registerUser = async ({ name, email, password }) => {
    const existingUser = userRepository.findByEmail(email);

    if (existingUser) {
        const error = new Error('An account with that email already exists.');
        error.status = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const users = userRepository.findAll();
    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

    const newUser = {
        id: nextId,
        email: email,
        username: email,
        password: hashedPassword,
        firstName: name,
        registrationDate: new Date().toISOString(),
    };

    const savedUser = userRepository.save(newUser);

    return {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName
    };
};

module.exports = {
    authenticateUser,
    registerUser
};
