var Relay = require("../Relay")
var Intent = require("../Intent")
var assert = require("chai").assert
require("es6-promise").polyfill()

function test(name, fn) {
  var count = fn.length
  var relays = []
  while (count) {
    relays.unshift(new Relay())
    --count
  }
  it(name, function() {
    fn.apply(null, relays)
  })
}
function async(name, fn) {
  var count = fn.length - 1
  var relays = []
  while (count) {
    relays.unshift(new Relay())
    --count
  }
  it(name, function(cb) {
    relays.push(cb)
    fn.apply(null, relays)
  })
}

describe("Relay", function() {
  test("root of self", function(relay) {
    assert.equal(relay.root, relay)
  })
  test("root of sub relay", function(relay1, relay2) {
    relay1.connect(relay2)
    assert.equal(relay2.root, relay1)
  })
  test("isConnectionAllowed() to self", function(relay) {
    assert.isFalse(relay.canConnect(relay))
  })
  test("isConnectionAllowed() to detached", function(relay1, relay2) {
    assert.isTrue(relay1.canConnect(relay2))
  })
  test("isConnectionAllowed() to connected", function(relay1, relay2) {
    relay1.connect(relay2)
    assert.isFalse(relay1.canConnect(relay2))
  })
  test("isConnectionAllowed() to relay with parent", function(relay1, relay2, relay3) {
    relay1.connect(relay2)
    assert.isFalse(relay3.canConnect(relay2))
  })
  test("root", function(relay1, relay2, relay3) {
    relay1.connect(relay2)
    assert.equal(relay2.root, relay1)
    relay2.connect(relay3)
    assert.equal(relay3.root, relay1)
  })

  describe("relaying", function() {
    describe("capture", function() {
      async("call count", function(relay1, relay2, relay3, cb) {
        relay1.connect(relay2)
        relay2.connect(relay3)

        var data = {}
        var origIntent = new Intent(data)

        relay1.receive("test", function(intent) {
          assert.equal(intent, origIntent)
          ++callCount
        })
        relay2.receive("test", function(intent) {
          assert.equal(intent, origIntent)
          ++callCount
        })
        relay3.receive("test", function(intent) {
          assert.equal(intent, origIntent)
          ++callCount
        })

        var callCount = 0
        relay1.transmit("test", origIntent)
            .then(function(intent) {
              assert.equal(intent, origIntent)
              assert.equal(callCount, 3)
              cb()
            })
      })
      async("call order", function(relay1, relay2, relay3, cb) {
        relay1.connect(relay2)
        relay2.connect(relay3)

        var data = {}
        var origIntent = new Intent(data)
        var callCount = 0

        relay1.receive("test", function(intent) {
          assert.equal(callCount, 0)
          ++callCount
        })
        relay2.receive("test", function(intent) {
          assert.equal(callCount, 1)
          ++callCount
        })
        relay3.receive("test", function(intent) {
          assert.equal(callCount, 2)
          ++callCount
        })

        relay1.transmit("test", origIntent)
            .then(function(intent) {
              assert.equal(callCount, 3)
              cb()
            })
      })
      async("call order 2", function(relay1, relay2, relay3, cb) {
        relay1.connect(relay2)
        relay1.connect(relay3)

        var data = {}
        var origIntent = new Intent(data)
        var callCount = 0

        relay1.receive("test", function(intent) {
          assert.equal(callCount, 0)
          ++callCount
        })
        relay2.receive("test", function(intent) {
          assert.equal(callCount, 1)
          ++callCount
        })
        relay3.receive("test", function(intent) {
          assert.equal(callCount, 2)
          ++callCount
        })

        relay1.transmit("test", origIntent)
            .then(function(intent) {
              assert.equal(callCount, 3)
              cb()
            })
      })
      async("call order 3", function(relay1, relay2, relay3, cb) {
        relay1.connect(relay3)
        relay1.connect(relay2)

        var data = {}
        var origIntent = new Intent(data)
        var callCount = 0

        relay1.receive("test", function(intent) {
          assert.equal(callCount, 0)
          ++callCount
        })
        relay3.receive("test", function(intent) {
          assert.equal(callCount, 1)
          ++callCount
        })
        relay2.receive("test", function(intent) {
          assert.equal(callCount, 2)
          ++callCount
        })

        relay1.transmit("test", origIntent)
            .then(function(intent) {
              assert.equal(callCount, 3)
              cb()
            })
      })
      async("interrupt", function(relay1, relay2, relay3, cb) {
        relay1.connect(relay2)
        relay2.connect(relay3)

        var data = {}
        var origIntent = new Intent(data)
        var callCount = 0

        relay1.receive("test", function(intent) {
          assert.equal(callCount, 0)
          ++callCount
        })
        relay2.receive("test", function(intent) {
          intent.interrupt()
          assert.equal(callCount, 1)
          ++callCount
        })
        relay3.receive("test", function(intent) {
          // this won't/shouldn't get called
          assert.equal(callCount, NaN)
          ++callCount
        })

        relay1.transmit("test", origIntent).then(function(intent) {
          assert.equal(callCount, 2)
          cb()
        })
      })
      async("interrupt", function(relay1, relay2, relay3, cb) {
        relay1.connect(relay2)
        relay2.connect(relay3)

        var data = {}
        var origIntent = new Intent(data)
        var callCount = 0

        relay1.receive("test", function(intent) {
          assert.equal(callCount, 0)
          ++callCount
        })
        relay2.receive("test", function(intent) {
          assert.equal(callCount, 1)
          ++callCount
          throw new Error("message")
        })
        relay3.receive("test", function(intent) {
          // this won't/shouldn't get called
          assert.equal(callCount, NaN)
          ++callCount
        })

        relay1.transmit("test", origIntent)
            .then(function(intent) {
              // this won't/shouldn't get called
              assert.equal(callCount, NaN)
              ++callCount
            })
            .catch(function(err) {
              assert.instanceOf(err, Error)
              assert.equal(err.message, "message")
              assert.equal(callCount, 2)
              cb()
            })
      })
    })

    describe("bubble", function() {
      async("call count", function(relay1, relay2, relay3, cb) {
        relay1.connect(relay2)
        relay2.connect(relay3)

        var data = {}
        var origIntent = new Intent(data)
        origIntent.direction = "bubble"

        relay1.receive("test", function(intent) {
          assert.equal(intent, origIntent)
          ++callCount
        })
        relay2.receive("test", function(intent) {
          assert.equal(intent, origIntent)
          ++callCount
        })
        relay3.receive("test", function(intent) {
          assert.equal(intent, origIntent)
          ++callCount
        })

        var callCount = 0
        relay3.transmit("test", origIntent)
            .then(function(intent) {
              assert.equal(intent, origIntent)
              assert.equal(callCount, 3)
              cb()
            })
      })
      async("call order", function(relay1, relay2, relay3, cb) {
        relay1.connect(relay2)
        relay2.connect(relay3)

        var data = {}
        var origIntent = new Intent(data)
        origIntent.direction = "bubble"
        var callCount = 0

        relay3.receive("test", function(intent) {
          assert.equal(callCount, 0)
          ++callCount
        })
        relay2.receive("test", function(intent) {
          assert.equal(callCount, 1)
          ++callCount
        })
        relay1.receive("test", function(intent) {
          assert.equal(callCount, 2)
          ++callCount
        })

        relay3.transmit("test", origIntent)
            .then(function(intent) {
              assert.equal(callCount, 3)
              cb()
            })
      })
      async("call order 2", function(relay1, relay2, relay3, cb) {
        relay1.connect(relay2)
        relay1.connect(relay3)

        var data = {}
        var origIntent = new Intent(data)
        origIntent.direction = "bubble"
        var callCount = 0

        relay3.receive("test", function(intent) {
          assert.equal(callCount, 0)
          ++callCount
        })
        relay2.receive("test", function(intent) {
          // it's not in the parent chain, so it won't/shouldn't be called
          assert.equal(callCount, NaN)
          ++callCount
        })
        relay1.receive("test", function(intent) {
          assert.equal(callCount, 1)
          ++callCount
        })

        relay3.transmit("test", origIntent)
            .then(function(intent) {
              assert.equal(callCount, 2)
              cb()
            })
      })
      async("interrupt", function(relay1, relay2, relay3, cb) {
        relay1.connect(relay2)
        relay2.connect(relay3)

        var data = {}
        var origIntent = new Intent(data)
        origIntent.direction = "bubble"
        var callCount = 0

        relay3.receive("test", function(intent) {
          assert.equal(callCount, 0)
          ++callCount
        })
        relay2.receive("test", function(intent) {
          intent.interrupt()
          assert.equal(callCount, 1)
          ++callCount
        })
        relay1.receive("test", function(intent) {
          // this won't/shouldn't get called
          assert.equal(callCount, NaN)
          ++callCount
        })

        relay3.transmit("test", origIntent)
            .then(function(intent) {
              assert.equal(callCount, 2)
              cb()
            })
      })
      async("error", function(relay1, relay2, relay3, cb) {
        relay1.connect(relay2)
        relay2.connect(relay3)

        var data = {}
        var origIntent = new Intent(data)
        origIntent.direction = "bubble"
        var callCount = 0

        relay3.receive("test", function(intent) {
          assert.equal(callCount, 0)
          ++callCount
        })
        relay2.receive("test", function(intent) {
          assert.equal(callCount, 1)
          ++callCount
          throw new Error("message")
        })
        relay1.receive("test", function(intent) {
          // this won't/shouldn't get called
          assert.equal(callCount, NaN)
          ++callCount
        })

        relay3.transmit("test", origIntent)
            .then(function(intent) {
              ++callCount
              // this won't/shouldn't get called
            })
            .catch(function(err) {
              assert.instanceOf(err, Error)
              assert.equal(err.message, "message")
              assert.equal(callCount, 2)
              cb()
            })
      })
    })
  })


})
