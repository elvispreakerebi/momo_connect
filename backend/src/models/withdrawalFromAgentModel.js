const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function createWithdrawalFromAgentTable() {
  try {
    console.log('Creating withdrawal_from_agent table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS withdrawal_from_agent (
        id CHAR(36) PRIMARY KEY,
        amount DECIMAL(15, 2) NOT NULL,
        agent_name VARCHAR(100) NOT NULL,
        agent_number VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        message_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Withdrawal_from_agent table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating withdrawal_from_agent table:', error);
    throw error;
  }
}

async function createWithdrawalFromAgent(data) {
  try {
    const connection = await pool.getConnection();
    const id = uuidv4();
    const result = await connection.query(
      'INSERT INTO withdrawal_from_agent (id, amount, agent_name, agent_number, date, time, message_content) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.amount, data.agent_name, data.agent_number, data.date, data.time, data.message_content]
    );
    connection.release();
    return { id, ...data };
  } catch (error) {
    console.error('Error creating withdrawal from agent record:', error);
    throw error;
  }
}

async function getWithdrawalFromAgent(id) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM withdrawal_from_agent WHERE id = ?', [id]);
    connection.release();
    return rows[0];
  } catch (error) {
    console.error('Error getting withdrawal from agent record:', error);
    throw error;
  }
}

module.exports = { createWithdrawalFromAgentTable, createWithdrawalFromAgent, getWithdrawalFromAgent };