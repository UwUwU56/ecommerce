const db = require('../database/db');

class OrderRepository {
    saveOrder(userId, productId, quantity, itemTotal) {
        return new Promise((resolve, reject) => {
            const SQL = `INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)`;
            db.run(SQL, [userId, productId, quantity, itemTotal], function (err) {
                if (err) {
                    console.error('❌ DB INSERT error:', err.message);
                    return reject(err);
                }
                console.log(`✅ Order row saved — id: ${this.lastID}`);
                resolve(this.lastID);
            });
        });
    }
}

module.exports = new OrderRepository();
