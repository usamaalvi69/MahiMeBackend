/**
 * @description Define and auto load/resolve all dependencies required inside of application
 * NOTE*** This method will be removed in favour of "Container" in the future
 */
module.exports = [
  {
    module: 'app',
    resolve: [
      {
        // controllers: ["controllers.ControllerName"],
        // dependencies: [
        //   {
        //     targets: [
        //       "models.ModelName"
        //     ],
        //   },
        // ],
      }
    ]
  }
]
