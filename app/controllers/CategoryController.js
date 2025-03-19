const mongoose = require('mongoose')
/**
 * @class CategoryController
 * @description Handles all user related CRUD operations
 */
module.exports = class CategoryController {
  /**
   * @constructor
   * @description Handles autoloaded dependencies
   */
  constructor(app) {
    this.category_model = app.get('CategoryModel')
    this.sub_category_model = app.get('SubCategoryModel')
  }
  /**
    * @method feIndex
    * @description Returns list of categories
    * @param {object} request
    * @param {object} response
    */
  async feIndex(request, response) {
    try {
      /** Permission validation */
      // let allowed = permissions.can("categories.index")
      // if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      /** Request validation */
      let categories = await this.category_model
        .find({ deleted_at: null })
        .sort({ name: 1 })
        .collation({ locale: "en", strength: 2 })
        .populate('sub_categories')
        .lean()

      for(let i=0;i<categories.length;i++){
        let sub_categories = categories[i].sub_categories
        sub_categories.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        categories[i].sub_categories = sub_categories
      }

      /** Response */
      return response.status(200).json({
        categories
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      // return response.status(400).send({ message: "Something went wrong" })
    }
  }
  /**
   * @method index
   * @description Returns list of categories
   * @param {object} request
   * @param {object} response
   */
  async index(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can("categories.index")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      let filters = await request.filter({
        // search: "likes:name",
        skip: "skip:0",
        limit: "limit:10",
        sort: "sort:_id",
        order: "order:1"
      })
      filters.find['deleted_at'] = null
      if (request.query.search && request.query.search != '') {
        filters.find['$or'] = [
          { name: new RegExp('.*' + request.query.search + '.*', 'i') },
          // { 'sub_categories.name': new RegExp('.*' + request.query.search + '.*', 'i') }

        ]
      }
      let categories = await this.category_model
        .find(filters.find)
        .skip(filters.query.skip)
        .limit(filters.query.limit)
        .sort(filters.query.sort)
        .collation({ locale: "en", strength: 2 })
        .select(filters.projection)
        .populate('sub_categories')
        .lean()
        for(let i=0;i<categories.length;i++){
          let sub_categories = categories[i].sub_categories
          sub_categories.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
          categories[i].sub_categories = sub_categories
        }
        
      let total = await this.category_model.countDocuments(filters.find)

      /** Response */
      return response.status(200).json({
        pagination: {
          skip: filters.query.skip,
          limit: filters.query.limit,
          total
        },
        categories
      })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      // return response.status(400).send({ message: "Something went wrong" })
    }
  }

  /**
   * @method store
   * @description Create new category
   * @param {object} request
   * @param {object} response
   */
  async store(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can("categories.store")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      /** Request validation */
      let validation = await request.validate({
        name: 'required',
        sub_categories: 'required'
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Title is required', errors: validation })


      let category_exist = await this.category_model.findOne({
        name: request.body.name
      })
      if (category_exist) {
        return response.status(400).send({ message: 'Category already exist' })
      }
      request.body.created_by = request.user.email

      /** Response */
      var category = await this.category_model.create({
        name: request.body.name,
        created_by: request.user.email
      })

      for (let i = 0; i < request.body.sub_categories.length; i++) {

        let sub_cate = await this.sub_category_model.create({
          name: request.body.sub_categories[i].name,
          created_by: request.user.email
        })
        let created_category = await this.category_model.findOne({
          _id: category._id
        })
        created_category.sub_categories.push(sub_cate._id)
        created_category.save()
      }

      return response.status(200).json({
        message: 'Category created successfully',
        category: category
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
   * @description Returns single category based on provided id
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async show(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can("categories.show")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      /** Request validation */
      let result = await request.validate({
        _id: 'mongoId|required'
      })
      if (result && result.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: result })
      let category = await this.category_model.findOne({
        _id: request.params._id
      }).populate('sub_categories')

      if (!category)
        return response.status(400).json({ message: 'Category does not exist' })

        let sub_categories = category.sub_categories
        sub_categories.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        category.sub_categories = sub_categories
    

      /** Response */
      return response.status(200).json({ category })
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
   * @description Update category
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async update(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can("categories.update")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      let validation = await request.validate({
        _id: 'required|mongoId'
      })

      if (validation && validation.length > 0)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: validation })

      let category_exist = await this.category_model.findOne({
        name: request.body.name,
        _id: { $ne: request.params._id }
      })
      if (category_exist) {
        return response.status(400).send({ message: 'Category already exist' })
      }

      await this.sub_category_model.updateMany(
        { _id: { $in: request.body.removed_items } },
        {
          $set: { deleted_at: new Date() },
        },
        { new: true, useFindAndModify: false }
      )
      let created_category = await this.category_model.findOne({
        _id: request.params._id
      })
      created_category.sub_categories = []
      for (let i = 0; i < request.body.sub_categories.length; i++) {
        if (request.body.sub_categories[i]._id == null) {
          let sub_cate = await this.sub_category_model.create({
            name: request.body.sub_categories[i].name,
            created_by: request.user.email
          })
          created_category.sub_categories.push(sub_cate._id)
        } else {
          let sub_cate = await this.sub_category_model.findOneAndUpdate(
            { _id: request.body.sub_categories[i]._id },
            {
              $set: { name: request.body.sub_categories[i].name, updated_by: request.user.email },
            },
            { new: true, useFindAndModify: false }
          )
          created_category.sub_categories.push(sub_cate._id)
        }
      }
      created_category.name = request.body.name
      created_category.updated_by = request.user.email
      created_category.save()


      /** Response */
      return response
        .status(200)
        .json({ message: 'Category updated successfully' })
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
   * @description delete category
   * @param {object} request
   * @param {object} response
   * @return {object} response
   */
  async destroy(request, response) {
    try {
      /** Permission validation */
      let allowed = permissions.can("categories.destroy")
      if (!allowed) return response.status(400).json({ message: 'Validation error', errors: "Permission Denied" })

      /** Request validation */
      let result = await request.validate({
        _id: 'required|mongoId'
      })
      if (result && result.length)
        return response
          .status(400)
          .json({ message: 'Validation error', errors: result })
      let category = await this.category_model.findOne({
        _id: request.params._id
      })

      if (!category) {
        return response
          .status(400)
          .json({ message: 'Category does not exists' })
      }

      await this.category_model.findOneAndUpdate(
        { _id: request.params._id },
        {
          $set: { deleted_at: new Date() },
        },
        { new: true, useFindAndModify: false }
      )
      // let users = await this.user_model.find({ category: category._id })
      // if (users && users.length) {
      //   return response
      //     .status(400)
      //     .json({ message: 'Category is used in other entites, Please remove those first' })
      // }
      // await category.remove()

      /** Response */
      return response
        .status(200)
        .json({ message: 'Category deleted successfully' })
    } catch (err) {
      logger.log({
        level: 'error',
        message: err
      })
      return response.status(400).send({ message: 'Something went wrong' })
    }
  }


}
