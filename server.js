let nano = require('nanomsg')
let assign = require('object.assign')

let server = function(opts) {
    if (!(this instanceof server)) return new server(opts)
    if (!opts) opts = {}

    this.rep = nano.socket('rep')
    this.rep.bind(opts.addr)
    this.rep.on('message', this.query.bind(this))

    this.pipe = nano.socket('pair')
    this.pipe.bind(opts.pipe)
    this.pipe.on('message', this.append.bind(this))

    this.logs = []
}
server.prototype = {
    query : function(buf) {
        let query = buf.toString()
        if (query == 'YOLOG') return this.rep.send('MEh')
        this.rep.send(this.logs[parseInt(query)])
    },
    append : function(buf) {
        let log = buf.toString()
        if (log.indexOf('YOREPLAY') == 0) return this.replay(log.substring(8))
        this.logs.push(buf.toString())
    },
    replay : function(index) {
        index = parseInt(index)
        while(index < this.logs.length) { 
            this.pipe.send(this.logs[index]);
            index++
        }
        this.pipe.send('YOEND'+this.logs.length)
    },
    close : function() {
        this.rep.close()
        this.pipe.close()
    }
}

module.exports = server
