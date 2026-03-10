import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import env from '../config/env.js';

/**
 * Generate JWT tokens
 * @param {Object} user - User object
 * @returns {Object} Access and refresh tokens
 */
export const generateTokens = (user) => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY
  });

  const refreshToken = jwt.sign(
    { userId: user._id.toString() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY }
  );

  return { accessToken, refreshToken };
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} User and tokens
 */
export const register = async (userData) => {
  const { name, email, password, college, course, year, bio, skills } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const user = new User({
    name,
    email,
    password,
    college,
    course,
    year,
    bio,
    skills: skills || []
  });

  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: user.toPublicProfile(),
    accessToken,
    refreshToken
  };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} User and tokens
 */
export const login = async (email, password) => {
  // Find user with password
  const user = await User.findOne({ email })
    .select('+password')
    .populate('communities', 'name displayName avatar');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is banned
  if (user.isBanned) {
    throw new Error('Your account has been banned');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: user.toPublicProfile(),
    accessToken,
    refreshToken
  };
};

/**
 * Refresh access token
 * @param {string} token - Refresh token
 * @returns {Object} New tokens
 */
export const refreshToken = async (token) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.userId)
      .select('+refreshToken')
      .populate('communities', 'name displayName avatar');

    if (!user) {
      throw new Error('User not found');
    }

    // Check if refresh token matches
    if (user.refreshToken !== token) {
      throw new Error('Invalid refresh token');
    }

    // Check if user is banned
    if (user.isBanned) {
      throw new Error('Your account has been banned');
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Save new refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: user.toPublicProfile(),
      ...tokens
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    throw error;
  }
};

/**
 * Logout user
 * @param {string} userId - User ID
 */
export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

/**
 * Logout from all devices
 * @param {string} userId - User ID
 */
export const logoutAll = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

/**
 * Change password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return true;
};

/**
 * Login as guest
 * @returns {Object} User and tokens
 */
export const guestLogin = async () => {
  const GUEST_EMAIL = 'guest@collegeconnect.edu';

  let user = await User.findOne({ email: GUEST_EMAIL });

  if (!user) {
    // Create guest user if not exists
    user = new User({
      name: 'Guest Student',
      email: GUEST_EMAIL,
      password: 'GuestPassword123!', // Strong password to pass validation
      college: 'Guest University',
      course: 'Visitor',
      year: 1,
      bio: 'Just visiting CollegeConnect',
      skills: ['Exploration'],
      role: 'student'
    });
    await user.save();
  } else if (user.isBanned) {
    throw new Error('Guest account is banned');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: user.toPublicProfile(),
    accessToken,
    refreshToken
  };
};

export default {
  register,
  login,
  guestLogin,
  refreshToken,
  logout,
  logoutAll,
  changePassword,
  generateTokens
};
