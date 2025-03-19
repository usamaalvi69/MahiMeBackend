const mongoose = require('mongoose')

/**
 * @class AppleIdentificationModel
 * @description Creates a mongoose user model and defines its schema
 */
module.exports = class AppleIdentificationModel {
  /**
   * @constructor
   * @returns {mongoose.model} AppleIdentificationModel
   */
  constructor() {
    return mongoose.model('appleIdentifications', Schema, 'appleIdentifications')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, lowercase: true },
    token: { type: String, required: true },
    deleted_at: { type: Date, default: null },
    updated_by: { type: String }
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)
