let nano = require('nanomsg')
let assign = require('object.assign')

let server = function(opts) {
    if (!(this instanceof server)) return new server(opts)
    if (!opts) opts = {}

    this.rep = nano.socket('rep')
    this.rep.bind(opts.addr)
    this.rep.on('message', this.query.bind(this))

    this.pipe = nano.socket('pull')
    this.pipe.bind(opts.pipe)
    this.pipe.on('message', this.append.bind(this))

    this.logs = []
}
server.prototype = {
    query : function(buf) {
        this.rep.send(this.logs[parseInt(buf.toString())])
    },
    append : function(buf) {
        this.logs.push(buf.toString())
    },
    close : function() {
        this.rep.close()
        this.pipe.close()
    }
}

module.exports = server
