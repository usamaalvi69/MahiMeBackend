/**
 * @class Validations
 * @description handle validations rules and fields
 */

var ObjectId = require('mongoose').Types.ObjectId

module.exports = class Validations { 

    constructor(res) {
        this.res = __response
        this.errors = []
    }

    collectErrors() { 
        return this.errors
    }

    generateFields(schema, messages, res) {
        // Using global response
        res = __response
        // Collecting request data
        let data = res.req.body
        for (let filename in res.req.files) {
            data[filename] = res.req.files[filename]
        }
        for (let param in res.req.params) { 
            data[param] = res.req.params[param]
        }
        for (let qery in res.req.query) { 
            data[qery] = res.req.query[qery]
        }
        // console.log('data: ', data)

        let fields = {}
        for (let field_name in schema) {
            if (fields[field_name] === undefined) fields[field_name] = {}

            fields[field_name].validations = schema[field_name]
            fields[field_name].message = (messages[field_name] ? messages[field_name] : null)
            
            for (let key in data) {
                if (field_name == key) {
                    if (field_name.endsWith('[]')) {
                        if (typeof data[key] === 'string') {
                            fields[field_name].value = [data[key]]
                        } else {
                            fields[field_name].value = data[key]
                        }
                    } else {                        
                        fields[field_name].value = data[key]
                    }
                }
            }
        }

        return fields
    }

    generateRules(fields) {
        let rules = []
        for (let field_name in fields) {
            let validations = fields[field_name].validations.split('|')
            for (let i = 0; i < validations.length; i++) {
                let validation = validations[i]
                let rule = {
                    name: '',
                    type: '',
                    except: '',
                    resolved: '',
                    message: fields[field_name].message,
                    values: [],
                    source: field_name,
                    target: (fields[field_name].value === undefined || fields[field_name].value == 'null' ? null : fields[field_name].value)
                }
                let colon = validation.split(':')
                let validation_commas = []
                if (colon.length > 1) {
                    let comma = colon[1].split(',')
                    if (comma.length > 1) {
                        for (let i = 0; i < comma.length; i++) {
                            validation_commas.push(comma[i])
                        }
                        rule.name = colon[0]
                        rule.values = validation_commas
                    } else {
                        rule.name = colon[0]
                        rule.type = colon[1]
                        if (colon.length > 2) {
                            rule.except = colon[2]
                            // console.log(fields, rule.except)
                            rule.resolved = fields[rule.except].value
                        }
                    }
                } else {
                    rule.name = validation
                }
                rules.push(rule)
            }
        }
        return rules
    }

    // field schema
    // [name]
    // .validations
    // .messages
    // .value
    async customValidate(fields, custom_validations) {
        let validation_status = false
        let field = {}
        for (let field_name in fields) {
            field['name'] = field_name
            field['value'] = fields[field_name].value
            field['validations'] = fields[field_name].validations.split('|')

            for (let i = 0; i < custom_validations.length; i++) {
                const cv = custom_validations[i]
                for (let j = 0; j < field.validations.length; j++) {
                    const v = field.validations[j]
                    let response = this.formatMapping(v, cv.name, cv.rules)
                    if (response.found) {
                        validation_status = await cv.callback(this, response.name, {name: field.name, value: field.value}, response.variables)
                    }
                }
            }
        }
        return validation_status
    }

    async customFilter(fields, data, custom_filters) {
        let field = {}
        for (let field_name in fields) {
            field['name'] = field_name
            field['value'] = fields[field_name].value
            field['validations'] = fields[field_name].validations.split('|')

            for (let i = 0; i < custom_filters.length; i++) {
                const cf = custom_filters[i]
                for (let j = 0; j < field.validations.length; j++) {
                    const v = field.validations[j]
                    let response = this.formatMapping(v, cf.name, cf.rules)
                    if (response.found) {
                        data = await cf.callback(data, response.name, {name: field.name, value: field.value}, response.variables)
                    }
                }
            }
        }
        return data
    }

    formatMapping(validation, name, rules) {
        let temp = validation
        let offset = 0
        let variables = {}
        let found = false
        if (validation.substring(0, name.length) == name) {
            // console.log('Custom Format >>> ' + name)
            found = true
        }
        for (let i = 0; i < rules.length; i++) {
            const r = rules[i]
            let start = offset + temp.indexOf(r.start.token) + r.start.token.length       
            let end = 0
            if (r.end == null) {
                end = validation.length
            } else {
                temp = validation.substring(start, validation.length)
                offset = start
                end = offset +temp.indexOf(r.end.token)
            }
            if (r.target.type == 'variable') {
                variables[r.target.token] = validation.substring(start, end)
            }
            if (r.target.type == 'array') {
                variables[r.target.token] = validation.substring(start, end).split(',')
            }            
        }
        return { found, variables, name }
    }

    parseArrayRules(rule, callback) {
        if (rule.name == 'array') {
            rule.name = rule.type
        }
        let real_target = rule.target
        for (let i = 0; i < real_target.length; i++) {
            rule.target = real_target[i]
            callback(rule)
        }
    }

    required(rule) {
        if (rule.name == 'required') {
            if (!rule.target) {
                this.errors.push('Field {' + rule.source + '} is required.')
                return true
            }
        }
        return false
    }

    same(rule, rules) {
        // console.log(rule)
        let match_value = ''
        let field_value = ''
        if (rule.name == 'same') {
            for (let i = 0; i < rules.length; i++) {
                if(rules[i].source = rule.type) {
                    match_value = rules[i].target
                    field_value = rules[i].source
                    break
                }
            }
            if (match_value != rule.target) {
                this.errors.push('Field {' + rule.source + '} value should be same as Field {' + field_value + '}. Provided {' + rule.target + '}')
                return true
            }
        }
        return false
    }

    string(rule) {
        if (rule.name == 'string' && rule.target) {
            if (typeof rule.target !== "string") {
                this.errors.push('Field {' + rule.source + '} must be a string. Provided {' + rule.target + '}')
                return true
            }
        }
        return false
    }

    number(rule) {
        if (rule.name == 'number' && rule.target) {
            if (typeof rule.target !== "number") {
                this.errors.push('Field {' + rule.source + '} must be a number. Provided {' + rule.target + '}')
                return true
            }
        }
        return false
    }

    min(rule) {
        if (rule.name == 'min' && rule.target) {
            if (rule.target.length < rule.type) {
                this.errors.push('Field {' + rule.source + '} must consist of minimum ' + rule.type + ' characters. Provided {' + rule.target + '}')
                return true
            }
        }
        return false
    }

    max(rule) {        
        if (rule.name == 'max' && rule.target) {
            if (rule.target.length > rule.type) {
                this.errors.push('Field {' + rule.source + '} must not exceed maximum ' + rule.type + ' characters limit. Provided {' + rule.target + '}')
                return true
            }
        }
        return false
    }

    email(rule) {
        if (rule.name == 'email' && rule.target) {
            const email_regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
            if (!email_regex.test(rule.target)) {
                this.errors.push('Field {' + rule.source + '} must be a valid email address. Provided {' + rule.target + '}')
                return true
            }
        }
        return false
    }

    format(rule) {
        if (rule.name == 'format' && rule.target) {
            let validated = this.validateFormat(rule.values, rule.target)
            if (!validated.status) {
                this.errors.push('Field {' + rule.source + '} must be a valid format i.e. ' + validated.format + '. Provided {' + rule.target + '}')
                return true
            }
        }
        return false
    }

    enum(rule) {
        if (rule.name == 'enum' && rule.target) {
            if (!rule.values.includes(rule.target)) {
                this.errors.push('Field {' + rule.source + '} must be either ' + rule.values.join(', ') + '. Provided {' + rule.target + '}')
                return true
            }
        }
        return false
    }

    mongoId(rule) {
        if (rule.name == 'mongoId' && rule.target) {
            if (!ObjectId.isValid(rule.target)) {
                this.errors.push('Field {' + rule.source + '} must be a valid mongo id. Provided {' + rule.target + '}')
                return true
            }
        }
        return false
    }

    file(rule) {
        if (rule.name == 'file' && rule.target != null) { 
            // console.log(rule.target)
            let extension = rule.target.mimetype.split('/')[1]
            if (!rule.values.includes(extension)) {
                this.errors.push('Field {' + rule.source + '} must have a valid extension i.e. ' + rule.values.join(', ') + '. Provided {' + rule.target.mimetype + '}')
                return true
            }
        }
        return false
    }

    async unique(rule) {
        if (rule.name == 'unique' && rule.target != null) {
            // console.log(rule)
            let model_name = rule.type.split('.')[0]
            let field_name = rule.type.split('.')[1]
            let exception = rule.except ? rule.except : null
            let model = resolveOnce('app.models.' + model_name)
            let data = null
            if (exception) {
                data = await model.findOne({ [field_name]: rule.target, [exception]: { $ne : rule.resolved } })
            } else {
                data = await model.findOne({ [field_name]: rule.target })
            }
            if (data) {
                this.errors.push('Field {' + rule.source + '} must be a unique value.')
                return true
            }
        }
        return false
    }

    async exists(rule) {
        if (rule.name == 'exists' && rule.target != null) {
            // console.log(rule)
            let model_name = rule.type.split('.')[0]
            let field_name = rule.type.split('.')[1]
            let model = resolveOnce('app.models.' + model_name)
            let data = await model.findOne({ [field_name]: rule.target })
            if (!data) {
                if(rule.message) {
                    this.errors.push(rule.message)
                    return true
                }
                this.errors.push('Field {' + rule.source + '} must be a unique value.')
                return true
            }
        }
        return false
    }

    validateFormat(values, target) {
        // console.log(values)
        let index = 0
        let status = true
        let format = ''
        values = this.resolveExpressions(values)
        // console.log(values)
        for (let i = 0; i < values.length; i++) {
            // console.log('value: ', values[i], ' & target: ', target[index], ' == ', typeof target[index] !== 'number')
            if (values[i] == '%d') { // digit
                if (typeof parseInt(target[index]) !== 'number') status = false
                index++
                format += '0'
            } else if (values[i] == '%c') { // character
                if (typeof target[index] !== 'string') status = false
                index++
                format += 'a'
            } else {
                if (target[index] != values[i]) status = false
                index++
                format += values[i]
            }
        }
        return { status: status, format: format }
    }

    resolveExpressions(values) {
        let new_values = []
        for (let i = 0; i < values.length; i++) {
            if (values[i][0] == '=') { // expression
                let target = values[i][1] + values[i][2]
                let exp = values[i]
                exp = exp.replace('=', '')
                exp = exp.replace(target, '1')
                let result = eval(exp)
                for (let j = 0; j < result; j++) {
                    new_values.push(target)
                }
            } else {
                new_values.push(values[i])
            }
        }
        return new_values
    }

}