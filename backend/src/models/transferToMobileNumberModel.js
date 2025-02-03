const pool = require('../config/database');

async function createTransferToMobileNumberTable() {
  try {
    console.log('Creating transfer_to_mobile_number table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transfer_to_mobile_number (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(50) UNIQUE,
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
    console.log('Transfer_to_mobile_number table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating transfer_to_mobile_number table:', error);
    throw error;
  }
}

module.exports = { createTransferToMobileNumberTable };