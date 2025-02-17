const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function createBundlesAndPacksTable() {
  try {
    console.log('Creating bundles_and_packs table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bundles_and_packs (
        id CHAR(36) PRIMARY KEY,
        transaction_id VARCHAR(50) UNIQUE,
        amount DECIMAL(15, 2),
        date DATE,
        time TIME,
        message_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Bundles and Packs table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating bundles and packs table:', error);
    throw error;
  }
}

async function createBundlesAndPacks(data) {
  try {
    const connection = await pool.getConnection();
    const id = uuidv4();
    await connection.query(
      'INSERT INTO bundles_and_packs (id, transaction_id, amount, date, time, message_content) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.transaction_id, data.amount, data.date, data.time, data.message_content]
    );
    connection.release();
    return { id, ...data };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Transaction already processed:', data.transaction_id);
      return null;
    }
    console.error('Error creating bundles and packs record:', error);
    throw error;
  }
}

async function getBundlesAndPacks(id) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM bundles_and_packs WHERE id = ?', [id]);
    connection.release();
    return rows[0];
  } catch (error) {
    console.error('Error getting bundles and packs record:', error);
    throw error;
  }
}

module.exports = { createBundlesAndPacksTable, createBundlesAndPacks, getBundlesAndPacks };