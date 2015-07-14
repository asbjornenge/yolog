let assign = require('object.assign')
let Swim   = require('swim')
let mcpeer = require('multicast-dns-peer')

let yolog = function(log, opts) {
    if (!(this instanceof yolog)) return new yolog(log, opts)
    this.opts = assign({
        bootstrapPeers : []
    }, opts || {})

    // MULTICAST - discover peers to bootstrap swim
    this.mcpeer = mcpeer(log, {
        answers : [
            { name:'yolog', type:'SRV', data: { port:11000, target:'yolog' }}
        ]
    })
    this.mcpeer.on('peer', function(peer) {
        // TODO: utilize pickPeer
        var srv = peer.filter(function(p) { return p.type == 'SRV' })
        if (srv.lenght > 0) this.opts.bootstrapPeers.push(srv)
        if (this.opts.bootstrapPeers.length > 0) {
            var addrs = this.opts.bootstrapPeers.map(function(srv) {
                return srv.data.target+':'+srv.data.port
            })
            console.log('bootstrapping swim',addrs)
            //this.swim.bootstrap(addrs)
        } 
    }.bind(this))

    // SWIM
    this.swim = new Swim({
        local : {
            host : '127.0.0.1:11000'
        }
    })

    this.swim.on(Swim.EventType.Error, function onError(err) {
        console.log('swim error', err)
    });
    this.swim.on(Swim.EventType.Ready, function onReady() {
        console.log('swim ready')
    });

    // errorhandling, retry
 
}

module.exports = yolog
