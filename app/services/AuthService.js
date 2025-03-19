const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const BearerStrategy = require('passport-http-bearer')

/**
 * @class AuthService
 * @description AuthService helps in authentication, passport, hashing and tokenization
 * @howTo
 * - npm install --save crypto jsonwebtoken passport passport-http-bearer
 * - app/hooks.js > boot() > app.loadService('auth', 'app.services.AuthService')
 */
module.exports = class AuthService {

    constructor(app) {
        if (app !== undefined) app.use(passport.initialize())
        
        // app.onRoute('/', (request, response) => {
        //     response.status(200).json({ message: 'Auth service is preventing route {/} to be used ...' })
        // })
    }

    /**
     * @method getPassportInstance
     * @description Get a passport instance
     * @return {Passport} passport
     */
    getPassportInstance() {
        return passport
    }

    /**
     * @method initPassport
     * @description Use of BearerStrategy for token verification
     */
    initPassport() {
        let me = this
        passport.use(
            new BearerStrategy(function(token, done) {
                me.verify(token)
                    .then(payload => {
                        resolveOnce('app.models.UserModel')
                            .findById(payload.id)
                            .populate('roles')
                            .then(user => {
                                if (!user) {
                                    console.error(`[Auth] user not found '${payload.id}'`)
                                    done('Invalid token.')
                                } else {
                                    done(null, user)
                                }
                            })
                            .catch(err => {
                                done(err)
                            })
                    })
                    .catch(err => {
                        done(err)
                    })
            })
        )
    }

    /**
     * @method generateSalt
     * @description Generates a new salt for user
     * @return {string} salt
     */
    generateSalt() {
        return crypto.randomBytes(Config.app('salt_bytes')).toString('base64')
    }

    /**
     * @method hashPassword
     * @description Hash a password with provided salt
     * @return {string} hashed_password
     */
    hashPassword(password, salt) {
        if (!password || !salt) throw new Error('Password or salt not found.')
        return crypto
            .pbkdf2Sync(
                password,
                Buffer.from(salt, 'base64'),
                parseInt(Config.app('hash_iterations')),
                parseInt(Config.app('salt_bytes')),
                Config.app('hash_algo')
            )
            .toString('base64')
    }

    /**
     * @method verify
     * @description verify a provided token via jwt package
     * @return {promise}
     */
    verify(token) {
        if (!token) return Promise.reject('Missing token.')
        return new Promise((resolve, reject) => {
            jwt.verify(token, Config.app('token'), (err, payload) => {
                if (err) return reject('Invalid token.')
                else resolve(payload)
            })
        })
    }

    /**
     * @method generateToken
     * @description generates a fresh token for given user id
     * @return {string} token
     */
    generateToken(id) {
        return jwt.sign({ id: id }, Config.app('token'), {
            expiresIn: parseInt(Config.app('token_expiry')),
        })
    }

}