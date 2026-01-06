const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { USER_ROLES, DEFAULT_USER_LIMITS } = require('../types');
const { validateEmail, validateObjectId } = require('../utils/validators');

const getUserById = async (userId, includePassword = false) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const idValidation = validateObjectId(userId);
    if (!idValidation.valid) {
      throw new Error('Invalid user ID format');
    }

    const query = User.findById(userId);
    if (!includePassword) {
      query.select('-passwordHash');
    }

    const user = await query;

    return user;
  } catch (error) {
    throw error;
  }
};

const getUserByEmail = async (email, includePassword = false) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    const query = User.findOne({ email: emailValidation.value });
    if (!includePassword) {
      query.select('-passwordHash');
    }

    const user = await query;

    return user;
  } catch (error) {
    throw error;
  }
};

const getUsersByReseller = async (resellerId, filters = {}) => {
  try {
    if (!resellerId) {
      throw new Error('Reseller ID is required');
    }

    const idValidation = validateObjectId(resellerId);
    if (!idValidation.valid) {
      throw new Error('Invalid reseller ID format');
    }

    const { role = USER_ROLES.USER, isActive = null, page = 1, limit = 50 } = filters;

    const query = {
      resellerId: idValidation.value,
      role,
    };

    if (isActive !== null) {
      query.isActive = isActive;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getUserCount = async (filters = {}) => {
  try {
    const { resellerId, role, isActive } = filters;

    const query = {};

    if (resellerId) {
      const idValidation = validateObjectId(resellerId);
      if (!idValidation.valid) {
        throw new Error('Invalid reseller ID format');
      }
      query.resellerId = idValidation.value;
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive;
    }

    const count = await User.countDocuments(query);

    return count;
  } catch (error) {
    throw error;
  }
};

const getUserWithSubscription = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await getUserById(userId, false);

    if (!user) {
      return null;
    }

    const subscription = await Subscription.findOne({ userId: user._id });

    return {
      user: user.toObject(),
      subscription: subscription ? subscription.toObject() : null,
    };
  } catch (error) {
    throw error;
  }
};

const updateUserStatus = async (userId, isActive) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (typeof isActive !== 'boolean') {
      throw new Error('isActive must be a boolean value');
    }

    const idValidation = validateObjectId(userId);
    if (!idValidation.valid) {
      throw new Error('Invalid user ID format');
    }

    const user = await User.findByIdAndUpdate(
      idValidation.value,
      { isActive, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw error;
  }
};

const activateUser = async (userId) => {
  try {
    return await updateUserStatus(userId, true);
  } catch (error) {
    throw error;
  }
};

const deactivateUser = async (userId) => {
  try {
    return await updateUserStatus(userId, false);
  } catch (error) {
    throw error;
  }
};

const searchUsers = async (searchQuery, filters = {}) => {
  try {
    const { role, resellerId, isActive, page = 1, limit = 50 } = filters;

    const query = {};

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      query.$or = [{ email: searchRegex }, { name: searchRegex }];
    }

    if (role) {
      query.role = role;
    }

    if (resellerId) {
      const idValidation = validateObjectId(resellerId);
      if (idValidation.valid) {
        query.resellerId = idValidation.value;
      }
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getResellerUserLimit = async (resellerId) => {
  try {
    if (!resellerId) {
      throw new Error('Reseller ID is required');
    }

    const idValidation = validateObjectId(resellerId);
    if (!idValidation.valid) {
      throw new Error('Invalid reseller ID format');
    }

    const reseller = await User.findById(idValidation.value);

    if (!reseller) {
      throw new Error('Reseller not found');
    }

    if (reseller.role !== USER_ROLES.RESELLER && reseller.role !== USER_ROLES.RESELLER_ADMIN) {
      throw new Error('User is not a reseller');
    }

    const currentCount = await getUserCount({
      resellerId: idValidation.value,
      role: USER_ROLES.USER,
      isActive: true,
    });

    const maxUsers = DEFAULT_USER_LIMITS[reseller.role] || DEFAULT_USER_LIMITS[USER_ROLES.RESELLER];

    return {
      currentCount,
      maxUsers,
      remaining: maxUsers === -1 ? -1 : Math.max(0, maxUsers - currentCount),
      isUnlimited: maxUsers === -1,
    };
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async (filters = {}) => {
  try {
    const { role, resellerId, isActive, page = 1, limit = 50 } = filters;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (resellerId) {
      const idValidation = validateObjectId(resellerId);
      if (idValidation.valid) {
        query.resellerId = idValidation.value;
      }
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const idValidation = validateObjectId(userId);
    if (!idValidation.valid) {
      throw new Error('Invalid user ID format');
    }

    const allowedFields = ['email', 'isActive', 'role'];
    const updateFields = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'email') {
          const emailValidation = validateEmail(updateData[field]);
          if (!emailValidation.valid) {
            throw new Error(emailValidation.error);
          }
          updateFields.email = emailValidation.value;
        } else {
          updateFields[field] = updateData[field];
        }
      }
    }

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No valid fields to update');
    }

    updateFields.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(idValidation.value, updateFields, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Email already exists');
    }
    throw error;
  }
};

module.exports = {
  getUserById,
  getUserByEmail,
  getUsersByReseller,
  getUserCount,
  getUserWithSubscription,
  updateUserStatus,
  activateUser,
  deactivateUser,
  searchUsers,
  getResellerUserLimit,
  getAllUsers,
  updateUser,
};
