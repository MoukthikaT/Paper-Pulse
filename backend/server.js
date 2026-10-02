const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, isDbConnected } = require('./config/db');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const explanationRoutes = require('./routes/explanationRoutes');
const walletRoutes = require('./routes/walletRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const stockRoutes = require('./routes/stockRoutes');
const mlRoutes = require('./routes/mlRoutes');
const journalRoutes = require('./routes/journalRoutes');
const decisionLabRoutes = require('./routes/decisionLabRoutes');
const explanationService = require('./services/explanationService');
const authService = require('./services/authService');
const errorHandler = require('./middleware/errorHandler');
const { successResponse } = require('./utils/apiResponse');

// Environment Validation: Fail fast if JWT_SECRET is missing or empty
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  console.error('ERROR: JWT_SECRET environment variable is required. Server startup aborted.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting environment allowed origins
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (
      allowedOrigins.includes(origin) ||
      origin === 'https://paper-pulse-gilt.vercel.app' ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, origin);
    }
    return callback(new Error(`CORS policy: origin ${origin} is not allowed.`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/decision-lab', decisionLabRoutes);
app.use('/api/explanations', explanationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/ml', mlRoutes);

// Base Health Check Route
const healthHandler = async (req, res) => {
  const dbConnected = isDbConnected();
  let mlServiceStatus = 'OFFLINE';
  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const mlHealthRes = await fetch(`${mlUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (mlHealthRes.ok) {
      mlServiceStatus = 'ONLINE';
    }
  } catch (e) {
    mlServiceStatus = 'OFFLINE_FALLBACK_ACTIVE';
  }

  return successResponse(res, 200, 'PaperPulse Backend service is running healthy', {
    status: 'UP',
    database: dbConnected ? 'CONNECTED' : 'IN_MEMORY_FALLBACK',
    mlService: mlServiceStatus,
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.get('/', (req, res) => {
  return successResponse(res, 200, 'Paper Pulse Trading Engine API Server', {
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/trades/execute',
      'POST /api/trades/auto-signal',
      'GET /api/trades',
      'GET /api/trades/:symbol',
      'GET /api/explanations',
      'GET /api/explanations/:term'
    ]
  });
});

// Error Handler Middleware
app.use(errorHandler);

// Start Server & Initialize Database
const startServer = async () => {
  const isDbConnected = await connectDB();
  if (isDbConnected) {
    await explanationService.seedExplanationsIfEmpty();
  }
  await authService.seedDemoUserIfEmpty();

  // Only start listening if run directly (not required by test suite)
  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Paper Pulse - Hasrith's Trading, Auth & Educational Backend`);
      console.log(` Server running on http://localhost:${PORT}`);
      console.log(` Database: ${isDbConnected ? 'MongoDB Connected' : 'Mock/In-Memory Mode Active'}`);
      console.log(`====================================================`);
    });
  }
};

startServer();

module.exports = app;
