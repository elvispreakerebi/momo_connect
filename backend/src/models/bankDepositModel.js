const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function createBankDepositTable() {
  try {
    console.log('Creating bank_deposit table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bank_deposit (
        id CHAR(36) PRIMARY KEY,
        amount DECIMAL(15, 2),
        date DATE,
        time TIME,
        message_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Bank_deposit table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating bank_deposit table:', error);
    throw error;
  }
}

async function createBankDeposit(data) {
  try {
    const connection = await pool.getConnection();
    const id = uuidv4();
    const result = await connection.query(
      'INSERT INTO bank_deposit (id, amount, date, time, message_content) VALUES (?, ?, ?, ?, ?)',
      [id, data.amount, data.date, data.time, data.message_content]
    );
    connection.release();
    return { id, ...data };
  } catch (error) {
    console.error('Error creating bank deposit record:', error);
    throw error;
  }
}

async function getBankDeposit(id) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM bank_deposit WHERE id = ?', [id]);
    connection.release();
    return rows[0];
  } catch (error) {
    console.error('Error getting bank deposit record:', error);
    throw error;
  }
}

module.exports = { createBankDepositTable, createBankDeposit, getBankDeposit };