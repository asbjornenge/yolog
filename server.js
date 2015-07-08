let nano = require('nanomsg')
let assign = require('object.assign')

let server = function(opts) {
    if (!(this instanceof server)) return new server(opts)
    if (!opts) opts = {}
    this.rep = nano.socket('rep')
    this.rep.bind(opts.addr)
    this.rep.on('message', this.onMessage.bind(this))
}
server.prototype = assign(Array.prototype, {
    onMessage : function(buf) {
        let query = buf.toString()
        this.rep.send(query+' response')
    }
})
// client <-> server protocol
// server <-> server protocol <- handle in another layer?
module.exports = server
