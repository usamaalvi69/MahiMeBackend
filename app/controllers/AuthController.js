/**
 * @class AuthController
 * @description Handles user authentication and basic functionalities
 */
module.exports = class AuthController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.user_model = app.get('UserModel')
    this.crypt_helper = app.get('CryptHelper')
    this.general_helper = app.get('GeneralHelper')
    // this.twilio_service = app.get('TwilioService')
  }

  /**
   * @method login
   * @description Returns successfully logged in user and passport bearer token
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async login(request, response) {
    try {
      /** Request validation */
      let errors = await request.validate({
        email: "string|required|email",
        mode: "required",

        // password: "string|required",
      })
      if (errors.length > 0)
        return response
          .status(400)
          .send({ message: "Validation error", errors: errors })
      // if (request.body.mode != 'be' && (!request.body.firebase_token || request.body.firebase_token == '')) {
      //   return response
      //     .status(401)
      //     .send({ message: 'firebase token is required' })
      // }
      let user = await this.user_model.findOne({ email: request.body.email })
      if (!user)
        return response.status(401).send({ message: "Invalid credentials" })

      //if (user.status == 'pending' || user.status == 'blocked') {
      //  return response.status(400).json({ message: 'Email not verified or the user is blocked.' })
      //}
      if (user.deleted_at != null) {
        return response.status(400).json({ message: 'This account has been deleted.' })
      }
      
      if(request.body.mode == 'fe' && user.type == 'admin'){
        return response.status(400).send({ message: 'You cannot access the admin portal' })
      }
      if(request.body.mode == 'be' && user.type != 'admin'){
        return response.status(400).send({ message: 'You cannot access the user portal' })
      }

      let generated_password = auth.hashPassword(
        request.body.password,
        Config.app("salt")
      )
      if (generated_password !== user.password) {
        return response.status(400).json({ message: "Password is incorrect" })
      }
      user
      delete user.password

      if (user.firebase_token?.length > 0) {
        if(user.firebase_token.indexOf(request.body.firebase_token) == -1 && request.body.firebase_token != '' && request.body.firebase_token != null){ 
          user.firebase_token.push(request.body.firebase_token)
        }
        var firebase = user.firebase_token
      } else {
        var firebase = request.body.firebase_token
      }
      let updated_user = await this.user_model
        .findOneAndUpdate(
          { _id: user._id },
          {
            $set: {
              last_login: new Date(),
              firebase_token: firebase,
              current_time_zone: request.body.current_time_zone
                ? request.body.current_time_zone
                : user.current_time_zone,
            },
          },
          { new: true, useFindAndModify: false }
        )
        .select("-password")
        .populate("roles")
        .populate("photo")

      response.status(200).json({
        user: updated_user,
        token: auth.generateToken(user.id.toString())
      })
    } catch (err) {
      logger.log({
        level: "error",
        message: err,
      })
      return response.status(400).send({ message: "Something went wrong" })
    }
  }

  /**
   * @method logs
   * @description Returns logs string
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async logs(request, response) {
    try {
      let data = fs.readFileSync(root_directory + 'logs/error.log', 'utf8')
      data = data.replace(/    /g, '&nbsp;&nbsp;&nbsp;&nbsp;')
      data = data.replace(/(?:\r\n|\r|\n)/g, '<br>')
      response.status(200).send(data)
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
  * @method clearlogs
  * @description Returns logs string
  * @param {object} request
  * @param {object} response
  * @return {object} response
  */
  async clearlogs(request, response) {
    try {
      let data = fs.truncate(root_directory + 'logs/error.log', 0, function () { })

      response.status(200).send(data)
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method changePassword
   * @description Changed password of user
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async changePassword(request, response) {
    try {
      /** Request validation */
      let errors = await request.validate({
        current_password: 'required|string|min:6',
        new_password: 'required|string|min:6'
      })
      if (errors.length > 0) return response.status(400).send({ message: 'Validation error', errors: errors })

      let user = await this.user_model.findOne({ _id: request.user._id })
      if (user == null) {
        return response.status(200).json({ message: 'User does not exist' })
      }

      let generated_password = auth.hashPassword(request.body.current_password, Config.app('salt'))
      if (generated_password !== request.user.password) {
        return response.status(400).json({ message: 'Invalid current password' })
      }

      let new_password = auth.hashPassword(request.body.new_password, Config.app('salt'))
      user.password = new_password
      let updated = await user.save()
      if (updated.updatedCount == 0) return response.status(400).json({ message: 'Unable to change password' })

      /** Response */
      return response.status(200).json({ message: 'Password changed successfully' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method forgetPassword
   * @description Changed password of user
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async forgetPassword(request, response) {
    try {
      /** Request validation */
      let errors = await request.validate({
        email: 'string|email|required'
      })
      if (errors.length > 0) return response.status(400).json({ message: 'Invalid email address', errors: errors })

      let user = await this.user_model.findOne({ email: request.body.email })
      if (!user) {
        return response.status(400).json({ message: 'Provided email does not exists' })
      }
      // user.reset_password_token = auth.generateToken(user._id.toString())
      user.reset_password_token = this.crypt_helper.generateToken(user._id.toString())
      // user.reset_password_created_at = Date.now() + 3600000 // 1 hour
      user.reset_password_created_at = Date.now()
      await user.save()

      let admin = await this.user_model.findOne({ type: 'admin' })
      let name = user.first_name
      
      /** Email dispatch */
      let template = await view().render('templates.forget-password', {
        url: request.body.url + '/reset-password/' + user.reset_password_token,
        base_url: Config.app('base_url'),
        admin_email: `${admin.email}`,
        name: `${name}`,
        app: Config.app('app_name')
      })

      await mail.send(template, 'Reset Password', user.email)


      /** Response */
      return response.status(200).send({ message: 'Please check your email to reset the password' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method resetPassword
   * @description Changed password of user
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async resetPassword(request, response) {
    try {
      /** Request validation */
      let errors = await request.validate({
        password: 'string|required|min:6',
        token: 'string|required'
      })
      if (errors.length > 0) return response.status(400).send({ message: 'Validation error', errors: errors })

      let user = await this.user_model.findOne({
        reset_password_token: request.params.token
      })
      const token_creation_time = new Date(user.reset_password_created_at).getTime()
      const current_time = Date.now()
      const timeElapsed = (current_time - token_creation_time) / (1000 * 60)
      if (timeElapsed > 15) {
        return response.status(400).json({ message: 'This link has been expired' })
      }
      if (!user) {
        return response.status(400).json({ message: 'This link has been expired' })
      }
      user.password = auth.hashPassword(request.body.password, Config.app('salt'))
      user.reset_password_token = null
      user.status = 'active'
      user.verified_at = new Date()
      let updated = await user.save()
      if (updated.updatedCount == 0) return response.status(400).json({ message: 'Unable to reset password' })

      /** Response */
      return response.status(200).json({ message: 'Password reset successful' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
  /**
   * @method RemoveFirebaseToken
   * @description Returns logs string
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async RemoveFirebaseToken(request, response) {
    try {
      if (request.body.firebase_token) {
        let user = await this.user_model.findOne({
          _id: request.body.user_id,
        })
        if (user && user.firebase_token.length !== 0) {
          const index = user.firebase_token.indexOf(
            request.body.firebase_token
          )
          if (index !== -1) {
            user.firebase_token.splice(index, 1)
            await user.save()
            return response
              .status(200)
              .send({ message: "Firebase token removed successfully" })
          } else {
            return response.status(200).send({ message: "Token not found" })
          }
        } else {
          return response
            .status(200)
            .send({ message: "User does not have any tokens" })
        }
      } else {
        return response.status(400).send({ message: "Something went wrong" })
      }
    } catch (err) {
      logger.log({
        level: "error",
        message: err,
      })
      return response.status(400).send({ message: "Something went wrong" })
    }
  }


  /**
     * @method userForgetPassword
     * @description Changed password of user
     * @param {object} request
     * @param {object} response
     * @return {object} response
     */
  async userForgetPassword(request, response) {
    try {

      let errors = await request.validate({
        email: 'string|email|required'
      })
      if (errors.length > 0) return response.status(400).json({ message: 'Email address format is invalid', errors: errors })

      var user = await this.user_model.findOne({ email: request.body.email })

      if (!user) {
        return response
          .status(400)
          .json({ message: 'Email address does not exist' })
      }

      user.reset_password_token = Math.floor(1000 + Math.random() * 9000).toString()
      user.reset_password_created_at = Date.now()
      await user.save()

      let admin_user = await this.user_model.findOne({ type: 'admin' })
     
      let name = (user.type == 'employer') ? user.first_name : user.first_name + " " + user.last_name
      /** Email dispatch */
      let template = await view().render('templates.user-forget-password', {
        token: user.reset_password_token,
        base_url: Config.app('base_url'),
        name: `${name}`,
        email_address: `${admin_user.email}`,
        app: Config.app('app_name')
      })

      await mail.send(template, `Password Reset: ${user.reset_password_token}`, user.email)
      /** Response */
      return response.status(200).send({
        message: 'Email Sent, Check Your Inbox', pin: user.reset_password_token
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }


  async verifyUserOtp(request, response) {
    try {
      let validation = await request.validate({
        token: 'required'
      })
      if (validation && validation.length > 0)
        return response.status(400).json({ message: 'Validation error', errors: validation })
      var user = await this.user_model.findOne({ reset_password_token: request.body.token })
      if (!user) {
        return response.status(400).json({ message: 'incorrect verification code' })
      }

      return response.status(200).json({ message: 'Code is successfully verified.' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return { error: true, message: 'Something went wrong' }
    }
  }


  async userForgetPinCode(request, response) {
    try {

      let errors = await request.validate({
        email: 'string|email|required'
      })
      if (errors.length > 0) return response.status(400).json({ message: 'Invalid email address', errors: errors })

      var user = await this.user_model.findOne({ email: request.body.email })

      if (!user) {
        return response
          .status(400)
          .json({ message: 'Provided email does not exists' })
      }

      user.pin_code = Math.floor(1000 + Math.random() * 9000).toString()
      await user.save()

      let admin_user = await this.user_model.findOne({ type: 'admin' })
      /** Email dispatch */
      let template = await view().render('templates.user-forget-pincode', {
        token: user.pin_code,
        base_url: Config.app('base_url'),
        name: `${user.first_name} ${user.last_name}`,
        email_address: `${admin_user.email}`,
        app: Config.app('app_name')
      })

      await mail.send(template, `Temporary PIN Code: ${user.pin_code}`, user.email)
      /** Response */
      return response.status(200).send({
        message: 'Email Sent, Check Your Inbox'
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
  async verifyPin(request, response) {
    let errors = await request.validate({
      _id: 'required|mongoId',
      auth_pin: 'required'
    })
    if (errors.length > 0) return response.status(400).json({ message: 'Invalid email address', errors: errors })

    var user = await this.user_model.findOne({ _id: request.params._id })
    
    if(user.auth_pin == ''){
      await this.user_model.findOneAndUpdate(
        { _id: request.params._id },
        {
          $set: { auth_pin: request.params.auth_pin },
        },
        { new: true, useFindAndModify: false }
      )
      return response.status(200).json({ message: 'Pin is set' })
    }

    if (!user) {
      return response
        .status(400)
        .json({ message: 'Invalid pin' })
    }else if(user.auth_pin != request.params.auth_pin){
      return response
      .status(400)
      .json({ message: 'Invalid pins' })
    }
    return response.status(200).json({ message: 'Verified' })

  }


  /**
     * @method userForgetPin
     * @description Changed password of user
     * @param {object} request
     * @param {object} response
     * @return {object} response
     */
  async userForgetPin(request, response) {
    try {

      let errors = await request.validate({
        email: 'string|email|required'
      })
      if (errors.length > 0) return response.status(400).json({ message: 'Email address format is invalid', errors: errors })

      var user = await this.user_model.findOne({ email: request.body.email })

      if (!user) {
        return response
          .status(400)
          .json({ message: 'Email address does not exist' })
      }

      user.reset_pin_token = Math.floor(1000 + Math.random() * 9000).toString()

      let admin_user = await this.user_model.findOne({ type: 'admin' })
      user.reset_pin_created_at = Date.now()
      await user.save()

      /** Email dispatch */
      let template = await view().render('templates.user-forget-pin', {
        token: user.reset_pin_token,
        base_url: Config.app('base_url'),
        name: `${user.first_name} ${user.last_name}`,
        email_address: `${admin_user.email}`,
        app: Config.app('app_name')
      })

      await mail.send(template, `Auth pin Reset: ${user.reset_pin_token}`, user.email)
      /** Response */
      return response.status(200).send({
        message: 'Email Sent, Check Your Inbox', pin: user.reset_pin_token
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  async verifyUserPinOtp(request, response) {
    try {
      let validation = await request.validate({
        token: 'required'
      })
      if (validation && validation.length > 0)
        return response.status(400).json({ message: 'Validation error', errors: validation })
      var user = await this.user_model.findOne({ reset_pin_token: request.body.token })
      if (!user) {
        return response.status(400).json({ message: 'incorrect verification code' })
      }

      return response.status(200).json({ message: 'Code is successfully verified.' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return { error: true, message: 'Something went wrong' }
    }
  }

  /**
   * @method resetAuthPin
   * @description Changed password of user
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async resetAuthPin(request, response) {
    try {
      /** Request validation */
      let errors = await request.validate({
        auth_pin: 'required',
        token: 'required'
      })
      if (errors.length > 0) return response.status(400).send({ message: 'Validation error', errors: errors })

      let user = await this.user_model.findOne({
        reset_pin_token: request.params.token
      })

      const token_creation_time = new Date(user.reset_pin_created_at).getTime()
      const current_time = Date.now()
      const timeElapsed = (current_time - token_creation_time) / (1000 * 60)
      if (timeElapsed > 15) {
        return response.status(400).json({ message: 'This link has been expired' })
      }
      if (!user) {
        return response.status(400).json({ message: 'This link has been expired' })
      }
      user.auth_pin = request.body.auth_pin
      user.reset_pin_token = null
      // user.status = 'active'
      // user.verified_at = new Date()
      let updated = await user.save()
      if (updated.updatedCount == 0) return response.status(400).json({ message: 'Unable to reset auth pin' })

      /** Response */
      return response.status(200).json({ message: 'Auth pin reset successful' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method changeAuthPin
   * @description Changed password of user
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async changeAuthPin(request, response) {
    try {
      /** Request validation */
      let errors = await request.validate({
        auth_pin: 'required',
      })
      if (errors.length > 0) return response.status(400).send({ message: 'Validation error', errors: errors })

      // user.verified_at = new Date()
      let user = await this.user_model.findOne({_id: request.params._id})
      if(JSON.stringify(user._id) == JSON.stringify(request.user._id)){
        user.auth_pin = request.body.auth_pin
        let updated = await user.save()
        if (updated.updatedCount == 0) return response.status(400).json({ message: 'Unable to reset auth pin' })
  
        /** Response */
        return response.status(200).json({ message: 'Auth pin reset successful' })
      }else{
        return response.status(400).json({ message: 'Permission denied' })

      }
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

}
