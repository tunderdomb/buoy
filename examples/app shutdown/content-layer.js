var Relay = require("buoy")

var relay = module.exports = new Relay()

relay.intent("exit", function(intent) {
  if (!intent.interrupted) {
    return new Promise(function(/*resolve, reject*/) {
      // do some async stuff
    })
  }
})
