const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function createPaymentToCodeHoldersTable() {
try {
    console.log('Creating payment_to_code_holders table...');
    const connection = await pool.getConnection();
    await connection.query(`
    CREATE TABLE IF NOT EXISTS payment_to_code_holders (
        id CHAR(36) PRIMARY KEY,
        transaction_id VARCHAR(50) UNIQUE,
        amount DECIMAL(15, 2) NOT NULL,
        recipient_name VARCHAR(100) NOT NULL,
        recipient_code VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        message_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_transaction_id (transaction_id),
        INDEX idx_date_time (date, time)
    )
    `);
    console.log('payment_to_code_holders table created/verified successfully');
    connection.release();
} catch (error) {
    console.error('Error creating payment_to_code_holders table:', error);
    throw error;
}
}

async function createPaymentToCodeHolder(data) {
  try {
    const connection = await pool.getConnection();
    const id = uuidv4();
    
    // Check if transaction already exists
    const [existing] = await connection.query(
      'SELECT id FROM payment_to_code_holders WHERE transaction_id = ?',
      [data.transaction_id]
    );

    if (existing.length > 0) {
      connection.release();
      const error = new Error('Duplicate transaction');
      error.code = 'DUPLICATE_TRANSACTION';
      throw error;
    }

    const result = await connection.query(
      'INSERT INTO payment_to_code_holders (id, transaction_id, amount, recipient_name, recipient_code, date, time, message_content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.transaction_id, data.amount, data.recipient_name, data.recipient_code, data.date, data.time, data.message_content]
    );
    connection.release();
    return { id, ...data };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateError = new Error('Duplicate transaction');
      duplicateError.code = 'DUPLICATE_TRANSACTION';
      throw duplicateError;
    }
    console.error('Error creating payment to code holder record:', error);
    throw error;
  }
}

async function getPaymentToCodeHolder(id) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM payment_to_code_holders WHERE id = ?', [id]);
    connection.release();
    return rows[0];
  } catch (error) {
    console.error('Error getting payment to code holder record:', error);
    throw error;
  }
}

module.exports = { createPaymentToCodeHoldersTable, createPaymentToCodeHolder, getPaymentToCodeHolder };