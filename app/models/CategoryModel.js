const mongoose = require('mongoose')

/**
 * @class CategoryModel
 * @description Creates a mongoose saved_jobs model and defines its schema
 */
module.exports = class CategoryModel {
  /**
   * @constructor
   * @returns {mongoose.model} CategoryModel
   */
  constructor() {
    return mongoose.model('categories', Schema, 'categories')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    sub_categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'sub_categories' }
    ],
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
