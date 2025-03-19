const mongoose = require('mongoose')
/**
 * @class JobController
 * @description Handles all user related CRUD operations
 */
module.exports = class JobController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.document_model = app.get('DocumentModel')
    this.upload_helper = app.get('UploadHelper')
  }

  /**
   * @method index
   * @description Returns list of user
   * @param {object} request
   * @param {object} response
   */
  async index(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("document.getAll")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      let filters = await request.filter({
        search: '',
        skip: 'skip:0',
        limit: 'limit',
        sort: 'sort:_id',
        order: 'order:1'
      })

      let document = await this.document_model.find().lean()

      let total = await this.document_model.countDocuments()

      /** Response */
      return response.status(200).json({
        pagination: {
          skip: filters.query.skip,
          limit: filters.query.limit,
          total
        },
        document
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method imageUploader
   * @description Returns list of user
   * @param {object} request
   * @param {object} response
   */
  async imageUploader(request, response) {
    try {
      let image_uploader = null
      if (request.file || request.files) {
        image_uploader = await this.upload_helper.handleImageMultiple(
          request,
          'files'
        )
      }
      if (image_uploader) {
        if (image_uploader.error)
          return response
            .status(400)
            .json({ message: 'Failed to upload image' })
        else {
          return response
            .status(200)
            .json({ document: image_uploader.upload_document })
        }
      }
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
  /**
   * @method getUploadedImage
   * @description Returns a user profile image
   * @param {object} request
   * @param {object} response
   * @return {image} response
   */
  async getUploadedImage(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can('users.getProfileMedia')
      // if (!allowed)
      //   return response
      //     .status(400)
      //     .json({ message: 'Validation error', errors: 'Permission Denied' })

      if (request.params.name === undefined)
        return response.status(400).json({
          message: 'Validation error',
          errors: 'name param is required'
        })

      let file_path =
        root_directory + '/public/upload_images/' + request.params.name
      if (!fs.existsSync(file_path))
        return response.status(400).json({
          message: 'Validation error',
          errors: 'provided name does not exist'
        })

      return response.sendFile(file_path)
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
  /**
   * @method destroy
   * @description Returns a user profile image
   * @param {object} request
   * @param {object} response
   * @return {image} response
   */
  async destroy(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can('users.getProfileMedia')
      // if (!allowed)
      //   return response
      //     .status(400)
      //     .json({ message: 'Validation error', errors: 'Permission Denied' })
      if (typeof request.body.delete === 'string') {
        var doc = [request.body.delete]
      } else {
        var doc = request.body.delete
      }

      await this.document_model.deleteMany({
        _id: { $in: doc }
      })

      return response.status(200).json({
        message: 'Document is successfully deleted'
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method downloadFile
   * @description Create new trading task
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async downloadFile(request, response) {
    try {
      const new_file =
        root_directory + `/public/upload_images/${request.params.filename}`

      return response.download(new_file)
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
}
