const mongoose = require('mongoose')

/**
 * @class SubCategoryModel
 * @description Creates a mongoose saved_jobs model and defines its schema
 */
module.exports = class SubCategoryModel {
  /**
   * @constructor
   * @returns {mongoose.model} SubCategoryModel
   */
  constructor() {
    return mongoose.model('sub_categories', Schema, 'sub_categories')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    name: {
      type: String,
      default: null
    },
    created_by: { type: String, default: null },
    deleted_at: { type: Date, default: null },
    updated_by: { type: String }
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)
