const pool = require('../config/database');

async function createCashPowerTable() {
  try {
    console.log('Creating cash_power table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cash_power (
        id CHAR(36) PRIMARY KEY,
        transaction_id VARCHAR(50),
        amount DECIMAL(15, 2),
        token VARCHAR(100),
        date DATE,
        time TIME,
        message_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Set up a trigger for UUID generation
    await connection.query(`
      CREATE TRIGGER IF NOT EXISTS cash_power_before_insert
      BEFORE INSERT ON cash_power
      FOR EACH ROW
      SET NEW.id = UUID()
    `);
    console.log('Cash power table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating cash_power table:', error);
    throw error;
  }
}

module.exports = { createCashPowerTable };