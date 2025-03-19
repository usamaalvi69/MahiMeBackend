const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

/**
 * @description Hooks which can interact with core functionality and flow
 */
module.exports = class hooks {
  constructor() {}

  /**
   * Boot sequence
   */
  async boot(app) {
    // Basic file uploading
    const file_upload = require("express-fileupload")
    app.use(file_upload())

    // moment
    global.moment = require('moment')

    /**
     * Loading services based on configs/service.js
     */
     let service_configs = Config.getJson('app.configs', 'services')
     for(let key in service_configs) {
      if(service_configs[key].enabled) {
        console.log('* ' + service_configs[key].name)
        if(service_configs[key].alias !== undefined && service_configs[key].alias) {
          app.loadService(service_configs[key].alias, service_configs[key].link)
        }else{
          app.loadService(key, service_configs[key].link)
        }
      }
    }

    /**
     * Presisting public media folders
     */
    let public_configs = Config.getJson('app.configs', 'public')
    for(let key in public_configs) {
      if (!fs.existsSync(root_directory + public_configs[key].link)) {
        fs.mkdirSync(root_directory + public_configs[key].link)
      }   
    }
  }

  /**
   * Common server configs
   */
  server(app) {
    // Cross origin requests
    app.use(cors())

    // Render html
    app.engine("html", require("ejs").renderFile)

    // Response parsing & limits
    app.use(bodyParser.text({ type: "text/*" }))
    app.use(express.urlencoded({ extended: false, limit: "1000mb" }))
    app.use(express.json({ limit: "1000mb" }))
  }

  /**
   * Common routing middleware
   */
  routing(app, request, response) {

    /** Custom Validations */
    let validation_configs = Config.getJson('validations')
    // console.log('Loading custom validations ...')
    for(let key in validation_configs) {
      if(validation_configs[key].enabled) {
        // console.log('* ' + validation_configs[key].name)
        resolveOnce(validation_configs[key].link).setup(request)
      }
    }

    /** Custom Filters */
    let filter_config = Config.getJson('filters')
    // console.log('Loading custom filters ...')
    for(let key in filter_config) {
      if(filter_config[key].enabled) {
        // console.log('* ' + filter_config[key].name)
        resolveOnce(filter_config[key].link).setup(request)
      }
    }

    // resolveOnce('app.validations.Arrays').setup(request)
    // resolveOnce('app.validations.Numbers').setup(request)

    /** User defined routing */
    app.routing(request, response)
  }
};
