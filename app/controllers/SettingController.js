/**
 * @class SettingController
 * @description Handles all setting related CRUD operations
 */
module.exports = class SettingController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.setting_model = app.get('SettingModel')
  }

  /**
   * @method index
   * @description Returns list of setting
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
        order: 'order',
      })

      let params = request.query.keys

      if (typeof params != 'undefined') {
        params = params.split(',')
      }
      let setting = ''
      if (params) {
        setting = await this.setting_model.find({ meta_key: { $in: params } }).lean()
      } else {
        setting = await this.setting_model
          .find(filters.find)
          .skip(filters.query.skip)
          .limit(filters.query.limit)
          .sort(filters.query.sort)
          .select(filters.projection)
          .lean()
      }
      let total = await this.setting_model.countDocuments(filters.find)

      /** Response */
      return response.status(200).json({
        pagination: {
          skip: filters.query.skip,
          limit: filters.query.limit,
          total,
        },
        setting,
        // default_length: 11,
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err,
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method store
   * @description Create new setting
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async store(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("settings.create")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      let body = request.body
      for (let i = 0; i < body.length; i++) {
        var setting = await this.setting_model.findOne({
          meta_key: body[i].meta_key,
        })
        if (setting) {
          setting.meta_key = body[i].meta_key
          setting.meta_values = body[i].meta_values
          await setting.save()
        } else {
          setting = await this.setting_model.create({
            meta_key: body[i].meta_key,
            meta_values: body[i].meta_values,
            created_by: request.user.email,
          })
        }
      }

      /** Response */
      return response.status(200).json({
        message: 'Setting created successfully',
        setting: setting,
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err,
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method show
   * @description Returns single setting based on provided id
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async show(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("settings.getOne")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      /** Request validation */

      // let result = this.setting_validator.validateId(request)
      // if (result.error)
      //   return response
      //     .status(400)
      //     .json({ message: 'Validation error', errors: result.errors })

      let setting = await this.setting_model.findOne({
        _id: request.params._id,
      })
      if (!setting) return response.status(400).json({ message: 'Setting does not exist' })

      /** Response */
      return response.status(200).json(setting)
    } catch (err) {
      logger.log({
        level: 'error',
        message: err,
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  async settingByKey(request, response){
    try {
      /** Permission validation */
      // let allowed = permissions.can("settings.settingbykey")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      let setting = await this.setting_model.findOne({
        meta_key: request.params.key,
      })
      if (!setting) return response.status(400).json({ message: 'Setting does not exist' })

      /** Response */
      return response.status(200).json(setting)
    } catch (err) {
      logger.log({
        level: 'error',
        message: err,
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method destroy
   * @description delete setting
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async destroy(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("settings.delete")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      /** Request validation */
      // let result = this.setting_validator.validateId(request)

      // if (result.error)
      //   return response
      //     .status(400)
      //     .json({ message: 'Validation error', errors: result.errors })

      let setting = await this.setting_model.findOne({
        _id: request.params._id,
      })
      if (!setting) {
        return response.status(400).json({ message: 'Setting does not exists' })
      }
      setting.remove()

      /** Response */
      return response.status(200).json({ message: 'Setting deleted successfully' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err,
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
      // let allowed = permissions.can("settings.update")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      let setting = await this.setting_model.findOne({
        _id: request.params._id,
      })
      if (!setting) {
        return response.status(400).json({ message: 'No setting found' })
      }
      request.body.updated_by = request.user.email

      let updated = await this.setting_model.findOneAndUpdate(
        { _id: request.params._id },
        {
          $set: request.body,
        },
        { new: true, useFindAndModify: false }
      )

      /** Response */
      return response
        .status(200)
        .json({ message: 'Setting updated successfully', setting: updated })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err,
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
}
