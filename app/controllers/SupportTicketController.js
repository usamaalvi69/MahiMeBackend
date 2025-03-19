const mongoose = require('mongoose')
const moment = require('moment')
/**
 * @class SupportTicketController
 * @description Handles all support_ticket related CRUD operations
 */
module.exports = class SupportTicketController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.support_ticket_model = app.get('SupportTicketModel')
    this.user_model = app.get('UserModel')
    this.general_helper = app.get('GeneralHelper')
    this.notification_model = app.get('NotificationModel')
  }

  /**
   * @method index
   * @description Returns list of support_ticket
   * @param {object} request
   * @param {object} response
   */
  async index(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can('supportTickets.index')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })
      /** Request validation */
      let filters = await request.filter({
        // search: 'like:title',
        skip: 'skip:0',
        limit: 'limit',
        sort: 'sort:_id',
        order: 'order:-1'
      })

      if (request.user.type === 'employee' || request.user.type === 'employer') {
        filters.find['user'] = request.user._id
      }
      if (request.query.status && request.query.status != '') {
        filters.find['status'] = request.query.status
      }
      let total = await this.support_ticket_model.countDocuments(filters.find)
      if (request.query.only_count && request.query.only_count !== '') {
        filters.find['status'] = {
          $in: 'open'
        }
        let total = await this.support_ticket_model.countDocuments(filters.find)

        return response.status(200).json({ total })
      }
      let submited_by = {}
      if (request.query.search && request.query.search != '') {
        let nameFilters = []
        let searchParts = request.query.search.split(" "); // Split into words

        nameFilters = searchParts.map((part) => ({
          $or: [
            { first_name: { $regex: part, $options: "i" } },
            { last_name: { $regex: part, $options: "i" } },
          ],
        }));

        if(nameFilters.length) 
          submited_by = {$and: nameFilters}
        else
          submited_by = {}
      }
      let support_tickets = await this.support_ticket_model
        .find(filters.find)
        .populate('messages.media')
        .populate({ path: 'messages.from_user', populate: 'photo' })
        .populate('messages.to_user')
        .populate({ path: 'user', match: {...submited_by}})
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .select(filters.projection)
        .lean()
      let completed_support_ticket = []
      let active_support_ticket = []
      support_tickets = support_tickets.filter(item => item?.user)
      if(request.query.search){
        filters.find['title'] = { $regex: request.query.search, $options: "i" }
      }
      let title_support_tickets = await this.support_ticket_model
        .find(filters.find)
        .populate('messages.media')
        .populate({ path: 'messages.from_user', populate: 'photo' })
        .populate('messages.to_user')
        .populate({ path: 'user'})
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .select(filters.projection)
        .lean()
        const combinedResults = [...title_support_tickets, ...support_tickets].filter(
          (ticket, index, self) =>
            index === self.findIndex((t) => t._id.toString() === ticket._id.toString())
        );
        support_tickets = combinedResults

      for (var i = 0; i < support_tickets.length; i++) {
        var messages = support_tickets[i].messages
        var message_count = 0
        for (var j = 0; j < messages.length; j++) {
          if (
            messages[j].message_status === 'un_seen'
          ) {
            message_count++
          }
        }
        support_tickets[i].message_count = message_count

        if (support_tickets[i].status === 'closed') {
          completed_support_ticket.push(support_tickets[i])
        } else {
          active_support_ticket.push(support_tickets[i])
        }
      }
      /** Response */
      return response.status(200).json({
        pagination: {
          skip: filters.query.skip,
          limit: filters.query.limit,
          total
        },
        support_tickets,
        completed_support_ticket,
        active_support_ticket
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
   * @method store
   * @description Create new support_ticket
   * @param {object} request
   * @param {object} response
   */
  async store(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can('supportTickets.store')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })

      /** Request validation */

      var validation = await request.validate({
        title: 'string|required'
      })
      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      let user = await this.user_model.findOne({
        _id: request.user._id
      })
      
      if(!user){
        return response.status(400).send({ message: 'User does not exist' })
      }
      request.body.user = request.user._id

      let message_array = []

      if (request.body.message) {
        let admin = await this.user_model.findOne({
          type: 'admin'
        })
        let today = new Date()
        message_array.push({
          message: request.body.message,
          media: request.body.media,
          from_user: request.user._id,
          to_user: admin._id,
          message_status: request.body.message_status,
          message_date: today
        })
      }

      request.body.messages = message_array

      var support_ticket = await this.support_ticket_model.create(request.body)
      if (request.user.type !== 'admin') {

        let admin = await this.user_model.findOne({
          type: 'admin'
        })
        if (admin) {
          await this.pushNotification(admin, 'New Support Ticket', support_ticket.messages[0].message.length > 50 ? support_ticket.messages[0].message.substring(0,50) + '...' : support_ticket.messages[0].message, support_ticket._id)
        }
      }
      return response.status(200).json({
        message: 'support ticket created successfully',
        support_ticket: support_ticket
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
   * @method show
   * @description Returns single support_ticket based on provided id
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async show(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can('supportTickets.show')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })

      /** Request validation */
      let result = await request.validate({
        _id: 'mongoId|required'
      })
      if (result && result.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: result })
          const _support_ticket = await this.support_ticket_model.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(request.params._id) } },
            // Deconstruct the `messages` array into individual documents
            { $unwind: "$messages" },
            // Extract the date part of `messages.createdAt` and group by it
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$messages.message_date" } }
                },
                totalMessages: { $sum: 1 }, // Count messages for each date
                messages: { $push: "$messages" } // Collect messages for each date
              }
            },
            { $sort: { "_id.date": 1 } } // Sort by date
          ]);
        
        
      let support_ticket = await this.support_ticket_model
        .findOne({ _id: request.params._id })
        .populate('messages.media')
        .populate({ path: 'messages.from_user', populate: 'photo' })
        .populate({path: 'messages.to_user', populate: 'photo'})
        .populate({path: 'user', populate: 'photo'})

      if (!support_ticket)
        return response
          .status(400)
          .json({ message: 'support_ticket does not exist' })

      /** Response */
      return response.status(200).json({ support_ticket, messages: _support_ticket })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method update
   * @description Update support_ticket
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async update(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can('supportTickets.update')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })
      let validation = await request.validate({
        _id: 'required|mongoId'
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      request.body.updated_by = request.user.email
      /** Image Update */
      var support_ticket = await this.support_ticket_model.findOne({
        _id: request.params._id
      }).populate('messages.from_user').populate('messages.to_user')
      if (request.user.type === 'practice') {
        var user_name = request.user.first_name + ' ' + request.user.last_name
      }
      if (request.body.message) {
        if (request.user.type === 'admin') {
          await this.pushNotification(support_ticket.messages[0].from_user, 'Support Ticket Update', request.body.message.length > 50 ? request.body.message.substring(0,50) + '...' : request.body.message, support_ticket._id)
          request.body.from_user = support_ticket.messages[0].to_user
          request.body.to_user = support_ticket.messages[0].from_user
        } else {
          await this.pushNotification(support_ticket.messages[0].to_user, 'Support Ticket Update', request.body.message.length > 50 ? request.body.message.substring(0,50) + '...' : request.body.message, support_ticket._id)
          request.body.from_user = support_ticket.messages[0].from_user
          request.body.to_user = support_ticket.messages[0].to_user
        }
      }
      if (request.body.message && request.body.message !== '') {
        let today = new Date()
        support_ticket.messages.push({
          message: request.body.message,
          to_user: request.body.to_user,
          from_user: request.body.from_user,
          message_status: request.body.message_status,
          media: request.body.media,
          message_date: today
        })
      }
      await support_ticket.save()
      let updated = await this.support_ticket_model.findOneAndUpdate(
        { _id: request.params._id },
        {
          $set: request.body
        },
        { new: true, useFindAndModify: false }
      )
      updated = await this.support_ticket_model.findOne({
        _id: request.params._id
      })
      /** Response */
      return response.status(200).json({
        message: 'support_ticket updated successfully',
        support_ticket: updated
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
   * @method destroy
   * @description delete role
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async destroy(request, response) {
    try {
      /** Permission validation */

      let allowed = permissions.can("supportTickets.destroy")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      /** Request validation */
      let result = await request.validate({
        _id: 'required|mongoId'
      })
      if (result && result.length)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: result })
      let support_ticket = await this.support_ticket_model.findOne({
        _id: request.params._id
      })

      if (!support_ticket) {
        return response
          .status(400)
          .json({ message: 'Support Ticket does not exists' })
      }

      await support_ticket.remove()

      /** Response */
      return response
        .status(200)
        .json({ message: 'Support Ticket deleted successfully' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method updateMessageStatus
   * @description Returns a user profile image
   * @param {object} request
   * @param {object} response
   * @return {image} response
   */
  async updateMessageStatus(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can('SupportTickets.updateMessageStatus')
      // if (!allowed)
      //   return response
      //     .status(400)
      //     .json({ message: 'Validation error', errors: 'Permission Denied' })

      if (request.body.ticket_id) {
        let ticket = await this.support_ticket_model.findOne({
          _id: request.body.ticket_id
        })
        if (ticket) {
          if(request.user.type == 'admin'){
            const un_seen_message = ticket.messages.filter(
              message => message.admin_message_status === 'un_seen'
            )

            if (un_seen_message.length > 0) {
              un_seen_message.forEach(message => {
                message.admin_message_status = 'seen'
              })

              await ticket.save()
              return response.status(200).send({ message: 'Messages are seen' })
              
            } else {
              return response.status(200).send({ message: 'Messages are seen' })
            }
          }else{
            const un_seen_message = ticket.messages.filter(
              message => message.user_message_status === 'un_seen'
            )

            if (un_seen_message.length > 0) {
              un_seen_message.forEach(message => {
                message.user_message_status = 'seen'
              })

              await ticket.save()
              return response.status(200).send({ message: 'Messages are seen' })
              
            } else {
              return response.status(200).send({ message: 'Messages are seen' })
            }
          }
        } else {
          return response.status(400).send({ message: 'No ticket found' })
        }
      }
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }

  /**
   * @method deleteCompletedTickets
   * @description Returns a user profile image
   * @param {object} request
   * @param {object} response
   * @return {image} response
   */
  async deleteCompletedTickets(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can('supportTickets.destroy')
      if (!allowed)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: 'Permission Denied' })
      let complete_tickets = request.params.completed_tickets.split(',')
      let tickets = await this.support_ticket_model.find({
        _id: { $in: complete_tickets },
        status: 'closed'
      })
      if (tickets.length > 0) {
        await this.support_ticket_model.deleteMany({
          _id: tickets
        })
        return response
          .status(200)
          .send({ message: 'Completed tickets are deleted successfully' })
      } else {
        return response.status(400).send({ message: 'No ticket found' })
      }
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }
  async pushNotification(
    user_id,
    title,
    message,
    path_id,
  ) {
    try {
      if (user_id.firebase_token && user_id.allow_push_notifications) {
        await this.general_helper.sendPushNotification(
          user_id.firebase_token,
          title,
          message,
          '',
          { support_id: path_id }

        )
      }
      if (user_id.type == 'admin') {
        var path = '/admin-support-detail/' + path_id
      } else {
        var path = '/support-detail/' + path_id
      }
      await this.notification_model.create({
        title: title,
        message: message,
        to_user: user_id._id,
        url: path,
        notification_redirect_id: path_id
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return { error: true, message: 'Something went wrong' }
    }
  }
}
