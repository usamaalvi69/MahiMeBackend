/**
 * Api routes
 * @description All api related routes can be defined here accordingly
 */

/**
 * @prefix /api/v1
 * @description Prefix {/api/v1} will be prepended all routes urls
 */

/**
 * You can use a prefix for every route here
 */
// Router.prefix('/api/v1')

/** 
 * Test route for check if server is responding
 */
Router.get('/test', (request, response) => {
  return response.status(200).send({ message: 'OK' })
})
Router.get('/', (request, response) => {
  return response.status(200).send({ message: 'OK' })
})



/** Open auth routes */
Router.post('/check-duplicate-email', 'UserController@checkDuplicateEmail')
Router.post('/add-pin', 'UserController@addPin')
Router.post('/login', 'AuthController@login')
Router.get('/logs', 'AuthController@logs')
Router.get('/logs/clear', 'AuthController@clearlogs')
Router.post('/auth/user-forget-password', 'AuthController@userForgetPassword')
Router.get('/auth/verify-pin/:_id/:auth_pin', 'AuthController@verifyPin')
Router.post('/user-forget-pincode', 'AuthController@userForgetPinCode')
Router.post('/auth/user-otp', 'AuthController@verifyUserOtp')
Router.post('/auth/forget-password', 'AuthController@forgetPassword')
Router.post('/auth/reset-password/:token', 'AuthController@resetPassword')
Router.get('/user', 'UserController@index')
Router.get('/doc', 'DocumentController@index')
Router.post('/upload-image', 'DocumentController@imageUploader')
Router.get('/get-uploaded-image/:name', 'DocumentController@getUploadedImage')
Router.delete('/delete-image', 'DocumentController@destroy')
Router.get('/setting_by_key/:key', 'SettingController@settingByKey')
Router.get('/mobile-setting', 'MobileSettingController@index')
Router.get('/mobile-setting/:_id', 'MobileSettingController@show')

Router.post('/apple-identity', 'AppleIdentificatoinController@store')
Router.get('/apple-identity/:token', 'AppleIdentificatoinController@show')

Router.post('/employee', 'EmployeeController@store')
Router.post('/employer', 'EmployerController@store')
Router.get('/fe_category', 'CategoryController@feIndex')

Router.post('/auth/user-forget-pin', 'AuthController@userForgetPin')
Router.post('/auth/user-pin-otp', 'AuthController@verifyUserPinOtp')
Router.post('/auth/reset-auth-pin/:token', 'AuthController@resetAuthPin')

/**
 * @middleware app.middlewares.passport
 * @description Passport middleware will be applied to all routes inside callback function
 */
