const mongoose = require('mongoose');

const ipWhitelistSchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
          return ipv4Regex.test(v) || ipv6Regex.test(v);
        },
        message: 'Please provide a valid IP address (IPv4 or IPv6)',
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ipWhitelistSchema.index({ ipAddress: 1 });
ipWhitelistSchema.index({ userId: 1 });
ipWhitelistSchema.index({ active: 1 });

ipWhitelistSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

ipWhitelistSchema.set('toObject', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const IPWhitelist = mongoose.model('IPWhitelist', ipWhitelistSchema);

module.exports = IPWhitelist;
