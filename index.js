var EventEmitter = require('events').EventEmitter
var assign       = require('object.assign')
var address      = require('network-address')
var Swim         = require('swim')
var mcpeer       = require('multicast-dns-peer')
var nano         = require('nanomsg')

var yolog = function(log, opts) {
    if (!(this instanceof yolog)) return new yolog(log, opts)
    this.opts = assign({
        bootstrapPeers : [],
        port           : 11000,
        address        : address(),
        busport        : 11010,
        busaddress     : address()
    }, opts || {})
    this.subs = {}

    // BUS (PUB)
    this.bus = nano.socket('pub')
    this.bus.bind(this.busaddr())

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
            meta : {
                bus : this.busaddr() 
            } 
        }
    })

    this.swim.on(Swim.EventType.Error, function(err) {
//        console.error('swim error', err)
    });
    this.swim.on(Swim.EventType.Change, function(data) {
//        console.error('swim change', data)
        this.checkBusMembers()
    }.bind(this));
    this.swim.on(Swim.EventType.Ready, function onReady() {
        this.emit('ready', this.swim.members())
        this.destroyMcPeer()
        this.checkBusMembers()
    }.bind(this));

    // errorhandling, retry, etc.
 
}

yolog.prototype = assign({
    destroy : function() {
        this.destroyMcPeer()
        this.swim.leave()
        this.bus.close()
        Object.keys(this.subs).forEach(function(membus) {
            this.subs[membus].close()
        }.bind(this))
    },
    destroyMcPeer : function() {
        try {
            this.mcpeer.destroy()
        } catch(e) {
            if (e.message == 'Not running') return
            throw e
        }
    },
    busaddr : function() {
        return this.opts.bus || ('tcp://'+this.opts.busaddress+':'+this.opts.busport)
    },
    checkBusMembers : function() {
        // Add new members
        this.swim.members().forEach(function(mem) {
            var membus = mem.meta.bus
            if (Object.keys(this.subs).indexOf(membus) >= 0) return
            var sub = nano.socket('sub')
            sub.connect(membus)
            sub.on('message', function(msg) {
                this.emit('log', msg)
            }.bind(this))
            this.subs[membus] = sub
        }.bind(this))
        // TODO: Remove dead/suspect members
    }
}, EventEmitter.prototype)

module.exports = yolog
