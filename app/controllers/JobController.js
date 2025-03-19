/**
 * @class JobController
 * @description Handles all Job related api
 */
module.exports = class JobController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.job_model = app.get('JobModel')
    this.job_applicant_model = app.get('JobApplicantModel')
    this.general_helper = app.get('GeneralHelper')

  }
  /**
   * @method getJobId
   * @description Returns new job id for new job
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async getJobId(request, response) {
    try {
      let settings = await this.general_helper.getSettingsKeys(['job_id'])
      let job_id = parseInt(settings.job_id) + 1

      await this.general_helper.updateSettingsKeys('job_id', job_id)
      job_id = String(job_id).padStart(7, '0')
      return response.status(200).json({
        message: 'Job id fetched successfully',
        job_id: job_id
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
      let allowed = permissions.can('jobs.index')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })

      let filters = await request.filter({
        search: "likes:job_id,title",
        skip: "skip:0",
        limit: "limit:10",
        sort: "sort:job _id",
        order: "order:1"
      })
      filters.find['deleted_at'] = null
      if (request.user.type == 'employer') {
        filters.find['employer'] = request.user._id
      }
      if (request.user.type == 'employee' && request.query.user_id && request.query.user_id != '') {
        filters.find['employer'] = request.query.user_id
      }
      if (request.query.status && request.query.status != '') {
        filters.find['status'] = request.query.status
      }

      let items = await this.job_model
        .find(filters.find)
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .select(filters.projection)
        .populate('category', '_id name')
        .populate('sub_category', '_id name')
        .populate('employer', '_id business_name first_name')
        .lean()
      for (let i = 0; i <= items.length; i++) {
        if (items[i]) {
          let applications = await this.job_applicant_model.countDocuments({ job: items[i]._id })
          items[i].applications = applications
          let onJobEmployee = await this.job_applicant_model.findOne({ job: items[i]._id, status: 'confirmed' }).populate('employee', '_id first_name last_name')
          items[i].on_the_job = (onJobEmployee) ? onJobEmployee?.employee?.first_name + " " + onJobEmployee?.employee?.last_name : ""

        }
      }

      let total = await this.job_model.countDocuments(filters.find)

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
      let allowed = permissions.can('jobs.store')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })
      /** Request validation */
      let validation = await request.validate({
        job_id: "required",
        title: "required",
        description: "required",
        category: "required",
        sub_category: "required",
        location: "required",
        time_slots: "required",
        status: "required"
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: "Validation error", errors: validation })
      if (request.user.type == 'employee') {
        return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      }
      if (request.user.type == 'employer') {
        request.body.employer = request.user._id
      }
      request.body.created_by = request.user.email
      let created = await this.job_model.create(request.body)
      return response.status(200).json({
        message: 'Job has been created',
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
      let allowed = permissions.can("jobs.show")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      /** Request validation */

      let validation = await request.validate({
        _id: 'mongoId|required'
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      let item = await this.job_model.findOne({
        _id: request.params._id
      })
        .populate('category', '_id name')
        .populate('sub_category', '_id name')
        .lean()

      if (!item)
        return response.status(400).json({ message: 'Item does not exist' })

      let is_applied = await this.job_applicant_model.findOne({ job: item._id, employee: request.user._id })
      item.is_applied = (is_applied) ? true : false
      item.application_detail = is_applied

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
      let allowed = permissions.can('jobs.update')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })

      request.body.updated_by = request.user.email

      let updated = await this.job_model.findOneAndUpdate(
        { _id: request.params._id },
        {
          $set: request.body
        },
        { new: true, useFindAndModify: false }
      )

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
      let allowed = permissions.can('jobs.destroy')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })

      /** Request validation */

      let deleted = await this.job_model.findOne({
        _id: request.params._id
      })

      if (!deleted) {
        return response.status(400).json({ message: 'Item does not exists' })
      }

      await this.job_model.findOneAndUpdate(
        { _id: request.params._id },
        {
          $set: { deleted_at: new Date() }
        },
        { new: true, useFindAndModify: false }
      )

      await this.job_applicant_model.deleteMany({
        job: deleted._id
      })

      // deleted.remove()

      /** Response */
      return response.status(200).json({ message: 'Job has been deleted successfully' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
}
