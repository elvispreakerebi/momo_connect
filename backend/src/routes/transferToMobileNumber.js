const express = require('express');
const router = express.Router();
const transferService = require('../services/transferToMobileNumberService');

// Get all transfer to mobile number transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await transferService.getAllTransfers();
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transfer to mobile number transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transfer to mobile number transactions'
    });
  }
});

// Get total transfer amount
router.get('/total', async (req, res) => {
  try {
    const transactions = await transferService.getAllTransfers();
    const totalAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    res.json({
      success: true,
      data: {
        totalAmount: totalAmount.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error calculating total transfer amount:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate total transfer amount'
    });
  }
});

// Process XML file and save transfer to mobile number messages
router.get('/process-xml', async (req, res) => {
  try {
    const filePath = './modified_sms_v2.xml';
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }
    await transferService.processXMLFile(filePath);
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

// Get a specific transfer transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await transferService.getTransferById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transfer transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transfer transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transfer transaction'
    });
  }
});

module.exports = router;