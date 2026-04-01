import mongoose from 'mongoose';
import { RESOURCE_CATEGORIES } from '../utils/constants.js';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: Object.values(RESOURCE_CATEGORIES),
    required: [true, 'Category is required'],
    default: RESOURCE_CATEGORIES.OTHER
  },
  url: {
    type: String,
    required: [true, 'Resource link is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  college: {
    type: String,
    required: [true, 'College name is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
resourceSchema.index({ category: 1 });
resourceSchema.index({ college: 1 });
resourceSchema.index({ author: 1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ title: 'text', description: 'text' });

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
