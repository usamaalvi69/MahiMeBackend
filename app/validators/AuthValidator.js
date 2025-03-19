const fs = require('fs')
var ObjectId = require('mongoose').Types.ObjectId

/**
 * @class AuthValidator
 * @description Validator for user profile controller
 */
module.exports = class AuthValidator {

    constructor() {}

    /**
     * @method validateLogin
     * @param {object} request 
     * @param {object} response
     * @returns {object} response
     */
    async validateLogin(request, response) {
        let errors = []

        if (request.body.email === undefined) errors.push('email is required')
        if (request.body.password === undefined) errors.push('password is required')

        return { error: (errors.length > 0 ? true : false), errors: errors }
    }

    /**
     * @method validateChangePassword
     * @param {object} request 
     * @param {object} response
     * @returns {object} response
     */
    async validateChangePassword(request, response) {
        let errors = []

        if (request.body.current_password === undefined) errors.push('current_password is required')
        if (request.body.new_password === undefined) errors.push('new_password is required')

        return { error: (errors.length > 0 ? true : false), errors: errors }
    }

    /**
     * @method validateResetPassword
     * @param {object} request 
     * @param {object} response
     * @returns {object} response
     */
    async validateResetPassword(request, response) {
        let errors = []

        if (request.body.password === undefined) errors.push('password is required')
        if (request.params.token === undefined) errors.push('token param is required')

        return { error: (errors.length > 0 ? true : false), errors: errors }
    }

    /**
     * @method validateForgetPassword
     * @param {object} request 
     * @param {object} response
     * @returns {object} response
     */
    async validateForgetPassword(request, response) {
        let errors = []

        if (request.body.email === undefined) errors.push('email is required')

        return { error: (errors.length > 0 ? true : false), errors: errors }
    }

}