Router.middleware(['app.middlewares.passport'], (_router) => {
  _router.post('/check-email', 'UserController@checkEmail')
  _router.post('/auth/change-password', 'AuthController@changePassword')
  _router.put('/auth/change-auth-pin/:_id', 'AuthController@changeAuthPin')
  _router.post("/remove-token", "AuthController@RemoveFirebaseToken")
  _router.get('/employer-stats', 'DashboardController@employerStats')
  _router.get('/admin-stats', 'DashboardController@adminStats')
  _router.get('/user', 'UserController@index')
  _router.get('/user', 'UserController@index')
  _router.put('/user/:_id', 'UserController@update')
  _router.get('/user/:_id', 'UserController@show')
  _router.delete('/user/:_id', 'UserController@destroy')
  _router.get('/employee', 'EmployeeController@index')
  _router.get('/employee/:_id', 'EmployeeController@show')
  _router.put('/employee/:_id', 'EmployeeController@update')
  _router.delete('/employee/:_id', 'EmployeeController@destroy')
  _router.get('/fe-employers', 'EmployerController@feEmployers')
  _router.get('/employer', 'EmployerController@index')
  _router.get('/employer/:_id', 'EmployerController@show')
  _router.put('/employer/:_id', 'EmployerController@update')
  _router.delete('/employer/:_id', 'EmployerController@destroy')
  _router.get('/category', 'CategoryController@index')
  _router.post('/category', 'CategoryController@store')
  _router.get('/category/:_id', 'CategoryController@show')
  _router.put('/category/:_id', 'CategoryController@update')
  _router.delete('/category/:_id', 'CategoryController@destroy')

  /** Sub Categories Routes */
  _router.get('/sub_category', 'SubCategoryController@index')
  _router.post('/sub_category', 'SubCategoryController@store')
  _router.get('/sub_category/:_id', 'SubCategoryController@show')
  _router.put('/sub_category/:_id', 'SubCategoryController@update')
  _router.delete('/sub_category/:_id', 'SubCategoryController@destroy')

  /** Favourite Routes */
  _router.get('/favourites', 'FavouriteController@index')
  _router.post('/add-favourite', 'FavouriteController@addFavourite')
  _router.post('/remove-favourite', 'FavouriteController@removeFavourite')
  _router.get('/check-favourite', 'FavouriteController@checkFavourite')

  /**  SupportTicket Routes */
  _router.get('/support-ticket', 'SupportTicketController@index')
  _router.post('/support-ticket', 'SupportTicketController@store')
  _router.get('/support-ticket/:_id', 'SupportTicketController@show')
  _router.put('/support-ticket/:_id', 'SupportTicketController@update')
  _router.delete('/support-ticket/:_id', 'SupportTicketController@destroy')
  _router.put(
    '/update-message-status',
    'SupportTicketController@updateMessageStatus'
  )

  /**  Employer & admin Job Routes */
  _router.get('/get_job_id', 'JobController@getJobId')
  _router.get('/job', 'JobController@index')
  _router.post('/job', 'JobController@store')
  _router.get('/job/:_id', 'JobController@show')
  _router.put('/job/:_id', 'JobController@update')
  _router.delete('/job/:_id', 'JobController@destroy')
  _router.post('/recommended-jobs', 'JobRecommendationController@index')
  _router.post('/recommended-employees', 'EmployeeRecommendationController@index')


  /**  Job Applicant Routes */
  _router.get('/job-applicant', 'JobApplicantController@index')
  _router.post('/job-applicant', 'JobApplicantController@store')
  _router.get('/job-applicant/:_id', 'JobApplicantController@show')
  _router.put('/job-applicant/:_id', 'JobApplicantController@update')
  _router.delete('/job-applicant/:_id', 'JobApplicantController@destroy')
  _router.get('/employee-applied-jobs/:employee_id', 'JobApplicantController@employeeAppliedJobs')
  _router.get('/get-rating/:user_id', 'JobApplicantController@getRating')
  _router.get('/employer-applicants/:user_id', 'JobApplicantController@employerApplicants')


  _router.get('/setting', 'SettingController@index')
  _router.get('/setting/:_id', 'SettingController@show')
  _router.post('/setting', 'SettingController@store')
  _router.delete('/setting/:_id', 'SettingController@destroy')
  _router.put('/setting/:_id', 'SettingController@update')
  _router.post('/mobile-setting', 'MobileSettingController@store')
  _router.delete('/mobile-setting/:_id', 'MobileSettingController@destroy')
  _router.put('/mobile-setting/:_id', 'MobileSettingController@update')

  /**  Notification Routes */
  _router.get('/notification', 'NotificationController@index')
  _router.post('/notification', 'NotificationController@store')
  _router.get('/notification/:_id', 'NotificationController@show')
  _router.put('/notification/:_id', 'NotificationController@update')
  _router.delete('/notification/:_id', 'NotificationController@destroy')
  _router.get('/unread-notification', 'NotificationController@unreadNotifications')
  _router.get('/readall-notification', 'NotificationController@readAllNotification')

  _router.get('/get-jobs-for-request/:employee_id', 'WorkRequestController@getJobsForRequest')
  _router.get('/work-request', 'WorkRequestController@index')
  _router.post('/work-request', 'WorkRequestController@store')
  _router.put('/work-request/:_id', 'WorkRequestController@update')

  /** Rating Routes */
  _router.get('/rating', 'RatingController@index')
  _router.get('/avg-rating', 'RatingController@avgRate')
  _router.post('/rating', 'RatingController@store')
  _router.get('/rating/:_id', 'RatingController@show')
  _router.put('/rating/:_id', 'RatingController@update')
  _router.delete('/rating/:_id', 'RatingController@destroy')


  _router.get('/roles', 'RoleController@index')
  _router.get('/role-permissions', 'RoleController@permissions')
  _router.post('/roles', 'RoleController@store')
  _router.get('/roles/:_id', 'RoleController@show')
  _router.put('/roles/:_id', 'RoleController@update')
  _router.delete('/roles/:_id', 'RoleController@destroy')


})


