const mongoose = require('mongoose')

/**
 * @class MobileSettingModel
 * @description Creates a mongoose mobile_setting model and defines its schema
 */
module.exports = class MobileSettingModel {
  /**
   * @constructor
   * @returns {mongoose.model} MobileSettingModel
   */
  constructor() {
    return mongoose.model('mobile_setting', Schema, 'mobile_setting')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    meta_key: { type: String },
    meta_values: { type: Object },
    created_by: { type: String, default: null },
    deleted_at: { type: Date, default: null },
    updated_by: { type: String }
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)
