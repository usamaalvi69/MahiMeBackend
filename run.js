global.fs = require('fs')
require('./core/helpers/global')

if (process.argv.length > 1) {
    let command_file = undefined
    let command_method = undefined

    let parts = process.argv[2].split(':')

    if (parts.length > 0) {
        command_file = parts[0]
        command_method = parts[1]
    }

    if (fs.existsSync('./cli/' + command_file + '.js')) {
        var instance = require('./cli/' + command_file + '.js');
        var runner = new instance()
        if (command_method !== undefined && runner[command_method] === undefined) {
            console.log('Command `' + command + '` does not have method `' + command_method + '`')
            process.exit(1)
        }
        // Expected args
        let expected_args = 3

        // Collecting params
        let params = []
        if (process.argv.length > expected_args) {
            for (let index in process.argv) {
                if (index > expected_args - 1) params.push(process.argv[index])
            }
        }

        // Running hooks
        if (runner['setup'] !== undefined) runner['setup'](() => {
            if (runner['pre'] !== undefined) runner['pre'](...params)
            if (runner['index'] !== undefined) runner['index'](...params)
            if (command_method !== undefined) customCommand(runner, command_method, params, () => {
                if (runner['post'] !== undefined) runner['post'](...params)
                process.exit(1)
            })
        })
    } else {
        console.log('Invalid command.')
    }
}

async function customCommand(runner, command_method, params, callback) {
    await runner[command_method](...params)
    callback()
}