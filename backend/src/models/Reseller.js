const mongoose = require('mongoose');

const resellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    usersLimit: {
      type: Number,
      default: 0,
      min: [0, 'Users limit cannot be negative'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expireDate: {
      type: Date,
    },
    branding: {
      type: String,
      trim: true,
      maxlength: [500, 'Branding text cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

resellerSchema.index({ email: 1 });
resellerSchema.index({ startDate: 1 });
resellerSchema.index({ expireDate: 1 });

resellerSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

resellerSchema.set('toObject', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Reseller = mongoose.model('Reseller', resellerSchema);

module.exports = Reseller;
