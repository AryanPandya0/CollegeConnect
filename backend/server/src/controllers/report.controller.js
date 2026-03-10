import Report from '../models/Report.model.js';
import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import User from '../models/User.model.js';
import { formatSuccess, formatError } from '../utils/formatResponse.js';
import { HTTP_STATUS, REPORT_TARGET_TYPES } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';

/**
 * Create report
 * POST /api/reports
 */
export const createReport = asyncHandler(async (req, res) => {
  const { targetId, targetType, reason, description } = req.body;
  const reporterId = req.userId;
  
  // Validate target type
  if (!Object.values(REPORT_TARGET_TYPES).includes(targetType)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'Invalid target type',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }
  
  // Check if target exists
  let target;
  switch (targetType) {
    case REPORT_TARGET_TYPES.POST:
      target = await Post.findById(targetId);
      break;
    case REPORT_TARGET_TYPES.COMMENT:
      target = await Comment.findById(targetId);
      break;
    case REPORT_TARGET_TYPES.USER:
      target = await User.findById(targetId);
      break;
  }
  
  if (!target) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Report target not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Check if user already reported this target
  const alreadyReported = await Report.hasReported(reporterId, targetId, targetType);
  if (alreadyReported) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'You have already reported this content',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }
  
  // Create report
  const report = new Report({
    reporter: reporterId,
    targetId,
    targetType,
    reason,
    description
  });
  
  await report.save();
  
  res.status(HTTP_STATUS.CREATED).json(
    formatSuccess({
      message: 'Report submitted successfully',
      data: { report }
    })
  );
});

/**
 * Get user's reports
 * GET /api/reports/my-reports
 */
export const getMyReports = asyncHandler(async (req, res) => {
  const reporterId = req.userId;
  
  const reports = await Report.find({ reporter: reporterId })
    .sort({ createdAt: -1 })
    .populate('resolvedBy', 'name');
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Reports retrieved successfully',
      data: { reports }
    })
  );
});

export default {
  createReport,
  getMyReports
};
