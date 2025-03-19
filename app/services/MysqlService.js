const mysql = require("mysql2/promise")

/**
 * @class MysqlService
 * @description Basic mysql service
 * @howTo
 * - npm install --save mysql2
 * - app/hooks.js > 
 */
module.exports = class MysqlService {

    constructor() {
        this.host = Config.database('mysql.host')
        this.port = Config.database('mysql.port')
        this.name = Config.database('mysql.name')
        this.username = Config.database('mysql.username')
        this.password = Config.database('mysql.password')
    }

    async connect() {
        let connection = null

        if(this.password != ''){
            connection = await mysql.createPool({
                host: this.host,
                port: this.port,
                database: this.name,
                user: this.username,
                password: this.password
            })
        }else{
            connection = await mysql.createPool({
                host: this.host,
                port: this.port,
                database: this.name,
                user: this.username
            })
        }

        connection.all = async function()
        {
            let result = (await connection.query.apply(this, arguments))[0]
            for(let row in result)
                for(let col in result[row])
                    if(result[row][col] instanceof Buffer)
                        result[row][col] = result[row][col].toString("utf-8")
            return result
        }

        connection.get = async function()
        {
            let result = await connection.all.apply(this, arguments)
            return result[0]
        }

        connection.run = async function()
        {
            return (await connection.query.apply(this, arguments))[0].insertId
        }

        return connection
    }

}