const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  urlCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for faster queries
urlSchema.index({ createdAt: 1 });
urlSchema.index({ expiresAt: 1 });
urlSchema.index({ deletedAt: 1 }); // For soft delete queries
urlSchema.index({ userId: 1 }); // For user URL counts aggregation
urlSchema.index({ urlCode: 1 }); // For URL lookups by code
urlSchema.index({ deletedAt: 1, expiresAt: 1 }); // Compound index for stats queries
urlSchema.index({ deletedAt: 1, userId: 1 }); // Compound index for user URL counts

module.exports = mongoose.model('Url', urlSchema);
