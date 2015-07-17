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
    pubPort    : 11010,
    pubAddress : address()
}

var yolog = {
    join : function(fn) {
        join(this.opts, function(err, swim) {
            if (err) throw err
            this.emit('ready')
            this.swim = swim
            if (typeof fn === 'function') fn()
        }.bind(this))
    },
    members : function() {
        return this.swim.members()
    },
    leave : function() {
        if (this.swim) this.swim.leave()
        delete this.swim
        this._leave && this._leave()
    },
    destroy : function() {
        this.leave()
    }
}

var producer = function(log, opts) {
    if (!(this instanceof producer)) return new producer(log, opts)
    this.opts = assign(defaultOpts, opts || {}, { log:log, type:'producer' }) 
    this.logs = []
    this.pub  = nano.socket('pub')
    this.pub.bind(pubaddr(this.opts))
    if (this.opts.autojoin) this.join(this.init.bind(this))
}
producer.prototype = assign({
    init : function() {
        this.swim.on('error', function(err) { console.error('swim error', err) })
    },
    append : function(data) {
        this.logs.push(data)
    },
    _leave : function() {
        // TODO: This throws is no connection - why?
        this.pub.close()
    }
}, yolog, EventEmitter.prototype)

var store = function(log, opts) {
    if (!(this instanceof store)) return new store(log, opts)
    this.opts = assign(defaultOpts, opts || {}, { log:log, type:'store' })
    this.subs = {}
    if (this.opts.autojoin) this.join(this.init.bind(this))
}
store.prototype = assign({
    init : function() {
        this.swim.on('change', this.checkProducers.bind(this))
        this.swim.on('update', this.checkProducers.bind(this))
        this.swim.on('error', function(err) { console.error('swim error', err) })
        this.checkProducers()
    },
    checkProducers : function() {
        manageProducers(this, this.swim.members())
    },
    _leave : function() {
        Object.keys(this.subs).forEach(function(pubaddr) {
            this.subs[pubaddr].close()
        }.bind(this))
        this.subs = {}
    } 
}, yolog, EventEmitter.prototype)

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
            meta : typemeta(opts) 
        }
    })
}

function typemeta(opts) {
    switch(opts.type) {
        case 'producer':
            return {
                type : 'producer',
                pub  : pubaddr(opts) 
            }
        case 'store':
            return {
                type : 'store'
            }
        case 'projector':
            return {
                type : 'projector'
            }
        default:
            return {
                type : 'virus'
            }
    }
}

function pubaddr(opts) {
    return opts.produceraddr || 'tcp://'+opts.pubAddress + ':' + opts.pubPort
}

function manageProducers(yolog, members) {
    // Add any new members
    var producers = members.filter(function(member) {
        return member.meta.type == 'producer'
    })

    producers 
        .filter(function(producer) {
            return Object.keys(yolog.subs).indexOf(producer.meta.pub) < 0 
        })
        .forEach(function(producer) {
            var pub = producer.meta.pub
            var sub = nano.socket('sub')
            sub.connect(pub)
            yolog.subs[pub] = sub
        })

    // Disconnect lost members 

//    var pubaddrs = members.
//    Object.keys(this.subs)
//        .filter(function(pubaddr) {
//            return 
//        })
//        .filter(function(producer) {
//            return Object.keys(producers).indexOf(producer.meta.pub) < 0 
//        })
        
}

module.exports = {
    producer  : producer,
    store     : store,
    projector : projector
} 
