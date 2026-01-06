const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return !this.startDate || value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    limit: {
      type: Number,
      required: [true, 'Limit is required'],
      min: [0, 'Limit cannot be negative'],
      default: 0,
    },
    used: {
      type: Number,
      default: 0,
      min: [0, 'Used cannot be negative'],
      validate: {
        validator: function (value) {
          return this.limit === -1 || value <= this.limit;
        },
        message: 'Used cannot exceed limit',
      },
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ startDate: 1 });
subscriptionSchema.index({ endDate: 1 });

subscriptionSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

subscriptionSchema.set('toObject', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
