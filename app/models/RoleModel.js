const mongoose = require('mongoose')

/**
 * @class RoleModel
 * @description Creates a mongoose roles model and defines its schema
 */
module.exports = class RoleModel {
    /**
     * @constructor
     * @returns {mongoose.model} RoleModel
     */
    constructor() {
        return mongoose.model('roles', Schema, 'roles')
    }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
    {
        name: { type: String, default: '' },
        permissions: [{ type: String }],
        created_at: { type: Date, default: null },
        updated_at: { type: Date, default: null },
        deleted_at: { type: Date, default: null }
    },
    {
        versionKey: false,
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
)
