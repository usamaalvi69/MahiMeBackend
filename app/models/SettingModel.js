const mongoose = require("mongoose");

/**
 * @class SettingModel
 * @description Creates a mongoose setting model and defines its schema
 */
module.exports = class SettingModel {
  /**
   * @constructor
   * @returns {mongoose.model} SettingModel
   */
  constructor() {
    return mongoose.model("settings", Schema, "settings");
  }
};

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
  {
    meta_key:{ type: String },
    meta_values:{ type: String },
    created_by: { type: String, default: null },
    deleted_at: { type: Date, default: null },
    updated_by: { type: String },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
