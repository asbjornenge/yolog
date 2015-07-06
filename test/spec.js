let assert = require('assert')
let yolog  = require('yolog')

it('can append data', () => {
    let log = new yolog()
    let data = 'some arbitrary data'
    log.append(data)
    assert(data == log[0])
})

it('can replay events' (done) => {
    let log = new yolog()
    log.append('event1')
    log.append('event2')
    let _events = []
    log.replay(0, (e) => {
        _events.push(e)
    }, (err) => {
        assert(_events.length == 2)
        done()
    })
})

it('emits events', (done) => {
    let log = new yolog()
    log.on('*', (e) => {
        assert(e == 'some data')
        done()
    })
    log.append('some data')
})
