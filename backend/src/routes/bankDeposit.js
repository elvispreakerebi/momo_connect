const express = require('express');
const router = express.Router();
const bankDepositService = require('../services/bankDepositService');
const { createBankDepositTable } = require('../models/bankDepositModel');

// Get all bank deposit transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await bankDepositService.getAllBankDeposits();
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching bank deposit transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bank deposit transactions'
    });
  }
});

// Get total bank deposit amount
router.get('/total', async (req, res) => {
  try {
    const transactions = await bankDepositService.getAllBankDeposits();
    const totalAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    res.json({
      success: true,
      data: {
        totalAmount: totalAmount.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error calculating total bank deposit amount:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate total bank deposit amount'
    });
  }
});

// Initialize database table
createBankDepositTable()
  .then(() => console.log('Database table initialized'))
  .catch(err => console.error('Error initializing database table:', err));

// Process XML file and save bank deposit messages
router.get('/process-xml', async (req, res) => {
  try {
    const filePath = './modified_sms_v2.xml'
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    await bankDepositService.processXMLFile(filePath);
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

// Get a specific bank deposit transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await bankDepositService.getBankDepositById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Bank deposit transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching bank deposit transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bank deposit transaction'
    });
  }
});

module.exports = router;