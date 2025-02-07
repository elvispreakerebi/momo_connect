const express = require('express');
const router = express.Router();
const bundlesAndPacksService = require('../services/bundlesAndPacksService');

// Get all bundles and packs transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await bundlesAndPacksService.getAllBundlesAndPacks();
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching bundles and packs transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bundles and packs transactions'
    });
  }
});

//Route to return the total amount and total transactions.
router.get('/total', async (req, res) => {
  try {
    const transactions = await bundlesAndPacksService.getAllBundlesAndPacks();
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
    console.error('Error calculating bundles and packs totals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate bundles and packs totals'
    });
  }
});

// Process XML file and save bundles and packs messages
router.get('/process-xml', async (req, res) => {
  try {
    const filePath = './modified_sms_v2.xml';
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }
    await bundlesAndPacksService.processXMLFile(filePath);
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

// Get a specific bundle transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await bundlesAndPacksService.getBundleById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Bundle transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching bundle transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bundle transaction'
    });
  }
});

module.exports = router;