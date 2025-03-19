/**
 * @class WorkRequestController
 * @description Handles all Job related api
 */
module.exports = class WorkRequestController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.work_request_model = app.get('WorkRequestModel')
    this.notification_model = app.get('NotificationModel')
    this.job_model = app.get('JobModel')
    this.job_applicant_model = app.get('JobApplicantModel')
    this.general_helper = app.get('GeneralHelper')
  }

  async getJobsForRequest(request, response) {
    try {

      /** Permission validation */
      // let allowed = permissions.can("workRequest.update")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: ["Permission Denied"] })

      let validation = await request.validate({
        employee_id: 'mongoId|required'
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      let employee_id = request.params.employee_id

      let job_applicants = await this.job_applicant_model.distinct('job', {
        employee: employee_id,
        employer: request.user._id
      })

      let previous_reuests = await this.work_request_model.distinct('job', {
        employee: employee_id,
        employer: request.user._id
      })
      let jobs_array = [...job_applicants, ...previous_reuests]

      let jobs = await this.job_model.find({ status: 'open', employer: request.user._id, _id: { $nin: jobs_array } })

      /** Response */
      return response.status(200).json({
        jobs
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
   * @method index
   * @description Returns list of items
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async index(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can('workRequest.index')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })

      let filters = await request.filter({
        search: "",
        skip: "skip:0",
        limit: "limit:10",
        sort: "sort:_id",
        order: "order:1"
      })

      filters.find['deleted_at'] = null
      filters.find['employee'] = request.user._id
      let items = await this.work_request_model
        .find(filters.find)
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .populate('job')
        .populate('employer', '_id first_name email')
        .lean()

      let total = await this.work_request_model.countDocuments(filters.find)

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
      let allowed = permissions.can('workRequest.store')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })
      /** Request validation */
      let validation = await request.validate({
        employee: "required",
        job: "required"
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: validation })
      if (request.user.type == 'employee') {
        return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      }
      let already_requested = await this.work_request_model.findOne({
        employee: request.body.employee,
        job: request.body.job
      })
      if (already_requested) {
        return response.status(400).json({ message: 'Validation error', errors: "Already request sent" })
      }

      request.body.employer = request.user._id
      request.body.created_by = request.user.email
      let created = await this.work_request_model.create(request.body)
      let work_request = await this.work_request_model.findOne({ _id: created._id }).populate("employee").populate('employer').populate('job')
      let dates = work_request.job.time_slots.dates
      let computed_date = []
      for (let i = 0; i < dates.length; i++) {
        let single_date = await this.general_helper.convertToNzDate(dates[i])
        single_date = moment(single_date).format('YYYY-MM-DD')
        // if (i > 0) {
        //   computed_date += ', '
        // }
        computed_date.push(single_date)
      }
      let employee_first_name = (work_request.employee.first_name) ? work_request.employee.first_name : ''
      let employee_last_name = (work_request.employee.last_name) ? work_request.employee.last_name : ''
      let template = await view().render('templates.employee/new_workrequest', {
        name: `${employee_first_name} ${employee_last_name}`,
        employee: work_request.employee,
        employer: work_request.employer,
        job: work_request.job,
        dates: computed_date,
        link: `${process.env.CLIENT_URL}/work-request/${work_request._id}`
      })
      await mail.send(template, `Work Request: ${work_request.job.job_id} - ${work_request.job.title}`, work_request.employee.email)
      await this.pushNotification(work_request.employee, 'Work Request', ' Request to Work ' + work_request.job.job_id + ' - ' + work_request.job.title, `/job-applicants?job_id=${work_request._id}`, work_request._id)

      return response.status(200).json({
        message: 'Request has been sent',
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
      let allowed = permissions.can("workRequest.show")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      /** Request validation */

      let validation = await request.validate({
        _id: 'mongoId|required'
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      let item = await this.work_request_model.findOne({
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
      let allowed = permissions.can('workRequest.update')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })
      let validation = await request.validate({
        _id: 'mongoId|required'
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      let work_request = await this.work_request_model.findOne({ _id: request.params._id })
      if (!work_request)
        return response.status(400).json({ message: 'Item does not exist' })


      if (request.body.status == 'accepted') {
        let job_detail = await this.job_model.findOne({ _id: work_request.job })
        if (job_detail.status == 'confirmed') {
          return response.status(400).json({ message: 'Validation error', errors: 'Job is already confirmed' })
        }

        let already_applied = await this.job_applicant_model.findOne({
          job: job_detail._id,
          employee: request.user._id
        })
        if (already_applied) {
          await this.job_applicant_model.findOneAndUpdate(
            { _id: already_applied._id },
            {
              $set: { status: 'confirmed' }
            },
            { new: true, useFindAndModify: false }
          )
        } else {
          await this.job_applicant_model.create({
            job: job_detail._id,
            employee: request.user._id,
            status: 'confirmed',
            employer: job_detail.employer,
            created_by: request.user.email
          })
        }
        await this.job_model.findOneAndUpdate(
          { _id: job_detail._id },
          {
            $set: { status: 'confirmed' }
          },
          { new: true, useFindAndModify: false }
        )
      }

      request.body.updated_by = request.user.email
      let updated = await this.work_request_model.findOneAndUpdate(
        { _id: request.params._id },
        {
          $set: request.body
        },
        { new: true, useFindAndModify: false }
      ).populate('employee').populate('employer').populate('job')
      if (request.body.status && request.body.status !== '') {
        let _status = request.body.status == 'accepted' ? 'Accept' : 'Reject'
        let _message = request.body.status == 'accepted' ? request.user.first_name + ' ' + request.user.last_name + ' has accepted the work request. See job details below:' : ' Regrettably, ' + request.user.first_name + ' ' + request.user.last_name + ' has rejected your work request. See job details below:'
        let message = request.body.status == 'accepted' ? request.user.first_name + ' ' + request.user.last_name + ' has accepted the request.' : request.user.first_name + ' ' + request.user.last_name + ' has rejected the request.'

        let dates = updated.job.time_slots.dates
        let computed_date = []
        for (let i = 0; i < dates.length; i++) {
          let single_date = await this.general_helper.convertToNzDate(dates[i])
          single_date = moment(single_date).format('YYYY-MM-DD')
          // if (i > 0) {
          //   computed_date += ', '
          // }
          computed_date.push(single_date)
        }
        let employer_first_name = (updated.employer.first_name) ? updated.employer.first_name : ''
        let template = await view().render('templates.employer/workrequest_status', {
          name: `${employer_first_name}`,
          message: _message,
          job: updated.job,
          dates: computed_date
        })
        await mail.send(template, `Work Request Update - ${_status}: ${updated.job.job_id} - ${updated.job.title}`, updated.employer.email)
        await this.pushNotification(updated.employer, 'Work Request Update', message, `/job-applicants?job_id=${updated._id}`, updated._id)

      }

      /** Response */
      return response.status(200).json({
        message: 'Job has been updated',
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

}
