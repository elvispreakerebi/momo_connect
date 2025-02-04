const { pool } = require('./databaseInit');

async function createCashPowerTable() {
  try {
    console.log('Creating cash_power table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cash_power (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(50),
        amount DECIMAL(15, 2),
        token VARCHAR(100),
        date DATE,
        time TIME,
        message_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Cash power table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating cash_power table:', error);
    throw error;
  }
}

module.exports = { createCashPowerTable };