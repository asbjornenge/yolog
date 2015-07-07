let nano = require('nanomsg')

let client = function(opts) {
    if (!(this instanceof client)) return new client(opts)
    if (!opts) opts = {}
    this.req = nano.socket('req')
    this.req.connect(opts.addr)
}
client.prototype = {
    on : function(e, handler) {
        this.req.on(e, handler)
    }
}

module.exports = client
