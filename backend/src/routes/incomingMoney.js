const express = require('express');
const router = express.Router();
const incomingMoneyService = require('../services/incomingMoneyService');
const { createIncomingMoneyTable } = require('../models/incomingMoneyModel');

// Get all incoming money transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await incomingMoneyService.getAllIncomingMoney();
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching incoming money transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch incoming money transactions'
    });
  }
});

//Route to return the total amount and total transactions.
router.get('/total', async (req, res) => {
  try {
    const transactions = await incomingMoneyService.getAllIncomingMoney();
    const totalAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    const totalTransactions = Array.isArray(transactions) ? transactions.length : 0;
    res.json({
      success: true,
      data: {
        totalAmount: totalAmount.toFixed(2),
        totalTransactions
      }
    });
  } catch (error) {
    console.error('Error calculating incoming money totals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate incoming money totals'
    });
  }
});

// Initialize database table
createIncomingMoneyTable()
  .then(() => console.log('Database table initialized'))
  .catch(err => console.error('Error initializing database table:', err));

// Process XML file and save incoming money messages
router.get('/process-xml', async (req, res) => {
  try {
    const filePath = './modified_sms_v2.xml'
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    await incomingMoneyService.processXMLFile(filePath);
    res.json({
      success: true,
      message: 'XML file processed successfully'
    });
  } catch (error) {
    console.error('Error processing XML file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process XML file'
    });
  }
});

// Get a specific incoming money transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await incomingMoneyService.getIncomingMoneyById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Incoming money transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching incoming money transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch incoming money transaction'
    });
  }
});

module.exports = router;