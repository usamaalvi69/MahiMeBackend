/**
 * Controller Class
 */
module.exports = class Controller {
  constructor(name) {
    this.index = -1;
    this._controller = {
      name: name,
      entities: [],
    };
  }

  inject(entities) {
    this._controller.entities = entities;
    __dependency_controllers.push(this._controller);
    this.index = __dependency_controllers.length - 1;
    return this;
  }

  validators(validators) {
    if (this.index > -1) {
      validators.forEach((v) => {
        __dependency_controllers[this.index].entities.push("validators." + v);
      });
    }
    return this;
  }

  models(models) {
    if (this.index > -1) {
      models.forEach((v) => {
        __dependency_controllers[this.index].entities.push("models." + v);
      });
    }
    return this;
  }

  helpers(helpers) {
    if (this.index > -1) {
      helpers.forEach((v) => {
        __dependency_controllers[this.index].entities.push("helpers." + v);
      });
    }
    return this;
  }
};
