import mongoose from 'mongoose';
import { JOB_TYPES, APPLICATION_STATUS } from '../utils/constants.js';

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: String,
    required: [true, 'Resume is required']
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [5000, 'Cover letter cannot exceed 5000 characters']
  },
  status: {
    type: String,
    enum: Object.values(APPLICATION_STATUS),
    default: APPLICATION_STATUS.PENDING
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, { _id: true });

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [10000, 'Description cannot exceed 10000 characters']
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Requirement cannot exceed 500 characters']
  }],
  responsibilities: [{
    type: String,
    trim: true,
    maxlength: [500, 'Responsibility cannot exceed 500 characters']
  }],
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: Object.values(JOB_TYPES),
    required: [true, 'Job type is required']
  },
  salary: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true
    },
    period: {
      type: String,
      enum: ['hour', 'day', 'week', 'month', 'year'],
      default: 'year'
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Posted by is required']
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    default: null
  },
  applications: [applicationSchema],
  applicationCount: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  startDate: {
    type: Date,
    default: null
  },
  duration: {
    type: String,
    trim: true,
    maxlength: [100, 'Duration cannot exceed 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  contactEmail: {
    type: String,
    trim: true,
    maxlength: [200, 'Contact email cannot exceed 200 characters']
  },
  externalLink: {
    type: String,
    trim: true,
    maxlength: [500, 'External link cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes
jobSchema.index({ isActive: 1, deadline: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ community: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ isActive: 1, type: 1, deadline: 1 });

// Pre-save middleware to update application count
jobSchema.pre('save', function(next) {
  if (this.isModified('applications')) {
    this.applicationCount = this.applications.length;
  }
  next();
});

// Virtual to check if deadline has passed
jobSchema.virtual('isExpired').get(function() {
  return new Date() > this.deadline;
});

// Method to check if user has applied
jobSchema.methods.hasApplied = function(userId) {
  return this.applications.some(
    app => app.applicant.toString() === userId.toString()
  );
};

// Method to add application
jobSchema.methods.addApplication = function(applicationData) {
  if (!this.hasApplied(applicationData.applicant)) {
    this.applications.push(applicationData);
    this.applicationCount = this.applications.length;
    return true;
  }
  return false;
};

// Method to update application status
jobSchema.methods.updateApplicationStatus = function(applicationId, status, notes) {
  const application = this.applications.id(applicationId);
  if (application) {
    application.status = status;
    application.reviewedAt = new Date();
    if (notes) application.notes = notes;
    return true;
  }
  return false;
};

// Static method to get active jobs
jobSchema.statics.getActiveJobs = function(options = {}) {
  const { limit = 20, skip = 0, type = null } = options;
  
  const query = {
    isActive: true,
    deadline: { $gte: new Date() }
  };
  
  if (type) query.type = type;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('postedBy', 'name avatar')
    .populate('community', 'name displayName');
};

// Static method to get jobs posted by user
jobSchema.statics.getJobsByUser = function(userId, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({ postedBy: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('community', 'name displayName');
};

const Job = mongoose.model('Job', jobSchema);

export default Job;
