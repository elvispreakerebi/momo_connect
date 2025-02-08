const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Helper function to build WHERE clause for date and amount filters
const buildWhereClause = (startDate, endDate, minAmount, maxAmount) => {
  const conditions = [];
  const params = [];
  
  if (startDate && endDate) {
    conditions.push('date BETWEEN ? AND ?');
    params.push(new Date(startDate), new Date(endDate));
  }

  if (minAmount) {
    conditions.push('amount >= ?');
    params.push(parseFloat(minAmount));
  }

  if (maxAmount) {
    conditions.push('amount <= ?');
    params.push(parseFloat(maxAmount));
  }

  return {
    whereClause: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '',
    params
  };
};

// Maximum number of retries for database operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to execute database query with retry logic
const executeQueryWithRetry = async (connection, query, params, retryCount = 0) => {
  try {
    return await connection.query(query, params);
  } catch (error) {
    if (error.code === 'ECONNRESET' && retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return executeQueryWithRetry(connection, query, params, retryCount + 1);
    }
    throw error;
  }
};

// Search and filter transactions
router.post('/search', async (req, res) => {
  let connection;
  try {
    const {
      type,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10
    } = req.body;

    const offset = (page - 1) * limit;
    let tableName;
    const normalizedType = type?.toLowerCase();

    switch (normalizedType) {
      case 'incoming':
      case 'incoming money':
        tableName = 'incoming_money';
        break;
      case 'bank deposit':
        tableName = 'bank_deposit';
        break;
      case 'payment':
      case 'payment to code holder':
        tableName = 'payment_to_code_holders';
        break;
      case 'transfer':
      case 'transfer to mobile number':
        tableName = 'transfer_to_mobile_number';
        break;
      case 'airtime':
      case 'airtime purchase':
        tableName = 'airtime';
        break;
      case 'cashpower':
      case 'cash power':
        tableName = 'cash_power';
        break;
      case 'bundle':
      case 'bundles and packs':
        tableName = 'bundles_and_packs';
        break;
      case 'withdrawal':
      case 'withdrawals from agents':
        tableName = 'withdrawal_from_agent';
        break;
      default:
        return res.status(400).json({ error: 'Invalid transaction type' });
    }

    const { whereClause, params } = buildWhereClause(startDate, endDate, minAmount, maxAmount, tableName);

    connection = await pool.getConnection();
    
    // Get total count with retry logic
    const [countResult] = await executeQueryWithRetry(
      connection,
      `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`,
      params
    );
    const totalCount = countResult[0].total;

    // Get transactions with retry logic
    const [transactions] = await executeQueryWithRetry(
      connection,
      `SELECT * FROM ${tableName} ${whereClause} ORDER BY date DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      transactions,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error searching transactions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.code === 'ECONNRESET' ? 'Database connection was reset. Please try again.' : 'An unexpected error occurred.'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;