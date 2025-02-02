const pool = require('../config/database');

async function createErrorLogsTable() {
  try {
    console.log('Creating error_logs table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message TEXT,
        raw_data TEXT,
        error_type VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Error_logs table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating error_logs table:', error);
    throw error;
  }
}

module.exports = { createErrorLogsTable };