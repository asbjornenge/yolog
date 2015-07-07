let assert = require('assert')
let server = require('../server')
let client = require('../client')

it('can communicate', function(done) {
    let opts = {
        addr : 'ipc:///tmp/reqrep.ipc'
    }
    let s = server(opts)
    let c = client(opts)
    c.on('message', function(buf) {
        assert(buf.toString() == 'yolo response')
        s.rep.close()
        c.req.close()
        done()
    })
    c.req.send('yolo')
})
