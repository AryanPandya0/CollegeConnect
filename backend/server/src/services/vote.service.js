import Vote from '../models/Vote.model.js';
import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import { VOTE_VALUES, VOTE_TARGET_TYPES } from '../utils/constants.js';
import { updateCampusScore } from '../utils/generateCampusScore.js';

/**
 * Cast or update a vote
 * @param {string} userId - User ID
 * @param {string} targetId - Target ID (post or comment)
 * @param {string} targetType - Target type ('post' or 'comment')
 * @param {number} value - Vote value (1 or -1)
 * @returns {Object} Vote result
 */
export const vote = async (userId, targetId, targetType, value) => {
  // Validate vote value
  if (![VOTE_VALUES.UPVOTE, VOTE_VALUES.DOWNVOTE].includes(value)) {
    throw new Error('Invalid vote value. Must be 1 (upvote) or -1 (downvote)');
  }

  // Get target model
  const TargetModel = targetType === VOTE_TARGET_TYPES.POST ? Post : Comment;

  // Check if target exists
  const target = await TargetModel.findOne({ _id: targetId, isDeleted: false });
  if (!target) {
    throw new Error(`${targetType} not found`);
  }

  // Check if user is voting on their own content
  if (target.author.toString() === userId) {
    throw new Error('You cannot vote on your own content');
  }

  // Find existing vote
  let existingVote = await Vote.findByUserAndTarget(userId, targetId, targetType);

  let result = {
    action: null,
    previousValue: 0,
    newValue: value,
    targetScore: 0
  };

  if (existingVote) {
    // User is changing their vote
    if (existingVote.value === value) {
      // Same vote - remove it (toggle off)
      await Vote.deleteOne({ _id: existingVote._id });
      result.action = 'removed';
      result.previousValue = value;
      result.newValue = 0;

      // Update target vote counts
      if (value === VOTE_VALUES.UPVOTE) {
        target.upvotes -= 1;
      } else {
        target.downvotes -= 1;
      }
    } else {
      // Different vote - update it
      const oldValue = existingVote.value;
      existingVote.value = value;
      await existingVote.save();
      result.action = 'changed';
      result.previousValue = oldValue;
      result.newValue = value;

      // Update target vote counts
      if (oldValue === VOTE_VALUES.UPVOTE) {
        target.upvotes -= 1;
      } else {
        target.downvotes -= 1;
      }

      if (value === VOTE_VALUES.UPVOTE) {
        target.upvotes += 1;
      } else {
        target.downvotes += 1;
      }
    }
  } else {
    // New vote
    existingVote = new Vote({
      user: userId,
      targetId,
      targetType,
      value
    });
    await existingVote.save();
    result.action = 'created';
    result.previousValue = 0;
    result.newValue = value;

    // Update target vote counts
    if (value === VOTE_VALUES.UPVOTE) {
      target.upvotes += 1;
    } else {
      target.downvotes += 1;
    }
  }

  // Save target with updated vote counts
  await target.save();
  result.targetScore = target.score;

  // Update author's campus score if upvote
  if (value === VOTE_VALUES.UPVOTE && result.action !== 'removed') {
    await updateCampusScore(target.author);
  }

  return result;
};

/**
 * Remove a vote
 * @param {string} userId - User ID
 * @param {string} targetId - Target ID
 * @param {string} targetType - Target type
 * @returns {Object} Remove result
 */
export const removeVote = async (userId, targetId, targetType) => {
  const existingVote = await Vote.findByUserAndTarget(userId, targetId, targetType);

  if (!existingVote) {
    throw new Error('No vote found to remove');
  }

  // Get target model
  const TargetModel = targetType === VOTE_TARGET_TYPES.POST ? Post : Comment;
  const target = await TargetModel.findById(targetId);

  if (target) {
    // Update target vote counts
    if (existingVote.value === VOTE_VALUES.UPVOTE) {
      target.upvotes = Math.max(0, target.upvotes - 1);
    } else {
      target.downvotes = Math.max(0, target.downvotes - 1);
    }
    await target.save();
  }

  // Delete vote
  await Vote.deleteOne({ _id: existingVote._id });

  return {
    action: 'removed',
    previousValue: existingVote.value,
    newValue: 0,
    targetScore: target ? target.score : 0
  };
};

/**
 * Get user's vote on a target
 * @param {string} userId - User ID
 * @param {string} targetId - Target ID
 * @param {string} targetType - Target type
 * @returns {Object|null} Vote object or null
 */
export const getUserVote = async (userId, targetId, targetType) => {
  const vote = await Vote.findByUserAndTarget(userId, targetId, targetType);
  return vote ? { value: vote.value } : null;
};

/**
 * Get vote summary for a target
 * @param {string} targetId - Target ID
 * @param {string} targetType - Target type
 * @returns {Object} Vote summary
 */
export const getVoteSummary = async (targetId, targetType) => {
  return await Vote.getVoteSummary(targetId, targetType);
};

/**
 * Calculate and update target score
 * @param {string} targetId - Target ID
 * @param {string} targetType - Target type
 * @returns {number} Updated score
 */
export const calculateScore = async (targetId, targetType) => {
  const summary = await Vote.getVoteSummary(targetId, targetType);
  
  const TargetModel = targetType === VOTE_TARGET_TYPES.POST ? Post : Comment;
  await TargetModel.findByIdAndUpdate(targetId, {
    upvotes: summary.upvotes,
    downvotes: summary.downvotes,
    score: summary.total
  });

  return summary.total;
};

export default {
  vote,
  removeVote,
  getUserVote,
  getVoteSummary,
  calculateScore
};

