const os = require('os')
global.__mongoose = require('mongoose')

/**
 * @class MongoService
 * @description Basic mongo service
 * @howTo
 * - npm install --save mongoose os
 * - app/hooks.js > 
 */
module.exports = class MongoService {

    constructor(app) {
        let secure = Config.database(Config.database('default') + '.ssl')
        let host = Config.database(Config.database('default') + '.host')
        let port = Config.database(Config.database('default') + '.port')
        let name = Config.database(Config.database('default') + '.name')
        let username = Config.database(Config.database('default') + '.username')
        let password = Config.database(Config.database('default') + '.password')
        let connection_uri = `mongodb://${host}:${port}/${name}`

        let options = {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            poolSize: os.cpus().length * 2 + 1
        }
        if (username && password) {
            options = {
                auth: {
                    "authSource": name
                },
                user: username,
                pass: password,
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useCreateIndex: true,
                poolSize: os.cpus().length * 2 + 1,
                retryWrites: false
            }
        }
        if (secure) {
            options.ssl = true
            options.sslValidate = false

        }
        
        this.connect(connection_uri, options, () => {
            this.loadSchema()
        })
    }

    loadSchema() {
        fs.readdir(root_directory + '/app/models/', (err, files) => {
            if (Config.app('debug') == 'true') console.log('Loading database schema ...')
            files.forEach(file => {
                file = file.replace('.js', '')
                resolveOnce('app.models.' + file)
                if (Config.app('debug') == 'true') console.log('* ' + file)
            })
        })
    }

    connect(connection_uri, options, callback) {
        __mongoose.connect(connection_uri, options)
        __mongoose.connection.on('connected', () => {
            if (Config.app('debug') == 'true') console.log(`Database connected`)
            callback()
        })
        __mongoose.connection.on('disconnected', function () {
            if (Config.app('debug') == 'true') console.log('Database disconnected')
        })
    }

}