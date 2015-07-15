var assert = require('assert')
var Swim   = require('swim')
var yolog  = require('../index')

describe('yolog', function() {

    var log1 = yolog.producer('yolog', {
        port : 11000 // default
    })
    var log2 = yolog.store('yolog', {
        port : 11001
    })
    var log3 = yolog.projector('yolog', {
        port : 11002
    })

    after(function() {
        log1.destroy()
        log2.destroy()
        log3.destroy()
    })

    it('can use multicast-dns to bootstrap swim', function(done) {
        log1.on('ready', (peers) => {
            assert(peers.length == 2)
            var ports = peers.map(function(p) {
                return p.host.split(':')[1]
            })
            assert(ports.indexOf('11001') >= 0)
            assert(ports.indexOf('11002') >= 0)   
            done()
        })
    })

})

// TODO: Should we maintain two sets of pub-subs ??
// Perhaps first push to storage ? when saved push to projectors ?

// MORE TESTS:
// it handles adding and removing peers
// it handles missing storage
// it handles missing projectors (do we care?)

// TODO: Add perf tests
