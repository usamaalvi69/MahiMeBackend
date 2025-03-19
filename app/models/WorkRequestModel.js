const mongoose = require('mongoose')

/**
 * @class WorkRequestModel
 * @description Creates a mongoose user model and defines its schema
 */
module.exports = class WorkRequestModel {
  /**
   * @constructor
   * @returns {mongoose.model} WorkRequestModel
   */
  constructor() {
    return mongoose.model('work_reuests', Schema, 'work_reuests')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'jobs' },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'accepted', 'rejected']
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
