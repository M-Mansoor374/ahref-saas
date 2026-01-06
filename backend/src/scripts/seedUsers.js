require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    await connectDB();

    const users = [
      {
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'super_admin',
        status: 'active',
        keywordLimit: -1,
      },
      {
        name: 'Reseller Admin',
        email: 'reseller@example.com',
        password: 'Reseller123!',
        role: 'reseller',
        status: 'active',
        keywordLimit: 1000,
      },
      {
        name: 'Test User',
        email: 'user@example.com',
        password: 'User123!',
        role: 'user',
        status: 'active',
        keywordLimit: 100,
      },
    ];

    console.log('🌱 Seeding users...\n');

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      const user = await User.create(userData);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    console.log('\n✅ Seeding completed!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Super Admin:');
    console.log('  Email: admin@example.com');
    console.log('  Password: Admin123!');
    console.log('\nReseller Admin:');
    console.log('  Email: reseller@example.com');
    console.log('  Password: Reseller123!');
    console.log('\nUser:');
    console.log('  Email: user@example.com');
    console.log('  Password: User123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();

