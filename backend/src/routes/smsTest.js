const express = require('express');
const router = express.Router();
const { initializeDatabase } = require('../models/database');
const SMSProcessor = require('../services/smsProcessor');

// Test route for processing SMS
router.get('/', async (req, res) => {
  try {
    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    // Process XML file
    console.log('Creating SMS processor...');
    const smsProcessor = new SMSProcessor();
    console.log('Processing XML file...');
    await smsProcessor.processXMLFile('./sms.xml');
    console.log('XML file processed successfully');
    
    res.json({ message: 'SMS processing test completed successfully' });
  } catch (error) {
    console.error('Test failed:', error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

module.exports = router;