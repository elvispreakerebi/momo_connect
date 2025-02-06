const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Transaction } = require('../models/databaseInit');

// Get total transaction volume by type
router.get('/transaction-volume', async (req, res) => {
  try {
    const transactionVolume = await Transaction.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['type']
    });
    res.json(transactionVolume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly transaction summaries
router.get('/monthly-summary', async (req, res) => {
  try {
    const monthlySummary = await Transaction.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']]
    });
    res.json(monthlySummary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get distribution of payments and deposits
router.get('/distribution', async (req, res) => {
  try {
    const distribution = await Transaction.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      where: {
        type: {
          [Op.in]: ['payment-to-code-holders', 'deposit']
        }
      },
      group: ['category']
    });
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;