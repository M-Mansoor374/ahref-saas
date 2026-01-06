require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

const activateUsers = async () => {
  try {
    await connectDB();

    console.log('🔍 Checking user status...\n');

    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database.');
      console.log('💡 Run seedUsers.js first to create users.');
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s):\n`);

    for (const user of users) {
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.status}`);
      console.log(`---`);
    }

    console.log('\n🔄 Activating all users...\n');

    const result = await User.updateMany(
      {},
      { $set: { status: 'active' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} user(s) to active status.\n`);

    const updatedUsers = await User.find({});
    console.log('📋 Updated Users:');
    for (const user of updatedUsers) {
      console.log(`  - ${user.email} (${user.role}): ${user.status}`);
    }

    console.log('\n✅ All users are now active!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error activating users:', error);
    process.exit(1);
  }
};

activateUsers();

