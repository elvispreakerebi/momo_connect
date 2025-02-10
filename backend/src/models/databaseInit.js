const pool = require('../config/database');
const { Sequelize } = require('sequelize');
const { createIncomingMoneyTable } = require('./incomingMoneyModel');
const { createErrorLogsTable } = require('./errorLogsModel');
const { createPaymentToCodeHoldersTable } = require('./paymentToCodeHoldersModel');
const { createTransferToMobileNumberTable } = require('./transferToMobileNumberModel');
const { createAirtimeTable } = require('./airtimeModel');
const { createCashPowerTable } = require('./cashPowerModel');
const { createBundlesAndPacksTable } = require('./bundlesAndPacksModel');
const { createWithdrawalFromAgentTable } = require('./withdrawalFromAgentModel');
const { createBankDepositTable } = require('./bankDepositModel');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT || 19926,
  ssl: {
    rejectUnauthorized: false
  }
});

// Database initialization function
async function initializeDatabase() {
  try {
    console.log('Attempting to initialize database connection...');
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');

    // Initialize all tables
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
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: true
      },
      connectTimeout: 30000, // 30 seconds
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    throw error;
  }
}

module.exports = {
  pool,
  initializeDatabase,
  sequelize
};