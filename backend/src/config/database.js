const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 19926,
  ssl: {
    rejectUnauthorized: false, // Changed to false to accept self-signed certificates
    minVersion: 'TLSv1.2'
  },
  connectTimeout: 60000,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

const promisePool = pool.promise();

// Test the connection
promisePool.getConnection()
  .then(connection => {
    console.log('Database connection established successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

module.exports = promisePool;