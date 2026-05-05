const express = require('express');
const productsRouter = require('./src/routes/products');

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
