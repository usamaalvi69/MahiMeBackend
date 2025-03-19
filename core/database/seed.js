module.exports = class Seed {


    constructor() {
        this.schemas = []
    }

    async define(name, schema) {
        this.schemas[name] = schema
    }

    async createOne(name, model, condition, data = null, recursive = false) {
        // if schema is defined, use that
        if (this.schemas[name] !== undefined && recursive == false) {
            data = this.schemas[name]
        }
        let response = null
        const db_model = new model(data)
        let model_exists = await model.find(condition)
        if (model_exists.length == 0) {
            response = await db_model.save()
            console.log(name + ' seeded: ', response._id)
        } else {
            response = model_exists[0]
            console.log(name + ' already seeded.')
        }
        return response
    }

    async createMany(name, model, field, data = null) {
        // if schema is defined, use that
        if (this.schemas[name] !== undefined) {
            data = this.schemas[name]
        }
        let responses = []
        for (let i = 0; i < data.length; i++) {
            const item = data[i]
            responses.push(await this.createOne(name, model, { [field]: item.name }, item, true))
        }
        return responses
    }

}