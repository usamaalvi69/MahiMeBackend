/**
 * @class UserController
 * @description Handles all user related CRUD operations
 */
module.exports = class UserController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.user_model = app.get("UserModel")
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
      // let allowed = permissions.can("users.index")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

      /** Request validation */
      let filters = await request.filter({
        search: "likes:first_name,last_name,email",
        skip: "skip:0",
        limit: "limit:10",
        sort: "sort:_id",
        order: "order:1"
      })
      filters.find['type'] = { $nin: ['admin'] }
      // if (request.user.type == 'user') filters.find['_id'] = request.user._id
      // if (request.query.mode && request.query.mode == 'all') delete filters.find['_id']

      let users = await this.user_model
        .find(filters.find)
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .populate('roles', '_id name')
      let total = await this.user_model.countDocuments(filters.find)

      /** Response */
      return response.status(200).json({
        pagination: {
          skip: filters.query.skip,
          limit: filters.query.limit,
          total,
        },
        users,
      })
    } catch (err) {
      logger.log({
        level: "error",
        message: err,
      })
      return response.status(400).send({ message: "Something went wrong" })
    }
  }

  /**
   * @method store
   * @description Create new user
   * @param {object} request
   * @param {object} response
   */
  async store(request, response) {
    try {
      /** Request validation */
      let validation = await request.validate({
        first_name: "required",
        last_name: "required",
        email: "email|required",
        // password: "string|required",
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: validation })

      // request.body.password = auth.hashPassword(
      //   request.body.password,
      //   Config.app("salt")
      // )
      let first_name =
        request.body.first_name.charAt(0).toUpperCase() +
        request.body.first_name.slice(1)
      let last_name =
        request.body.last_name.charAt(0).toUpperCase() +
        request.body.last_name.slice(1)
      request.body.first_name = first_name
      request.body.last_name = last_name

      request.body.created_by = request.user._id
      request.body.invited_date = new Date()

      /** Response */
      let user = await this.user_model.create(request.body)

      return response.status(200).json({
        message: "User created successfully",
        user: user,
        token: auth.generateToken(user._id.toString()),
      })

    } catch (err) {
      logger.log({
        level: "error",
        message: err,
      })
      return response.status(400).send({ message: "Something went wrong" })
    }
  }

  /**
   * @method show
   * @description Returns single user based on provided id
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async show(request, response) {
    try {

      /** Permission validation */
      // let allowed = permissions.can("users.show")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

      /** Request validation */
      let result = await request.validate({
        _id: "mongoId|required",
      })
      if (result && result.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: result })

      let user = await this.user_model
        .findOne({ _id: request.params._id }).populate('photo')

      /** Response */
      return response.status(200).json({ user: user })
    } catch (err) {
      logger.log({
        level: "error",
        message: err,
      })
      return response.status(400).send({ message: "Something went wrong" })
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
      // let allowed = permissions.can("users.update")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

      let validation = await request.validate({
        _id: "required|mongoId"
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: validation })

      request.body.updated_by = request.user.email
      request.body.updated_at = new Date()

      if (request.body.first_name) {
        let first_name =
          request.body.first_name.charAt(0).toUpperCase() +
          request.body.first_name.slice(1)
        request.body.first_name = first_name
      }
      if (request.body.last_name) {
        let last_name =
          request.body.last_name.charAt(0).toUpperCase() +
          request.body.last_name.slice(1)
        request.body.last_name = last_name
      }



      let updated = await this.user_model.findOneAndUpdate(
        { _id: request.params._id },
        {
          $set: request.body,
        },
        { new: true, useFindAndModify: false }
      )
      updated = await this.user_model
        .findOne({ _id: request.params._id })
        .select("-password")
        .populate('photo').populate('category').populate('sub_category')

      /** Response */
      return response
        .status(200)
        .json({ message: "User updated successfully", item: updated })

    } catch (err) {
      logger.log({
        level: "error",
        message: err,
      })
      return response.status(400).send({ message: "Something went wrong" })
    }
  }

  /**
   * @method resetPassword
   * @description Returns a user profile image
   * @param {object} request
   * @param {object} response
   * @return {image} response
   */
  async resetPassword(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("users.reset_password")
      // if (!allowed) return response.status(400).json({ message: 'Permission Denied', errors: ["Permission Denied"] })

      let validation = await request.validate({
        _id: "required|mongoId"
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: validation })

      let user = await this.user_model.findOne({ _id: request.user._id })
      if (user == null) {
        return response.status(400).json({ message: 'User does not exist' })
      }

      let generated_password = auth.hashPassword(request.body.current_password, Config.app('salt'))
      if (generated_password !== request.user.password) {
        return response.status(400).json({ message: 'Invalid current password' })
      }

      let new_password = auth.hashPassword(request.body.new_password, Config.app('salt'))
      user.password = new_password
      let updated = await user.save()
      if (updated.updatedCount == 0) return response.status(400).json({ message: 'Unable to change password' })

      /** Response */
      return response.status(200).json({ message: 'Password changed successfully' })
    } catch {

    }

  }

  /**
   * @method updatePassword
   * @description Returns
   * @param {object} request
   * @param {object} response
   * @return {image} response
   */
  async updatePassword(request, response) {
    try {

      let validation = await request.validate({
        token: "string|required",
        password: "string|required",
        re_password: "string|required",
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: "Missing required fields", errors: validation })

      let user = await this.user_model.findOne({ reset_password_token: request.params.token })
      if (!user) return response.status(400).json({ message: 'Invalid password reset request.', errors: ['Invalid password reset request.'] })

      var duration = moment.duration(moment(new Date()).diff(user.reset_password_created_at))
      var hours = duration.hours()
      if (hours >= 1) {
        return response.status(400).json({ message: 'Password reset request has been expired.', errors: ['Password reset request has been expired.'] })
      }

      if (request.body.password != request.body.re_password) {
        return response.status(400).json({ message: 'Passwords does not match.', errors: ['Passwords does not match.'] })
      }

      user.password = auth.hashPassword(request.body.password, Config.app('salt'))
      user.reset_password_token = null
      await user.save()

      return response.status(200).json({ message: "Password updated Successfully" })
    } catch (err) {
      logger.log({
        level: "error",
        message: err,
      })
      return response.status(400).send({ message: "Something went wrong" })
    }

  }

  /**
     * @method destroy
     * @description delete 
     * @param {object} request 
     * @param {object} response 
     * @return {object} response
     */
  async destroy(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("users.destory")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

      /** Request validation */
      let validation = await request.validate({
        _id: "required|mongoId",
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: validation })

      let user = await this.user_model.findOne({ _id: request.params._id })

      if (!user) {
        return response.status(400).json({ message: "User does not exists", errors: ["user dose not exist"] })
      }

      if (user.photo) {
        if (
          user.photo &&
          fs.existsSync(root_directory + "/public/user_images/" + user.photo)
        ) {
          fs.unlinkSync(root_directory + "/public/user_images/" + user.photo)
        }
      }

      user.remove()

      /** Response */
      return response.status(200).json({ message: "User deleted successfully" })
    } catch (err) {
      logger.log({
        level: "error",
        message: err,
      })
      return response.status(400).send({ message: "Something went wrong" })
    }
  }

  async checkDuplicateEmail(request, response) {
    try {
      if (request.body.email) {
        let user = await this.user_model.findOne({ email: request.body.email })
        if (user) {
          return response
            .status(402)
            .json({ message: 'Email address is already taken' })
        } else {
          return response.status(200).json({ message: 'Email is not Exist' })
        }
      }
      return response.status(400).json({ message: 'Please select email' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })

      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  async addPin(request, response) {
    let validation = await request.validate({
      _id: "required|mongoId",
      auth_pin: "required"

    })
    if (validation && validation.length > 0)
      return response
        .status(400)
        .json({ message: "Validation error", errors: validation })

    let user = await this.user_model.findOne({ _id: request.body._id })
    if (!user) {
      return response.status(400).json({ message: "User id is required" })
    }
    if (user.auth_pin != '') {
      return response.status(400).json({ message: "Pin is already set" })
    }
    await this.user_model.findOneAndUpdate(
      { _id: request.body._id },
      {
        $set: { auth_pin: request.body.auth_pin },
      },
      { new: true, useFindAndModify: false }
    )
    return response.status(200).send({ message: 'Pin set successfully' })
  }

  async checkEmail(request, response) {

    try {
      let validation = await request.validate({
        email: "required",
        user: "required"
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: validation })


      let user = await this.user_model.findOne({ email: request.body.email, _id: { $ne: request.body.user } })
      if (user) {
        return response
          .status(402)
          .json({ message: 'Email address is already taken' })

      }
      return response.status(200).json({ message: 'Email is not duplicate' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })

      return response.status(400).send({ message: 'Something went wrong' })
    }

  }

}