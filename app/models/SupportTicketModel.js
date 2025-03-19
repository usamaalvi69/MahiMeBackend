const mongoose = require('mongoose')

/**
 * @class SupportTicketModel
 * @description Creates a mongoose support_tickets model and defines its schema
 */
module.exports = class SupportTicketModel {
  /**
   * @constructor
   * @returns {mongoose.model} SupportTicketModel
   */
  constructor() {
    return mongoose.model('support_tickets', Schema, 'support_tickets')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    title: { type: String, default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    messages: [
      {
        message: { type: String, default: null },
        media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'docs' }],
        from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        admin_message_status: {
          type: String,
          default: 'un_seen',
          enum: ['un_seen', 'seen']
        },
        user_message_status: {
          type: String,
          default: 'un_seen',
          enum: ['un_seen', 'seen']
        },
        message_date: { type: Date, default: null }
      }
    ],
    status: {
      type: String,
      default: 'open',
      enum: ['open', 'closed']
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
