const express = require('express');
const router = express.Router();
const { Op, Sequelize } = require('sequelize');
const { Transaction } = require('../models/databaseInit');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

// Get total transaction volume by type
router.get('/transaction-volume', async (req, res) => {
  try {
    const transactionVolume = await Transaction.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['type'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']]
    });
    res.json(transactionVolume);
  } catch (error) {
    console.error('Error fetching transaction volume:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get monthly transaction summaries
router.get('/monthly-summary', async (req, res) => {
  try {
    const monthlySummary = await Transaction.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']]
    });
    res.json(monthlySummary);
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get distribution of all transaction types
router.get('/distribution', async (req, res) => {
  try {
    const distribution = await Transaction.findAll({
      attributes: [
        [sequelize.literal(`
          CASE 
            WHEN type IN ('incoming-money', 'bank-deposit') THEN 'Incoming'
            ELSE 'Outgoing'
          END
        `), 'category'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: [sequelize.literal(`
        CASE 
          WHEN type IN ('incoming-money', 'bank-deposit') THEN 'Incoming'
          ELSE 'Outgoing'
        END
      `)]
    });
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching distribution:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;