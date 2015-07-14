let assert = require('assert')
let yolog  = require('../index')

it('can use multicast-dns to bootstrap swim', function(done) {
    let log1 = yolog('yolog')
    log1.on('boostrap', (peer) => {
        assert(true)
        console.log(peer)
        log1.destroy()
        log2.destroy()
        log3.destroy()
        done()
    })
    let log2 = yolog('yolog', {
        port : '',
        address : 'icp:///tmp/yolog.icp'
    })
    let log3 = yolog('yolog', {
        port : 11002
    })
})
