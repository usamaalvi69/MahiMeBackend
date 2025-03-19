/**
 * @class MongoHandle
 * @description handles mongodb queries
 */
 module.exports = class MongoHandle {

    constructor(model) {
        this.model = model
        this.query = {
           find: {},
           projection: {}
        }
    }

    select(string) {
      let selectors = string.split(',')
      for (let i = 0; i < selectors.length; i++) {
         this.query.projection[selectors[i]] = 1
      }
    }

    where(keyOrArray, value) {
      if(value === undefined) { // array
         
      }else{ // key-value pair

      }
    }

    orWhere() {}

    sort() {}

    groupBy() {}

    limit() {}

    offset() {}

    create() {}

    createOrFirst() {}

    insert() {}

    update() {}

    delete() {}

    whereHas() {}

    with() {}

    async get() {}

    async first() {}

 }