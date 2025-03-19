/**
 * @class NotificationController
 * @description Handles all Notificatios Api
 */
module.exports = class NotificationController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.notification_model = app.get('NotificationModel')
  }
  /**
   * @method index
   * @description Returns list of items
   * @param {object} request
   * @param {object} response
   * @return {image} response
   */
  async index(request, response) {
    try {
      /** Permission validation */
      //let allowed = permissions.can('permission.getAll')
      //if (!allowed)
      //  return response
      //    .status(400)
      //    .json({ message: 'Validation error', errors: 'Permission Denied' })

      let filters = await request.filter({
        skip: 'skip:0',
        //  limit: 'limit',
        sort: "sort:created_at",
        order: "order:-1"
      })
      filters.find['to_user'] = request.user._id
      
      let items = await this.notification_model
        .find(filters.find)
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .select(filters.projection)
        .lean()
      if (request.query.type && request.query.type == 'mobile') {
        items = items.map(({ _id, name, country }) => ({
          value: _id,
          lable: name,
          country: country
        }))
      }
      let total = await this.notification_model.countDocuments(filters.find)

      /** Response */
      return response.status(200).json({
        pagination: {
          skip: filters.query.skip,
          limit: filters.query.limit,
          total
        },
        items
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
   * @description Create new created
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async store(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can('permission.create')
      // if (!allowed)
      //   return response
      //     .status(400)
      //     .json({ message: 'Validation error', errors: 'Permission Denied' })

      request.body.created_by = request.user.email
      let created = await this.notification_model.create(request.body)
      return response.status(200).json({
        message: 'Data created successfully',
        created: created
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
   * @description Returns single item based on provided id
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async show(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("permission.getAll")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      /** Request validation */

      let validation = await request.validate({
        _id: 'mongoId|required'
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      let item = await this.notification_model.findOne({
        _id: request.params._id
      })
      if (!item)
        return response.status(400).json({ message: 'Item does not exist' })

      /** Response */
      return response.status(200).json(item)
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
   * @description Update item
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async update(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can('permission.update')
      // if (!allowed)
      //   return response
      //     .status(400)
      //     .json({ message: 'Validation error', errors: 'Permission Denied' })

      request.body.updated_by = request.user.email

      let updated = await this.notification_model.findOneAndUpdate(
        { _id: request.params._id },
        {
          $set: request.body
        },
        { new: true, useFindAndModify: false }
      )

      /** Response */
      return response.status(200).json({
        message: 'Item updated successfully',
        updated: updated
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
   * @method destroy
   * @description delete Item
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async destroy(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can('permission.delete')
      // if (!allowed)
      //   return response
      //     .status(400)
      //     .json({ message: 'Validation error', errors: 'Permission Denied' })

      /** Request validation */

      let deleted = await this.notification_model.findOne({
        _id: request.params._id
      })

      if (!deleted) {
        return response.status(400).json({ message: 'Item does not exists' })
      }

      deleted.remove()

      /** Response */
      return response.status(200).json({ message: 'Item deleted successfully' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
  /**
   * @method unreadNotifications
   * @description Returns list of push_notification
   * @param {object} request
   * @param {object} response
   * @return {image} response
   */
  async unreadNotifications(request, response) {
    try {
      /** Permission validation */
      //let allowed = permissions.can('push_notification.getAll')
      //if (!allowed)
      //  return response
      //    .status(400)
      //    .json({ message: 'Validation error', errors: 'Permission Denied' })

      let filters = await request.filter({
        skip: 'skip:0',
        limit: 'limit',
        sort: 'sort:_id',
        order: 'order:-1'
      })

      filters.find['to_user'] = { $in: request.user._id }

      filters.find['seen'] = false

      let unread_notification = await this.notification_model.countDocuments(
        filters.find
      )

      /** Response */
      return response.status(200).json({
        unread_notification
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
   * @method readAllNotificationAdmin
   * @description Update push notification
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async readAllNotification(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can('push_notification.update')
      // if (!allowed)
      //   return response
      //     .status(400)
      //     .json({ message: 'Validation error', errors: 'Permission Denied' })

      // let admin = await this.user_model.findOne({ type: 'admin' })

      // let admin_notification = await this.notification_model.find({
      //   to_user: admin._id
      // })

      let updated = await this.notification_model.updateMany(
        { to_user: request.user._id },
        { seen: true },
        { new: true, useFindAndModify: false }
      )

      /** Response */
      return response.status(200).json({
        message: 'All notifications read',
        updated
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
