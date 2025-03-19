const mongoose = require('mongoose')

/**
 * @class PushNotificationModel
 * @description Creates a mongoose user model and defines its schema
 */
module.exports = class NotificationModel {
  /**
   * @constructor
   * @returns {mongoose.model} NotificationModel
   */
  constructor() {
    return mongoose.model('notifications', Schema, 'notifications')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    message: { type: String, default: null },
    notification_redirect_id: { type: String, default: null },
    title: { type: String, default: null },
    url: { type: String, default: null },
    seen: { type: Boolean, default: false },
    type: { type: String, default: '' },
    submit: { type: Boolean, default: false },
    created_by: { type: String, default: null },
    deleted_at: { type: Date, default: null },
    updated_by: { type: String, default: null }
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)
