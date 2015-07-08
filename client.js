let nano = require('nanomsg')

let client = function(opts) {
    if (!(this instanceof client)) return new client(opts)
    if (!opts) opts = {}

    this.req = nano.socket('req')
    this.req.connect(opts.addr)

    this.pipe = nano.socket('push')
    this.pipe.connect(opts.pipe)

    this.listeners = []
}
client.prototype = {
    append : function(data) {
        this.pipe.send(data, function(err) {
            console.log('send err', err)
        })
        // TODO: Too optimistic !?
        this.listeners.forEach((l) => {
            if (l.pattern == '*') l.handler(data)
            if (data.indexOf(l.pattern) >= 0) l.handler(data)  
        })
    },
    get : function(index, cb) {
        this.req.on('message', function(buf) { cb(buf.toString()) })
        this.req.send(index) 
    },
    replay : function(index, handler, end) {
        while(index < this.length) { handler(this[index]); index++ }
        end(this.length)
    },
    on : function(pattern, handler) {
        this.listeners.push({ handler : handler, pattern : pattern })
    },
    close : function() {
        this.req.close()
        this.pipe.close()
    }
}

module.exports = client
