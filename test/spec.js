var assert = require('assert')
var Swim   = require('swim')
var yolog  = require('../index')

describe('yolog', function() {

    var log1 = yolog.producer('yolog', {
        port    : 11000, // default
        pubPort : 11010  // default
    })
    var log2 = yolog.store('yolog', {
        port    : 11001,
        pubPort : 11011
    })
    var log3 = yolog.projector('yolog', {
        port : 11002
    })

    before(function(done) {
        log1.on('ready', done)
    })

    after(function() {
        log1.destroy()
        log2.destroy()
        log3.destroy()
    })

    it('can use multicast-dns to bootstrap swim', function(done) {
        var peers = log1.members()
        assert(peers.length == 2)
        var ports = peers.map(function(p) {
            return p.host.split(':')[1]
        })
        assert(ports.indexOf('11001') >= 0)
        assert(ports.indexOf('11002') >= 0)   
        done()
    })

    it('has proper message flow producer -> store -> projector', function(done) {
        var msg = 'some stringified data'
        log1.append(msg)
        log2.on('log', function(log) {
            assert(log.toString() == msg)
            // perform actual storage here
            log2.forward(log.toString()+' stored')
        })
        log3.on('log', function(log) {
            assert(log.toString() == msg+' stored')
            done()
        })
    })

    // it can detect new members

})

// MORE TESTS:
// it handles adding and removing peers
// it handles missing storage
// it handles missing projectors (do we care?)

// TODO: 
// Add perf tests
