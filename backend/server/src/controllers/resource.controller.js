import Resource from '../models/Resource.model.js';
import User from '../models/User.model.js';
import { formatSuccess, formatError } from '../utils/formatResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';

/**
 * Create new resource
 * POST /api/resources
 */
export const createResource = asyncHandler(async (req, res) => {
  const { title, description, category, url, tags } = req.body;
  
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({ message: 'User not found', statusCode: HTTP_STATUS.NOT_FOUND })
    );
  }

  const resource = await Resource.create({
    title,
    description,
    category,
    url,
    tags,
    author: req.userId,
    college: user.college
  });

  await resource.populate('author', 'name avatar role graduationYear');

  res.status(HTTP_STATUS.CREATED).json(
    formatSuccess({
      message: 'Resource shared successfully',
      data: { resource }
    })
  );
});

/**
 * Get resources with filtering
 * GET /api/resources
 */
export const getResources = asyncHandler(async (req, res) => {
  const { category, search, college, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (category) query.category = category;
  if (college) query.college = college;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const resources = await Resource.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar role graduationYear');

  const total = await Resource.countDocuments(query);

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Resources retrieved successfully',
      data: { resources },
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total
      }
    })
  );
});

/**
 * Delete resource
 * DELETE /api/resources/:id
 */
export const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({ message: 'Resource not found', statusCode: HTTP_STATUS.NOT_FOUND })
    );
  }

  // Only author or admin can delete
  const isAdmin = req.user.role === 'admin';
  if (resource.author.toString() !== req.userId && !isAdmin) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatError({ message: 'Unauthorized to delete this resource', statusCode: HTTP_STATUS.FORBIDDEN })
    );
  }

  await resource.deleteOne();

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Resource deleted successfully',
      data: null
    })
  );
});

/**
 * Increment download count
 * POST /api/resources/:id/download
 */
export const incrementDownload = asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloadCount: 1 } },
    { new: true }
  );

  if (!resource) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({ message: 'Resource not found', statusCode: HTTP_STATUS.NOT_FOUND })
    );
  }

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Download count incremented',
      data: { downloadCount: resource.downloadCount }
    })
  );
});

export default {
  createResource,
  getResources,
  deleteResource,
  incrementDownload
};
