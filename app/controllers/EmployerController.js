/**
 * @class EmployerController
 * @description Handles all user related CRUD operations
 */
module.exports = class EmployerController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.user_model = app.get("UserModel")
    this.crypt_helper = app.get('CryptHelper')
    this.general_helper = app.get('GeneralHelper')
    this.role_model = app.get("RoleModel")
  }
  /**
   * @method feEmployers
   * @description Returns list of employers
   */
  async feEmployers(request, response) {
    try {
      let users = await this.user_model
        .find({ 'type': 'employer' })
      /** Response */
      return response.status(200).json({ users })
    } catch (err) {
      logger.log({
        level: "error",
        message: err,
      })
      return response.status(400).send({ message: "Something went wrong" })
    }
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
      let allowed = permissions.can("employers.index")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

      /** Request validation */
      let filters = await request.filter({
        search: "likes:business_name,first_name,email,contact_no",
        skip: "skip:0",
        limit: "limit:10",
        sort: "sort:_id",
        order: "order:1"
      })
      filters.find['type'] = 'employer'
      let users = await this.user_model
        .find(filters.find)
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .populate('roles', '_id name')
        .populate('category')
        .populate('sub_category')
        .populate('photo')



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
      let allowed = permissions.can("employers.store")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })
      /** Request validation */
      let validation = await request.validate({
        first_name: "required",
        business_address: "required",
        // preferred_location: "required",
        email: "email|required",
        contact_no: "required",
        category: "required",
        sub_category: "required",
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: validation })

      // request.body.password = auth.hashPassword(
      //   request.body.password,
      //   Config.app("salt")
      // )
      // request.body.business_address = {
      //   lattitude:request.body.business_lattitude,
      //   longitude:request.body.business_longitude,
      //   address:request.body.business_address,

      // }
      request.body.type = 'employer'
      request.body.invited_date = new Date()
      let generated_password = await this.general_helper.generateComplexPassword()
      request.body.password = auth.hashPassword(
        generated_password,
        Config.app('salt')
      )
      let role = await this.role_model.findOne({ name: "employer" }) // must pre-exist
      if (role) {
        request.body.roles = [role]
      }
      /** Response */
      let user = await this.user_model.create(request.body)

      /** Email dispatch */
      let template = await view().render('templates.welcome_employer', {
        token: user.reset_password_token,
        base_url: Config.app('base_url'),
        fe_url: Config.app('fe_url') + '/signin',
        name: `${user.first_name}`,
        email: `${user.email}`,
        password: generated_password,
        app: Config.app('app_name'),

      })

      await mail.send(template, `Kia ora and Welcome to Mahi Me - Account Created`, user.email)

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
      let allowed = permissions.can("employers.show")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

      /** Request validation */
      let result = await request.validate({
        _id: "mongoId|required",
      })
      if (result && result.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: result })

      let user = await this.user_model
        .findOne({ _id: request.params._id })
        .select("-password")
        .populate('category')
        .populate('sub_category')
        .populate('roles', '_id name')
        .populate('photo')

      if (!user)
        return response.status(400).json({ message: "User does not exist" })

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
      let allowed = permissions.can("employers.update")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

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
      if (request.body.business_name) {
        let business_name =
          request.body.business_name.charAt(0).toUpperCase() +
          request.body.business_name.slice(1)
        request.body.business_name = business_name
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
        .populate('roles', '_id name')
        .populate('photo')
        .populate('category')
        .populate('sub_category')

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
     * @method destroy
     * @description delete 
     * @param {object} request 
     * @param {object} response 
     * @return {object} response
     */
  async destroy(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can("employers.destroy")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

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
          fs.existsSync(root_directory + "/public/upload_images/" + user.photo)
        ) {
          fs.unlinkSync(root_directory + "/public/upload_images/" + user.photo)
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


}