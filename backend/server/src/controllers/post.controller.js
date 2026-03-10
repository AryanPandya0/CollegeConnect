import * as postService from '../services/post.service.js';
import * as voteService from '../services/vote.service.js';
import { formatSuccess, formatError } from '../utils/formatResponse.js';
import { HTTP_STATUS, VOTE_TARGET_TYPES } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { getFileUrl } from '../middleware/upload.middleware.js';

/**
 * Create new post
 * POST /api/posts
 */
export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.body, req.userId);

  res.status(HTTP_STATUS.CREATED).json(
    formatSuccess({
      message: 'Post created successfully',
      data: { post }
    })
  );
});

/**
 * Get feed
 * GET /api/posts
 */
export const getFeed = asyncHandler(async (req, res) => {
  const result = await postService.getFeed(req.query, req.userId);

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Feed retrieved successfully',
      data: { posts: result.posts },
      pagination: result.pagination
    })
  );
});

/**
 * Get post by ID
 * GET /api/posts/:id
 */
export const getPostById = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id);

  // Get user's vote if authenticated
  let userVote = null;
  if (req.userId) {
    userVote = await voteService.getUserVote(
      req.userId,
      post._id,
      VOTE_TARGET_TYPES.POST
    );
  }

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Post retrieved successfully',
      data: {
        post: {
          ...post.toObject(),
          userVote: userVote ? userVote.value : 0
        }
      }
    })
  );
});

/**
 * Update post
 * PUT /api/posts/:id
 */
export const updatePost = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(
    req.params.id,
    req.body,
    req.userId
  );

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Post updated successfully',
      data: { post }
    })
  );
});

/**
 * Delete post (soft delete)
 * DELETE /api/posts/:id
 */
export const deletePost = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  await postService.softDeletePost(req.params.id, req.userId, isAdmin);

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Post deleted successfully',
      data: null
    })
  );
});

/**
 * Vote on post
 * POST /api/posts/:id/vote
 */
export const votePost = asyncHandler(async (req, res) => {
  const { value } = req.body;

  const result = await voteService.vote(
    req.userId,
    req.params.id,
    VOTE_TARGET_TYPES.POST,
    value
  );

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Vote recorded successfully',
      data: result
    })
  );
});

/**
 * Remove vote from post
 * DELETE /api/posts/:id/vote
 */
export const removeVote = asyncHandler(async (req, res) => {
  const result = await voteService.removeVote(
    req.userId,
    req.params.id,
    VOTE_TARGET_TYPES.POST
  );

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Vote removed successfully',
      data: result
    })
  );
});

/**
 * Get community posts
 * GET /api/communities/:id/posts
 */
export const getCommunityPosts = asyncHandler(async (req, res) => {
  const result = await postService.getCommunityPosts(req.params.id, req.query, req.userId);

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Community posts retrieved successfully',
      data: { posts: result.posts },
      pagination: result.pagination
    })
  );
});

/**
 * Get user's posts
 * GET /api/users/:id/posts
 */
export const getUserPosts = asyncHandler(async (req, res) => {
  const result = await postService.getUserPosts(req.params.id, req.query, req.userId);

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'User posts retrieved successfully',
      data: { posts: result.posts },
      pagination: result.pagination
    })
  );
});

/**
 * Upload images for post
 * POST /api/posts/upload
 */
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'No files uploaded',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  const imageUrls = req.files.map(file => getFileUrl(file.filename));

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Images uploaded successfully',
      data: { images: imageUrls }
    })
  );
});

/**
 * Vote on poll
 * POST /api/posts/:id/poll/vote
 */
export const votePoll = asyncHandler(async (req, res) => {
  const { optionIndex } = req.body;
  const postId = req.params.id;
  const userId = req.userId;

  const Post = (await import('../models/Post.model.js')).default;
  const post = await Post.findById(postId);

  if (!post || post.type !== 'poll') {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Poll not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  if (!post.poll || !post.poll.options[optionIndex]) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'Invalid option',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  // Check if user already voted
  const hasVoted = post.poll.options.some(option =>
    option.voters.includes(userId)
  );

  if (hasVoted) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'You have already voted on this poll',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  // Add vote
  post.poll.options[optionIndex].votes += 1;
  post.poll.options[optionIndex].voters.push(userId);
  post.poll.totalVotes += 1;

  await post.save();

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Vote recorded successfully',
      data: { poll: post.poll }
    })
  );
});

export default {
  createPost,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  votePost,
  removeVote,
  getCommunityPosts,
  getUserPosts,
  uploadImages,
  votePoll
};
