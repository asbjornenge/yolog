let assert = require('assert')
let yolog  = require('../index')
let server = require('../server')
let client = require('../client')
let spec   = require('./spec')

let reqaddr  = 'inproc://reqrep'
let pipeaddr = 'inproc://pipe'
let s,c

spec(() => {
    s = server({
        addr : reqaddr,
        pipe : pipeaddr
    })
    c = client({
        addr : reqaddr,
        pipe : pipeaddr
    })
    return c
}, (done) => {
    c.close()
    s.close()
    done()
})
