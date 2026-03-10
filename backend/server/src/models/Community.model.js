import mongoose from 'mongoose';
import { REGEX } from '../utils/constants.js';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return REGEX.COMMUNITY_NAME.test(v);
      },
      message: 'Community name must be 3-30 characters, alphanumeric with hyphens only'
    }
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  college: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
    maxlength: [200, 'College name cannot exceed 200 characters']
  },
  rules: [{
    type: String,
    trim: true,
    maxlength: [500, 'Rule cannot exceed 500 characters']
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
communitySchema.index({ name: 1 }, { unique: true });
communitySchema.index({ college: 1 });
communitySchema.index({ memberCount: -1 });
communitySchema.index({ isActive: 1 });
communitySchema.index({ createdAt: -1 });

// Pre-save middleware to update memberCount
communitySchema.pre('save', function(next) {
  if (this.isModified('members')) {
    this.memberCount = this.members.length;
  }
  next();
});

// Method to check if user is moderator
communitySchema.methods.isModerator = function(userId) {
  return this.moderators.some(mod => mod.toString() === userId.toString());
};

// Method to check if user is member
communitySchema.methods.isMember = function(userId) {
  return this.members.some(member => member.toString() === userId.toString());
};

// Method to add member
communitySchema.methods.addMember = function(userId) {
  if (!this.isMember(userId)) {
    this.members.push(userId);
    this.memberCount = this.members.length;
  }
};

// Method to remove member
communitySchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(
    member => member.toString() !== userId.toString()
  );
  this.memberCount = this.members.length;
};

const Community = mongoose.model('Community', communitySchema);

export default Community;
