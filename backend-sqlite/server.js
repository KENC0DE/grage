require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Import routes
const apiRoutes = require('./src/routes');

// Initialize Express app
const app = express();

// Connect to database and sync models
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Garage Service API is running (SQLite)',
    version: '1.0.0',
    database: 'SQLite',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚗 Garage Service API Server (SQLite)                   ║
║                                                            ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(42)} ║
║   Port: ${PORT.toString().padEnd(49)} ║
║   Database: SQLite                                        ║
║   Status: ✓ Running                                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  console.log(`\n📡 API Documentation:`);
  console.log(`   Health Check: http://localhost:${PORT}`);
  console.log(`   API Base URL: http://localhost:${PORT}/api`);
  console.log(`\n🔑 Authentication Endpoints:`);
  console.log(`   POST /api/auth/register - Register new user`);
  console.log(`   POST /api/auth/login - Login`);
  console.log(`\n📦 Ready to accept requests!\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
