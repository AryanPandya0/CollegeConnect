import User from '../models/User.model.js';
import Community from '../models/Community.model.js';
import Resource from '../models/Resource.model.js';
import { formatSuccess } from '../utils/formatResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';

/**
 * Global Search
 * GET /api/search
 */
export const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const limit = 5;

  if (!q) {
    return res.status(HTTP_STATUS.OK).json(
      formatSuccess({
        message: 'Empty query',
        data: { users: [], communities: [], resources: [] }
      })
    );
  }

  // Escape special regex characters to prevent ReDoS/Injection
  const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const query = { $regex: escapedQ, $options: 'i' };

  // Run in parallel for performance
  const [users, communities, resources] = await Promise.all([
    User.find({
      $or: [
        { name: query },
        { username: query },
        { college: query }
      ],
      isBanned: false
    })
    .select('name avatar username college role graduationYear campusScore')
    .sort({ campusScore: -1 })
    .limit(limit),

    Community.find({
      $or: [
        { name: query },
        { displayName: query }
      ],
      isActive: true
    })
    .select('name displayName avatar memberCount description college')
    .sort({ memberCount: -1 })
    .limit(limit),

    Resource.find({
      $or: [
        { title: query },
        { description: query },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .select('title category url author college downloadCount')
    .populate('author', 'name avatar')
    .sort({ downloadCount: -1, createdAt: -1 })
    .limit(limit)
  ]);

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Unified search results',
      data: {
        users,
        communities,
        resources
      }
    })
  );
});

export default {
  globalSearch
};
