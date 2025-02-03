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
router.get('/total', async (req, res) => {
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

module.exports = router;