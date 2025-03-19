/**
 * @class SchedulerService
 * @description SchedulerService schedules jobs based on defined interval.
 * @howTo
 * - npm install --save node-cron
 * - app/hooks.js > boot() > app.loadService('app.services.SchedulerService')
 */
module.exports = class SchedulerService extends ScheduleRunner {

    constructor(app) {
        super()
        // this.runBySeconds(resolve('app.jobs.JobStatus'), 10)
        this.runManual(resolve('app.jobs.JobStatus'), '0 12 * * *') // Run every day at 12:00

        /** 
         * Start the SchedulerService
        */
        this.start()
    }

}