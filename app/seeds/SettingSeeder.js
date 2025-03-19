module.exports = class SettingSeeder {

    constructor() {
        this.setting_model = resolveOnce('app.models.SettingModel')
    }

    async up() {

        let settings_data = [
            {
                'meta_key': 'job_id',
                'meta_values': 1
            },
            {
                'meta_key': 'job_search_radius',
                'meta_values': 50
            },
        ]

        let cerated = false
        for (let i = 0; i < settings_data.length; i++) {

            let settings = await this.setting_model.findOne({ 'meta_key': settings_data[i].meta_key })

            if (!settings) {
                let created = await this.setting_model.create(settings_data[i])
                if (created) {
                    cerated = true
                }
            }
        }

        if (cerated) {
            console.log('Setting seed successfully')
        }
    }
}