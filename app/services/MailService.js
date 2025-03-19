const nodemailer = require('nodemailer')
const sendgridTransporter = require('nodemailer-sendgrid-transport')

/**
 * @class MailService
 * @description Service for sending smtp & sendgrid emails
 * @howTo
 * - npm install --save nodemailer nodemailer-sendgrid-transport
 * - app/hooks.js > boot() > app.loadService('mail', 'app.services.MailService')
 */
module.exports = class MailService {

    constructor(app) {
        
    }

    /**
     * @method send
     * @description Send a email
     * @param {string} template
     * @param {string} subject
     * @param {string} email_address
     */
    send(template, subject, email_address) {
        if(Config.app('email_client') == 'smtp') {
            this.Smtp(template, subject, email_address)
        }else if(Config.app('email_client') == 'sendgrid') {
            this.sendGrid(template, subject, email_address)
        }
    }

    sendGrid(template, subject, email_address) {
        const transporter = nodemailer.createTransport(sendgridTransporter({
            auth: {
                api_key: Config.app('email_key')
            }
        }))
        const from = {
            name: Config.app('email_sender_name'),
            address: Config.app('email_sender')
        }
        transporter.sendMail({
            to: email_address,
            from: from,
            subject: `${subject}`,
            html: template
        }).then(() => {
            if(Config.app('debug')) console.log('Email successfully sent.')
        }).catch((err) => {
            if(Config.app('debug')) console.log('Error while sending email: ', err)
        })
    }

    Smtp(template, subject = '', email_address) {
        const transporter = nodemailer.createTransport({
            host: Config.app('email_host'),
            port: Config.app('email_port'),
            auth: {
                user: Config.app('email_username'),
                pass: Config.app('email_password')
            },
            logger: false
        });
        const from = {
            name: Config.app('email_sender_name'),
            address: Config.app('email_sender')
        }

        if(Config.app('debug')) {
            // console.log("Sending smtp email ...")
            // console.log("Host => ", Config.app('email_host'))
            // console.log("Port => ", Config.app('email_port'))
            // console.log("Username => ", Config.app('email_username'))
            // console.log("Password => ", Config.app('email_password'))
            // console.log("Sender => ", from)
            // console.log("To => ", email_address)
            // console.log("Dispatching email FROM[" + from + "] - TO[" + email_address + "] @SUBJECT[" + subject + "] ...")
        }
        
        transporter.sendMail({
            to: email_address,
            from: from,
            subject: `${subject}`,
            html: template
        }).then(() => {
            if(Config.app('debug')) console.log('Email successfully sent.')
        }).catch((err) => {
            if(Config.app('debug')) console.log('Error while sending email: ', err)
        })
    }
}