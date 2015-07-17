var EventEmitter = require('events').EventEmitter
var assign       = require('object.assign')
var address      = require('network-address')
var Swim         = require('swim')
var mcpeer       = require('multicast-dns-peer')
var nano         = require('nanomsg')

var defaultOpts = {
    autojoin   : true,
    port       : 11000,
    address    : address(),
    busport    : 11010,
    busaddress : address()
}

var yolog = {
    join : function() {
        join(this.opts, function(err, swim) {
            if (err) throw err
            this.emit('ready')
            this.swim = swim
        }.bind(this))
    },
    members : function() {
        return this.swim.members()
    },
    leave : function() {
        if (this.swim) this.swim.leave()
        delete this.swim
    },
    destroy : function() {
        this.leave()
    }
}

var producer = function(log, opts) {
    if (!(this instanceof producer)) return new producer(log, opts)
    this.opts = assign(defaultOpts, opts || {}, { log:log, type:'producer' }) 
    if (this.opts.autojoin) this.join()
}
producer.prototype = assign({}, yolog, EventEmitter.prototype)

var store = function(log, opts) {
    if (!(this instanceof store)) return new store(log, opts)
    this.opts = assign(defaultOpts, opts || {}, { log:log, type:'store' })
    if (this.opts.autojoin) this.join()
}
store.prototype = assign({}, yolog, EventEmitter.prototype)

var projector = function(log, opts) {
    if (!(this instanceof projector)) return new projector(log, opts)
    this.opts = assign(defaultOpts, opts || {}, { log:log, type:'projector' }) 
    if (this.opts.autojoin) this.join()
}
projector.prototype = assign({}, yolog, EventEmitter.prototype)

function join(opts, fn) {
    var peers = []
    var swim = gossip(opts) 
    var mc = multicast(opts)
    mc.on('peer', function(peer) {
        peers = peers.concat(peer.filter(function(p) { return p.type == 'SRV' }))
        if (peers.length <= 2) return
        var addrs = peers.map(function(srv) {
            return srv.data.target+':'+srv.data.port
        })
        mc.destroy()
        swim.bootstrap(addrs, function(err) {
            fn(err, swim)
        })
    })
}

function multicast(opts) {
    return mcpeer(opts.log, {
        answers : [
            { 
                name:'yolog', 
                type:'SRV', 
                data: { 
                    port:opts.port, 
                    target:opts.address 
                }
            }
        ]
    })
}

function gossip(opts) {
    return new Swim({
        local : {
            host : opts.address+':'+opts.port,
            meta : {
                bus : 'kolumbus'
            } 
        }
    })
}

//    checkBusMembers : function() {
//        // Add new members
//        this.swim.members().forEach(function(mem) {
//            var membus = mem.meta.bus
//            if (Object.keys(this.subs).indexOf(membus) >= 0) return
//            var sub = nano.socket('sub')
//            sub.connect(membus)
//            sub.on('message', function(msg) {
//                this.emit('log', msg)
//            }.bind(this))
//            this.subs[membus] = sub
//        }.bind(this))
//        // TODO: Remove dead/suspect members
//    }

module.exports = {
    producer  : producer,
    store     : store,
    projector : projector
} 
