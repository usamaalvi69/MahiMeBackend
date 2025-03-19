/**
 * @class MobileSettingController
 * @description Handles all mobile_setting related CRUD operations
 */
module.exports = class MobileSettingController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.mobile_setting_model = app.get('MobileSettingModel')
  }

  /**
   * @method index
   * @description Returns list of mobile_setting
   * @param {object} request
   * @param {object} response
   * @return {image} response
   */
  async index(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("settings.getAll")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      let filters = await request.filter({
        skip: 'skip:0',
        limit: 'limit',
        sort: 'sort:_id',
        order: 'order'
      })

      let params = request.query.keys

      if (typeof params != 'undefined') {
        params = params.split(',')
      }
      let mobile_setting = ''
      if (params) {
        mobile_setting = await this.mobile_setting_model
          .find({ meta_key: { $in: params } })
          .lean()
      } else {
        mobile_setting = await this.mobile_setting_model
          .find(filters.find)
          .skip(filters.query.skip)
          .limit(filters.query.limit)
          .sort(filters.query.sort)
          .select(filters.projection)
          .lean()
      }
      let total = await this.mobile_setting_model.countDocuments(filters.find)

      /** Response */
      return response.status(200).json({
        pagination: {
          skip: filters.query.skip,
          limit: filters.query.limit,
          total
        },
        mobile_setting
        // default_length: 11,
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
   * @method store
   * @description Create new mobile_setting
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async store(request, response) {
    try {
      let body = request.body

      let setting = await this.mobile_setting_model.findOne({
        meta_key: request.body.meta_key
      })

      if (setting) {
        setting.meta_key = request.body.meta_key
        setting.meta_values = request.body.meta_values
        await setting.save()
      } else {
        setting = await this.mobile_setting_model.create({
          is_private: request.body.is_private,
          meta_key: request.body.meta_key,
          meta_values: request.body.meta_values,
          created_by: request.user.email
        })
      }

      let settings_data = await this.mobile_setting_model.find()

      /* Response */
      return response.status(200).json({
        message: 'Setting created successfully',
        setting: settings_data
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
   * @method show
   * @description Returns single mobile_setting based on provided id
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async show(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("settings.getAll")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      /** Request validation */

      // let result = this.setting_validator.validateId(request)
      // if (result.error)
      //   return response
      //     .status(400)
      //     .json({ message: 'Validation error', errors: result.errors })

      let mobile_setting = await this.mobile_setting_model.findOne({
        _id: request.params._id
      })
      if (!mobile_setting)
        return response.status(400).json({ message: 'Setting does not exist' })

      /** Response */
      return response.status(200).json(mobile_setting)
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
   * @description delete mobile_setting
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async destroy(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("settings.getAll")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      /** Request validation */
      // let result = this.setting_validator.validateId(request)

      // if (result.error)
      //   return response
      //     .status(400)
      //     .json({ message: 'Validation error', errors: result.errors })

      let mobile_setting = await this.mobile_setting_model.findOne({
        _id: request.params._id
      })
      if (!mobile_setting) {
        return response.status(400).json({ message: 'Setting does not exists' })
      }
      mobile_setting.remove()

      /** Response */
      return response
        .status(200)
        .json({ message: 'Setting deleted successfully' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method update
   * @description Update user
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async update(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("settings.getAll")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      let mobile_setting = await this.mobile_setting_model.findOne({
        _id: request.params._id
      })
      if (!mobile_setting) {
        return response.status(400).json({ message: 'No mobile_setting found' })
      }
      request.body.updated_by = request.user.email

      let updated = await this.mobile_setting_model.findOneAndUpdate(
        { _id: request.params._id },
        {
          $set: request.body
        },
        { new: true, useFindAndModify: false }
      )

      /** Response */
      return response
        .status(200)
        .json({
          message: 'Setting updated successfully',
          mobile_setting: updated
        })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
}
