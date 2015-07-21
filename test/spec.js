var assert  = require('assert')
var Swim    = require('swim')
var resumer = require('resumer')
var yolog   = require('../index')

function createStream(str) {
    var stream = resumer()
    stream.queue(str)
    return stream
}

describe('yolog basics', function() {

    var log = yolog('mylog')

    it('one can pipe/stream data into yolog', function() {
        var s = createStream('yolo\n')
        s.pipe(log)
        assert(true)
    })

//    it('returns observables', function(done) {
//        var s = createStream('yolo\n')
//        s.pipe(log)
//        log.stream
//            .forEach(function(buf) {
//                console.log(buf.toString())
//                done()
//            })
//    })
    // it can detect new members

})

// MORE TESTS:
// it handles adding and removing peers
// it handles missing storage
// it handles missing projectors (do we care?)

// TODO: 
// Add perf tests
