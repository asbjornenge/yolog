let assert = require('assert')
let yolog  = require('../index')
let server = require('../server')
let client = require('../client')
let spec   = require('./spec')

spec(() => {
    let addr = 'ipc:///tmp/yolog.ipc'
    let srv  = server({
        addr : addr
    })
    return new client({
        addr : addr
    })
})

//it.ignore('can communicate', function(done) {
//    let opts = {
//        addr : 'ipc:///tmp/reqrep.ipc'
//    }
//    let s = server(opts)
//    let c = client(opts)
//
//    c.replay
//
//    c.on('message', function(buf) {
//        assert(buf.toString() == 'yolo response')
//        s.rep.close()
//        c.req.close()
//        done()
//    })
//    c.req.send('yolo')
//})
