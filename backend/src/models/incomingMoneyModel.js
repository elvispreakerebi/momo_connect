const pool = require('../config/database');

async function createIncomingMoneyTable() {
  try {
    console.log('Creating incoming_money table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS incoming_money (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(50),
        amount DECIMAL(15, 2),
        sender VARCHAR(100),
        date DATE,
        time TIME,
        message_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Incoming_money table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating incoming_money table:', error);
    throw error;
  }
}

module.exports = { createIncomingMoneyTable };