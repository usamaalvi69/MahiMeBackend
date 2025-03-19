module.exports = class Seeder {
  constructor() { }

  async seed(complete) {
    let user_seeder = resolve("app.seeds.UserSeeder")
    let category_seeder = resolve("app.seeds.CategorySeeder")
    let setting_seeder = resolve("app.seeds.SettingSeeder")

    await user_seeder.up()
    await category_seeder.up()
    await setting_seeder.up()

    complete()
  }
};
