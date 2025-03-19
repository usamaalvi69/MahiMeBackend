/**
 * Node Modules
 */
const express = require('express')

/**
 * Loading Common Helpers
 */
require('./helpers/global')
require('./helpers/use')

/**
 * Global Variables
 */
global.fs = require('fs')
global.root_directory = __dirname.replace('core', '')
global.__mongoose = null
global.Config = null
global.__dependency_controllers = []
global.__dependencies = []
global.__app_dependencies = []
global.__resolved_controllers = []
global.__hooks = {}
global.__routings = []
global.__skip_hooks = false
global.__response = null

/**
 * Global Nodvel Classes
 */
global.Router = resolve('core.http.router')
global.express_application = express()
global.__resolver = resolve('core.dependency.resolver')
global.__resolver_cache = resolve('core.dependency.resolverCache')
global.__installer = resolveOnce('core.installer')

/**
 * Nodvel Application Class
 */
module.exports = class Application {
  constructor() {
    /** Attaching global loadService & dependOn magic methods */
    if (express_application.loadService === undefined) express_application.loadService = this.loadService
    if (express_application.dependOn === undefined) express_application.dependOn = this.dependOn
    if (express_application.routing === undefined) express_application.routing = this.routing
    if (express_application.onRoute === undefined) express_application.onRoute = this.onRoute
    if (express_application.controller === undefined) express_application.controller = this.controller

    /** Providing router with express server access */
    Router.server(express_application)
  }

  controller(name) {
    return resolve('core.controller', name)
  }

  loadService(name, path) {
    if (path === undefined) {
      resolveOnce(name, express_application)
    } else {
      let object = {}
      object[name] = resolveOnce(path, express_application)
      Object.assign(global, object)
    }
  }

  dependOn(package_name) {
    __installer.installIfNot(package_name)
  }

  routing(request, response) {
    __routings.forEach((r) => {
      if (request.originalUrl == r.name) {
        r.callback(request, response)
      }
    })
  }

  onRoute(route_name, callback) {
    __routings.push({ name: route_name, callback: callback })
  }

  run() {
    console.log('Booting nodvel framework ...')

    // Starting framework in order
    this.loadEnvironmentSettings()
    this.loadDependencySettings()
    this.loadHookSettings()
    this.loadRouteSettings()
    this.startServer()
  }

  loadEnvironmentSettings() {
    const dotenv = require('dotenv')
    dotenv.config()
    Config = resolveOnce('core.helpers.config')
  }

  loadDependencySettings() {
    resolveOnce('app.container', express_application)
    __app_dependencies = use('app.dependencies')
    __dependency_controllers.forEach((dc) => {
      __app_dependencies[0].resolve.push({
        controllers: ['controllers.' + dc.name],
        dependencies: [{ targets: dc.entities }]
      })
    })

    __resolver.resolve(__app_dependencies, '')
    // Hooks
    __hooks = resolve('app.hooks')
  }

  loadHookSettings() {
    if (!__skip_hooks) {
      if (Config.app('debug') == 'true') console.log('Loading hooks ...')
      __hooks.boot(express_application)
      __hooks.server(express_application)
      Router.setHook(__hooks)
    }
  }

  loadRouteSettings() {
    let all_route_files = Config.routes()
    for (let i = 0; i < all_route_files.length; i++) {
      use('app.' + all_route_files[i])
    }
    // fallback
    if(all_route_files.length == 0) use('app.routes.api')
  }

  startServer() {
    const http = require('http')
    /** Starting express server */
    if (!__skip_server) {
      const server_port = process.env.PORT || parseInt(Config.app('port'))
      const server_instance = http.createServer(express_application)
      server_instance.listen(server_port, () => {
        console.log('Server started on port: ' + server_port)
      })
    }

    /** Catching not found routes */
    express_application.use(function (request, response, next) {
      response.status(404).end()
    })
  }
}
