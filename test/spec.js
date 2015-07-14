let assert = require('assert')
let yolog  = require('../index')

it('can use multicast-dns to bootstrap swim', function(done) {
    let log1 = yolog('yolog')
    log1.on('ready', (peer) => {
        var ports = peer.map(function(p) {
            return p.host.split(':')[1]
        })
        assert(ports.indexOf('11001') >= 0)
        assert(ports.indexOf('11002') >= 0)
        log1.destroy()
        log2.destroy()
        log3.destroy()
        done()
    })
    let log2 = yolog('yolog', {
        port : 11001
    })
    let log3 = yolog('yolog', {
        port : 11002
    })
})

