const pool = require('../config/database');

async function createTransactionsTable() {
  try {
    console.log('Creating transactions table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(50) UNIQUE,
        transaction_type VARCHAR(50),
        amount DECIMAL(15, 2),
        sender VARCHAR(100),
        recipient VARCHAR(100),
        phone_number VARCHAR(20),
        reference VARCHAR(100),
        timestamp DATETIME,
        status VARCHAR(20),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Transactions table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating transactions table:', error);
    throw error;
  }
}

module.exports = { createTransactionsTable };