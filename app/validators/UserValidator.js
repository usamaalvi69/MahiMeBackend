var ObjectId = require('mongoose').Types.ObjectId

/**
 * @class UserValidator
 * @description Validator for user profile controller
 */
module.exports = class UserValidator {
  constructor() {}

  /**
   * @method validateUserId
   * @param {object} request
   * @param {object} response
   * @returns {object} response
   */
  async validateUserId(request, response) {
    let errors = []

    if (request.params.id === undefined) errors.push('Id param is required')
    if (request.params.id.length != 24) errors.push('Id param should be 24 characters')
    if (!ObjectId.isValid(request.params.id)) errors.push('Invalid mongo id')

    return { error: errors.length > 0 ? true : false, errors: errors }
  }

  /**
   * @method validateStoreRequest
   * @param {object} request
   * @param {object} response
   * @returns {object} response
   */
  async validateStoreRequest(request, response, user_model) {
    let errors = []
    let user = await user_model.findOne({ email: request.body.email }).lean()

    if (user) {
      if (user.email === request.body.email) errors.push('Email has already been taken')
    }
    let validator_errors = request.validate(request.body, [
      {
        name: 'email',
        required: true,
        type: 'string'
      },
      {
        name: 'password',
        type: 'string',
        required: true
      },
      {
        name: 'name',
        required: true,
        type: 'string'
      },
      {
        name: 'phone',
        default: '',
        type: 'string'
      },
      {
        name: 'type',
        type: 'enum',
        enum: ['admin', 'user'],
        default: 'user'
      }
    ])
    errors = errors.concat(validator_errors)
    return { error: errors.length > 0 ? true : false, errors: errors }
  }

  /**
   * @method validateUpdateRequest
   * @param {object} request
   * @param {object} response
   * @returns {object} response
   */
  async validateUpdateRequest(request, response, user_model) {
    let errors = []

    if (request.params.id === undefined) errors.push('Id param is required')
    if (request.params.id.length != 24) errors.push('Id param should be 24 characters')
    if (!ObjectId.isValid(request.params.id)) errors.push('Invalid mongo id')
    if (errors.length > 0) {
      return { error: true, errors: errors }
    }

    errors = request.validate(request.body, [
      {
        name: 'name',
        required: true,
        type: 'string'
      },
      {
        name: 'phone',
        default: '',
        type: 'string'
      },
      {
        name: 'status',
        type: 'enum',
        enum: ['pending', 'active', 'blocked']
      }
    ])

    return { error: errors.length > 0 ? true : false, errors: errors }
  }

  /**
   * @method validatePhotoUpdateRequest
   * @param {object} request
   * @param {object} response
   * @returns {object} response
   */
  async validatePhotoUpdateRequest(request, response, user_model) {
    let errors = []

    if (!request.files) errors.push('No file in request')
    if (request.files && !request.files.photo) errors.push('A file {photo} is required')

    return { error: errors.length > 0 ? true : false, errors: errors }
  }

  /**
   * @method validateUserIdWithProjection
   * @param {object} request
   * @param {object} response
   * @returns {object} response
   */
  async validateUserIdWithProjection(request, response) {
    let errors = []
    if (request.params.id === undefined) errors.push('Id param is required')
    if (request.params.id.length != 24) errors.push('Id param should be 24 characters long')
    if (!ObjectId.isValid(request.params.id)) errors.push('Invalid mongo id')

    let projection = { reset_password_token: 0, reset_password_created_at: 0, password: 0 }
    return { error: errors.length > 0 ? true : false, errors: errors, projection: projection }
  }

  /**
   * @method validateRequestWithFilters
   * @param {object} request
   * @param {object} response
   * @returns {object} response
   */
  async validateRequestWithFilters(request, response) {
    let query_params = {
      skip: parseInt(request.query.skip) || 0,
      limit: parseInt(request.query.limit) || 10,
      sort: {}
    }
    let order = request.query.order || 'asc'
    let field = request.query.sort || 'email'
    let direction = order == 'asc' ? 1 : -1
    query_params.sort[field] = direction

    let search_params = {}
    if (request.query.search) {
      search_params['$or'] = [
        { email: new RegExp(request.query.search + '.*', 'i') },
        { name: new RegExp(request.query.search + '.*', 'i') }
      ]
    }
    if (request.query.status) {
      search_params['status'] = request.query.status
    }
    search_params['deleted_at'] = null

    let projection = { reset_password_token: 0, reset_password_created_at: 0, password: 0 }

    return { query: query_params, search: search_params, projection: projection }
  }

  /**
   * @method doesImageExist
   * @param {*} request
   * @param {*} response
   * @return {*}
   */
  async doesImageExist(request, response) {
    let errors = []

    if (request.params.filename === undefined) errors.push('filename param is required')
    let file_path = root_directory + '/public/images/' + request.params.filename
    if (!fs.existsSync(file_path)) errors.push('provided filename does not exist')

    return { error: errors.length > 0 ? true : false, errors: errors }
  }
}
