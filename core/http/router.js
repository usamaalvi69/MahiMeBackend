/**
 * @class Router
 * @description handles all routing logic of framework using expressjs
 */
module.exports = class Router {

    /**
     * @method prefix
     * @description Set a prefix for all route urls
     * @param {String} name 
     */
    prefix(name) {
        this.__prefix = name
    }

    /**
     * @method setMiddlewares
     * @description Assign middlewares to router
     * @param {Array} middlewares 
     */
    setMiddlewares(middlewares) {
        this.middlewares = middlewares
    }

    /**
     * @method setHook
     * @description Assign a hook/boot file to router for preloading services and pre-setup calls
     * @param {Class} hook 
     */
    setHook(hook) {
        this.hook = hook
    }

    /**
     * @method server
     * @description set an express server instance to router
     * @param {Class} express_app 
     */
    server(express_app) {
        this.express_app = express_app
        this.__prefix = ''
        this.middlewares = []
    }

    /**
     * @method middleware
     * @description Grouping routes for middlewares
     * @param {Array} middleware_array 
     * @param {Function} callback 
     */
    middleware(middleware_array, callback) {
        this.setMiddlewares(middleware_array)
        callback(this)
        this.setMiddlewares([])
    }

    /**
     * @method getResolvedMiddlewares
     * @description Get list of all resolved middlewares classe's index methods
     */
    getResolvedMiddlewares() {
        let resolvedMiddlewares = []
        for (let i = 0; i < this.middlewares.length; i++) {
            let resolved_middlware = resolve(this.middlewares[i])
            if (resolved_middlware['index'] !== undefined) {
                resolvedMiddlewares.push(resolved_middlware['index'])
            }
        }
        return resolvedMiddlewares
    }

    /**
     * @method get
     * @description Get method call for router
     * @param {String} url 
     * @param {Function} target
     */
    get(url, target) {
        if (this.__prefix != '') url = this.__prefix + url
        if (this.routes === undefined) this.routes = []
        this.routes.push({ url: url, target: target, method: 'GET', middlewares: [] })
        this.express_app.get(url, ...this.getResolvedMiddlewares(), (req, res, next) => {
            __response = res
            req.validate = resolve('core.http.validator', res).validate
            req.define = resolve('core.http.validator', res).define
            req.filter = resolve('core.http.validator', res).filter
            this.hook.routing(this.express_app, req, res)
            this.run(url, req, res, next)
        })
    }

    /**
     * @method post
     * @description Post method call for router
     * @param {String} url 
     * @param {Function} target
     */
    post(url, target) {
        if (this.__prefix != '') url = this.__prefix + url
        if (this.routes === undefined) this.routes = []
        this.routes.push({ url: url, target: target, method: 'POST', middlewares: [] })
        this.express_app.post(url, ...this.getResolvedMiddlewares(), (req, res, next) => {
            __response = res
            req.validate = resolve('core.http.validator', res).validate
            req.define = resolve('core.http.validator', res).define
            req.filter = resolve('core.http.validator', res).filter
            this.hook.routing(this.express_app, req, res)
            this.run(url, req, res, next)
        })
    }

    /**
     * @method put
     * @description Put method call for router
     * @param {String} url 
     * @param {Function} target
     */
    put(url, target) {
        if (this.__prefix != '') url = this.__prefix + url
        if (this.routes === undefined) this.routes = []        
        this.routes.push({ url: url, target: target, method: 'PUT', middlewares: [] })
        this.express_app.put(url, ...this.getResolvedMiddlewares(), (req, res, next) => {
            __response = res
            req.validate = resolve('core.http.validator', res).validate
            req.define = resolve('core.http.validator', res).define
            req.filter = resolve('core.http.validator', res).filter
            this.hook.routing(this.express_app, req, res)
            this.run(url, req, res, next)
        })
    }

    /**
     * @method patch
     * @description Patch method call for router
     * @param {String} url 
     * @param {Function} target
     */
    patch(url, target) {
        if (this.__prefix != '') url = this.__prefix + url
        if (this.routes === undefined) this.routes = []        
        this.routes.push({ url: url, target: target, method: 'PATCH', middlewares: [] })
        this.express_app.patch(url, ...this.getResolvedMiddlewares(), (req, res, next) => {
            __response = res
            req.validate = resolve('core.http.validator', res).validate
            req.define = resolve('core.http.validator', res).define
            req.filter = resolve('core.http.validator', res).filter
            this.hook.routing(this.express_app, req, res)
            this.run(url, req, res, next)
        })
    }

    /**
     * @method delete
     * @description Delete method call for router
     * @param {String} url 
     * @param {Function} target
     */
    delete(url, target) {
        if (this.__prefix != '') url = this.__prefix + url
        if (this.routes === undefined) this.routes = []        
        this.routes.push({ url: url, target: target, method: 'DELETE', middlewares: [] })
        this.express_app.delete(url, ...this.getResolvedMiddlewares(), (req, res, next) => {
            __response = res
            req.validate = resolve('core.http.validator', res).validate
            req.define = resolve('core.http.validator', res).define
            req.filter = resolve('core.http.validator', res).filter
            this.hook.routing(this.express_app, req, res)
            this.run(url, req, res, next)
        })
    }

    async run(url, req, res, next) {
        /** If ENV VAR (env) is set to (dep), means in deployment process */
        if (Config.app('env') == 'dep') return res.status(200).json({ message: 'deployment in progress, please wait ...' })
        /** If in debug mode, print route url and method */
        if (Config.app('debug') == 'true') console.log(req.method + ' ' + url)
        /** Stops if headers were already sent */
        if (res.headersSent) return
        /** Initiating response object */
        let response = null
        /** Looping through all routes */
        this.routes.some(route => {
            /** Check if current express route URL and METHOD matches with one of user defined routes */
            if (route.url == url && route.method == req.method) {                    
                if (typeof route.target == 'function') {
                    /** In case router target is a callback/closure function */
                    response = route['target'](req, res)
                } else {
                    /** In case router target is a string with controller and it's method name */
                    let temp = route.target.split('@')
                    /** Check if controller is already resolved/initiated */
                    let app_instance = __resolver_cache.isAlreadyResolved(temp[0])
                    if (app_instance == null) {
                        /** In case controller was not already resolved, resolve it and cache it for next time */
                        app_instance = __resolver.resolve(__app_dependencies, temp[0])
                        __resolver_cache.trackResolvedController(temp[0], app_instance)
                    }
                    /** Get controller object from resolved cache */
                    let Controller = this.getController(temp[0], app_instance)                        
                    if (Controller[temp[1]] !== undefined) {
                        /** In case controller method was defined */
                        response = Controller[temp[1]](req, res)
                    } else {
                        /** In case controller method was not defined */
                        console.log('method {' + temp[1] + '} not found on controller {' + temp[0] + '} ...')
                        response = res.status(500).json({})
                    }
                }
            }
        })            
        if (response !== null)
            return response
    }

    /** return resolve or new controller instance */
    getController(name, dependencies) {
        return resolve('app.controllers.' + name, dependencies)
    }

    /** return all user defined routes array */
    allRoutes() {
        return this.routes
    }

}