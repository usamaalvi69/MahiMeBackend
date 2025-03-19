/**
 * Container Class
 * @description Container allows to attach or preload dependencies
 */
module.exports = class container {
  constructor(app) {

    app.controller('AuthController').inject(['models.UserModel', 'helpers.CryptHelper', 'helpers.GeneralHelper'])
    app.controller('CategoryController').inject(['models.CategoryModel','models.SubCategoryModel'])
    app.controller('DocumentController').inject(['models.DocumentModel', 'helpers.UploadHelper'])
    app.controller('EmployeeController').inject(['models.UserModel', 'helpers.CryptHelper', 'helpers.GeneralHelper','models.FavouriteModel','models.RoleModel'])
    app.controller('EmployerController').inject(['models.UserModel', 'helpers.CryptHelper', 'helpers.GeneralHelper','models.RoleModel'])
    app.controller('UserController').inject(['models.UserModel', 'helpers.CryptHelper', 'helpers.GeneralHelper'])
    app.controller('FavouriteController').inject(['models.FavouriteModel','models.RoleModel','models.JobApplicantModel'])
    app.controller('JobController').inject(['models.JobModel','models.JobApplicantModel','helpers.GeneralHelper'])
    app.controller('MobileSettingController').inject(['models.MobileSettingModel'])
    app.controller('NotificationController').inject(['models.NotificationModel'])
    app.controller('RoleController').inject(['models.UserModel','models.RoleModel'])
    app.controller('SettingController').inject(['models.SettingModel'])
    app.controller('SupportTicketController').inject(['models.SupportTicketModel','models.UserModel','helpers.GeneralHelper','models.NotificationModel'])
    app.controller('JobRecommendationController').inject(['models.UserModel','models.JobModel','models.FavouriteModel','models.JobApplicantModel'])
    app.controller('JobApplicantController').inject(['models.JobApplicantModel','models.JobModel','helpers.GeneralHelper', 'models.NotificationModel','models.UserModel'])
    app.controller('DashboardController').inject(['models.JobModel','models.JobApplicantModel','models.SupportTicketModel','models.UserModel'])
    app.controller('WorkRequestController').inject(['models.WorkRequestModel','models.JobModel','models.JobApplicantModel','helpers.GeneralHelper'])
    app.controller('RatingController').inject(['models.RatingModel', 'models.JobApplicantModel','models.NotificationModel','models.UserModel','helpers.GeneralHelper'])


  }
}
