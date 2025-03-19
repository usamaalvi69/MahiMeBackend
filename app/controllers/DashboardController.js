const mongoose = require('mongoose')
/**
 * @class DashboardController
 * @description Handles all user related CRUD operations
 */
module.exports = class DashboardController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.job_model = app.get('JobModel')
    this.job_applicant_model = app.get('JobApplicantModel')
    this.support_ticket_model = app.get('SupportTicketModel')
    this.user_model = app.get('UserModel')


  }

  /**
   * @method employerStats
   * @description Returns stats for employer
   * @param {object} request
   * @param {object} response
   */
  async employerStats(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("menu.dashboard")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      if (request.user.type != 'employer') return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      let total_jobs = await this.job_model.countDocuments({ employer: request.user._id,deleted_at:null })
      let open_jobs = await this.job_model.countDocuments({ status: 'open', employer: request.user._id,deleted_at:null })
      let closed_jobs = await this.job_model.countDocuments({ status: 'closed', employer: request.user._id,deleted_at:null })
      let total_applicants = await this.job_applicant_model.countDocuments({ employer: request.user._id })

      /** Response */
      return response.status(200).json({
        total_jobs,
        open_jobs,
        closed_jobs,
        total_applicants
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
  * @method adminStats
  * @description Returns stats for admin
  * @param {object} request
  * @param {object} response
  */
  async adminStats(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("menu.dashboard")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      if (request.user.type != 'admin') return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      let total_jobs = await this.job_model.countDocuments({deleted_at:null})
      let open_jobs = await this.job_model.countDocuments({ status: 'open',deleted_at:null })
      let closed_jobs = await this.job_model.countDocuments({ status: 'closed',deleted_at:null })
      let total_applicants = await this.job_applicant_model.countDocuments({})
      let open_support_tickets = await this.support_ticket_model.countDocuments({ status: 'open' })
      let total_employee = await this.user_model.countDocuments({ type: 'employee' })
      let total_employer = await this.user_model.countDocuments({ type: 'employer' })

      /** Response */
      return response.status(200).json({
        total_jobs,
        open_jobs,
        closed_jobs,
        total_applicants,
        open_support_tickets,
        total_employee,
        total_employer
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
