const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    actionType: {
      type: String,
      enum: {
        values: ['login', 'logout', 'create', 'update', 'delete', 'other'],
        message: 'Action type must be one of: login, logout, create, update, delete, other',
      },
      required: [true, 'Action type is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ actionType: 1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });

activityLogSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

activityLogSchema.set('toObject', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
