import Post from '../models/Post.model.js';
import { SORT_OPTIONS } from '../utils/constants.js';

/**
 * Calculate hot score using Reddit's hot algorithm
 * @param {Object} post - Post object
 * @returns {number} Hot score
 */
export const calculateHotScore = (post) => {
  const score = post.upvotes - post.downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  
  // Reddit's epoch (November 14, 2005)
  const epoch = 1134028003;
  const seconds = post.createdAt.getTime() / 1000 - epoch;
  
  return Math.round(sign * order + seconds / 45000);
};

/**
 * Calculate top score (pure vote count)
 * @param {Object} post - Post object
 * @returns {number} Top score
 */
export const calculateTopScore = (post) => {
  return post.upvotes - post.downvotes;
};

/**
 * Sort posts by specified criteria
 * @param {Array} posts - Array of posts
 * @param {string} sortType - Sort type ('hot', 'new', 'top')
 * @returns {Array} Sorted posts
 */
export const sortPosts = (posts, sortType = SORT_OPTIONS.HOT) => {
  const sortedPosts = [...posts];
  
  switch (sortType) {
    case SORT_OPTIONS.HOT:
      sortedPosts.sort((a, b) => b.hotScore - a.hotScore);
      break;
    case SORT_OPTIONS.NEW:
      sortedPosts.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case SORT_OPTIONS.TOP:
      sortedPosts.sort((a, b) => b.score - a.score);
      break;
    default:
      sortedPosts.sort((a, b) => b.hotScore - a.hotScore);
  }
  
  return sortedPosts;
};

/**
 * Update hot scores for all posts
 * Useful for periodic recalculation
 * @returns {Promise<void>}
 */
export const updateAllHotScores = async () => {
  const posts = await Post.find({ isDeleted: false });
  
  for (const post of posts) {
    post.calculateHotScore();
    await post.save();
  }
  
  console.log(`Updated hot scores for ${posts.length} posts`);
};

/**
 * Get trending posts
 * @param {number} limit - Number of posts to return
 * @returns {Promise<Array>} Trending posts
 */
export const getTrendingPosts = async (limit = 10) => {
  const posts = await Post.find({ isDeleted: false })
    .sort({ hotScore: -1 })
    .limit(limit)
    .populate('author', 'name avatar')
    .populate('community', 'name displayName');
  
  return posts;
};

/**
 * Get top posts by time period
 * @param {string} period - Time period ('day', 'week', 'month', 'year', 'all')
 * @param {number} limit - Number of posts to return
 * @returns {Promise<Array>} Top posts
 */
export const getTopPostsByPeriod = async (period = 'all', limit = 10) => {
  let dateFilter = {};
  
  if (period !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }
    
    dateFilter = { createdAt: { $gte: startDate } };
  }
  
  const posts = await Post.find({ isDeleted: false, ...dateFilter })
    .sort({ score: -1 })
    .limit(limit)
    .populate('author', 'name avatar')
    .populate('community', 'name displayName');
  
  return posts;
};

/**
 * Get recommended posts for user
 * @param {string} userId - User ID
 * @param {number} limit - Number of posts to return
 * @returns {Promise<Array>} Recommended posts
 */
export const getRecommendedPosts = async (userId, limit = 20) => {
  // Get user's communities
  const User = (await import('../models/User.model.js')).default;
  const user = await User.findById(userId).select('communities');
  
  if (!user || !user.communities.length) {
    // Return trending posts if user has no communities
    return getTrendingPosts(limit);
  }
  
  // Get posts from user's communities
  const posts = await Post.find({
    community: { $in: user.communities },
    isDeleted: false
  })
    .sort({ hotScore: -1 })
    .limit(limit)
    .populate('author', 'name avatar')
    .populate('community', 'name displayName');
  
  return posts;
};

export default {
  calculateHotScore,
  calculateTopScore,
  sortPosts,
  updateAllHotScores,
  getTrendingPosts,
  getTopPostsByPeriod,
  getRecommendedPosts
};

