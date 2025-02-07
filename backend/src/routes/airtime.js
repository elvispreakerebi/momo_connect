const express = require('express');
const router = express.Router();
const airtimeService = require('../services/airtimeService');

// Get all airtime transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await airtimeService.getAllAirtime();
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching airtime transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch airtime transactions'
    });
  }
});

//Route to return the total amount and total transactions.
router.get('/total', async (req, res) => {
  try {
    const transactions = await airtimeService.getAllAirtime();
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
    console.error('Error calculating airtime totals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate airtime totals'
    });
  }
});

// Process XML file and save airtime messages
router.get('/process-xml', async (req, res) => {
  try {
    const filePath = './modified_sms_v2.xml';
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }
    await airtimeService.processXMLFile(filePath);
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


// Get a specific airtime transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await airtimeService.getAirtimeById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Airtime transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching airtime transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch airtime transaction'
    });
  }
});

module.exports = router;