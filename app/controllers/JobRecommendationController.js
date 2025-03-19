/**
 * @class JobRecommendationController
 * @description Handles all job recommendations related Apis
 */
module.exports = class JobRecommendationController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.user_model = resolveOnce('app.models.UserModel')
    this.job_model = resolveOnce('app.models.JobModel')
    this.favourite_model = resolveOnce('app.models.FavouriteModel')
    this.job_applicant_model = resolveOnce('app.models.JobApplicantModel')
    this.general_helper = resolveOnce('app.helpers.GeneralHelper')

  }
  /**
   * @method index
   * @description Returns list of items
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async index(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can('jobs.listing')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })

      if (request.user.type == 'employer') {
        return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })
      }
      let filters = await request.filter({
        search: 'likes:job_id,title',
        skip: 'skip:0',
        limit: 'limit',
        sort: 'sort:_id',
        order: 'order:-1'
      })
      let user = await this.user_model
        .findOne({ _id: request.user._id })
        .populate('category')
        .populate('sub_category')

      let job_applicants = await this.job_applicant_model.find({
        employee: user._id
      })
      const applicant_ids = job_applicants.map(applicant => applicant.job)

      filters.find['status'] = 'open'
      filters.find['_id'] = { $nin: applicant_ids }
      if (request.body.category && request.body.category != '') {
        filters.find['category'] = request.body.category
      }
      if (request.body.sub_category && request.body.sub_category != '') {
        filters.find['sub_category'] = request.body.sub_category
      }
      if (request.body.start_time && request.body.end_time && request.body.start_time != '' && request.body.end_time != '') {
        filters.find['time_slots.start_time'] = { $gte: request.body.start_time } // request.body.start_time   
        filters.find['time_slots.end_time'] = { $lte: request.body.end_time } // request.body.end_time 
      }

      if (request.body.start_date && request.body.end_date && request.body.start_date != '' && request.body.end_date != '') {
        let dates = await this.general_helper.getNZDates(request.body.start_date, request.body.end_date)
        filters.find['time_slots.dates'] = { $gte: new Date(dates.start_date) }
        filters.find['time_slots.dates'] = { $lte: new Date(dates.end_date) }
      }
      filters.find['deleted_at'] = null
      let jobs = await this.job_model
        .find(filters.find)
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .populate({
          path: 'employer',
          populate: [
            { path: 'photo', select: 'name' },
            { path: 'category', select: 'name' },
            { path: 'sub_category', select: 'name' }
          ],
          select: { first_name: 1, business_name: 1, first_name: 1, last_name: 1, business_address: 1 }
        })
        .populate('category')
        .populate('sub_category')
        .lean()

      let search_location = ''
      if (request.body.location && request.body.location != '') {
        search_location = request.body.location
      }
      let search_radius = 0
      if (request.body.radius && request.body.radius != '') {
        search_radius = parseInt(request.body.radius) * 1000
      } else {
        let settings = await this.general_helper.getSettingsKeys(['job_search_radius'])
        search_radius = parseInt(settings.job_search_radius) * 1000
      }
      let recommended = []
      if (user.sub_category && user.sub_category.name && user.category && user.category.name) {
        recommended = await this.generateJobRecommendations(user, jobs, search_radius, search_location)
      }

      let total = recommended.length
      /** Response */
      return response.status(200).json({
        pagination: {
          skip: filters.query.skip,
          limit: filters.query.limit,
          total
        },
        recommended: recommended
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
  async generateJobRecommendations(userProfile, jobData, search_radius, search_location) {

    const similarities = []
    for (const jobListing of jobData) {
      const similarity = await this.calculateSimilarity(userProfile, jobListing, search_radius, search_location)
      let radius_exist = 1
      if (search_location != '') {
        radius_exist = await this.caculateDistance(search_location, jobListing.location, search_radius)
      }
      let is_favourite = await this.favourite_model.findOne({ user: userProfile._id, favourite_job: jobListing._id })
      jobListing.favourite = (is_favourite) ? true : false
      if (radius_exist == 1) {
      similarities.push({ jobListing, similarity })
      }
    }

    similarities.sort((a, b) => b.similarity - a.similarity)
    const recommendations = similarities.map(entry => entry.jobListing)
    return recommendations
  }

  /**
 * @method run
 * @description Run automatically triggered when job runs
 */
  async calculateSimilarity(userProfile, jobDetail, search_radius, search_location) {
    let category_similarity = (userProfile.category._id == jobDetail.category._id) ? 1 : 0
    let sub_category_similarity = (userProfile.sub_category._id == jobDetail.sub_category._id) ? 1 : 0
    if (search_location == '') {
      search_location = userProfile.preferred_location
    }
    let distanceSimilarity = await this.caculateDistance(search_location, jobDetail.location, search_radius)
    let datesSimilarity = await this.calculateDatesSimilarty(userProfile.time_slots, jobDetail.time_slots)


    // let favourite = await this.favourite_model.find({ user: userProfile._id, favourite_jobs: { $in: [jobListing._id] } })

    const similarity =
      0.3 * distanceSimilarity +
      0.3 * category_similarity +
      0.3 * sub_category_similarity
      + 0.1 * datesSimilarity

    return similarity
  }

  async calculateDatesSimilarty(user_dateslots, job_dateslots) {
    let date_similartity = 0
    for (let u = 0; u < (user_dateslots.dates).length; u++) {
      let user_date = user_dateslots.dates[u]
      for (let j = 0; j < (job_dateslots.dates).length; j++) {
        let job_date = job_dateslots.dates[j]
        if (user_date.getUTCFullYear() == job_date.getUTCFullYear() &&
          user_date.getUTCMonth() == job_date.getUTCMonth() &&
          user_date.getUTCDate() == job_date.getUTCDate()) {
          date_similartity++
        }
      }
    }
    return date_similartity
  }

  async caculateDistance(user_location, job_location, search_radius) {
    let distance_similartity = 0

    if (user_location.lattitude != null && user_location.longitude != null) {

      let lat1 = job_location.lattitude
      let lon1 = job_location.longitude

      let lat2 = user_location.lattitude
      let lon2 = user_location.longitude
      let R = 6371
      let dLat = (lat2 - lat1) * (Math.PI / 180)
      let dLon = (lon2 - lon1) * (Math.PI / 180)
      lat1 = lat1 * (Math.PI / 180)
      lat2 = lat2 * (Math.PI / 180)

      let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      let d = R * c
      let distance_in_meters = d * 1000
      if (distance_in_meters <= search_radius) {
        distance_similartity = 1
      }
    }
    return distance_similartity
  }
}
