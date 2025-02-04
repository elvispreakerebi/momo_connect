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

// Get total airtime amount
router.get('/total', async (req, res) => {
  try {
    const transactions = await airtimeService.getAllAirtime();
    const totalAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    res.json({
      success: true,
      data: {
        totalAmount: totalAmount.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error calculating total airtime amount:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate total airtime amount'
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

module.exports = router;