import mongoose from 'mongoose';
import { REPORT_STATUS, REPORT_TARGET_TYPES } from '../utils/constants.js';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required']
  },
  targetType: {
    type: String,
    enum: Object.values(REPORT_TARGET_TYPES),
    required: [true, 'Target type is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: Object.values(REPORT_STATUS),
    default: REPORT_STATUS.PENDING
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  action: {
    type: String,
    trim: true,
    maxlength: [500, 'Action description cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ status: 1 });
reportSchema.index({ targetId: 1, targetType: 1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });

// Method to resolve report
reportSchema.methods.resolve = function(adminId, action, notes) {
  this.status = REPORT_STATUS.RESOLVED;
  this.resolvedBy = adminId;
  this.resolvedAt = new Date();
  this.action = action;
  if (notes) this.notes = notes;
};

// Method to dismiss report
reportSchema.methods.dismiss = function(adminId, notes) {
  this.status = REPORT_STATUS.DISMISSED;
  this.resolvedBy = adminId;
  this.resolvedAt = new Date();
  if (notes) this.notes = notes;
};

// Method to mark as reviewed
reportSchema.methods.markReviewed = function(adminId) {
  this.status = REPORT_STATUS.REVIEWED;
  this.resolvedBy = adminId;
};

// Static method to check if user has already reported
reportSchema.statics.hasReported = function(userId, targetId, targetType) {
  return this.exists({
    reporter: userId,
    targetId,
    targetType,
    status: { $in: [REPORT_STATUS.PENDING, REPORT_STATUS.REVIEWED] }
  });
};

// Static method to get reports by status
reportSchema.statics.getByStatus = function(status, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({ status })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('reporter', 'name email')
    .populate('resolvedBy', 'name');
};

const Report = mongoose.model('Report', reportSchema);

export default Report;
