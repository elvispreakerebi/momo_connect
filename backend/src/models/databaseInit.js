const pool = require('../config/database');
const { createTransactionsTable } = require('./transactionsModel');
const { createIncomingMoneyTable } = require('./incomingMoneyModel');
const { createErrorLogsTable } = require('./errorLogsModel');
const { createPaymentToCodeHoldersTable } = require('./paymentToCodeHoldersModel');
const { createTransferToMobileNumberTable } = require('./transferToMobileNumberModel');
const { createAirtimeTable } = require('./airtimeModel');
const { createCashPowerTable } = require('./cashPowerModel');
const { createBundlesAndPacksTable } = require('./bundlesAndPacksModel');
const { createWithdrawalFromAgentTable } = require('./withdrawalFromAgentModel');
const { createBankDepositTable } = require('./bankDepositModel');

// Database initialization function
async function initializeDatabase() {
  try {
    console.log('Attempting to initialize database connection...');
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');

    // Initialize all tables
    await createTransactionsTable();
    await createIncomingMoneyTable();
    await createErrorLogsTable();
    await createPaymentToCodeHoldersTable();
    await createTransferToMobileNumberTable();
    await createAirtimeTable();
    await createCashPowerTable();
    await createBundlesAndPacksTable();
    await createWithdrawalFromAgentTable();
    await createBankDepositTable();

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Database connection details:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
    throw error;
  }
}

module.exports = {
  pool,
  initializeDatabase
};