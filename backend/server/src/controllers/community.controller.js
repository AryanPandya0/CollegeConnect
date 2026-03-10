import Community from '../models/Community.model.js';
import User from '../models/User.model.js';
import { formatSuccess, formatError, getPaginationOptions, calculatePagination } from '../utils/formatResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { getFileUrl } from '../middleware/upload.middleware.js';

/**
 * Create new community
 * POST /api/communities
 */
export const createCommunity = asyncHandler(async (req, res) => {
  const { name, displayName, description, college, rules } = req.body;
  const userId = req.userId;

  const community = new Community({
    name: name.toLowerCase().trim(),
    displayName,
    description,
    college,
    rules: rules || [],
    moderators: [userId],
    members: [userId],
    memberCount: 1,
    createdBy: userId
  });

  await community.save();

  // Add community to user's communities
  await User.findByIdAndUpdate(userId, {
    $push: { communities: community._id }
  });

  await community.populate('moderators', 'name avatar');

  res.status(HTTP_STATUS.CREATED).json(
    formatSuccess({
      message: 'Community created successfully',
      data: { community }
    })
  );
});

/**
 * Get all communities
 * GET /api/communities
 */
export const getCommunities = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationOptions(req.query);
  const { college, search } = req.query;

  const filter = { isActive: true };

  if (college) {
    filter.college = { $regex: college, $options: 'i' };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { displayName: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Community.countDocuments(filter);

  const communities = await Community.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ memberCount: -1 })
    .populate('moderators', 'name avatar');

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Communities retrieved successfully',
      data: { communities },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

/**
 * Get community by ID
 * GET /api/communities/:id
 */
export const getCommunityById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let query;
  // Check if id is a valid ObjectId
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query = Community.findById(id);
  } else {
    // Treat as name
    query = Community.findOne({ name: id.toLowerCase() });
  }

  const community = await query
    .populate('moderators', 'name avatar')
    .populate('createdBy', 'name avatar');

  if (!community) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Community not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  // Check if current user is a member
  const isMember = req.userId ? community.isMember(req.userId) : false;
  const isModerator = req.userId ? community.isModerator(req.userId) : false;

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Community retrieved successfully',
      data: {
        community: {
          ...community.toObject(),
          isMember,
          isModerator
        }
      }
    })
  );
});

/**
 * Update community
 * PUT /api/communities/:id
 */
export const updateCommunity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { description, rules, displayName } = req.body;

  const updateData = {};
  if (description) updateData.description = description;
  if (rules) updateData.rules = rules;
  if (displayName) updateData.displayName = displayName;

  const community = await Community.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!community) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Community not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Community updated successfully',
      data: { community }
    })
  );
});

/**
 * Join community
 * POST /api/communities/:id/join
 */
export const joinCommunity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const community = await Community.findById(id);

  if (!community) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Community not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  if (community.isMember(userId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'You are already a member of this community',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  // Add user to community members
  community.addMember(userId);
  await community.save();

  // Add community to user's communities
  await User.findByIdAndUpdate(userId, {
    $push: { communities: community._id }
  });

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Joined community successfully',
      data: {
        isMember: true,
        memberCount: community.memberCount
      }
    })
  );
});

/**
 * Leave community
 * POST /api/communities/:id/leave
 */
export const leaveCommunity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const community = await Community.findById(id);

  if (!community) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Community not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  if (!community.isMember(userId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'You are not a member of this community',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  // Check if user is the only moderator
  if (community.isModerator(userId) && community.moderators.length === 1) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'You cannot leave as the only moderator. Transfer moderation first.',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  // Remove user from community members
  community.removeMember(userId);
  community.moderators = community.moderators.filter(
    mod => mod.toString() !== userId
  );
  await community.save();

  // Remove community from user's communities
  await User.findByIdAndUpdate(userId, {
    $pull: { communities: community._id }
  });

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Left community successfully',
      data: {
        isMember: false,
        memberCount: community.memberCount
      }
    })
  );
});

/**
 * Get community members
 * GET /api/communities/:id/members
 */
export const getMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, limit, skip } = getPaginationOptions(req.query);

  const community = await Community.findById(id).populate({
    path: 'members',
    select: 'name avatar college campusScore',
    options: { skip, limit }
  });

  if (!community) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Community not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  const total = community.memberCount;

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Members retrieved successfully',
      data: { members: community.members },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

/**
 * Add moderator
 * POST /api/communities/:id/moderators
 */
export const addModerator = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId: newModId } = req.body;

  const community = await Community.findById(id);

  if (!community) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Community not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  // Check if user is a member
  if (!community.isMember(newModId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'User must be a member to become a moderator',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  // Check if already moderator
  if (community.isModerator(newModId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'User is already a moderator',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  community.moderators.push(newModId);
  await community.save();

  await community.populate('moderators', 'name avatar');

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Moderator added successfully',
      data: { community }
    })
  );
});

/**
 * Remove moderator
 * DELETE /api/communities/:id/moderators/:userId
 */
export const removeModerator = asyncHandler(async (req, res) => {
  const { id, userId: modId } = req.params;

  const community = await Community.findById(id);

  if (!community) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Community not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }

  // Prevent removing the last moderator
  if (community.moderators.length <= 1) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'Cannot remove the last moderator',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  community.moderators = community.moderators.filter(
    mod => mod.toString() !== modId
  );
  await community.save();

  await community.populate('moderators', 'name avatar');

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Moderator removed successfully',
      data: { community }
    })
  );
});

/**
 * Upload community avatar
 * PUT /api/communities/:id/avatar
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

  const { id } = req.params;
  const avatarUrl = getFileUrl(req.file.filename);

  const community = await Community.findByIdAndUpdate(
    id,
    { avatar: avatarUrl },
    { new: true }
  );

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Avatar uploaded successfully',
      data: { avatar: community.avatar }
    })
  );
});

/**
 * Upload community cover image
 * PUT /api/communities/:id/cover
 */
export const uploadCover = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'No file uploaded',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  const { id } = req.params;
  const coverUrl = getFileUrl(req.file.filename);

  const community = await Community.findByIdAndUpdate(
    id,
    { coverImage: coverUrl },
    { new: true }
  );

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Cover image uploaded successfully',
      data: { coverImage: community.coverImage }
    })
  );
});

export default {
  createCommunity,
  getCommunities,
  getCommunityById,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
  getMembers,
  addModerator,
  removeModerator,
  uploadAvatar,
  uploadCover
};
