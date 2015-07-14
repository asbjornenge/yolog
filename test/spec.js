let assert = require('assert')
let yolog  = require('../index')

it('can use multicast-dns to bootstrap swim', function(done) {
    this.timeout(5000)
    let log1 = yolog('yolog', {
        bus : 'ipc:///tmp/yolog1.ipc'
//        bus : 'tcp://127.0.0.1:11010'
    })
    log1.on('ready', (peers) => {
        assert(peers.length == 2)
        var ports = peers.map(function(p) {
            return p.host.split(':')[1]
        })
        assert(ports.indexOf('11001') >= 0)
        assert(ports.indexOf('11002') >= 0)   

        log1.bus.send('yolo')
        log2.bus.send('yolo2')

        setTimeout(() => {
            log1.destroy()
            log2.destroy()
            log3.destroy()
            done()
        },1000)
    })
    let log2 = yolog('yolog', {
        port    : 11001,
        bus : 'ipc:///tmp/yolog2.ipc'
//        bus : 'tcp://127.0.0.1:11011'
    })
    let log3 = yolog('yolog', {
        port    : 11002,
        bus : 'ipc:///tmp/yolog3.ipc'
//        bus : 'tcp://127.0.0.1:11012'
    })
})

//it('creates a bus and distributes events to all nodes', function(done) {

//})
