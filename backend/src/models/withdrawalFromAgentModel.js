const pool = require('../config/database');

async function createWithdrawalFromAgentTable() {
  try {
    console.log('Creating withdrawal_from_agent table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS withdrawal_from_agent (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(50),
        amount DECIMAL(15, 2),
        agent_name VARCHAR(100),
        agent_number VARCHAR(20),
        date DATE,
        time TIME,
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

module.exports = {
  createWithdrawalFromAgentTable
};