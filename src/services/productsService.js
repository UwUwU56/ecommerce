const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');

const getAllProducts = () => {
    try {
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading products data:', error);
        throw new Error('Could not fetch products data');
    }
};

module.exports = {
    getAllProducts
};
