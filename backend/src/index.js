const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./models/database');
const SMSProcessor = require('./services/smsProcessor');
const incomingMoneyRoutes = require('./routes/incomingMoney');
const smsTestRoutes = require('./routes/smsTest');

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

// SMS test routes
app.use('/test-sms', smsTestRoutes);

// Routes
app.use('/incoming-money', incomingMoneyRoutes);

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });