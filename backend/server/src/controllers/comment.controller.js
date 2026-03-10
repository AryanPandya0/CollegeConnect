import Comment from '../models/Comment.model.js';
import Post from '../models/Post.model.js';
import * as voteService from '../services/vote.service.js';
import * as notificationService from '../services/notification.service.js';
import { formatSuccess, formatError, getPaginationOptions, calculatePagination } from '../utils/formatResponse.js';
import { HTTP_STATUS, VOTE_TARGET_TYPES } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { incrementCommentCount, decrementCommentCount } from '../services/post.service.js';

/**
 * Get comments for a post
 * GET /api/posts/:id/comments
 */
export const getComments = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const { page, limit, skip } = getPaginationOptions(req.query);
  const { sort = 'new' } = req.query;
  
  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Post not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Build sort option
  let sortOption = {};
  switch (sort) {
    case 'top':
      sortOption = { score: -1 };
      break;
    case 'new':
    default:
      sortOption = { createdAt: -1 };
  }
  
  // Get top-level comments only
  const filter = { post: postId, parentId: null, isDeleted: false };
  
  const total = await Comment.countDocuments(filter);
  
  const comments = await Comment.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name avatar'
      }
    });
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Comments retrieved successfully',
      data: { comments },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

/**
 * Add comment to post
 * POST /api/posts/:id/comments
 */
export const addComment = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const { content, parentId } = req.body;
  const userId = req.userId;
  
  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Post not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  if (post.isLocked) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatError({
        message: 'This post is locked and cannot be commented on',
        statusCode: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  
  // Create comment
  const comment = new Comment({
    author: userId,
    post: postId,
    parentId: parentId || null,
    content
  });
  
  await comment.save();
  
  // If it's a reply, add to parent's replies
  if (parentId) {
    const parentComment = await Comment.findById(parentId);
    if (parentComment) {
      parentComment.addReply(comment._id);
      await parentComment.save();
      
      // Notify parent comment author
      await notificationService.createReplyNotification(
        parentComment.author,
        userId,
        postId,
        comment._id
      );
    }
  } else {
    // Notify post author for top-level comments
    await notificationService.createReplyNotification(
      post.author,
      userId,
      postId,
      comment._id
    );
  }
  
  // Increment post comment count
  await incrementCommentCount(postId);
  
  await comment.populate('author', 'name avatar');
  
  res.status(HTTP_STATUS.CREATED).json(
    formatSuccess({
      message: 'Comment added successfully',
      data: { comment }
    })
  );
});

/**
 * Update comment
 * PUT /api/comments/:id
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.userId;
  
  const comment = await Comment.findOne({ _id: id, isDeleted: false });
  
  if (!comment) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Comment not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Check ownership
  if (comment.author.toString() !== userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatError({
        message: 'You can only edit your own comments',
        statusCode: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  
  comment.content = content;
  comment.markEdited();
  await comment.save();
  
  await comment.populate('author', 'name avatar');
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Comment updated successfully',
      data: { comment }
    })
  );
});

/**
 * Delete comment (soft delete)
 * DELETE /api/comments/:id
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const isAdmin = req.user.role === 'admin';
  
  const comment = await Comment.findOne({ _id: id, isDeleted: false });
  
  if (!comment) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Comment not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Check ownership or admin
  if (!isAdmin && comment.author.toString() !== userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatError({
        message: 'You can only delete your own comments',
        statusCode: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  
  comment.softDelete(isAdmin ? null : userId);
  await comment.save();
  
  // Decrement post comment count
  await decrementCommentCount(comment.post);
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Comment deleted successfully',
      data: null
    })
  );
});

/**
 * Vote on comment
 * POST /api/comments/:id/vote
 */
export const voteComment = asyncHandler(async (req, res) => {
  const { value } = req.body;
  
  const result = await voteService.vote(
    req.userId,
    req.params.id,
    VOTE_TARGET_TYPES.COMMENT,
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
 * Remove vote from comment
 * DELETE /api/comments/:id/vote
 */
export const removeVote = asyncHandler(async (req, res) => {
  const result = await voteService.removeVote(
    req.userId,
    req.params.id,
    VOTE_TARGET_TYPES.COMMENT
  );
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Vote removed successfully',
      data: result
    })
  );
});

/**
 * Get comment by ID
 * GET /api/comments/:id
 */
export const getCommentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const comment = await Comment.findOne({ _id: id, isDeleted: false })
    .populate('author', 'name avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name avatar'
      }
    });
  
  if (!comment) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Comment not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Get user's vote if authenticated
  let userVote = null;
  if (req.userId) {
    userVote = await voteService.getUserVote(
      req.userId,
      comment._id,
      VOTE_TARGET_TYPES.COMMENT
    );
  }
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Comment retrieved successfully',
      data: {
        comment: {
          ...comment.toObject(),
          userVote: userVote ? userVote.value : 0
        }
      }
    })
  );
});

export default {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  voteComment,
  removeVote,
  getCommentById
};

