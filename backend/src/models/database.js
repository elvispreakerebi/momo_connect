const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'momo_connect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database');
  connection.release();
});

// Database initialization function
async function initializeDatabase() {
  try {
    console.log('Attempting to initialize database connection...');
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');

    // Create transactions table
    console.log('Creating transactions table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(50) UNIQUE,
        transaction_type VARCHAR(50),
        amount DECIMAL(15, 2),
        sender VARCHAR(100),
        recipient VARCHAR(100),
        phone_number VARCHAR(20),
        reference VARCHAR(100),
        timestamp DATETIME,
        status VARCHAR(20),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Transactions table created/verified successfully');

    // Create error_logs table
    console.log('Creating error_logs table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message TEXT,
        raw_data TEXT,
        error_type VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Error_logs table created/verified successfully');

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