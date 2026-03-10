import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post is required']
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Comment cannot exceed 5000 characters']
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
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  editedAt: {
    type: Date,
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
commentSchema.index({ post: 1, parentId: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ score: -1 });
commentSchema.index({ isDeleted: 1 });

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Virtual for vote count
commentSchema.virtual('voteCount').get(function() {
  return this.upvotes - this.downvotes;
});

// Method to soft delete
commentSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
};

// Method to add reply
commentSchema.methods.addReply = function(commentId) {
  if (!this.replies.includes(commentId)) {
    this.replies.push(commentId);
  }
};

// Method to mark as edited
commentSchema.methods.markEdited = function() {
  this.isEdited = true;
  this.editedAt = new Date();
};

// Pre-save middleware to update score
commentSchema.pre('save', function(next) {
  if (this.isModified('upvotes') || this.isModified('downvotes')) {
    this.score = this.upvotes - this.downvotes;
  }
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;

