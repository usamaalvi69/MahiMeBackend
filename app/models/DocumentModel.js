const mongoose = require('mongoose')

/**
 * @class DocumentModel
 * @description Creates a mongoose docs model and defines its schema
 */
module.exports = class DocumentModel {
  /**
   * @constructor
   * @returns {mongoose.model} DocumentModel
   */
  constructor() {
    return mongoose.model('docs', Schema, 'docs')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    name: { type: String, default: null },
    created_by: { type: String, default: null },
    deleted_at: { type: Date, default: null },
    updated_by: { type: String }
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)
