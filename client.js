let nano = require('nanomsg')

let client = function(opts) {
    if (!(this instanceof client)) return new client(opts)
    if (!opts) opts = {}
    this.req = nano.socket('req')
    this.req.connect(opts.addr)
    this.listeners = []
}
client.prototype = {
    append : function(data) {
        this.req.send(data)
        // TODO: Too optimistic !?
        this.listeners.forEach((l) => {
            if (l.pattern == '*') l.handler(data)
            if (data.indexOf(l.pattern) >= 0) l.handler(data)  
        })
    },
    get : function() {
    
    },
    replay : function(index, handler, end) {
        while(index < this.length) { handler(this[index]); index++ }
        end(this.length)
    },
    on : function(pattern, handler) {
        this.listeners.push({ handler : handler, pattern : pattern })
    }
}

module.exports = client
