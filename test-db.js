// Quick MongoDB connection test
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('Connection string:', process.env.MONGODB_URI ? 'Found' : 'Missing');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Atlas connection successful!');
    console.log('Database:', mongoose.connection.name);
    await mongoose.disconnect();
    console.log('Disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
