/**
 * @class Limit
 * @description Applies filters regarding limit
 */
 module.exports = class limit {

    constructor() { }

    /**
     * @method setup
     * @description Setup all filters to be triggered
     */
    setup(request) {
        request.define('limit', ':{default}', this.applyLimit)
    }

    /**
     * @method applyLimit
     * @desciption Apply limit on query
     * @param data {query: {}, find: {}, projection: {}}
     * @param name name of filter
     * @param field request variable on which filter is applied i.e. field: {name: '', value: ''}
     * @param schema schema variables of format for filter you defined
     * @return data [it must be retuned]
     */
    applyLimit(data, name, field, schema) {
        if(field.value == undefined) return data
        field.value = parseInt(field.value) // force convert input value to int
        // console.log(field, schema)
        let limit_value = schema.default
        if(field.value) limit_value = field.value
        data['query']['limit'] = limit_value
        return data
    }
    
}