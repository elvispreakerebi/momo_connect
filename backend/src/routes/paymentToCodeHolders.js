const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentToCodeHoldersService');

// Get all payment to code holders transactions
router.get('/', async (req, res) => {
try {
    const transactions = await paymentService.getAllPayments();
    res.json({
    success: true,
    data: transactions
    });
} catch (error) {
    console.error('Error fetching payment to code holders transactions:', error);
    res.status(500).json({
    success: false,
    error: 'Failed to fetch payment to code holders transactions'
    });
}
});

// Get total payment amount
router.get('/total-amount', async (req, res) => {
try {
    const transactions = await paymentService.getAllPayments();
    const totalAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    res.json({
    success: true,
    data: {
        totalAmount: totalAmount.toFixed(2)
    }
    });
} catch (error) {
    console.error('Error calculating total payment amount:', error);
    res.status(500).json({
    success: false,
    error: 'Failed to calculate total payment amount'
    });
}
});

// Process XML file and save payment to code holders messages
router.get('/process-xml', async (req, res) => {
try {
    const filePath = './modified_sms_v2.xml';
    if (!filePath) {
    return res.status(400).json({
        success: false,
        error: 'File path is required'
    });
    }
    await paymentService.processXMLFile(filePath);
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

// Get a specific payment transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await paymentService.getPaymentById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Payment transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching payment transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment transaction'
    });
  }
});

module.exports = router;