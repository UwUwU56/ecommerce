// src/database/db.js
// Database Administrator: SQLite Connection & Schema Initialization

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Resolve the path to store.db in the project root
const DB_PATH = path.join(__dirname, '..', '..', 'store.db');

// Open (or create) the database file
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Failed to connect to store.db:', err.message);
    } else {
        console.log(`✅ Connected to SQLite database at ${DB_PATH}`);
    }
});

/**
 * Creates the `orders` table if it does not already exist.
 * Schema:
 *   id          — auto-increment primary key
 *   user_id     — ID of the user placing the order
 *   product_id  — ID of the product ordered
 *   quantity    — number of units ordered
 *   total_price — total cost for the line item
 *   created_at  — timestamp of when the order was placed
 */
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            product_id  INTEGER NOT NULL,
            quantity    INTEGER NOT NULL,
            total_price REAL    NOT NULL,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Failed to create orders table:', err.message);
        } else {
            console.log('✅ Orders table is ready.');
        }
    });
});

module.exports = db;
