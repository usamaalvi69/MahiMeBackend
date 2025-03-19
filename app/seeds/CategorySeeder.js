module.exports = class CategorySeeder {
  constructor() {
    this.category_model = resolveOnce('app.models.CategoryModel')
    this.sub_categories_model = resolveOnce('app.models.SubCategoryModel')
  }

  async up() {
    let category_id = null
    let category = await this.category_model.findOne({ name: 'Food' })
    if (category) {
      category_id = category._id
      console.log('category already Seeded')
    } else {
      let food_category = await this.category_model.create({
        name: 'Food',
      })
      if (food_category) {
        category_id = food_category._id
        console.log('category Seeded Successfully')
      }
    }

    let sub_category = await this.sub_categories_model.findOne({ name: 'Rice' })
    if (sub_category) {
      console.log('Sub category already Seeded')
    } else {
      let sub_category = await this.sub_categories_model.create({
        name: 'Rice',
        category: category_id
      })
      if (sub_category) {
        console.log('Sub category Seeded Successfully')
        let update_category = await this.category_model.findOne({
          _id: category_id
        })
        let sub_categories = []
        sub_categories.push(sub_category._id)
        update_category.sub_categories = sub_categories
        await update_category.save()
      }
    }
  }
}
