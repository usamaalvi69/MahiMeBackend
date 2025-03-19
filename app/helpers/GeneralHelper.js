const mongoose = require('mongoose')
const momentTimeZone = require('moment-timezone')

/**
 * @class GeneralHelper
 * @description Upload files helper
 */
module.exports = class GeneralHelper {
  constructor() {
    this.setting_model = resolveOnce('app.models.SettingModel')
  }

  /**
   * @method getDates
   * @description will return today start and last date
   */
  async getDates() {
    const utcTime = moment.utc(new Date())
    const nzTimeZone = 'Pacific/Auckland'
    const nzStartTime = utcTime.clone().tz(nzTimeZone)
    const nzEndTime = utcTime.clone().tz(nzTimeZone)
    let start_date = nzStartTime.startOf('day')
    let end_date = nzEndTime.endOf('day')
    return { start_date: start_date, end_date: end_date }
  }

  /**
   * @method getNZDates
   * @description will convert start and last date to NZ dates
   */
  async getNZDates(utc_start_date, utc_end_date) {
    const utcStartTime = moment.utc(new Date(utc_start_date))
    const utcEndTime = moment.utc(new Date(utc_end_date))
    const nzTimeZone = 'Pacific/Auckland'
    const nzStartTime = utcStartTime.clone().tz(nzTimeZone)
    let start_date = nzStartTime.startOf('day')
    let end_date = utcEndTime.clone().tz(nzTimeZone)
    return { start_date: start_date, end_date: end_date }
  }

  /**
   * @method nzDate
   * @description will convert given date to NZ date
   */
  async convertToNzDate(utc_date) {
    const utcTime = moment.utc(new Date(utc_date))
    const nzTimeZone = 'Pacific/Auckland'
    const nzDateTime = utcTime.clone().tz(nzTimeZone)
    return nzDateTime
  }

  async generateComplexPassword() {
    const crypto = require('crypto');
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const allChars = uppercase + lowercase + digits + specialChars;
    const passwordLength = 12;
    let password = '';

    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    const remainingLength = passwordLength - 4
    const randomBytes = crypto.randomBytes(remainingLength)

    for (let i = 0; i < remainingLength; i++) {
      const randomValue = randomBytes[i] % allChars.length
      password += allChars[randomValue]
    }
    password = password.split('').sort(() => 0.5 - Math.random()).join('')

    return password;
  }

  /**
   * @method getSettingsKeys
   * @description get keys from settings table
   * @param {string} subject
   */
  async getSettingsKeys(meta_keys) {
    let settings = await this.setting_model.find({
      meta_key: { $in: meta_keys }
    })
    if (settings == '') return ''
    const setting_data = {}
    settings.map(
      setting => (setting_data[setting['meta_key']] = setting['meta_values'])
    )
    return setting_data
  }

  /**
  * @method updateSettingsKeys
  * @description update key from settings table
  */
  async updateSettingsKeys(meta_key, meta_value) {
    await this.setting_model.findOneAndUpdate(
      { meta_key: meta_key },
      {
        $set: { meta_values: meta_value }
      },
      { new: true, useFindAndModify: false }
    )
  }

}
