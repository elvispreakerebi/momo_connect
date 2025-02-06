const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function createCashPowerTable() {
  try {
    console.log('Creating cash_power table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cash_power (
        id CHAR(36) PRIMARY KEY,
        transaction_id VARCHAR(50) UNIQUE,
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

async function createCashPower(data) {
  try {
    const connection = await pool.getConnection();
    const id = uuidv4();
    const result = await connection.query(
      'INSERT INTO cash_power (id, transaction_id, amount, token, date, time, message_content) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.transaction_id, data.amount, data.token, data.date, data.time, data.message_content]
    );
    connection.release();
    return { id, ...data };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Transaction already processed:', data.transaction_id);
      return null;
    }
    console.error('Error creating cash power record:', error);
    throw error;
  }
}

async function getCashPower(id) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM cash_power WHERE id = ?', [id]);
    connection.release();
    return rows[0];
  } catch (error) {
    console.error('Error getting cash power record:', error);
    throw error;
  }
}

module.exports = { createCashPowerTable, createCashPower, getCashPower };