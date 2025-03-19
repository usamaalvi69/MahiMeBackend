/**
 * Nodvel framework
 * @version 1.1.0
 * Feb, 2022
 */
global.__skip_server = false
const Application = require('./core/application.js')

// let package = readJson('app.configs.package')
// for(let key in package) {
//       const instance = require('./cli/install.js')
//       const runner = new instance()
//       new Promise(async (resolve) => {
//           await runner['package'](key)
//           resolve()
//       })
// } in all projects shpould comment it

new Application().run()