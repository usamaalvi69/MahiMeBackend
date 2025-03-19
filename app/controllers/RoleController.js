
/**
 * @class RoleController
 * @description Handles all role related CRUD operations
 */
module.exports = class RoleController {

    /**
     * @constructor
     * @description Handles autoloaded dependencies
     */
    constructor(app) {
        this.user_model = app.get("UserModel")
        this.role_model = app.get("RoleModel")
    }

    /**
   * @method index
   * @description Returns list of user
   * @param {object} request
   * @param {object} response
   */
    async index(request, response) {
        try {

            if (request.user.type != 'admin') {
                response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })
            }
            /** Request validation */
            let filters = await request.filter({
                name: "like:name",
                skip: "skip:0",
                limit: "limit:100",
                sort: "sort:_id",
                order: "order:1"
            })

            // if (request.user.type == 'user') filters.find['_id'] = request.user._id
            if (request.query.search && request.query.search != '') {
                filters.find['$or'] = [
                  { name: new RegExp('.*' + request.query.search + '.*', 'i') }
        
                ]
              }
            let roles = await this.role_model
                .find(filters.find)
                .skip(filters.query.skip)
                .limit(filters.query.limit)
                .sort(filters.query.sort)
                .select(filters.projection)
                .lean()
            let total = await this.role_model.countDocuments(filters.find)

            /** Response */
            return response.status(200).json({
                pagination: {
                    skip: filters.query.skip,
                    limit: filters.query.limit,
                    total,
                },
                list: roles,
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
  * @method permissions
  * @description Get permissions
  * @param {object} request
  * @param {object} response
  */
    async permissions(request, response) {
        try {

            /** Permission validation */
            // let allowed = permissions.can("roles.index")
            // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })
            if (request.user.type != 'admin') {
                response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })
            }
            if (request.user.type == 'user') response.status(200).json({
                permissions: []
            })
            return response.status(200).json({ permissions: permissions.all })

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

            /** Permission validation */
            // let allowed = permissions.can("roles.store")
            // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })
            if (request.user.type != 'admin') {
                response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })
            }
            /** Request validation */
            let validation = await request.validate({
                name: "required|string",
                permissions: "required|array",
            })

            // request.body.permissions = request.body.permissions.split(',')

            if (validation && validation.length > 0)
                return response
                    .status(400)
                    .json({ message: "Validation error", errors: validation })

            request.body.created_by = request.user.email
            request.body.updated_by = request.user.email
            request.body.created_at = new Date()
            request.body.updated_at = new Date()

            /** Response */
            let role = await this.role_model.create(request.body)

            return response.status(200).json({
                message: "Role created successfully",
                role: role
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
     * @description Returns single 
     * @param {object} request 
     * @param {object} response 
     * @return {object} response
     */
    async show(request, response) {
        try {
            if (request.user.type != 'admin') {
                response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })
            }
            /** Permission validation */
            // let allowed = permissions.can("roles.show")
            // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

            if (request.user.type == 'user') return response.status(200).json({

            })

            let role = await this.role_model
                .findOne({ _id: request.params._id })

            /** Response */
            return response.status(200).json({
                role
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
     * @method update
     * @description Update 
     * @param {object} request 
     * @param {object} response 
     * @return {object} response
     */
    async update(request, response) {
        try {
            if (request.user.type != 'admin') {
                response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })
            }
            /** Permission validation */
            // let allowed = permissions.can("roles.update")
            // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

            /** Request validation */
            let validation = await request.validate({
                _id: "mongoId",
                permissions: "required|array",
            })

            // request.body.permissions = request.body.permissions.split(',')

            if (validation && validation.length > 0)
                return response
                    .status(400)
                    .json({ message: "Validation error", errors: validation })

            request.body.updated_by = request.user.email
            request.body.updated_at = new Date()

            let updated = await this.role_model.findOneAndUpdate(
                { _id: request.params._id },
                {
                    $set: request.body,
                },
                { new: true, useFindAndModify: false }
            )
            updated = await this.role_model
                .findOne({ _id: request.params._id })

            /** Response */
            return response.status(200).json({
                message: "Role updated successfully",
                role: updated
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
     * @method destroy
     * @description delete 
     * @param {object} request 
     * @param {object} response 
     * @return {object} response
     */
    async destroy(request, response) {
        try {
            /** Permission validation */
            let allowed = permissions.can("roles.destroy")
            if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })
            if (request.user.type != 'admin') {
                response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })
            }
            /** Request validation */
            let validation = await request.validate({
                _id: "required|mongoId",
            })
            if (validation && validation.length > 0)
                return response
                    .status(400)
                    .json({ message: "Validation error", errors: validation })


            let user = await this.user_model.findOne({ roles: request.params._id })

            if (user) {
                return response.status(400).json({ message: "Role is in-use by user {" + user.name + "}", errors: ["Role already in use"] })
            }

            let role = await this.role_model.findOne({ _id: request.params._id })

            if (!role) {
                return response.status(400).json({ message: "Role does not exists", errors: ["role dose not exist"] })
            }

            role.remove()

            /** Response */
            return response.status(200).json({ message: "Role deleted successfully" })
        } catch (err) {
            logger.log({
                level: "error",
                message: err,
            })
            return response.status(400).send({ message: "Something went wrong" })
        }
    }

}
