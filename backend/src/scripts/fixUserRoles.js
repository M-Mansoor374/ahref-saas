require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

const fixUserRoles = async () => {
  try {
    await connectDB();

    console.log('🔍 Checking and fixing user roles...\n');

    const roleMapping = {
      'superadmin': 'super_admin',
      'reselleradmin': 'reseller',
      'reseller_admin': 'reseller',
    };

    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('⚠️  No users found.');
      process.exit(0);
    }

    for (const user of users) {
      const oldRole = user.role;
      const newRole = roleMapping[oldRole] || oldRole;
      
      if (oldRole !== newRole) {
        console.log(`🔄 Updating ${user.email}: ${oldRole} → ${newRole}`);
        user.role = newRole;
        user.status = 'active';
        await user.save();
      } else {
        console.log(`✅ ${user.email}: ${oldRole} (correct)`);
        if (user.status !== 'active') {
          user.status = 'active';
          await user.save();
          console.log(`   → Status updated to active`);
        }
      }
    }

    console.log('\n✅ All user roles and statuses are now correct!\n');

    const updatedUsers = await User.find({});
    console.log('📋 Final User Status:');
    for (const user of updatedUsers) {
      console.log(`  - ${user.email}: ${user.role} (${user.status})`);
    }

    console.log('\n✅ Done!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
    process.exit(1);
  }
};

fixUserRoles();

