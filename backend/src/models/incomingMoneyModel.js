const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function createIncomingMoneyTable() {
  try {
    console.log('Creating incoming_money table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS incoming_money (
        id CHAR(36) PRIMARY KEY,
        transaction_id VARCHAR(50),
        amount DECIMAL(15, 2),
        sender VARCHAR(100),
        date DATE,
        time TIME,
        message_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Incoming_money table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating incoming_money table:', error);
    throw error;
  }
}

async function createIncomingMoney(data) {
  try {
    const connection = await pool.getConnection();
    const id = uuidv4();
    const result = await connection.query(
      'INSERT INTO incoming_money (id, transaction_id, amount, sender, date, time, message_content) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.transaction_id, data.amount, data.sender, data.date, data.time, data.message_content]
    );
    connection.release();
    return { id, ...data };
  } catch (error) {
    console.error('Error creating incoming money record:', error);
    throw error;
  }
}

async function getIncomingMoney(id) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM incoming_money WHERE id = ?', [id]);
    connection.release();
    return rows[0];
  } catch (error) {
    console.error('Error getting incoming money record:', error);
    throw error;
  }
}

module.exports = { createIncomingMoneyTable, createIncomingMoney, getIncomingMoney };