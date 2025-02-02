const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./models/database');
const SMSProcessor = require('./services/smsProcessor');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define port
const PORT = process.env.PORT || 4000;

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MoMo Connect API' });
});

// Test route for processing SMS
app.get('/test-sms', async (req, res) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});