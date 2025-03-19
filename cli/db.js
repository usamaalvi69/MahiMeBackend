module.exports = class db {
  /**
   * @description Any declarations or contructor logic goes here
   */
  setup(callback) {
    global.__skip_server = true;
    const Application = require("../core/application");
    new Application().run();
    fs.exists(root_directory + "/app/seeds/Seeder.js", (exists) => {
      if (!exists) {
        console.log("Seeder is not configured: app/seeds/Seeder.js");
        callback();
      }
      callback();
    });
  }

  /**
   * @description Default method, which automatically executed
   */
  index() {}

  /**
   * @description Logic you want to execute before any method is called from this command
   */
  pre() {}

  /**
   * @description Logic you want to execute after any method is called from this command
   */
  post() {}

  /**
   * @description Custom method to seed the db, should be async
   */
  async seed() {
    let seeder = resolveOnce("app.seeds.Seeder");
    console.log("I am seeded");
    await seeder.seed(async () => {
      await __mongoose.disconnect();
      process.exit();
    });
  }
};
