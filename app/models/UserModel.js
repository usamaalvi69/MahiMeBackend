const mongoose = require('mongoose')

/**
 * @class UserModel
 * @description Creates a mongoose user model and defines its schema
 */
module.exports = class UserModel {
  /**
   * @constructor
   * @returns {mongoose.model} UserModel
   */
  constructor() {
    return mongoose.model('users', Schema, 'users')
  }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String },
    email: { type: String, lowercase: true, required: true },
    password: { type: String, default: '' },
    auth_pin: { type: String, default: '' },
    contact_no: { type: String, default: null },
    photo: { type: mongoose.Schema.Types.ObjectId, ref: 'docs', default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', default: null },
    sub_category: { type: mongoose.Schema.Types.ObjectId, ref: 'sub_categories', default: null },
    type: {
      type: String,
      default: 'employee',
      enum: ['admin', 'employee', 'employer']
    },
    about_me: { type: String, default: null },
    business_name: { type: String, default: null },
    business_address: {
      lattitude: { type: String, default: null },
      longitude: { type: String, default: null },
      address: { type: String, default: null },
    },
    preferred_location: {
      lattitude: { type: String, default: null },
      longitude: { type: String, default: null },
      address: { type: String, default: null },
    },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'roles' }],
    status: {
      type: String,
      default: 'active',
      enum: ['pending', 'active', 'locked']
    },
    time_slots:
    {
      dates: [{ type: Date, default: null }],
      start_time: { type: Number, default: null },
      end_time: { type: Number, default: null },
      all_day: { type: Boolean, default: false },
    },
    calender_attributes: [{type: Object, default: null}],
    rating: { type: Number, default: 5 },
    firebase_token: [{ type: String, default: [] }],
    blocked_at: { type: Date, default: null },
    last_login: { type: Date, default: null },
    current_time_zone: { type: String, default: null },
    created_by: { type: String, default: null },
    deleted_at: { type: Date, default: null },
    updated_by: { type: String },
    reset_password_token: { type: String },
    reset_password_created_at: { type: Date },
    reset_pin_token: { type: String },
    reset_pin_created_at: { type: Date },
    reminder: {
      time: {type: Number, default:null},
      day: {type: Number, default:null},
      week: {type: Number, default:null}
    }
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)
