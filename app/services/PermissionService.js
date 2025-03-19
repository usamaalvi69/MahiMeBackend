/**
 * @class PermissionService
 * @description Service for auto logging exceptions
 * @howTo
 * - npm install --save winston
 * - app/hooks.js > boot() > app.loadService('permissions', 'app.services.PermissionService')
 */
module.exports = class PermissionService {

  constructor(app) {
    if (Config.app('debug')) console.log("* PermissionService")
    this.all = [
      /**
       * permissions
       */
      "menu.jobs", "menu.categories", "menu.users", "menu.roles", "menu.shortlists", "menu.employees", "menu.employers", "menu.support_tickets", "menu.notifications","menu.profile",
      "jobs.index","jobs.store","jobs.update","jobs.show","jobs.destroy",
      "job_applicant.index","job_applicant.getAppliedJobs","job_applicant.store","job_applicant.update","job_applicant.show","job_applicant.destroy",
      "employees.index","employees.store","employees.update","employees.show","employees.destroy",
      "employers.index","employers.store","employers.update","employers.show","employers.destroy",
      "categories.index","categories.store","categories.update","categories.show","categories.destroy",
      "supportTickets.index","supportTickets.store","supportTickets.update","supportTickets.show","supportTickets.destroy",
      "workRequest.index","workRequest.store","workRequest.update","workRequest.show","workRequest.destroy",
      "rating.index","rating.store","rating.show",
      "shortlist.index","shortlist.store","shortlist.destroy",
      "employees.listing","employees.detail",
      "jobs.listing","jobs.detail",
      "profile.update","profile.show",

    ]
    // "roles.index","roles.store","roles.update","roles.show","roles.destroy",
    this.current_permissions = [] // current logged in user permissions
    this.current_user_id = '' // current logged in user id
  }

  /**
   * @method populate
   * @description Populate the permissions of assgined roles to current logged-in user
   * @param {Object} user 
   * @returns null
   */
  async populate(user) {
    // Setting current logged in user id
    this.current_user_id = user._id

    // Skip repopulating from database, if already populated
    if (this.current_permissions.length > 0) return

    // Resolving user model to get roles & permissions
    let user_model = resolveOnce('app.models.UserModel')
    let data = await user_model.findOne({ _id: user._id }).populate('roles')

    // Collecting permission sets
    let permission_sets = []
    data.roles.forEach(role => {
      permission_sets = permission_sets.concat(role.permissions)
    })

    // Assigning current permissions to logged in user
    if (user._id in this.current_permissions) {
      this.current_permissions[user._id] = permission_sets
    } else {
      this.current_permissions[user._id] = []
      this.current_permissions[user._id] = permission_sets
    }
    return this.current_permissions
  }

  /**
   * @method can
   * @description See if user have provided permission assigned to account
   * @param {String} permission 
   * @returns {Boolean}
   */
  can(permission) {
    if (!this.current_user_id) return false
    if (!this.current_permissions) return false
    if (this.current_permissions[this.current_user_id] === undefined) return false
    if (this.current_permissions[this.current_user_id].indexOf(permission) > -1) return true
    return false
  }

}
