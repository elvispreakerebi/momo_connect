const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get total transaction volume by type
router.get('/transaction-volume', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Query each transaction table and combine results
    const queries = [
      { table: 'incoming_money', type: 'Incoming Money' },
      { table: 'bank_deposit', type: 'Bank Deposit' },
      { table: 'payment_to_code_holders', type: 'Payment to Code Holders' },
      { table: 'transfer_to_mobile_number', type: 'Transfer to Mobile Number' },
      { table: 'cash_power', type: 'Cash Power' },
      { table: 'bundles_and_packs', type: 'Bundles and Packs' },
      { table: 'withdrawal_from_agent', type: 'Withdrawal from Agent' }
    ];

    const results = [];
    for (const query of queries) {
      const [rows] = await connection.query(
        `SELECT COUNT(id) as count, SUM(amount) as totalAmount FROM ${query.table}`
      );
      if (rows[0].count > 0) {
        results.push({
          type: query.type,
          count: rows[0].count,
          totalAmount: rows[0].totalAmount || 0
        });
      }
    }

    connection.release();
    res.json(results);
  } catch (error) {
    console.error('Error fetching transaction volume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;