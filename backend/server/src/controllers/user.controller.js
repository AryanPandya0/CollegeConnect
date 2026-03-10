import User from '../models/User.model.js';
import { formatSuccess, formatError, getPaginationOptions, calculatePagination } from '../utils/formatResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { getLeaderboard as getLeaderboardService, updateCampusScore } from '../utils/generateCampusScore.js';
import { getFileUrl } from '../middleware/upload.middleware.js';

/**
 * Get current user profile
 * GET /api/users/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId)
    .populate('communities', 'name displayName avatar');

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Profile retrieved successfully',
      data: { user }
    })
  );
});

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-refreshToken')
    .populate('communities', 'name displayName avatar');

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
      message: 'User retrieved successfully',
      data: { user }
    })
  );
});

/**
 * Get user by username
 * GET /api/users/u/:username
 */
export const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username })
    .select('-refreshToken')
    .populate('communities', 'name displayName avatar');

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'User not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  // Get follower/following counts (if not using virtuals/arrays directly)
  // Assuming they are arrays in the model

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'User retrieved successfully',
      data: { user }
    })
  );
});

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { name, bio, course, year, skills, college } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (course !== undefined) updateData.course = course;
  if (year) updateData.year = year;
  if (skills) updateData.skills = skills;
  if (college) updateData.college = college;

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Profile updated successfully',
      data: { user }
    })
  );
});

/**
 * Upload avatar
 * PUT /api/users/avatar
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'No file uploaded',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  const userId = req.userId;
  const avatarUrl = getFileUrl(req.file.filename);

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarUrl },
    { new: true }
  );

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Avatar uploaded successfully',
      data: { avatar: user.avatar }
    })
  );
});

/**
 * Follow/unfollow user
 * POST /api/users/:id/follow
 */
export const followUser = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const targetUserId = req.params.id;

  if (userId === targetUserId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'You cannot follow yourself',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  const currentUser = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'User not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    // Unfollow
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== userId
    );
  } else {
    // Follow
    currentUser.following.push(targetUserId);
    targetUser.followers.push(userId);
  }

  await currentUser.save();
  await targetUser.save();

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      data: {
        isFollowing: !isFollowing,
        followerCount: targetUser.followers.length,
        followingCount: currentUser.following.length
      }
    })
  );
});

/**
 * Get followers
 * GET /api/users/:id/followers
 */
export const getFollowers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, limit, skip } = getPaginationOptions(req.query);

  const user = await User.findById(id).populate({
    path: 'followers',
    select: 'name avatar college campusScore',
    options: { skip, limit }
  });

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'User not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  const total = user.followers.length;

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Followers retrieved successfully',
      data: { followers: user.followers },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

/**
 * Get following
 * GET /api/users/:id/following
 */
export const getFollowing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, limit, skip } = getPaginationOptions(req.query);

  const user = await User.findById(id).populate({
    path: 'following',
    select: 'name avatar college campusScore',
    options: { skip, limit }
  });

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'User not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  const total = user.following.length;

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Following retrieved successfully',
      data: { following: user.following },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

/**
 * Get campus score leaderboard
 * GET /api/users/leaderboard
 */
export const getLeaderboard = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const leaderboard = await getLeaderboardService(limit);

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Leaderboard retrieved successfully',
      data: { leaderboard }
    })
  );
});

/**
 * Search users
 * GET /api/users/search
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const { page, limit, skip } = getPaginationOptions(req.query);

  if (!q) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'Search query is required',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  const searchQuery = {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { college: { $regex: q, $options: 'i' } }
    ],
    isBanned: false
  };

  const total = await User.countDocuments(searchQuery);

  const users = await User.find(searchQuery)
    .select('name avatar college campusScore')
    .skip(skip)
    .limit(limit)
    .sort({ campusScore: -1 });

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Users retrieved successfully',
      data: { users },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

export default {
  getProfile,
  getUserById,
  getUserByUsername,
  updateProfile,
  uploadAvatar,
  followUser,
  getFollowers,
  getFollowing,
  getLeaderboard,
  searchUsers
};
