const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./models/databaseInit');
const incomingMoneyRoutes = require('./routes/incomingMoney');
const paymentToCodeHolderRoutes = require('./routes/paymentToCodeHolders');
const transferToMobileNumberRoutes = require('./routes/transferToMobileNumber');
const airtimeRoutes = require('./routes/airtime');
const cashPowerRoutes = require('./routes/cashPower');
const bundlesAndPacksRoutes = require('./routes/bundlesAndPacks');
const withdrawalFromAgentRoutes = require('./routes/withdrawalFromAgent');
const transactionSearchRoutes = require('./routes/transactionSearch');
const bankDepositRoutes = require('./routes/bankDeposit');
const visualizationRoutes = require('./routes/visualization');

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

// Routes
app.use('/incoming-money', incomingMoneyRoutes);
app.use('/payment-to-code-holders', paymentToCodeHolderRoutes);
app.use('/transfer-to-mobile-number', transferToMobileNumberRoutes);
app.use('/airtime', airtimeRoutes)
app.use('/cash-power', cashPowerRoutes)
app.use('/bundles-and-packs', bundlesAndPacksRoutes)
app.use('/withdrawal-from-agent', withdrawalFromAgentRoutes);
app.use('/transactions', transactionSearchRoutes);
app.use('/bank-deposit', bankDepositRoutes);
app.use('/visualization', visualizationRoutes);

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