const { app } = require('firebase-admin')
const mongoose = require('mongoose')
/**
 * @class FavouriteController
 * @description Handles all user related CRUD operations
 */
module.exports = class FavouriteController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.favourite_model = app.get('FavouriteModel')
    this.role_model = app.get('RoleModel')
    this.job_applicant_model = app.get('JobApplicantModel')

  }

  /**
   * @method index
   * @description Returns list of user
   * @param {object} request
   * @param {object} response
   */
  async index(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can("shortlist.index")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      let result = await request.validate({
        type: 'required|enum:user,job'
      })

      if (result && result.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: result })
      var filters = await request.filter({
        search: '',
        skip: 'skip:0',
        limit: 'limit:10',
        sort: 'sort:_id',
        order: 'order:-1'
      })
      if (request.user.type != 'admin') {
        filters.find['user'] = request.user._id
      }else{
        filters.find['user'] = new mongoose.Types.ObjectId(request.query.user_id)
      }
      let favourites = ''
      let sort = 1
      if(filters.query.sort && filters.query.sort._id){
        sort = parseInt(filters.query.sort._id)
      }
      if (request.query.type == 'user') {
        filters.find['favourite_type'] = 'user'

        if (request.query.search && request.query.search != '') {
          filters.find['$or'] = [
            { 'favourite_user.first_name': new RegExp('.*' + request.query.search + '.*', 'i') },
            { 'favourite_user.last_name': new RegExp('.*' + request.query.search + '.*', 'i') }
          ]
        }

        favourites = await this.favourite_model.aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'favourite_user',
              foreignField: '_id',
              as: 'favourite_user'
            }
          },
          {
            $unwind:'$favourite_user'
          },
          {
            $lookup: {
              from: 'docs',
              localField: 'favourite_user.photo',
              foreignField: '_id',
              as: 'favourite_user.photo'
            }
          },
          { "$unwind": { path: '$favourite_user.photo', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'categories',
              localField: 'favourite_user.category',
              foreignField: '_id',
              as: 'favourite_user.category'
            }
          },
          {
            $unwind:'$favourite_user.category'
          },

          {
            $match: {
              ...filters.find
            }
          },
          { $sort: {"favourite_user.first_name":sort} },
          { $skip: filters.query.skip },
          { $limit: filters.query.limit }
        ])


      } else {
        filters.find['favourite_type'] = 'job'
        let favourites_data = await this.favourite_model.aggregate([
          {
            $lookup: {
              from: 'jobs',
              localField: 'favourite_job',
              foreignField: '_id',
              as: 'favourite_job'
            }
          },
          {
            $unwind:'$favourite_job'
          },
          
          {
            $lookup: {
              from: 'categories',
              localField: 'favourite_job.category',
              foreignField: '_id',
              as: 'favourite_job.category'
            }
          },
          {
            $unwind:'$favourite_job.category'
          },
          // {
          //   $lookup: {
          //     from: 'docs',
          //     localField: 'favourite_user.photo',
          //     foreignField: '_id',
          //     as: 'favourite_user.photo'
          //   }
          // },
          // {
          //   $unwind:'$favourite_user.photo'
          // },

          {
            $match: {
              ...filters.find
            }
          },
          // { $sort: filters.query.sort },
          { $skip: filters.query.skip },
          { $limit: filters.query.limit }
        ])
        let array_data = []

        for(let i = 0; i <= favourites_data.length; i++ ){
          if(favourites_data[i]){
            let applied = await this.job_applicant_model.findOne({job: favourites_data[i].favourite_job._id, employee: request.user._id})
            favourites_data[i].is_applied = (applied) ? true : false
            array_data.push(favourites_data[i])
          }
        }
        favourites = array_data
      }
      let total = await this.favourite_model.countDocuments(filters.find)

      /** Response */
      return response.status(200).json({
        pagination: {
          skip: filters.query.skip,
          limit: filters.query.limit,
          total
        },
        favourites
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method addFavourite
   * @description add user or job as favourite
   * @param {object} request
   * @param {object} response
   */
  async addFavourite(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can("shortlist.store")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      /** Request validation */
      let validation = await request.validate({
        type: 'required',
        type_id: 'mongoId|required'
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })
      let user_id = request.user._id
    let message = ''
      if (request.body.type == 'user') {
        message = 'Employee has been added to shortlist successfully'
        let favourite_data = await this.favourite_model.findOne({ user: user_id, favourite_user: request.body.type_id })
        if (favourite_data) {
          return response
            .status(400)
            .send({ message: 'Already added as favourite' })
        }
        await this.favourite_model.create({
          user: user_id,
          favourite_user: request.body.type_id,
          favourite_type: 'user',
          created_by: request.user.email
        })
      } else if (request.body.type == 'job') {
        message = 'Job has been added to wishlist successfully'

        let favourite_data = await this.favourite_model.findOne({ user: user_id, favourite_job: request.body.type_id })
        if (favourite_data) {
          return response
            .status(400)
            .send({ message: 'Already added as favourite' })
        }
        await this.favourite_model.create({
          user: user_id,
          favourite_job: request.body.type_id,
          favourite_type: 'job',
          created_by: request.user.email
        })
      }

      return response
        .status(200)
        .send({ message: message })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method removeFavourite
   * @description remove user or job as favourite
   * @param {object} request
   * @param {object} response
   */
  async removeFavourite(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can("shortlist.destroy")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      /** Request validation */
      let validation = await request.validate({
        type: 'required',
        type_id: 'mongoId|required'
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      let user_id = ""
      if(request.user.type == 'admin'){
        user_id = request.body.user_id
      }else{
        user_id = request.user._id
      }
      let message = ''
      if (request.body.type == 'user') {
        message = 'Employee has been removed from shortlist successfully'
        let favourite_data = await this.favourite_model.findOne({ user: user_id, favourite_user: request.body.type_id })
        if (!favourite_data) {
          return response
            .status(400)
            .send({ message: 'No favourite found' })
        }
        await this.favourite_model.deleteOne({ user: user_id, favourite_user: request.body.type_id })
      } else if (request.body.type == 'job') {
        message = 'Job has been removed from wishlist successfully'

        let favourite_data = ''
        if(request.user.type == 'admin'){
          favourite_data = await this.favourite_model.findOne({favourite_job: request.body.type_id })
        }else{
          favourite_data = await this.favourite_model.findOne({ user: user_id, favourite_job: request.body.type_id })
        }
        if (!favourite_data) {
          return response
            .status(400)
            .send({ message: 'No favourite found' })
        }
        await this.favourite_model.deleteOne({ _id:favourite_data._id })
      }

      return response
        .status(200)
        .send({ message: message })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
  /**
   * @method checkFavourite
   * @description check is user or job in favourite or not
   * @param {object} request
   * @param {object} response
   */
  async checkFavourite(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("favourites.checkFavourite")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      let validation = await request.validate({
        type: 'required',
        type_id: 'mongoId|required'
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })
      let favourite_data = ''
      if (request.query.type == 'user') {
        favourite_data = await this.favourite_model.findOne({
          user: request.user._id,
          favourite_user: request.query.type_id 
        })
      } else {
        favourite_data = await this.favourite_model.findOne({
          user: request.user._id,
          favourite_job: request.query.type_id
        })
      }
      if (!favourite_data) {
        return response
          .status(200)
          .send({ message: 'No favourite data found', favourite: false })
      }
      return response
        .status(200)
        .send({ message: 'Favourite data found', favourite: true })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
}
