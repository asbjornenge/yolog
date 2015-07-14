let EventEmitter = require('events').EventEmitter
let assign       = require('object.assign')
let address      = require('network-address')
let Swim         = require('swim')
let mcpeer       = require('multicast-dns-peer')

let yolog = function(log, opts) {
    if (!(this instanceof yolog)) return new yolog(log, opts)
    this.opts = assign({
        bootstrapPeers : [],
        port           : 11000,
        address        : address()
    }, opts || {})

    // MULTICAST - discover peers to bootstrap swim
    this.mcpeer = mcpeer(log, {
        answers : [
            { 
                name:'yolog', 
                type:'SRV', 
                data: { 
                    port:this.opts.port, 
                    target:this.opts.address 
                }
            }
        ]
    })
    this.mcpeer.on('peer', function(peer) {
        // TODO: utilize pickPeer
        var srv = peer.filter(function(p) { return p.type == 'SRV' })
        if (srv.length > 0) 
            this.opts.bootstrapPeers = this.opts.bootstrapPeers.concat(srv)
        if (this.opts.bootstrapPeers.length > 1) {
            var addrs = this.opts.bootstrapPeers.map(function(srv) {
                return srv.data.target+':'+srv.data.port
            })
            this.emit('boostrap', addrs)
            this.swim.bootstrap(addrs)
        } 
    }.bind(this))

    // SWIM
    this.swim = new Swim({
        local : {
            host : this.opts.address+':'+this.opts.port,
            meta : {} 
        }
    })

    this.swim.on(Swim.EventType.Error, function(err) {
        console.error('swim error', err)
    });
    this.swim.on(Swim.EventType.Change, function(data) {
        console.error('swim change', data)
    });
    this.swim.on(Swim.EventType.Ready, function onReady() {
        this.emit('ready', this.swim.members())
        this.destroyMcPeer()
    }.bind(this));

    // errorhandling, retry
 
}

yolog.prototype = assign({
    destroy : function() {
        this.swim.leave()
        this.destroyMcPeer()
    },
    destroyMcPeer : function() {
        try {
            this.mcpeer.destroy()
        } catch(e) {
            if (e.message == 'Not running') return
            throw e
        }
    }
}, EventEmitter.prototype)

module.exports = yolog
