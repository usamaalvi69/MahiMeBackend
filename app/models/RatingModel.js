const mongoose = require('mongoose')

/**
 * @class RatingModel
 * @description Creates a mongoose Ratings model and defines its schema
 */
module.exports = class RatingModel {
    /**
     * @constructor
     * @returns {mongoose.model} RatingModel
     */
    constructor() {
        return mongoose.model('ratings', Schema, 'ratings')
    }
}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema(
    {

        job_applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'job_applicants' },
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'jobs' },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        employer: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        employee_rate: { type: Number, default: 0},
        employee_review: { type: String, default: null },
        employer_rate: { type: Number, default: 0 },
        employer_review: { type: String, default: null },

        created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        created_at: { type: Date, default: new Date() },
        updated_at: { type: Date, default: null },
        deleted_at: { type: Date, default: null }
    },
    {
        versionKey: false,
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
)
