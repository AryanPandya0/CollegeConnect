import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, REGEX } from '../utils/constants.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return REGEX.EDU_EMAIL.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  college: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
    maxlength: [200, 'College name cannot exceed 200 characters']
  },
  course: {
    type: String,
    trim: true,
    maxlength: [100, 'Course cannot exceed 100 characters']
  },
  year: {
    type: Number,
    min: [1, 'Year must be between 1 and 6'],
    max: [6, 'Year must be between 1 and 6']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill cannot exceed 50 characters']
  }],
  avatar: {
    type: String,
    default: null
  },
  campusScore: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.STUDENT
  },
  communities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  refreshToken: {
    type: String,
    select: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  bannedAt: {
    type: Date,
    default: null
  },
  banReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ college: 1 });
userSchema.index({ campusScore: -1 });
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });

// Virtual for follower count
userSchema.virtual('followerCount').get(function () {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function () {
  return this.following ? this.following.length : 0;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.toPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    college: this.college,
    course: this.course,
    year: this.year,
    bio: this.bio,
    skills: this.skills,
    avatar: this.avatar,
    campusScore: this.campusScore,
    role: this.role,
    communities: this.communities,
    followerCount: this.followerCount,
    followingCount: this.followingCount,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;
