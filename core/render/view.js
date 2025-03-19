const fs = require("fs")

module.exports = class View {

    constructor(response) {
        this.debug = false
        this.response = response
    }

    async render(filename, data) {
        let me = this
        this.data = data
        filename = filename.replace('.', '/')
        let html = await fs.promises.readFile(root_directory + '/app/views/' + filename + '.html', "utf8")
        html = me.compile(html, data)
        if (me.response) return me.response.send(html)
        return html
    }

    dataHas(key) {
        return (this.data[key] !== undefined ? true : false)
    }

    dataGet(key) {
        return (this.data[key] !== undefined ? this.data[key] : null)
    }

    resolveVariables(haystack, left_needle, right_needle) {
        let step = left_needle.length
        let start = haystack.indexOf(left_needle) + step
        let end = haystack.indexOf(right_needle)
        while (start > -1 && end > -1 && end < haystack.length) {
            // push variable name
            let variable_name = haystack.substring(start, end).trim()
            let variable_value = 'NULL'
            // console.log(variable_name, this.data[variable_name])
            if (this.data[variable_name] !== undefined) {
                variable_value = this.data[variable_name]
            }
            // variable name if nested object
            let nested = variable_name.split('.')
            if (nested.length > 0) {
                // console.log(nested[0], nested[1], this.data)
                if (this.data[nested[0]][nested[1]] !== undefined) {
                    variable_value = this.data[nested[0]][nested[1]]
                }
            } else if (nested.length > 1) {
                // console.log(nested[0], nested[1], this.data)
                if (this.data[nested[0]][nested[1]][nested[2]] !== undefined) {
                    variable_value = this.data[nested[0]][nested[1]][nested[2]]
                }
            }
            // ====
            // remove from haystack
            let removable = haystack.slice(start - step, end + step)
            haystack = haystack.replace(removable, variable_value)
            // search next
            start = haystack.indexOf(left_needle) + step
            end = haystack.indexOf(right_needle)
        }
        return haystack
    }

    findBetween(haystack, left_needle, right_needle) {
        let start = haystack.indexOf(left_needle)
        let end = haystack.indexOf(right_needle, start)
        if (left_needle.length < 1 || right_needle.length < 1 || start < 0 || end < 0) return { status: false, found: '', line: '' }
        let found = haystack.substring(start + left_needle.length, end)
        let line = haystack.substring(start, end + right_needle.length)
        return { status: (found.length > 0 ? true : false), found: found, line: line }
    }

    resolveForeach(haystack) {
        let foreach_part = this.findBetween(haystack, "@foreach(", ")")
        if (this.debug) console.log('FOREACH >> ', foreach_part)
        if (!foreach_part.status) return { status: false, html: haystack }

        let all_part = this.findBetween(haystack, foreach_part.line, '@endforeach')

        let endforeach_part = this.findBetween(haystack, foreach_part.line, '@endforeach')
        if (this.debug) console.log('ENDFOREACH >> ', endforeach_part)
        if (!endforeach_part.status) return { status: false, html: haystack }


        let condition = foreach_part.found
        let temp = condition.split(' as ')
        let looped_variable = temp[0]
        let new_variable = temp[1]

        let foreach_html = endforeach_part.found

        // looping
        let new_html = ''
        if(this.data[looped_variable] !== undefined) {
            for(let key in this.data[looped_variable]) {
                this.data[new_variable] = this.data[looped_variable][key]
                new_html += this.compile(foreach_html)
            }
        }
        
        haystack = haystack.replace(all_part.line, new_html)

        return { status: true, html: haystack }
    }

    resolveForeachs(html) {
        let continue_search = true
        while (continue_search) {
            let response = this.resolveForeach(html)
            if (this.debug) console.log('SEARCH FOREACHS >> ', response.status)
            if (response.status) {
                html = response.html
            } else {
                continue_search = false
            }
        }
        return html
    }

    resolveIf(haystack) {
        let if_part = this.findBetween(haystack, "@if(", ")")
        if (this.debug) console.log('IF >> ', if_part)
        if (!if_part.status) return { status: false, html: haystack }

        let else_part = this.findBetween(haystack, if_part.line, '@else')
        if (this.debug) console.log('ELSE >> ', else_part)

        let end_part = { status: false, found: '', line: '' }
        if (this.debug) console.log('ENDIF >> ', end_part)

        let all_part = this.findBetween(haystack, if_part.line, '@endif')
        if (else_part.status) {
            end_part = this.findBetween(haystack, else_part.line, '@endif')
        } else {
            end_part = this.findBetween(haystack, if_part.line, '@endif')
        }
        if (!end_part.status) return { status: false, html: haystack }

        if (else_part.status) {
            let condition = if_part.found
            let if_html = else_part.found
            let else_html = end_part.found

            let script = ''
            for (let k in this.data) {
                script += ' var ' + k + '="' + this.data[k] + '"; '
            }
            script += '(function() {if(' + condition + ') { return true; } else { return false } }())'
            let result = eval(script)

            if (result) {
                haystack = haystack.replace(all_part.line, if_html)
            } else {
                haystack = haystack.replace(all_part.line, else_html)
            }
        } else {
            let condition = if_part.found
            let if_html = end_part.found

            let script = ''
            for (let k in this.data) {
                script += ' var ' + k + '="' + this.data[k] + '"; '
            }
            script += '(function() {if(' + condition + ') { return true; } else { return false } }())'
            let result = eval(script)

            if (result) {
                haystack = haystack.replace(all_part.line, if_html)
            } else {
                haystack = haystack.replace(all_part.line, '')
            }
        }

        return { status: true, html: haystack }
    }

    resolveIfs(html) {
        let continue_search = true
        while (continue_search) {
            let response = this.resolveIf(html)
            if (this.debug) console.log('SEARCH IFS >> ', response.status)
            if (response.status) {
                html = response.html
            } else {
                continue_search = false
            }
        }
        return html
    }

    compile(html) {     
        if(this.debug) console.log(">> COMPILING", html)   
        html = this.resolveIfs(html)
        html = this.resolveForeachs(html)
        html = this.resolveVariables(html, '{{', '}}')
        return html
    }

}