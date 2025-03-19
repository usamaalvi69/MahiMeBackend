const { exec } = require('child_process')
const http = require('http');
const fs = require('fs');
const axios = require('axios');
let Config = null

module.exports = class Installer {

    constructor() {
        const dotenv = require('dotenv')
        dotenv.config()
        Config = resolveOnce('core.helpers.config')
    }

    isInstalled(package_name, callback) {
        exec('npm ls ' + package_name, { cwd: root_directory }, (err, stdout, stderr) => {
            let installed = 0
            if (err) {
                // node couldn't execute the command
                installed = 0
            } else if (stdout == '' || stderr != '') {
                installed = 0
            } else if (stdout != '') {
                installed = 1
            }

            // the *entire* stdout and stderr (buffered)
            // console.log(`stdout: ${stdout}`)
            // console.log(`stderr: ${stderr}`)
            if (callback !== undefined) callback(installed)
        })
    }

    installIfNot(package_name, callback) {
        this.isInstalled(package_name, (installed) => {
            if (installed == 0) {
                this.install(package_name, () => {
                    if (callback !== undefined) callback()
                })
            } else {
                if (callback !== undefined) callback() // already installed
            }
        })
    }

    async install(package_name, callback) {
        var lock_file = {}
        if(fs.existsSync("./app/configs/package.lock")) {
            lock_file = JSON.parse(fs.readFileSync("./app/configs/package.lock", 'utf8'))                
        }
        if(package_name in lock_file) {
            return
        }
        console.log(">> Installing dependency {" + package_name + "} ...")

        // 1. get package data
        const package_uri = Config.app('installer_host') + "?i=" + package_name
        console.log('@Tapping ' + Config.app('installer_host') + ' for package information: ' + package_uri)
        let response = await axios.get(package_uri)
        // console.log(response.data)
        console.log('@Installing package {' + response.data.name + ' v' + response.data.version + '} ...')

        // 2. Fetching files one by one
        const total_steps = response.data.files.length + 1
        let done_steps = 0
        for(let i=0; i<response.data.files.length; i++) {
            const file = response.data.files[i];
            const file_info_uri = Config.app('installer_host') + "?r=info:" + file 
            let file_response = await axios.get(file_info_uri)
            const physical_file = fs.createWriteStream("./public/file" + i + ".temp");
            const file_get_uri = Config.app('installer_host') + "?r=get:" + file + '&v=' + response.data.version
            console.log('#GET ' + (i+1) + '/' + response.data.files.length)
            let download_response = http.get(file_get_uri, (response) => {
                if (response.statusCode !== 200) {
                    return cb('Response status was ' + response.statusCode);
                }
                response.pipe(physical_file)
                physical_file.on("finish", () => {
                    physical_file.close()
                    if(file_response.data.action == 'copy') {
                        let copy_path = replaceAll(file_response.data.target.path, '.', '/') + '/' + file_response.data.target.name
                        let path_items = copy_path.split('/')
                        let concatenated_path = ''
                        for (let i = 0; i < path_items.length-1; i++) {
                            const item = path_items[i]
                            if(concatenated_path != '') concatenated_path += '/'
                            concatenated_path += item
                            if(!fs.existsSync(concatenated_path)) {
                                fs.mkdirSync(concatenated_path)
                            }
                        }
                        fs.copyFile("./public/file" + i + ".temp", copy_path, (err) => {
                            if (err) throw err;
                            console.log('@Created ' + copy_path)
                            fs.unlinkSync("./public/file" + i + ".temp")
                            done_steps++
                        })
                    }else if(file_response.data.action == 'merge') {
                        let copy_path = replaceAll(file_response.data.target.path, '.', '/') + '/' + file_response.data.target.name
                        var source_json = JSON.parse(fs.readFileSync("./public/file" + i + ".temp", 'utf8'))
                        var target_json = JSON.parse(fs.readFileSync(copy_path, 'utf8'))
                        for(let key in source_json) {
                            target_json[key] = source_json[key]
                        }
                        fs.writeFileSync(copy_path, JSON.stringify(target_json), 'utf8')
                        console.log('@Created ' + copy_path)
                        fs.unlinkSync("./public/file" + i + ".temp")
                        done_steps++
                    }                    
                })
            })
        }

        // 3. All done
        if(done_steps = total_steps -1) {
            lock_file[package_name] = response.data.version
            fs.writeFileSync("./app/configs/package.lock", JSON.stringify(lock_file), 'utf8')
            done_steps++
        }

        let done = await this.allFilesDownloaded(total_steps, done_steps)
        while(!done) {
            done = await this.allFilesDownloaded(total_steps, done_steps)
        }

    }

    async allFilesDownloaded(total, downloaded) {
        return new Promise(resolve => (total == downloaded ? true : false))
      }

}