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

// Search and filter transactions
router.get('/search', async (req, res) => {
  try {
    const {
      type,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    let tableName;
    const normalizedType = type?.toLowerCase();

    switch (normalizedType) {
      case 'incoming':
      case 'incoming-money':
        tableName = 'incoming_money';
        break;
      case 'payment':
      case 'payment-to-code-holder':
        tableName = 'payment_to_code_holders';
        break;
      case 'transfer':
      case 'transfer-to-mobile-number':
        tableName = 'transfer_to_mobile_number';
        break;
      case 'airtime':
      case 'airtime-purchase':
        tableName = 'airtime';
        break;
      case 'cashpower':
      case 'cash-power':
        tableName = 'cash_power';
        break;
      case 'bundle':
      case 'data-bundle':
        tableName = 'bundles_and_packs';
        break;
      case 'withdrawal':
      case 'agent-withdrawal':
        tableName = 'withdrawal_from_agent';
        break;
      default:
        return res.status(400).json({ error: 'Invalid transaction type' });
    }

    const { whereClause, params } = buildWhereClause(startDate, endDate, minAmount, maxAmount, tableName);

    const connection = await pool.getConnection();
    try {
      // Get total count
      const [countResult] = await connection.query(
        `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`,
        params
      );
      const totalCount = countResult[0].total;


    const [transactions] = await connection.query(
      `SELECT * FROM ${tableName} ${whereClause} ORDER BY date DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

      connection.release();

      res.json({
        transactions,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error searching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;