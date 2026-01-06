const mongoose = require('mongoose');

const brandingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reseller',
    },
    logoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Logo URL must be a valid HTTP/HTTPS URL',
      },
    },
    brandingText: {
      type: String,
      trim: true,
      maxlength: [500, 'Branding text cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

brandingSchema.index({ userId: 1 });
brandingSchema.index({ resellerId: 1 });

brandingSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

brandingSchema.set('toObject', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Branding = mongoose.model('Branding', brandingSchema);

module.exports = Branding;
