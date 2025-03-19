/**
 * @class Numbers
 * @description Applies validation regarding numbers
 */
module.exports = class Numbers {

    constructor() { }

    /**
     * @method setup
     * @description Setup all validations to be triggered
     */
    setup(request) {
        request.define('is_even', ':{flag}', this.isEven)
    }

    /**
     * @method isEven
     * @desciption Checks if the given number is even or odd based on a flag
     */
    isEven(validation_class, name, field, schema) { 
        if (schema.flag == 1) { //even            
            if (field.value % 2 != 0) {
                validation_class.errors.push("Field {" + field.name + "} value is not even")
                return false
            }
        } else { //odd            
            if (field.value % 2 == 0) {
                validation_class.errors.push("Field {" + field.name + "} value is not odd")
                return false
            }
        }
    }
    
}