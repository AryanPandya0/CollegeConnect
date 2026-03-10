import Post from '../models/Post.model.js';
import Community from '../models/Community.model.js';
import Vote from '../models/Vote.model.js';
import { SORT_OPTIONS, VOTE_TARGET_TYPES } from '../utils/constants.js';
import { getPaginationOptions, calculatePagination } from '../utils/formatResponse.js';

/**
 * Helper to populate user votes for a list of posts
 * @param {Array} posts - List of posts
 * @param {string} userId - Current user ID
 * @returns {Promise<Array>} Posts with userVote populated
 */
const populateUserVotes = async (posts, userId) => {
  if (!userId || !posts.length) {
    return posts.map(post => ({
      ...post.toObject(),
      userVote: 0
    }));
  }

  const postIds = posts.map(p => p._id);

  const votes = await Vote.find({
    user: userId,
    targetId: { $in: postIds },
    targetType: VOTE_TARGET_TYPES.POST
  });

  const voteMap = votes.reduce((acc, vote) => {
    acc[vote.targetId.toString()] = vote.value;
    return acc;
  }, {});

  return posts.map(post => ({
    ...post.toObject(),
    userVote: voteMap[post._id.toString()] || 0
  }));
};

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @param {string} userId - Author ID
 * @returns {Object} Created post
 */
export const createPost = async (postData, userId) => {
  const { communityId, type, title, content, images, poll, event, flair } = postData;

  // Verify community exists and user is a member only if communityId is provided
  if (communityId) {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isMember(userId)) {
      throw new Error('You must be a member of this community to post');
    }
  }

  const post = new Post({
    author: userId,
    community: communityId || undefined,
    type,
    title,
    content,
    images: images || [],
    poll: type === 'poll' ? poll : undefined,
    event: type === 'event' ? event : undefined,
    flair
  });

  await post.save();
  await post.populate('author', 'name avatar');
  if (communityId) {
    await post.populate('community', 'name displayName');
  }

  return post;
};

/**
 * Get post by ID
 * @param {string} postId - Post ID
 * @returns {Object} Post
 */
export const getPostById = async (postId) => {
  const post = await Post.findOne({ _id: postId, isDeleted: false })
    .populate('author', 'name avatar')
    .populate('community', 'name displayName');

  if (!post) {
    throw new Error('Post not found');
  }

  return post;
};

/**
 * Get feed with sorting and pagination
 * @param {Object} query - Query parameters
 * @param {string} userId - User ID (optional, for personalized feed)
 * @returns {Object} Posts and pagination
 */
export const getFeed = async (query, userId = null) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const { sort = SORT_OPTIONS.HOT, communityId, type } = query;

  // Build filter
  const filter = { isDeleted: false };

  if (communityId) {
    filter.community = communityId;
  }

  if (type) {
    filter.type = type;
  }

  // Determine sort order
  let sortOption = {};
  switch (sort) {
    case SORT_OPTIONS.HOT:
      sortOption = { hotScore: -1, createdAt: -1 };
      break;
    case SORT_OPTIONS.NEW:
      sortOption = { createdAt: -1 };
      break;
    case SORT_OPTIONS.TOP:
      sortOption = { score: -1, createdAt: -1 };
      break;
    default:
      sortOption = { hotScore: -1, createdAt: -1 };
  }

  // Get total count
  const total = await Post.countDocuments(filter);

  // Get posts
  const posts = await Post.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar')
    .populate('community', 'name displayName');

  const postsWithVotes = await populateUserVotes(posts, userId);

  return {
    posts: postsWithVotes,
    pagination: calculatePagination(total, page, limit)
  };
};

/**
 * Get posts by community
 * @param {string} communityId - Community ID
 * @param {Object} query - Query parameters
 * @param {string} userId - User ID (optional)
 * @returns {Object} Posts and pagination
 */
export const getCommunityPosts = async (communityId, query, userId = null) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const { sort = SORT_OPTIONS.HOT } = query;

  const filter = { community: communityId, isDeleted: false };

  let sortOption = {};
  switch (sort) {
    case SORT_OPTIONS.HOT:
      sortOption = { hotScore: -1, createdAt: -1 };
      break;
    case SORT_OPTIONS.NEW:
      sortOption = { createdAt: -1 };
      break;
    case SORT_OPTIONS.TOP:
      sortOption = { score: -1, createdAt: -1 };
      break;
    default:
      sortOption = { hotScore: -1, createdAt: -1 };
  }

  const total = await Post.countDocuments(filter);

  const posts = await Post.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar')
    .populate('community', 'name displayName');

  const postsWithVotes = await populateUserVotes(posts, userId);

  return {
    posts: postsWithVotes,
    pagination: calculatePagination(total, page, limit)
  };
};

/**
 * Get posts by user
 * @param {string} targetUserId - Target User ID
 * @param {Object} query - Query parameters
 * @param {string} currentUserId - Current User ID (viewing)
 * @returns {Object} Posts and pagination
 */
export const getUserPosts = async (targetUserId, query, currentUserId = null) => {
  const { page, limit, skip } = getPaginationOptions(query);

  const filter = { author: targetUserId, isDeleted: false };

  const total = await Post.countDocuments(filter);

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('community', 'name displayName');

  const postsWithVotes = await populateUserVotes(posts, currentUserId);

  return {
    posts: postsWithVotes,
    pagination: calculatePagination(total, page, limit)
  };
};

/**
 * Update post
 * @param {string} postId - Post ID
 * @param {Object} updateData - Update data
 * @param {string} userId - User ID
 * @returns {Object} Updated post
 */
export const updatePost = async (postId, updateData, userId) => {
  const post = await Post.findOne({ _id: postId, isDeleted: false });

  if (!post) {
    throw new Error('Post not found');
  }

  // Check ownership
  if (post.author.toString() !== userId) {
    throw new Error('You can only edit your own posts');
  }

  // Check if post is locked
  if (post.isLocked) {
    throw new Error('This post is locked and cannot be edited');
  }

  const allowedUpdates = ['title', 'content', 'images', 'flair', 'event'];

  allowedUpdates.forEach(field => {
    if (updateData[field] !== undefined) {
      post[field] = updateData[field];
    }
  });

  await post.save();
  await post.populate('author', 'name avatar');
  await post.populate('community', 'name displayName');

  return post;
};

/**
 * Soft delete post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID
 * @param {boolean} isAdmin - Whether user is admin
 */
export const softDeletePost = async (postId, userId, isAdmin = false) => {
  const post = await Post.findOne({ _id: postId, isDeleted: false });

  if (!post) {
    throw new Error('Post not found');
  }

  // Check ownership or admin
  if (!isAdmin && post.author.toString() !== userId) {
    throw new Error('You can only delete your own posts');
  }

  post.softDelete(isAdmin ? null : userId);
  await post.save();

  return true;
};

/**
 * Increment comment count
 * @param {string} postId - Post ID
 */
export const incrementCommentCount = async (postId) => {
  await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
};

/**
 * Decrement comment count
 * @param {string} postId - Post ID
 */
export const decrementCommentCount = async (postId) => {
  await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } });
};

export default {
  createPost,
  getPostById,
  getFeed,
  getCommunityPosts,
  getUserPosts,
  updatePost,
  softDeletePost,
  incrementCommentCount,
  decrementCommentCount
};

