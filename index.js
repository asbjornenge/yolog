let assign = require('object.assign')

let yolog = function(opts) {
    if (!(this instanceof yolog)) return new yolog(opts)
    if (!opts) opts = {}
    this.log = []
    this.listeners = []
}
yolog.prototype = assign(Array.prototype, {
    append : function(data) {
        this.log.push(data)
        this.listeners.forEach((l) => {
            if (l.pattern == '*') l.handler(data)
            if (data.indexOf(l.pattern) >= 0) l.handler(data)
        })
    },
    get : function(index) {
        return this.log[index]
    },
    replay : function(index, handler, end) {
        while(index < this.log.length) { handler(this.log[index]); index++ }
        end(this.log.length)
    },
    on : function(pattern, handler) {
        this.listeners.push({ handler : handler, pattern : pattern })
    }
})

module.exports = yolog
