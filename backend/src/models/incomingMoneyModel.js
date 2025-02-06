const pool = require('../config/database');

async function createIncomingMoneyTable() {
  try {
    console.log('Creating incoming_money table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS incoming_money (
        id CHAR(36) PRIMARY KEY,
        transaction_id VARCHAR(50),
        amount DECIMAL(15, 2),
        sender VARCHAR(100),
        date DATE,
        time TIME,
        message_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Set up a trigger for UUID generation
    await connection.query(`
      CREATE TRIGGER IF NOT EXISTS incoming_money_before_insert
      BEFORE INSERT ON incoming_money
      FOR EACH ROW
      SET NEW.id = UUID()
    `);
    console.log('Incoming_money table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating incoming_money table:', error);
    throw error;
  }
}

module.exports = { createIncomingMoneyTable };