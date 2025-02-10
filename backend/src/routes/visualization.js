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

// Get monthly transaction summaries
router.get('/monthly-summary', async (req, res) => {
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

    const monthlyData = {};

    for (const query of queries) {
      const [rows] = await connection.query(
        `SELECT 
          DATE_FORMAT(date, '%Y-%m') as month,
          COUNT(id) as count,
          SUM(amount) as totalAmount
        FROM ${query.table}
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        ORDER BY month ASC`
      );

      rows.forEach(row => {
        if (!monthlyData[row.month]) {
          monthlyData[row.month] = {
            month: row.month,
            totalAmount: 0,
            totalCount: 0
          };
        }
        monthlyData[row.month].totalAmount += parseFloat(row.totalAmount || 0);
        monthlyData[row.month].totalCount += row.count;
      });
    }

    // Convert the object to an array and sort by month
    const results = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    connection.release();
    res.json(results);
  } catch (error) {
    console.error('Error fetching monthly transaction summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction distribution (incoming vs outgoing)
router.get('/distribution', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Define transaction types
    const incomingTypes = [
      { table: 'incoming_money', type: 'Incoming Money' },
      { table: 'bank_deposit', type: 'Bank Deposit' }
    ];

    const outgoingTypes = [
      { table: 'payment_to_code_holders', type: 'Payment to Code Holders' },
      { table: 'transfer_to_mobile_number', type: 'Transfer to Mobile Number' },
      { table: 'cash_power', type: 'Cash Power' },
      { table: 'bundles_and_packs', type: 'Bundles and Packs' },
      { table: 'withdrawal_from_agent', type: 'Withdrawal from Agent' },
      { table: 'airtime', type: 'Airtime' }
    ];

    const results = [];

    // Process incoming transactions
    let incomingTotal = 0;
    for (const query of incomingTypes) {
      const [rows] = await connection.query(
        `SELECT SUM(amount) as totalAmount FROM ${query.table}`
      );
      if (rows[0].totalAmount) {
        incomingTotal += parseFloat(rows[0].totalAmount);
      }
    }
    if (incomingTotal > 0) {
      results.push({
        type: 'Incoming Transactions',
        amount: incomingTotal
      });
    }

    // Process outgoing transactions
    let outgoingTotal = 0;
    for (const query of outgoingTypes) {
      const [rows] = await connection.query(
        `SELECT SUM(amount) as totalAmount FROM ${query.table}`
      );
      if (rows[0].totalAmount) {
        outgoingTotal += parseFloat(rows[0].totalAmount);
      }
    }
    if (outgoingTotal > 0) {
      results.push({
        type: 'Outgoing Transactions',
        amount: outgoingTotal
      });
    }

    connection.release();
    res.json(results);
  } catch (error) {
    console.error('Error fetching transaction distribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;