let assert = require('assert')
let yolog  = require('..')

module.exports = (constructor, afterEachCb) => {
    describe('yolog', () => {

        afterEach((done) => {
            if (typeof afterEachCb == 'function') afterEachCb(done)
            else done()
        })

        it.only('can append data', (done) => {
            let log = constructor() 
            let data = 'some arbitrary data'
            log.append(data)
            setTimeout(() => {
                log.get(0, (_data) => {
                    assert(data == _data)
                    done()
                })
            },100)
        })

        it('can replay events', (done) => {
            let log = constructor() 
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
            let log = constructor() 
            log.on('*', (e) => {
                assert(e == 'some data')
                done()
            })
            log.append('some data')
        })
    })
}

module.exports(function() { return new yolog() })
