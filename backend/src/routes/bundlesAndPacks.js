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

// Get total bundles and packs amount
router.get('/total', async (req, res) => {
  try {
    const transactions = await bundlesAndPacksService.getAllBundlesAndPacks();
    const totalAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    res.json({
      success: true,
      data: {
        totalAmount: totalAmount.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error calculating total bundles and packs amount:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate total bundles and packs amount'
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

module.exports = router;