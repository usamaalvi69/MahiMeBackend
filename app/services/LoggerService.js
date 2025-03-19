const winston = require('winston')
const { combine, timestamp, prettyPrint, colorize, errors, printf } = winston.format

/**
 * @class LoggerService
 * @description Service for auto logging exceptions
 * @howTo
 * - npm install --save winston
 * - app/hooks.js > boot() > app.loadService('logger', 'app.services.LoggerService')
 */
module.exports = class LoggerService {

    constructor(app) {
        const winston_format = printf(info => {
            return `${info.timestamp} ${info.message}: ${info.stack}`
        })

        return winston.createLogger({
            level: 'debug',
            format: combine(
                errors({ stack: true }),
                colorize(),
                timestamp(),
                prettyPrint(),
                winston_format
            ),
            // defaultMeta: { service: 'mtb' },
            transports: [
                new winston.transports.File({ filename: root_directory + '/logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: root_directory + '/logs/combined.log' }),
            ],
        })
    }


}