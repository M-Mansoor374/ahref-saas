require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const User = require('./src/models/User');
const authService = require('./src/services/authService');

const testAuth = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    
    console.log('\n📊 Checking users in database...');
    const userCount = await User.countDocuments();
    console.log(`Total users: ${userCount}`);
    
    if (userCount === 0) {
      console.log('\n⚠️  No users found. Creating test user...');
      const testUser = await authService.registerUser({
        email: 'admin@example.com',
        password: 'Admin123!',
        name: 'Super Admin',
        role: 'super_admin',
      });
      console.log('✅ Test user created:', testUser.email);
    }
    
    console.log('\n🔐 Testing login...');
    const loginResult = await authService.loginUser({
      email: 'admin@example.com',
      password: 'Admin123!',
    });
    
    console.log('✅ Login successful!');
    console.log('User:', loginResult.user.email);
    console.log('Role:', loginResult.user.role);
    console.log('Token:', loginResult.token.substring(0, 20) + '...');
    
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testAuth();

