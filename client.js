let nano = require('nanomsg')

let client = function(opts) {
    if (!(this instanceof client)) return new client(opts)
    if (!opts) opts = {}
    this.opts = opts

    this.pipe = nano.socket('pair')
    this.pipe.connect(opts.pipe)
    this.pipe.on('message', this.onpipe.bind(this))

    this.listeners = []
}
client.prototype = {
    onpipe : function(buf) {
        if (this.onpipeHandler) this.onpipeHandler(buf)
    },
    append : function(data) {
        this.pipe.send(data)
        this.listeners.forEach((l) => {
            if (l.pattern == '*') l.handler(data)
            if (data.indexOf(l.pattern) >= 0) l.handler(data)  
        })
        // TODO: ^ Too optimistic (and only local)! Needs to set up a pubsub with
        // server(s) instead!
    },
    get : function(index, cb) {
        let req = nano.socket('req')
        req.connect(this.opts.addr)
        req.on('message', function(buf) { 
            cb(buf.toString()) 
            req.close()
        })
        req.send(index)
    },
    replay : function(index, handler, end) {
        this.onpipeHandler = function(buf) { 
            let log = buf.toString()
            if (log.indexOf('YOEND') == 0) {
                this.onpipeHandler = null
                return end(log.substring(5))
            }
            handler(log) 
        }
        this.pipe.send('YOREPLAY'+index)
    },
    on : function(pattern, handler) {
        this.listeners.push({ handler : handler, pattern : pattern })
    },
    close : function() {
        this.pipe.close()
    }
}

module.exports = client
