const moment = require('moment');
/**
 * @class JobApplicantController
 * @description Handles all Job related api
 */
module.exports = class JobApplicantController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.job_applicant_model = app.get('JobApplicantModel')
    this.job_model = app.get('JobModel')
    this.general_helper = app.get('GeneralHelper')
    this.notification_model = app.get('NotificationModel')
    this.user_model = app.get('UserModel')


  }
  /**
   * @method index
   * @description Returns list of items
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async index(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can('job_applicant.index')
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: 'Permission Denied' })

      let filters = await request.filter({
        // search: "likes",
        skip: "skip:0",
        limit: "limit:10",
        sort: "sort:_id",
        order: "order:1"
      })
      let employee = {}
      if (request.query.search && request.query.search != '') {
        // employee = { first_name: new RegExp('.*' + request.query.search + '.*', 'i') }
        employee = {
          '$or': [
            { first_name: new RegExp('.*' + request.query.search + '.*', 'i') },
            { last_name: new RegExp('.*' + request.query.search + '.*', 'i') },
            { email: new RegExp('.*' + request.query.search + '.*', 'i') },
          ]
        }
      }

      if (request.query.type == 'applied') {
        filters.find['status'] = { $in: ['open', 'rejected'] }
      }
      if (request.query.type == 'upcoming') {
        filters.find['status'] = 'confirmed'
      }
      if (request.query.type == 'previous') {
        filters.find['status'] = 'completed'
      }
      if (request.user.type == 'employer') {
        filters.find['employer'] = request.user._id
        if (request.query.job) {
          filters.find['job'] = request.query.job
        }
      } else if (request.user.type == 'employee') {
        filters.find['employee'] = request.user._id
      }

      let items = await this.job_applicant_model
        .find(filters.find)
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .select(filters.projection)
        .populate('job')
        .populate({ path: 'employee', match: { ...employee }, populate: 'photo' })
        // .populate('employee', 'first_name last_name email phone photo preferred_location rating')
        .populate('employer', 'first_name last_name email phone photo time_slots business_name business_address rating')
        .lean()

      // { path: 'practice', match: { ...practice }, populate: { path: 'category sub_category' } }

      items = items.filter(item => item?.employee)
      let total = await this.job_applicant_model.countDocuments(filters.find)

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
      let allowed = permissions.can('job_applicant.store')
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: 'Permission Denied' })
      /** Request validation */
      let validation = await request.validate({
        job: "required"
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: validation })
      let job_detail = await this.job_model.findOne({ _id: request.body.job }).populate('employer')
      if (!job_detail) {
        return response.status(400).send({ message: 'Job does not exist' })
      }
      if (job_detail.status != 'open') {
        return response.status(400).send({ message: 'Job is not open for application' })
      }
      if (job_detail.deleted_at) {  // check if job is deleted or not
        return response.status(400).send({ message: 'Job does not exist' }) // if deleted then return error message 
      }
      let already_applied = await this.job_applicant_model.findOne({
        job: request.body.job,
        employee: request.user._id
      })
      if (already_applied) {
        return response.status(400).send({ message: 'Already applied for the job' })
      }
      if (request.user.type == 'employer') {
        return response.status(400).send({ message: `Can't apply for the job` })
      }

      let created = await this.job_applicant_model.create({
        job: request.body.job,
        employee: request.user._id,
        employer: job_detail.employer,
        created_by: request.user.email
      })
      let employer = job_detail.employer

      let dates = job_detail.time_slots.dates
      let computed_date = []
      for (let i = 0; i < dates.length; i++) {
        let single_date = await this.general_helper.convertToNzDate(dates[i])
        single_date = moment(single_date).format('YYYY-MM-DD')
        // if (i > 0) {
        //   computed_date += ', '
        // }
        computed_date.push(single_date)
      }
      let first_name = (employer.first_name && employer.first_name != undefined) ? employer.first_name : ""
      let template = await view().render('templates.employer/new_applicant', {
        name: `${first_name}`,
        employee: request.user,
        job: job_detail,
        dates: computed_date
      })
      let employee_name = `${request.user.first_name} ${request.user.last_name}`
      await mail.send(template, ` ${employee_name} applied for ${job_detail.job_id} - ${job_detail.title}`, employer.email)
      await this.pushNotification(job_detail.employer, 'Job Applied', request.user.first_name + ' ' + request.user.last_name + ' applied for ' + job_detail.job_id + ' - ' + job_detail.title, `/job-applicants?job_id=${job_detail._id}`, job_detail._id)

      return response.status(200).json({
        message: 'Job applied successfully',
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
      let allowed = permissions.can("job_applicant.show")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      /** Request validation */

      let validation = await request.validate({
        _id: 'mongoId|required'
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      let item = await this.job_applicant_model.findOne({
        _id: request.params._id
      })

      if (!item)
        return response.status(400).json({ message: 'Item does not exist' })

      /** Response */
      return response.status(200).json({ item: item })
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
      let allowed = permissions.can("job_applicant.update")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      let validation = await request.validate({
        status: "required"
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: validation })
      let job_applicant = await this.job_applicant_model.findOne({
        _id: request.params._id
      }).populate('employee').populate('job')

      if (!job_applicant) {
        return response.status(400).json({ message: 'Item does not exist' })
      }
      let message = ''
      let notification_message = ''
      request.body.updated_by = request.user.email
      if (request.user.type == 'employer' && request.body.status == 'confirmed') {
        if (JSON.stringify(job_applicant.employer) != JSON.stringify(request.user._id)) {
          return response.status(400).json({ message: 'you are not allowed to change status' })
        }

        await this.job_applicant_model.updateMany(
          { job: job_applicant.job._id, _id: { $ne: request.params._id } },
          {
            $set: { status: 'rejected' },
          },
          { new: true, useFindAndModify: false }
        )
        message = 'Congratulations! Your application has been accepted. See job details below'
        notification_message = `You have been accepted: ${job_applicant.job.job_id} - ${job_applicant.job.title}`
      }
      if (request.body.status == 'rejected') {
        message = 'Unfortunately, your application was not successful on this occasion. See job details below'
        notification_message = `Application Unsuccessful: ${job_applicant.job.job_id} - ${job_applicant.job.title}`

      }
      let updated = await this.job_applicant_model.findOneAndUpdate(
        { _id: request.params._id },
        {
          $set: request.body
        },
        { new: true, useFindAndModify: false }
      )
      let check_status = ['confirmed', 'completed', 'paid']
      if (request.user.type == 'employer' && check_status.includes(request.body.status)) {
        await this.job_model.findOneAndUpdate(
          { _id: job_applicant.job._id },
          {
            $set: { status: request.body.status }
          },
          { new: true, useFindAndModify: false }
        )
      }

      let dates = job_applicant.job.time_slots.dates
      let computed_date = []
      for (let i = 0; i < dates.length; i++) {
        let single_date = await this.general_helper.convertToNzDate(dates[i])
        single_date = moment(single_date).format('YYYY-MM-DD')
        // if (i > 0) {
        //   computed_date += ', '
        // }
        computed_date.push(single_date)
      }

      let template = await view().render('templates.employee/application_status', {
        name: `${job_applicant.employee.first_name} ${job_applicant.employee.last_name}`,
        message: message,
        job: job_applicant.job,
        dates: computed_date
      })
      await mail.send(template, `Job Update: ${job_applicant.job.job_id} - ${job_applicant.job.title}`, job_applicant.employee.email)
      await this.pushNotification(job_applicant.employee, 'Update Applicant', notification_message, `/job-applicants?job_id=${job_applicant.job._id}`, job_applicant.job._id)

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
      let allowed = permissions.can("job_applicant.destroy")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      /** Request validation */

      let job_applicant = await this.job_applicant_model.findOne({
        _id: request.params._id
      }).populate('employee', 'first_name last_name email')
        .populate('employer', 'first_name email')
        .populate('job', 'job_id title time_slots')

      if (!job_applicant) {
        return response.status(400).json({ message: 'Application does not exists' })
      }

      if (job_applicant.status == 'confirmed') {
        let employer_name = job_applicant?.employer?.first_name
        let employee_name = job_applicant?.employee?.first_name + " " + job_applicant?.employee?.last_name 
        let dates = job_applicant.job.time_slots.dates
        let computed_date = []
        for (let i = 0; i < dates.length; i++) {
          let single_date = await this.general_helper.convertToNzDate(dates[i])
          single_date = moment(single_date).format('YYYY-MM-DD')
          // if (i > 0) {
          //   computed_date += ', '
          // }
          computed_date.push(single_date)
        }
        let template = await view().render('templates.employer/application_withdraw', {
          employer_name: `${employer_name}`,
          employee_name: `${employee_name}`,
          job: job_applicant.job,
          dates:computed_date
         
        })
        await mail.send(template, ` ${employee_name} requested to withdraw from ${job_applicant.job.job_id} - ${job_applicant.job.title}`, job_applicant.employer.email)
        
        return response.status(200).json({ message: 'Email has been sent to employer' })
      }

      job_applicant.remove()

      /** Response */
      return response.status(200).json({ message: 'Job has been withdrawn successfully.' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  async pushNotification(
    user_id,
    title,
    message,
    path,
    path_id,
  ) {
    try {
      if (user_id.firebase_token && user_id.allow_push_notifications) {
        await this.general_helper.sendPushNotification(
          user_id.firebase_token,
          title,
          message,
          '',
          { job_id: path_id }

        )
      }
      // if (user_id.type == 'admin') {
      //   var path = '/admin-support-detail/' + path_id
      // } else {
      //   var path = '/support-detail/' + path_id
      // }
      let created = await this.notification_model.create({
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

  async employeeAppliedJobs(request, response) {
    try {

      let allowed = permissions.can("job_applicant.getAppliedJobs")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      let validation = await request.validate({
        employee_id: 'mongoId|required'
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })
      let filters = await request.filter({
        // search: "likes",
        skip: "skip:0",
        limit: "limit:10",
        sort: "sort:_id",
        order: "order:1"
      })

      filters.find['employee'] = request.params.employee_id
      if (request.user.type != 'admin') {
        filters.find['employer'] = request.user._id
      }

      let items = await this.job_applicant_model
        .find(filters.find)
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .populate({
          path: 'job',
          populate: {
            path: 'category'
          }
        })
        // .populate('job')
        .populate('employer', 'first_name business_name business_address')
        .lean()

      let total = await this.job_applicant_model.countDocuments(filters.find)

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
      return { error: true, message: 'Something went wrong' }
    }
  }

  async getRating(request, response) {
    try {
      let allowed = permissions.can("rating.index")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      let validation = await request.validate({
        user_id: 'mongoId|required'
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      let user = await this.user_model.findOne({ _id: request.params.user_id })
      if (!user) {
        return response.status(400).json({ message: 'User does not exist' })
      }

      let filters = await request.filter({
        // search: "likes",
        skip: "skip:0",
        limit: "limit:10",
        sort: "sort:_id",
        order: "order:1"
      })

      if (user.type == 'employee') {
        filters.find['rating.employer_rating_date'] = { $ne: null }
        filters.find['employee'] = user._id

      } else if (user.type == 'employer') {
        filters.find['rating.employee_rating_date'] = { $ne: null }
        filters.find['employer'] = user._id
      }

      let rating = await this.job_applicant_model
        .find(filters.find)
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .populate('employer', 'first_name business_name photo')
        .populate('employee', 'first_name last_name photo')

        .lean()

      let total = await this.job_applicant_model.countDocuments(filters.find)

      /** Response */
      return response.status(200).json({
        pagination: {
          skip: filters.query.skip,
          limit: filters.query.limit,
          total
        },
        rating
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return { error: true, message: 'Something went wrong' }
    }
  }

  async employerApplicants(request, response) {
    try {
      let filters = await request.filter({
        search: "likes",
        skip: "skip:0",
        limit: "limit:10",
        sort: "sort:created_at",
        order: "order:1"
      })
      filters.find['employer'] = request.params.user_id


      let validation = await request.validate({
        user_id: 'mongoId|required'
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      let items = await this.job_applicant_model.find(filters.find)
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .populate('employee', 'first_name last_name')
        .populate({ path: 'job', populate: { path: "category", select: "name" } })
        .lean()

      let total = await this.job_applicant_model.countDocuments(filters.find)

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
      return { error: true, message: 'Something went wrong' }
    }
  }


}
