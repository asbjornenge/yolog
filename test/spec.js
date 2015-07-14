var assert = require('assert')
var yolog  = require('../index')

describe('yolog', function() {

    var log1 = yolog('yolog', {
        port : 11000, // default
        bus  : 'ipc:///tmp/yolog1.ipc'
    })
    var log2 = yolog('yolog', {
        port : 11001,
        bus  : 'ipc:///tmp/yolog2.ipc'
    })
    var log3 = yolog('yolog', {
        port : 11002,
        bus  : 'ipc:///tmp/yolog3.ipc'
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

    it('will send messages to all other peers', function(done) {
        var logs = []
        var _log = 'this is the log message'
        log2.on('log', function(log) {
            assert(log.toString() == _log)
            logs.push(log)
            if (logs.length == 2) done()
        })
        log3.on('log', function(log) {
            assert(log.toString() == _log)
            logs.push(log)
            if (logs.length == 2) done()
        })
        // TODO: Figure out API
        // .ship ? .on('log' ?
        log1.bus.send(_log)
    })

})

// TODO: Should we maintain two sets of pub-subs ??
// Perhaps first push to storage ? when saved push to projectors ?

// MORE TESTS:
// it handles adding and removing peers
// it handles missing storage
// it handles missing projectors (do we care?)

// TODO: Add perf tests
