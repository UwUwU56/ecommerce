const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const dataPath = path.join(__dirname, '../data/auth_user.json');
const JWT_SECRET = 'your_jwt_secret_key_here'; // In a real app, this should be in an environment variable

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

module.exports = {
    login
};
