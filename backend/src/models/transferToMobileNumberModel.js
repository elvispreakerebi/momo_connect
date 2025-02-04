const pool = require('../config/database');

async function createTransferToMobileNumberTable() {
  try {
    console.log('Creating transfer_to_mobile_number table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transfer_to_mobile_number (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(15, 2),
        recipient_name VARCHAR(100),
        phone_number VARCHAR(20),
        date DATE,
        time TIME,
        message_content TEXT,
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