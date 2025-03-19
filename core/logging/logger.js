const fs = require("fs")

module.exports = class Logger {

    constructor(filename){
        this.filename = filename
    }

    make(filename) {
        return new Logger(filename)
    }
 
    log(data, filename) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data)   
        }
        if (!fs.existsSync(root_directory + '/logs')){
            fs.mkdirSync(root_directory + '/logs')
        }
        if(filename === undefined) filename = this.filename
        if (!fs.existsSync(root_directory + '/logs/' + filename))
        {
            fs.writeFile(root_directory + '/logs/' + filename,
            data, function (err) {
                if (err) console.log(new Error(err))
            })
        }else{
            fs.appendFile(root_directory + '/logs/' + filename,
            '\n' + data.toString(), function (err) {
                if (err) console.log(new Error(err))
            })
        }
    }

    logJson(data, filename) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data)   
        }
        if(filename === undefined) filename = this.filename
        if (!fs.existsSync(root_directory + '/logs')){
            fs.mkdirSync(root_directory + '/logs')
        }
        if (!fs.existsSync(root_directory + '/logs/' + filename))
        {
            fs.writeFile(root_directory + '/logs/' + filename,
            JSON.stringify(data, null, 2), function (err) {
                if (err) console.log(new Error(err))
            })
        }else{
            fs.appendFile(root_directory + '/logs/' + filename,
            ',' + JSON.stringify(data, null, 2), function (err) {
                if (err) console.log(new Error(err))
            })
        }
    }

}