const cron = require('node-cron')

module.exports = class ScheduleRunner {

    constructor() {
        this.instances = []
    }

    start() {
        if(!Config.service('cron.enabled')) {
            console.log('> WARN: cron is not enabled from configs')
            return
        }
        
        let me = this
        cron.schedule('* * * * * *', () => {
            me.instances.forEach(instance => {
                if(instance.type == 'manual') {
                    // skip
                }else{
                    if (instance.current == instance.interval) {
                        instance.current = 1
                        instance.target.run()
                    } else {
                        instance.current++
                    }
                }
            })
        })

        me.instances.forEach(instance => {
            if(instance.type == 'manual') {
                cron.schedule(instance.interval, () => {
                    instance.target.run()
                })
            }
        })
    }

    runBySeconds(class_instance, seconds) {
        this.instances.push({ target: class_instance, type: 'seconds', interval: seconds, current: 1 })
    }

    runByMinutes(class_instance, minutes) {
        this.instances.push({ target: class_instance, type: 'minutes', interval: (minutes * 60), current: 1 })
    }

    runByHours(class_instance, hours) {
        this.instances.push({ target: class_instance, type: 'hours', interval: (hours * 60 * 60), current: 1 })
    }

    runByDays(class_instance, days) {
        this.instances.push({ target: class_instance, type: 'days', interval: (days * 60 * 60 * 24), current: 1 })
    }

    runManual(class_instance, cron_string) {
        this.instances.push({ target: class_instance, type: 'manual', interval: cron_string, current: 1 })
    }

}