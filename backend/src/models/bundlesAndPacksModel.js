const pool = require('../config/database');

async function createBundlesAndPacksTable() {
  try {
    console.log('Creating bundles_and_packs table...');
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bundles_and_packs (
        id CHAR(36) PRIMARY KEY,
        transaction_id VARCHAR(50),
        amount DECIMAL(15, 2),
        date DATE,
        time TIME,
        message_content TEXT
      )
    `);
    // Set up a trigger for UUID generation
    await connection.query(`
      CREATE TRIGGER IF NOT EXISTS bundles_and_packs_before_insert
      BEFORE INSERT ON bundles_and_packs
      FOR EACH ROW
      SET NEW.id = UUID()
    `);
    console.log('Bundles and Packs table created/verified successfully');
    connection.release();
  } catch (error) {
    console.error('Error creating bundles and packs table:', error);
    throw error;
  }
}

module.exports = { createBundlesAndPacksTable };