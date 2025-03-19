/**
 * @class JobStatus
 * @description Job to update job status
 */
module.exports = class JobStatus {

    constructor() {
        this.job_model = resolveOnce('app.models.JobModel')
        this.job_applicant_model = resolveOnce('app.models.JobApplicantModel')
        this.notification_model = resolveOnce('app.models.NotificationModel')
    }

    /**
     * @method run
     * @description Run automatically triggered when job runs
     */
    async run() {
        let jobs = await this.job_model.find({ status: { $in: ['open', 'confirmed'] } })
        for (let job of jobs) {
            let job_dates = job.time_slots.dates
            let closed = 0
            for (let date of job_dates) {
                let job_date = new Date(date).getTime()
                let current_date = new Date().getTime()
                if (job_date > current_date) {
                    closed++
                }
            }
            if (closed == 0) {
                let job_applicant = await this.job_applicant_model.findOne({ job: job._id, status: 'confirmed' }).populate('employee').populate('employer').populate('job')
                if (job_applicant) {
                    job_applicant.status = 'completed'
                    await job_applicant.save()
                    await this.pushNotification(job_applicant.employee, 'Rating / Review for employer ' + job_applicant.employer.business_name , job_applicant.job.title + ' Job has been completed',job_applicant._id)
                    await this.pushNotification(job_applicant.employer, 'Rating / Review for employee ' + job_applicant.employer.first_name + ' ' + job_applicant.employer.last_name , job_applicant.job.title + ' Job has been completed',job_applicant._id)
                    // push notification to employer and employee here

                }
                let updated_status = (job.status == 'confirmed') ? 'completed' : 'closed'
                job.status = updated_status
                await job.save()
            }

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
              { application_id: path_id }
    
            )
          }
          let path = ""
          let created = await this.notification_model.create({
            title: title,
            message: message,
            to_user: user_id._id,
            url: path,
            notification_redirect_id: path_id,
            type:'rating'
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