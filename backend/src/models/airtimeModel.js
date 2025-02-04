const pool = require('../config/database');

async function createAirtimeTable() {
  try {
    console.log('Creating airtime table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS airtime (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(50),
        amount DECIMAL(15, 2),
        date DATE,
        time TIME,
        message_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Airtime table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating airtime table:', error);
    throw error;
  }
}

module.exports = { createAirtimeTable };