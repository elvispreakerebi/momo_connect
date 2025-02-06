const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function createTransferToMobileNumberTable() {
  try {
    console.log('Creating transfer_to_mobile_number table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transfer_to_mobile_number (
        id CHAR(36) PRIMARY KEY,
        amount DECIMAL(15, 2) NOT NULL,
        recipient_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
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

async function createTransferToMobileNumber(data) {
  try {
    const connection = await pool.getConnection();
    const id = uuidv4();
    const result = await connection.query(
      'INSERT INTO transfer_to_mobile_number (id, amount, recipient_name, phone_number, date, time, message_content) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.amount, data.recipient_name, data.phone_number, data.date, data.time, data.message_content]
    );
    connection.release();
    return { id, ...data };
  } catch (error) {
    console.error('Error creating transfer to mobile number record:', error);
    throw error;
  }
}

async function getTransferToMobileNumber(id) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM transfer_to_mobile_number WHERE id = ?', [id]);
    connection.release();
    return rows[0];
  } catch (error) {
    console.error('Error getting transfer to mobile number record:', error);
    throw error;
  }
}

module.exports = { createTransferToMobileNumberTable, createTransferToMobileNumber, getTransferToMobileNumber };