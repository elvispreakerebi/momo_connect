const express = require('express');
const router = express.Router();
const withdrawalFromAgentService = require('../services/withdrawalFromAgentService');

// Get all withdrawal transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await withdrawalFromAgentService.getAllWithdrawals();
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching withdrawal transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch withdrawal transactions'
    });
  }
});

// Get total withdrawal amount
router.get('/total-amount', async (req, res) => {
  try {
    const transactions = await withdrawalFromAgentService.getAllWithdrawals();
    const totalAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    res.json({
      success: true,
      data: {
        totalAmount: totalAmount.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error calculating total withdrawal amount:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate total withdrawal amount'
    });
  }
});

// Process XML file and save withdrawal messages
router.get('/process-xml', async (req, res) => {
  try {
    const filePath = './modified_sms_v2.xml';
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }
    await withdrawalFromAgentService.processXMLFile(filePath);
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

// Get a specific withdrawal transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await withdrawalFromAgentService.getWithdrawalById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Withdrawal transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching withdrawal transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch withdrawal transaction'
    });
  }
});

module.exports = router;