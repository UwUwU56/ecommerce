const express = require('express');
const productsRouter = require('./src/routes/products');

const app = express();

app.use(express.json());

// API Routes
app.use('/api/products', productsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
