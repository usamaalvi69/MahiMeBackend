/**
 * @class Validator
 * @description handle validation of request and filters
 */
module.exports = class Validator {

    constructor(res) {
        this.res = res
        this.errors = []
    }

    // async defineFilter(name, callback) {
    //     if (this.custom_filters === undefined) this.custom_filters = []
    //     this.custom_filters.push({name: name, callback: callback})
    // }

    async define(name, format, callback) {
        // array
        // name=array
        // format=:{rule}>{rule}
        //---
        // exists:UserModel.email
        // name=exists, format=:{model}.{field}
        let tokens = []
        let token = ''
        for (let i = 0; i < format.length; i++) {            
            if (format[i] == '{') {
                tokens.push({ type: 'keyword', token: token })
                token = ''
            } else if (format[i] == '}') {
                tokens.push({ type: 'variable', token: token })
                token = ''
            } else if (format[i] == '[') {
                tokens.push({ type: 'keyword', token: token })
                token = ''
            } else if (format[i] == ']') {
                tokens.push({ type: 'array', token: token })
                token = ''
            } else {
                token += format[i]
            }
        }
        if (token.length > 0) {
            tokens.push({ type: 'keyword', token: token })
            token = ''
        }
        let custom_rules = []
        let i = 0
        while (i < tokens.length) {
            if (tokens[i].type == 'keyword' && tokens[i + 2] !== undefined && tokens[i + 2].type == 'keyword') {
                custom_rules.push({ start: tokens[i], end: tokens[i + 2], target: tokens[i + 1] })
                i += 2
            } else if (tokens[i].type == 'keyword' && tokens[i + 2] === undefined) {
                custom_rules.push({ start: tokens[i], end: null, target: tokens[i + 1] })
                i += 1
            } else {
                i++
            }
        }
        if (this.custom_validations === undefined) this.custom_validations = []
        this.custom_validations.push({name: name, tokens: tokens, rules: custom_rules, callback: callback})
    }       

    /**
     * @method validate
     * @param schema jsonObject
     * @returns {array} errors
     */
    async validate(schema, messages) {
        messages = (messages === undefined ? [] : messages)

        let validation_class = resolve('core.http.validations', this.res)
        let errors = []

        // Generating fields
        let fields = validation_class.generateFields(schema, messages, this.res)

        // Generating rules
        let rules = validation_class.generateRules(fields)

        // Applying rules
        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i]
            // console.log(rule)

            validation_class.required(rule)
            validation_class.same(rule, rules)
            validation_class.string(rule)
            validation_class.number(rule)
            validation_class.min(rule)
            validation_class.max(rule)
            validation_class.email(rule)
            validation_class.format(rule)
            validation_class.enum(rule)
            validation_class.mongoId(rule)
            validation_class.file(rule)
            await validation_class.unique(rule)
            await validation_class.exists(rule)            
            
            if (rule.name == 'array' && rule.target) {
                
                await validation_class.parseArrayRules(rule, async (rule) => {
                    validation_class.required(rule)
                    validation_class.string(rule)
                    validation_class.number(rule)
                    validation_class.email(rule)
                    validation_class.format(rule)
                    validation_class.enum(rule)
                    validation_class.mongoId(rule)
                    validation_class.file(rule)
                })
                
            }

            errors = validation_class.collectErrors()
        } 

        // Applying custom validations
        await validation_class.customValidate(fields, this.custom_validations)

        console.log(errors)
        return errors
    }

    async filter(schema) {
        let validation_class = resolve('core.http.validations', this.res)
        
        // Generating fields
        let fields = validation_class.generateFields(schema, this.res)

        // console.log(fields)
        let rules = validation_class.generateRules(fields)

        // console.log(rules)        

        // Applying rules
        let find_data = {}
        let projection_data = ''
        let query_data = {}

        if(this.res.req.query['projection']) {
            let items = this.res.req.query['projection'].split(',')
            let itemSet = items.join(' ')
            projection_data = itemSet
        }

        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i]

            if(rule.name == 'projection') {
                // console.log('PROJECTION: ', rule)
                projection_data += ' ' + rule.source
            }
            if(rule.name == 'likes') {
                // console.log('LIKES: ', rule)
                let value = rule.target ? rule.target : ''
                if(value) {
                    if(find_data['$or'] === undefined) find_data['$or'] = []
                    for (let i = 0; i < rule.values.length; i++) {
                        find_data['$or'].push({[rule.values[i]]: new RegExp( value + '.*', 'i') })
                    }
                }
            }
            if(rule.name == 'like') {
                // console.log('LIKE: ', rule)
                let value = rule.target ? rule.target : ''
                if(value !='') if(find_data['$or'] === undefined) find_data['$or'] = []
                if(value !='') find_data['$or'].push({[rule.source]: new RegExp(value + '.*', 'i') })
            }
            if(rule.name == 'match') {
                // console.log('MATCH: ', rule)
                if(rule.type == 'exact') {
                    find_data[rule.source] = rule.target
                }else if(rule.type == 'if') {
                    if(rule.target) {
                        find_data[rule.source] = rule.target
                    }
                }
            }
            if(rule.name == 'skip') {
                // console.log('SKIP: ', rule)
                query_data['skip'] = parseInt(rule.target) || parseInt(rule.type)
            }
            if(rule.name == 'limit') {
                // console.log('LIMIT: ', rule)
                query_data['limit'] = parseInt(rule.target) || parseInt(rule.type)
            }
            if(rule.name == 'sort') {
                // console.log('SORT: ', rule)
                let field = rule.target ? rule.target : rule.type
                query_data['sort'] = {[field]: 1 }
            }
            if(rule.name == 'order') {
                // console.log('ORDER: ', rule)
                let order = rule.target ? rule.target : rule.type
                for(let key in query_data['sort']) {
                    query_data['sort'][key] = order
                }
            }
        }

        // Collecting data
        let data = { projection: projection_data, find: find_data, query: query_data }

        // Applying custom filters
        data = await validation_class.customFilter(fields, data, this.custom_validations)

        // console.log({ projection: projection_data, find: find_data, query: query_data })
        // console.log(find_data)

        return data
    }

}