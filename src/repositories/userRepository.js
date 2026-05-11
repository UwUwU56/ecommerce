// src/repositories/userRepository.js
// Repository Pattern: ALL raw data access for users lives here.
// No business logic — just read/write the data store.

const fs   = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/auth_user.json');

/**
 * Return the full list of users from the JSON store.
 * @returns {Array} Array of user objects
 */
const findAll = () => {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
};

/**
 * Find a single user by email (case-insensitive).
 * @param {string} email
 * @returns {Object|undefined}
 */
const findByEmail = (email) => {
    const users = findAll();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

/**
 * Find a single user by numeric ID.
 * @param {number} id
 * @returns {Object|undefined}
 */
const findById = (id) => {
    const users = findAll();
    return users.find(u => u.id === id);
};

/**
 * Persist a new user to the JSON store.
 * @param {Object} newUser
 * @returns {Object} The saved user object
 */
const save = (newUser) => {
    const users = findAll();
    users.push(newUser);
    fs.writeFileSync(DATA_PATH, JSON.stringify(users, null, 2), 'utf-8');
    return newUser;
};

module.exports = { findAll, findByEmail, findById, save };
