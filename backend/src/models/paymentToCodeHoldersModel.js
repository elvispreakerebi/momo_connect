const pool = require('../config/database');

async function createPaymentToCodeHoldersTable() {
try {
    console.log('Creating payment_to_code_holders table...');
    const connection = await pool.getConnection();
    await connection.query(`
    CREATE TABLE IF NOT EXISTS payment_to_code_holders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(50),
        amount DECIMAL(15, 2),
        recipient_name VARCHAR(100),
        recipient_code VARCHAR(20),
        date DATE,
        time TIME,
        message_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `);
    console.log('payment_to_code_holders table created/verified successfully');
    connection.release();
} catch (error) {
    console.error('Error creating payment_to_code_holders table:', error);
    throw error;
}
}

module.exports = { createPaymentToCodeHoldersTable };