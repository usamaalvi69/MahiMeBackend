module.exports = class Config {

    constructor() {
        this.app_configs = this.getJson('app.configs', 'app')
        this.auth_configs = this.getJson('app.configs', 'auth')
        this.database_configs = this.getJson('app.configs', 'database')
        this.email_configs = this.getJson('app.configs', 'email')
        this.service_configs = this.getJson('app.configs', 'services')
        this.route_configs = this.getJson('app.configs', 'routes')
    }

    app(key) {
        // console.log('@Config.app() > ', key)
        let value = ''
        // key.split('.').forEach(k => {
        //     if (value == '') {
        //         console.log('key: ', k)
        //         value = this.app_configs[k]
        //     } else {
        //         value = value[k]
        //     }
        // })
        // console.log('** ', value)
        // value = this.render(value)
        // console.log('**** ', value)
        value = this.application(key)
        if (value === undefined || value == null || value == '') value = this.database(key)
        if (value === undefined || value == null || value == '') value = this.service(key)
        if (value === undefined || value == null || value == '') value = this.auth(key)
        if (value === undefined || value == null || value == '') value = this.email(key)
        return value
    }

    render(value) {
        let varValue = value
        if (
            value['get'] !== undefined &&
            Object.keys(process.env).includes(value.get)
        ) {
            varValue = process.env[value.get]
        } else if (value.value !== undefined) {
            varValue = value.value
        }

        return varValue
    }

    application(key) {
        let value = ''
        key.split('.').forEach(k => {
            if (value == '') {
                if (this.app_configs[k] === undefined) {
                    // console.log('> WARN: Config not found {database.' + key + '}')
                    return
                }
                value = this.app_configs[k]
            } else {
                value = value[k]
            }
        })
        return this.render(value)
    }

    database(key) {
        let value = ''
        key.split('.').forEach(k => {
            if (value == '') {
                if (this.database_configs[k] === undefined) {
                    // console.log('> WARN: Config not found {database.' + key + '}')
                    return
                }
                value = this.database_configs[k]
            } else {
                value = value[k]
            }
        })
        return this.render(value)
    }

    service(key) {
        let value = ''
        key.split('.').forEach(k => {
            if (value == '') {
                if (this.service_configs[k] === undefined) {
                    // console.log('> WARN: Config not found {service.' + key + '}')
                    return
                }
                value = this.service_configs[k]
            } else {
                value = value[k]
            }
        })
        return value
    }

    auth(key) {
        let value = ''
        key.split('.').forEach(k => {
            if (value == '') {
                if (this.auth_configs[k] === undefined) {
                    // console.log('> WARN: Config not found {auth.' + key + '}')
                    return
                }
                value = this.auth_configs[k]
            } else {
                value = value[k]
            }
        })
        return this.render(value)
    }

    email(key) {
        let value = ''
        key.split('.').forEach(k => {
            if (value == '') {
                if (this.email_configs[k] === undefined) {
                    // console.log('> WARN: Config not found {email.' + key + '}')
                    return
                }
                value = this.email_configs[k]
            } else {
                value = value[k]
            }
        })
        return this.render(value)
    }

    routes() {
        let routes = []
        for (let key in this.route_configs) {
            routes.push(this.route_configs[key])
        }
        return routes
    }

    get(key) {
        let value = ''
        let keys = key.split('.')
        let configs = {}
        if (keys.length > 1) {
            configs = use('app.configs.' + keys[0])
        }
        keys.forEach(k => {
            if (value == '') {
                value = configs[k]
            } else {
                value = value[k]
            }
        })
        return this.render(value)
    }

    getJson(path, key = null) {
        let value = ''
        if (key == null) {
            value = readJson('/app/configs/' + path)
            return value
        }
        let keys = key.split('.')
        let configs = {}
        if (keys.length > 0) {
            configs = readJson(path + '.' + keys[0])
        }
        if (keys.length > 1) {
            keys.forEach(k => {
                if (value == '') {
                    value = configs[k]
                } else {
                    value = value[k]
                }
            })
        } else {
            value = configs
        }
        return value
    }

}