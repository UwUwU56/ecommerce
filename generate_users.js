const fs = require('fs');
const bcrypt = require('bcrypt');

const users = [];
const passwords = [];

const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'];

async function generateUsers() {
    for (let i = 0; i < 10; i++) {
        const plainPassword = `password${i}123!`;
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const email = `${firstNames[i].toLowerCase()}@example.com`;
        
        users.push({
            id: i + 1,
            email: email,
            username: email,
            password: hashedPassword,
            firstName: firstNames[i],
            registrationDate: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        });

        passwords.push({
            email: email,
            plaintextPassword: plainPassword
        });
    }

    fs.writeFileSync('./src/data/auth_user.json', JSON.stringify(users, null, 2));
    fs.writeFileSync('./Documentation/product_filter/test_credentials.txt', passwords.map(p => `${p.email} : ${p.plaintextPassword}`).join('\n'));
    console.log('Users generated successfully');
}

generateUsers();
