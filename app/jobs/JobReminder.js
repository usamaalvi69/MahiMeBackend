/**
 * @class JobStatus
 * @description Job to update job status
 */
module.exports = class JobStatus {

    constructor() {
        this.job_model = resolveOnce('app.models.JobModel')

    }

    /**
     * @method run
     * @description Run automatically triggered when job runs
     */
    async run() {

        let jobs = await this.job_model.findOne({ status: 'open' })
        for (let job of jobs) {
            let job_dates = job.time_slots.dates
            let closed = 0
            let dates = work_request.job.time_slots.dates
            let computed_date = []
            for (let i = 0; i < dates.length; i++) {
                let single_date = await this.general_helper.convertToNzDate(dates[i])
                single_date = moment(single_date).format('YYYY-MM-DD')
                // if(i > 0){
                // computed_date += ', '
                // }
                // computed_date += single_date
                computed_date.push(single_date)
            }
            let template = await view().render('templates.employee/new_workrequest', {
                name: `${work_request.employee.first_name} ${work_request.employee.last_name}`,
                employee: work_request.employee,
                employer: work_request.employer,
                job: work_request.job,
                dates: computed_date,
                link: `${process.env.CLIENT_URL}/work-request/${work_request._id}`
            })
            await mail.send(template, `Upcoming Job Reminder: ${work_request.job.title}`, work_request.employee.email)

        }
    }

}