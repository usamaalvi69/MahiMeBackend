console.log("Booting nodvel framework ...")

global.__mongoose = require("mongoose")

const os = require("os")
const http = require("http")
const express = require("express")

require("./helpers/global")

global.fs = require("fs")

// root directory
global.root_directory = __dirname.replace("core", "")
// Env reader
const dotenv = require("dotenv")
dotenv.config()

// Initializing the config singleton
global.Config = resolveOnce("core.helpers.config")

// handling modules
let module_env = Config.app("modules")
let modules = module_env ? module_env.split(",") : ['app']
if (modules.length > 0 && modules[0] != "") {
  // at least one or more modules found ...
} else {
  console.log(
    "ERR: " + "Please configure atleast one module for the application."
  )
  process.exit(1)
}

// Helpers: use
require("./helpers/use")

// Global dependencies storage
global.__dependencies = []

// Resolved Controllers/Classes Cache
global.__resolved_controllers = []

// Loading Resolver, Instance & Cache
global.__resolver = resolve("core.dependency.resolver")
global.__resolver_cache = resolve("core.dependency.resolverCache")

// Pre-resolving
global.__hooks = []
global.__module_deps = []
modules.forEach((_m) => {
  __module_deps[_m] = use(_m + ".dependencies")
  __resolver.resolve(__module_deps[_m], "")
  // Hooks
  __hooks[_m] = resolve(_m + ".hooks")
})

// Routing
global.Router = resolve("core.http.router")

/** Creating express server application */
global.express_application = express()

/** Providing router with express server access */
Router.server(express_application)

// Database mongoose boot up
let host = Config.database(Config.database("default") + ".host")
let port = Config.database(Config.database("default") + ".port")
let name = Config.database(Config.database("default") + ".name")
let username = Config.database(Config.database("default") + ".username")
let password = Config.database(Config.database("default") + ".password")
let database_connection_uri = `mongodb://${host}:${port}/${name}`

let database_mongoose_options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  poolSize: os.cpus().length * 2 + 1,
}
if (username && password) {
  database_mongoose_options = {
    auth: {
      authSource: "admin",
    },
    user: username,
    pass: password,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    poolSize: os.cpus().length * 2 + 1,
  }
}
console.log(database_connection_uri)
__mongoose.connect(database_connection_uri, database_mongoose_options)
__mongoose.connection.on("disconnected", function () {
  if (Config.app("debug") == "true") console.log("Database disconnected")
})
__mongoose.connection.on("connected", () => {
  if (Config.app("debug") == "true") console.log(`Database connected`)
})

// loading server hooks
if (!__skip_hooks) {
  if (Config.app("debug") == "true") console.log("Loading hooks ...", __hooks)
  for (const _m in __hooks) {
    const hook = __hooks[_m]
    hook.boot(express_application, _m)
    hook.server(express_application, _m)
    Router.setHook(hook)
  }
}

/** Building express routes */
use("app.routes.api")

/** Starting express server */
if (!__skip_server) {
  const server_port = parseInt(Config.app("port"))
  const server_instance = http.createServer(express_application)
  server_instance.listen(server_port, () => {
    console.log("Server started on port: " + server_port)
  })
}

/** Catching not found routes */
express_application.use(function (request, response, next) {
  response.status(404).end()
})
