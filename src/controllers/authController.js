const fs   = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt  = require('jsonwebtoken');

// Path to the JSON file that acts as our user "database"
const dataPath  = path.join(__dirname, '../data/auth_user.json');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'; // In production, load from an environment variable

// How many salt rounds bcrypt will use — higher = slower (more secure), 10 is a sensible default
const SALT_ROUNDS = 10;

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Read users from the "database"
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const users = JSON.parse(rawData);

        // Find the user by email
        const user = users.find(u => u.email === email);

        // Check if the email is not in my database, return 401 Unauthorized status.
        // It says "Why should the error say 'Invalid email or password' instead of 'Email not found'?"
        // I will return 'Invalid email or password' to avoid user enumeration.
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the submitted password with a hashed one in my database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // If it matches, use jsonwebtoken to sign a token containing the user's ID
        const token = jwt.sign(
            { id: user.id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return the token with a 200 status
        res.status(200).json({
            message: 'Login successful',
            token: token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── Register Controller ─────────────────────────────────────────────────────

/**
 * POST /api/register
 *
 * Flow:
 *  1. TRIGGER   — receives { name, email, password } from the request body.
 *  2. REQUEST   — validates that all fields are present.
 *  3. PROCESSING
 *      a. Load auth_user.json and search for a matching email.
 *      b. If a duplicate email is found → 409 Conflict (username already taken).
 *      c. Hash the plain-text password with bcrypt.
 *      d. Build a new user object and push it into the users array.
 *      e. Persist the updated array back to auth_user.json.
 *  4. RESPONSE  — 201 Created on success, appropriate error codes on failure.
 */
const register = async (req, res) => {
    try {
        // ── TRIGGER: destructure the incoming body ────────────────────────
        const { name, email, password } = req.body;

        // ── REQUEST: basic presence validation ────────────────────────────
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // ── PROCESSING (a): read the current user list from disk ──────────
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const users   = JSON.parse(rawData);

        // ── PROCESSING (b): check for duplicate email (username) ──────────
        // Email is used as the username; no two accounts may share the same email.
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            // 409 Conflict — the username (email) is already registered
            return res.status(409).json({ message: 'An account with that email already exists.' });
        }

        // ── PROCESSING (c): hash the password before storing it ───────────
        // Never store plain-text passwords — bcrypt produces a one-way hash.
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // ── PROCESSING (d): build the new user record ─────────────────────
        // Generate the next ID by incrementing the highest existing ID.
        const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

        const newUser = {
            id:               nextId,
            email:            email,           // email doubles as the username
            username:         email,
            password:         hashedPassword,  // stored as a bcrypt hash, never plain-text
            firstName:        name,
            registrationDate: new Date().toISOString(),
        };

        // Push the new user onto the array
        users.push(newUser);

        // ── PROCESSING (e): write the updated array back to disk ──────────
        fs.writeFileSync(dataPath, JSON.stringify(users, null, 2), 'utf-8');

        // ── RESPONSE: 201 Created ─────────────────────────────────────────
        return res.status(201).json({
            message: 'Registration successful! You can now log in.',
            userId:  newUser.id,
        });

    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = {
    login,
    register,
};
