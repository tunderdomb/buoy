var Relay = require("buoy")
var contentLayer = require("./content-layer")
var menuComponent = require("./menu-component")

var relay = module.exports = new Relay()

relay.connect(contentLayer)
relay.connect(menuComponent)

relay.intent("exit", function(intent) {
  if (!intent.interrupted) {
    // handle exit intent
  }
})
