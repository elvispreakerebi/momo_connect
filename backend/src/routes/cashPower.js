const express = require('express');
const router = express.Router();
const cashPowerService = require('../services/cashPowerService');
const airtimeService = require('../services/airtimeService');

// Get all cash power transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await cashPowerService.getAllCashPower();
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching cash power transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cash power transactions'
    });
  }
});

//Route to return the total amount and total transactions.
router.get('/total', async (req, res) => {
  try {
    const transactions = await cashPowerService.getAllCashPower();
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
    console.error('Error calculating cash power totals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate cashpower totals'
    });
  }
});

// Process XML file and save cash power messages
router.get('/process-xml', async (req, res) => {
  try {
    const filePath = './modified_sms_v2.xml';
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }
    await cashPowerService.processXMLFile(filePath);
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

// Get a specific cash power transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await cashPowerService.getCashPowerById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Cash power transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching cash power transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cash power transaction'
    });
  }
});

module.exports = router;