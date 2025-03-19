const fs = require("fs")

module.exports = class make {

    /**
     * @description Any declarations or contructor logic goes here
     */
    setup(callback) {
        if (callback !== undefined) callback()
    }

    /**
     * @description Default method, which automatically executed
     */
    index() {

    }

    /**
     * @description Logic you want to execute before any method is called from this command
     */
    pre() {

    }

    /**
     * @description Logic you want to execute after any method is called from this command
     */
    post() {

    }

    async service(name) {
        if (name) {
            if (fs.existsSync('app/services/' + name + 'Service.js')) {
                console.log('`' + name + 'Service` already exists')
                return
            }
            try {
                await fs.promises.writeFile('app/services/' + name + 'Service.js',
                    `
/**
 * @class ` + name + `Service
 * @description Handles all ` + name + ` related services
 */
module.exports = class ` + name + `Service {

    /**
     * @constructor
     * @description Constructor method
     */
    constructor(app) {
        if(Config.app('debug')) console.log("* ` + name + `Service")
    }



    /**
     * Your methods goes here
     */
    async todo() {
        
    }

}
`
                )

                console.log('`' + name + 'Service` created successfully')
            } catch (err) {
                if (err) console.log(err)
            }
        }
    }

    async controller(name) {
        if (name) {
            if (fs.existsSync('app/controllers/' + name + 'Controller.js')) {
                console.log('`' + name + 'Controller` already exists')
                return
            }
            try {
                await fs.promises.writeFile('app/controllers/' + name + 'Controller.js',
                    `
/**
 * @class ` + name + `Controller
 * @description Handles all ` + name + ` related CRUD operations
 */
module.exports = class ` + name + `Controller {

    /**
     * @constructor
     * @description Handles autoloaded dependencies
     */
    constructor(app) {
        
    }

    /**
     * @method index
     * @description Returns list of 
     * @param {object} request 
     * @param {object} response 
     * @return {object} response
     */
    async index(request, response) {
        
    }

    /**
     * @method store
     * @description Create new 
     * @param {object} request 
     * @param {object} response 
     * @return {object} response
     */
    async store(request, response) {
        
    }

    /**
     * @method show
     * @description Returns single 
     * @param {object} request 
     * @param {object} response 
     * @return {object} response
     */
    async show(request, response) {
        
    }

    /**
     * @method update
     * @description Update 
     * @param {object} request 
     * @param {object} response 
     * @return {object} response
     */
    async update(request, response) {
        
    }

    /**
     * @method destroy
     * @description delete 
     * @param {object} request 
     * @param {object} response 
     * @return {object} response
     */
    async destroy(request, response) {
        
    }

}
`
                )
                console.log('`' + name + 'Controller` created successfully')
            } catch (err) {
                if (err) console.log(err)
            }
        }
    }

    async model(name, collection) {
        if (name) {
            if (fs.existsSync('app/models/' + name + 'Model.js')) {
                console.log('`' + name + 'Model` already exists')
                return
            }
            try {
                await fs.promises.writeFile('app/models/' + name + 'Model.js',
                    `
const mongoose = require('mongoose')

/**
 * @class ` + name + `Model
 * @description Creates a mongoose wallet model and defines its schema
 */
module.exports = class ` + name + `Model {

    /**
     * @constructor
     * @returns {mongoose.model} ` + name + `Model
     */
    constructor() {
        return mongoose.model('` + collection + `', Schema, '` + collection + `')
    }

}

/**
 * Mongoose Schema
 */
const Schema = mongoose.Schema({

}, { versionKey: false, timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
`
                )
                console.log('`' + name + 'Model` created successfully')
            } catch (err) {
                if (err) console.log(err)
            }
        }
    }

    async cm(name, collection) {
        await this.controller(name)
        await this.model(name, collection)
    }

}