import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import Report from '../models/Report.model.js';
import Community from '../models/Community.model.js';
import Job from '../models/Job.model.js';
import { formatSuccess, formatError, getPaginationOptions, calculatePagination } from '../utils/formatResponse.js';
import { HTTP_STATUS, REPORT_STATUS, USER_ROLES } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';

/**
 * Get all users
 * GET /api/admin/users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationOptions(req.query);
  const { search, isBanned, role } = req.query;
  
  const filter = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (isBanned !== undefined) {
    filter.isBanned = isBanned === 'true';
  }
  
  if (role) {
    filter.role = role;
  }
  
  const total = await User.countDocuments(filter);
  
  const users = await User.find(filter)
    .select('-password -refreshToken')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Users retrieved successfully',
      data: { users },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

/**
 * Ban/unban user
 * PUT /api/admin/users/:id/ban
 */
export const banUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isBanned, reason } = req.body;
  const adminId = req.userId;
  
  const user = await User.findById(id);
  
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'User not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Prevent banning admins
  if (user.role === USER_ROLES.ADMIN && isBanned) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatError({
        message: 'Cannot ban admin users',
        statusCode: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  
  user.isBanned = isBanned;
  user.bannedAt = isBanned ? new Date() : null;
  user.banReason = isBanned ? reason : null;
  
  await user.save();
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: isBanned ? 'User banned successfully' : 'User unbanned successfully',
      data: { user }
    })
  );
});

/**
 * Change user role
 * PUT /api/admin/users/:id/role
 */
export const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  if (!Object.values(USER_ROLES).includes(role)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'Invalid role',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }
  
  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true }
  ).select('-password -refreshToken');
  
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'User not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'User role updated successfully',
      data: { user }
    })
  );
});

/**
 * Get reports
 * GET /api/admin/reports
 */
export const getReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationOptions(req.query);
  const { status } = req.query;
  
  const filter = {};
  if (status) {
    filter.status = status;
  }
  
  const total = await Report.countDocuments(filter);
  
  const reports = await Report.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate('reporter', 'name email')
    .populate('resolvedBy', 'name');
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Reports retrieved successfully',
      data: { reports },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

/**
 * Resolve report
 * PUT /api/admin/reports/:id
 */
export const resolveReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, action, notes } = req.body;
  const adminId = req.userId;
  
  const report = await Report.findById(id);
  
  if (!report) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Report not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  switch (status) {
    case REPORT_STATUS.RESOLVED:
      report.resolve(adminId, action, notes);
      break;
    case REPORT_STATUS.DISMISSED:
      report.dismiss(adminId, notes);
      break;
    case REPORT_STATUS.REVIEWED:
      report.markReviewed(adminId);
      break;
    default:
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatError({
          message: 'Invalid status',
          statusCode: HTTP_STATUS.BAD_REQUEST
        })
      );
  }
  
  await report.save();
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Report resolved successfully',
      data: { report }
    })
  );
});

/**
 * Remove post (admin)
 * DELETE /api/admin/posts/:id
 */
export const removePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.userId;
  
  const post = await Post.findById(id);
  
  if (!post) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Post not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  post.softDelete(adminId);
  await post.save();
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Post removed successfully',
      data: null
    })
  );
});

/**
 * Remove comment (admin)
 * DELETE /api/admin/comments/:id
 */
export const removeComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.userId;
  
  const comment = await Comment.findById(id);
  
  if (!comment) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Comment not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  comment.softDelete(adminId);
  await comment.save();
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Comment removed successfully',
      data: null
    })
  );
});

/**
 * Get platform statistics
 * GET /api/admin/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPosts,
    totalComments,
    totalCommunities,
    totalJobs,
    pendingReports,
    bannedUsers
  ] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments({ isDeleted: false }),
    Comment.countDocuments({ isDeleted: false }),
    Community.countDocuments({ isActive: true }),
    Job.countDocuments({ isActive: true }),
    Report.countDocuments({ status: REPORT_STATUS.PENDING }),
    User.countDocuments({ isBanned: true })
  ]);
  
  // Get recent signups (last 7 days)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const recentSignups = await User.countDocuments({
    createdAt: { $gte: lastWeek }
  });
  
  // Get recent posts (last 7 days)
  const recentPosts = await Post.countDocuments({
    createdAt: { $gte: lastWeek },
    isDeleted: false
  });
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Statistics retrieved successfully',
      data: {
        stats: {
          totalUsers,
          totalPosts,
          totalComments,
          totalCommunities,
          totalJobs,
          pendingReports,
          bannedUsers,
          recentSignups,
          recentPosts
        }
      }
    })
  );
});

/**
 * Get dashboard data
 * GET /api/admin/dashboard
 */
export const getDashboard = asyncHandler(async (req, res) => {
  // Get recent users
  const recentUsers = await User.find()
    .select('name email role isBanned createdAt')
    .sort({ createdAt: -1 })
    .limit(5);
  
  // Get recent reports
  const recentReports = await Report.find()
    .populate('reporter', 'name')
    .sort({ createdAt: -1 })
    .limit(5);
  
  // Get top communities
  const topCommunities = await Community.find()
    .sort({ memberCount: -1 })
    .limit(5);
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Dashboard data retrieved successfully',
      data: {
        recentUsers,
        recentReports,
        topCommunities
      }
    })
  );
});

export default {
  getUsers,
  banUser,
  changeUserRole,
  getReports,
  resolveReport,
  removePost,
  removeComment,
  getStats,
  getDashboard
};

