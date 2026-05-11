require('dotenv').config();

// STARTUP LOGIC: Zero-Config Check
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`❌ Startup Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error(`Please configure these in your .env file before starting the application.`);
    process.exit(1); // Crash gracefully
}

const express = require('express');
const productsRouter = require('./src/routes/products');
const db = require('./src/database/db'); // Initialize SQLite & create tables


const app = express();

const path = require('path');

app.use(express.json());
// Serve static files (HTML, CSS, JS, images, etc.) from the root directory
app.use(express.static(__dirname));

// API Routes
const authRouter = require('./src/routes/auth');
app.use('/api/products', productsRouter);
app.use('/api', authRouter);
app.use('/api/checkout', require('./src/routes/checkout'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
