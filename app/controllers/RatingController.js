
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
        this.rate_model = app.get("RatingModel")
        this.job_applicant_model = app.get("JobApplicantModel")
        this.notification_model = app.get('NotificationModel')
        this.user_model = app.get('UserModel')
        this.general_helper = app.get('GeneralHelper')
    }

    /**
   * @method index
   * @description Returns list of user
   * @param {object} request
   * @param {object} response
   */
    async index(request, response) {
        try {
            let validation = await request.validate({
                user_id: "required"
            })
            if (validation && validation.length > 0)
                return response
                    .status(400)
                    .json({ message: "Validation error", errors: validation })
            /** Permission validation */
            // let allowed = permissions.can("roles.index")
            // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

            /** Request validation */
            let filters = await request.filter({
                name: "like:name",
                skip: "skip:0",
                limit: "limit:100",
                sort: "sort:_id",
                order: "order:1"
            })
            let user_detail = await this.user_model.findOne({ _id: request.query.user_id })

            if (user_detail.type == 'employee') {
                filters.find['employee'] = user_detail._id
                filters.find['employee_review'] = { $ne: null }

            } else {
                filters.find['employer'] = user_detail._id
                filters.find['employer_review'] = { $ne: null }
            }
            let ratings = await this.rate_model
                .find(filters.find)
                .populate({ path: 'employee', populate: { path: 'photo' } })
                .populate({ path: 'employer', populate: { path: 'photo' } })
                .skip(filters.query.skip)
                .limit(filters.query.limit)
                .sort(filters.query.sort)
                .select(filters.projection)
                .lean()
            // let filter = request.user.type == 'employee' ? {employee : request.user._id} : {employer : request.user._id}     
            let total = await this.rate_model.countDocuments(filters.find)
            /** Response */
            return response.status(200).json({
                pagination: {
                    skip: filters.query.skip,
                    limit: filters.query.limit,
                    total,
                },
                list: ratings
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
   * @method avgRate
   * @description Returns list of user
   * @param {object} request
   * @param {object} response
   */
    async avgRate(request, response) {
        try {

            /** Permission validation */
            // let allowed = permissions.can("roles.index")
            // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

            let filter = { created_by: request.user._id }

            const result = await this.rate_model.aggregate([
                { $match: { ...filter } },
                { $group: { _id: null, averageRate: { $avg: "$rate" } } }
            ]);
            /** Response */
            return response.status(200).json({
                result
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

            /** Permission validation */
            // let allowed = permissions.can("roles.store")
            // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

            /** Request validation */
            let validation = await request.validate({
                rate: "required",
                job_applicant: "required",
                notification_id: "required"
            })

            // request.body.permissions = request.body.permissions.split(',')

            if (validation && validation.length > 0)
                return response
                    .status(400)
                    .json({ message: "Validation error", errors: validation })

            let job_applicant = await this.job_applicant_model.findOne({ _id: request.body.job_applicant })

            if (!job_applicant) {
                return response.status(400).json({ message: "Job applicant does not exists", errors: ["Job applicant dose not exist"] })
            }
            let rating_exist = await this.rate_model.findOne({ job_applicant: job_applicant._id, employee: job_applicant.employee, employer: job_applicant.employer })
            if (request.user.type == 'employer') {
                request.body.employee_rate = request.body.rate
                request.body.employee_review = request.body.review

            } else {
                request.body.employer_rate = request.body.rate
                request.body.employer_review = request.body.review
            }

            if (rating_exist) {
                request.body.updated_by = request.user.email
                request.body.updated_at = new Date()
                await this.rate_model.findOneAndUpdate(
                    { _id: rating_exist._id },
                    {
                        $set: request.body,
                    },
                    { new: true, useFindAndModify: false }
                )

            } else {
                request.body.employee = job_applicant.employee
                request.body.employer = job_applicant.employer
                request.body.job = job_applicant.job
                request.body.created_by = request.user._id
                request.body.created_by = request.user._id
                request.body.updated_by = request.user.email
                request.body.created_at = new Date()
                request.body.updated_at = new Date()
                /** Response */
                await this.rate_model.create(request.body)
            }


            let average_rating = ''

            if (request.user.type == 'employee') {
                average_rating = await this.rate_model.aggregate([
                    { $match: { employer: job_applicant.employer, employer_review: { $ne: null }, employer_rating: { $ne: 0 } } },
                    { $group: { _id: null, avg_val: { $avg: '$employer_rate' } } }
                ])

                await this.user_model.findOneAndUpdate(
                    { _id: job_applicant.employer },
                    {
                        $set: { rating: average_rating[0].avg_val }
                    },
                    { new: true, useFindAndModify: false }
                )
                let receiver = await this.user_model.findOne({_id:job_applicant.employer}) 
                await this.pushNotification(receiver, 'Submitted Review', request.user.first_name + ' ' + request.user.last_name + ' has submitted a review', ``, job_applicant._id)

            } else {
                
                average_rating = await this.rate_model.aggregate([
                    { $match: { employee: job_applicant.employee, employee_review: { $ne: null }, employee_rating: { $ne: 0 } } },
                    { $group: { _id: null, avg_val: { $avg: '$employee_rate' } } }
                ])

                await this.user_model.findOneAndUpdate(
                    { _id: job_applicant.employee },
                    {
                        $set: { rating: average_rating[0].avg_val }
                    },
                    { new: true, useFindAndModify: false }
                )

                let receiver = await this.user_model.findOne({_id:job_applicant.employee}) 
                await this.pushNotification(receiver, 'Submitted Review', request.user.first_name  + ' has submitted a review ', ``, job_applicant._id)
            }



            await this.notification_model.findOneAndUpdate(
                { _id: request.body.notification_id },
                {
                    $set: { submit: true }
                },
                { new: true, useFindAndModify: false }
            )

            return response.status(200).json({
                message: "Ratting added successfully"
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

            /** Permission validation */
            let allowed = permissions.can("roles.show")
            if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

            if (request.user.type == 'user') return response.status(200).json({

            })

            let role = await this.rate_model
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

            /** Permission validation */
            let allowed = permissions.can("roles.update")
            if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

            /** Request validation */
            let validation = await request.validate({
                _id: "mongoId",
                name: "required|string",
                permissions: "required|array",
            })

            // request.body.permissions = request.body.permissions.split(',')

            if (validation && validation.length > 0)
                return response
                    .status(400)
                    .json({ message: "Validation error", errors: validation })

            request.body.updated_by = request.user.email
            request.body.updated_at = new Date()

            let updated = await this.rate_model.findOneAndUpdate(
                { _id: request.params._id },
                {
                    $set: request.body,
                },
                { new: true, useFindAndModify: false }
            )
            updated = await this.rate_model
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

            let role = await this.rate_model.findOne({ _id: request.params._id })

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

    async pushNotification(
        user_id,
        title,
        message,
        path_id,
    ) {
        try {
            if (user_id.firebase_token && user_id.allow_push_notifications) {
                await this.general_helper.sendPushNotification(
                    user_id.firebase_token,
                    title,
                    message,
                    '',
                    { support_id: path_id }

                )
            }
            var path = ""
            // if (user_id.type == 'admin') {
            //     var path = '/admin-support-detail/' + path_id
            // } else {
            //     var path = '/support-detail/' + path_id
            // }
            await this.notification_model.create({
                title: title,
                message: message,
                to_user: user_id._id,
                url: path,
                notification_redirect_id: path_id
            })
        } catch (err) {
            logger.log({
                level: 'error',
                message: err
            })
            return { error: true, message: 'Something went wrong' }
        }
    }

}
