# yolog

Yolog is a complete message layer for performing distributed append-only logging.

It is what the enterprise likes to call [event sourcing](http://martinfowler.com/eaaDev/EventSourcing.html) and other like to call a [distributed commit log](http://kafka.apache.org/).

If you are curios about the concept please read [this](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying) article.

## Introduction

Yolog has 3 modes. It can act as a log **producer**, a log **store** or a **projector**. Logs flow throught the system from producer -> store -> projector.

### Producer

A producer is responsible for collecting logs and shipping them to stores. 

Calling `.append` on a yolog instance turns it into a producer.

### Store

A store is responsible for persisting the logs, and forwarding persisted logs to projectors.

Calling `.store` on a yolog instance turns it into a store.

### Projector

The projector is responsible for building indexes / databases / views or whatever you want to use to present the current state to your applications.

Calling `.project` on a yolog instance turns it into a projector.

## Install

```
npm install --save yolog
```

## Use

```js
var yolog = require('yolog')

// yolog need at least 3 nodes to get started
var log1  = yolog('mylogcluster')
var log2  = yolog('mylogcluster')
var log3  = yolog('mylogcluster')

log3.project('log', function(log) {
    console.log(log) // => yolo
})

log2.store('log', function(log) {
    console.log(log) // => yolo
})

log1.on('ready', function() {
    log1.append('yolo')
})

```

## Options

very much opts
