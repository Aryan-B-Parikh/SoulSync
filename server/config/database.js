/**
 * Database Configuration
 * MongoDB connection setup
 */

const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
async function connectDB() {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    const dbUrl = process.env.MONGODB_URI || process.env.DB_URL;
    
    if (!dbUrl) {
      throw new Error('MONGODB_URI or DB_URL environment variable is required');
    }

    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
  console.log('MongoDB disconnected');
}

module.exports = {
  connectDB,
  disconnectDB,
};
