import mongoose from 'mongoose';
import { POST_TYPES } from '../utils/constants.js';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: false
  },
  type: {
    type: String,
    enum: Object.values(POST_TYPES),
    required: [true, 'Post type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  content: {
    type: String,
    trim: true,
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  images: [{
    type: String
  }],
  poll: {
    options: [{
      text: {
        type: String,
        required: true,
        maxlength: [200, 'Option text cannot exceed 200 characters']
      },
      votes: {
        type: Number,
        default: 0
      },
      voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    totalVotes: {
      type: Number,
      default: 0
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  event: {
    date: {
      type: Date,
      default: null
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    registrationLink: {
      type: String,
      trim: true
    }
  },
  flair: {
    type: String,
    trim: true,
    maxlength: [50, 'Flair cannot exceed 50 characters']
  },
  score: {
    type: Number,
    default: 0
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  hotScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ type: 1 });
postSchema.index({ score: -1 });
postSchema.index({ hotScore: -1 });
postSchema.index({ isDeleted: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ community: 1, hotScore: -1 });

// Virtual for vote count
postSchema.virtual('voteCount').get(function () {
  return this.upvotes - this.downvotes;
});

// Method to soft delete
postSchema.methods.softDelete = function (userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
};

// Method to calculate hot score (Reddit's hot algorithm)
postSchema.methods.calculateHotScore = function () {
  const score = this.upvotes - this.downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = this.createdAt.getTime() / 1000 - 1134028003;
  this.hotScore = Math.round(sign * order + seconds / 45000);
};

// Pre-save middleware to calculate hot score
postSchema.pre('save', function (next) {
  if (this.isModified('upvotes') || this.isModified('downvotes') || this.isNew) {
    this.score = this.upvotes - this.downvotes;
    this.calculateHotScore();
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;

