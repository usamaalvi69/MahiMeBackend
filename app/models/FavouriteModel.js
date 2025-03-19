const mongoose = require('mongoose')

/**
 * @class FavouriteModel
 * @description Creates a mongoose favourites model and defines its schema
 */
module.exports = class FavouriteModel {
  /**
   * @constructor
   * @returns {mongoose.model} FavouriteModel
   */
  constructor() {
    return mongoose.model('favourites', Schema, 'favourites')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    favourite_job: { type: mongoose.Schema.Types.ObjectId, ref: 'jobs' },
    favourite_user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    favourite_type: { type: String, enum:['user','job'] },
    created_by: { type: String, default: null },
    deleted_at: { type: Date, default: null },
    updated_by: { type: String }
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)
