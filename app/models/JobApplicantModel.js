const mongoose = require('mongoose')

/**
 * @class JobApplicantModel
 * @description Creates a mongoose user model and defines its schema
 */
module.exports = class JobApplicantModel {
  /**
   * @constructor
   * @returns {mongoose.model} JobApplicantModel
   */
  constructor() {
    return mongoose.model('job_applicants', Schema, 'job_applicants')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'jobs' },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    status: {
      type: String,
      default: 'open',
      enum: ['open', 'confirmed', 'rejected', 'completed', 'paid']
    },
    rating: {
      employer_rating: { type: Number, default: 0 },
      employer_review: { type: String, default: null },
      employer_rating_date: { type: Date, default: null },
      employee_rating: { type: Number, default: 0 },
      employee_review: { type: String, default: null },
      employee_rating_date: { type: Date, default: null }
    },

    created_by: { type: String, default: null },
    deleted_at: { type: Date, default: null },
    updated_by: { type: String, default: null },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)
