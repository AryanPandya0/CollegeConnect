import * as authService from '../services/auth.service.js';
import { formatSuccess, formatError } from '../utils/formatResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(HTTP_STATUS.CREATED).json(
    formatSuccess({
      message: 'User registered successfully',
      data: result
    })
  );
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Login successful',
      data: result
    })
  );
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'Refresh token is required',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  const result = await authService.refreshToken(refreshToken);

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Token refreshed successfully',
      data: result
    })
  );
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const userId = req.userId;

  await authService.logout(userId);

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Logout successful',
      data: null
    })
  );
});

/**
 * Change password
 * PUT /api/auth/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'Current password and new password are required',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }

  await authService.changePassword(userId, currentPassword, newPassword);

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Password changed successfully',
      data: null
    })
  );
});

/**
 * Guest login
 * POST /api/auth/guest
 */
export const guestLogin = asyncHandler(async (req, res) => {
  const result = await authService.guestLogin();

  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Logged in as guest',
      data: result
    })
  );
});

export default {
  register,
  login,
  guestLogin,
  refresh,
  logout,
  changePassword
};
