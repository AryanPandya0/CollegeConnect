import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import User from '../models/User.model.js';
import { CAMPUS_SCORE_WEIGHTS } from './constants.js';

/**
 * Calculate campus score for a user based on their activity
 * @param {string} userId - User ID
 * @returns {Promise<number>} Calculated campus score
 */
export const calculateCampusScore = async (userId) => {
  try {
    // Get all posts by user with their upvotes
    const posts = await Post.find({ 
      author: userId, 
      isDeleted: false 
    }).select('upvotes');

    // Get all comments by user with their upvotes
    const comments = await Comment.find({ 
      author: userId, 
      isDeleted: false 
    }).select('upvotes');

    // Calculate score from post upvotes
    const postUpvoteScore = posts.reduce((sum, post) => {
      return sum + (post.upvotes * CAMPUS_SCORE_WEIGHTS.POST_UPVOTE);
    }, 0);

    // Calculate score from comment upvotes
    const commentUpvoteScore = comments.reduce((sum, comment) => {
      return sum + (comment.upvotes * CAMPUS_SCORE_WEIGHTS.COMMENT_UPVOTE);
    }, 0);

    // Calculate score from content creation
    const postCreationScore = posts.length * CAMPUS_SCORE_WEIGHTS.POST_CREATED;
    const commentCreationScore = comments.length * CAMPUS_SCORE_WEIGHTS.COMMENT_CREATED;

    // Total score
    const totalScore = postUpvoteScore + commentUpvoteScore + postCreationScore + commentCreationScore;

    return totalScore;
  } catch (error) {
    console.error('Error calculating campus score:', error);
    throw error;
  }
};

/**
 * Update user's campus score in database
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user object
 */
export const updateCampusScore = async (userId) => {
  try {
    const score = await calculateCampusScore(userId);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { campusScore: score },
      { new: true }
    );

    return user;
  } catch (error) {
    console.error('Error updating campus score:', error);
    throw error;
  }
};

/**
 * Recalculate campus score for all users
 * Useful for periodic updates or maintenance
 * @returns {Promise<void>}
 */
export const recalculateAllCampusScores = async () => {
  try {
    const users = await User.find({}).select('_id');
    
    for (const user of users) {
      await updateCampusScore(user._id);
    }
    
    console.log(`Recalculated campus scores for ${users.length} users`);
  } catch (error) {
    console.error('Error recalculating all campus scores:', error);
    throw error;
  }
};

/**
 * Get leaderboard of users by campus score
 * @param {number} limit - Number of users to return
 * @returns {Promise<Array>} Array of users sorted by campus score
 */
export const getLeaderboard = async (limit = 10) => {
  try {
    const users = await User.find({ isBanned: false })
      .select('name avatar college campusScore')
      .sort({ campusScore: -1 })
      .limit(limit);

    return users;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

export default {
  calculateCampusScore,
  updateCampusScore,
  recalculateAllCampusScores,
  getLeaderboard
};

