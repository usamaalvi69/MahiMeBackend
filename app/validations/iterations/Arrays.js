/**
 * @class Arrays
 * @description Applies validation regarding arrays
 */
 module.exports = class Arrays {

    constructor() { }

    /**
     * @method setup
     * @description Setup all validations to be triggered
     */
    setup(request) {
        request.define('arr.isArray', '', this.arrIsArray)
        request.define('arr.items', ' {operator} {number}', this.arrComparisons)
        request.define('arr.has', ':[depth]={value}', this.arrHas)
    }

    /**
     * @method arrIsArray
     * @desciption Checks if field value is an array
     */
    arrIsArray(validation_class, name, field, schema) {
        if (!Array.isArray(field.value)) {
            validation_class.errors.push("Field {" + field.name + "} value is not an array")
            return false
        }
    }

    /**
     * @method arrComparisons
     * @desciption Comparisons between array items i.e. ==,<,>,<=,>=
     */
    arrComparisons(validation_class, name, field, schema) { 
        console.log(schema)
        if (schema.operator == '==') {
            if (field.value.length != schema.number) {
                validation_class.errors.push("Field {" + field.name + "} array items count is not equal to {" + schema.number + "}")
                return false
            }
        } else if (schema.operator == '>') {
            if (field.value.length <= schema.number) {
                validation_class.errors.push("Field {" + field.name + "} array items count is not greater then {" + schema.number + "}")
                return false
            }
        } else if (schema.operator == '<') {
            if (field.value.length >= schema.number) {
                validation_class.errors.push("Field {" + field.name + "} array items count is not less then {" + schema.number + "}")
                return false
            }
        } else if (schema.operator == '<=') {
            if (field.value.length > schema.number) {
                validation_class.errors.push("Field {" + field.name + "} array items count is not less then or equal to {" + schema.number + "}")
                return false
            }
        } else if (schema.operator == '>=') {
            if (field.value.length < schema.number) {
                validation_class.errors.push("Field {" + field.name + "} array items count is not greater then or equal to {" + schema.number + "}")
                return false
            }
        }
    }

    /**
     * @method arrHas
     * @desciption If array has an element key name on specific depth
     */
    arrHas(validation_class, name, field, schema) { 
        let keys = schema.depth
        let current_depth = field.value
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            current_depth = current_depth[key]
        }
        if (current_depth != schema.value) {
            validation_class.errors.push("Field {" + field.name + "." + keys.join(".") + "} depth value is not equals {" + schema.value + "}, expecting {" + current_depth + "}")
            return false
        }
    }


    
}