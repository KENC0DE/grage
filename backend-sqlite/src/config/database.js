const { Sequelize } = require('sequelize');
const path = require('path');

// Database path
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ SQLite database connected successfully');
    console.log(`  Database location: ${dbPath}`);

    // Sync all models with database
    // Use { force: true } to drop tables and recreate (only for development)
    // Use { alter: true } to modify tables to match models (safer)
    const syncOptions = process.env.DB_RESET === 'true'
      ? { force: true }
      : { alter: false };

    await sequelize.sync(syncOptions);

    if (process.env.DB_RESET === 'true') {
      console.log('⚠ Database tables have been reset (dropped and recreated)');
    } else {
      console.log('✓ Database tables synchronized');
    }

  } catch (error) {
    console.error('✗ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

// Close database connection
const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

module.exports = {
  sequelize,
  connectDB,
  closeDB
};
