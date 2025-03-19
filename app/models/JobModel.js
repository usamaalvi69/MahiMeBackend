const mongoose = require('mongoose')

/**
 * @class JobModel
 * @description Creates a mongoose user model and defines its schema
 */
module.exports = class JobModel {
  /**
   * @constructor
   * @returns {mongoose.model} JobModel
   */
  constructor() {
    return mongoose.model('jobs', Schema, 'jobs')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    job_id: { type: String, default: null },
    title: { type: String, default: null },
    description: { type: String, default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
    sub_category: { type: mongoose.Schema.Types.ObjectId, ref: 'sub_categories' },
    location: {
      lattitude: { type: String, default: null },
      longitude: { type: String, default: null },
      address: { type: String, default: null },
    },
    status: {
      type: String,
      default: 'open',
      enum: ['open','confirmed', 'completed', 'closed']
    },
    time_slots:
    {
      dates: [{ type: Date, default: null }],
      start_time: { type: Number, default: null },
      end_time: { type: Number, default: null },
      all_day: { type: Boolean, default: false },
    },
    attributes: [{type: Object, default: null}],
    created_by: { type: String, default: null },
    deleted_at: { type: Date, default: null },
    updated_by: { type: String, default: null },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)
