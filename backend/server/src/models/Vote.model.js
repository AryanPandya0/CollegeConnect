import mongoose from 'mongoose';
import { VOTE_TARGET_TYPES, VOTE_VALUES } from '../utils/constants.js';

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required']
  },
  targetType: {
    type: String,
    enum: Object.values(VOTE_TARGET_TYPES),
    required: [true, 'Target type is required']
  },
  value: {
    type: Number,
    enum: [VOTE_VALUES.UPVOTE, VOTE_VALUES.DOWNVOTE],
    required: [true, 'Vote value is required']
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate votes
voteSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

// Index for querying votes by target
voteSchema.index({ targetId: 1, targetType: 1 });

// Index for querying votes by user
voteSchema.index({ user: 1 });

// Static method to get vote by user and target
voteSchema.statics.findByUserAndTarget = function(userId, targetId, targetType) {
  return this.findOne({ user: userId, targetId, targetType });
};

// Static method to get total votes for a target
voteSchema.statics.getVoteSummary = async function(targetId, targetType) {
  const result = await this.aggregate([
    {
      $match: {
        targetId: new mongoose.Types.ObjectId(targetId),
        targetType: targetType
      }
    },
    {
      $group: {
        _id: null,
        upvotes: {
          $sum: {
            $cond: [{ $eq: ['$value', VOTE_VALUES.UPVOTE] }, 1, 0]
          }
        },
        downvotes: {
          $sum: {
            $cond: [{ $eq: ['$value', VOTE_VALUES.DOWNVOTE] }, 1, 0]
          }
        },
        total: { $sum: '$value' }
      }
    }
  ]);

  return result[0] || { upvotes: 0, downvotes: 0, total: 0 };
};

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;
