let assign = require('object.assign')

let yolog = function(opts) {
    if (!(this instanceof yolog)) return new yolog(opts)
    if (!opts) opts = {}
    this.listeners = []
}
yolog.prototype = assign(Array.prototype, {
    append : function(data) {
        this.push(data)
        this.listeners.forEach((l) => {
            if (l.pattern == '*') l.handler(data)
            if (data.indexOf(l.pattern) >= 0) l.handler(data)
        })
    },
    replay : function(index, handler, end) {
        while(index < this.length) { handler(this[index]); index++ }
        end(this.length)
    },
    on : function(pattern, handler) {
        this.listeners.push({ handler : handler, pattern : pattern })
    }
})

module.exports = yolog
